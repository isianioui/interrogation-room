"use client";

import { useEffect, useRef } from "react";
import { Star } from "lucide-react";
import type { ClaimEntry, TranscriptLine } from "@/lib/types";
import { ClaimChip } from "./ClaimChip";

interface LiveTranscriptProps {
  lines: TranscriptLine[];
  ledger: ClaimEntry[];
}

const CLAIM_WINDOW_SECONDS = 1;

export function LiveTranscript({ lines, ledger }: LiveTranscriptProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lines.length]);

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto pr-1">
      {lines.length === 0 && (
        <p className="text-sm text-muted-foreground italic">
          Waiting for the conversation to start...
        </p>
      )}
      {lines.map((line) => {
        const isDetective = line.speaker === "detective";
        const claims = isDetective
          ? []
          : ledger.filter((c) => Math.abs(c.timestamp - line.timestamp) <= CLAIM_WINDOW_SECONDS);

        return (
          <div key={line.id} className="flex flex-col gap-1.5">
            <div
              className={
                isDetective
                  ? "self-start text-left italic text-muted-foreground text-xs max-w-[80%]"
                  : `self-end text-right max-w-[85%] rounded-lg px-3 py-2 font-mono text-base bg-secondary ${
                      line.isKeyEvidence ? "ring-1 ring-noir-amber" : ""
                    }`
              }
            >
              <span
                className={`block text-[10px] uppercase tracking-widest ${
                  isDetective ? "text-muted-foreground" : "text-noir-amber"
                }`}
              >
                {isDetective ? "Detective" : "Suspect"} · {line.timestamp}s
                {line.isKeyEvidence && (
                  <Star className="ml-1 inline size-3 fill-noir-amber text-noir-amber" />
                )}
              </span>
              <span>{line.text}</span>
            </div>
            {claims.length > 0 && (
              <div className="flex flex-wrap justify-end gap-1.5">
                {claims.map((c) => (
                  <ClaimChip
                    key={c.id}
                    category={c.category}
                    value={c.value}
                    contradicted={!!c.contradicts}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
