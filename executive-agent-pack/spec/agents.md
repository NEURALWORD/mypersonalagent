# Spec — Agents

> Multi-agent system. Master orchestrator routes to specialized domain agents.

## Architecture

```
                          ┌─────────────────────────┐
                          │   MasterOrchestrator    │
                          │   (Claude Sonnet 4.7)   │
                          └────────┬────────────────┘
                                   │
        ┌──────────┬───────────┬───┴───┬───────────┬──────────┐
        ▼          ▼           ▼       ▼           ▼          ▼
    ┌──────┐  ┌────────┐  ┌─────────┐ ┌──────┐ ┌─────────┐ ┌────────┐
    │Email │  │Calendar│  │ People  │ │Decis.│ │Network  │ │Wisdom  │
    │Agent │  │Agent   │  │ Agent   │ │Agent │ │Agent    │ │Agent   │
    └──────┘  └────────┘  └─────────┘ └──────┘ └─────────┘ └────────┘
        │         │            │          │         │           │
        └─────────┴────────────┴──────────┴─────────┴───────────┘
                                   │
                          ┌────────▼────────┐
                          │  Tool registry  │
                          └─────────────────┘
                                   │
       ┌──────────┬───────────┬────┴────┬──────────┬───────────┐
       ▼          ▼           ▼         ▼          ▼           ▼
    Memory    Integration  Action   Search    Compute     A2A
   recall      adapters    exec.    web        (calc)    protocol
```

## Master orchestrator

```typescript
class MasterOrchestrator {
  async handle(input: {
    userId: string;
    message: string;
    conversationId: string;
    modality: 'text' | 'voice';
  }): Promise<OrchestratorOutput>
}
```

**Flow:**
1. Load conversation history (last 10 turns).
2. Recall relevant memories (`memory.recall(message, limit=15)`).
3. Build system prompt with memory context + persona + current time + user prefs.
4. Run multi-step generation with tool registry.
5. For tool calls, route to appropriate sub-agent.
6. Stream tokens to client.
7. After completion, write conversation summary to memory if salient.

**System prompt structure** (versioned in `prompts/master/system.v1.md`):

```
You are <name>, personal Chief of Staff to <user_name>.
You have deep memory of their work and life.

# What you know about <user_name>:
{{memory_context}}

# Current context:
- Time: {{now}}
- Day of week: {{dow}}
- User location: {{location}} (only if shared)
- Active project focus: {{focus_topic}}
- Recent unread: {{unread_count}} emails, {{meetings_today}} meetings today

# Your principles:
{{principles_block}}

# Response format:
- Concise. Lead with action or answer. No flowery preamble.
- For multi-step tasks, narrate briefly then execute.
- Always cite which memory you used (link icon will be rendered by UI).
- For uncertain requests, ask ONE focused clarifying question.
- For high-stakes actions, propose then wait for approval.
```

**Tool registry exposed:**

| Tool | Description | Side effect |
|---|---|---|
| `recallMemory(query, options)` | Semantic memory recall | none |
| `searchEmails(query, timeRange)` | Search inbox | none |
| `prepareMeeting(meetingId)` | Generate meeting brief | none |
| `findPerson(query)` | Network lookup | none |
| `proposeEmailDraft(to, subject, body)` | Draft email for approval | creates pending action |
| `proposeMeetingSchedule(...)` | Propose calendar event | creates pending action |
| `proposeIntroduction(personA, personB, context)` | Draft intro email | creates pending action |
| `rememberFact(content, type, entities)` | Explicit memory write | mutates memory |
| `forgetFact(memoryId)` | Explicit forget | mutates memory |
| `webSearch(query)` | External research | none |
| `runCalculation(expr)` | Deterministic math | none |
| `openDecisionFile(topic)` | Start tracked decision | creates decision file |

## Email Agent

**Responsibilities:**
- Triage inbox (priority + category + suggested action)
- Draft responses in user's voice
- Find emails by content
- Detect emails that should become tasks/memories

**Sub-tools:**
- `classifyEmail(emailId)` → priority (P0–P3), category, suggested_action
- `draftReply(emailId, instructions?)` → draft body in user voice
- `summarizeThread(threadId)` → bullet summary
- `extractActionItems(emailId)` → list of actions

**Prompts:** `prompts/email/triage.v1.md`, `prompts/email/draft.v1.md`

**User voice modeling:**
- After 100 sent emails ingested → fine-tune-via-prompt: collect 20 representative samples + style descriptors (sentence length, openings, closings, signature, formality, hedging) → embed in draft system prompt.
- Update style profile monthly.

## Calendar Agent

**Responsibilities:**
- Generate prep briefs for upcoming meetings
- Find meeting times respecting user's energy/focus rules
- Detect meetings that could be async (suggest "decline + email instead")
- Track action items from past meetings

**Sub-tools:**
- `prepareBrief(meetingId)` → 1-pager
- `findMeetingTime(constraints, attendees)` → ranked slots
- `summarizeMeeting(meetingId, transcript?)` → action items + decisions
- `assessMeetingNecessity(meetingId)` → ['necessary' | 'could-be-email' | 'could-be-shorter']

## People Agent

**Responsibilities:**
- Maintain richly enriched profile per person in network
- Detect "stale" relationships (not contacted in N days, importance > X)
- Cross-reference: who in network knows person X
- Fetch latest public signals (LinkedIn updates, posts, news)

**Sub-tools:**
- `getProfile(entityId)` → profile + recent interactions + signals
- `findPath(fromUser, toEntityId)` → mutual connections
- `enrichProfile(entityId)` → fetch fresh public data
- `staleRelationships(thresholdDays, minImportance)` → ranked list

## Decision Agent

**Responsibilities:**
- Open structured decision file when user faces non-trivial decision
- Track options, pros/cons, evidence, deadline
- Schedule outcome review
- Build "decision history" for the user

**Schema:**
```typescript
decisions {
  id, userId, topic, status('open'|'decided'|'reviewing'|'closed'),
  options(jsonb), evidence(jsonb), deadline, decidedAt, decidedOption,
  outcomeReviewAt, outcomeNotes, outcomeQuality(int -2..+2)
}
```

**Sub-tools:**
- `openDecision(topic, deadline?)`
- `addOption(decisionId, option)`
- `addEvidence(decisionId, evidence, source?)`
- `commitDecision(decisionId, optionId, reasoning)`
- `reviewOutcome(decisionId, quality, notes)`

## Network Agent

**Responsibilities:**
- Suggest warm intros (you know A, A knows B, you want B)
- Suggest reach-outs to stale-but-important relationships
- Detect when user is about to meet someone new and prepare profile

**Killer feature:** "Want to talk to <CEO of X>? You know <Y> who knows them. Here is a draft intro request to <Y>."

**Sub-tools:**
- `suggestIntros(targetEntityId)` → top 3 paths with draft messages
- `suggestReachouts(top_n)` → stale but high-value connections
- `prePersonBrief(entityId)` → context before first meeting

## Wisdom Agent

**Responsibilities:**
- Provide cross-user pattern insights with differential privacy
- "Founders at your stage typically face X around now"
- "Pattern detected: when you do Y, outcome tends to be Z" (per-user)

**Privacy enforcement:**
- Never reads raw cross-user memories.
- Reads only `wisdom_aggregates` table populated by DP-protected pipeline.
- Per-user patterns from own data only.
- Cross-user patterns only when k-anonymity ≥ 50 and DP noise (ε=1.0).

**Sub-tools:**
- `findPatternsForMe(domain)` → personal recurring patterns
- `findCohortInsights(stage, role, domain)` → DP-aggregated peer patterns
- `compareDecisions(decisionType)` → how similar decisions went for self + cohort

## Agent registration

All agents register in `packages/ai/agents/registry.ts`:

```typescript
export const agentRegistry = {
  master: () => new MasterOrchestrator(),
  email: () => new EmailAgent(),
  calendar: () => new CalendarAgent(),
  people: () => new PeopleAgent(),
  decision: () => new DecisionAgent(),
  network: () => new NetworkAgent(),
  wisdom: () => new WisdomAgent(),
} as const;
```

## Performance budgets

| Agent | p50 | p95 | Cost target |
|---|---|---|---|
| Master (single response) | 1.2s | 3s | $0.02 |
| Email triage (per email) | 0.5s | 2s | $0.005 |
| Meeting prep (per meeting) | 4s | 10s | $0.05 |
| Memory recall | 80ms | 200ms | $0.0001 |
| Decision file lookup | 100ms | 300ms | $0 |

## Eval per agent

Each agent has its own eval suite in `packages/ai/evals/<agent>/`. See `spec/evals.md`.
