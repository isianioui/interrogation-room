"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SuspicionHistoryPoint } from "@/lib/types";

interface SuspicionChartProps {
  history: SuspicionHistoryPoint[];
}

export function SuspicionChart({ history }: SuspicionChartProps) {
  const markers = history.filter((h) => h.type === "evidence" || (h.reason ?? "").length > 0);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history} margin={{ top: 10, right: 16, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="t" stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `${v}s`} />
          <YAxis domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={11} />
          <Tooltip
            contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 12 }}
            labelFormatter={(v) => `${v}s`}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Recharts' formatter generics don't narrow usefully here.
            formatter={(value: any, _name: any, item: any) => [
              value,
              (item.payload as SuspicionHistoryPoint).reason ?? "Suspicion",
            ]}
          />
          <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
          {markers.map((m, i) => (
            <ReferenceDot
              key={i}
              x={m.t}
              y={m.value}
              r={5}
              fill={m.type === "evidence" ? "#3b82f6" : "#ef4444"}
              stroke="none"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
