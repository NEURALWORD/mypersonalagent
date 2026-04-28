# Spec — Database Schema

> Postgres 16 + pgvector. Drizzle ORM. All migrations in `packages/db/migrations/`.

## Conventions

- All `id` columns: `uuid` defaultRandom
- Timestamps: `timestamp` with `defaultNow()` for `createdAt`
- All user-scoped tables: `userId uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE`
- JSON columns: `jsonb` with typed `$type<T>()` from Drizzle
- Vector columns: `vector(1536)` (text-embedding-3-small dimension)
- Indexes: HNSW on vectors, B-tree on userId + frequent filters

## Tables

### Users & accounts

```typescript
users {
  id, email(unique), name, timezone, locale,
  preferences(jsonb), agentName(default='Atlas'), agentVoiceId,
  wisdomOptIn(bool default false),
  cohortAttributes(jsonb),  // {role, stage, team_size_bucket, ...}
  createdAt, deletedAt
}

integrations {
  id, userId, provider('gmail'|'gcal'|'slack'|...),
  accessToken(encrypted), refreshToken(encrypted), expiresAt,
  scopes(jsonb), metadata(jsonb), status('active'|'expired'|'revoked'),
  createdAt, lastSyncAt
}

privacy_settings {
  userId(pk), retentionDaysRaw(default 90), retentionDaysMemory(null=indefinite),
  trainingOptIn(bool default false), wisdomOptIn(bool default false),
  alwaysOnVoice(bool default false), proactiveLevel('high'|'medium'|'low'|'off'),
  shareLocation(bool default false)
}
```

### Memory layer

```typescript
entities {
  id, userId, type('person'|'company'|'project'|'topic'|'place'),
  name, attributes(jsonb), embedding(vector 1536),
  importance(int default 0), lastInteraction(ts),
  createdAt, deletedAt
  -- index: (userId), HNSW(embedding)
}

relationships {
  id, userId, fromEntityId, toEntityId, type, strength(int default 1),
  metadata(jsonb), createdAt
  -- index: (userId, fromEntityId), (userId, toEntityId)
}

memories {
  id, userId, type('episodic'|'semantic'|'procedural'|'preference'|'relationship'|'decision'),
  content, source(jsonb), entities(jsonb array),
  embedding(vector 1536), confidence(int default 80),
  importance(int default 0), consolidatedFrom(uuid array),
  createdAt, expiresAt, supersededBy(uuid)
  -- index: (userId, type), HNSW(embedding), (userId, createdAt)
}

memory_links {
  id, fromMemoryId, toMemoryId,
  linkType('contradicts'|'supports'|'extends'|'duplicate_candidate'|'consolidates'),
  createdAt
}

raw_items {
  id, userId, source('gmail'|'gcal'|'slack'|...), externalId,
  payload(jsonb), processedAt, createdAt
  -- unique: (source, externalId)
  -- index: (userId, processedAt)
}
```

### Conversations & messages

```typescript
conversations {
  id, userId, title, modality('text'|'voice'|'mixed'),
  metadata(jsonb), archivedAt, createdAt
}

messages {
  id, conversationId, role('user'|'assistant'|'tool'|'system'),
  content(jsonb), toolCalls(jsonb), tokensIn, tokensOut, costCents,
  createdAt
  -- index: (conversationId, createdAt)
}
```

### Actions & audit

```typescript
actions {
  id, userId, type, status,
  proposedBy(text), reasoning, payload(jsonb), context(jsonb),
  approvedBy, approvedAt,
  executedAt, executionResult(jsonb),
  revertibleUntil, revertedAt, revertResult(jsonb),
  createdAt
  -- index: (userId, status), (userId, createdAt desc)
}

audit_log {
  id, userId, actionId, event, actor, timestamp, metadata(jsonb)
  -- partition by month, retain 7 years
}

permission_rules {
  id, userId, actionType, conditions(jsonb), behavior, enabled,
  createdAt
}
```

### Decisions

```typescript
decisions {
  id, userId, topic, status('open'|'decided'|'reviewing'|'closed'),
  options(jsonb), evidence(jsonb), deadline,
  decidedAt, decidedOption,
  outcomeReviewAt, outcomeNotes, outcomeQuality(int -2..2),
  createdAt
  -- index: (userId, status)
}
```

### Proactive engine

```typescript
proactive_candidates {
  id, userId, type, title, summary, reasoning,
  predictedValueMinutes, predictedValueDollars,
  confidence, channel, urgency, payload(jsonb),
  surfacedAt, viewedAt, actedAt, dismissedAt, dismissalSpeedMs,
  expiresAt, createdAt
  -- index: (userId, surfacedAt desc), (userId, expiresAt)
}

user_patterns {
  id, userId, patternType, patternKey, patternValue(jsonb),
  confidence, lastObserved, observationCount,
  createdAt, updatedAt
  -- unique: (userId, patternType, patternKey)
}
```

### Cost tracking

```typescript
ai_calls {
  id, userId, agent, prompt_version, model,
  inputTokens, outputTokens, cachedTokens, costCents,
  latencyMs, toolsCalled(jsonb), outcome, traceId,
  conversationId, createdAt
  -- partition by day, retain 90 days
  -- index: (userId, createdAt desc)
}

user_daily_budget {
  userId, date, budgetCents, spentCents,
  warningsSent(jsonb)
  -- pk: (userId, date)
}
```

### Wisdom layer

```typescript
wisdom_aggregates {
  id, versionDate, cohortSignature(jsonb),
  patternType, patternKey, sampleN,
  metricName, metricValue, ciLower, ciUpper, noiseAdded,
  generatedAt
  -- index: (cohortSignature, patternType)
}

wisdom_user_contributions {
  userId, versionDate, included, excludedReason
  -- pk: (userId, versionDate)
}
```

### A2A protocol

```typescript
agent_identity {
  userId(pk), did, publicKey,
  privateKeyRef(encrypted), createdAt
}

a2a_peers {
  id, userId, peerDid, peerName, trustLevel,
  firstSeen, lastSeen, blocked, notes
  -- unique: (userId, peerDid)
}

a2a_negotiations {
  id, userId, peerDid, proposalId, status,
  kind, payload(jsonb), timeline(jsonb), result(jsonb),
  createdAt
  -- index: (userId, createdAt desc)
}
```

### Background jobs metadata

```typescript
job_runs {
  id, jobName, userId, status, startedAt, completedAt,
  error(jsonb), metadata(jsonb)
  -- partition by week, retain 30 days
}
```

### Voice sessions

```typescript
voice_sessions {
  id, userId, livekitRoom, devicesAttached(jsonb),
  startedAt, endedAt, totalDurationMs, totalLatencyP95Ms,
  metadata(jsonb)
}
```

## Migration strategy

- Drizzle Kit for SQL generation: `pnpm db:generate`
- Manual review of generated SQL before commit
- Migrations are immutable once merged to main
- Forward-only: rollback via new migration, never editing past

## Indexing strategy

Critical indexes that must exist day 1:

```sql
-- HNSW for vector cosine
CREATE INDEX entities_embedding_hnsw ON entities USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX memories_embedding_hnsw ON memories USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- User-scoped lookups
CREATE INDEX memories_user_type_recent ON memories(user_id, type, created_at DESC);
CREATE INDEX entities_user_importance ON entities(user_id, importance DESC) WHERE deleted_at IS NULL;
CREATE INDEX actions_user_pending ON actions(user_id, created_at DESC) WHERE status IN ('proposed', 'approved');

-- AI cost queries
CREATE INDEX ai_calls_user_day ON ai_calls(user_id, (created_at::date));

-- FTS fallback
CREATE INDEX memories_fts ON memories USING gin(to_tsvector('english', content));
```

## Encryption

Sensitive columns encrypted at rest using `pgcrypto` symmetric (AES-256-GCM) with per-row key derived from master key + row UUID.

Encrypted columns:
- `integrations.access_token`
- `integrations.refresh_token`
- `agent_identity.private_key_ref`

## Row-level security

Enable RLS on all user-scoped tables. Policies:

```sql
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY memories_owner ON memories
  USING (user_id = current_setting('app.current_user')::uuid);
```

App sets `SET LOCAL app.current_user = '<uuid>'` at request start.

Wisdom layer queries explicitly bypass RLS via service role connection (single point to audit).

## Backup & retention

- Continuous WAL archiving to S3
- Daily snapshots, retain 30d
- Weekly snapshots, retain 1y
- Disaster recovery test quarterly
