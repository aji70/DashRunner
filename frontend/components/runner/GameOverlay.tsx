"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";

interface GameOverlayProps {
  phase: "idle" | "playing" | "paused" | "dead";
  score: number;
  highScore: number;
  distance?: number;
  coins?: number;
  isNewPersonalBest: boolean;
  onStart: () => void;
  onRestart: () => void;
  onResume?: () => void;
}

export function GameOverlay({
  phase,
  score,
  highScore,
  distance = 0,
  coins = 0,
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

              <p className="mt-2 font-rajdhani text-xs font-semibold uppercase tracking-[0.3em] text-orange-300/70">
                Endless Neon Chase
              </p>

              <motion.div className="mt-8" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button variant="primary" onClick={onStart} className="w-full rounded-2xl py-4 text-sm font-bold sm:py-5 sm:text-base">
                  Play
                </Button>
              </motion.div>

              <p className="mt-4 font-rajdhani text-[10px] uppercase tracking-widest text-orange-200/50 sm:text-xs">
                ← Swipe → Switch | ↑ Jump | ↓ Brake
              </p>

              <button
                type="button"
                onClick={() => router.push("/")}
                className="mt-5 w-full text-center font-rajdhani text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-dim)] transition hover:text-orange-200"
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
              <p className="font-rajdhani text-[11px] font-semibold uppercase tracking-[0.35em] text-rose-200/60">Hold up</p>
              <h2 className="mt-2 font-orbitron text-3xl font-black uppercase tracking-wide text-rose-100 sm:text-4xl">Paused</h2>
              <p className="mt-4 font-rajdhani text-base text-[var(--text-secondary)]">
                Current score{" "}
                <span className="font-orbitron text-lg font-bold tabular-nums text-orange-100">{score.toLocaleString()}</span>
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
          transition={{ duration: 0.4 }}
          className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center px-4 backdrop-blur-lg"
          style={{ backgroundColor: "rgba(5, 0, 20, 0.92)" }}
        >
          <style>{`
            @keyframes glitch {
              0%   { transform: translateX(0) }
              20%  { transform: translateX(-3px) }
              40%  { transform: translateX(3px) }
              60%  { transform: translateX(-2px) }
              80%  { transform: translateX(2px) }
              100% { transform: translateX(0) }
            }
            .glitch-text {
              animation: glitch 0.4s ease-in-out;
            }
          `}</style>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="w-full max-w-lg"
          >
            <div className="space-y-6 rounded-lg border border-cyan-500/20 bg-void/80 px-6 py-10 sm:px-12 sm:py-14">
              {/* NULLBLOCK GOT YOU */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="glitch-text text-center font-rajdhani text-base font-bold uppercase tracking-widest"
                style={{ color: "#ff2244", letterSpacing: "4px" }}
              >
                NULLBLOCK GOT YOU
              </motion.p>

              {/* GAME OVER */}
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-center font-bebas text-6xl font-black uppercase tracking-wider sm:text-7xl"
                style={{
                  color: "#ffffff",
                  textShadow: "0 0 30px rgba(255,34,68,0.8)",
                }}
              >
                GAME OVER
              </motion.h2>

              {/* Score Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mx-auto w-full max-w-xs space-y-3 rounded-lg border px-8 py-6"
                style={{
                  backgroundColor: "rgba(0,229,204,0.08)",
                  borderColor: "rgba(0,229,204,0.3)",
                  borderRadius: "8px",
                }}
              >
                <p className="text-center font-rajdhani text-xs font-semibold uppercase tracking-widest text-gray-300">
                  Your Score
                </p>
                <p
                  className="text-center font-orbitron text-5xl font-black tabular-nums sm:text-6xl"
                  style={{ color: "#00E5CC" }}
                >
                  {score.toLocaleString()}
                </p>

                <div className="space-y-1 border-t border-cyan-500/20 pt-3">
                  <p className="font-rajdhani text-xs text-gray-400">
                    Distance: <span className="text-white">{(distance / 140).toFixed(1)}km</span>
                  </p>
                  <p className="font-rajdhani text-xs text-gray-400">
                    Coins: <span className="text-amber-300">${coins} DASH</span>
                  </p>
                </div>
              </motion.div>

              {/* New Personal Best Badge */}
              {isNewPersonalBest && (
                <motion.p
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.3 }}
                  className="text-center font-orbitron text-sm font-bold uppercase tracking-widest text-amber-300"
                >
                  🏆 NEW RECORD!
                </motion.p>
              )}

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="flex flex-col gap-3 sm:flex-row sm:gap-4"
              >
                <button
                  onClick={onRestart}
                  className="flex-1 px-6 py-3.5 font-orbitron text-sm font-bold uppercase tracking-wide transition hover:brightness-110"
                  style={{
                    backgroundColor: "#00E5CC",
                    color: "#000000",
                    clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
                  }}
                >
                  Try Again
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="flex-1 px-6 py-3.5 font-orbitron text-sm font-bold uppercase tracking-wide transition hover:border-white"
                  style={{
                    backgroundColor: "transparent",
                    color: "#ffffff",
                    border: "1px solid rgba(255,255,255,0.3)",
                    clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
                  }}
                >
                  Main Menu
                </button>
              </motion.div>

              {/* Personal Best Display */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center font-rajdhani text-xs font-semibold uppercase tracking-widest text-gray-400"
              >
                🏆 Your Best:{" "}
                <span className="text-amber-200">{highScore.toLocaleString()}</span>
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
