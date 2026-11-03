"""Apply approved knowledge to the existing assistant; preserve unrelated settings."""
import importlib.util
import json
from agent_config import ROOT, assistant_patch

spec = importlib.util.spec_from_file_location("provision", ROOT / "scripts/provision-agent.py")
provision = importlib.util.module_from_spec(spec)
spec.loader.exec_module(provision)
assistant_id = json.loads((ROOT / "src/config.json").read_text())["assistantId"]
current = provision.request("GET", "assistant/" + assistant_id)
(ROOT / "assistant-backup.local.json").write_text(json.dumps(current, indent=2) + "\n")
patch = assistant_patch(current)
provision.request("PATCH", "assistant/" + assistant_id, patch)
live = provision.request("GET", "assistant/" + assistant_id)
for key, expected in patch.items():
    assert live[key] == expected, f"Live {key} does not match approved configuration"
print(json.dumps({"assistantId": assistant_id, "version": live.get("version"),
                  "knowledgeSha256": live["metadata"]["knowledgeSha256"],
                  "verified": True}))
