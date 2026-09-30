"use client";

import { useState } from "react";
import { Clock, Plus, Trash2 } from "lucide-react";
import {
  DIFFICULTY_CONFIG,
  DIFFICULTY_ORDER,
  MAX_DURATION_MINUTES,
  MIN_DURATION_MINUTES,
} from "@/lib/detectives";
import type { DetectiveProfile, Difficulty } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DetectivePickerProps {
  detectives: DetectiveProfile[];
  value: string | null;
  defaultRank: Difficulty;
  onChange: (id: string) => void;
  onCreate: (input: Omit<DetectiveProfile, "id" | "createdAt">) => void;
  onRemove: (id: string) => void;
}

export function DetectivePicker({
  detectives,
  value,
  defaultRank,
  onChange,
  onCreate,
  onRemove,
}: DetectivePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-noir-amber/50 bg-card/20 p-5 text-center transition-colors hover:border-noir-amber hover:bg-noir-amber/5"
        >
          <div className="flex size-16 items-center justify-center rounded-full border-2 border-dashed border-noir-amber/50 text-noir-amber">
            <Plus className="size-7" />
          </div>
          <div>
            <p className="font-heading text-lg font-semibold">New Case</p>
            <p className="text-xs text-muted-foreground">Add a detective and a suspect</p>
          </div>
        </button>

        {detectives.map((d) => {
          const active = value === d.id;
          return (
            <div key={d.id} className="relative">
              <button
                type="button"
                onClick={() => onChange(d.id)}
                className={`flex h-full w-full flex-col items-center gap-3 rounded-lg border p-5 text-center transition-colors ${
                  active
                    ? "border-noir-amber bg-noir-amber/10"
                    : "border-border bg-card/40 hover:border-noir-amber/40"
                }`}
              >
                <div className="flex size-16 items-center justify-center rounded-full border-2 border-border bg-secondary font-heading text-2xl font-bold uppercase">
                  {d.name.charAt(0)}
                </div>
                <div>
                  <p className="font-heading text-lg font-semibold break-words">{d.name}</p>
                  <p className="text-[10px] uppercase tracking-widest text-noir-amber">
                    {DIFFICULTY_CONFIG[d.rank].label}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground break-words">
                  Interrogating <span className="text-foreground">{d.suspectName}</span>
                </p>
                <p className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  {d.durationMinutes} min
                </p>
              </button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete case for ${d.name}`}
                onClick={() => onRemove(d.id)}
                className="absolute right-2 top-2 text-muted-foreground hover:text-noir-red"
              >
                <Trash2 />
              </Button>
            </div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          {/* Remount per open so the form starts fresh each time. */}
          {open && (
            <NewCaseForm
              defaultRank={defaultRank}
              onSubmit={(input) => {
                onCreate(input);
                setOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

const inputClass =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-noir-amber focus-visible:ring-3 focus-visible:ring-noir-amber/30 dark:bg-input/30";

function NewCaseForm({
  defaultRank,
  onSubmit,
}: {
  defaultRank: Difficulty;
  onSubmit: (input: Omit<DetectiveProfile, "id" | "createdAt">) => void;
}) {
  const [name, setName] = useState("");
  const [suspectName, setSuspectName] = useState("");
  const [rank, setRank] = useState<Difficulty>(defaultRank);
  const [duration, setDuration] = useState(
    String(DIFFICULTY_CONFIG[defaultRank].timerSeconds / 60)
  );
  // Until the detective types their own duration, follow the rank's default.
  const [durationTouched, setDurationTouched] = useState(false);

  const minutes = Number(duration);
  const durationValid =
    Number.isInteger(minutes) && minutes >= MIN_DURATION_MINUTES && minutes <= MAX_DURATION_MINUTES;
  const canSubmit = name.trim() !== "" && suspectName.trim() !== "" && durationValid;

  function handleRank(r: Difficulty) {
    setRank(r);
    if (!durationTouched) setDuration(String(DIFFICULTY_CONFIG[r].timerSeconds / 60));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      name: name.trim(),
      suspectName: suspectName.trim(),
      rank,
      durationMinutes: minutes,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle className="text-lg">Open a New Case</DialogTitle>
        <DialogDescription>Who is in the room, and how long do you get?</DialogDescription>
      </DialogHeader>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Your name (detective)
        </span>
        <input
          autoFocus
          required
          maxLength={40}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Sam Rivera"
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Suspect name
        </span>
        <input
          required
          maxLength={40}
          value={suspectName}
          onChange={(e) => setSuspectName(e.target.value)}
          placeholder="e.g. Alex Moreau"
          className={inputClass}
        />
      </label>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-xs uppercase tracking-widest text-muted-foreground">
          Rank
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {DIFFICULTY_ORDER.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={rank === r}
              onClick={() => handleRank(r)}
              className={`rounded-lg border px-2 py-2 text-sm font-semibold transition-colors ${
                rank === r
                  ? "border-noir-amber bg-noir-amber/10 text-noir-amber"
                  : "border-border bg-card/40 hover:border-noir-amber/40"
              }`}
            >
              {DIFFICULTY_CONFIG[r].label}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Duration (minutes)
        </span>
        <input
          type="number"
          required
          min={MIN_DURATION_MINUTES}
          max={MAX_DURATION_MINUTES}
          step={1}
          value={duration}
          onChange={(e) => {
            setDuration(e.target.value);
            setDurationTouched(true);
          }}
          aria-invalid={!durationValid}
          className={inputClass}
        />
        {!durationValid && (
          <span className="text-xs text-noir-red">
            Enter a whole number from {MIN_DURATION_MINUTES} to {MAX_DURATION_MINUTES}.
          </span>
        )}
      </label>

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
        <Button type="submit" disabled={!canSubmit}>
          Create Case
        </Button>
      </DialogFooter>
    </form>
  );
}
