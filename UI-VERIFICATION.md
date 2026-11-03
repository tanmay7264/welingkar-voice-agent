# Reference dashboard UI — 4 November 2026

- User reference: Voiceagent.png, supplied in the chat. The screenshot is used as a composition reference, not embedded as the live interface.
- User logo: logo_25.svg, copied byte-for-byte; SHA-256 equality checked. SVG renders successfully after versioning its asset URL.
- Desktop browser check at the available 1384px viewport: no horizontal overflow; all images load; Three.js ribbon is ready; no application console errors.
- Light and dark themes inspected. Theme changes from both the header and Settings dialog work.
- Overview, Conversations, Batch Profile, Placement Hub, Insights and Settings sidebar controls open the correct native dialog. Programme Queries card opens the full programme list. Closing returns to the voice page; scenario selection displays its actual prompt.
- Current-session transcript and caption counts are clearly distinguished from stored histories, candidate data and outcomes. Text chat remains visibly unavailable rather than simulated.
- All 16 existing voice-control/theme regression tests pass; static build passes. Unique IDs, required Vapi control elements and all relative asset paths were checked.
- Mobile CSS includes a collapsing sidebar, stacked panels, narrow-header controls, reduced-width microphone bars, and a 320px fallback. Browser viewport override/emulation was unavailable in this session, so phone rendering has not been visually verified.
- Existing live assistant instructions, short replies, feminine Hindi grammar and call-ending/error behavior remain unchanged by this UI update.
