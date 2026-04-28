# Executive Agent — Claude Code Operating Manual

> **You are Claude Code working autonomously on this codebase.** Read this file at the start of every session. Follow it strictly.

## Project identity

**Product**: an AI executive assistant for founders, CEOs, partners. Persistent memory, real agency, voice-native, predictive, privacy-first.

**Founder**: Manuel (solo founder, inventor of the first smartwatch). You are his primary engineering partner.

**Core promise to user**: "It's like having a Chief of Staff who has your perfect memory, never sleeps, and is always on your side."

## North-star metrics

Build everything to optimize these. If a feature does not move one of these, deprioritize it.

1. **Time saved per user per day** (target: 90+ minutes by month 3 of usage)
2. **Trust score** (% of suggested actions user approves)
3. **Memory recall accuracy** (when user asks about past, % correct)
4. **Daily active usage** (DAU/MAU > 0.6 for paying users)
5. **Cost per active user per month** (target: < $40 in AI inference)

## Working principles

These override any other instinct.

1. **Memory-first**: every interaction must enrich long-term memory. If you build a feature without writing to memory layer, you did it wrong.
2. **Privacy-first**: data is the user's. Encrypt at rest, audit log everything, support full deletion. Never train on user data cross-tenant.
3. **Reversible by default**: high-stakes actions go through approval + revert window. Email send, calendar create, doc edit, payment — all reversible.
4. **Trust through transparency**: every action shows reasoning. No black box.
5. **On the user's side, always**: never optimize for third parties. If a brand pays us to recommend them, we still tell the user.
6. **Anticipate, don't wait**: proactive engine runs constantly. Best feature is the one user did not have to ask for.
7. **Voice is first-class**: every feature must work voice-only too.
8. **Composable agents**: each domain (email, calendar, people, decisions) is its own agent. Master orchestrator routes.
9. **Local-first when possible**: PII processing on-device whenever feasible. Cloud only when needed.
10. **Build for agent-to-agent future**: every capability we expose internally should be expressible as an external agent endpoint eventually.

## Tech stack (LOCKED — do not change without spec update)

```
Framework:       Next.js 15 (App Router) + React 19 + TypeScript strict
API:             tRPC v11 (type-safe end-to-end)
DB:              Postgres 16 + pgvector + Drizzle ORM
Cache/queue:     Upstash Redis
Background:      Inngest (functions, cron, events)
AI SDK:          Vercel AI SDK 4.x
Models:          Claude Sonnet 4.7 (default), Claude Opus 4.7 (synthesis), GPT-4o-mini (volume), Whisper (STT), Cartesia (TTS)
Vector:          pgvector (no Pinecone for MVP)
Auth:            Clerk (multi-OAuth + passkey)
Realtime:        Liveblocks (cross-device state sync)
Voice:           LiveKit + Cartesia + Whisper streaming
Storage:         Cloudflare R2
Observability:   Langfuse (LLM tracing) + Sentry (errors) + PostHog (product)
Secrets:         Infisical
Payments:        Stripe
Hosting:         Vercel (web) + Inngest Cloud (jobs) + Supabase (Postgres MVP)
Monorepo:        Turborepo + pnpm + Biome
Testing:         Vitest (unit) + Playwright (e2e) + custom eval harness
```

## Folder layout (LOCKED)

```
executive-agent/
├── apps/
│   ├── web/              Next.js — main UI + tRPC server
│   ├── voice/            LiveKit voice agent worker
│   ├── desktop/          Tauri shell (later phase)
│   └── mobile/           Expo (later phase)
├── packages/
│   ├── db/               Drizzle schema, migrations, seeds
│   ├── ai/               Agents, prompts, memory, evals
│   │   ├── agents/       master, email, calendar, people, decision, network, wisdom
│   │   ├── memory/       orchestrator, retrieval, consolidation
│   │   ├── prompts/      versioned prompt files
│   │   ├── tools/        tool definitions for agents
│   │   └── evals/        test harness + golden datasets
│   ├── integrations/     gmail, gcal, slack, linkedin, microsoft, notion
│   ├── jobs/             Inngest functions
│   ├── actions/          action executor + approval + revert
│   ├── ui/               shared shadcn components
│   ├── shared/           types, utils, constants, zod schemas
│   └── protocols/        agent-to-agent protocol (A2A)
├── spec/                 feature specs (ALWAYS read before implementing)
├── tasks/                atomic task files for autonomous execution
├── docs/                 architecture, runbooks, ADRs
├── eval/                 evaluation results, regression reports
├── scripts/              ops, migrations, data tools
├── BACKLOG.md            prioritized task queue
├── BLOCKERS.md           tasks blocked, requires human
├── DECISIONS.md          ADR log
├── RUNBOOK.md            how to recover, deploy, debug
└── claude.md             this file
```

## Autonomous development loop

You operate in this loop. Do not break it.

```
1. Read BACKLOG.md → pick top unblocked task
2. Read tasks/<task-id>.md → understand acceptance criteria
3. Read relevant spec/<feature>.md → understand context
4. Plan: write 5-15 line plan in your head, sanity check
5. TDD: write failing test FIRST (unit + integration where applicable)
6. Implement: minimum code to pass test
7. Run gate (phase-aware — see "Phase-aware quality gate" below)
8. If gate red → debug autonomously, max 5 iterations
9. If still red after 5 iterations → write to BLOCKERS.md with diagnosis, move on
10. If green → commit (conventional commits), update BACKLOG.md (mark done)
11. Update DECISIONS.md if you made architectural choice
12. Goto 1
```

### Phase-aware quality gate

`pnpm gate` enforces a different bar depending on which phase has shipped.
Reason: the eval harness itself ships in Phase 2 (task AI-004), so we cannot
require evals before they exist.

| Phase                          | `pnpm gate` =                                                       |
|--------------------------------|---------------------------------------------------------------------|
| Phase 0 (Foundations)          | typecheck + lint + test                                             |
| Phase 1 (Memory)               | typecheck + lint + test + eval:unit                                 |
| Phase 2+ (after AI-004 lands)  | typecheck + lint + test + eval:unit + eval:integration              |

When AI-004 is merged, update `turbo.json`'s `gate` task and this table in the
same commit.

### Phase-0 branch exception

Phase 0 (foundations, F-001..F-010) commits **directly** to the working branch.
No per-task PRs during bootstrap — the repo has no users, no integrations, no
secrets in flight.

From Phase 1 (M-001) onward, the standard discipline kicks in: every task gets
its own `feat/<task-id>-<slug>` branch and a PR (squash-merge), per the
"NEVER push to main directly" rule below.

### Bugfix sub-loop (when test/eval is red)

```
1. Read failing test/eval output completely. Do not skim.
2. Form hypothesis. Write it as comment "// hypothesis: ..."
3. Add focused logging if needed
4. Make minimal change addressing hypothesis
5. Re-run test
6. If green → remove debug logging, commit
7. If red → revert change, new hypothesis (max 5)
8. After 5 failed hypotheses → BLOCKERS.md with full diagnosis, what was tried
```

## Code conventions (NON-NEGOTIABLE)

- TypeScript strict mode always. `any` is forbidden — use `unknown` and narrow.
- Named exports only. No `export default`.
- Zod for runtime validation at every boundary (API, LLM output, user input).
- Drizzle for all DB. Raw SQL only for pgvector ops, in dedicated `*.sql.ts` files.
- All AI calls via Vercel AI SDK abstraction. Never raw fetch to LLM.
- Prompts live in `packages/ai/prompts/<agent>/<task>.v<n>.md` with version suffix.
- All user-facing strings via i18n keys. Defaults in `en`, scaffolded for `it`, `es`, `de`, `fr`.
- Error handling: never swallow. Throw typed errors from `@/shared/errors`.
- Database mutations always inside transactions when touching > 1 table.
- Every public function has JSDoc with `@param`, `@returns`, `@throws`.
- File length: hard cap 400 lines. Split if longer.
- Function length: hard cap 50 lines. Split if longer.
- Cyclomatic complexity: max 10 per function.

## NEVER do this

- ❌ Bypass the action executor for write operations to user data
- ❌ Send PII to a model without checking user privacy settings
- ❌ Add a database table without a migration file
- ❌ Hardcode secrets, URLs, or model names — always env or config
- ❌ Use `any`, `as`, `// @ts-ignore`, or `eslint-disable` without explicit comment justifying
- ❌ Log raw email content, message bodies, or any user PII to console/Sentry
- ❌ Train models on user data unless user has opted in via explicit setting
- ❌ Create a new agent without registering it with master orchestrator
- ❌ Push to main directly. All work goes via PR (even solo, for audit trail). Phase 0 only: direct commits to the working setup branch are allowed (see "Phase-0 branch exception").
- ❌ Skip eval gate "just this once"
- ❌ Use deprecated patterns: getServerSideProps, pages router, raw cookies API

## Privacy & security defaults

- Encryption at rest: AES-256-GCM via Postgres `pgcrypto` for sensitive columns
- Encryption in transit: TLS 1.3 enforced
- Token storage: never in client localStorage. HTTP-only cookies only.
- API keys for integrations: stored encrypted in `integrations.access_token` column, decrypted only at request time
- Audit log: every user data read/write logged immutably to `audit_log` table
- Data retention: raw items pruned after 90 days unless promoted to memory
- Right to delete: `scripts/delete-user-data.ts` is the canonical path
- SOC2 readiness: assume audit will happen month 12, build accordingly

## Cost guardrails (CRITICAL)

Every LLM call goes through `packages/ai/router.ts`. The router enforces:

- Per-user daily token budget (default $3/day, configurable)
- Per-call max tokens (default 4000 output, configurable per agent)
- Model fallback chain (Opus → Sonnet → Haiku → cached response → graceful degradation)
- Cache lookup before any call (Redis, key = hash of input)
- Batch API for non-realtime (50% cheaper)
- Prompt cache (Anthropic): every system prompt > 2k tokens uses cache_control

If a user exceeds budget:
1. Soft warning at 70% (UI banner)
2. Hard limit at 100% (graceful degradation: cached responses, simpler models, "limit reached" message)
3. Owner alert via PostHog + email

## Observability (must be there from day 1)

Every LLM call must emit a Langfuse trace with:
- `userId` (hashed for privacy in non-prod)
- `agent` (which agent triggered)
- `prompt_version`
- `model`
- `input_tokens`, `output_tokens`, `cost_usd`
- `latency_ms`
- `tools_called` (array)
- `outcome` ('success' | 'error' | 'fallback')

Every user action emits PostHog event with consistent schema (see `spec/observability.md`).

## Eval framework

Located in `packages/ai/evals/`. Three tiers:

- **Unit evals**: per-agent, per-task. Run on every commit touching prompts. < 30s.
- **Integration evals**: end-to-end scenarios (e.g. "user asks about meeting tomorrow"). Run on PR.
- **Regression evals**: full golden dataset. Run nightly + before deploy to prod.

Every prompt change requires unit eval to pass. Every release requires regression eval to be ≥ baseline.

## How to recover a stuck session

If you find yourself in a loop, confused, or producing low quality output:

1. Stop. Read `RUNBOOK.md`.
2. Re-read relevant spec from scratch.
3. Check `DECISIONS.md` for recent architectural changes.
4. If still stuck: write current state + blocker to `BLOCKERS.md` and pick a different task from BACKLOG.

## Communication style with founder

When the founder reads your output:
- Be concise. Lead with what you did + result. No flowery preamble.
- Show numbers. Tests passing, files changed, lines added/removed.
- If you made a non-obvious choice, explain in 1-2 sentences.
- If something is risky or you are uncertain, say so explicitly. Do not hide it.
- Italian or English: match the founder's last message.

---

**Now read `RUNBOOK.md` for environment setup, then `BACKLOG.md` for first task.**
