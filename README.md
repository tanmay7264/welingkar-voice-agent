# Campus Connect — Welingkar Mumbai voice demo

A browser voice demo backed by the placement outreach assistant in the user's Vapi account. No outbound phone calls, email delivery or calendar booking is configured.

- Live GitHub Pages demo: https://tanmay7264.github.io/welingkar-voice-agent/
- Source: https://github.com/tanmay7264/welingkar-voice-agent
- Original hosted demo: https://campus-connect-voice-demo.batchmates.chatgpt.site/

Assistant ID: `b11ea966-52ed-44d7-bf3b-ffeabc0396ad`.

## GitHub Pages

Pushes to `main` run the GitHub Actions workflow in `.github/workflows/pages.yml`. It installs the locked dependencies, runs the tests, builds the browser bundles and deploys only `dist/` to Pages. No private Vapi key or GitHub repository secret is required for deployment. GitHub Pages must be configured to use GitHub Actions as its publishing source.

Asset paths are relative so the same demo works at a domain root and under a Pages project path. The existing browser key allows `https://tanmay7264.github.io` and remains restricted to the configured assistant. The page-share control preserves the project path.

## Develop

Use Node.js 22.14 or later. Run `npm ci`, `npm test`, and `npm run build`. Serve `dist/` over HTTPS for microphone access. The Vapi public key in `src/config.json` is intended for browser use and is restricted to this assistant and the deployment origin. Local browser calling is allowed only on the origins configured in Vapi's API Keys settings. No Vapi private key is copied into this project.

The decorative Three.js scene is built separately as `dist/visual.js`; voice controls continue to use `dist/app.js`. The 3D sculpture reacts to the existing assistant speech state, respects reduced-motion preferences, and pauses rendering outside the viewport or in hidden tabs. A CSS sphere remains visible when WebGL is unavailable. No microphone is accessed by the visual layer.

Light and dark themes follow the device preference until a visitor chooses one. The switch stores that choice locally when browser storage is available. The early-loading `theme.js` sets the theme before styles render; the 3D scene adapts to both themes. The official WeSchool logo and Mumbai campus photograph are kept locally with their source URLs in `dist/assets/SOURCES.md`.

The agent uses the supplied **WeSchool CMC Voice Agent Briefing (3 November 2026)**. `agent-prompt.md` defines conversation rules; `agent-knowledge.md` contains the approved factual extract and source links. `scripts/agent_config.py` assembles both into the live system message. The configured model is `gpt-4.1`, with a lower temperature for grounded answers. The stronger model replaces `gpt-4.1-mini` after evaluation exposed missed constraints. Curriculum facts describe training, not proven abilities of every student.

Run `python3 scripts/sync-agent.py` with the existing Vapi CLI login to apply the assembled knowledge to the existing assistant and verify it by reading back the configuration. It writes a prior-configuration backup to ignored `assistant-backup.local.json`. Provisioning also applies the same configuration when rerun, so it cannot silently revert to the old prompt. Private credentials remain in the Vapi CLI config and are passed to curl through stdin.

Recruiter checkpoints are in `agent-evaluations.json`. `python3 scripts/evaluate-agent.py` tests the draft through Vapi Evals and writes ignored detailed local results; it consumes model usage without placing calls. See `agent-evidence.md` and `agent-evaluation-report.md` for scope and validation limits.

## Demo facts and limitations

Only flagship PGDM, E-Business, RBA and Retail offer the four functional specializations. Business Design minors, Rural elective groups, and Healthcare/Media pathways are kept distinct. Campus/year caveats are preserved, including Bengaluru E-Business curriculum and Healthcare's 2023–25 source.

Current placement dates, available candidate counts, named CMC contacts and approved recruiter lists require human confirmation. Earlier inferred batch timelines and generic seat totals have been withdrawn. Historical placement figures from the briefing's reference-only section are excluded from the live system message. No salary/placement metrics or guaranteed candidate outcomes may be quoted. Legal, compensation, complaint and human-contact requests stop the sales pitch and require human review.

Follow-up requests are captured in transcripts only: no email, calendar, file delivery, live human transfer or notification integration is configured. The assistant must not promise email today, claim a meeting is booked, or imply a human has been alerted.

Audio recording is disabled; call transcripts and summaries can be retained in the Vapi account. Final transcript captions can also be downloaded from the page. Calls have a five-minute assistant limit and consume Vapi credits. The browser key is not a per-user authentication mechanism: anyone who can access the shared demo can initiate calls. Disable the dedicated Campus Connect public key in Vapi when the demo is no longer needed.

To make real outbound calls later, configure a supported phone provider/number, verified placement contact details, approved company contacts and follow-up integrations. The current demo does not call any company or send any message.
