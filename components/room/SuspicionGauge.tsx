"use client";

import { motion } from "framer-motion";

interface SuspicionGaugeProps {
  value: number; // 0-100
}

const SIZE = 220;
const STROKE = 18;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = (SIZE - STROKE) / 2;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 180) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

/** Describes an arc along the top semicircle from angle 0 to `angle` (0-180). */
function describeArc(cx: number, cy: number, r: number, angle: number) {
  const start = polarToCartesian(cx, cy, r, 0);
  const end = polarToCartesian(cx, cy, r, angle);
  const largeArcFlag = angle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

function colorForValue(value: number): string {
  if (value < 35) return "#22c55e";
  if (value < 70) return "#eab308";
  return "#ef4444";
}

export function SuspicionGauge({ value }: SuspicionGaugeProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const angle = (clamped / 100) * 180;
  const trackPath = describeArc(CX, CY, R, 180);
  const valuePath = describeArc(CX, CY, R, angle);
  const color = colorForValue(clamped);

  return (
    <div className="flex flex-col items-center">
      <svg width={SIZE} height={SIZE / 2 + STROKE} viewBox={`0 0 ${SIZE} ${SIZE / 2 + STROKE}`}>
        <path
          d={trackPath}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={STROKE}
          strokeLinecap="round"
        />
        <motion.path
          d={valuePath}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          initial={false}
          animate={{ d: valuePath, stroke: color }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
          style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
        />
      </svg>
      <div className="-mt-8 flex flex-col items-center">
        <span className="font-heading text-4xl font-bold" style={{ color }}>
          {Math.round(clamped)}
        </span>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Suspicion
        </span>
      </div>
    </div>
  );
}
