"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { GamePhase } from "@/types/runner";

interface GameHUDProps {
  score: number;
  coinsCollected: number;
  phase: GamePhase;
  isMuted: boolean;
  onPauseToggle: () => void;
  onMuteToggle: () => void;
}

export function GameHUD({ score, coinsCollected, phase, isMuted, onPauseToggle, onMuteToggle }: GameHUDProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* Top scoreboard */}
      <div className="absolute left-2 right-24 top-2 z-20 rounded-xl border border-fuchsia-300/35 bg-indigo-950/70 px-3 py-2 backdrop-blur-sm sm:left-4 sm:right-32 sm:top-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md bg-black/20 px-2 py-1">
            <p className="font-orbitron text-[10px] uppercase tracking-wider text-cyan-100/75">
              Points
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={score}
                initial={{ scale: 1.08, opacity: 0.9 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0.7 }}
                transition={{ duration: 0.15 }}
                className="font-orbitron text-lg font-bold text-cyan-200 sm:text-2xl"
              >
                {score}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="rounded-md bg-black/20 px-2 py-1">
            <p className="font-orbitron text-[10px] uppercase tracking-wider text-yellow-100/80">
              Coins
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={coinsCollected}
                initial={{ scale: 1.08, opacity: 0.9 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0.7 }}
                transition={{ duration: 0.15 }}
                className="font-orbitron text-lg font-bold text-yellow-200 sm:text-2xl"
              >
                {coinsCollected}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Pause + Mute actions */}
      <div className="absolute right-2 top-2 sm:right-4 sm:top-4 flex items-center gap-2 sm:gap-3">
        {phase === "playing" && (
          <>
            <motion.button
              onClick={onPauseToggle}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="pointer-events-auto flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded border border-fuchsia-400/40 bg-indigo-950/80 text-sm sm:text-lg text-cyan-200 hover:border-fuchsia-300 transition-colors"
              title="Pause"
            >
              ⏸
            </motion.button>
            <motion.button
              onClick={onMuteToggle}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="pointer-events-auto flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded border border-fuchsia-400/40 bg-indigo-950/80 text-sm sm:text-lg text-cyan-200 hover:border-fuchsia-300 transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? "🔇" : "🔊"}
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
}
