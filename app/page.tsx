"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { Hero } from "@/components/landing/Hero";
import { DifficultySelector } from "@/components/landing/DifficultySelector";
import { DetectivePicker } from "@/components/landing/DetectivePicker";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CaseHistoryDrawer } from "@/components/landing/CaseHistoryDrawer";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const router = useRouter();
  const difficulty = useGameStore((s) => s.difficulty);
  const detectives = useGameStore((s) => s.detectives);
  const detectiveId = useGameStore((s) => s.detectiveId);
  const history = useGameStore((s) => s.history);
  const setDifficulty = useGameStore((s) => s.setDifficulty);
  const setDetective = useGameStore((s) => s.setDetective);
  const addDetective = useGameStore((s) => s.addDetective);
  const removeDetective = useGameStore((s) => s.removeDetective);

  useEffect(() => {
    useGameStore.getState().loadDetectives();
  }, []);

  function handleEnter() {
    if (!detectiveId) return;
    router.push("/briefing");
  }

  return (
    <div className="relative min-h-screen bg-background">
      <div className="lamp-glow" />
      <div className="grain-overlay" />

      <div className="absolute right-4 top-4 z-10">
        <CaseHistoryDrawer history={history} />
      </div>

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-12 px-4 pb-20">
        <Hero />

        <section className="flex w-full flex-col items-center gap-4">
          <h2 className="font-heading text-sm uppercase tracking-widest text-muted-foreground">
            Choose Your Difficulty
          </h2>
          <DifficultySelector value={difficulty} onChange={setDifficulty} />
        </section>

        <section className="flex w-full flex-col items-center gap-4">
          <h2 className="font-heading text-sm uppercase tracking-widest text-muted-foreground">
            Choose Your Interrogator
          </h2>
          <DetectivePicker
            detectives={detectives}
            value={detectiveId}
            defaultRank={difficulty}
            onChange={setDetective}
            onCreate={addDetective}
            onRemove={removeDetective}
          />
        </section>

        <section className="flex w-full flex-col items-center gap-4">
          <h2 className="font-heading text-sm uppercase tracking-widest text-muted-foreground">
            How It Works
          </h2>
          <HowItWorks />
        </section>

        <div className="flex flex-col items-center gap-2">
          <motion.div
            animate={detectiveId ? { scale: [1, 1.04, 1] } : { scale: 1 }}
            transition={{ duration: 1.4, repeat: detectiveId ? Infinity : 0 }}
          >
            <Button
              size="lg"
              onClick={handleEnter}
              disabled={!detectiveId}
              className="px-10 py-6 text-base"
            >
              Enter the Room
            </Button>
          </motion.div>
          {!detectiveId && (
            <p className="text-xs text-muted-foreground">
              Create or select a case to enter the room.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
