"use client";

import { DIFFICULTY_CONFIG, DIFFICULTY_ORDER } from "@/lib/detectives";
import type { Difficulty } from "@/lib/types";

interface DifficultySelectorProps {
  value: Difficulty;
  onChange: (value: Difficulty) => void;
}

export function DifficultySelector({ value, onChange }: DifficultySelectorProps) {
  return (
    <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
      {DIFFICULTY_ORDER.map((d) => {
        const config = DIFFICULTY_CONFIG[d];
        const active = value === d;
        return (
          <button
            key={d}
            type="button"
            onClick={() => onChange(d)}
            className={`rounded-lg border p-4 text-left transition-colors ${
              active
                ? "border-noir-amber bg-noir-amber/10"
                : "border-border bg-card/40 hover:border-noir-amber/40"
            }`}
          >
            <p className="font-heading text-lg font-semibold">{config.label}</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {Math.round(config.timerSeconds / 60)} min default
            </p>
          </button>
        );
      })}
    </div>
  );
}
