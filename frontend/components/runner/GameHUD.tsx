"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { GamePhase } from "@/types/runner";
import { GlassPanel } from "@/components/ui/GlassPanel";
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

const iconBtn =
  "pointer-events-auto flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.1] bg-[var(--panel)]/95 text-cyan-200 shadow-[var(--shadow-panel)] backdrop-blur-md transition hover:border-[var(--line-bright)] hover:text-fuchsia-100";

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
      <div className="absolute left-3 right-[5.5rem] top-3 z-20 sm:left-4 sm:right-36 sm:top-4">
        <GlassPanel className="shadow-lift">
          <div className="grid grid-cols-2 divide-x divide-cyan-400/15">
            <div className="px-3 py-2.5 sm:px-4 sm:py-3">
              <p className="font-rajdhani text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-dim)]">
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
                  style={{ textShadow: "0 0 20px rgba(34,211,238,0.5), 0 0 40px rgba(34,211,238,0.25)" }}
                >
                  {score.toLocaleString()}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="px-3 py-2.5 sm:px-4 sm:py-3">
              <p className="font-rajdhani text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200/55">
                Coins
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-200">◆</span>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={coinsCollected}
                    initial={{ y: -6, opacity: 0.5 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 4, opacity: 0.4 }}
                    transition={{ type: "spring", stiffness: 480, damping: 28 }}
                    className="font-orbitron text-xl font-bold tabular-nums tracking-tight text-amber-200 sm:text-2xl"
                    style={{ textShadow: "0 0 16px rgba(251,191,36,0.35)" }}
                  >
                    {coinsCollected.toLocaleString()}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </GlassPanel>
      </div>

      <div className="absolute right-3 top-3 z-20 flex items-center gap-2 sm:right-4 sm:top-4 sm:gap-2.5">
        {phase === "playing" && (
          <>
            <motion.button
              type="button"
              onClick={onPauseToggle}
              whileTap={{ scale: 0.92 }}
              className={cn(iconBtn, "shadow-neon-cyan")}
              title="Pause"
            >
              <IconPause className="h-4 w-4" />
            </motion.button>
            <motion.button
              type="button"
              onClick={onMuteToggle}
              whileTap={{ scale: 0.92 }}
              className={cn(iconBtn, "shadow-neon-cyan")}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <IconVolumeOff className="h-5 w-5" /> : <IconVolumeOn className="h-5 w-5" />}
            </motion.button>
          </>
        )}
      </div>

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
          className="pointer-events-none absolute bottom-3 left-0 right-0 z-10 text-center text-xs font-rajdhani font-semibold uppercase tracking-widest text-cyan-300/60"
        >
          ← SWIPE → SWITCH | ↑ JUMP | ↓ SLIDE
        </motion.div>
      )}
    </div>
  );
}
