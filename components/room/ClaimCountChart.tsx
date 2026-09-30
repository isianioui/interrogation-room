"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, XAxis } from "recharts";
import type { ClaimEntry } from "@/lib/types";

interface ClaimCountChartProps {
  ledger: ClaimEntry[];
}

export function ClaimCountChart({ ledger }: ClaimCountChartProps) {
  const counts = { time: 0, place: 0, person: 0, object: 0 };
  for (const c of ledger) counts[c.category] += 1;

  const data = [
    { category: "Time", count: counts.time, fill: "#3b82f6" },
    { category: "Place", count: counts.place, fill: "#22c55e" },
    { category: "People", count: counts.person, fill: "#eab308" },
    { category: "Object", count: counts.object, fill: "#a855f7" },
  ];

  return (
    <div className="h-24 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <XAxis dataKey="category" stroke="var(--muted-foreground)" fontSize={10} />
          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
            {data.map((d) => (
              <Cell key={d.category} fill={d.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
