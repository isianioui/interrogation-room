# The Interrogation Room

A noir-themed party game built for the AssemblyAI Voice Agent Hackathon (lablab.ai, Sep 2026). Two real people share one microphone — one plays detective, one plays suspect — and interrogate each other over a case file. The AI never speaks; it's a silent analyst that transcribes the conversation in real time, works out who's talking from what they say (AssemblyAI's streaming API has no speaker diarization), logs every claim the suspect makes (times, places, people, objects), and catches the instant a new claim contradicts an earlier one, quoting the suspect's own words back on a live contradiction board as the suspicion meter climbs.

## Tech stack

Next.js App Router (TypeScript), Tailwind CSS, shadcn/ui, Framer Motion, Recharts, Zustand, html-to-image, lucide-react, AssemblyAI's Realtime Streaming Speech-to-Text API, and Groq's free-tier API (`openai/gpt-oss-20b`) for a second-pass semantic contradiction check.

## Getting started

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Set these in `.env.local` (never commit this file):

| Variable | Description |
| --- | --- |
| `ASSEMBLYAI_API_KEY` | Your AssemblyAI API key. Server-side only — used by `/api/token` to mint short-lived Streaming STT session tokens. Never sent to the browser. |
| `GROQ_API_KEY` | Your free Groq API key ([console.groq.com](https://console.groq.com)). Server-side only — used by `/api/check` to double-check a suspect's claim against earlier ones for subtler, non-literal contradictions. |
| `NEXT_PUBLIC_MOCK_VOICE` | `"true"` (default) runs the whole game on a scripted two-person mock conversation — no mic, no API credits spent, every UI feature fully testable. Set to `"false"` only once you're ready to test with a real mic and two real people. |

## Mock mode vs. real voice

The app was built mock-first: every screen, chart, and interaction (the claim ledger, contradiction board, suspicion meter, speaker role locking, verdict report) works end-to-end against `lib/mockVoice.ts`, which fires a scripted two-speaker conversation (detective questions, suspect answers that deliberately contradict themselves) through the same speaker-mapping and claim-extraction pipeline real audio uses. A "MOCK MODE" badge appears on `/room` whenever it's active.

Flip `NEXT_PUBLIC_MOCK_VOICE=false` to switch to the real AssemblyAI Streaming STT client (`lib/voiceAgent.ts`): it mints a one-time token via `/api/token`, opens a WebSocket to `wss://streaming.assemblyai.com/v3/ws`, and streams mic audio captured through an AudioWorklet (`public/worklets/pcm-processor.js`) as raw PCM16 mono 16kHz binary frames. AssemblyAI's streaming API doesn't diarize speakers (that only exists on their separate async/batch API), so with two people sharing one microphone there's no speaker signal to lean on at all — `lib/speakerDetection.ts` classifies each finalized turn purely by what it sounds like: questions/commands are the detective, everything else is the suspect answering. The detective always opens, so the first turn is forced to detective regardless of phrasing. Either person can also tap "I'm the Detective" / "I'm the Suspect" in the room to force the next line's role, for the rare non-question detective line ("So you're lying.") the heuristic gets wrong.

## How a claim gets caught

1. A final transcript `Turn` comes in from AssemblyAI.
2. `SpeakerMapper.classify` classifies it as `"detective"` or `"suspect"` purely from its content (question/command vs. answer) — there's no speaker signal to use instead.
3. If it's the suspect talking, `lib/ledger.ts`'s `extractClaims()` pulls out any time/place/person/object claims via a lightweight rule-based pass.
4. Each claim is checked against the ledger's established facts for that category (`checkContradiction`) — an instant, local, string-similarity check.
5. In parallel, `/api/check` asks Groq (`openai/gpt-oss-20b`, free tier) to compare the new claim against the suspect's earlier claims in that category, catching contradictions the local heuristic misses because they're worded differently.
6. Any contradiction found either way lands on the live Contradiction Board with both quotes and timestamps, and a beep plays.

## Project structure

- `app/` — pages (`/`, `/briefing`, `/room`, `/report`) and API routes (`/api/token`, `/api/case`, `/api/check`, `/api/report`)
- `components/` — landing, corkboard/briefing, interrogation dashboard, and report UI
- `lib/` — claim ledger + extraction + contradiction logic (`ledger.ts`), speaker role mapping (`speakerDetection.ts`), pre-written cases (`cases.ts`), scoring (`scoring.ts`), mock and real transcription clients (`mockVoice.ts`, `voiceAgent.ts`), and mic capture (`audio.ts`)
- `store/gameStore.ts` — the Zustand store holding suspicion, the ledger, transcript, timer, and case state
- `public/worklets/pcm-processor.js` — AudioWorklet that downsamples mic audio to PCM16 16kHz for streaming

## Deploying

```bash
vercel deploy
```

Set `ASSEMBLYAI_API_KEY`, `GROQ_API_KEY`, and `NEXT_PUBLIC_MOCK_VOICE` in your Vercel project's environment variables.

## Hackathon submission blurb

**The Interrogation Room** turns two people and one microphone into a noir interrogation. One plays detective, one plays suspect, and AssemblyAI's real-time Streaming Speech-to-Text quietly transcribes the whole exchange — the AI never speaks. As the suspect answers, a claim ledger extracts every time, place, person, and object they mention, cross-checks it against what they said earlier (backed by a free Groq-powered second-pass semantic check), and the moment a claim contradicts an earlier one, it lands on a live contradiction board with both quotes side by side while the suspicion meter climbs. The detective can flag suspicious answers or mark key evidence live, then close the case into a full report — suspicion timeline, skill radar, talk ratio, weak-spot breakdown, and a shareable case-file verdict poster.
