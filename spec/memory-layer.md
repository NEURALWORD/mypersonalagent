# Spec — Memory Layer

> The single most important system in the product. Read carefully.

## Goal

Provide the agent with persistent, deep memory of the user's life and work — across years. Memory must be retrievable in <200ms, deduplicated, confidence-weighted, and privacy-respecting.

## Non-goals

- Not a vector DB only. Combine semantic + graph + temporal + procedural memory.
- Not a chat history store. That is the `messages` table. Memory is an interpretation layer above raw data.

## Memory types

| Type | Description | Example |
|---|---|---|
| `episodic` | Specific events with time + place | "Dinner with Marco in Milan on March 14, 2026" |
| `semantic` | Generalized facts | "Marco prefers vegetarian restaurants" |
| `procedural` | How user does things | "When booking flights, always pick window seat" |
| `preference` | Stated or inferred user preferences | "User prefers concise email replies" |
| `relationship` | About a person/entity in user's network | "Anna is CEO of Acme, last spoke about funding" |
| `decision` | Past decisions + outcomes | "Decided to hire Bob over Alice in Q1, outcome: positive" |

## Architecture

```
                 ┌────────────────────────┐
                 │   MemoryOrchestrator   │
                 └─┬─────────┬─────────┬─┘
                   │         │         │
        ┌──────────▼─┐  ┌────▼────┐  ┌─▼──────────┐
        │ Vector DB  │  │  Graph  │  │ Temporal   │
        │ (pgvector) │  │ (PG)    │  │ (PG ts)    │
        └────────────┘  └─────────┘  └────────────┘
                   ▲         ▲         ▲
                   └─────────┼─────────┘
                             │
                   ┌─────────▼─────────┐
                   │  Memory Writer    │ (dedup, embed, link)
                   └─────────▲─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
        ┌─────▼────┐   ┌─────▼─────┐  ┌────▼─────┐
        │ Email    │   │ Calendar  │  │ User chat│
        │ ingester │   │ ingester  │  │  signal  │
        └──────────┘   └───────────┘  └──────────┘
```

## Data model (relevant tables)

```typescript
entities {
  id, userId, type, name, attributes(jsonb), embedding(vector),
  importance(int), lastInteraction(ts), createdAt
}

relationships {
  id, userId, fromEntityId, toEntityId, type, strength, metadata
}

memories {
  id, userId, type, content, source(jsonb), entities(jsonb array),
  embedding(vector), confidence(int 0-100), createdAt, expiresAt,
  consolidatedFrom(uuid array, optional)
}

memory_links {
  fromMemoryId, toMemoryId, linkType ('contradicts'|'supports'|'extends')
}
```

## Operations

### `recall(query, options)` — read

```typescript
type RecallOptions = {
  limit?: number;          // default 20
  types?: MemoryType[];
  entityFilter?: string[]; // restrict to memories tagged with these entities
  timeWindow?: { from?: Date; to?: Date };
  minConfidence?: number;  // default 30
};

async recall(query: string, options?: RecallOptions): Promise<RecalledMemory[]>
```

**Algorithm:**

1. Embed query (text-embedding-3-small, 1536d).
2. Semantic search on `memories.embedding` with cosine distance, limit*3 results.
3. Extract entity mentions from query (NER + name match against user's entities).
4. If entities found → graph expansion (1-hop neighbors), include their recent memories.
5. Re-rank with score = `0.55 * semantic_sim + 0.20 * recency + 0.15 * confidence + 0.10 * importance`.
6. Apply filters (types, entityFilter, timeWindow, minConfidence).
7. Return top `limit` with `score`, `source` provenance, `relatedEntities`.

**Performance budget**: < 200ms p95 with 100k memories per user.

**Caching**: Redis cache key = `recall:{userHash}:{queryHash}:{optionsHash}` with 60s TTL. Invalidated on `remember()`.

### `remember(input)` — write

```typescript
type RememberInput = {
  content: string;
  type: MemoryType;
  source: { type: 'email' | 'calendar' | 'conversation' | 'document' | 'inferred'; id: string; ts: Date };
  entities?: string[];      // entity IDs
  confidence?: number;      // default 80
  expiresAt?: Date;         // for low-confidence ephemeral
};

async remember(input: RememberInput): Promise<Memory>
```

**Algorithm:**

1. Embed `content`.
2. Find near-duplicate: query memories WHERE userId AND cosine_sim > 0.95.
3. If found:
   - If new source provides corroboration → confidence += 5 (cap 100).
   - If new content is more specific → replace content, link old as superseded.
   - If contradicts → create new memory with `memory_links` of type 'contradicts', do not delete old (audit).
4. Else → insert new.
5. Update entity `lastInteraction` for tagged entities.
6. Recompute `importance` for involved entities (exponential moving average).
7. Invalidate Redis cache for user.
8. Emit Inngest event `memory.created` for downstream (consolidation, eval).

**Idempotency**: same content + same source + same ts → no-op (return existing).

### `consolidate()` — nightly

Run as Inngest cron at 03:00 user-local time (per-user scheduling).

1. Find clusters of episodic memories about same entity within 30 days.
2. Use Claude Sonnet to generate semantic summary.
3. Create new `semantic` memory with `consolidatedFrom = [...episodic ids]`.
4. Mark episodic memories as `consolidated_at`, but keep them (for drill-down).
5. Drop expired memories (`expiresAt < now`).
6. Recompute importance scores for top 100 entities.

### `forget(input)` — explicit user-driven deletion

```typescript
type ForgetInput =
  | { type: 'memory'; id: string }
  | { type: 'entity'; id: string; cascade?: boolean }
  | { type: 'topic'; query: string };  // semantic, with confirmation
```

Hard delete + audit log entry. For 'topic', return matching memories first for user confirmation.

## Confidence model

- `100`: user-stated explicitly ("I prefer X")
- `80-99`: inferred with high evidence (recurrent in emails)
- `50-79`: single-source inference
- `30-49`: speculative, needs confirmation
- `<30`: filter out by default

Confidence decays over time: 1% per 90 days for `episodic`, no decay for `procedural` and `preference`.

## Importance model

Per entity:
```
importance = 0.4 * log(interaction_count + 1)
           + 0.3 * recency_score(last_interaction)
           + 0.2 * graph_centrality(entity)
           + 0.1 * user_pinned ? 1 : 0
```

Recomputed nightly.

## Privacy

- All embeddings computed via OpenAI; raw content never sent to third parties beyond LLM providers under DPA.
- `forget()` cascades to: memories, entities (if `cascade=true`), audit log retains tombstone with operation but no content.
- Cross-user wisdom layer reads only DP-aggregated views, never raw memories. Enforced at SQL level via row-level policies.

## Evaluation

Golden dataset: 200 (query, expected_memory_id, irrelevant_memory_ids) tuples, hand-curated.

Metrics:
- **Recall@5**: was the right memory in top 5? (target ≥ 0.85)
- **Precision@5**: of top 5, how many relevant? (target ≥ 0.70)
- **Latency p95**: ≤ 200ms
- **Dedup precision**: of dedup decisions, how many correct? (target ≥ 0.95, false-merge is more costly than miss)

Run on every PR touching `packages/ai/memory/` or related prompts.

## Failure modes & fallbacks

| Failure | Behavior |
|---|---|
| pgvector slow query (>500ms) | Log to Sentry, return cached if available, else degrade to keyword search via Postgres FTS |
| Embedding API down | Queue write, mark memory as `pending_embed`, retry via Inngest |
| Dedup ambiguity (sim 0.93–0.97) | Insert as new, link via `memory_links.type='potential_duplicate'`, surface in nightly review |
| Memory store fills (>1M per user) | Auto-consolidate aggressively, drop episodic >2y with confidence <50 |

## Open questions for founder

(Populate as discovered. Use BLOCKERS.md.)

- Should procedural memories ever be auto-applied without user confirmation? (default: no)
- Retention default for raw `email` source memories: 1 year? indefinite? user-configurable.
