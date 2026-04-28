# Spec — Predictive Proactive Engine

> The agent does not wait. It anticipates. This is the feature that makes users say "I cannot live without it".

## Goal

For every user, every day, the agent surfaces 5–15 proactive insights/actions that the user did not have to ask for, ordered by likely value.

## Non-goals

- Not a notification firehose. Quality over quantity. Rule of thumb: every proactive item must save user > 5 minutes or unlock a >= $100 opportunity.

## Architecture

```
                 ┌──────────────────────────────────┐
                 │         Trigger sources          │
                 ├──────────────────────────────────┤
                 │ - Cron (morning brief, weekly)   │
                 │ - Event (new email, meeting in 1h)│
                 │ - Pattern detector               │
                 │ - Context shift (location, time) │
                 └──────────────┬───────────────────┘
                                │
                                ▼
                 ┌──────────────────────────────────┐
                 │     Anticipation engine          │
                 │  (proposes candidates)           │
                 └──────────────┬───────────────────┘
                                │
                                ▼
                 ┌──────────────────────────────────┐
                 │     Filter & rank                │
                 │  - Quality threshold             │
                 │  - User preferences              │
                 │  - Recent fatigue                │
                 │  - Predicted value               │
                 └──────────────┬───────────────────┘
                                │
                                ▼
                 ┌──────────────────────────────────┐
                 │  Surface (chat / push / digest)  │
                 └──────────────────────────────────┘
```

## Trigger types

### Time-based (cron)

| Cron | What |
|---|---|
| 06:30 user-local | Morning brief: today's calendar, top 3 emails, network suggestions, 1 wisdom insight |
| 17:30 user-local | End-of-day wrap: action items completed, follow-ups for tomorrow |
| Mon 09:00 user-local | Weekly: stale relationships, upcoming decisions due, this week's focus |
| 1st of month | Monthly review prompt: track wins, learnings |

### Event-based

| Event | Reaction |
|---|---|
| New email from VIP | Draft reply ready immediately |
| Meeting in 60 min | Send prep brief if not already viewed |
| Meeting starts | (voice) offer to join + take notes |
| Decision deadline approaching | Surface decision file with current state |
| User mentioned X in chat 3+ times this week | Suggest opening project/decision file |
| Calendar conflict detected | Propose resolutions |
| Important news about person/company in network | Flag with context |

### Pattern detector

Runs nightly per-user. Detects:
- Recurring action patterns (user always does X after Y → suggest automation)
- Energy patterns (user is sluggish in afternoon meetings → suggest morning slots)
- Communication patterns (always replies to person X within 1h → flag if late)
- Decision patterns (user agonizes over decisions of type T → preload framework)
- Network patterns (loses touch with category C in busy weeks → suggest reach-out)

### Context shift

- Time zone change detected → adjust schedule, fix calendar
- Calendar gap 2h+ unexpected → suggest deep work block
- Large project completed → suggest reflection + next priority
- New relationship signal (LinkedIn change, news) → update profile, suggest reach-out

## Candidate generation

For each trigger, generate 1+ candidates with shape:

```typescript
type ProactiveCandidate = {
  id: string;
  type: 'brief' | 'suggestion' | 'alert' | 'action_proposal';
  title: string;
  summary: string;
  reasoning: string;
  predictedValueMinutes: number;
  predictedValueDollars?: number;
  confidence: number;          // 0-100
  expiresAt: Date;
  channel: 'chat' | 'push' | 'email' | 'digest';
  urgency: 'now' | 'today' | 'this_week';
  actions?: ProposedAction[];
};
```

## Filter & rank

1. Drop candidates with `predictedValueMinutes < threshold` (default 5).
2. Drop duplicates against last 7d surfaced items.
3. Apply user preferences (e.g. "no morning briefs on weekends").
4. Apply fatigue filter: if user dismissed N similar items recently, suppress for K days.
5. Rank by `value * confidence * (1 - fatigue)`.
6. Cap per channel:
   - Push: 3/day max
   - Chat: 10/day max
   - Email digest: bundled, 1/day

## Learning loop

Each surfaced item is tracked:
- Was it viewed?
- Was it acted on?
- Was it dismissed (and how — quick swipe vs annoyed)?
- Did the user later do something the agent could have suggested?

Signals feed back into:
- Per-user threshold tuning (fatigue threshold goes up if user dismisses fast)
- Pattern detector weights
- Cross-user wisdom (DP-aggregated): which suggestion types convert best for which user cohorts

## Privacy

Pattern detection is per-user only by default. Wisdom layer aggregations follow `spec/wisdom.md` rules (DP-protected).

## Eval

- **Action rate**: % of surfaced items that user acts on (target: > 25%)
- **Value perception**: weekly survey "how useful were proactive suggestions this week?" (target: > 4/5)
- **Fatigue rate**: % of surfaced items dismissed quickly without view (target: < 15%)
- **Time saved (self-reported)**: monthly user survey (target: > 90 min/week)

## Open questions

- Push notification timing: respect Do Not Disturb? (yes, default)
- Should proactive items be commitable (turn into auto-actions)? Yes via `permission rules` (see actions spec).
