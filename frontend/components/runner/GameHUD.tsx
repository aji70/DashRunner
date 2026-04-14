"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { GamePhase } from "@/types/runner";

interface GameHUDProps {
  score: number;
  coinsCollected: number;
  phase: GamePhase;
  onPauseToggle: () => void;
}

export function GameHUD({ score, coinsCollected, phase, onPauseToggle }: GameHUDProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* Score display - top left */}
      <div className="absolute left-2 top-2 sm:left-4 sm:top-4 flex flex-col gap-3 sm:gap-4">
        {/* Points */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="text-xl sm:text-2xl">⬡</div>
          <AnimatePresence mode="wait">
            <motion.div
              key={score}
              initial={{ scale: 1.2, opacity: 1 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="min-w-12 sm:min-w-20 font-orbitron text-xl sm:text-3xl font-bold text-[#00F0FF]"
            >
              {score}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Coins collected */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="text-xl sm:text-2xl">🪙</div>
          <AnimatePresence mode="wait">
            <motion.div
              key={coinsCollected}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="min-w-10 sm:min-w-16 font-orbitron text-lg sm:text-2xl font-bold text-[#FFD700]"
            >
              {coinsCollected}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Pause button and speed indicator - top right */}
      <div className="absolute right-2 top-2 sm:right-4 sm:top-4 flex items-center gap-2 sm:gap-3">
        {phase === "playing" && (
          <motion.button
            onClick={onPauseToggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="pointer-events-auto flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded border border-[rgba(0,240,255,0.3)] bg-[#0E1415] text-sm sm:text-lg text-[#00F0FF] hover:border-[rgba(0,240,255,0.6)] transition-colors"
            title="Pause"
          >
            ⏸
          </motion.button>
        )}
        <div className="font-orbitron text-xs sm:text-lg font-semibold text-[#00F0FF]">
          DASH
        </div>
      </div>
    </div>
  );
}
