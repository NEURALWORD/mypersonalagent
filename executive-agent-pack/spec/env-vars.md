# Spec — Environment Variables

> Canonical list of env vars. `.env.example` must be kept in sync with this file.

## Validation

All env vars validated at boot via `packages/shared/env.ts` using zod. App fails fast if required vars missing.

## Categories

### Core

```
NODE_ENV=development|staging|production
APP_URL=https://app.example.com
APP_NAME=Executive Agent
```

### Database

```
DATABASE_URL=postgresql://...
DIRECT_DATABASE_URL=postgresql://...   # bypass connection pooling for migrations
```

### Auth (Clerk)

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...
```

### LLM providers

```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

### Background jobs

```
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...
```

### Cache & queue

```
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### Realtime

```
LIVEBLOCKS_SECRET_KEY=...
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
LIVEKIT_URL=wss://...
```

### Voice

```
CARTESIA_API_KEY=...
DEEPGRAM_API_KEY=...
ELEVENLABS_API_KEY=...      # fallback
```

### Storage

```
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=...
R2_PUBLIC_URL=https://...
```

### Observability

```
LANGFUSE_PUBLIC_KEY=...
LANGFUSE_SECRET_KEY=...
LANGFUSE_HOST=https://cloud.langfuse.com
SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=...        # for source maps
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://eu.posthog.com
```

### Payments

```
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
```

### Integrations (OAuth — per provider)

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
SLACK_CLIENT_ID=...
SLACK_CLIENT_SECRET=...
SLACK_SIGNING_SECRET=...
```

### Encryption

```
DB_COLUMN_ENCRYPTION_KEY=...   # 32 bytes hex, used for pgcrypto
A2A_SIGNING_PRIVATE_KEY=...    # Ed25519 private key for agent identity
```

### Cost guardrails (config)

```
DEFAULT_USER_DAILY_BUDGET_CENTS=300
DEFAULT_USER_MONTHLY_BUDGET_CENTS=8000
HARD_LIMIT_MULTIPLIER=1.2       # block at 120% of soft budget
```

### Feature flags (use PostHog feature flags in prod, env for dev)

```
FEATURE_VOICE_ENABLED=true
FEATURE_A2A_ENABLED=false
FEATURE_WISDOM_ENABLED=false
FEATURE_AUTOPILOT_EMAIL=false
```

## Secret management

- Local: `.env.local` (gitignored)
- Staging/Prod: Infisical, synced to Vercel via integration
- Rotation policy: every 90 days for API keys, every 30 days for signing keys

## Adding a new env var

1. Add to this file with description
2. Add to `.env.example` with placeholder
3. Add to zod schema in `packages/shared/env.ts`
4. Add to Infisical for staging+prod
5. Update Vercel project settings if needed
