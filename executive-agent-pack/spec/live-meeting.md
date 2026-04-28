# Live Meeting Agent

> An in-call assistant that joins Zoom/Meet/Teams, takes structured notes, surfaces silent suggestions to the user during the meeting, and generates a complete follow-up package after.

## Why this matters

For an executive doing 5-10 meetings/day, two hours of post-meeting work disappears: notes, action items, follow-up emails, decisions to log, people to introduce. Live Meeting Agent collapses that to zero.

This is a flagship "AHA moment" feature. After a user's first meeting with it active, retention probability jumps significantly.

## User experience

### Before meeting
- Calendar Agent prepares brief (existing flow)
- 5 min before: Live Meeting Agent appears as ready in sidebar
- User clicks "join with agent" or it auto-joins if user opted in for that meeting type

### During meeting
- Agent appears in call as a silent participant ("Manuel's Agent — listening only")
- Real-time transcription with speaker diarization
- **Silent suggestions panel** (only visible to user on their device, not in the call):
  - "You haven't responded to Sarah's question yet"
  - "Consider mentioning the Q3 milestone — relevant"
  - "John mentioned a concern. Open follow-up?"
- User can pin moments ("save this", cmd+shift+P)
- User can ask agent silently via chat ("what was the number Sarah said about churn?")

### After meeting (within 60 seconds of end)
- Structured summary written to memory
- Action items extracted with assignees + deadlines
- Follow-up email drafts (one per recipient)
- Decisions detected → opens decision file if material
- Network updates (if first meeting with new person → person memory created)
- Outcome review reminders set if decisions made

## Architecture

### Components

```
LiveMeetingAgent
  ├── Joiner          (handles platform integration: Zoom, Meet, Teams)
  ├── Capturer        (audio stream → Whisper streaming + diarization)
  ├── LiveAnalyzer    (real-time signal detection during call)
  ├── SilentChannel   (private chat channel between user ↔ agent)
  ├── Synthesizer     (post-call package generation)
  └── Persister       (writes memory, actions, follow-ups)
```

### Platform integration

**MVP (M1)**: Bot user that joins Google Meet via official Meet API. Audio captured server-side via meeting recording API. No installation required for other attendees.

**Phase 2**: Zoom App SDK + Microsoft Teams bot.

**Phase 3**: macOS native overlay (no bot needed) — captures system audio + camera locally, processes locally for privacy. Mac is enough for first big segment.

### Data flow

```
Audio → STT streaming (Whisper realtime) → diarized transcript chunks
       ↓
       LiveAnalyzer (every 30s window):
         - Detect questions to user not yet answered
         - Detect action items proposed
         - Detect decisions being made
         - Detect mentions of people in user's network
         - Detect emotional signals (frustration, excitement, hesitation)
       ↓
       Generate silent suggestions (deduped, salience-ranked)
       ↓
       Push to user's device (Liveblocks channel)

End of call:
       Full transcript → Synthesizer
       ↓
       Outputs:
         - Structured summary (memory)
         - Action items (list with assignee + deadline)
         - Follow-up email drafts (per recipient)
         - Decision file proposals (if applicable)
         - People memory updates
         - Sentiment delta on key relationships
```

## Privacy + consent

**This feature is the highest-stakes for privacy.** Mishandling = legal risk + brand damage.

Rules:
- **Never join a meeting without explicit per-meeting opt-in** (or persistent rule for meeting type, set in advance)
- **Visible in the meeting** — agent identifies as "Manuel's Agent — note taking" in participant list
- **Audio recording disclosure** — first joining → posts message in chat: "I'm Manuel's note-taking agent. I'm transcribing for his use. I do not store audio. I do not share with anyone."
- **Comply with jurisdiction**: in two-party-consent states/countries, if any attendee declines, agent leaves the call
- **Audio retention**: zero. Audio is processed streaming, transcript is stored, raw audio is dropped immediately
- **Transcript ownership**: only the user (Manuel) sees the transcript. External attendees can request deletion via REST endpoint exposed at `/api/meeting/<id>/request-delete`
- **Configurable per meeting type**: 1:1s with team — agent on by default. Customer calls — agent on by default. External board meetings — agent off by default

### Consent UI

Before first activation:
- Plain language explanation
- Explicit checkbox: "I understand my agent will join meetings and create transcripts"
- Per-meeting type defaults configurable
- Per-attendee blocklist (e.g. never join calls with attorney@firm.com)

## Tools exposed

```typescript
LiveMeetingTools = {
  joinMeeting: (meetingId, options) => void,
  pinMoment: (timestamp, note?) => void,
  askAgent: (question) => string,           // private channel
  endAndSynthesize: () => MeetingPackage,
  cancelJoin: () => void,
}
```

## Performance budgets

- STT lag: ≤ 2s from speech to transcript displayed
- Suggestion generation: ≤ 5s from trigger to push
- Post-call synthesis: ≤ 60s from end-of-call to summary ready

## Cost model

A 60-min meeting generates roughly:
- STT: ~$0.36 (Whisper at $0.006/min)
- Live analysis (every 30s): ~120 small LLM calls × $0.001 = $0.12
- Post-call synthesis: 1 large call ~ $0.30
- **Total: ~$0.78 per hour of meeting**

For a user with 4 hours of meetings/day = $3/day = $90/month. Premium tier.

## Eval criteria

- ✅ Action item extraction precision ≥ 0.85, recall ≥ 0.80 (golden dataset of 50 meetings)
- ✅ Decision detection precision ≥ 0.75 (manually labeled set)
- ✅ Follow-up email drafts approved without edit ≥ 60% by month 3
- ✅ Silent suggestions with positive thumbs ≥ 40%
- ✅ Zero false-positive joins (joining a meeting without opt-in)

## Tasks created

- LM-001 Joiner abstraction (platform-agnostic)
- LM-002 Google Meet integration
- LM-003 Streaming STT + diarization pipeline
- LM-004 LiveAnalyzer (real-time signals)
- LM-005 SilentChannel (private user ↔ agent during call)
- LM-006 Post-call synthesizer
- LM-007 Consent UI + per-meeting opt-in
- LM-008 macOS native overlay (Phase 3, scoped task only)

## Open questions for founder

- Pricing tier: should this be in standard tier or "Pro" tier ($49 vs $99)?
- Marketing: do we lead with this feature or save it as "wow" reveal post-onboarding?
- Compliance scope: GDPR is hard requirement; CCPA included; do we ship to two-party-consent US states from day 1?
