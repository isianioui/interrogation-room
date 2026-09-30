"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Share2, SquarePlus } from "lucide-react";
import { getSelectedDetective, useGameStore } from "@/store/gameStore";
import { computeReport } from "@/lib/scoring";
import { playBuzz, playChime } from "@/lib/sfx";
import { Button } from "@/components/ui/button";
import { VerdictStamp } from "@/components/report/VerdictStamp";
import { SuspicionChart } from "@/components/report/SuspicionChart";
import { SkillRadar } from "@/components/report/SkillRadar";
import { TalkRatio } from "@/components/report/TalkRatio";
import { WeakSpots } from "@/components/report/WeakSpots";
import { StoryTimeline } from "@/components/report/StoryTimeline";
import { SharePoster } from "@/components/report/SharePoster";

export default function ReportPage() {
  const router = useRouter();
  const store = useGameStore();
  const detective = getSelectedDetective(store);

  useEffect(() => {
    if (!store.caseData || !store.verdict) {
      router.replace("/");
    }
  }, [store.caseData, store.verdict, router]);

  useEffect(() => {
    if (store.verdict === "guilty") playBuzz();
    if (store.verdict === "released") playChime();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const report = useMemo(
    () =>
      computeReport({
        ledger: store.ledger,
        transcript: store.transcript,
        contradictions: store.contradictions,
        suspicionHistory: store.suspicionHistory,
        suspicion: store.suspicion,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.caseData?.id]
  );

  if (!store.caseData || !store.verdict) return null;

  function handleRetry() {
    if (!store.caseData) return;
    useGameStore.getState().startCase(store.caseData);
    router.push("/room");
  }

  function handleNewCase() {
    useGameStore.getState().resetGame();
    router.push("/");
  }

  return (
    <div className="relative min-h-screen bg-background">
      <div className="lamp-glow" />
      <div className="grain-overlay" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-noir-amber/80">Case Closed</p>
          <h1 className="font-heading text-3xl font-bold">{store.caseData.name}</h1>
        </div>

        <VerdictStamp verdict={store.verdict} />

        <p className="mx-auto mt-4 max-w-xl text-center text-sm text-muted-foreground">
          {store.verdictReason}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="outline" onClick={handleRetry} className="gap-2">
            <RotateCcw className="size-4" /> Retry this Case
          </Button>
          <Button variant="outline" onClick={handleNewCase} className="gap-2">
            <SquarePlus className="size-4" /> New Case
          </Button>
          <Button
            variant="outline"
            onClick={() => document.getElementById("poster")?.scrollIntoView({ behavior: "smooth" })}
            className="gap-2"
          >
            <Share2 className="size-4" /> Share Poster
          </Button>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          <ChartCard title="Suspicion Over Time">
            <SuspicionChart history={report.suspicionHistory} />
          </ChartCard>
          <ChartCard title="Skill Radar">
            <SkillRadar scores={report.radar} />
          </ChartCard>
          <ChartCard title="Talk Ratio">
            <TalkRatio ratio={report.talkRatio} />
          </ChartCard>
          <ChartCard title="Weak Spots">
            <WeakSpots spots={report.weakSpots} />
          </ChartCard>
        </div>

        <div className="mt-10">
          <h2 className="mb-3 font-heading text-xl font-semibold">The Suspect&apos;s Story, As Told</h2>
          <StoryTimeline transcript={report.transcript} contradictions={report.contradictions} />
        </div>

        <div id="poster" className="mt-12">
          <h2 className="mb-4 text-center font-heading text-xl font-semibold">Case File Poster</h2>
          <SharePoster
            caseData={store.caseData}
            detectiveName={detective?.name ?? "Unknown"}
            suspectName={detective?.suspectName}
            verdict={store.verdict}
            suspicion={store.suspicion}
          />
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card/40 p-4">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}
