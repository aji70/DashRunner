"use client";

import { useState, useRef, useEffect } from "react";
import { GameCanvas, type GameCanvasHandle } from "./GameCanvas";
import { GameHUD } from "./GameHUD";
import { GameControls } from "./GameControls";
import { GameOverlay } from "./GameOverlay";
import type { GamePhase } from "@/types/runner";

export function RunnerGame() {
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [score, setScore] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const canvasRef = useRef<GameCanvasHandle>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("runner_highscore");
      if (saved) {
        setHighScore(parseInt(saved, 10));
      }
    }
  }, []);

  const handleStart = () => {
    canvasRef.current?.reset();
    setScore(0);
    setCoinsCollected(0);
    canvasRef.current?.start();
    setPhase("playing");
  };

  const handleGameOver = () => {
    setPhase("dead");
    if (score > highScore) {
      setHighScore(score);
      if (typeof window !== "undefined") {
        localStorage.setItem("runner_highscore", score.toString());
      }
    }
  };

  const handleRestart = () => {
    handleStart();
  };

  const handleScoreChange = (newScore: number) => {
    setScore(newScore);
  };

  const handleCoinsChange = (newCoins: number) => {
    setCoinsCollected(newCoins);
  };

  const handlePhaseChange = (newPhase: GamePhase) => {
    setPhase(newPhase);
  };

  const handlePauseToggle = () => {
    if (phase === "playing") {
      setPhase("paused");
      canvasRef.current?.pause();
    } else if (phase === "paused") {
      setPhase("playing");
      canvasRef.current?.resume();
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#010F10]" style={{ maxHeight: "100dvh" }}>
      <GameCanvas
        ref={canvasRef}
        onScoreChange={handleScoreChange}
        onCoinsChange={handleCoinsChange}
        onGameOver={handleGameOver}
        onPhaseChange={handlePhaseChange}
      />

      <GameHUD score={score} coinsCollected={coinsCollected} phase={phase} onPauseToggle={handlePauseToggle} />

      <GameControls onAction={(dir) => canvasRef.current?.dispatchAction(dir)} />

      <GameOverlay
        phase={phase}
        score={score}
        highScore={highScore}
        onStart={handleStart}
        onRestart={handleRestart}
        onResume={handlePauseToggle}
      />
    </div>
  );
}
