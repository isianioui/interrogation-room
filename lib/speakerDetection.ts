import type { Speaker, SpeakerLabel } from "@/lib/types";

const QUESTION_STARTERS =
  /^(who|what|where|when|why|how|did|were|was|are|do|does|can|could|would|have|has|is|will)\b/i;
const IMPERATIVE_STARTERS =
  /^(tell|explain|describe|walk|state|name|list|give|go on|continue|try again|let'?s)\b/i;
// Accusatory call-outs and closers a detective says but a suspect almost
// never would ("you said/told me...", "that's not what...", "we're done").
const DETECTIVE_TELLS =
  /\byou (said|told|mentioned|claimed|stated)\b|that'?s not what|we'?re done\b/i;

/** A literal question, command, or detective-only phrasing is an unambiguous signal. */
function soundsLikeDetective(text: string): boolean {
  const trimmed = text.trim();
  return (
    trimmed.endsWith("?") ||
    QUESTION_STARTERS.test(trimmed) ||
    IMPERATIVE_STARTERS.test(trimmed) ||
    DETECTIVE_TELLS.test(trimmed)
  );
}

/**
 * Classifies a single finalized utterance: a question, command, or
 * detective-only phrasing ("you said...", "that's not what...") is the
 * detective, everything else is the suspect answering. AssemblyAI's
 * real-time Streaming API has no speaker diarization at all (that only
 * exists on their separate async/batch transcription API) — there is no
 * `speaker_label` field on a Turn message — so with two people sharing one
 * microphone, content is the *only* signal available for real audio. It
 * will still misjudge a short, genuinely ambiguous interjection ("Okay.",
 * "Wait.") that either person could plausibly say; the manual "I'm the
 * Detective" / "I'm the Suspect" tap exists to correct exactly that case.
 */
export function classifyTurn(text: string): Speaker {
  return soundsLikeDetective(text) ? "detective" : "suspect";
}

/**
 * Resolves each finalized turn to a role ("detective" or "suspect").
 *
 * Real audio: role comes purely from classifyTurn, since there's no speaker
 * signal from AssemblyAI to use instead. The detective always opens the
 * interrogation, so the very first turn is forced to "detective" even if
 * it isn't phrased as a question. A manual role tap arms the next turn only.
 *
 * Mock mode resolves by (pre-authored, stable) label identity instead
 * (resolveLabel), since its script assigns "A"/"B" itself — that's a stand-in
 * for a diarization label the real API doesn't actually provide.
 */
export class SpeakerMapper {
  private labelToRole = new Map<SpeakerLabel, Speaker>();
  private pendingRole: Speaker | null = null;
  private rolesSeen = new Set<Speaker>();

  /** Arms the next turn (real audio) or next unseen label (mock) to resolve to this role. */
  armNextLabelAs(role: Speaker) {
    this.pendingRole = role;
  }

  /** Mock-mode path: labels are pre-authored and stable, so lock by label identity. */
  resolveLabel(label: SpeakerLabel): Speaker {
    const existing = this.labelToRole.get(label);
    if (existing) return existing;

    let role: Speaker;
    if (this.pendingRole) {
      role = this.pendingRole;
      this.pendingRole = null;
    } else {
      role = this.labelToRole.size === 0 ? "detective" : "suspect";
    }
    this.labelToRole.set(label, role);
    this.rolesSeen.add(role);
    return role;
  }

  /** Real-audio path: no speaker signal exists, so classify purely from content. */
  classify(text: string): Speaker {
    let role: Speaker;
    if (this.pendingRole) {
      role = this.pendingRole;
      this.pendingRole = null;
    } else if (this.rolesSeen.size === 0) {
      role = "detective";
    } else {
      role = classifyTurn(text);
    }
    this.rolesSeen.add(role);
    return role;
  }

  isLocked(): boolean {
    return this.rolesSeen.size >= 2;
  }

  reset() {
    this.labelToRole.clear();
    this.rolesSeen.clear();
    this.pendingRole = null;
  }
}
