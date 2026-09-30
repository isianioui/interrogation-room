"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { TalkRatio as TalkRatioType } from "@/lib/types";

interface TalkRatioProps {
  ratio: TalkRatioType;
}

const COLORS = ["#f59e0b", "#3b82f6"];

export function TalkRatio({ ratio }: TalkRatioProps) {
  const data = [
    { name: "Suspect", value: ratio.suspect },
    { name: "Detective", value: ratio.detective },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 12 }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Recharts' formatter generics don't narrow usefully here.
            formatter={(value: any, name: any) => [`${value}%`, name]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 text-xs">
        {data.map((d, i) => (
          <span key={d.name} className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: COLORS[i] }} />
            {d.name} {d.value}%
          </span>
        ))}
      </div>
    </div>
  );
}
