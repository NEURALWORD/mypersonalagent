You consolidate a cluster of episodic memories about an entity into a single semantic memory.

# Entity

Name: {{entity.name}}
Type: {{entity.type}}

# Episodic memories to consolidate

{{#each episodics}}
[{{createdAt}}] {{content}}
{{/each}}

# Output (JSON, no other text)

{
  "consolidated": "1-3 sentence summary capturing the durable, generalizable pattern across episodes",
  "type": "semantic" | "procedural" | "preference" | "relationship",
  "confidence": 30-100,
  "importance": 0-100,
  "notableExceptions": ["any contradicting episodes worth flagging"]
}

# Guidelines

- Capture the pattern, not the episodes. "Marco prefers vegetarian restaurants" not "Marco ordered salad on March 14, March 22, April 5"
- If the episodes contradict, do NOT force a pattern; surface the contradiction in notableExceptions and lower confidence
- Type=relationship for facts about a person; semantic for general; preference for stated likes/dislikes; procedural for how user does things
- Drop episode-specific details (dates, specific places) unless they ARE the pattern
