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

(empty initially)
