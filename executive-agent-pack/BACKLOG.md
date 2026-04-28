# BACKLOG — Executive Agent

> Tasks are ordered by execution priority. Claude Code picks **top unblocked** task each loop iteration.
> Status: `[ ]` todo, `[~]` in progress, `[x]` done, `[!]` blocked (see BLOCKERS.md)

---

## Phase 0 — Foundations (week 1-2)

- [ ] **F-001** Initialize monorepo (Turborepo + pnpm + Biome) — see `tasks/F-001.md`
- [ ] **F-002** Setup Docker compose (Postgres 16 + pgvector + Redis) — see `tasks/F-002.md`
- [ ] **F-003** Configure TypeScript strict + path aliases — see `tasks/F-003.md`
- [ ] **F-004** Create `packages/shared` (errors, types, env validation) — see `tasks/F-004.md`
- [ ] **F-005** Create `packages/db` (Drizzle, base schema, migrations) — see `tasks/F-005.md`
- [ ] **F-006** Setup Next.js app skeleton (App Router, Tailwind, shadcn) — see `tasks/F-006.md`
- [ ] **F-007** Setup Clerk auth (email + Google + passkey) — see `tasks/F-007.md`
- [ ] **F-008** Setup tRPC v11 server + client — see `tasks/F-008.md`
- [ ] **F-009** Setup Inngest dev server + first cron — see `tasks/F-009.md`
- [ ] **F-010** Setup Langfuse + Sentry + PostHog — see `tasks/F-010.md`

## Phase 1 — Memory layer (week 3)

- [ ] **M-001** Schema: entities, relationships, memories, raw_items — see `tasks/M-001.md`
- [ ] **M-002** MemoryOrchestrator: recall (semantic + graph + recency) — see `tasks/M-002.md`
- [ ] **M-003** MemoryOrchestrator: remember (with dedup + confidence) — see `tasks/M-003.md`
- [ ] **M-004** Entity extractor (NER via small LLM, cached) — see `tasks/M-004.md`
- [ ] **M-005** Memory consolidation job (nightly aggregation) — see `tasks/M-005.md`
- [ ] **M-006** Eval: memory recall accuracy on golden set — see `tasks/M-006.md`

## Phase 2 — AI router & cost guardrails (week 3-4)

- [ ] **AI-001** AI router (model selection, fallback chain, cache) — see `tasks/AI-001.md`
- [ ] **AI-002** Token budget enforcer (per-user daily limit) — see `tasks/AI-002.md`
- [ ] **AI-003** Prompt registry (versioned, hot-reloadable) — see `tasks/AI-003.md`
- [ ] **AI-004** Eval harness foundation (vitest-based, golden datasets) — see `tasks/AI-004.md`

## Phase 3 — Integrations (week 4-5)

- [ ] **I-001** Gmail OAuth + watch (push notifications) — see `tasks/I-001.md`
- [ ] **I-002** Gmail ingester (raw_items pipeline) — see `tasks/I-002.md`
- [ ] **I-003** Google Calendar OAuth + sync — see `tasks/I-003.md`
- [ ] **I-004** Calendar ingester (events → memories) — see `tasks/I-004.md`
- [ ] **I-005** LinkedIn enrichment (people lookup) — see `tasks/I-005.md`
- [ ] **I-006** Slack bot integration (later) — see `tasks/I-006.md`
- [ ] **I-007** Microsoft Graph (Outlook + Teams) — see `tasks/I-007.md`

## Phase 4 — Agents (week 5-6)

- [ ] **AG-001** Master orchestrator (with tool routing) — see `tasks/AG-001.md`
- [ ] **AG-002** Email Agent (triage + draft) — see `tasks/AG-002.md`
- [ ] **AG-003** Calendar Agent (prep + scheduling) — see `tasks/AG-003.md`
- [ ] **AG-004** People Agent (network intelligence) — see `tasks/AG-004.md`
- [ ] **AG-005** Decision Agent (decision file + tracking) — see `tasks/AG-005.md`
- [ ] **AG-006** Network Agent (warm intro suggestions) — see `tasks/AG-006.md`
- [ ] **AG-007** Wisdom Agent (cross-user patterns, DP-protected) — see `tasks/AG-007.md`

## Phase 5 — Action layer (week 6)

- [ ] **ACT-001** ActionExecutor (propose, approve, execute, revert) — see `tasks/ACT-001.md`
- [ ] **ACT-002** Approval UI (pending action panel) — see `tasks/ACT-002.md`
- [ ] **ACT-003** Audit log + viewer — see `tasks/ACT-003.md`
- [ ] **ACT-004** Permission rules engine (auto-approve patterns) — see `tasks/ACT-004.md`

## Phase 6 — Conversational UI (week 6-7)

- [ ] **UI-001** Chat workspace (streaming, tool calls visible) — see `tasks/UI-001.md`
- [ ] **UI-002** Sidebar: today, upcoming, network alerts — see `tasks/UI-002.md`
- [ ] **UI-003** Quick capture (cmd+K → voice/text → memory) — see `tasks/UI-003.md`
- [ ] **UI-004** Settings: privacy, integrations, personality — see `tasks/UI-004.md`

## Phase 7 — Voice always-on (week 7-8)

- [ ] **V-001** LiveKit room setup + voice agent worker — see `tasks/V-001.md`
- [ ] **V-002** Whisper streaming STT integration — see `tasks/V-002.md`
- [ ] **V-003** Cartesia TTS streaming — see `tasks/V-003.md`
- [ ] **V-004** Voice orchestrator (sub-600ms latency) — see `tasks/V-004.md`
- [ ] **V-005** Wake word + always-on opt-in — see `tasks/V-005.md`
- [ ] **V-006** Cross-device handoff (start on desktop, continue on phone) — see `tasks/V-006.md`

## Phase 8 — Predictive proactive engine (week 8-9)

- [ ] **P-001** Pattern detector (user behavior signals) — see `tasks/P-001.md`
- [ ] **P-002** Anticipation engine (cron + event-driven) — see `tasks/P-002.md`
- [ ] **P-003** Morning brief generator — see `tasks/P-003.md`
- [ ] **P-004** Meeting prep auto-trigger — see `tasks/P-004.md`
- [ ] **P-005** Network reach-out suggestions — see `tasks/P-005.md`
- [ ] **P-006** Email autopilot mode (rule-based + LLM) — see `tasks/P-006.md`

## Phase 9 — Cross-device sync (week 9)

- [ ] **CDS-001** Liveblocks integration (room per user) — see `tasks/CDS-001.md`
- [ ] **CDS-002** State machine for conversation continuity — see `tasks/CDS-002.md`
- [ ] **CDS-003** Notification fanout (push/email/SMS) — see `tasks/CDS-003.md`

## Phase 10 — Agent-to-agent protocol (week 10)

- [ ] **A2A-001** Protocol spec (auth, capability discovery, trust) — see `tasks/A2A-001.md`
- [ ] **A2A-002** Agent endpoint exposure (signed JSON-RPC) — see `tasks/A2A-002.md`
- [ ] **A2A-003** Negotiation primitives (proposals, counters, accept) — see `tasks/A2A-003.md`
- [ ] **A2A-004** First demo: agent-to-agent meeting scheduling — see `tasks/A2A-004.md`

## Phase 11 — Wisdom layer (week 10-11)

- [ ] **W-001** Anonymized event aggregation (DP-protected) — see `tasks/W-001.md`
- [ ] **W-002** Pattern miner (recurrent successful workflows) — see `tasks/W-002.md`
- [ ] **W-003** Wisdom retrieval API (per-user contextualized) — see `tasks/W-003.md`
- [ ] **W-004** Opt-in flow + transparency UI — see `tasks/W-004.md`

## Phase 13 — Live Meeting Agent (week 11-12)

> KILLER feature. Agent joins Zoom/Meet/Teams, takes structured notes, surfaces silent suggestions, generates full follow-up package after.

- [ ] **LM-001** Joiner abstraction (platform-agnostic interface) — see `tasks/LM-001.md`
- [ ] **LM-002** Google Meet integration (first concrete impl) — see `tasks/LM-002.md`
- [ ] **LM-003** Streaming STT + diarization pipeline — see `tasks/LM-003.md`
- [ ] **LM-004** LiveAnalyzer (real-time signals) — see `tasks/LM-004.md`
- [ ] **LM-005** SilentChannel (private user ↔ agent during call) — see `tasks/LM-005.md`
- [ ] **LM-006** Post-call synthesizer — see `tasks/LM-006.md`
- [ ] **LM-007** Consent UI + per-meeting opt-in — see `tasks/LM-007.md`
- [ ] **LM-008** macOS native overlay (scope only) — see `tasks/LM-008.md`

## Phase 14 — Focus Defense (week 12-13)

> Adversarial calendar layer. Defends executive's time from low-ROI meetings.

- [ ] **FD-001** ROIScorer engine — see `tasks/FD-001.md`
- [ ] **FD-002** Deep work guardian — see `tasks/FD-002.md`
- [ ] **FD-003** Load monitor + alerts — see `tasks/FD-003.md`
- [ ] **FD-004** Decline template composer — see `tasks/FD-004.md`
- [ ] **FD-005** Async migration proposer — see `tasks/FD-005.md`
- [ ] **FD-006** Recurring meeting auditor (quarterly) — see `tasks/FD-006.md`
- [ ] **FD-007** Settings UI — see `tasks/FD-007.md`

## Phase 15 — Wellbeing Signals (week 13-14)

> Detects overwork patterns. Protects user from burnout. The agent serves long-term wellbeing, not short-term throughput.

- [ ] **WB-001** SignalCollector (passive aggregation) — see `tasks/WB-001.md`
- [ ] **WB-002** BaselineEstimator (per-user 90d) — see `tasks/WB-002.md`
- [ ] **WB-003** Classifier (GREEN/YELLOW/ORANGE/RED) — see `tasks/WB-003.md`
- [ ] **WB-004** InterventionRouter (anti-nag logic) — see `tasks/WB-004.md`
- [ ] **WB-005** ConversationRunner (strict prompt eval) — see `tasks/WB-005.md`
- [ ] **WB-006** Settings UI + transparency view — see `tasks/WB-006.md`
- [ ] **WB-007** Privacy guarantees (encryption, RLS, lint rules) — see `tasks/WB-007.md`

## Phase 16 — Polish + launch prep (week 14-15)

- [ ] **L-001** Onboarding flow (5 min to value) — see `tasks/L-001.md`
- [ ] **L-002** Pricing + Stripe integration — see `tasks/L-002.md`
- [ ] **L-003** Marketing site — see `tasks/L-003.md`
- [ ] **L-004** Waitlist + invite codes — see `tasks/L-004.md`
- [ ] **L-005** SOC2 readiness checklist — see `tasks/L-005.md`
- [ ] **L-006** Performance audit (Lighthouse, voice latency, eval baseline) — see `tasks/L-006.md`

---

## Continuous tasks (always running, no priority order)

- [ ] **C-001** Weekly: review BLOCKERS.md, unblock or reassign
- [ ] **C-002** Daily: run regression eval, post results to docs/eval/
- [ ] **C-003** Weekly: review cost dashboard, optimize top spenders
- [ ] **C-004** Per release: update CHANGELOG.md
- [ ] **C-005** Per release: update DECISIONS.md if architecture changed

---

## Done log

(Empty initially. Claude Code moves completed tasks here with date.)
