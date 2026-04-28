# Pack Index — Executive Agent

**This is the inventory of everything in the pack.** Use this to navigate.

---

## Top-level files (read in order)

| File | Purpose |
|------|---------|
| `START-HERE.md` | Entry point. Read first. |
| `claude.md` | Operating manual. The law. |
| `RUNBOOK.md` | Environment setup, daily commands, recovery. |
| `BACKLOG.md` | Task queue. Pick top unblocked. |
| `DECISIONS.md` | Architectural decision records. |
| `BLOCKERS.md` | Template for stuck tasks. |
| `INDEX.md` | This file. |

## Specifications (`spec/`)

14 spec files. Read the relevant one before each task.

| Spec | Covers |
|------|--------|
| `memory-layer.md` | Episodic/semantic/procedural memory, recall scoring, consolidation |
| `agents.md` | Multi-agent architecture, master orchestrator, sub-agents |
| `ai-router.md` | Single chokepoint for all LLM calls, fallback chain, cost guardrails |
| `database.md` | Full Postgres schema, all tables, RLS, encryption |
| `actions.md` | Propose→approve→execute→revertible state machine |
| `evals.md` | 3-tier eval framework (unit/integration/regression) |
| `voice.md` | LiveKit + Whisper + Cartesia, sub-600ms latency budget |
| `proactive.md` | Anticipation engine, pattern detection |
| `a2a-protocol.md` | Agent-to-agent JSON-RPC over HTTPS, signed, capability discovery |
| `wisdom.md` | Cross-user pattern learning, DP-protected, opt-in |
| `live-meeting.md` | **NEW** — In-call assistant, post-call package |
| `focus-defense.md` | **NEW** — Adversarial calendar layer, time protection |
| `wellbeing.md` | **NEW** — Burnout detection, anti-overwork, privacy-first |
| `env-vars.md` | All env vars by category |

## Tasks (`tasks/`)

85+ atomic tasks across 16 phases. Each task: 1-8h of work, single PR.

| Prefix | Phase | Count | Topic |
|--------|-------|-------|-------|
| `F-` | 0 | 10 | Foundations (monorepo, db, auth, tRPC, observability) |
| `M-` | 1 | 6 | Memory layer |
| `AI-` | 2 | 4 | AI router, prompt registry, eval harness |
| `I-` | 3 | 7 | Integrations (Gmail, Calendar, LinkedIn, Slack, MS) |
| `AG-` | 4 | 7 | Agents (master, email, calendar, people, decision, network, wisdom) |
| `ACT-` | 5 | 4 | Action layer |
| `UI-` | 6 | 4 | Conversational UI |
| `V-` | 7 | 6 | Voice always-on |
| `P-` | 8 | 6 | Predictive proactive |
| `CDS-` | 9 | 3 | Cross-device sync |
| `A2A-` | 10 | 4 | Agent-to-agent protocol |
| `W-` | 11 | 4 | Wisdom layer |
| `L-` | 16 | 6 | Launch prep |
| `LM-` | 13 | 8 | **NEW** — Live meeting agent |
| `FD-` | 14 | 7 | **NEW** — Focus defense |
| `WB-` | 15 | 7 | **NEW** — Wellbeing signals |

Total: 93 tasks.

## Prompts (`prompts/`)

Versioned, hot-reloadable prompt files. Naming: `<agent>/<task>.v<n>.md`.

| Path | Use |
|------|-----|
| `master/system.v1.md` | Master orchestrator system prompt |
| `master/system.voice.v1.md` | Voice mode variant |
| `master/salience.v1.md` | What's worth remembering long-term |
| `email/triage.v1.md` | Email triage classifier |
| `email/draft.v1.md` | Email draft composer |
| `calendar/prep.v1.md` | Meeting briefing |
| `memory/consolidate.v1.md` | Nightly memory consolidation |
| `decision/open.v1.md` | **NEW** — Open decision file |
| `network/warm-intro.v1.md` | **NEW** — Warm intro request |
| `voice/always-on.v1.md` | **NEW** — Voice mode constraints |
| `wellbeing/checkin.v1.md` | **NEW** — Wellbeing conversation (most sensitive) |

## Evals (`eval/`)

| Path | Use |
|------|-----|
| `fixtures/memory-recall.sample.json` | Memory recall accuracy |
| `fixtures/email-triage.sample.json` | Email triage classification |
| `fixtures/decision-detection.sample.json` | When to open decision file |
| `fixtures/meeting-roi.sample.json` | Meeting ROI scoring |
| `fixtures/action-extraction.sample.json` | Action item extraction from transcripts |
| `fixtures/wellbeing-classification.sample.json` | State classification |
| `baselines/voice-latency.baseline.json` | Voice latency budgets (p50, p95) |
| `baselines/cost-per-user.baseline.json` | Cost per active user per month |

## What's covered (revolutionary features checklist)

- ✅ Memory architecture (episodic/semantic/procedural/preference/relationship/decision)
- ✅ Real agency (propose→approve→execute→revert)
- ✅ Privacy-first (per-user encryption, audit log, RLS)
- ✅ Voice always-on, cross-device, sub-600ms latency
- ✅ Cross-device state sync (Liveblocks)
- ✅ Predictive proactive engine
- ✅ Agent-to-agent protocol foundation (signed JSON-RPC + capability discovery)
- ✅ Wisdom layer (cross-user patterns, differential privacy)
- ✅ Eval framework, prompt versioning, cost guardrails, observability
- ✅ Multi-agent architecture (master + 7 sub-agents)
- ✅ Decision intelligence with outcome tracking
- ✅ Network warm-intro engine
- ✅ Email autopilot mode
- ✅ **Live Meeting Agent** (in-call + post-call package)
- ✅ **Focus Defense** (adversarial calendar)
- ✅ **Wellbeing Signals** (anti-burnout)

## What's intentionally NOT in this pack

These are deliberate omissions to avoid scope creep on first build:

- ❌ Mobile apps (iOS/Android native) — Phase 2, after web+voice prove
- ❌ Custom hardware companion device — Phase 3, post-Series A
- ❌ Browser extension — Phase 2
- ❌ White-label / self-hosted — Phase 4
- ❌ Internationalization beyond i18n key scaffolding — language packs Phase 2
- ❌ Multi-user team features (shared memory, team approvals) — Phase 2
- ❌ Compliance certs beyond SOC2 prep (GDPR full audit, HIPAA) — Phase 3

## How long does this take?

Estimated for one full-time developer (or Claude Code working autonomously with founder oversight):

- **Phases 0-6** (foundations through UI): 6-7 weeks
- **Phases 7-12** (voice, proactive, sync, A2A, wisdom, launch): 4-5 weeks
- **Phases 13-15** (live meeting, focus defense, wellbeing): 3-4 weeks
- **Total to v1 launch**: **13-16 weeks**

Aggressive timeline, but achievable with Claude Code in autonomous loop + founder doing weekly review + unblock cycles.
