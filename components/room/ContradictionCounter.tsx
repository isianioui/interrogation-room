import { motion } from "framer-motion";

interface ContradictionCounterProps {
  count: number;
}

export function ContradictionCounter({ count }: ContradictionCounterProps) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-noir-red/30 bg-noir-red/5 py-3">
      <motion.span
        key={count}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="font-heading text-4xl font-black text-noir-red"
      >
        {count}
      </motion.span>
      <span className="text-xs uppercase tracking-widest text-muted-foreground">
        Contradictions Caught
      </span>
    </div>
  );
}
