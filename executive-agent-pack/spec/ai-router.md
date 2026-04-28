# Spec — AI Router

> Single chokepoint for all LLM calls. Enforces cost, caching, fallback, observability.

## Goal

Every LLM invocation in the system goes through `packages/ai/router.ts`. No exceptions. This is what enforces cost control, observability, and graceful degradation.

## API

```typescript
import { router } from '@/ai/router';

const result = await router.complete({
  agent: 'email-triage',                  // for tracing/budgets
  userId: 'usr_...',
  task: 'classify-email',                 // for prompt + model selection
  promptVersion: 'v1',                    // explicit prompt version
  input: { /* ... */ },                   // task-specific input (typed)
  options?: {
    maxTokens?: number,
    temperature?: number,
    stream?: boolean,
    cacheKey?: string,
    forceModel?: ModelId,
  }
});
```

Returns `RouterResult` with: `output`, `model`, `tokensIn`, `tokensOut`, `costCents`, `latencyMs`, `cached`, `traceId`.

## Pipeline

```
request
   │
   ▼
[1] resolve task config (model chain, prompt, schema)
   │
   ▼
[2] check user budget   ──── (over budget) ──► graceful degrade
   │
   ▼
[3] check cache         ──── (hit) ──► return cached
   │
   ▼
[4] try primary model
   │  (fail/timeout)
   ▼
[5] fallback chain (next model)
   │
   ▼
[6] emit Langfuse trace + write ai_calls row
   │
   ▼
[7] update user_daily_budget
   │
   ▼
[8] cache result if cacheable
   │
   ▼
return
```

## Task config (in `packages/ai/tasks.ts`)

```typescript
export const tasks = {
  'classify-email': {
    primaryModel: 'gpt-4o-mini',
    fallback: ['claude-haiku-4-5', 'cached-default'],
    promptPath: 'prompts/email/triage',
    outputSchema: emailClassificationSchema,
    maxTokens: 200,
    temperature: 0.1,
    cacheable: true,
    cacheKeyFn: (input) => `triage:${hash(input.email.id)}:${promptVersion}`,
  },
  'compose-email-draft': {
    primaryModel: 'claude-sonnet-4-7',
    fallback: ['gpt-4o', 'cached-template'],
    promptPath: 'prompts/email/draft',
    outputSchema: emailDraftSchema,
    maxTokens: 800,
    temperature: 0.7,
    cacheable: false,  // always personalized
  },
  'meeting-prep': {
    primaryModel: 'claude-sonnet-4-7',
    fallback: ['claude-haiku-4-5'],
    promptPath: 'prompts/calendar/prep',
    outputSchema: meetingBriefSchema,
    maxTokens: 1500,
    temperature: 0.3,
    cacheable: true,  // cache for 1h
    cacheTtlSeconds: 3600,
  },
  'master-response': {
    primaryModel: 'claude-sonnet-4-7',
    fallback: ['claude-haiku-4-5'],
    promptPath: 'prompts/master/system',
    maxTokens: 4000,
    temperature: 0.7,
    cacheable: false,
    streaming: true,
  },
  'consolidate-memory': {
    primaryModel: 'claude-haiku-4-5',
    promptPath: 'prompts/memory/consolidate',
    outputSchema: consolidatedMemorySchema,
    maxTokens: 600,
    temperature: 0.2,
    batch: true,  // use Anthropic batch API (50% cost)
  },
} as const;
```

## Model registry

```typescript
export const models = {
  'claude-opus-4-7': { provider: 'anthropic', costPer1M: { input: 15, output: 75 }, contextWindow: 200000 },
  'claude-sonnet-4-7': { provider: 'anthropic', costPer1M: { input: 3, output: 15 }, contextWindow: 200000 },
  'claude-haiku-4-5': { provider: 'anthropic', costPer1M: { input: 0.8, output: 4 }, contextWindow: 200000 },
  'gpt-4o': { provider: 'openai', costPer1M: { input: 2.5, output: 10 }, contextWindow: 128000 },
  'gpt-4o-mini': { provider: 'openai', costPer1M: { input: 0.15, output: 0.6 }, contextWindow: 128000 },
  'cached-default': { provider: 'cache', costPer1M: { input: 0, output: 0 }, contextWindow: 0 },
} as const;
```

## Cost guardrails

### Budget tracking

`user_daily_budget` updated atomically per call:
```sql
INSERT INTO user_daily_budget (user_id, date, budget_cents, spent_cents)
VALUES ($1, current_date, default_budget(), $2)
ON CONFLICT (user_id, date)
DO UPDATE SET spent_cents = user_daily_budget.spent_cents + EXCLUDED.spent_cents;
```

### Soft warning at 70%

Send via PostHog event `budget.warning`. UI shows banner.

### Hard limit at 100% (soft) and 120% (hard)

- 100%: degraded mode (Haiku only, cache only, no proactive)
- 120%: blocked, surface "limit reached, contact support"

### Override per task

Some tasks (memory recall) are critical and exempt from budget block. Marked `bypassBudget: true` in task config.

## Caching

Two layers:

### L1: in-memory LRU per process

For prompt-cache references (system prompts, etc.). Keep last 1000.

### L2: Redis

Key: `ai:{task}:{cacheKey}` (cacheKey from task config).
TTL: per task (default 1h).
Invalidation: explicit on memory mutations affecting cached output.

### Anthropic prompt cache

For all calls with system prompt > 2k tokens, use `cache_control: { type: 'ephemeral' }`. Saves 90% on repeat prefixes.

## Fallback chain behavior

Each fallback step:
1. Try call with timeout (default 15s, configurable per task)
2. On timeout/error, log to Sentry + Langfuse
3. Move to next model in chain
4. If chain exhausts → return graceful degradation:
   - For deterministic tasks: cached default response
   - For chat: "I'm having trouble right now, please try again"

## Streaming support

For tasks with `streaming: true`:
- Returns AsyncIterable of chunks
- Cost computed at end
- Trace closed at end of stream

## Observability

Every call emits:
- Langfuse trace with full input, output, metadata
- `ai_calls` table row
- PostHog event `ai.call`

Sensitive fields (PII in input/output) hashed in non-prod traces.

## Eval hook

Router exposes `router.completeForEval()` which bypasses cache and budget but still emits traces. Used by eval harness.

## Streaming usage example

```typescript
const stream = await router.complete({
  agent: 'master',
  task: 'master-response',
  options: { stream: true },
  // ...
});

for await (const chunk of stream) {
  // forward to client via tRPC subscription or SSE
}

// after stream end, totals available
console.log(stream.usage);
```

## Eval

- 100% of LLM calls go through router (verified by lint rule + test that scans for direct `anthropic`/`openai` imports outside router)
- Cost projections accurate within ±5% of actual
- Cache hit rate > 30% in steady state
- Fallback success rate (when primary fails): > 90% recovery
