"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const TITLE = "THE INTERROGATION ROOM";

export function Hero() {
  const [visibleChars, setVisibleChars] = useState(0);

  useEffect(() => {
    if (visibleChars >= TITLE.length) return;
    const timeout = setTimeout(() => setVisibleChars((c) => c + 1), 55);
    return () => clearTimeout(timeout);
  }, [visibleChars]);

  return (
    <div className="relative flex flex-col items-center gap-4 pb-10 pt-16 text-center">
      <div className="lamp-flicker pointer-events-none absolute inset-x-0 -top-10 h-64 bg-[radial-gradient(ellipse_50%_60%_at_50%_0%,rgba(245,158,11,0.25),transparent_65%)]" />

      <p className="relative z-10 font-mono text-xs uppercase tracking-[0.4em] text-noir-amber/70">
        AssemblyAI Voice Agent Hackathon
      </p>

      <h1 className="relative z-10 font-heading text-4xl font-black tracking-wide text-shadow-amber sm:text-5xl md:text-6xl">
        {TITLE.slice(0, visibleChars)}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
          className="text-noir-amber"
        >
          {visibleChars < TITLE.length ? "_" : ""}
        </motion.span>
      </h1>

      <p className="relative z-10 max-w-md text-sm text-muted-foreground">
        Grab a friend and one microphone. One of you plays detective, one plays suspect — the AI
        just listens, logs every claim, and catches the moment your story stops adding up.
      </p>
    </div>
  );
}
