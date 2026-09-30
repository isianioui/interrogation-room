import { startMicCapture, type MicCapture } from "@/lib/audio";
import type { SpeakerMapper } from "@/lib/speakerDetection";
import type { VoiceAgentCallbacks, VoiceAgentClient } from "@/lib/voiceTypes";

const WS_URL = "wss://streaming.assemblyai.com/v3/ws";

/**
 * Real AssemblyAI Streaming (Universal-Streaming v3) Speech-to-Text client.
 * Two humans share one mic; this only transcribes — it never speaks. The
 * streaming API has no speaker diarization (that's only on AssemblyAI's
 * separate async/batch API), so role assignment happens purely from
 * transcript content via SpeakerMapper.classify. Protocol reference:
 * https://www.assemblyai.com/docs/streaming/api-spec/streaming-websocket
 * (token minting: .../authenticate-with-a-temporary-token)
 */
export class RealVoiceAgent implements VoiceAgentClient {
  private ws: WebSocket | null = null;
  private mic: MicCapture | null = null;
  private startedAt = 0;
  private wordsSincePulse = 0;
  private pulseInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private mapper: SpeakerMapper,
    private callbacks: VoiceAgentCallbacks
  ) {}

  async connect() {
    const res = await fetch("/api/token");
    if (!res.ok) throw new Error("Failed to fetch AssemblyAI streaming token");
    const { token } = (await res.json()) as { token: string };

    const url = new URL(WS_URL);
    url.searchParams.set("token", token);
    url.searchParams.set("sample_rate", "16000");
    url.searchParams.set("encoding", "pcm_s16le");

    this.startedAt = Date.now();

    await new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(url);
      this.ws = ws;

      ws.addEventListener("message", (event) => {
        this.handleMessage(event.data, resolve);
      });

      ws.addEventListener("error", () => {
        reject(new Error("Streaming WebSocket error"));
      });

      ws.addEventListener("close", () => {
        this.callbacks.onDisconnected?.();
      });
    });

    this.mic = await startMicCapture((pcm16Chunk) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(pcm16Chunk);
      }
    });

    this.pulseInterval = setInterval(() => {
      const value = Math.min(100, 15 + this.wordsSincePulse * 12);
      this.wordsSincePulse = 0;
      this.callbacks.onPulse?.(value);
    }, 2000);

    this.callbacks.onConnected?.();
  }

  private elapsedSeconds() {
    return Math.round((Date.now() - this.startedAt) / 1000);
  }

  private handleMessage(data: unknown, onReady: () => void) {
    if (typeof data !== "string") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic protocol payload, narrowed per `msg.type` below.
    let msg: any;
    try {
      msg = JSON.parse(data);
    } catch {
      return;
    }

    switch (msg.type) {
      case "Begin":
        onReady();
        break;

      case "Turn": {
        const words = msg.words ?? [];
        this.wordsSincePulse += words.length;

        if (msg.end_of_turn && typeof msg.transcript === "string" && msg.transcript.trim()) {
          const wasLocked = this.mapper.isLocked();
          const role = this.mapper.classify(msg.transcript);
          if (!wasLocked && this.mapper.isLocked()) {
            this.callbacks.onSpeakerLocked?.();
          }
          this.callbacks.onTranscript(role, msg.transcript, this.elapsedSeconds());
        }
        break;
      }

      case "Termination":
        this.disconnect();
        break;

      default:
        break;
    }
  }

  setMuted(muted: boolean) {
    this.mic?.setMuted(muted);
  }

  disconnect() {
    if (this.pulseInterval) clearInterval(this.pulseInterval);
    this.pulseInterval = null;
    this.mic?.stop();
    this.mic = null;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "Terminate" }));
    }
    this.ws?.close();
    this.ws = null;
  }
}
