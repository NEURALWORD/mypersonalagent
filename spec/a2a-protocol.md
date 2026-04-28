# Spec — Agent-to-Agent Protocol (A2A)

> Foundation for the future where agents talk to other agents on the user's behalf. Build minimum viable now, expand later.

## Goal

Enable our agent to:
1. **Expose** capabilities to other agents (so external services can negotiate with our user via their agent).
2. **Discover** other agents' capabilities (so we can take action on behalf of user).
3. **Negotiate** with cryptographic trust and audit trail.

## Non-goals (for MVP)

- Not a full replacement for HTTP APIs everywhere.
- Not a payment protocol (use existing rails for now).
- Not a global registry (use known endpoints + user-added ones).

## Why include this in MVP

Two reasons:
1. Architectural debt is cheap now, expensive later. Building it after retrofitting agents is 10x harder.
2. First demo (agent ↔ agent meeting scheduling between two of our users) is a "wow" moment for press / investors.

## Protocol

JSON-RPC 2.0 over HTTPS. Every payload signed with Ed25519 by the calling agent's identity.

### Identity

Each agent has:
- `did`: decentralized identifier (e.g. `did:web:agent.exec.example.com:user-abc`)
- Public key registered at `did:web` resolution endpoint
- Private key in secure enclave (HSM in prod, env-encrypted for MVP)

### Discovery

Each agent exposes `GET /.well-known/agent.json`:

```json
{
  "did": "did:web:exec-agent.com:user-abc",
  "name": "Executive Assistant for Manuel",
  "publicKey": "ed25519:...",
  "endpoint": "https://exec-agent.com/a2a/v1",
  "capabilities": [
    {
      "id": "schedule.proposeSlot",
      "description": "Propose a meeting slot",
      "params": { "/* zod-derived JSON schema */": "" }
    },
    {
      "id": "schedule.confirmSlot",
      "description": "Confirm a previously proposed slot"
    }
  ],
  "trustPolicies": {
    "anonymousReadable": ["capabilities"],
    "authenticatedReadable": ["status", "preferences.public"],
    "writable": []
  }
}
```

### Methods (MVP set)

```typescript
// Identity
a2a.ping() → { agentDid, version, timestamp }
a2a.getCapabilities() → Capability[]

// Negotiation primitives
a2a.proposeSlot(input: {
  meetingTopic: string;
  participants: string[];      // DIDs
  durationMinutes: number;
  candidateSlots: ISO[];
  context?: string;
}) → { proposalId, status: 'considering' | 'rejected' | 'accepted', counterSlots? }

a2a.counterProposeSlot(proposalId, alternativeSlots) → ...

a2a.acceptProposal(proposalId) → { confirmed, calendarEventLink }

// Information requests (always require user approval)
a2a.requestIntroduction(input: {
  fromAgent: did;
  toEntity: { name, context };
  reason: string;
}) → { status: 'pending_user_approval' | 'declined', message? }

// Generic
a2a.notify(input: { kind, payload }) → { acked }
```

### Authentication & integrity

Every request:
- Header `X-A2A-DID`: caller's DID
- Header `X-A2A-Signature`: Ed25519 signature of `(method + params + timestamp + nonce)`
- Header `X-A2A-Timestamp`: must be within 5 minute window
- Header `X-A2A-Nonce`: prevents replay (cached for 1h)

Server:
- Resolves caller DID, fetches public key
- Verifies signature
- Checks timestamp + nonce
- Applies trust policy

### Trust model

Trust levels:
- **Stranger**: any unknown DID. Read-only on public capabilities, no actions.
- **Acquaintance**: DID has interacted before (logged). Limited propose-only.
- **Trusted**: explicitly added by user (e.g. "trust agent of John Smith"). Full negotiation.
- **Verified**: trusted + known organization (e.g. via DID:web of registered company).

User can configure per-DID trust level. UI surface in settings.

### User approval gates

Every action that changes state in the user's data is gated by:
- Trust level threshold (configurable per action type)
- Explicit user approval (default for any first interaction with a new DID)
- Audit log entry

### Demo scenario: meeting between two of our users

1. User A asks own agent: "schedule a call with User B about the Q3 plan."
2. A's agent looks up B's DID (already known via A's contacts).
3. A's agent calls `B-agent.proposeSlot(...)` with 3 candidate slots from A's calendar.
4. B's agent runs internal logic (B's preferences, B's calendar), picks one or counter-proposes.
5. Returns to A's agent.
6. A's agent commits if user A pre-approved auto-accept, else surfaces for approval.
7. Calendar invites created on both sides via respective integrations.
8. Audit log entries on both sides.

End-to-end time: < 2 seconds.

## Schema additions

```typescript
agent_identity {
  userId, did, publicKey, privateKeyRef (encrypted), createdAt
}

a2a_peers {
  userId, peerDid, peerName, trustLevel('stranger'|'acquaintance'|'trusted'|'verified'),
  firstSeen, lastSeen, blocked
}

a2a_negotiations {
  id, userId, peerDid, proposalId, status, kind, payload, timeline(jsonb), result, createdAt
}
```

## Endpoints

- `GET /.well-known/agent.json` (public, cacheable)
- `POST /a2a/v1` (JSON-RPC dispatcher)
- `POST /a2a/v1/webhook` (callbacks for async negotiations)

All under existing Next.js Edge runtime for low latency.

## Future evolution

- Phase 2: capability marketplace (agents publish + others discover)
- Phase 3: payment integration (signed offers + Stripe Connect)
- Phase 4: multi-party negotiation (3+ agents)

## Eval

- Round-trip latency between two of our agents: < 500ms p95
- Signature verification correctness: 100% (cryptographic test)
- Replay attack rejection: 100%
- User approval flow: 100% of state-changing actions require approval if peer not trusted
