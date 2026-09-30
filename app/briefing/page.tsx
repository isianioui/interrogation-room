"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { getRandomCase } from "@/lib/cases";
import type { CaseFile } from "@/lib/types";
import { EvidenceBoard } from "@/components/board/EvidenceBoard";
import { AlibiCard } from "@/components/board/AlibiCard";
import { Button } from "@/components/ui/button";

export default function BriefingPage() {
  const router = useRouter();
  const [caseData, setCaseData] = useState<CaseFile | null>(null);

  useEffect(() => {
    // Picked client-side only (not in a useState initializer) so the random
    // case doesn't cause an SSR/client hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCaseData(getRandomCase());
  }, []);

  function handleReady() {
    if (!caseData) return;
    useGameStore.getState().startCase(caseData);
    router.push("/room");
  }

  if (!caseData) return null;

  return (
    <div className="relative min-h-screen bg-background">
      <div className="lamp-glow" />
      <div className="grain-overlay" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 py-10">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-heading text-3xl font-bold text-noir-amber text-shadow-amber"
        >
          Case Briefing
        </motion.h1>

        <EvidenceBoard caseData={caseData} />

        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Study your alibi. You&apos;ll need to keep your story straight from memory.
          </p>
          <AlibiCard alibi={caseData.alibi} seconds={60} />
        </div>

        <Button size="lg" onClick={handleReady} className="mt-2 gap-2">
          I&apos;m Ready
        </Button>
      </div>
    </div>
  );
}
