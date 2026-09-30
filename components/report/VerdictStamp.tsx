"use client";

import { motion } from "framer-motion";
import type { Verdict } from "@/lib/types";

interface VerdictStampProps {
  verdict: Verdict;
}

export function VerdictStamp({ verdict }: VerdictStampProps) {
  if (!verdict) return null;
  const guilty = verdict === "guilty";

  return (
    <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-lg border border-border bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.02)_0px,rgba(255,255,255,0.02)_2px,transparent_2px,transparent_8px)] bg-card/60">
      <motion.div
        initial={{ scale: 3, opacity: 0, rotate: guilty ? -25 : 15 }}
        animate={{ scale: 1, opacity: 1, rotate: guilty ? -12 : 8 }}
        transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.2 }}
        className={`select-none rounded-md border-4 px-8 py-3 font-heading text-5xl font-black uppercase tracking-widest ${
          guilty
            ? "border-noir-red text-noir-red"
            : "border-noir-green text-noir-green"
        }`}
        style={{ textShadow: "0 0 20px currentColor" }}
      >
        {guilty ? "Guilty" : "Released"}
      </motion.div>
    </div>
  );
}
