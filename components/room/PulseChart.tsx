"use client";

import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";
import type { PulsePoint } from "@/lib/types";

interface PulseChartProps {
  data: PulsePoint[];
}

export function PulseChart({ data }: PulseChartProps) {
  const chartData = data.map((p, i) => ({ i, value: p.value }));

  return (
    <div className="h-20 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <YAxis domain={[0, 100]} hide />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
