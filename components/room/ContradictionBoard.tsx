"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Clock, MapPin, Package, User } from "lucide-react";
import type { ClaimCategory, ContradictionEvent } from "@/lib/types";

interface ContradictionBoardProps {
  contradictions: ContradictionEvent[];
}

const CATEGORY_ICON: Record<ClaimCategory, typeof Clock> = {
  time: Clock,
  place: MapPin,
  person: User,
  object: Package,
};

export function ContradictionBoard({ contradictions }: ContradictionBoardProps) {
  const newestFirst = [...contradictions].reverse();

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto pr-1">
      {newestFirst.length === 0 && (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
          <p className="text-sm">No contradictions caught yet.</p>
          <p className="text-xs italic">This board fills up the moment the story cracks.</p>
        </div>
      )}
      <AnimatePresence initial={false}>
        {newestFirst.map((c) => {
          const Icon = CATEGORY_ICON[c.category];
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: -24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="rounded-lg border border-noir-red/40 bg-noir-red/5 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-noir-red">
                  <Icon className="size-3" />
                  {c.category}
                </span>
                <span className="rotate-3 rounded border-2 border-noir-red px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-noir-red">
                  Contradiction
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="rounded border border-border bg-muted/30 p-2">
                  <p className="mb-0.5 text-[9px] uppercase tracking-widest text-muted-foreground">
                    At {c.originalTimestamp}s
                  </p>
                  <p className="font-mono text-xs">&ldquo;{c.originalQuote}&rdquo;</p>
                </div>
                <div className="rounded border border-noir-red/40 bg-noir-red/10 p-2">
                  <p className="mb-0.5 text-[9px] uppercase tracking-widest text-noir-red">
                    At {c.newTimestamp}s
                  </p>
                  <p className="font-mono text-xs">&ldquo;{c.newQuote}&rdquo;</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
