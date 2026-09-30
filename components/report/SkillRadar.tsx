"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import type { RadarScores } from "@/lib/types";

interface SkillRadarProps {
  scores: RadarScores;
}

export function SkillRadar({ scores }: SkillRadarProps) {
  const data = [
    { skill: "Consistency", value: scores.consistency },
    { skill: "Composure", value: scores.composure },
    { skill: "Detail", value: scores.detail },
    { skill: "Speed", value: scores.speed },
    { skill: "Evasion", value: scores.evasion },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis dataKey="skill" stroke="var(--muted-foreground)" fontSize={11} />
          <Radar
            dataKey="value"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.35}
            isAnimationActive={false}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
