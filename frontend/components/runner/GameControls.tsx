"use client";

import { motion } from "framer-motion";
import type { SwipeDirection } from "@/hooks/useSwipeGesture";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/lib/cn";

interface GameControlsProps {
  onAction: (dir: SwipeDirection) => void;
  visible?: boolean;
}

const padBase =
  "pointer-events-auto flex flex-col items-center justify-center gap-0.5 rounded-xl border border-white/[0.1] bg-[var(--panel)]/95 px-1 py-2 shadow-[var(--shadow-panel)] backdrop-blur-md active:scale-95 transition-transform min-h-[3.25rem] min-w-[3.25rem] sm:min-h-[3.5rem] sm:min-w-[3.5rem] hover:border-[var(--line-bright)]";

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
      <GlassPanel hover className="rounded-[1.35rem] p-2 shadow-lift">
        <p className="pointer-events-none mb-1.5 text-center font-rajdhani text-[9px] font-semibold uppercase tracking-[0.28em] text-[var(--text-dim)]">
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
            className={cn(padBase, "text-cyan-200")}
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
            className={cn(padBase, "text-cyan-200")}
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
            className={cn(padBase, "border-fuchsia-400/25 text-fuchsia-100/95 hover:border-fuchsia-400/45")}
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
            className={cn(padBase, "text-cyan-200")}
            aria-label="Move right"
          >
            <DirGlyph dir="right" />
            <span className="font-rajdhani text-[9px] font-bold uppercase tracking-wider text-cyan-100/50">Right</span>
          </motion.button>
        </div>
      </GlassPanel>
    </div>
  );
}
