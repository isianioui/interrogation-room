import { create } from "zustand";
import { checkContradiction, createClaim } from "@/lib/ledger";
import { DIFFICULTY_CONFIG } from "@/lib/detectives";
import type {
  CaseFile,
  ClaimCategory,
  ClaimEntry,
  CompletedCase,
  ContradictionEvent,
  DetectiveProfile,
  Difficulty,
  PulsePoint,
  SuspicionHistoryPoint,
  TranscriptLine,
  Verdict,
} from "@/lib/types";

const HISTORY_KEY = "interrogation-room:history";
const DETECTIVES_KEY = "interrogation-room:detectives";
const SELECTED_DETECTIVE_KEY = "interrogation-room:selected-detective";
const SUSPICION_PER_CONTRADICTION = 20;

function loadHistory(): CompletedCase[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as CompletedCase[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: CompletedCase[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // ignore storage failures (private browsing, quota, etc.)
  }
}

function loadDetectives(): { detectives: DetectiveProfile[]; detectiveId: string | null } {
  if (typeof window === "undefined") return { detectives: [], detectiveId: null };
  try {
    const raw = window.localStorage.getItem(DETECTIVES_KEY);
    const detectives = raw ? (JSON.parse(raw) as DetectiveProfile[]) : [];
    const selected = window.localStorage.getItem(SELECTED_DETECTIVE_KEY);
    const detectiveId = detectives.some((d) => d.id === selected) ? selected : null;
    return { detectives, detectiveId };
  } catch {
    return { detectives: [], detectiveId: null };
  }
}

function saveDetectives(detectives: DetectiveProfile[], detectiveId: string | null) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DETECTIVES_KEY, JSON.stringify(detectives));
    if (detectiveId) window.localStorage.setItem(SELECTED_DETECTIVE_KEY, detectiveId);
    else window.localStorage.removeItem(SELECTED_DETECTIVE_KEY);
  } catch {
    // ignore storage failures (private browsing, quota, etc.)
  }
}

/** Timer length for a session: the selected case's own duration, else the difficulty default. */
function timerSecondsFor(detective: DetectiveProfile | undefined, difficulty: Difficulty) {
  return detective ? detective.durationMinutes * 60 : DIFFICULTY_CONFIG[difficulty].timerSeconds;
}

export function getSelectedDetective(state: {
  detectives: DetectiveProfile[];
  detectiveId: string | null;
}) {
  return state.detectives.find((d) => d.id === state.detectiveId);
}

interface GameState {
  // setup
  difficulty: Difficulty;
  detectives: DetectiveProfile[];
  detectivesLoaded: boolean;
  detectiveId: string | null;
  caseData: CaseFile | null;

  // session
  suspicion: number;
  suspicionHistory: SuspicionHistoryPoint[];
  pulse: PulsePoint[];
  ledger: ClaimEntry[];
  transcript: TranscriptLine[];
  contradictions: ContradictionEvent[];
  latestContradictionId: string | null;
  keyEvidenceLineIds: string[];

  recording: boolean;

  timerTotal: number;
  timerRemaining: number;
  timerRunning: boolean;

  verdict: Verdict;
  verdictReason: string;
  gameOver: boolean;

  history: CompletedCase[];

  // setup actions
  setDifficulty: (d: Difficulty) => void;
  loadDetectives: () => void;
  addDetective: (input: Omit<DetectiveProfile, "id" | "createdAt">) => void;
  removeDetective: (id: string) => void;
  setDetective: (id: string) => void;
  startCase: (caseData: CaseFile) => void;
  resetGame: () => void;

  // session actions
  addTranscriptLine: (line: Omit<TranscriptLine, "id">) => string;
  recordClaim: (
    category: ClaimCategory,
    value: string,
    quote: string,
    timestamp: number
  ) => ClaimEntry;
  checkContradictionAction: (
    category: ClaimCategory,
    value: string
  ) => ReturnType<typeof checkContradiction>;
  registerContradiction: (event: Omit<ContradictionEvent, "id">) => string;
  clearLatestContradiction: () => void;
  updateSuspicion: (delta: number, reason: string) => void;
  pushPulse: (value: number) => void;
  markKeyEvidence: (lineId: string) => void;
  flagSuspicious: () => void;

  tickTimer: (deltaSeconds: number) => void;
  startTimer: () => void;
  stopTimer: () => void;
  setRecording: (recording: boolean) => void;

  endInterrogation: (verdict: "guilty" | "released", reason: string) => void;
  addToHistory: (entry: CompletedCase) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  difficulty: "detective",
  // Loaded from localStorage after mount (see loadDetectives) to avoid an SSR hydration mismatch.
  detectives: [],
  detectivesLoaded: false,
  detectiveId: null,
  caseData: null,

  suspicion: 0,
  suspicionHistory: [],
  pulse: [],
  ledger: [],
  transcript: [],
  contradictions: [],
  latestContradictionId: null,
  keyEvidenceLineIds: [],

  recording: false,

  timerTotal: DIFFICULTY_CONFIG.detective.timerSeconds,
  timerRemaining: DIFFICULTY_CONFIG.detective.timerSeconds,
  timerRunning: false,

  verdict: null,
  verdictReason: "",
  gameOver: false,

  history: loadHistory(),

  // Difficulty and the selected case's rank are the same thing, so keep them in sync.
  setDifficulty: (d) =>
    set((state) => {
      const detectives = state.detectives.map((det) =>
        det.id === state.detectiveId ? { ...det, rank: d } : det
      );
      if (state.detectiveId) saveDetectives(detectives, state.detectiveId);
      const seconds = timerSecondsFor(getSelectedDetective({ ...state, detectives }), d);
      return { difficulty: d, detectives, timerTotal: seconds, timerRemaining: seconds };
    }),

  loadDetectives: () => {
    if (get().detectivesLoaded) return;
    const { detectives, detectiveId } = loadDetectives();
    set({ detectives, detectivesLoaded: true });
    if (detectiveId) get().setDetective(detectiveId);
  },

  addDetective: (input) => {
    const detective: DetectiveProfile = {
      ...input,
      id: `det-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ detectives: [detective, ...state.detectives] }));
    get().setDetective(detective.id);
  },

  removeDetective: (id) =>
    set((state) => {
      const detectives = state.detectives.filter((d) => d.id !== id);
      const detectiveId = state.detectiveId === id ? null : state.detectiveId;
      saveDetectives(detectives, detectiveId);
      const seconds = timerSecondsFor(
        getSelectedDetective({ detectives, detectiveId }),
        state.difficulty
      );
      return { detectives, detectiveId, timerTotal: seconds, timerRemaining: seconds };
    }),

  setDetective: (id) =>
    set((state) => {
      const detective = state.detectives.find((d) => d.id === id);
      if (!detective) return state;
      saveDetectives(state.detectives, id);
      const seconds = timerSecondsFor(detective, detective.rank);
      return {
        detectiveId: id,
        difficulty: detective.rank,
        timerTotal: seconds,
        timerRemaining: seconds,
      };
    }),

  startCase: (caseData) =>
    set((state) => ({
      caseData,
      suspicion: 0,
      suspicionHistory: [{ t: 0, value: 0, type: "delta", reason: "Interrogation begins" }],
      pulse: [],
      ledger: [],
      transcript: [],
      contradictions: [],
      latestContradictionId: null,
      keyEvidenceLineIds: [],
      recording: false,
      timerTotal: timerSecondsFor(getSelectedDetective(state), state.difficulty),
      timerRemaining: timerSecondsFor(getSelectedDetective(state), state.difficulty),
      timerRunning: false,
      verdict: null,
      verdictReason: "",
      gameOver: false,
    })),

  resetGame: () =>
    set({
      caseData: null,
      suspicion: 0,
      suspicionHistory: [],
      pulse: [],
      ledger: [],
      transcript: [],
      contradictions: [],
      latestContradictionId: null,
      keyEvidenceLineIds: [],
      recording: false,
      timerRunning: false,
      verdict: null,
      verdictReason: "",
      gameOver: false,
    }),

  addTranscriptLine: (line) => {
    const id = `line-${line.timestamp}-${Math.random().toString(36).slice(2, 8)}`;
    set((state) => ({
      transcript: [...state.transcript, { ...line, id }],
    }));
    return id;
  },

  recordClaim: (category, value, quote, timestamp) => {
    const state = get();
    const result = checkContradiction(state.ledger, category, value);
    const claim = createClaim(
      category,
      value,
      quote,
      timestamp,
      result?.contradicts
        ? { originalQuote: result.original_quote, originalTimestamp: result.original_timestamp }
        : undefined
    );
    set((s) => ({ ledger: [...s.ledger, claim] }));
    if (result?.contradicts) {
      get().registerContradiction({
        category,
        newQuote: quote,
        newTimestamp: timestamp,
        originalQuote: result.original_quote,
        originalTimestamp: result.original_timestamp,
      });
    }
    return claim;
  },

  checkContradictionAction: (category, value) => {
    return checkContradiction(get().ledger, category, value);
  },

  registerContradiction: (event) => {
    const id = `contradiction-${event.newTimestamp}-${Math.random().toString(36).slice(2, 8)}`;
    set((state) => ({
      contradictions: [...state.contradictions, { ...event, id }],
      latestContradictionId: id,
    }));
    get().updateSuspicion(
      SUSPICION_PER_CONTRADICTION,
      `Contradiction caught: ${event.category} claim didn't match an earlier statement`
    );
    return id;
  },

  clearLatestContradiction: () => set({ latestContradictionId: null }),

  updateSuspicion: (delta, reason) =>
    set((state) => {
      const next = Math.max(0, Math.min(100, state.suspicion + delta));
      return {
        suspicion: next,
        suspicionHistory: [
          ...state.suspicionHistory,
          {
            t: state.timerTotal - state.timerRemaining,
            value: next,
            reason,
            type: "delta",
          },
        ],
      };
    }),

  pushPulse: (value) =>
    set((state) => ({
      pulse: [...state.pulse.slice(-29), { t: Date.now(), value }],
    })),

  markKeyEvidence: (lineId) =>
    set((state) => ({
      keyEvidenceLineIds: state.keyEvidenceLineIds.includes(lineId)
        ? state.keyEvidenceLineIds
        : [...state.keyEvidenceLineIds, lineId],
      transcript: state.transcript.map((line) =>
        line.id === lineId ? { ...line, isKeyEvidence: true } : line
      ),
    })),

  flagSuspicious: () => {
    get().updateSuspicion(10, "Detective flagged the suspect as suspicious");
  },

  tickTimer: (deltaSeconds) =>
    set((state) => {
      if (!state.timerRunning) return state;
      const remaining = Math.max(0, state.timerRemaining - deltaSeconds);
      return { timerRemaining: remaining };
    }),

  startTimer: () => set({ timerRunning: true }),
  stopTimer: () => set({ timerRunning: false }),
  setRecording: (recording) => set({ recording }),

  endInterrogation: (verdict, reason) => {
    set({ verdict, verdictReason: reason, gameOver: true, timerRunning: false, recording: false });
    const state = get();
    if (state.caseData) {
      const detective = getSelectedDetective(state);
      state.addToHistory({
        id: `case-${Date.now()}`,
        caseName: state.caseData.name,
        detectiveId: detective?.id,
        detectiveName: detective?.name,
        suspectName: detective?.suspectName,
        difficulty: state.difficulty,
        verdict,
        suspicion: state.suspicion,
        date: new Date().toISOString(),
      });
    }
  },

  addToHistory: (entry) =>
    set((state) => {
      const history = [entry, ...state.history].slice(0, 50);
      saveHistory(history);
      return { history };
    }),
}));
