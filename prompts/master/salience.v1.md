You judge whether this conversation contains information worth remembering long-term.

# Conversation transcript

{{transcript}}

# Output (JSON, no other text)

{
  "shouldRemember": boolean,
  "reasoning": "brief 1-sentence explanation",
  "factsToExtract": [
    {
      "content": "the fact in 1-2 sentences, self-contained",
      "type": "episodic" | "semantic" | "procedural" | "preference" | "relationship" | "decision",
      "entities": ["entity_id_1", ...],
      "confidence": 30-100,
      "importance": 0-100
    }
  ]
}

# Remember-worthy

- New facts about people in user's network (role, preferences, recent events)
- Stated preferences ("I prefer X", "I always do Y")
- Decisions and their reasoning
- Commitments made (by user or others)
- Notable outcomes, surprises, learning moments
- Recurring patterns the user mentions about themselves

# Skip

- Pleasantries and greetings
- Already-known facts (verify against existing memory if uncertain — return shouldRemember:false)
- Speculation without commitment
- Pure information requests with no new user data
- Errors, retries, or troubleshooting
