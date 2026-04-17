"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

const MotionButton = motion.button;

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

function PanelChrome({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative w-full max-w-md overflow-hidden rounded-3xl border border-cyan-400/20 px-6 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:px-10 sm:py-10"
      style={{
        background: "linear-gradient(160deg, rgba(14,22,32,0.94) 0%, rgba(5,8,14,0.97) 55%, rgba(18,10,28,0.92) 100%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(244,114,182,0.1)",
      }}
    >
      <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-fuchsia-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-44 w-44 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/45 to-transparent" />
      {children}
    </div>
  );
}

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
          <div className="absolute inset-0 bg-[#020508]/95" />
          <div
            className="absolute inset-0 opacity-[0.45]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(34,211,238,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.07) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{ opacity: [0.22, 0.38, 0.22] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background: "radial-gradient(ellipse 80% 55% at 50% -10%, rgba(244,114,182,0.35), transparent 55%)",
            }}
          />

          <div className="relative z-10 flex w-full max-w-lg flex-col items-center">
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="mb-2 font-rajdhani text-[11px] font-semibold uppercase tracking-[0.45em] text-cyan-200/55"
            >
              Neon arcade
            </motion.div>

            <motion.h1
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 20, delay: 0.05 }}
              className="text-center font-orbitron text-4xl font-black uppercase leading-none tracking-tight text-transparent sm:text-6xl md:text-7xl"
              style={{
                backgroundImage: "linear-gradient(105deg, #f0abfc 0%, #67e8f9 45%, #fde68a 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 28px rgba(34,211,238,0.25))",
              }}
            >
              Dash
              <br />
              <span className="text-[0.72em] font-bold tracking-[0.08em] sm:text-[0.68em]">Runner</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mt-4 max-w-sm text-center font-rajdhani text-sm leading-relaxed text-cyan-100/75"
            >
              Lanes · jumps · slides · coin chains. Build streaks and chase your best run.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="mt-6 flex flex-wrap justify-center gap-2"
            >
              {["Swipe", "or", "tap pad"].map((t, i) => (
                <span
                  key={`${t}-${i}`}
                  className={`rounded-full border px-3 py-1 font-rajdhani text-[10px] font-semibold uppercase tracking-widest ${
                    t === "or"
                      ? "border-transparent text-cyan-200/35"
                      : "border-cyan-400/25 bg-black/30 text-cyan-200/70"
                  }`}
                >
                  {t}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.12 }}
              className="mt-10 w-full max-w-xs"
            >
              <MotionButton
                type="button"
                onClick={onStart}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="relative w-full overflow-hidden rounded-2xl border-2 border-fuchsia-400/50 bg-gradient-to-br from-fuchsia-600/90 via-fuchsia-700/80 to-indigo-950/90 py-4 font-orbitron text-sm font-bold uppercase tracking-[0.2em] text-white shadow-neon-fuchsia sm:py-5 sm:text-base"
              >
                <span className="relative z-10">Deploy run</span>
                <motion.span
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
                />
              </MotionButton>
            </motion.div>

            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              onClick={() => router.push("/")}
              className="mt-6 font-rajdhani text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300/50 transition hover:text-cyan-200"
            >
              ← Hub · shop · rewards
            </motion.button>

            {highScore > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 font-rajdhani text-sm text-cyan-200/55"
              >
                Personal best{" "}
                <span className="font-orbitron font-bold tabular-nums text-amber-200/90">{highScore.toLocaleString()}</span>
              </motion.p>
            )}
          </div>
        </motion.div>
      )}

      {phase === "paused" && (
        <motion.div
          key="pause-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="w-full max-w-md"
          >
            <PanelChrome>
              <div className="relative text-center">
                <p className="font-rajdhani text-[11px] font-semibold uppercase tracking-[0.35em] text-fuchsia-200/60">Hold up</p>
                <h2 className="mt-2 font-orbitron text-3xl font-black uppercase tracking-wide text-fuchsia-100 sm:text-4xl">
                  Paused
                </h2>
                <p className="mt-4 font-rajdhani text-base text-cyan-100/65">
                  Current score{" "}
                  <span className="font-orbitron text-lg font-bold tabular-nums text-cyan-100">{score.toLocaleString()}</span>
                </p>

                <div className="mt-8 flex flex-col gap-3">
                  <MotionButton
                    type="button"
                    onClick={onResume}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full rounded-2xl border border-cyan-400/40 bg-gradient-to-r from-cyan-600/40 to-cyan-500/25 py-3.5 font-orbitron text-sm font-bold uppercase tracking-widest text-cyan-50 shadow-neon-cyan"
                  >
                    Resume
                  </MotionButton>
                  <MotionButton
                    type="button"
                    onClick={onRestart}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 font-orbitron text-sm font-semibold uppercase tracking-widest text-cyan-200/80 transition hover:border-fuchsia-400/30 hover:text-fuchsia-100"
                  >
                    Restart run
                  </MotionButton>
                </div>
              </div>
            </PanelChrome>
          </motion.div>
        </motion.div>
      )}

      {phase === "dead" && (
        <motion.div
          key="game-over-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-auto absolute inset-0 z-30 flex items-end justify-center bg-black/55 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center sm:pb-0"
        >
          <motion.div
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 32, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="w-full max-w-md px-3 sm:px-4"
          >
            <PanelChrome>
              <div className="relative text-center">
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

                <div className="mt-8 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-cyan-400/20 bg-black/35 px-3 py-4">
                    <p className="font-rajdhani text-[10px] font-semibold uppercase tracking-widest text-cyan-200/50">Run score</p>
                    <p className="mt-1 font-orbitron text-2xl font-bold tabular-nums text-cyan-100 sm:text-3xl">{score.toLocaleString()}</p>
                  </div>
                  <div className="rounded-2xl border border-amber-300/20 bg-black/35 px-3 py-4">
                    <p className="font-rajdhani text-[10px] font-semibold uppercase tracking-widest text-amber-200/50">Best</p>
                    <p className="mt-1 font-orbitron text-2xl font-bold tabular-nums text-amber-200 sm:text-3xl">{highScore.toLocaleString()}</p>
                  </div>
                </div>

                {isNewPersonalBest && (
                  <motion.p
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.08 }}
                    className="mt-5 font-orbitron text-xs font-bold uppercase tracking-[0.2em] text-emerald-300"
                  >
                    New personal best
                  </motion.p>
                )}

                {!isNewPersonalBest && highScore > score && (
                  <p className="mt-4 font-rajdhani text-sm text-cyan-200/45">Beat {highScore.toLocaleString()} next time.</p>
                )}

                <div className="mt-8 flex w-full flex-col gap-2.5 sm:flex-row">
                  <MotionButton
                    type="button"
                    onClick={onRestart}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 rounded-2xl border border-fuchsia-400/45 bg-gradient-to-br from-fuchsia-600/50 to-indigo-950/80 py-3.5 font-orbitron text-xs font-bold uppercase tracking-widest text-white shadow-neon-fuchsia sm:text-sm"
                  >
                    Again
                  </MotionButton>
                  <MotionButton
                    type="button"
                    onClick={() => router.push("/")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 rounded-2xl border border-cyan-400/25 bg-white/5 py-3.5 font-orbitron text-xs font-semibold uppercase tracking-widest text-cyan-200/85 transition hover:border-cyan-300/40 sm:text-sm"
                  >
                    Exit
                  </MotionButton>
                </div>
              </div>
            </PanelChrome>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
