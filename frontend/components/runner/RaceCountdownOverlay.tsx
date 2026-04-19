"use client";

import { AnimatePresence, motion } from "framer-motion";

interface RaceCountdownOverlayProps {
  step: number;
}

/** step 3,2,1 = numbers; 0 = GO */
export function RaceCountdownOverlay({ step }: RaceCountdownOverlayProps) {
  const label = step === 0 ? "GO" : step > 0 ? String(step) : "";

  return (
    <AnimatePresence>
      {step >= 0 && (
        <motion.div
          key={label}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-black/35 backdrop-blur-[2px]"
        >
          <span
            className="font-orbitron text-7xl font-black tabular-nums text-cyan-100 sm:text-8xl"
            style={{ textShadow: "0 0 40px rgba(34,211,238,0.5)" }}
          >
            {label}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
