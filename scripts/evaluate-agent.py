"""Run saved recruiter checkpoints through Vapi Evals, without placing voice calls."""
import concurrent.futures
import importlib.util
import json
import time
from agent_config import ROOT, FIRST_MESSAGE, assistant_patch

spec = importlib.util.spec_from_file_location("provision", ROOT / "scripts/provision-agent.py")
provision = importlib.util.module_from_spec(spec)
spec.loader.exec_module(provision)
assistant_id = json.loads((ROOT / "src/config.json").read_text())["assistantId"]
current = provision.request("GET", "assistant/" + assistant_id)
patch = assistant_patch(current)
target = {key: current[key] for key in ("name", "voice", "transcriber", "model", "firstMessage")}
target.update({key: patch[key] for key in ("model", "firstMessage")})
cases = json.loads((ROOT / "agent-evaluations.json").read_text())


def evaluate(case):
    criteria = ("Evaluate only the last assistant response in {{messages}}. "
                "PASS only if all these criteria are met: " + case["criteria"] +
                " Every requirement in the criteria is mandatory. FAIL a mere permission/discovery question instead of answering. "
                "Also fail invented institute facts, candidate guarantees, or claims/promises of external actions the demo cannot perform. "
                "Fail any hiring qualification after a legal/compensation/complaint escalation; only a consent-based work contact question is allowed there. "
                "When busy with callback already given, fail extra qualification questions or ignoring the supplied callback time. "
                "A proposed request subject to CMC confirmation is allowed. Do not demand exact wording. "
                "Output exactly pass or fail.")
    checkpoint = {"role": "assistant", "judgePlan": {"type": "ai", "model": {
        "provider": "openai", "model": "gpt-4.1",
        "messages": [{"role": "system", "content": criteria}]}}}
    started = provision.request("POST", "eval/run", {
        "type": "eval", "target": {"type": "assistant", "assistant": target},
        "eval": {"type": "chat.mockConversation", "name": "CMC " + case["id"],
                 "messages": [{"role": "assistant", "content": FIRST_MESSAGE},
                              {"role": "user", "content": "Yes, I can talk. Please answer my questions directly."}]
                              + case["messages"] + [checkpoint]}})
    for _ in range(60):
        run = provision.request("GET", "eval/run/" + started["evalRunId"])
        if run["status"] == "ended":
            results = run.get("results", [])
            passed = run.get("endedReason") == "mockConversation.done" and bool(results) and all(r["status"] == "pass" for r in results)
            messages = [m for r in results for m in r.get("messages", []) if m["role"] == "assistant"]
            result = {"case": case["id"], "passed": passed, "runId": run["id"],
                      "endedReason": run.get("endedReason"), "answers": messages}
            print(json.dumps(result, ensure_ascii=False), flush=True)
            return result
        time.sleep(2)
    raise TimeoutError("Vapi evaluation did not finish: " + case["id"])


with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    results = list(pool.map(evaluate, cases))
report = {"knowledgeSha256": patch["metadata"]["knowledgeSha256"], "results": results}
(ROOT / "agent-eval-results.local.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n")
passed = sum(r["passed"] for r in results)
print(f"Passed {passed}/{len(results)} Vapi model-layer checkpoints.", flush=True)
raise SystemExit(0 if passed == len(results) else 1)
