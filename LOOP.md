# LOOP — Autonomous Development Kickoff

> Paste this prompt into Claude Code at the **start of every working session**. It boots Claude Code into the autonomous loop.

---

## Kickoff prompt (copy-paste this)

```
You are Claude Code, working autonomously on the Executive Agent codebase.

Read these files in order, fully:
1. claude.md (your operating manual)
2. RUNBOOK.md (environment + commands)
3. BACKLOG.md (task queue)
4. BLOCKERS.md (anything blocked)
5. DECISIONS.md (architectural decisions to date)

Then enter the autonomous development loop:

1. Pick the top unblocked task in BACKLOG.md.
2. Read tasks/<task-id>.md for acceptance criteria.
3. Read the spec(s) referenced in that task fully.
4. Plan in 5-15 lines: what files you will create/touch, what tests you will write, what risks you see.
5. Write failing tests first (TDD).
6. Implement minimum code to pass tests.
7. Run quality gate: `pnpm gate` (typecheck + lint + test + eval:unit).
8. If gate red: enter bugfix sub-loop (max 5 hypotheses); if still red, write to BLOCKERS.md.
9. If gate green: commit (conventional commits) + update BACKLOG.md (mark done).
10. Update DECISIONS.md if you made an architectural choice.
11. Return to step 1.

Stop only when:
- You have completed 5 tasks (report summary).
- Or you hit a blocker that requires human input (write BLOCKERS.md, then summarize).
- Or you finish all tasks in current phase (report + ask permission to start next phase).

Do not skip the eval gate. Do not bypass the action executor. Do not use `any` types. Read claude.md for the full NEVER list.

Begin.
```

---

## Resume prompt (when starting a new session mid-development)

```
You are Claude Code, resuming work on the Executive Agent codebase.

1. Run `git status` and `git log --oneline -10` — report current state.
2. Read BLOCKERS.md — note any unresolved blockers.
3. Read BACKLOG.md — identify what's done, what's in progress, what's next.
4. Read the last 3 entries in DECISIONS.md.
5. If a task is in progress (marked [~]), decide: resume it (preferred if you have context) or stash and pick a fresh task.
6. Enter the autonomous development loop (see LOOP.md).

Begin.
```

---

## Bugfix mode prompt (if a specific test/eval is failing)

```
You are Claude Code in bugfix mode.

A failing test/eval was reported: <PASTE TEST NAME OR FAILURE OUTPUT>

Bugfix sub-loop (max 5 iterations):

1. Read failing output completely. Do not skim.
2. Form hypothesis. Write it as a comment "// hypothesis: ..." in the relevant file.
3. Add focused logging if needed.
4. Make minimal change addressing hypothesis.
5. Re-run only the failing test.
6. If green: remove debug logging, run full gate, commit if all green.
7. If red: revert change, formulate new hypothesis (max 5 total).
8. After 5 hypotheses without resolution: write to BLOCKERS.md with full diagnosis (what was tried, what didn't work, current best guess at root cause, what is needed).

Do not modify unrelated code. Stay focused.

Begin.
```

---

## Eval review mode (after running eval suite)

```
You are Claude Code reviewing eval regression results.

Run: `pnpm eval:regression`

Examine the diff output carefully. For each regression:

1. Identify the eval task that regressed.
2. Look at the top 5 cases where score dropped most.
3. Read those cases' inputs, outputs, and judge reasoning.
4. Form hypothesis: was it a prompt change, model behavior change, or data drift?
5. Test the hypothesis with a minimal targeted experiment.

Report your findings as a structured analysis:
- What regressed and by how much
- Likely root cause(s)
- Recommended fix
- Whether to block release or accept the regression (with founder sign-off)

Do not auto-update the baseline. That requires explicit founder approval.
```

---

## Daily standup (if working in long sessions)

```
You are Claude Code reporting yesterday's work.

Run: `git log --since="24 hours ago" --oneline` and report:

1. Tasks completed (cite IDs).
2. Tasks in progress.
3. Blockers raised.
4. Eval baseline movements (improvements or regressions).
5. Total cost of LLM calls during dev (if Langfuse data accessible via CLI).
6. Top 3 risks for today.

Then continue the loop.
```

---

## Hard rules during autonomous operation

These rules are repeated here for emphasis. They must hold across all session types.

1. **Never push to main directly.** All work via PR (even solo). Branch: `feat/<task-id>-<slug>`.
2. **Never bypass the eval gate.** If you cannot make a regression eval pass, stop and write to BLOCKERS.md.
3. **Never use `any` or `as any` or `// @ts-ignore`** without a comment justifying and a follow-up TODO.
4. **Never hardcode secrets, model names, URLs.** Always env or config.
5. **Never log raw user PII** to console, Sentry, PostHog. Langfuse only (under DPA).
6. **Never train on user data** unless explicit opt-in.
7. **Never make destructive DB ops** (drop table, delete cascade) without dry-run + confirmation.
8. **Never call an LLM outside packages/ai/router.ts.** The lint rule will catch this.
9. **Never bypass action executor for state changes.** The audit log requires it.
10. **If you find yourself in a loop**: stop, re-read the relevant spec, write your confusion to BLOCKERS.md, pick a different task.
