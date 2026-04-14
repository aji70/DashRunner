"use client";

import { AnimatePresence, motion } from "framer-motion";

interface GameHUDProps {
  score: number;
}

export function GameHUD({ score }: GameHUDProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* Score display - top left */}
      <div className="absolute left-4 top-4 flex items-center gap-2">
        <div className="text-2xl">⬡</div>
        <AnimatePresence mode="wait">
          <motion.div
            key={score}
            initial={{ scale: 1.2, opacity: 1 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="min-w-20 font-orbitron text-3xl font-bold text-[#00F0FF]"
          >
            {score}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Speed indicator - top right */}
      <div className="absolute right-4 top-4 font-orbitron text-lg font-semibold text-[#00F0FF]">
        DASH
      </div>
    </div>
  );
}
