# START HERE — Executive Agent Pack

**Welcome, Claude Code.** This is your entry point. Read this file once at the start of your first session, then proceed.

---

## What this pack is

A complete autonomous-development specification for an **AI Executive Agent** — a personal Chief of Staff for founders and executives. Memory-first, voice-native, predictive, privacy-first.

This pack is designed so you (Claude Code) can implement the entire product **autonomously**, with a structured loop, autonomous bugfixing, and clear escalation rules.

## Files in priority order

Read in this exact order on your first session:

1. **`claude.md`** — your operating manual. Principles, tech stack, NEVER-do list, dev loop, bugfix sub-loop. **THIS IS THE LAW.**
2. **`RUNBOOK.md`** — environment setup, daily commands, deployment, recovery.
3. **`BACKLOG.md`** — task queue. You always pick the top unblocked task here.
4. **`DECISIONS.md`** — architectural decisions (ADRs). Read before changing architecture.
5. **`spec/`** — feature specifications. Read the relevant spec(s) before implementing a task.
6. **`tasks/`** — atomic implementation tasks. Each task has acceptance criteria.
7. **`prompts/`** — versioned prompt files. Edit existing or add new versions, never delete.
8. **`eval/`** — golden datasets and eval harness foundations.

## How to operate

Every session, you follow this exact loop:

```
loop forever:
  task = read BACKLOG.md → pick top unblocked
  spec = read referenced spec/ files
  detail = read tasks/<task-id>.md
  
  plan = think hard about approach (5-15 line mental model)
  
  write failing test (TDD)
  implement minimum code to pass
  
  run gate: typecheck + lint + test + relevant eval
  
  if gate red:
    bugfix sub-loop (max 5 iterations)
    if still red: write to BLOCKERS.md, pick next task
  
  if gate green:
    commit (conventional commits)
    update BACKLOG.md (mark done)
    update DECISIONS.md if architectural
    
  next iteration
```

**You do not ask the founder for permission to proceed. You proceed.**
You only stop and escalate via BLOCKERS.md when:
- Something requires a real-world action (e.g. signing up for a paid API)
- A spec is genuinely ambiguous after you re-read it twice
- You have hit 5 failed bugfix iterations on the same problem

## What you are building (one paragraph)

A web + voice + mobile AI agent that acts as a Chief of Staff for an executive. It reads their email and calendar (with permission), builds a long-term memory of people, decisions, projects, preferences. It triages email, prepares for meetings, surfaces relationship health, opens decision files for important choices, anticipates needs proactively, and operates always-on by voice across devices. It exposes an agent-to-agent protocol so other AI agents can negotiate with it on the user's behalf. Privacy-first, audit-logged, fully reversible.

## Five north-star metrics (always optimize for these)

1. **Time saved per user per day** (target 90+ minutes by month 3)
2. **Trust score** (% of suggested actions user approves)
3. **Memory recall accuracy**
4. **DAU/MAU > 0.6** for paying users
5. **Cost per active user per month < $40** AI inference

If a feature does not move one of these, deprioritize it.

## Current status of pack

This pack is **fresh**. No code exists yet. Repo is empty. You will create everything from scratch starting at task `F-001`.

The pack contains:
- 1 operating manual (`claude.md`)
- 1 runbook (`RUNBOOK.md`)
- 1 backlog with 70+ tasks
- 14 feature specs in `spec/`
- 70+ atomic task files in `tasks/`
- Versioned prompt files in `prompts/`
- Eval fixture seeds in `eval/`
- Architectural decisions log (`DECISIONS.md`)
- Blocker template (`BLOCKERS.md`)

## When you are stuck

If you find yourself in a loop, confused, or producing low-quality output:

1. **Stop.** Re-read `claude.md`.
2. Re-read the relevant spec(s) for your current task.
3. Check `DECISIONS.md` for recent architectural changes.
4. If still stuck: write current state + blocker to `BLOCKERS.md`, pick a different task.

## Communication style with founder

The founder is **Manuel** (Italian, solo founder, inventor of the first smartwatch). When you produce output for him:

- **Be concise.** Lead with what you did + result. No flowery preamble.
- **Show numbers.** Tests passing, files changed, lines added/removed, eval scores.
- **Explain non-obvious choices** in 1-2 sentences.
- **If risky or uncertain, say so explicitly.** Do not hide it.
- **Match his language.** Italian if he writes Italian, English otherwise.

## Now do this

1. Read `claude.md` end to end.
2. Read `RUNBOOK.md` end to end.
3. Open `BACKLOG.md`. Pick `F-001`.
4. Read `tasks/F-001.md`.
5. Begin implementation.

Good luck. Build something extraordinary.

— Manuel & the spec author
