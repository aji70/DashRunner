"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { GamePhase } from "@/types/runner";
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

interface GameHUDProps {
  score: number;
  coinsCollected: number;
  phase: GamePhase;
  speedKmh: number;
  gear: number;
  isMuted: boolean;
  isBoostActive?: boolean;
  isBoostOnCooldown?: boolean;
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
  isBoostActive = false,
  isBoostOnCooldown = false,
  onPauseToggle,
  onMuteToggle,
}: GameHUDProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 pt-[max(0.5rem,env(safe-area-inset-top))]">
      {/* Top bar - Score and Coins */}
      <div
        className="absolute left-0 right-0 top-0 z-20 w-full px-4 py-3 sm:px-6 sm:py-4"
        style={{
          backgroundColor: "rgba(5, 0, 20, 0.85)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(0, 229, 204, 0.2)",
        }}
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
          {/* Score */}
          <div className="flex items-center gap-3" style={{ borderLeft: "3px solid #00E5CC", paddingLeft: "12px" }}>
            <span className="font-inter text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", letterSpacing: "3px" }}>
              Chain Score
            </span>
            <AnimatePresence mode="wait">
              <motion.p
                key={score}
                initial={{ y: -6, opacity: 0.5 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 4, opacity: 0.4 }}
                transition={{ type: "spring", stiffness: 480, damping: 28 }}
                className="font-orbitron font-black tabular-nums tracking-tight"
                style={{
                  color: "#00E5CC",
                  fontSize: "28px",
                  fontWeight: "800",
                  textShadow: "0 0 20px rgba(0, 229, 204, 0.5)",
                }}
              >
                {score.toLocaleString()}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Coins */}
          <div className="flex items-center gap-3">
            <span className="font-inter font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", letterSpacing: "3px" }}>
              $DASH
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
                  className="font-orbitron font-black tabular-nums tracking-tight"
                  style={{
                    color: "#F5C518",
                    fontSize: "24px",
                    fontWeight: "700",
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
          <ArcadeSpeedCluster speedKmh={speedKmh} gear={gear} isBoosting={isBoostActive} />
        </div>
      )}

      {/* Boost Status Indicator */}
      {phase === "playing" && (
        <div className="pointer-events-none absolute top-[4.5rem] right-4 z-20 sm:right-6">
          <AnimatePresence mode="wait">
            {isBoostActive ? (
              <motion.div
                key="boost-active"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="font-rajdhani text-sm font-bold uppercase tracking-wider"
                style={{ color: "#00E5CC" }}
              >
                👻 GHOST MODE
              </motion.div>
            ) : isBoostOnCooldown ? (
              <motion.div
                key="boost-cooldown"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="font-rajdhani text-sm font-bold uppercase tracking-wider"
                style={{ color: "#ff6644" }}
              >
                SIGNAL LOST
              </motion.div>
            ) : (
              <motion.div
                key="boost-ready"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="font-rajdhani text-sm font-bold uppercase tracking-wider"
                style={{ color: "#00E5CC" }}
              >
                👻 GHOST READY
              </motion.div>
            )}
          </AnimatePresence>
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
