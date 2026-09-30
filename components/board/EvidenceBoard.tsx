"use client";

import { MapPin, ScrollText, UserRound } from "lucide-react";
import type { CaseFile } from "@/lib/types";

interface EvidenceBoardProps {
  caseData: CaseFile;
}

const PIN_POSITIONS = {
  crime: { top: "8%", left: "6%", width: "38%" },
  map: { top: "8%", left: "56%", width: "38%" },
  suspect: { top: "56%", left: "31%", width: "38%" },
};

export function EvidenceBoard({ caseData }: EvidenceBoardProps) {
  return (
    <div
      className="relative mx-auto aspect-[16/10] w-full max-w-4xl rounded-lg border-4 border-[#3a2a1a] shadow-2xl"
      style={{
        backgroundColor: "#5c4630",
        backgroundImage:
          "radial-gradient(rgba(0,0,0,0.25) 1px, transparent 1px), radial-gradient(rgba(0,0,0,0.15) 1px, transparent 1px)",
        backgroundSize: "6px 6px, 9px 9px",
        backgroundPosition: "0 0, 3px 4px",
      }}
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="25" y1="18" x2="65" y2="20" stroke="#b91c1c" strokeWidth="0.4" />
        <line x1="25" y1="26" x2="50" y2="60" stroke="#b91c1c" strokeWidth="0.4" />
        <line x1="65" y1="28" x2="52" y2="60" stroke="#b91c1c" strokeWidth="0.4" />
      </svg>

      <BoardPin
        style={PIN_POSITIONS.crime}
        icon={<ScrollText className="size-4" />}
        label="The Crime"
      >
        <p className="font-mono text-xs leading-relaxed">{caseData.crimeSummary}</p>
      </BoardPin>

      <BoardPin style={PIN_POSITIONS.map} icon={<MapPin className="size-4" />} label="Location">
        <div className="flex h-24 items-center justify-center rounded border border-dashed border-muted-foreground/40 bg-muted/30">
          <p className="px-2 text-center font-mono text-xs text-muted-foreground">
            {caseData.location}
          </p>
        </div>
      </BoardPin>

      <BoardPin
        style={PIN_POSITIONS.suspect}
        icon={<UserRound className="size-4" />}
        label="Suspect"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-16 shrink-0 items-center justify-center rounded border border-dashed border-muted-foreground/40 bg-muted/30">
            <UserRound className="size-8 text-muted-foreground" />
          </div>
          <p className="font-mono text-xs leading-relaxed">{caseData.suspectDescription}</p>
        </div>
      </BoardPin>
    </div>
  );
}

function BoardPin({
  style,
  icon,
  label,
  children,
}: {
  style: { top: string; left: string; width: string };
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="absolute rounded-sm border border-black/10 bg-[#f4ecd8] p-3 text-[#2a2015] shadow-lg"
      style={{ top: style.top, left: style.left, width: style.width }}
    >
      <div className="absolute -top-2 left-1/2 size-3 -translate-x-1/2 rounded-full bg-noir-red shadow" />
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
        {icon}
        {label}
      </div>
      {children}
    </div>
  );
}
