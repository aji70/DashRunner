"use client";

import { motion } from "framer-motion";
import type { SwipeDirection } from "@/hooks/useSwipeGesture";

interface GameControlsProps {
  onAction: (dir: SwipeDirection) => void;
  visible?: boolean;
}

const padBase =
  "pointer-events-auto flex flex-col items-center justify-center gap-0.5 rounded-2xl border bg-[#060d14]/92 px-1 py-2 backdrop-blur-md active:scale-95 transition-transform min-h-[3.25rem] min-w-[3.25rem] sm:min-h-[3.5rem] sm:min-w-[3.5rem]";

function DirGlyph({ dir }: { dir: "up" | "down" | "left" | "right" }) {
  const stroke = "currentColor";
  const common = { fill: "none", stroke, strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (dir) {
    case "up":
      return (
        <svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 19V5M12 5l-5 5M12 5l5 5" {...common} />
        </svg>
      );
    case "down":
      return (
        <svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 5v14M12 19l-5-5M12 19l5-5" {...common} />
        </svg>
      );
    case "left":
      return (
        <svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden>
          <path d="M19 12H5M5 12l5-5M5 12l5 5" {...common} />
        </svg>
      );
    case "right":
      return (
        <svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden>
          <path d="M5 12h14M19 12l-5-5M19 12l-5 5" {...common} />
        </svg>
      );
  }
}

export function GameControls({ onAction, visible = true }: GameControlsProps) {
  if (!visible) return null;

  const fire = (dir: SwipeDirection) => onAction(dir);

  return (
    <div className="pointer-events-none absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-20 w-[min(100%,22rem)] -translate-x-1/2 px-3">
      <div
        className="pointer-events-auto relative rounded-[1.35rem] border border-cyan-500/20 p-2 shadow-[0_12px_48px_rgba(0,0,0,0.55)] backdrop-blur-lg"
        style={{
          background:
            "linear-gradient(165deg, rgba(12,20,28,0.92) 0%, rgba(4,8,14,0.96) 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(244,114,182,0.08)",
        }}
      >
        <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent" />
        <p className="pointer-events-none mb-1 text-center font-rajdhani text-[9px] font-semibold uppercase tracking-[0.28em] text-cyan-200/45">
          Controls
        </p>

        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          <div />
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onTouchStart={(e) => {
              e.preventDefault();
              fire("up");
            }}
            onClick={() => fire("up")}
            className={`${padBase} border-cyan-400/35 text-cyan-200 hover:border-fuchsia-400/35 hover:text-fuchsia-100`}
            aria-label="Jump"
          >
            <DirGlyph dir="up" />
            <span className="font-rajdhani text-[9px] font-bold uppercase tracking-wider text-cyan-100/50">Jump</span>
          </motion.button>
          <div />

          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onTouchStart={(e) => {
              e.preventDefault();
              fire("left");
            }}
            onClick={() => fire("left")}
            className={`${padBase} border-cyan-400/35 text-cyan-200 hover:border-fuchsia-400/35 hover:text-fuchsia-100`}
            aria-label="Move left"
          >
            <DirGlyph dir="left" />
            <span className="font-rajdhani text-[9px] font-bold uppercase tracking-wider text-cyan-100/50">Left</span>
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onTouchStart={(e) => {
              e.preventDefault();
              fire("down");
            }}
            onClick={() => fire("down")}
            className={`${padBase} border-fuchsia-400/30 text-fuchsia-100/90 hover:border-fuchsia-300/50`}
            aria-label="Slide"
          >
            <DirGlyph dir="down" />
            <span className="font-rajdhani text-[9px] font-bold uppercase tracking-wider text-fuchsia-200/50">Slide</span>
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onTouchStart={(e) => {
              e.preventDefault();
              fire("right");
            }}
            onClick={() => fire("right")}
            className={`${padBase} border-cyan-400/35 text-cyan-200 hover:border-fuchsia-400/35 hover:text-fuchsia-100`}
            aria-label="Move right"
          >
            <DirGlyph dir="right" />
            <span className="font-rajdhani text-[9px] font-bold uppercase tracking-wider text-cyan-100/50">Right</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
