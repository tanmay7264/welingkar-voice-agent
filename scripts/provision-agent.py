"""Create this demo's Vapi assistant and a restricted browser key. No private key is copied."""
import json
import subprocess
from pathlib import Path
import yaml
from agent_config import assistant_patch

ROOT = Path(__file__).resolve().parents[1]
config = yaml.safe_load((Path.home() / ".vapi-cli.yaml").read_text())
private_key = config["accounts"][config["active_account"]]["apikey"]

def request(method, endpoint, body=None):
    curl_config = 'header = "Authorization: Bearer ' + private_key + '"\n'
    args = ["curl", "--connect-timeout", "10", "--max-time", "45", "-sS", "--fail-with-body", "--config", "-", "-X", method, "https://api.vapi.ai/" + endpoint]
    if body is not None:
        args += ["-H", "Content-Type: application/json", "--data-binary", json.dumps(body)]
    result = subprocess.run(args, input=curl_config, capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError("Vapi request failed: " + result.stdout[:2000] + result.stderr[:300])
    return json.loads(result.stdout)

if __name__ == "__main__":
    identity_file = ROOT / "assistant.json"
    if identity_file.exists():
        assistant = request("GET", "assistant/" + json.loads(identity_file.read_text())["id"])
    else:
        assistant = request("POST", "assistant", {
            "name": "Campus Connect — Placement Outreach Demo",
            "voice": {"provider": "vapi", "voiceId": "Naina", "version": "2"},
            "model": {"provider": "openai", "model": "gpt-4.1-mini", "temperature": 0.4, "maxTokens": 180,
                      "messages": [{"role": "system", "content": (ROOT / "agent-prompt.md").read_text()}],
                      "tools": [{"type": "endCall"}]},
            "transcriber": {"provider": "deepgram", "model": "nova-3", "language": "multi"},
            "firstMessage": "Hi, I'm Aanya, the AI outreach assistant for Welingkar Mumbai. I'd love to understand what your team looks for in a management graduate. Is now a good time for one quick question?",
            "firstMessageInterruptionsEnabled": True,
            "maxDurationSeconds": 300,
            "silenceTimeoutSeconds": 30,
            "backgroundSound": "off",
            "clientMessages": ["transcript", "speech-update", "status-update", "conversation-update"],
            "artifactPlan": {"recordingEnabled": False, "transcriptPlan": {"enabled": True}},
            "analysisPlan": {"summaryPlan": {"enabled": True, "messages": [{"role": "system", "content": "Summarize the campus recruitment outreach call for a placement coordinator. Include only explicitly provided company, contact, hiring roles, timeline, email and callback preference; write unknown for missing details. State outcome: interested, information requested, callback, not hiring, wrong contact, or opted out. Distinguish proposed next steps from completed actions. No emails or meetings have actually been sent or booked by this demo."}]}, "successEvaluationPlan": {"enabled": False}},
            "metadata": {"purpose": "campus-recruitment-demo", "college": "Welingkar, Mumbai", "batchDates": "indicative-unconfirmed"}
        })
        identity_file.write_text(json.dumps({"id": assistant["id"], "name": assistant["name"]}, indent=2) + "\n")
    assistant = request("PATCH", "assistant/" + assistant["id"], assistant_patch(assistant))
    print("Assistant ready with approved CMC knowledge:", assistant["id"])
    browser_config_file = ROOT / "src" / "config.json"
    browser_config_file.parent.mkdir(exist_ok=True)
    if not browser_config_file.exists():
        token = request("POST", "token", {
            "name": "Campus Connect demo browser",
            "tag": "public",
            "restrictions": {"enabled": True,
                "allowedOrigins": ["https://campus-connect-voice-demo.batchmates.chatgpt.site", "https://tanmay7264.github.io", "http://localhost:4173", "http://127.0.0.1:4173"],
                "allowedAssistantIds": [assistant["id"]], "allowTransientAssistant": False}
        })
        browser_config_file.write_text(json.dumps({"assistantId": assistant["id"], "publicKey": token["value"]}, indent=2) + "\n")
    print("Restricted public browser key configured; private key stays in Vapi CLI config.")
