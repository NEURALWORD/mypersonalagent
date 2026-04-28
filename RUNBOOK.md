# RUNBOOK — Executive Agent

## Recommended environment (chosen for you)

After evaluating Cursor vs Claude Code in terminal vs VS Code with Claude:

**Use Claude Code in terminal as primary, VS Code as inspector.**

Reasons:
- Claude Code in terminal supports the autonomous loop best (long-running sessions, file ops, run commands)
- VS Code is for human review and surgical edits
- Cursor is fine but less suited to multi-hour autonomous runs (UI gets stuck on long sessions)

### Initial setup (one-time, founder's machine)

```bash
# Prereqs
node --version          # need v22.x
pnpm --version          # need v9.x; install via: npm i -g pnpm
docker --version        # for local Postgres + Redis

# Install Claude Code CLI
npm install -g @anthropic-ai/claude-code

# Auth
claude auth login

# Clone or init repo
git clone <your-repo> executive-agent
cd executive-agent

# First-time install
pnpm install

# Local services
docker compose up -d    # starts Postgres 16 + pgvector + Redis

# Env
cp .env.example .env.local
# Fill in: ANTHROPIC_API_KEY, OPENAI_API_KEY, CLERK_*, INNGEST_*, etc.
# (See spec/env-vars.md for full list)

# DB setup
pnpm db:migrate
pnpm db:seed

# Smoke test
pnpm dev
# Open http://localhost:3000
```

### Daily workflow with Claude Code

```bash
cd executive-agent

# Start a session (Claude reads claude.md + BACKLOG.md automatically)
claude

# Inside Claude Code session, typical first prompts:
> "Read claude.md, RUNBOOK.md, BACKLOG.md. Pick the top unblocked task and execute the loop."
> "Continue working through BACKLOG.md. Stop only when you hit a blocker or finish 5 tasks."
> "Run the eval suite and report regressions."
```

### When Claude Code gets stuck

```bash
# In another terminal, inspect what is happening
git status
git diff
pnpm typecheck
pnpm test

# If session is wedged, kill and restart with explicit context
> "Last session may have left work in progress. Run git status, summarize state, then read BLOCKERS.md and BACKLOG.md to decide next action."
```

## Standard commands

```bash
# Development
pnpm dev                    # all apps in parallel via Turbo
pnpm dev:web                # only web app
pnpm dev:voice              # only voice worker

# Database
pnpm db:generate            # create migration from schema diff
pnpm db:migrate             # apply migrations
pnpm db:studio              # Drizzle Studio GUI
pnpm db:seed                # seed test data

# Testing
pnpm test                   # all unit tests (vitest)
pnpm test:watch             # watch mode
pnpm test:e2e               # playwright
pnpm eval                   # full eval harness
pnpm eval:unit              # only unit evals (<30s)
pnpm eval:integration       # integration evals
pnpm eval:regression        # nightly regression suite

# Quality gate (run before commit)
pnpm gate                   # typecheck + lint + test + eval:unit

# Deployment
pnpm build                  # production build
pnpm deploy:staging         # via Vercel CLI
pnpm deploy:production      # via Vercel CLI (requires confirmation)

# Operations
pnpm ops:list-users
pnpm ops:user-cost <userId>           # show last 30d AI spend for user
pnpm ops:delete-user <userId>         # GDPR full deletion
pnpm ops:replay-failed-jobs
```

## Repository topology

This is a Turborepo monorepo with pnpm workspaces. Key files:

- `package.json` (root): workspace config, shared scripts
- `turbo.json`: pipeline definitions, cache config
- `pnpm-workspace.yaml`: which dirs are packages
- `tsconfig.base.json`: shared TS config
- `biome.json`: lint + format
- `.env.example`: env template

## Branching model

- `main`: deployable to production
- `staging`: deployed to staging on push
- Feature work: `feat/<task-id>-<slug>` → PR to `staging` → after manual smoke test, PR to `main`

Even as solo founder: create PRs for audit trail. Squash-merge.

## Deployment

Auto-deploy:
- Push to `staging` → Vercel deploys staging environment + runs e2e
- Merge to `main` → Vercel deploys production after eval gate passes in CI

Manual rollback:
```bash
pnpm deploy:rollback        # to last known good version
```

## Incident response

Tier 1 (data loss risk, security breach): stop all writes, freeze deploys, root cause within 1h.
Tier 2 (degraded service): triage within 4h, fix or rollback within 24h.
Tier 3 (cosmetic): backlog.

Every incident → entry in `docs/incidents/<date>-<title>.md` with timeline + root cause + prevention.

## Common errors and fixes

### "ECONNREFUSED Postgres"
```bash
docker compose up -d postgres
pnpm db:migrate
```

### "Anthropic 429 rate limit"
Check `pnpm ops:user-cost` for runaway user. Consider raising org rate limit in Anthropic console.

### "Inngest function timeout"
Long-running step needs to be split. See `spec/jobs.md` for step patterns.

### "Langfuse trace missing"
Verify `LANGFUSE_*` env vars set. Check `packages/ai/router.ts` is in the call path.

### "Eval baseline mismatch"
Run `pnpm eval:regression --update-baseline` ONLY after manual review.

## Performance budgets

- Web app First Contentful Paint: < 1.5s
- Voice end-to-end (user speaks → first token spoken): < 600ms
- Memory recall query: < 200ms p95
- Email triage per email: < 2s p95
- LLM call cost per active user per day: < $1.50

If a budget is breached, the corresponding eval fails and you must fix or get explicit founder sign-off.

## Where to put new things

- New agent? `packages/ai/agents/<name>-agent.ts` + register in `packages/ai/agents/registry.ts`
- New integration? `packages/integrations/<provider>/` + spec in `spec/integrations/<provider>.md`
- New tool? `packages/ai/tools/<name>.tool.ts`
- New background job? `packages/jobs/<name>.ts` + register in `packages/jobs/index.ts`
- New tRPC route? `apps/web/server/routers/<domain>.ts` + register in `_app.ts`
- New table? Edit `packages/db/schema/*.ts` + run `pnpm db:generate`

## Help references

- Drizzle: https://orm.drizzle.team
- Vercel AI SDK: https://sdk.vercel.ai
- Inngest: https://www.inngest.com/docs
- Anthropic: https://docs.claude.com
- Liveblocks: https://liveblocks.io/docs
- LiveKit: https://docs.livekit.io
