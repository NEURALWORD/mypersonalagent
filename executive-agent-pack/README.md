# Executive Agent — Prompt Pack for Claude Code

Full autonomous-development pack for the Executive Agent product: an AI Chief of Staff for founders, CEOs, and partners. Persistent memory, agency, voice-native, predictive, privacy-first, with agent-to-agent protocol and DP-protected wisdom layer.

## What's in this folder

| File / folder | Purpose |
|---|---|
| `claude.md` | Operating manual for Claude Code. Read first, every session. |
| `RUNBOOK.md` | Environment setup, daily commands, recovery procedures. |
| `LOOP.md` | Kickoff prompts to paste into Claude Code (autonomous, resume, bugfix, eval review). |
| `BACKLOG.md` | Prioritized task queue. 12 phases, 70+ tasks. |
| `BLOCKERS.md` | Where Claude Code logs stuck tasks for human input. |
| `DECISIONS.md` | Architecture Decision Records. 10 ADRs initial. |
| `spec/` | 11 detailed feature specs (memory, agents, voice, proactive, wisdom, A2A, actions, evals, DB, env, AI router). |
| `tasks/` | 70+ atomic task files Claude Code executes one-by-one. |
| `prompts/` | Versioned LLM prompts (master, email, calendar, memory). |
| `eval/fixtures/` | Sample golden datasets for evaluation. |
| `.env.example` | All env vars needed. |

## How to use

### One-time setup (your machine)

```bash
# Prereqs: Node 22, pnpm 9, Docker, Claude Code CLI
npm install -g @anthropic-ai/claude-code
claude auth login

# Create new repo and copy this pack into it
mkdir executive-agent && cd executive-agent
cp -r /path/to/executive-agent-pack/* .
cp -r /path/to/executive-agent-pack/.env.example .env.example
git init && git add . && git commit -m "chore: bootstrap from prompt pack"
```

### Start the autonomous loop

```bash
cd executive-agent
claude
```

Inside the Claude Code session, paste the kickoff prompt from `LOOP.md`. Claude Code will:
1. Read `claude.md`, `RUNBOOK.md`, `BACKLOG.md`, `BLOCKERS.md`, `DECISIONS.md`.
2. Pick the top unblocked task.
3. Read its spec.
4. Implement with TDD.
5. Run `pnpm gate` (typecheck + lint + test + eval).
6. If green → commit + next task. If red → bugfix sub-loop (5 hypotheses) → unblock or log to BLOCKERS.md.

It will continue until 5 tasks are done or it hits a blocker.

### Recommended environment

After evaluation: **Claude Code in terminal as primary + VS Code as inspector**. Not Cursor (worse on multi-hour autonomous sessions). Details in `RUNBOOK.md`.

## Phase overview (12 phases, ~12 weeks of dev)

0. Foundations (week 1-2)
1. Memory layer (week 3)
2. AI router & cost guardrails (week 3-4)
3. Integrations: Gmail, GCal, LinkedIn (week 4-5)
4. Agents: master + 6 sub-agents (week 5-6)
5. Action layer with approval/revert (week 6)
6. Conversational UI + chat (week 6-7)
7. Voice always-on with sub-600ms latency (week 7-8)
8. Predictive proactive engine (week 8-9)
9. Cross-device sync (week 9)
10. Agent-to-agent protocol (week 10)
11. Wisdom layer with DP privacy (week 10-11)
12. Polish + launch (week 11-12)

## North-star metrics

Built into every spec. The product succeeds when these move:

- Time saved per user per day (target: 90+ min by month 3)
- Trust score (% of suggested actions user approves)
- Memory recall accuracy
- DAU/MAU > 0.6
- Cost per active user per month (target < $40 in inference)

## Revolutionary features included

- **Voice always-on + cross-device sync** (spec/voice.md, V-001..V-006, CDS-001..CDS-003)
- **Predictive proactive engine** (spec/proactive.md, P-001..P-006)
- **Agent-to-agent protocol** with Ed25519-signed JSON-RPC (spec/a2a-protocol.md, A2A-001..A2A-004)
- **Wisdom layer** with differential privacy (spec/wisdom.md, W-001..W-004)

Plus disruptive bonus features layered into the spec:

- Email autopilot mode (P-006)
- Decision intelligence with outcome tracking (AG-005)
- Network warm-intro engine (AG-006)
- User-voice modeling for email drafts (AG-002)

## Cost expectations

Built in:
- Per-user daily/monthly budget enforcement (default $3/day soft, $3.6/day hard)
- LLM router with model fallback chain + Redis cache + Anthropic prompt cache
- Cost tracking per call, per user, per agent in `ai_calls` table
- Eval suite runs ~$30/full nightly (~$1k/month)

Steady-state target: < $40 inference cost per active paying user per month.

## What this is not

- Not generated code. Just specs + tasks + prompts. Claude Code writes the code.
- Not a substitute for product judgment. You still review PRs, approve evals, set strategy.
- Not exhaustive. Some task files are concise — Claude Code reads the spec for full detail.

## Next steps for Manuel

1. Create the repo and copy this pack.
2. Provision external services (Postgres/Supabase, Anthropic API key, OpenAI, Clerk, Inngest, Upstash, Liveblocks, LiveKit, Langfuse, Sentry, PostHog, Cartesia, R2). Estimated $300-500/month at zero users.
3. Fill `.env.local` from `.env.example`.
4. Run `claude` in the repo and paste the kickoff prompt from `LOOP.md`.
5. Review each PR Claude Code opens. Squash-merge when satisfied.
6. After Phase 0 complete: run a full `pnpm dev`, verify the skeleton works.
7. After Phase 4 complete: invite first 5 design partners.
8. After Phase 12: closed beta launch.

## Support

- Claude Code stuck? Re-read `LOOP.md`. Use the resume or bugfix prompts.
- Architectural question? Check `DECISIONS.md`. If not there, decide and add an ADR.
- Found a bug in this pack itself? Edit it. The pack is yours.
