"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CaseFile, Verdict } from "@/lib/types";

interface SharePosterProps {
  caseData: CaseFile;
  detectiveName: string;
  suspectName?: string;
  verdict: Verdict;
  suspicion: number;
}

export function SharePoster({ caseData, detectiveName, suspectName, verdict, suspicion }: SharePosterProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const guilty = verdict === "guilty";

  async function handleDownload() {
    if (!posterRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(posterRef.current, { pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `interrogation-room-${caseData.id}-${verdict}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export poster", err);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={posterRef}
        className="relative w-full max-w-md overflow-hidden rounded-lg border-4 border-noir-amber/30 bg-[#0a0a0f] p-6 font-mono text-[#e8e3d3]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245,158,11,0.12), transparent 60%)",
        }}
      >
        <p className="text-center text-[10px] uppercase tracking-[0.3em] text-noir-amber/80">
          The Interrogation Room
        </p>
        <h2 className="mt-1 text-center font-heading text-lg font-bold">{caseData.name}</h2>

        <div
          className={`my-6 flex justify-center rounded-md border-4 py-3 font-heading text-3xl font-black uppercase tracking-widest ${
            guilty ? "border-noir-red text-noir-red" : "border-noir-green text-noir-green"
          }`}
        >
          {guilty ? "Guilty" : "Released"}
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-muted-foreground">Detective</p>
            <p className="font-semibold">{detectiveName}</p>
          </div>
          {suspectName && (
            <div>
              <p className="text-muted-foreground">Suspect</p>
              <p className="font-semibold">{suspectName}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground">Final Suspicion</p>
            <p className="font-semibold">{Math.round(suspicion)} / 100</p>
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] uppercase tracking-widest text-noir-amber/60">
          AssemblyAI Voice Agent Hackathon
        </p>
      </div>

      <Button onClick={handleDownload} disabled={downloading} className="gap-2">
        <Download className="size-4" />
        {downloading ? "Generating..." : "Download Poster"}
      </Button>
    </div>
  );
}
