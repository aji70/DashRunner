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

  return (
    <div className="pointer-events-auto absolute bottom-3 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex sm:bottom-6">
      {/* Up arrow - Desktop only */}
      <button
        onTouchStart={() => handleTouchStart("up")}
        onClick={() => handleTouchStart("up")}
        className="flex h-14 w-14 items-center justify-center rounded-lg border border-[rgba(0,240,255,0.3)] bg-[#0E1415] text-xl text-[#00F0FF] hover:border-[rgba(0,240,255,0.6)] active:bg-[#1a3a3c] transition-colors"
      >
        ↑
      </button>

      {/* Left, Down, Right row - Desktop only */}
      <div className="flex gap-2">
        <button
          onTouchStart={() => handleTouchStart("left")}
          onClick={() => handleTouchStart("left")}
          className="flex h-14 w-14 items-center justify-center rounded-lg border border-[rgba(0,240,255,0.3)] bg-[#0E1415] text-xl text-[#00F0FF] hover:border-[rgba(0,240,255,0.6)] active:bg-[#1a3a3c] transition-colors"
        >
          ←
        </button>
        <button
          onTouchStart={() => handleTouchStart("down")}
          onClick={() => handleTouchStart("down")}
          className="flex h-14 w-14 items-center justify-center rounded-lg border border-[rgba(0,240,255,0.3)] bg-[#0E1415] text-xl text-[#00F0FF] hover:border-[rgba(0,240,255,0.6)] active:bg-[#1a3a3c] transition-colors"
        >
          ↓
        </button>
        <button
          onTouchStart={() => handleTouchStart("right")}
          onClick={() => handleTouchStart("right")}
          className="flex h-14 w-14 items-center justify-center rounded-lg border border-[rgba(0,240,255,0.3)] bg-[#0E1415] text-xl text-[#00F0FF] hover:border-[rgba(0,240,255,0.6)] active:bg-[#1a3a3c] transition-colors"
        >
          →
        </button>
      </div>
    </div>
  );
}
