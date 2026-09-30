"use client";

import { AlertTriangle, Mic, MicOff, Star, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActionBarProps {
  recording: boolean;
  onToggleRecording: () => void;
  onMarkKeyEvidence: () => void;
  onFlagSuspicious: () => void;
  onEndInterrogation: () => void;
  markDisabled: boolean;
}

export function ActionBar({
  recording,
  onToggleRecording,
  onMarkKeyEvidence,
  onFlagSuspicious,
  onEndInterrogation,
  markDisabled,
}: ActionBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 border-t border-border bg-card/60 p-3">
      <ActionButton
        icon={recording ? <MicOff className="size-4" /> : <Mic className="size-4" />}
        label={recording ? "Pause" : "Record"}
        hint={recording ? "Pause listening" : "Start listening to the room"}
        onClick={onToggleRecording}
        variant={recording ? "outline" : "default"}
      />
      <ActionButton
        icon={<Star className="size-4" />}
        label="Mark as Key Evidence"
        hint="Flag the suspect's most recent line as key evidence"
        onClick={onMarkKeyEvidence}
        disabled={markDisabled}
      />
      <ActionButton
        icon={<AlertTriangle className="size-4" />}
        label="Flag Suspicious"
        hint="Manually raise suspicion by 10"
        onClick={onFlagSuspicious}
      />
      <ActionButton
        icon={<StopCircle className="size-4" />}
        label="End Interrogation"
        hint="End the session and go to the report"
        onClick={onEndInterrogation}
        variant="destructive"
      />
    </div>
  );
}

function ActionButton({
  icon,
  label,
  hint,
  onClick,
  disabled,
  variant = "outline",
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "outline" | "destructive" | "default";
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant={variant}
            size="sm"
            disabled={disabled}
            onClick={onClick}
            className="gap-1.5"
          >
            {icon}
            <span className="hidden sm:inline">{label}</span>
          </Button>
        }
      />
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  );
}
