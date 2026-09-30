"use client";

import { useState } from "react";
import { Shield, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SpeakerRoleSetupProps {
  onArm: (role: "detective" | "suspect") => void;
  locked: boolean;
}

/**
 * Roles are classified automatically (questions = detective, answers =
 * suspect), so this is just an escape hatch: tap it right before speaking
 * to force the next line to that role, for the rare case the heuristic
 * would get it wrong.
 */
export function SpeakerRoleSetup({ onArm, locked }: SpeakerRoleSetupProps) {
  const [armed, setArmed] = useState<"detective" | "suspect" | null>(null);

  if (locked) return null;

  function handleClick(role: "detective" | "suspect") {
    setArmed(role);
    onArm(role);
  }

  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-noir-amber/30 bg-noir-amber/5 p-3">
      <p className="text-center text-xs text-muted-foreground">
        Roles are detected automatically. Speaking next and worried it&apos;ll get mislabeled? Tap your role to force it.
      </p>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={armed === "detective" ? "default" : "outline"}
          onClick={() => handleClick("detective")}
          className="gap-1.5"
        >
          <Shield className="size-3.5" />
          I&apos;m the Detective
        </Button>
        <Button
          size="sm"
          variant={armed === "suspect" ? "default" : "outline"}
          onClick={() => handleClick("suspect")}
          className="gap-1.5"
        >
          <UserRound className="size-3.5" />
          I&apos;m the Suspect
        </Button>
      </div>
    </div>
  );
}
