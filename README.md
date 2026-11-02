# Campus Connect — Welingkar Mumbai voice demo

A browser voice demo backed by the placement outreach assistant in the user's Vapi account. No outbound phone calls, email delivery or calendar booking is configured.

Assistant ID: `b11ea966-52ed-44d7-bf3b-ffeabc0396ad`.

## Develop

Use Node.js 20 or later. Run `npm ci`, `npm test`, and `npm run build`. Serve `dist/` over HTTPS for microphone access. The Vapi public key in `src/config.json` is intended for browser use and is restricted to this assistant and the deployment origin. Local browser calling is allowed only on the origins configured in Vapi's API Keys settings. No Vapi private key is copied into this project.

The agent's instructions are in `agent-prompt.md`; the live configuration is in Vapi. The provisioning script uses the existing Vapi CLI login in `~/.vapi-cli.yaml` and preserves the assistant ID on reruns. To change the live prompt, edit the assistant in the Vapi dashboard or patch it through the Vapi API. After changing the prompt, retest its responses.

## Demo facts and limitations

The college name and eight programme capacities were provided by the user. Capacities are not confirmed eligible candidate counts. Both batch timelines are the user's unconfirmed inference and are labelled accordingly. `placements@example.com` and `+91 00000 00000` are explicit sample contacts.

Audio recording is disabled; call transcripts and summaries can be retained in the Vapi account. Final transcript captions can also be downloaded from the page. Calls have a five-minute assistant limit and consume Vapi credits. The browser key is not a per-user authentication mechanism: anyone who can access the shared demo can initiate calls. Disable the dedicated Campus Connect public key in Vapi when the demo is no longer needed.

To make real outbound calls later, configure a supported phone provider/number, verified placement contact details, approved company contacts and follow-up integrations. The current demo does not call any company or send any message.
