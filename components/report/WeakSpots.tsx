"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { WeakSpots as WeakSpotsType } from "@/lib/types";

interface WeakSpotsProps {
  spots: WeakSpotsType;
}

export function WeakSpots({ spots }: WeakSpotsProps) {
  const data = [
    { category: "Time", count: spots.time, fill: "#3b82f6" },
    { category: "Place", count: spots.place, fill: "#22c55e" },
    { category: "People", count: spots.person, fill: "#eab308" },
    { category: "Object", count: spots.object, fill: "#a855f7" },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="category" stroke="var(--muted-foreground)" fontSize={11} />
          <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={11} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((d) => (
              <Cell key={d.category} fill={d.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
