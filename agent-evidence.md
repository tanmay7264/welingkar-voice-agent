# Aanya's approved CMC knowledge and validation

Knowledge authority: the user-supplied **WeSchool CMC Voice Agent Briefing**, dated 3 November 2026. The factual extract and original source links are in `agent-knowledge.md`; the source snapshot SHA-256 is recorded there. These claims have not been independently reverified in this update.

`agent-prompt.md` defines behavior and permitted speech. `scripts/agent_config.py` assembles the complete behavior plus knowledge into the system message, with final response priorities overriding canned source wording. It also defines the opening, transcript-summary fields and version/hash metadata. `scripts/sync-agent.py` updates the existing assistant, backs up its prior configuration to an ignored local file, and reads the assistant back to verify the applied configuration.

All eight programme descriptions, curricula, role pathways, specialization/minor/elective distinctions, campus and brochure scope, engagement formats, unknowns and source URLs are retained. The reference-only placement table is deliberately excluded from spoken knowledge. Earlier user-inferred batch calendars and unsourced Mumbai capacities are withdrawn. Bengaluru E-Business 2026–28 syllabus is not attributed to Mumbai. Healthcare's 2023–25 structure is explicitly dated and needs confirmation.

The source's canned promises of email today or immediate human connection are overridden: this demo has only endCall, with no email, calendar, notification, CRM, profile delivery or transfer integration. Questions and escalation requests can be captured in retained transcripts for human review; this does not notify a human or guarantee action.

At the same package, the IIM comparison remains role-based: the same hiring bar, an approved relevant programme focus and employer-defined assessment. No superiority, retention or skill guarantee is allowed. Salary figures, current placement numbers, recruiter endorsements, student personal data, booking commitments and invented CMC contacts are prohibited.

Model-layer regression cases are in `agent-evaluations.json`. Run `python3 scripts/evaluate-agent.py` to test the assembled draft through Vapi Evals without placing a voice call. It incurs Vapi model usage and writes detailed results to ignored `agent-eval-results.local.json`. The model-layer checks do not establish speech-recognition accuracy, pronunciation, audio reliability or actual human follow-up. An AI judge can be wrong; inspect generated answers, not just the pass count.

Conversation style was tightened on 4 November 2026: direct answers, short turns and no generic follow-up question. Evaluation now includes deterministic word-count limits and a targeted brief RBA answer, in addition to factual judging. Full factual knowledge remains available; brevity does not permit dropping essential source/campus caveats.
