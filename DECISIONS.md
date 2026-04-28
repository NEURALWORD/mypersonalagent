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
