import { MockVoiceAgent } from "@/lib/mockVoice";
import type { SpeakerMapper } from "@/lib/speakerDetection";
import type { VoiceAgentCallbacks, VoiceAgentClient } from "@/lib/voiceTypes";
import type { CaseFile } from "@/lib/types";

export type { VoiceAgentClient } from "@/lib/voiceTypes";

export const MOCK_VOICE = process.env.NEXT_PUBLIC_MOCK_VOICE !== "false";

export async function createVoiceAgent(
  caseData: CaseFile,
  mapper: SpeakerMapper,
  callbacks: VoiceAgentCallbacks
): Promise<VoiceAgentClient> {
  if (MOCK_VOICE) {
    return new MockVoiceAgent(caseData, mapper, callbacks);
  }

  // Real AssemblyAI Streaming STT connection is wired in lib/voiceAgent.ts.
  // Loaded lazily so the mock-mode build never needs the real client.
  const { RealVoiceAgent } = await import("@/lib/voiceAgent");
  return new RealVoiceAgent(mapper, callbacks);
}
