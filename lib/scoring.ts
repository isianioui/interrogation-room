import type {
  ClaimEntry,
  ContradictionEvent,
  RadarScores,
  ReportData,
  SuspicionHistoryPoint,
  TalkRatio,
  TranscriptLine,
  WeakSpots,
} from "@/lib/types";

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

export interface ReportInput {
  ledger: ClaimEntry[];
  transcript: TranscriptLine[];
  contradictions: ContradictionEvent[];
  suspicionHistory: SuspicionHistoryPoint[];
  suspicion: number;
}

function computeWeakSpots(contradictions: ContradictionEvent[]): WeakSpots {
  const spots: WeakSpots = { time: 0, place: 0, person: 0, object: 0 };
  for (const c of contradictions) {
    spots[c.category] += 1;
  }
  return spots;
}

function computeTalkRatio(transcript: TranscriptLine[]): TalkRatio {
  let suspectChars = 0;
  let detectiveChars = 0;
  for (const line of transcript) {
    if (line.speaker === "suspect") suspectChars += line.text.length;
    else detectiveChars += line.text.length;
  }
  const total = suspectChars + detectiveChars;
  if (total === 0) return { suspect: 50, detective: 50 };
  return {
    suspect: Math.round((suspectChars / total) * 100),
    detective: Math.round((detectiveChars / total) * 100),
  };
}

function computeAverageResponseGap(transcript: TranscriptLine[]): number {
  const suspectTimestamps = transcript
    .filter((l) => l.speaker === "suspect")
    .map((l) => l.timestamp);
  if (suspectTimestamps.length < 2) return 4;
  let totalGap = 0;
  for (let i = 1; i < suspectTimestamps.length; i++) {
    totalGap += suspectTimestamps[i] - suspectTimestamps[i - 1];
  }
  return totalGap / (suspectTimestamps.length - 1);
}

function computeRadar(input: ReportInput): RadarScores {
  const { ledger, contradictions, suspicion, transcript } = input;

  const consistency = clamp(100 - contradictions.length * 18);

  const composure = clamp(100 - suspicion);

  const distinctCategories = new Set(ledger.map((c) => c.category)).size;
  const detail = clamp(distinctCategories * 15 + Math.min(ledger.length, 10) * 4);

  const talkRatio = computeTalkRatio(transcript);
  const evasion = clamp(talkRatio.suspect * 1.3);

  const avgGapSeconds = computeAverageResponseGap(transcript);
  const speed = clamp(100 - avgGapSeconds * 5);

  return { consistency, composure, detail, speed, evasion };
}

export function computeReport(input: ReportInput): ReportData {
  return {
    radar: computeRadar(input),
    talkRatio: computeTalkRatio(input.transcript),
    weakSpots: computeWeakSpots(input.contradictions),
    suspicionHistory: input.suspicionHistory,
    contradictions: input.contradictions,
    transcript: input.transcript,
  };
}
