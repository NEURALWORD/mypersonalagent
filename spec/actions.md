# Spec — Action Layer

> Every write to the real world goes through here. No exceptions.

## Goal

Safe, reversible, auditable execution of actions on user's behalf. Build trust through transparency.

## Principles

1. **Propose, don't act.** Agents create `pending` actions. Execution requires approval (auto or user).
2. **Always reversible.** Every action has a revert path. Window: 5 min for email, 30 min for calendar, 24h for memory mutations.
3. **Audit everything.** Immutable log: who proposed, why, who approved, what executed, what reverted.
4. **Permission tiering.** User configures auto-approve rules. Default conservative.
5. **Sandbox before execute.** For high-stakes, simulate first and show diff.

## Action types

| Type | Description | Default approval | Revert window |
|---|---|---|---|
| `email.send` | Send email | user-approve | 5 min (Gmail undo) |
| `email.archive` | Archive | auto | 24h (move back) |
| `email.label` | Label | auto | 24h |
| `calendar.create` | Create event | user-approve | 30 min |
| `calendar.update` | Update event | user-approve | 30 min |
| `calendar.delete` | Delete event | user-approve | 30 min (recreate from snapshot) |
| `memory.create` | Create memory | auto | 24h |
| `memory.update` | Update memory | auto | 24h |
| `memory.delete` | Delete memory | user-approve | 7 days (soft delete) |
| `intro.send` | Send intro request | user-approve | none (sent) |
| `payment.execute` | Make a payment | user-approve | rail-dependent |
| `doc.edit` | Edit a Notion/Doc page | user-approve | 24h (version restore) |
| `task.create` | Create task in Linear/Notion | auto | 24h |

## State machine

```
[proposed]
    │
    ├── (auto-approve rule matches) ──► [approved]
    │                                       │
    └── (user denies) ────► [rejected]      ▼
    └── (user approves) ──► [approved] ──► [executing]
                                              │
                                              ├── (success) ──► [executed] ─────► [revertible]
                                              │                                       │
                                              │                                       ├── (revert window expires) ─► [final]
                                              │                                       └── (user reverts) ──► [reverted]
                                              │
                                              └── (error) ──► [failed]
```

## Schema

```typescript
actions {
  id, userId, type, status,
  proposedBy(agent_id), reasoning, payload(jsonb), context(jsonb),
  approvedBy('auto' | userId | null), approvedAt,
  executedAt, executionResult(jsonb),
  revertibleUntil, revertedAt, revertResult(jsonb),
  createdAt
}

audit_log {
  id, userId, actionId, event ('proposed'|'approved'|'rejected'|'executed'|'failed'|'reverted'),
  actor (agent_id | userId | 'system'), timestamp, metadata(jsonb)
}

permission_rules {
  id, userId, actionType, conditions(jsonb), behavior('auto_approve'|'auto_reject'|'always_ask'),
  enabled, createdAt
}
```

## API

```typescript
class ActionExecutor {
  async propose(input: ProposeInput): Promise<Action>;
  async approve(actionId: string, approverId: string): Promise<Action>;
  async reject(actionId: string, reason?: string): Promise<Action>;
  async revert(actionId: string): Promise<Action>;
  async listPending(userId: string): Promise<Action[]>;
  async getHistory(userId: string, filter?): Promise<Action[]>;
}
```

### `propose`

```typescript
type ProposeInput = {
  userId: string;
  type: ActionType;
  payload: unknown;        // type-specific schema, validated by zod
  reasoning: string;       // why agent chose this
  context: {
    conversationId?: string;
    triggeredBy: 'user_request' | 'proactive' | 'pattern' | 'a2a_request';
    sourceMemoryIds?: string[];
  };
  preferAutoApprove?: boolean;
};
```

Steps:
1. Validate payload against type's zod schema.
2. Check permission rules: any `auto_approve` match?
3. If auto-approve → set status `approved`, kick off execute job.
4. Else → status `proposed`, notify user via UI badge / push.
5. Audit log entry `proposed`.

### `execute` (internal, called after approval)

Per-action-type executor. Examples:

**email.send**:
1. Resolve Gmail integration (refresh token if needed).
2. Compose MIME message with user's signature.
3. Send via Gmail API.
4. Capture messageId for revert.
5. Schedule `revertibleUntil` = now + 5 min.
6. Audit log `executed`.

**calendar.create**:
1. Resolve Google Calendar integration.
2. Insert event with attendees, location, description.
3. Capture eventId for revert.
4. Schedule revert window.

### `revert`

Per-action-type revert logic.

- email.send → only possible if Gmail "undo send" still valid; else error.
- calendar.create → delete event, send cancellation to attendees.
- memory.delete → undelete (soft-deleted memories restored).

## Permission rules

Examples:

```json
{
  "actionType": "email.archive",
  "conditions": { "fromMatchesPattern": "newsletter|notification" },
  "behavior": "auto_approve"
}

{
  "actionType": "calendar.create",
  "conditions": { "durationMinutes": { "lt": 30 }, "withinBusinessHours": true },
  "behavior": "auto_approve"
}

{
  "actionType": "email.send",
  "conditions": { "amount.cents": { "gt": 10000 } },
  "behavior": "always_ask"
}
```

Rules engine: Postgres + JSON logic evaluator. Fast path: in-memory cache per user.

## UI

### Pending actions panel

Always visible in sidebar when count > 0. Each item:
- One-line summary
- "Why" expand → shows agent reasoning + source memories
- Diff view (for edits)
- Approve / Reject / Edit buttons
- Auto-approve toggle (creates rule for similar future actions)

### Recent actions feed

Last 50 executed actions with status indicators. "Revert" button if within window.

### Audit log

Full searchable history. Exportable as CSV (compliance).

## Failure handling

- **Integration auth expired**: re-auth flow, retry. Never silent fail.
- **Rate limited**: backoff + retry. Surface to user if persists.
- **Idempotency**: every execute call uses idempotency key = `actionId`. Re-executions are no-ops.
- **Partial failure**: action is `failed`, audit log explains. User can retry or escalate.

## Eval

- **Approval rate**: % of proposed actions user approves (target > 70%)
- **False auto-approve**: % of auto-approved actions user later reverts (target < 5%)
- **Revert success rate**: when user clicks revert, % that succeed (target > 95%)
- **Audit completeness**: 100% of state-changing operations have audit log

## Open questions

- Two-step verification for high-value actions (e.g. payment > $1k)? Probably yes — biometric/passkey re-auth.
- Bulk approve? Yes for low-stakes (email archive). No for high-stakes.
