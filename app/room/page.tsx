"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSelectedDetective, useGameStore } from "@/store/gameStore";
import { extractClaims } from "@/lib/ledger";
import { SpeakerMapper } from "@/lib/speakerDetection";
import { createVoiceAgent, MOCK_VOICE } from "@/lib/voiceClient";
import type { VoiceAgentClient } from "@/lib/voiceTypes";
import { playContradictionAlert } from "@/lib/sfx";
import type { ClaimEntry, Speaker } from "@/lib/types";
import { LiveTranscript } from "@/components/room/LiveTranscript";
import { ContradictionBoard } from "@/components/room/ContradictionBoard";
import { SuspicionGauge } from "@/components/room/SuspicionGauge";
import { PulseChart } from "@/components/room/PulseChart";
import { ClaimCountChart } from "@/components/room/ClaimCountChart";
import { ContradictionCounter } from "@/components/room/ContradictionCounter";
import { Timer } from "@/components/room/Timer";
import { ActionBar } from "@/components/room/ActionBar";
import { SpeakerRoleSetup } from "@/components/room/SpeakerRoleSetup";
import { Button } from "@/components/ui/button";

function suspicionColor(value: number) {
  if (value < 35) return "text-noir-green";
  if (value < 70) return "text-noir-yellow";
  return "text-noir-red";
}

/** Fire-and-forget LLM double-check for claims the local heuristic didn't already flag. */
function verifyWithLLM(
  category: ClaimEntry["category"],
  value: string,
  quote: string,
  timestamp: number,
  ledgerSnapshot: ClaimEntry[]
) {
  fetch("/api/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      new_claim: { category, value, quote, timestamp },
      existing_claims: ledgerSnapshot,
    }),
  })
    .then((r) => r.json())
    .then((result: { contradicts?: boolean; original_quote?: string }) => {
      if (!result?.contradicts) return;
      const ledgerNow = useGameStore.getState().ledger;
      const original =
        ledgerNow.find((c) => c.quote === result.original_quote) ??
        ledgerNow.find((c) => c.category === category);
      if (!original) return;
      useGameStore.getState().registerContradiction({
        category,
        newQuote: quote,
        newTimestamp: timestamp,
        originalQuote: original.quote,
        originalTimestamp: original.timestamp,
      });
    })
    .catch(() => {
      // best-effort — the local heuristic already covers the common cases
    });
}

export default function RoomPage() {
  const router = useRouter();
  const store = useGameStore();
  const agentRef = useRef<VoiceAgentClient | null>(null);
  const mapperRef = useRef(new SpeakerMapper());
  const [connecting, setConnecting] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (!store.caseData) {
      router.replace("/");
    }
  }, [store.caseData, router]);

  useEffect(() => {
    return () => {
      agentRef.current?.disconnect();
      agentRef.current = null;
    };
  }, []);

  // Countdown timer.
  useEffect(() => {
    const interval = setInterval(() => {
      const s = useGameStore.getState();
      if (s.gameOver || !s.timerRunning) return;
      s.tickTimer(1);
      if (s.timerRemaining <= 1 && !s.gameOver) {
        const verdict = s.suspicion >= 60 ? "guilty" : "released";
        s.endInterrogation(
          verdict,
          verdict === "guilty"
            ? "Time ran out with too many inconsistencies on record."
            : "Time ran out and the story held together."
        );
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (store.gameOver) {
      agentRef.current?.disconnect();
      const timeout = setTimeout(() => router.push("/report"), 600);
      return () => clearTimeout(timeout);
    }
  }, [store.gameOver, router]);

  // Play a beep whenever a new contradiction lands on the board.
  useEffect(() => {
    if (store.latestContradictionId) {
      playContradictionAlert();
      const timeout = setTimeout(() => useGameStore.getState().clearLatestContradiction(), 5000);
      return () => clearTimeout(timeout);
    }
  }, [store.latestContradictionId]);

  function handleTranscript(speaker: Speaker, text: string, timestamp: number) {
    useGameStore.getState().addTranscriptLine({ speaker, text, timestamp });
    if (speaker !== "suspect") return;

    for (const claim of extractClaims(text)) {
      const recorded = useGameStore
        .getState()
        .recordClaim(claim.category, claim.value, text, timestamp);
      if (!recorded.contradicts) {
        verifyWithLLM(claim.category, claim.value, text, timestamp, useGameStore.getState().ledger);
      }
    }
  }

  async function handleToggleRecording() {
    if (!store.caseData) return;

    if (!agentRef.current) {
      setConnecting(true);
      try {
        const agent = await createVoiceAgent(store.caseData, mapperRef.current, {
          onTranscript: handleTranscript,
          onPulse: (value) => useGameStore.getState().pushPulse(value),
          onSpeakerLocked: () => setLocked(true),
        });
        agentRef.current = agent;
        await agent.connect();
        useGameStore.getState().setRecording(true);
        useGameStore.getState().startTimer();
      } catch (err) {
        console.error("Voice agent connect failed", err);
      } finally {
        setConnecting(false);
      }
      return;
    }

    const next = !store.recording;
    agentRef.current.setMuted(!next);
    useGameStore.getState().setRecording(next);
  }

  function handleMarkKeyEvidence() {
    const lastSuspectLine = [...store.transcript].reverse().find((l) => l.speaker === "suspect");
    if (lastSuspectLine) useGameStore.getState().markKeyEvidence(lastSuspectLine.id);
  }

  function handleFlagSuspicious() {
    useGameStore.getState().flagSuspicious();
  }

  function handleEndInterrogation() {
    const verdict = store.suspicion >= 60 ? "guilty" : "released";
    useGameStore.getState().endInterrogation(verdict, "Detective ended the interrogation.");
  }

  function handleArmRole(role: "detective" | "suspect") {
    mapperRef.current.armNextLabelAs(role);
  }

  if (!store.caseData) return null;

  const selectedDetective = getSelectedDetective(store);
  const hasSuspectLine = store.transcript.some((l) => l.speaker === "suspect");

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="lamp-glow" />
      <div className="grain-overlay" />

      {MOCK_VOICE && (
        <div className="fixed right-3 top-3 z-30 rounded-full border border-noir-amber/50 bg-noir-amber/15 px-3 py-1 text-xs font-mono uppercase tracking-widest text-noir-amber">
          Mock Mode
        </div>
      )}

      <div className="relative z-10 flex items-center justify-between gap-4 border-b border-border bg-card/60 px-4 py-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Case</p>
          <h1 className="font-heading text-lg font-semibold">{store.caseData.name}</h1>
          {selectedDetective && (
            <p className="text-xs text-muted-foreground">
              Det. {selectedDetective.name} · Suspect: {selectedDetective.suspectName}
            </p>
          )}
        </div>
        <div className="flex items-center gap-6">
          <Timer remaining={store.timerRemaining} total={store.timerTotal} />
          <div className="text-center">
            <p className={`font-heading text-2xl font-bold ${suspicionColor(store.suspicion)}`}>
              {Math.round(store.suspicion)}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Suspicion</p>
          </div>
          <Button variant="destructive" size="sm" onClick={handleEndInterrogation}>
            End Interrogation
          </Button>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col">
        {!locked && (
          <div className="p-3">
            <SpeakerRoleSetup onArm={handleArmRole} locked={locked} />
          </div>
        )}

        <div className="grid flex-1 grid-cols-1 gap-3 p-3 lg:grid-cols-[1fr_1fr_260px]">
          <div className="flex min-h-[300px] flex-col rounded-lg border border-border bg-card/40 p-3">
            <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
              Live Conversation
            </p>
            <LiveTranscript lines={store.transcript} ledger={store.ledger} />
          </div>

          <div className="flex min-h-[300px] flex-col rounded-lg border border-border bg-card/40 p-3">
            <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
              Contradiction Board
            </p>
            <ContradictionBoard contradictions={store.contradictions} />
          </div>

          <div className="flex flex-col gap-4 rounded-lg border border-border bg-card/40 p-4">
            <SuspicionGauge value={store.suspicion} />
            <ContradictionCounter count={store.contradictions.length} />
            <div>
              <p className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">
                Claims by Category
              </p>
              <ClaimCountChart ledger={store.ledger} />
            </div>
            <div>
              <p className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">
                Suspect Speech Rate
              </p>
              <PulseChart data={store.pulse} />
            </div>
          </div>
        </div>

        <ActionBar
          recording={store.recording}
          onToggleRecording={handleToggleRecording}
          onMarkKeyEvidence={handleMarkKeyEvidence}
          onFlagSuspicious={handleFlagSuspicious}
          onEndInterrogation={handleEndInterrogation}
          markDisabled={!hasSuspectLine}
        />
      </div>

      {connecting && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <p className="font-mono text-sm text-muted-foreground animate-pulse">
            Connecting to AssemblyAI...
          </p>
        </div>
      )}
    </div>
  );
}
