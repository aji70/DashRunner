"use client";

import { SwipeDirection } from "@/hooks/useSwipeGesture";

interface GameControlsProps {
  onAction: (dir: SwipeDirection) => void;
  visible?: boolean;
}

export function GameControls({ onAction, visible = true }: GameControlsProps) {
  if (!visible) return null;

  const handleTouchStart = (dir: SwipeDirection) => {
    onAction(dir);
  };

  const buttonClass =
    "flex h-14 w-14 items-center justify-center rounded-xl border border-[rgba(0,240,255,0.35)] bg-[#0E1415]/90 text-xl text-[#00F0FF] active:bg-[#1a3a3c] transition-colors md:h-12 md:w-12";

  return (
    <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
      <div className="pointer-events-auto grid grid-cols-3 gap-2 rounded-2xl border border-[rgba(0,240,255,0.2)] bg-black/30 p-2 backdrop-blur-sm">
      <div />
      <button
        onTouchStart={() => handleTouchStart("up")}
        onClick={() => handleTouchStart("up")}
        className={buttonClass}
        aria-label="Jump"
      >
        ↑
      </button>
      <div />

        <button
          onTouchStart={() => handleTouchStart("left")}
          onClick={() => handleTouchStart("left")}
          className={buttonClass}
          aria-label="Move left"
        >
          ←
        </button>
        <button
          onTouchStart={() => handleTouchStart("down")}
          onClick={() => handleTouchStart("down")}
          className={buttonClass}
          aria-label="Slide"
        >
          ↓
        </button>
        <button
          onTouchStart={() => handleTouchStart("right")}
          onClick={() => handleTouchStart("right")}
          className={buttonClass}
          aria-label="Move right"
        >
          →
        </button>
      </div>
    </div>
  );
}
