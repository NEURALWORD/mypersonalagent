# DECISIONS — Architecture Decision Records

> Each significant architectural choice has an entry. Append-only. If superseded, reference the new ADR.

## Format

```
## ADR-NNN — Title — YYYY-MM-DD

**Context**: what situation/problem motivates this decision
**Decision**: what we chose
**Alternatives considered**: what else was on the table
**Consequences**: tradeoffs accepted, things now harder/easier
**Status**: proposed / accepted / superseded by ADR-NNN
```

---

## ADR-001 — Single-tenant Postgres + pgvector instead of Pinecone — 2026-04-28

**Context**: Need vector store for memory layer.
**Decision**: Use Postgres 16 with pgvector extension. Single DB for relational + vector.
**Alternatives considered**: Pinecone, Weaviate, Qdrant.
**Consequences**: simpler ops, lower cost at low scale, fewer moving parts. Will need to revisit at >10M memory rows per user (probably year 3+).
**Status**: accepted

## ADR-002 — Anthropic Claude as default model — 2026-04-28

**Context**: Need primary LLM for reasoning + agent orchestration.
**Decision**: Claude Sonnet 4.7 default; Opus 4.7 for synthesis-heavy tasks; OpenAI GPT-4o-mini for high-volume classification.
**Alternatives considered**: OpenAI GPT-4 only; Gemini 2; mix of self-hosted + frontier.
**Consequences**: tight coupling to Anthropic API; mitigated by router abstraction enabling fallback. Excellent reasoning for assistant-style tasks. Cost slightly higher than mini-tier.
**Status**: accepted

## ADR-003 — Inngest for background jobs instead of Temporal — 2026-04-28

**Context**: Need durable background workflows for ingestion, jobs, agents.
**Decision**: Inngest Cloud.
**Alternatives considered**: Temporal Cloud, BullMQ, custom on Postgres.
**Consequences**: simpler DX, well integrated with Next.js, good observability. Less control than Temporal for very complex sagas (acceptable for MVP).
**Status**: accepted

## ADR-004 — Liveblocks for cross-device sync — 2026-04-28

**Context**: Need real-time conversation continuity across web/mobile/desktop.
**Decision**: Liveblocks rooms per user.
**Alternatives considered**: Yjs self-hosted, Replicache, custom WebSocket layer.
**Consequences**: managed service cost; faster to ship; well-supported CRDT semantics.
**Status**: accepted

## ADR-005 — LiveKit + Cartesia + Whisper for voice — 2026-04-28

**Context**: Need sub-600ms voice loop with interruption handling.
**Decision**: LiveKit for transport + room management; Whisper streaming for STT; Cartesia for TTS.
**Alternatives considered**: OpenAI Realtime API; ElevenLabs streaming; custom WebRTC.
**Consequences**: best in class latency at this point; some vendor risk; clean separation lets us swap individual components.
**Status**: accepted

## ADR-006 — Drizzle ORM over Prisma — 2026-04-28

**Context**: Need type-safe ORM for Postgres.
**Decision**: Drizzle ORM.
**Alternatives considered**: Prisma, Kysely.
**Consequences**: lighter, closer to SQL, better with Claude Code's coding style. Less mature studio compared to Prisma.
**Status**: accepted

## ADR-007 — pgvector HNSW index for similarity search — 2026-04-28

**Context**: Need fast nearest-neighbor on embeddings.
**Decision**: HNSW with vector_cosine_ops, m=16, ef_construction=64.
**Alternatives considered**: IVFFlat, brute force.
**Consequences**: better recall than IVFFlat at scale; slightly higher build time. Good defaults will need tuning at >1M rows.
**Status**: accepted

## ADR-008 — Differential privacy for wisdom layer — 2026-04-28

**Context**: Need to share patterns across users without leaking individual data.
**Decision**: Apply ε-differential privacy (ε=1.0) at aggregation step. No raw cross-user data ever read by per-user agents.
**Alternatives considered**: federated learning, k-anonymity only, full opt-out.
**Consequences**: some accuracy loss in patterns; strong privacy guarantee; opt-in by default; meets regulatory expectation.
**Status**: accepted

## ADR-009 — Agent-to-agent protocol on signed JSON-RPC over HTTPS — 2026-04-28

**Context**: Need protocol for our agent to talk to other agents.
**Decision**: JSON-RPC 2.0 over HTTPS with Ed25519-signed payloads + DID-based identity. Capability discovery via well-known endpoint.
**Alternatives considered**: gRPC, MCP transport, custom WebSocket.
**Consequences**: easier to debug, broader compatibility, cryptographic trust without central authority.
**Status**: accepted

## ADR-010 — Multi-stage approval for actions — 2026-04-28

**Context**: Agent needs to perform real-world actions safely.
**Decision**: All actions go through `propose → (auto-approve | user-approve) → execute → revert-window`.
**Alternatives considered**: trust model based on action type only; full autonomy after onboarding.
**Consequences**: more friction early, builds trust over time, every action reversible within window.
**Status**: accepted

---

## ADR-011 — Live Meeting Agent ships in Phase 13 (post core MVP)

**Date**: 2026-04-28
**Status**: Accepted

### Context
Live Meeting Agent (joining Zoom/Meet during call) is the most differentiated and "wow" feature, but also the most legally risky (recording consent across jurisdictions) and the most likely to contaminate brand if mishandled. Post-MVP placement gives 4-6 weeks of operational maturity in core memory + agency before adding real-time meeting capture.

### Decision
- Phase 13, after voice + proactive + cross-device sync
- First platform: Google Meet (cleanest API, lowest friction)
- Privacy as a hard architectural invariant (zero raw audio retention, transcripts user-only, per-meeting opt-in)
- Two-party-consent jurisdictions handled with leave-on-decline behavior
- macOS native overlay scoped but deferred to Phase 17+

### Consequences
- Pro: launch with stable core; differentiation feature comes when product can support it
- Pro: less legal exposure during fragile early-user period
- Con: lose some marketing moment (this is a big "demo day" feature)
- Mitigation: tease in landing page from day 1, ship to design partners early in Phase 13

---

## ADR-012 — Focus Defense as core feature, not premium add-on

**Date**: 2026-04-28
**Status**: Accepted

### Context
Calendar protection (decline templates, deep work blocks, ROI scoring) could be a paid-tier-only feature, but it's also the philosophical core of the product: "agent is on your side, defends your time".

### Decision
Focus Defense ships in core tier, not premium. The product positioning depends on it.

### Consequences
- Pro: clear differentiation vs all other AI assistants ("ours says no for you")
- Pro: makes the agent feel actively helpful, not just responsive
- Con: harder to upsell to premium (need other premium hooks like Live Meeting)
- Mitigation: Live Meeting + advanced decision intelligence + voice priority lanes are premium hooks

---

## ADR-013 — Wellbeing Signals: opt-in v1, opt-out v2

**Date**: 2026-04-28
**Status**: Accepted

### Context
Wellbeing layer (burnout detection, recovery suggestions) is potentially the most loved feature OR the most resented one, depending on tone. Default-on risks early user revolt; default-off risks no one ever finding it.

### Decision
- v1: opt-in only, default off. Surface via onboarding question + settings.
- Gather 3 months of design partner feedback on tone calibration
- v2: based on data, consider default-on with one-message intro the first time it surfaces a YELLOW

### Consequences
- Pro: reduces risk of "creepy" perception during fragile early period
- Pro: tone can be calibrated against real user feedback before scale
- Con: lower discovery, fewer users see one of the most differentiated features
- Mitigation: compelling onboarding question that earns the opt-in, clear privacy commitments page

---

## ADR-014 — Wellbeing data is structurally excluded from wisdom layer

**Date**: 2026-04-28
**Status**: Accepted

### Context
Wisdom layer learns cross-user patterns to improve recommendations. Wellbeing signals (working hours, burnout indicators) would be highly valuable training signal — and absolutely poisonous if mishandled or leaked.

### Decision
Wellbeing signals are **structurally excluded** from any cross-user aggregation:
1. Per-user encryption keys (cannot be aggregated cryptographically)
2. Lint rule prevents column inclusion in wisdom code
3. Runtime assertion in wisdom aggregator panics if any wellbeing column appears
4. Public commitment in privacy page

### Consequences
- Pro: hard structural guarantee, not just policy
- Pro: builds trust for the most sensitive layer
- Con: loses potentially valuable training signal for wisdom layer
- Acceptable: trust > data utility on this dimension

---

## ADR-015 — Phase-aware quality gate — 2026-04-28

**Context**: `claude.md` originally specified `pnpm gate` = typecheck + lint + test + eval, but the eval harness itself ships in Phase 2 (task AI-004). A literal reading would block every Phase 0 / Phase 1 task because `pnpm eval:relevant` does not exist yet.
**Decision**: `pnpm gate` is phase-aware:
- Phase 0 (Foundations): typecheck + lint + test
- Phase 1 (Memory): + eval:unit
- Phase 2+ (after AI-004 lands): + eval:integration
The implementation is `pnpm typecheck && pnpm lint && pnpm test` at root for now; the eval steps are appended in the same commit that lands AI-004.
**Alternatives considered**: stub a no-op `pnpm eval` from day 1 (hides regressions later); hard-block Phase 0 tasks until evals exist (deadlock).
**Consequences**: explicit table in `claude.md` and `LOOP.md` so future sessions don't read the original "always eval" rule as absolute. One source of drift to keep in sync as phases ship.
**Status**: accepted

## ADR-016 — Phase-0 commits to working setup branch (not per-task PR) — 2026-04-28

**Context**: `claude.md` mandates `feat/<task-id>-<slug>` + PR for every task. During Phase 0 (F-001..F-010) the repo has no users, no integrations, no secrets in flight, and the branch protection benefit is purely audit-trail.
**Decision**: Phase 0 commits directly to the working setup branch (`claude/avvia-setup-w4m0N`). From Phase 1 (M-001) onward, the standard `feat/` + PR discipline is mandatory.
**Alternatives considered**: open 10 trivial PRs for F-001..F-010 (10× ceremony, no review value); skip the per-task PR rule globally (loses real protection once integrations land).
**Consequences**: scoped, reversible exception. Documented in both `claude.md` and `LOOP.md`. Risk is small because the Phase-0 commits are pure scaffolding with green gates.
**Status**: accepted (auto-expires when M-001 starts)

## ADR-017 — Workspace packages consume TypeScript sources directly — 2026-04-28

**Context**: A workspace package can be consumed via either built `dist/*.js` artefacts or its raw `src/*.ts` sources. With Vercel AI SDK + Next.js + vitest, every consumer already has a TS-aware bundler.
**Decision**: Internal `@exec/*` packages expose `src/index.ts` directly via the `exports`/`main`/`types` fields. No build step in dev. Imports use extensionless paths (`./errors` not `./errors.ts`); TS Bundler module resolution + vitest resolver both handle this. We can add `tsup`/`tsc -b` later for any package that needs to be published externally.
**Alternatives considered**: build to `dist/` per package (extra `pnpm build` step, slower iteration, more cache invalidation); use `.ts` extensions in imports + `allowImportingTsExtensions` (works but locks every package to `noEmit`).
**Consequences**: zero build step for internal packages; faster CI. Any package that ever needs publishing will need a build step added. `pnpm typecheck` per package validates compilation soundness without emit.
**Status**: accepted

## ADR-018 — Env vars parsed via function, not module-load side effect — 2026-04-28

**Context**: `tasks/F-004.md` snippet exports `const env = schema.parse(process.env)` at module top level. In a monorepo where `@exec/shared` is imported by typecheck tools, tests, scripts, and apps, this would explode any context where the full prod env is not present.
**Decision**: `packages/shared/src/env.ts` exports `envSchema` and a `parseEnv(source = process.env)` function. Apps call `parseEnv()` once at boot (still "fail fast" semantics). Tests construct fixture envs and pass them to `parseEnv()` for full coverage.
**Alternatives considered**: lazy proxy on `env` (works but obscures the failure point); separate `env.runtime.ts` with the parse and `env.schema.ts` for the schema (extra file, same outcome).
**Consequences**: importing `@exec/shared` is safe in any context. Apps must explicitly call `parseEnv()` at startup — a small, testable line of code rather than an invisible side effect.
**Status**: accepted

## ADR-019 — pnpm 10 (not 9) as the project package manager — 2026-04-28

**Context**: `RUNBOOK.md` and the F-001 spec call for pnpm 9.x. Node 22's Corepack ships pnpm 10.x.
**Decision**: Pin `packageManager: "pnpm@10.33.0"` in root `package.json`. Update `RUNBOOK.md` to reflect pnpm 10 when next touched.
**Alternatives considered**: install pnpm 9 globally (fights Corepack); drop the version pin (drift across machines).
**Consequences**: workspace lockfile uses pnpm 10 format. Marginal compat risk for any tool that hard-codes pnpm 9 — none known today. Future devs get the pinned version automatically via Corepack.
**Status**: accepted

## ADR-020 — External services use env-driven real-or-mock pattern — 2026-04-28

**Context**: Phase-0 wires Clerk auth, Inngest jobs, Langfuse, Sentry, PostHog. Each requires a real account + secret to function. Provisioning all of them before code lands blocks development; landing code that crashes without keys blocks every local dev session and the autonomous loop.
**Decision**: Every external-service client lives behind a single `providerFactory` utility in `packages/shared`. The factory inspects an env-derived "key" and returns one of:
1. **Real client** when the secret is present and well-formed → SDK is constructed normally.
2. **Mock client** when the secret is absent/empty → returns a deterministic, side-effect-light stub (logs to stdout in dev, no-ops in `test`/`production`-without-key).

Production refuses to start without real keys: the env validator (`parseEnv`) treats the relevant secrets as required when `NODE_ENV === 'production'` and optional otherwise. This guards against accidental "we shipped with mocks" deploys.

For Clerk specifically: a `MockAuthProvider` returns a stub user `{ id: 'usr_dev', email: 'dev@local.test' }` so downstream tRPC procedures and React server components can be exercised without a real auth flow. Real Clerk is wired at staging deploy time.

**Alternatives considered**: hard-fail on missing keys (blocks every offline dev session); silent no-op clients (hides "I forgot to set this in prod" until users notice); per-service ad-hoc handling (drift across services).
**Consequences**:
- ✓ One pattern, one place: `providerFactory` is the single point that decides real vs mock.
- ✓ Tests are deterministic — they always get the mock unless they explicitly opt into a real client.
- ✓ Production still fails fast on misconfiguration (via env validator, not a runtime null deref).
- ✗ Mock clients must be kept in rough behavioural sync with the real SDKs — drift is a maintenance tax. Mitigated by keeping mocks minimal and hand-rolled, not auto-generated.
**Status**: accepted
