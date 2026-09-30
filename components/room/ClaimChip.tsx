import { Clock, MapPin, Package, User } from "lucide-react";
import type { ClaimCategory } from "@/lib/types";

interface ClaimChipProps {
  category: ClaimCategory;
  value: string;
  contradicted?: boolean;
}

const CATEGORY_STYLE: Record<
  ClaimCategory,
  { icon: typeof Clock; classes: string }
> = {
  time: { icon: Clock, classes: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  place: { icon: MapPin, classes: "bg-green-500/15 text-green-400 border-green-500/30" },
  person: { icon: User, classes: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  object: { icon: Package, classes: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
};

export function ClaimChip({ category, value, contradicted }: ClaimChipProps) {
  const { icon: Icon, classes } = CATEGORY_STYLE[category];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-mono ${classes} ${
        contradicted ? "ring-1 ring-noir-red" : ""
      }`}
    >
      <Icon className="size-3" />
      {value}
    </span>
  );
}
