"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { GamePhase } from "@/types/runner";
import { cn } from "@/lib/cn";
import { ArcadeSpeedCluster } from "./ArcadeSpeedCluster";

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

function CeloIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <text x="12" y="16" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#F5C518">
        $
      </text>
    </svg>
  );
}

interface GameHUDProps {
  score: number;
  coinsCollected: number;
  phase: GamePhase;
  speedKmh: number;
  gear: number;
  isMuted: boolean;
  onPauseToggle: () => void;
  onMuteToggle: () => void;
}

export function GameHUD({
  score,
  coinsCollected,
  phase,
  speedKmh,
  gear,
  isMuted,
  onPauseToggle,
  onMuteToggle,
}: GameHUDProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 pt-[max(0.5rem,env(safe-area-inset-top))]">
      {/* Top bar - Score and Coins */}
      <div
        className="absolute left-0 right-0 top-0 z-20 w-full px-4 py-3 sm:px-6 sm:py-4"
        style={{
          backgroundColor: "rgba(5, 8, 25, 0.85)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(0, 229, 204, 0.1)",
        }}
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
          {/* Score */}
          <div className="flex items-center gap-3">
            <span className="font-inter text-xs font-semibold uppercase tracking-widest text-white/50">
              Score
            </span>
            <AnimatePresence mode="wait">
              <motion.p
                key={score}
                initial={{ y: -6, opacity: 0.5 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 4, opacity: 0.4 }}
                transition={{ type: "spring", stiffness: 480, damping: 28 }}
                className="font-orbitron text-xl font-black tabular-nums tracking-tight sm:text-2xl"
                style={{
                  color: "#00E5CC",
                  textShadow: "0 0 20px rgba(0, 229, 204, 0.5)",
                }}
              >
                {score.toLocaleString()}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Coins */}
          <div className="flex items-center gap-3">
            <span className="font-inter text-xs font-semibold uppercase tracking-widest text-white/50">
              Celo
            </span>
            <div className="flex items-center gap-1.5">
              <span style={{ color: "#F5C518" }}>$</span>
              <AnimatePresence mode="wait">
                <motion.p
                  key={coinsCollected}
                  initial={{ y: -6, opacity: 0.5 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 4, opacity: 0.4 }}
                  transition={{ type: "spring", stiffness: 480, damping: 28 }}
                  className="font-orbitron text-xl font-black tabular-nums tracking-tight sm:text-2xl"
                  style={{
                    color: "#F5C518",
                    textShadow: "0 0 16px rgba(245, 197, 24, 0.3)",
                  }}
                >
                  {coinsCollected.toLocaleString()}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* Control buttons */}
          <div className="ml-auto flex items-center gap-2">
            {phase === "playing" && (
              <>
                <motion.button
                  type="button"
                  onClick={onPauseToggle}
                  whileTap={{ scale: 0.92 }}
                  className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-lg transition"
                  style={{
                    border: "1px solid rgba(0, 229, 204, 0.4)",
                    backgroundColor: "rgba(0, 229, 204, 0.08)",
                    color: "#00E5CC",
                  }}
                  title="Pause"
                >
                  <IconPause className="h-4 w-4" />
                </motion.button>
                <motion.button
                  type="button"
                  onClick={onMuteToggle}
                  whileTap={{ scale: 0.92 }}
                  className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-lg transition"
                  style={{
                    border: "1px solid rgba(0, 229, 204, 0.4)",
                    backgroundColor: "rgba(0, 229, 204, 0.08)",
                    color: "#00E5CC",
                  }}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <IconVolumeOff className="h-5 w-5" /> : <IconVolumeOn className="h-5 w-5" />}
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Speedometer in bottom right */}
      {(phase === "playing" || phase === "paused") && (
        <div className="pointer-events-none absolute bottom-3 right-3 z-20 sm:bottom-4 sm:right-4">
          <ArcadeSpeedCluster speedKmh={speedKmh} gear={gear} />
        </div>
      )}

      {/* Control hints (fade out after a few seconds) */}
      {phase === "playing" && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 4, duration: 1 }}
          className="pointer-events-none absolute bottom-3 left-0 right-0 z-10 text-center text-xs font-inter font-semibold uppercase tracking-widest"
          style={{ color: "rgba(0, 229, 204, 0.5)" }}
        >
          ← SWIPE → SWITCH | ↑ JUMP | ↓ SLIDE
        </motion.div>
      )}
    </div>
  );
}
