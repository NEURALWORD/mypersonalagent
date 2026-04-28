# Wellbeing Signals

> Detects overwork and burnout patterns. Suggests recovery interventions. Protects the user from themselves.

## Why this matters

The dirty secret of productivity tools: most make you more productive AND more exhausted. Burnt-out executives make worse decisions, lose sleep, lose families, sometimes lose companies.

Differentiator: an Executive Agent that genuinely has the user's back over a 10-year horizon, not just this quarter's velocity. The agent that knows when to push the user, and when to protect them.

## Core principle

**The agent serves the user's long-term wellbeing, not their short-term task throughput.**

If the user is heading toward burnout, the agent doesn't just suggest more time-blocking. It explicitly says: "You're at a level we should talk about."

## Signals tracked

All passively, non-intrusively. No surveys.

### Hard signals (from existing data)

```
- Work hours per day (first email/calendar event → last)
- Email volume (sent/received)
- Email response latency trend
- Meeting hours
- Late-night email activity (after 22:00)
- Weekend email activity
- Vacation days last 90 days
- Calendar density (meetings per workday)
- Sleep proxy: time of last activity → time of first next-day activity
```

### Soft signals (from voice + content analysis, opt-in)

```
- Voice tone (when user uses voice mode, optional)
- Email sentiment trend (curt vs warm baseline)
- Decision quality proxy (decision file outcomes when flagged "rushed")
- Self-reported energy via cmd+K → "/checkin" (optional, manual)
```

### Comparative baseline

User's signals are compared to their own 90-day baseline. **No cross-user comparison** — every executive has different healthy zones.

## Risk states

The agent classifies into four states, daily:

```
GREEN    Within normal bounds. No intervention.
YELLOW   Trending toward overwork. Soft suggestions in daily brief.
ORANGE   Sustained overwork. Direct conversation: "You've worked > 60h three weeks in a row. What's driving it?"
RED      Crisis pattern (extended overwork + sentiment shift + sleep proxy < 5h). Direct intervention.
```

### YELLOW interventions
- Suggest declining a low-ROI meeting (passes to Focus Defense)
- Suggest a 90-min deep work block protected
- Suggest "no meetings after 17:00 this week"
- Surface relevant memory: "You said in March you wanted to leave by 18:00. How's that going?"

### ORANGE interventions
- Direct daily check-in via voice/chat: "I notice you've been on email past midnight 4 of the last 7 days. What's going on?"
- Block creation: agent creates "personal time" blocks on calendar (user can override)
- Suggest delegation: "These 12 meetings could be delegated to Sarah. Want me to draft the handoffs?"
- Decline drafts for non-essential commitments

### RED interventions
- Direct, plain-language conversation: "I'm flagging this because I'm worried about you. Here's what I'm seeing: [data]. I think we should talk about this."
- Suggest contacting a real human: therapist, coach, partner, mentor (not specific recommendations — user's choice)
- Crisis-level: agent does not pretend to be a therapist. It surfaces the pattern, names it clearly, and steps back.

## Privacy + ethics

This is the most sensitive area in the entire product. Mishandling = catastrophic trust violation.

Rules:
- **All wellbeing signals stored encrypted with user-only key**
- **Never shared with anyone**, including in case of company-paid subscription. Wellbeing data is ALWAYS personal, even if employer pays.
- **Audit logs are user-only**. The team admin (in team plans) cannot see this layer.
- **No cross-tenant aggregation**. Wisdom layer EXCLUDES wellbeing data.
- **Opt-out always available**. If opted out, signals are not even computed.
- **No insurance integration ever**. We commit publicly to never selling/sharing this data.
- **Agent is not a clinician.** Always frames as "I noticed a pattern" not "you have burnout".

## Design principles for messaging

The hardest part of this feature is **how the agent talks** about it. Get this wrong and it's preachy/annoying or trivializing/shallow.

Principles:
- **Plain.** "You worked late 4 nights this week" not "Your work-life balance metrics indicate elevated risk."
- **Curious, not directive.** "What's driving this?" not "You should sleep more."
- **Specific.** "Past 3 Tuesdays you had 7+ meetings. The Tuesday before they started, you had 4." Specific facts > generic warnings.
- **Optional.** User can dismiss any wellbeing message with one click. Agent never doubles down.
- **Boundary-aware.** Agent explicitly says: "I'm an AI, not a therapist or doctor. If this is bigger than time management, please talk to someone qualified."
- **No cheerleading.** Avoid "You're doing great!" or "Take care of yourself ❤️". The user is an adult. Be respectful.

## Architecture

### Components

```
WellbeingAgent
  ├── SignalCollector    (passive aggregation from existing data)
  ├── BaselineEstimator  (90-day rolling personal baseline)
  ├── Classifier         (GREEN/YELLOW/ORANGE/RED state)
  ├── InterventionRouter (selects intervention by state + history of past interventions)
  └── ConversationRunner (talks to user when triggered, plain-language)
```

### Cron schedule

- Hourly: signal collection + baseline update
- Daily 06:00 user time: classification + intervention decision
- Weekly Sunday: weekly summary surfaced in next morning brief (only if YELLOW+)

### Tools exposed to master orchestrator

```typescript
WellbeingTools = {
  getCurrentState: () => 'green' | 'yellow' | 'orange' | 'red',
  getRecentSignals: (window: '7d' | '30d' | '90d') => SignalSummary,
  triggerCheckIn: () => Conversation,    // user-initiated only
  setPreferences: (prefs) => void,        // healthy work hours, etc.
}
```

### User-facing controls

- Settings → Wellbeing → opt-in toggle (off by default for new accounts in v1; on by default in v2 after feedback)
- Settings → Wellbeing → preferences (work hours, weekend rule, vacation reminder)
- Settings → Wellbeing → "show me what you see" → transparency view of signals

## Eval criteria

This is hard to eval automatically. We use human eval primarily.

- ✅ Test with 10 design partners over 60 days
- ✅ Survey: "Did the agent's wellbeing observations feel respectful?" target ≥ 4.0/5
- ✅ Survey: "Were any observations off-base or annoying?" target ≤ 20% reporting yes
- ✅ Survey: "Would you recommend keeping this feature on?" target ≥ 80% yes
- ✅ Behavioral: % of suggestions accepted (declining a meeting, taking a break) ≥ 30%
- ✅ Zero reports of feeling judged or surveilled

## Tasks created

- WB-001 SignalCollector implementation
- WB-002 BaselineEstimator (per-user 90-day rolling)
- WB-003 Classifier (GREEN/YELLOW/ORANGE/RED)
- WB-004 InterventionRouter
- WB-005 ConversationRunner with prompt versioning + careful eval
- WB-006 Settings UI (transparency view)
- WB-007 Privacy guarantees: encryption, audit, opt-out, exclusion from wisdom layer

## Open questions for founder

- Default state: opt-in or opt-out? (Recommendation: opt-in for v1, gather data, possibly switch in v2)
- Shipping with team plans: how to communicate "your employer cannot see this" effectively in team onboarding?
- Crisis disclaimer wording: needs legal review
