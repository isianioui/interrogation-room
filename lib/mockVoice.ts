import type { SpeakerMapper } from "@/lib/speakerDetection";
import type { VoiceAgentCallbacks } from "@/lib/voiceTypes";
import type { CaseFile } from "@/lib/types";

interface ScriptBeat {
  delayMs: number;
  /** Mock's own stand-in speaker label — real AssemblyAI streaming has no such field. */
  speakerLabel: "A" | "B";
  text: (caseData: CaseFile) => string;
}

/**
 * Two-person conversation: A asks questions (the detective), B answers (the
 * suspect). B's answers deliberately contradict themselves after turn 6 so
 * the ledger has something real to catch, exactly like a live session would.
 */
function buildScript(caseData: CaseFile): ScriptBeat[] {
  const facts = caseData.alibiFacts;

  return [
    { delayMs: 800, speakerLabel: "A", text: () => `Let's go over your story. Walk me through the night in question.` },
    { delayMs: 4200, speakerLabel: "B", text: (c) => c.alibi },
    { delayMs: 3600, speakerLabel: "A", text: () => `What time exactly did that start?` },
    { delayMs: 3800, speakerLabel: "B", text: () => `Like I said — around ${facts.time ?? "that time"}.` },
    { delayMs: 3600, speakerLabel: "A", text: () => `Were you with anyone who can back that up?` },
    { delayMs: 3800, speakerLabel: "B", text: () => `${facts.person ?? "No one else was there"}, if that matters.` },
    { delayMs: 4200, speakerLabel: "A", text: () => `Let's slow down. Tell me again, what time did you actually get there?` },
    { delayMs: 4200, speakerLabel: "B", text: () => `I— it was closer to midnight, actually.` },
    { delayMs: 3800, speakerLabel: "A", text: () => `That's not what you just told me.` },
    { delayMs: 4200, speakerLabel: "B", text: () => `Fine — I stopped somewhere else first, but it doesn't change anything.` },
    { delayMs: 3800, speakerLabel: "A", text: () => `Try again. Where were you, really?` },
    { delayMs: 4600, speakerLabel: "B", text: () => `Okay, look, I panicked. But I didn't do this.` },
  ];
}

export class MockVoiceAgent {
  private timeouts: ReturnType<typeof setTimeout>[] = [];
  private pulseInterval: ReturnType<typeof setInterval> | null = null;
  private connected = false;
  private startedAt = 0;

  constructor(
    private caseData: CaseFile,
    private mapper: SpeakerMapper,
    private callbacks: VoiceAgentCallbacks
  ) {}

  connect() {
    this.connected = true;
    this.startedAt = Date.now();
    this.callbacks.onConnected?.();

    this.pulseInterval = setInterval(() => {
      if (!this.connected) return;
      const base = 30 + Math.random() * 40;
      this.callbacks.onPulse?.(Math.round(base));
    }, 2000);

    const script = buildScript(this.caseData);
    let cumulativeDelay = 0;
    for (const beat of script) {
      cumulativeDelay += beat.delayMs;
      const timeout = setTimeout(() => this.runBeat(beat), cumulativeDelay);
      this.timeouts.push(timeout);
    }
  }

  private runBeat(beat: ScriptBeat) {
    if (!this.connected) return;
    const elapsedSeconds = Math.round((Date.now() - this.startedAt) / 1000);
    const wasLocked = this.mapper.isLocked();
    const role = this.mapper.resolveLabel(beat.speakerLabel);
    if (!wasLocked && this.mapper.isLocked()) {
      this.callbacks.onSpeakerLocked?.();
    }
    this.callbacks.onTranscript(role, beat.text(this.caseData), elapsedSeconds);
  }

  setMuted(_muted: boolean) {
    // no-op in mock mode
  }

  disconnect() {
    this.connected = false;
    this.timeouts.forEach(clearTimeout);
    this.timeouts = [];
    if (this.pulseInterval) clearInterval(this.pulseInterval);
    this.pulseInterval = null;
    this.callbacks.onDisconnected?.();
  }
}
