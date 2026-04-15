"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { GameCanvas, type GameCanvasHandle } from "./GameCanvas";
import { GameHUD } from "./GameHUD";
import { GameOverlay } from "./GameOverlay";
import { ErrorBoundary } from "./ErrorBoundary";
import type { GamePhase, GameState } from "@/types/runner";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";

const Game3DScene = dynamic(
  () => import("./Game3DScene").then((mod) => mod.Game3DScene),
  { ssr: false }
);

export function RunnerGame() {
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [score, setScore] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerLane, setPlayerLane] = useState<0 | 1 | 2>(1);
  const [isJumping, setIsJumping] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const gameSurfaceRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<GameCanvasHandle>(null);
  const coinSoundRef = useRef<HTMLAudioElement | null>(null);
  const themeSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("runner_highscore");
      if (saved) {
        setHighScore(parseInt(saved, 10));
      }
      const savedMute = localStorage.getItem("runner_muted");
      if (savedMute === "true") {
        setIsMuted(true);
      }
    }
  }, []);

  useEffect(() => {
    if (themeSoundRef.current) {
      if (isMuted) {
        themeSoundRef.current.pause();
      } else if (phase === "playing") {
        themeSoundRef.current.play().catch(() => {});
      }
    }
  }, [isMuted, phase]);

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

  const handleCoinCollect = () => {
    if (coinSoundRef.current) {
      coinSoundRef.current.currentTime = 0;
      coinSoundRef.current.play().catch(() => {
        // Silently ignore play errors (common on mobile with autoplay restrictions)
      });
    }
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

  const handleMuteToggle = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (typeof window !== "undefined") {
      localStorage.setItem("runner_muted", newMuted.toString());
    }
  };

  useSwipeGesture(gameSurfaceRef, (dir) => {
    if (phase === "playing") {
      const mappedDir =
        dir === "left" ? "right" : dir === "right" ? "left" : dir;
      canvasRef.current?.dispatchAction(mappedDir);
    }
  });

  return (
    <div
      ref={gameSurfaceRef}
      className="relative h-screen w-screen touch-none overflow-hidden bg-[#010F10]"
      style={{ maxHeight: "100dvh" }}
      tabIndex={0}
    >
      <audio ref={coinSoundRef} src="/coins.wav" preload="auto" />
      <audio ref={themeSoundRef} src="/theme.mp3" preload="auto" loop onLoadedMetadata={(e) => {
        (e.target as HTMLAudioElement).volume = 0.5;
      }} />

      {/* Game logic engine - positioned off-screen but can receive input */}
      <div style={{ position: "fixed", left: "-9999px", top: "-9999px" }}>
        <GameCanvas
          ref={canvasRef}
          onScoreChange={handleScoreChange}
          onCoinsChange={handleCoinsChange}
          onCoinCollect={handleCoinCollect}
          onGameOver={handleGameOver}
          onPhaseChange={handlePhaseChange}
          onGameStateUpdate={setGameState}
          onPlayerLaneChange={setPlayerLane}
          onJumpChange={setIsJumping}
          onSlideChange={setIsSliding}
        />
      </div>

      {/* 3D rendering */}
      {gameState && phase !== "idle" && (
        <ErrorBoundary>
          <Game3DScene
            gameState={gameState}
            catPosition={Math.max(0, gameState.distance / 140)}
            playerLane={playerLane}
            jumping={isJumping}
            sliding={isSliding}
          />
        </ErrorBoundary>
      )}

      <GameHUD score={score} coinsCollected={coinsCollected} phase={phase} isMuted={isMuted} onPauseToggle={handlePauseToggle} onMuteToggle={handleMuteToggle} />

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
