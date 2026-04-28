# Spec — Voice Always-On

> Sub-600ms voice loop with interruption handling, cross-device handoff, opt-in always-on listening.

## Goal

User can speak to the agent any time, hands-free, with response feeling instant. Conversation flows like with a human assistant: barge-in, clarification, multi-turn, contextual references.

## Non-goals

- Wake word detection on-device for MVP (use push-to-talk button, then add wake word in phase 2).
- Phone calls in/out (later).

## Architecture

```
   ┌─────────────────────────────────────────────┐
   │              Client devices                 │
   │  (web, mobile, desktop, future earbuds)     │
   └───────────────────┬─────────────────────────┘
                       │   audio frames
                       ▼
              ┌─────────────────┐
              │   LiveKit room  │   (per-user persistent room)
              └────────┬────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │   Voice agent worker         │   apps/voice
        │   - Whisper streaming STT    │
        │   - VAD (voice activity)     │
        │   - LLM streaming response   │
        │   - Cartesia streaming TTS   │
        │   - Interruption handling    │
        └────────┬─────────────────────┘
                 │  events (transcript, response, intent)
                 ▼
        ┌──────────────────────────────┐
        │   Master orchestrator        │
        │   (same as text path)        │
        └──────────────────────────────┘
```

## Latency budget (CRITICAL)

End-to-end: user finishes speaking → first audible word from agent.

| Stage | Budget |
|---|---|
| VAD detects end of speech | 100ms |
| Whisper streaming finalize | 150ms |
| Master orchestrator first token | 200ms |
| Cartesia first audio chunk | 80ms |
| Network + jitter buffer | 70ms |
| **Total** | **600ms** |

Any change that pushes total over 600ms fails the eval.

## Streaming patterns

### STT (speech-to-text)

Use Whisper streaming via OpenAI Realtime API or Deepgram (eval both).

- Partial transcripts surfaced to UI as they arrive.
- Final transcript triggered by VAD silence > 500ms.
- Backchannels (uh-huh, mm) suppressed unless they begin a turn.

### LLM streaming

Master orchestrator runs in "voice mode":
- Shorter system prompt variant (`prompts/master/system.voice.v1.md`).
- Cap output to 3 sentences unless user asks elaboration.
- Streams token-by-token to TTS.
- Tool calls during voice → speak "let me check that" while tool runs in parallel.

### TTS

Cartesia (or ElevenLabs streaming as fallback).
- Streams audio in 80ms chunks.
- Voice cloned from user-selected sample (presets first, custom voice later).

### Interruption handling

If user starts speaking while agent is talking:
1. VAD on inbound triggers `user_started_talking` event.
2. Agent stops TTS immediately (cancel current synthesis stream).
3. Agent "remembers" what it was about to say (kept in scratchpad).
4. STT processes new user input.
5. Agent decides: was this a barge-in (continue) or correction (reset)?

## Cross-device handoff

User starts a conversation on phone, walks to desk. Should continue seamlessly on desktop.

**Mechanism:**
- All sessions for a user attach to the same LiveKit room.
- Conversation state (turn history, scratchpad, pending tools) lives in Redis with key `voice:session:{userId}`.
- When new device joins room, it subscribes to current state via Liveblocks.
- Agent identity is per-user, not per-device.

## Always-on opt-in

Off by default. User can enable in settings with explicit consent + clear UI indicator.

When on:
- Local VAD on-device (no audio sent to cloud unless intent detected).
- Wake phrase detection on-device (Picovoice or similar; phase 2).
- Hard kill switch (button + hardware mic mute respected).
- Visible "I am listening" indicator at all times.

For MVP, use push-to-talk button (web/mobile) + tap-to-talk on watch (future).

## Privacy enforcement

- No audio stored unless user explicitly says "save this conversation".
- Transcripts stored under user privacy settings (default: stored encrypted, retention 90d).
- Voice cloning samples user-uploaded, deleted on demand.
- All STT/TTS providers under DPA, no training on user audio.

## Failure modes

| Failure | Behavior |
|---|---|
| Whisper down | Fallback to Deepgram. If both, surface "voice unavailable" + offer text. |
| Cartesia down | Fallback to ElevenLabs. If both, surface "audio unavailable" + return text in chat. |
| Latency > 1s | UI shows latency warning, suggests text mode. |
| Interruption miss | If user keeps talking despite agent talking, force interrupt after 800ms. |

## Eval

Latency benchmarks:
- 50 sample utterances, recorded round-trip latency.
- Pass: p50 < 500ms, p95 < 800ms, p99 < 1500ms.

Quality benchmarks:
- ASR WER on 100 sample executive speech samples (jargon-heavy): < 8%.
- TTS MOS (mean opinion score from internal panel of 5): > 4.0.
- Interruption recovery success rate: > 95%.
