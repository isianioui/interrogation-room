import type { Difficulty } from "./types";

export const DIFFICULTY_ORDER: Difficulty[] = ["rookie", "detective", "chief"];

export const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; timerSeconds: number }> = {
  rookie: {
    label: "Rookie",
    timerSeconds: 5 * 60,
  },
  detective: {
    label: "Detective",
    timerSeconds: 4 * 60,
  },
  chief: {
    label: "Chief",
    timerSeconds: 3 * 60,
  },
};

export const MIN_DURATION_MINUTES = 1;
export const MAX_DURATION_MINUTES = 60;
