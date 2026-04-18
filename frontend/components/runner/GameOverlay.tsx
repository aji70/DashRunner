"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";

interface GameOverlayProps {
  phase: "idle" | "playing" | "paused" | "dead";
  score: number;
  highScore: number;
  /** True only when this death run strictly beat the previous stored best. */
  isNewPersonalBest: boolean;
  onStart: () => void;
  onRestart: () => void;
  onResume?: () => void;
}

const statTile =
  "rounded-2xl border border-white/[0.08] bg-[var(--panel)]/80 px-3 py-4 shadow-[var(--shadow-panel)] backdrop-blur-md";

export function GameOverlay({
  phase,
  score,
  highScore,
  isNewPersonalBest,
  onStart,
  onRestart,
  onResume,
}: GameOverlayProps) {
  const router = useRouter();

  return (
    <AnimatePresence mode="wait">
      {phase === "idle" && (
        <motion.div
          key="start-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-auto absolute inset-0 z-30 flex flex-col items-center justify-center px-4"
        >
          <div className="absolute inset-0 bg-void/95" />
          <div
            className="absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(34,211,238,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.06) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <motion.div
            className="absolute inset-0 opacity-25"
            animate={{ opacity: [0.18, 0.32, 0.18] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background: "radial-gradient(ellipse 80% 55% at 50% -10%, rgba(244,114,182,0.35), transparent 55%)",
            }}
          />

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="relative z-10 w-full max-w-sm"
          >
            <GlassPanel className="px-6 py-8 text-center shadow-lift sm:px-8 sm:py-10">
              <h1
                className="font-orbitron text-3xl font-black uppercase tracking-[0.08em] sm:text-4xl"
                style={{
                  backgroundImage: "linear-gradient(90deg, #f0abfc, #67e8f9)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                DashRunner
              </h1>

              <p className="mt-2 font-rajdhani text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/70">
                Endless Neon Chase
              </p>

              <motion.div className="mt-8" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button variant="primary" onClick={onStart} className="w-full rounded-2xl py-4 text-sm font-bold sm:py-5 sm:text-base">
                  Play
                </Button>
              </motion.div>

              <p className="mt-4 font-rajdhani text-[10px] uppercase tracking-widest text-cyan-200/50 sm:text-xs">
                ← Swipe → Switch | ↑ Jump | ↓ Slide
              </p>

              <button
                type="button"
                onClick={() => router.push("/")}
                className="mt-5 w-full text-center font-rajdhani text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-dim)] transition hover:text-cyan-200"
              >
                Hub
              </button>

              {highScore > 0 ? (
                <p className="mt-6 text-center font-rajdhani text-xs text-[var(--text-dim)] sm:text-sm">
                  Best <span className="font-orbitron font-bold tabular-nums text-amber-200/90">{highScore.toLocaleString()}</span>
                </p>
              ) : null}
            </GlassPanel>
          </motion.div>
        </motion.div>
      )}

      {phase === "paused" && (
        <motion.div
          key="pause-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center bg-black/65 px-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="w-full max-w-md"
          >
            <GlassPanel className="px-6 py-8 text-center shadow-lift sm:px-10 sm:py-10">
              <p className="font-rajdhani text-[11px] font-semibold uppercase tracking-[0.35em] text-fuchsia-200/60">Hold up</p>
              <h2 className="mt-2 font-orbitron text-3xl font-black uppercase tracking-wide text-fuchsia-100 sm:text-4xl">Paused</h2>
              <p className="mt-4 font-rajdhani text-base text-[var(--text-secondary)]">
                Current score{" "}
                <span className="font-orbitron text-lg font-bold tabular-nums text-cyan-100">{score.toLocaleString()}</span>
              </p>

              <div className="mt-8 flex flex-col gap-3">
                <Button variant="secondary" onClick={onResume} className="w-full rounded-2xl py-3.5 shadow-neon-cyan">
                  Resume
                </Button>
                <Button variant="ghost" onClick={onRestart} className="w-full rounded-2xl py-3.5">
                  Restart run
                </Button>
              </div>
            </GlassPanel>
          </motion.div>
        </motion.div>
      )}

      {phase === "dead" && (
        <motion.div
          key="game-over-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-auto absolute inset-0 z-30 flex items-end justify-center bg-black/60 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center sm:pb-0"
        >
          <motion.div
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 32, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="w-full max-w-md px-3 sm:px-4"
          >
            <GlassPanel className="px-6 py-8 text-center shadow-lift sm:px-8 sm:py-10">
              <p className="font-rajdhani text-[11px] font-semibold uppercase tracking-[0.35em] text-red-300/70">Wiped out</p>
              <h2
                className="mt-1 bg-clip-text font-orbitron text-3xl font-black uppercase text-transparent sm:text-4xl"
                style={{
                  backgroundImage: "linear-gradient(90deg, #fda4af, #f0abfc, #67e8f9)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                }}
              >
                Game over
              </h2>

              <div className="my-6 h-px bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent" />

              <div className="mt-6 grid grid-cols-2 gap-3">
                <motion.div
                  className={statTile}
                  animate={isNewPersonalBest ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <p className="font-rajdhani text-[10px] font-semibold uppercase tracking-widest text-[var(--text-dim)]">Run score</p>
                  <p className="mt-1 font-orbitron text-2xl font-bold tabular-nums text-cyan-100 sm:text-3xl">{score.toLocaleString()}</p>
                </motion.div>
                <div className={statTile}>
                  <div className="flex items-center justify-between">
                    <p className="font-rajdhani text-[10px] font-semibold uppercase tracking-widest text-amber-200/55">Best</p>
                    <span className="text-amber-200/70 text-lg">◆</span>
                  </div>
                  <p className="mt-1 font-orbitron text-2xl font-bold tabular-nums text-amber-200 sm:text-3xl">{highScore.toLocaleString()}</p>
                </div>
              </div>

              {isNewPersonalBest ? (
                <motion.p
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.08 }}
                  className="mt-5 font-orbitron text-xs font-bold uppercase tracking-[0.2em] text-emerald-300"
                >
                  New personal best
                </motion.p>
              ) : null}

              {!isNewPersonalBest && highScore > score ? (
                <p className="mt-4 font-rajdhani text-sm text-[var(--text-dim)]">Beat {highScore.toLocaleString()} next time.</p>
              ) : null}

              <div className="mt-8 flex w-full flex-col gap-2.5 sm:flex-row">
                <Button variant="primary" onClick={onRestart} className="flex-1 rounded-2xl py-3.5 sm:text-sm">
                  Again
                </Button>
                <Button variant="ghost" onClick={() => router.push("/")} className="flex-1 rounded-2xl py-3.5 sm:text-sm">
                  Exit
                </Button>
              </div>
            </GlassPanel>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
