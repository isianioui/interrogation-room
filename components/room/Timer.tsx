interface TimerProps {
  remaining: number;
  total: number;
  paused?: boolean;
}

function format(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function Timer({ remaining, total, paused }: TimerProps) {
  const ratio = total > 0 ? remaining / total : 0;
  const low = ratio < 0.2;

  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={`font-mono text-3xl tabular-nums ${
          low ? "text-noir-red animate-pulse" : "text-foreground"
        }`}
      >
        {format(remaining)}
      </span>
      <span className="text-xs uppercase tracking-widest text-muted-foreground">
        {paused ? "Paused" : "Time remaining"}
      </span>
    </div>
  );
}
