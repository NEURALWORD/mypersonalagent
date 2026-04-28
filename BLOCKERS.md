# BLOCKERS

> Tasks that Claude Code could not complete autonomously after 5 hypothesis iterations.
> Each entry: what was tried, current diagnosis, what is needed to unblock.

## Format

```
## [TASK-ID] Title — blocked YYYY-MM-DD

**Symptom**: what is failing (test name, error, behavior)

**Hypotheses tried**:
1. <hypothesis> → <result>
2. ...

**Current diagnosis**: best guess at root cause

**Needs**: human input on X / external API access / library upgrade / architectural decision

**Workaround in place**: yes/no, what behavior is degraded

**Files touched during attempts**: list
```

---

## [F-002 / F-005] Docker daemon unavailable in setup sandbox — flagged 2026-04-28

**Symptom**: cannot run `docker compose up -d`, `pnpm db:migrate`, or `pnpm db:studio` to satisfy the live-runtime acceptance criteria. `docker info` reports `failed to connect to the docker API at unix:///var/run/docker.sock; check if the path is correct and if the daemon is running`.

**Hypotheses tried**: none — this is an environmental gap, not a code defect. Static validation done in lieu of runtime:
- `docker compose config` parses `docker-compose.yml` cleanly.
- `drizzle-kit generate` against the schema produced `migrations/0000_dazzling_lyja.sql` with the expected three tables, FK cascades, and defaults.
- `pnpm typecheck` + `pnpm lint` + `pnpm test` (62 tests across @exec/shared and @exec/db) all green.

**Current diagnosis**: not blocked on code. Re-run on a workstation with Docker Desktop / a running daemon to confirm:
1. `docker compose up -d` brings up `exec-agent-postgres` and `exec-agent-redis` healthy.
2. `docker exec exec-agent-postgres psql -U dev -d exec_agent_dev -c "SELECT extname FROM pg_extension"` lists `vector`, `pgcrypto`, `uuid-ossp`.
3. `docker exec exec-agent-redis redis-cli ping` returns `PONG`.
4. `pnpm db:migrate` applies `migrations/0000_*.sql` cleanly.
5. `pnpm db:studio` opens at the default port.

**Needs**: workstation with Docker daemon running. No human decision required — purely environmental. Once verified, tick the runtime boxes on F-002 and F-005 in BACKLOG.md and remove this entry.

**Workaround in place**: none required for current Phase-0 scope (everything else is static / unit-tested).

**Files touched during attempts**: `docker-compose.yml`, `scripts/db-init.sql`, `packages/db/drizzle.config.ts`, `packages/db/src/migrate.ts`, `packages/db/migrations/0000_dazzling_lyja.sql`.
