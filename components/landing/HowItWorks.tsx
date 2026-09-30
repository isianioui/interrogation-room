"use client";

import { motion } from "framer-motion";
import { BookOpenText, Mic, ScrollText } from "lucide-react";

const STEPS = [
  {
    icon: BookOpenText,
    title: "1. Pick Your Roles",
    body: "One of you reads the case and plays detective. The other studies the alibi and plays suspect.",
  },
  {
    icon: Mic,
    title: "2. Interrogate, Out Loud",
    body: "Share one mic. The AI silently transcribes both of you and logs every claim the suspect makes.",
  },
  {
    icon: ScrollText,
    title: "3. Face the Verdict",
    body: "The moment the suspect's story stops adding up, the ledger catches it — and the case is made.",
  },
];

export function HowItWorks() {
  return (
    <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
      {STEPS.map((step, i) => (
        <motion.div
          key={step.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.12 }}
          className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card/30 p-5 text-center"
        >
          <step.icon className="size-6 text-noir-amber" />
          <p className="font-heading text-base font-semibold">{step.title}</p>
          <p className="text-xs text-muted-foreground">{step.body}</p>
        </motion.div>
      ))}
    </div>
  );
}
