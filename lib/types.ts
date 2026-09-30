export type Difficulty = "rookie" | "detective" | "chief";

/** A detective-created case: who is interrogating whom, at what rank, for how long. */
export interface DetectiveProfile {
  id: string;
  /** The detective's name. */
  name: string;
  suspectName: string;
  /** The detective's rank — the same three tiers as difficulty. */
  rank: Difficulty;
  durationMinutes: number;
  createdAt: string;
}

export type ClaimCategory = "time" | "place" | "person" | "object";

export interface Evidence {
  id: string;
  label: string;
  /** Shown on the corkboard before it's revealed. */
  teaser: string;
  /** The clue text released by the reveal_evidence tool. */
  clue: string;
  /** Whether this piece of evidence actually contradicts the alibi, or is a bluff. */
  isBluff: boolean;
  /** Category this evidence pressures the suspect on. */
  targetCategory: ClaimCategory;
}

export interface CaseFile {
  id: string;
  name: string;
  crimeSummary: string;
  location: string;
  timeOfCrime: string;
  suspectDescription: string;
  /** The alibi text shown to the player on the briefing card. */
  alibi: string;
  /** Key alibi facts the detective secretly knows to probe / contradict. */
  alibiFacts: Partial<Record<ClaimCategory, string>>;
  evidence: Evidence[];
}

export interface ClaimEntry {
  id: string;
  category: ClaimCategory;
  value: string;
  quote: string;
  timestamp: number;
  contradicts?: {
    originalQuote: string;
    originalTimestamp: number;
  };
}

export interface ContradictionEvent {
  id: string;
  category: ClaimCategory;
  newQuote: string;
  newTimestamp: number;
  originalQuote: string;
  originalTimestamp: number;
}

/** The two real humans in the room. The AI never speaks — it only listens. */
export type Speaker = "detective" | "suspect";

/** Mock mode's own stand-in speaker label ("A"/"B") — real audio has no such label. */
export type SpeakerLabel = string;

export interface TranscriptLine {
  id: string;
  speaker: Speaker;
  text: string;
  timestamp: number;
  /** Populated when this line is where a contradiction was caught. */
  contradictionId?: string;
  /** True once the detective taps "Mark as key evidence" on this line. */
  isKeyEvidence?: boolean;
}

export interface SuspicionHistoryPoint {
  t: number;
  value: number;
  reason?: string;
  type?: "contradiction" | "evidence" | "delta" | "silence" | "lawyer";
}

export interface PulsePoint {
  t: number;
  value: number;
}

export type Verdict = "guilty" | "released" | null;

export interface CompletedCase {
  id: string;
  caseName: string;
  /** Legacy entries (from the old fixed personas) only have detectiveId. */
  detectiveId?: string;
  detectiveName?: string;
  suspectName?: string;
  difficulty: Difficulty;
  verdict: Verdict;
  suspicion: number;
  date: string;
}

export interface RadarScores {
  consistency: number;
  composure: number;
  detail: number;
  speed: number;
  evasion: number;
}

export interface TalkRatio {
  suspect: number;
  detective: number;
}

export interface WeakSpots {
  time: number;
  place: number;
  person: number;
  object: number;
}

export interface ReportData {
  radar: RadarScores;
  talkRatio: TalkRatio;
  weakSpots: WeakSpots;
  suspicionHistory: SuspicionHistoryPoint[];
  contradictions: ContradictionEvent[];
  transcript: TranscriptLine[];
}
