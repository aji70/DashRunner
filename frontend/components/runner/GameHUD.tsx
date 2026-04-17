"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { GamePhase } from "@/types/runner";

function IconPause({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="5" y="4" width="5" height="16" rx="1" />
      <rect x="14" y="4" width="5" height="16" rx="1" />
    </svg>
  );
}

function IconVolumeOn({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M11 5 6 9H3v6h3l5 4V5Z" fill="currentColor" stroke="none" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" strokeLinecap="round" />
      <path d="M17.5 6.5a8 8 0 0 1 0 11" strokeLinecap="round" />
    </svg>
  );
}

function IconVolumeOff({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M11 5 6 9H3v6h3l5 4V5Z" fill="currentColor" stroke="none" />
      <path d="m17 9 5 5M22 9l-5 5" strokeLinecap="round" />
    </svg>
  );
}

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
    <div className="pointer-events-none absolute inset-0 z-10 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <div className="absolute left-3 right-[5.5rem] top-3 z-20 sm:left-4 sm:right-36 sm:top-4">
        <div className="relative overflow-hidden rounded-2xl border border-cyan-400/25 bg-[#050a12]/80 shadow-[0_0_0_1px_rgba(244,114,182,0.12),0_12px_40px_rgba(0,0,0,0.45)] shadow-panel-inset backdrop-blur-md">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
          <div className="pointer-events-none absolute -left-8 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-fuchsia-500/15 blur-2xl" />
          <div className="pointer-events-none absolute -right-6 top-0 h-20 w-20 rounded-full bg-cyan-400/10 blur-2xl" />

          <div className="relative grid grid-cols-2 divide-x divide-cyan-400/15">
            <div className="px-3 py-2.5 sm:px-4 sm:py-3">
              <p className="font-rajdhani text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200/60">
                Score
              </p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={score}
                  initial={{ y: -6, opacity: 0.5 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 4, opacity: 0.4 }}
                  transition={{ type: "spring", stiffness: 480, damping: 28 }}
                  className="font-orbitron text-xl font-bold tabular-nums tracking-tight text-cyan-100 sm:text-2xl"
                  style={{ textShadow: "0 0 18px rgba(34,211,238,0.35)" }}
                >
                  {score.toLocaleString()}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="px-3 py-2.5 sm:px-4 sm:py-3">
              <p className="font-rajdhani text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200/55">
                Coins
              </p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={coinsCollected}
                  initial={{ y: -6, opacity: 0.5 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 4, opacity: 0.4 }}
                  transition={{ type: "spring", stiffness: 480, damping: 28 }}
                  className="font-orbitron text-xl font-bold tabular-nums tracking-tight text-amber-200 sm:text-2xl"
                  style={{ textShadow: "0 0 14px rgba(251,191,36,0.25)" }}
                >
                  {coinsCollected.toLocaleString()}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute right-3 top-3 z-20 flex items-center gap-2 sm:right-4 sm:top-4 sm:gap-2.5">
        {phase === "playing" && (
          <>
            <motion.button
              type="button"
              onClick={onPauseToggle}
              whileTap={{ scale: 0.92 }}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-[#070d14]/90 text-cyan-200 shadow-neon-cyan backdrop-blur-sm transition hover:border-fuchsia-400/40 hover:text-fuchsia-100"
              title="Pause"
            >
              <IconPause className="h-4 w-4" />
            </motion.button>
            <motion.button
              type="button"
              onClick={onMuteToggle}
              whileTap={{ scale: 0.92 }}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-[#070d14]/90 text-cyan-200 shadow-neon-cyan backdrop-blur-sm transition hover:border-fuchsia-400/40 hover:text-fuchsia-100"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <IconVolumeOff className="h-5 w-5" /> : <IconVolumeOn className="h-5 w-5" />}
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
}
