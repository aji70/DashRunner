"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

const MotionButton = motion.button;

interface GameOverlayProps {
  phase: "idle" | "playing" | "paused" | "dead";
  score: number;
  highScore: number;
  onStart: () => void;
  onRestart: () => void;
  onResume?: () => void;
}

export function GameOverlay({
  phase,
  score,
  highScore,
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
          className="pointer-events-auto absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#180f2f]/95 backdrop-blur-sm px-4"
        >
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-fuchsia-300 via-cyan-200 to-yellow-200 bg-clip-text font-orbitron text-4xl sm:text-5xl md:text-6xl font-bold text-transparent"
          >
            DASH
          </motion.h1>

          <motion.p
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-2 font-orbitron text-sm sm:text-base md:text-lg text-cyan-100/80"
          >
            Endless Runner
          </motion.p>

          <motion.p
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-2 text-center font-orbitron text-xs text-fuchsia-100/75"
          >
            Move lanes, jump over walls, slide under barriers, collect coins.
          </motion.p>

          <MotionButton
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={onStart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-8 sm:mt-12 rounded-lg border-2 border-fuchsia-300 bg-indigo-950/70 px-6 sm:px-8 py-3 sm:py-4 font-orbitron text-base sm:text-lg font-bold text-cyan-100 transition hover:bg-fuchsia-500/20"
          >
            TAP TO START
          </MotionButton>

          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            onClick={() => router.push("/")}
            className="mt-4 text-xs font-semibold uppercase tracking-widest text-cyan-200/60 underline-offset-4 hover:text-cyan-100 hover:underline"
          >
            Hub · shop · rewards
          </motion.button>

          {highScore > 0 && (
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 sm:mt-8 font-orbitron text-xs sm:text-sm text-cyan-100/70"
            >
              Best: {highScore}
            </motion.p>
          )}
        </motion.div>
      )}

      {phase === "paused" && (
        <motion.div
          key="pause-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-auto absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#180f2f]/90 backdrop-blur-sm px-4"
        >
          <motion.h2
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-bold text-fuchsia-200"
          >
            PAUSED
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 sm:mt-6 font-orbitron text-sm sm:text-base text-cyan-100/75 text-center"
          >
            Score: {score}
          </motion.p>

          <MotionButton
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={onResume}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-8 sm:mt-12 rounded-lg border-2 border-fuchsia-300 bg-indigo-950/70 px-6 sm:px-8 py-3 sm:py-4 font-orbitron text-base sm:text-lg font-bold text-cyan-100 transition hover:bg-fuchsia-500/20"
          >
            RESUME
          </MotionButton>

          <MotionButton
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={onRestart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-3 rounded-lg border-2 border-cyan-300/50 bg-indigo-950/70 px-6 sm:px-8 py-3 sm:py-4 font-orbitron text-base sm:text-lg font-bold text-cyan-100/70 transition hover:border-fuchsia-300 hover:text-cyan-100"
          >
            RESTART
          </MotionButton>
        </motion.div>
      )}

      {phase === "dead" && (
        <motion.div
          key="game-over-screen"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="pointer-events-auto absolute inset-x-0 bottom-0 z-30 flex flex-col items-center justify-center rounded-t-2xl bg-[#20133d] px-4 py-8 sm:px-6 sm:py-12 max-h-[80vh] overflow-y-auto"
        >
          <h2 className="font-orbitron text-3xl sm:text-4xl font-bold text-fuchsia-200">
            GAME OVER
          </h2>

          <div className="mt-6 sm:mt-8 text-center">
            <p className="font-orbitron text-xs sm:text-sm text-cyan-100/80">
              FINAL SCORE
            </p>
            <p className="font-orbitron text-4xl sm:text-5xl font-bold text-yellow-200">
              {score}
            </p>
          </div>

          {highScore > score && (
            <p className="mt-3 sm:mt-4 font-orbitron text-xs sm:text-sm text-cyan-100/70">
              Best: {highScore}
            </p>
          )}

          {score > highScore && (
            <motion.p
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-3 sm:mt-4 font-orbitron text-xs sm:text-sm font-bold text-[#00FF00]"
            >
              🎉 NEW BEST! 🎉
            </motion.p>
          )}

          <div className="mt-8 sm:mt-10 flex w-full gap-2 sm:gap-3">
            <MotionButton
              onClick={onRestart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 rounded-lg border-2 border-fuchsia-300 bg-indigo-950/70 py-2 sm:py-3 font-orbitron text-sm sm:text-base font-bold text-cyan-100 transition hover:bg-fuchsia-500/20"
            >
              PLAY AGAIN
            </MotionButton>
            <MotionButton
              onClick={() => router.push("/")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 rounded-lg border-2 border-cyan-300/50 bg-indigo-950/70 py-2 sm:py-3 font-orbitron text-sm sm:text-base font-bold text-cyan-100/70 transition hover:border-fuchsia-300 hover:text-cyan-100"
            >
              EXIT
            </MotionButton>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
