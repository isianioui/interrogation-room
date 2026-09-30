import type { Speaker } from "@/lib/types";

/**
 * The AI never speaks in this app — it's a silent analyst. Both the mock and
 * real clients only ever report transcript lines already resolved to a role
 * (detective or suspect) via the shared SpeakerMapper.
 */
export interface VoiceAgentCallbacks {
  onTranscript: (speaker: Speaker, text: string, timestamp: number) => void;
  onPulse?: (value: number) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  /** Fired once both speaker labels have been seen and the mapping is locked. */
  onSpeakerLocked?: () => void;
}

export interface VoiceAgentClient {
  connect: () => void | Promise<void>;
  disconnect: () => void;
  setMuted: (muted: boolean) => void;
}
