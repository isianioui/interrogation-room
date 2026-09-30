"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

interface AlibiCardProps {
  alibi: string;
  seconds?: number;
}

export function AlibiCard({ alibi, seconds = 60 }: AlibiCardProps) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) return;
    const interval = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(interval);
  }, [remaining]);

  const hidden = remaining <= 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="[perspective:1200px]">
        <motion.div
          className="relative h-56 w-80 [transform-style:preserve-3d]"
          animate={{ rotateY: hidden ? 180 : 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 rounded-lg border-2 border-noir-amber/40 bg-card p-5 [backface-visibility:hidden]">
            <p className="mb-2 text-[10px] uppercase tracking-widest text-noir-amber">
              Your Alibi — Memorize It
            </p>
            <p className="font-mono text-sm leading-relaxed">{alibi}</p>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-border bg-secondary [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <Lock className="size-8 text-muted-foreground" />
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Card Hidden — Rely On Memory
            </p>
          </div>
        </motion.div>
      </div>
      {!hidden && (
        <p className="font-mono text-sm text-muted-foreground">
          Card flips in <span className="text-noir-amber">{remaining}s</span>
        </p>
      )}
    </div>
  );
}
