# Focus Defense

> An adversarial calendar layer. Defends the executive's time from low-ROI meetings, protects deep-work blocks, suggests declines, reschedules, or delegations.

## Why this matters

Most calendar tools are passive: they show what's coming. Focus Defense is **active**: it aggressively protects the user's most valuable resource (attention).

Differentiator: every other AI assistant tries to make you say yes to more. Focus Defense helps you say no, intelligently.

## Core insight

An executive's calendar is a battle. Every meeting added is time taken from strategy, deep work, family, or recovery. The agent should be the user's defense lawyer, not their secretary.

## Behaviors

### 1. Meeting ROI scoring

Every meeting on calendar gets a daily-recomputed ROI score:

```
ROI = f(
  meeting_purpose_clarity,    // is goal explicit in agenda?
  attendee_value,              // are decision-makers present?
  user_role_necessity,         // does this REQUIRE the user?
  outcome_pattern,             // historically, do meetings like this produce action?
  timing_cost,                 // displaces deep work? interrupts focus?
  alternative_format           // could this be async (Loom, doc, slack)?
)
```

Output: `low | medium | high` with reasoning.

### 2. Decline / reschedule / delegate suggestions

For low-ROI meetings, agent suggests:

```
"This meeting has no clear agenda and you're 1 of 8 attendees. 
 You probably don't need to be there.
 Options:
   [Decline politely with template]
   [Ask for agenda first]
   [Send delegate (Sarah)]
   [Move to async via Loom]"
```

User chooses → action executes via standard ActionExecutor flow.

### 3. Deep work protection

User defines preferences:
- Deep work hours (e.g. 8:30-11:30 daily)
- Maximum daily meeting hours (e.g. 4h cap)
- Mandatory recovery (e.g. 30 min between meetings)
- Hard "no meeting" days/half-days (e.g. Wednesday morning)

Agent:
- Auto-blocks deep work hours when calendar is shared
- Pushes back on meeting requests that violate rules
- Drafts polite decline templates
- Negotiates alternative times via A2A protocol when other party also has agent

### 4. Meeting load alerts

Daily morning brief includes:
- Meeting load today (X hours, Y meetings)
- This week's load vs last week
- Days exceeding cap → suggested meetings to decline/reschedule
- Forecast: at this pace, meeting hours/week trend

### 5. Async migration suggestions

When agent detects a meeting could be a Loom + doc instead:
- Suggests format
- Drafts the doc/Loom script
- Proposes to attendees: "Manuel suggested we do this async. Here's the doc — please add comments by Tuesday."

### 6. Recurring meeting audit

Every quarter, agent reviews all recurring meetings:
- "This 1:1 with X has happened 12 times. Last 3 had no action items. Cancel? Reduce frequency? Refocus?"
- Surfaces in proactive feed.

## Privacy + ethics

- **User-only**: scoring is shown only to user, never exposed to other attendees
- **Tone discipline**: decline templates are warm and respectful by default. User can adjust to "direct" if preferred
- **No gaming**: agent never lies about why user is declining. If reason is "competing priority", that's what template says (politely)
- **Override always**: user can always override scoring with one click. Agent learns from overrides.

## Architecture

### Components

```
FocusDefenseAgent
  ├── ROIScorer          (per-meeting scoring, daily refresh)
  ├── DeepWorkGuardian   (calendar block management)
  ├── LoadMonitor        (daily/weekly aggregate alerts)
  ├── DeclineComposer    (generates polite decline templates)
  ├── AsyncMigrator      (proposes async alternatives)
  └── RecurringAuditor   (quarterly review of recurring meetings)
```

### Inputs

- Calendar events (next 14 days)
- User preferences (deep work hours, meeting caps, recovery rules)
- Meeting outcome history (memory: did this meeting type produce actions?)
- User role + current priorities (memory: what is user actively working on?)
- Attendee importance (relationships graph)

### Outputs

- Per-meeting ROI assessment in calendar UI
- Proactive suggestions in daily brief
- Auto-decline drafts (require user approval)
- Calendar blocks for deep work (auto-created with title "🔒 Deep work — Manuel")
- Async migration proposals

## Eval criteria

- ✅ ROI score accuracy ≥ 0.75 vs user's own labeling on 100 past meetings
- ✅ Decline template approval rate ≥ 70% without edit
- ✅ Deep work block respect rate ≥ 90% (no auto-overrides)
- ✅ Time saved per week tracked → target 4+ hours/week by month 3

## Tasks created

- FD-001 ROIScorer engine + heuristic + calibration
- FD-002 Deep work guardian (calendar block management)
- FD-003 Load monitor + daily/weekly alerts
- FD-004 Decline template composer + variants
- FD-005 Async migration proposer
- FD-006 Recurring meeting auditor (quarterly cron)
- FD-007 Settings UI for preferences

## User onboarding flow

When user first activates Focus Defense:

1. Survey (3 questions):
   - "When are your best deep-work hours?"
   - "Maximum meeting hours/day you want to allow?"
   - "Days/half-days that should be meeting-free?"

2. Agent shows preview: "Based on your last 30 days, here's what would have changed."

3. Soft mode (week 1): suggestions only, no auto-blocks

4. Active mode (week 2+): auto-blocks deep work, surfaces decline suggestions in daily brief
