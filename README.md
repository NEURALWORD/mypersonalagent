# Executive Agent

An AI Chief of Staff for founders and executives. Memory-first, voice-native, predictive, privacy-first.

This repository is built autonomously by Claude Code following the operating manual in [`claude.md`](./claude.md).

## Where to start

| If you are…              | Read this first                    |
|--------------------------|------------------------------------|
| Claude Code, new session | [`claude.md`](./claude.md)         |
| A human picking up work  | [`START-HERE.md`](./START-HERE.md) |
| Setting up a workstation | [`RUNBOOK.md`](./RUNBOOK.md)       |
| Looking for next work    | [`BACKLOG.md`](./BACKLOG.md)       |
| Architecture context     | [`DECISIONS.md`](./DECISIONS.md)   |
| Pack inventory           | [`INDEX.md`](./INDEX.md)           |

## Repository layout

```
apps/         # web (Next.js), voice (LiveKit), desktop (Tauri), mobile (Expo)
packages/     # db, ai, integrations, jobs, actions, ui, shared, protocols
spec/         # 14 feature specifications (memory, agents, voice, …)
tasks/        # 90+ atomic implementation tasks
prompts/      # versioned LLM prompts
eval/         # golden datasets + baselines
```

## Development

```bash
# Prereqs: Node 22, pnpm 10 (corepack auto-installs the pinned version), Docker
pnpm install
pnpm gate            # typecheck + lint + test (phase-aware; see claude.md)
```

The full stack, daily commands, and recovery procedures are in [`RUNBOOK.md`](./RUNBOOK.md).

## Branching & workflow

- Phase 0 (foundations, `F-001..F-010`): direct commits to the working setup branch.
- Phase 1 onward: every task gets `feat/<task-id>-<slug>` + a PR (squash-merge).

See [`claude.md`](./claude.md) → "Phase-0 branch exception" and "Phase-aware quality gate" for the full rules.
