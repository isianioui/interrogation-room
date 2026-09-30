"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ContradictionEvent, TranscriptLine } from "@/lib/types";

interface StoryTimelineProps {
  transcript: TranscriptLine[];
  contradictions: ContradictionEvent[];
}

const MATCH_WINDOW = 1;

export function StoryTimeline({ transcript, contradictions }: StoryTimelineProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const suspectLines = transcript.filter((l) => l.speaker === "suspect");

  return (
    <div className="flex flex-col gap-2">
      {suspectLines.map((line) => {
        const contradiction = contradictions.find(
          (c) => Math.abs(c.newTimestamp - line.timestamp) <= MATCH_WINDOW
        );
        const isOpen = expanded === line.id;
        return (
          <div key={line.id}>
            <button
              type="button"
              onClick={() => contradiction && setExpanded(isOpen ? null : line.id)}
              className={`w-full rounded-md border px-3 py-2 text-left font-mono text-sm transition-colors ${
                contradiction
                  ? "cursor-pointer border-noir-red/50 bg-noir-red/10 hover:bg-noir-red/15"
                  : "border-border bg-muted/20"
              }`}
            >
              <span className="mr-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                {line.timestamp}s
              </span>
              {line.text}
            </button>
            <AnimatePresence>
              {isOpen && contradiction && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-1 grid grid-cols-1 gap-2 rounded-md border border-noir-red/30 bg-card p-3 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                        Originally, at {contradiction.originalTimestamp}s
                      </p>
                      <p className="font-mono text-xs">&ldquo;{contradiction.originalQuote}&rdquo;</p>
                    </div>
                    <div>
                      <p className="mb-1 text-[10px] uppercase tracking-widest text-noir-red">
                        Contradicted, at {contradiction.newTimestamp}s
                      </p>
                      <p className="font-mono text-xs">&ldquo;{contradiction.newQuote}&rdquo;</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
      {suspectLines.length === 0 && (
        <p className="text-sm italic text-muted-foreground">No statements were recorded.</p>
      )}
    </div>
  );
}
