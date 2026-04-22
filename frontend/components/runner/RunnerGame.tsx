"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { GameCanvas, type GameCanvasHandle } from "./GameCanvas";
import { GameHUD } from "./GameHUD";
import { GameOverlay } from "./GameOverlay";
import { ErrorBoundary } from "./ErrorBoundary";
import { RacingRunnerGame } from "./RacingRunnerGame";
import type { GamePhase, GameState } from "@/types/runner";
import { useSwipeGesture, type SwipeDirection } from "@/hooks/useSwipeGesture";
import { assertValidCityId, characterAccent, loadLocalProfile } from "@/lib/playerProfile";
import { arcadeScrollToKmhGear } from "@/lib/racing/arcadeScrollToKmhGear";

const Game3DScene = dynamic(
  () => import("./Game3DScene").then((mod) => mod.Game3DScene),
  { ssr: false }
);

export type RunnerGameMode = "endless" | "racing";

export function RunnerGame({
  gameMode = "endless",
  autoStart = false,
}: {
  gameMode?: RunnerGameMode;
  /** When true (from `/play?start=1`), skip the start overlay and run immediately. */
  autoStart?: boolean;
}) {
  if (gameMode === "racing") {
    return <RacingRunnerGame />;
  }

  const [phase, setPhase] = useState<GamePhase>("idle");
  const [score, setScore] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerLane, setPlayerLane] = useState<0 | 1 | 2>(1);
  const [isJumping, setIsJumping] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [cityId, setCityId] = useState(0);
  const [characterTint, setCharacterTint] = useState<string | undefined>(undefined);
  const [isNewPersonalBest, setIsNewPersonalBest] = useState(false);
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
      const profile = loadLocalProfile();
      setCityId(assertValidCityId(profile.selectedCityId));
      setCharacterTint(characterAccent(profile.selectedCharacterId));
    }
  }, []);

  useEffect(() => {
    const onFocus = () => {
      const profile = loadLocalProfile();
      setCityId(assertValidCityId(profile.selectedCityId));
      setCharacterTint(characterAccent(profile.selectedCharacterId));
    };
    if (typeof window !== "undefined") {
      window.addEventListener("focus", onFocus);
      return () => window.removeEventListener("focus", onFocus);
    }
    return undefined;
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

  const handleStart = useCallback(() => {
    setIsNewPersonalBest(false);
    canvasRef.current?.reset();
    setScore(0);
    setCoinsCollected(0);
    canvasRef.current?.start();
    setPhase("playing");
  }, []);

  const autostartDoneRef = useRef(false);
  useEffect(() => {
    if (!autoStart) {
      return undefined;
    }
    if (autostartDoneRef.current) {
      return undefined;
    }
    autostartDoneRef.current = true;
    const id = window.setTimeout(() => {
      handleStart();
      if (typeof window === "undefined") {
        return;
      }
      const url = new URL(window.location.href);
      if (url.searchParams.has("start")) {
        url.searchParams.delete("start");
        const qs = url.searchParams.toString();
        const next = url.pathname + (qs ? `?${qs}` : "");
        window.history.replaceState(null, "", next);
      }
    }, 50);
    return () => window.clearTimeout(id);
  }, [autoStart, handleStart]);

  const handleGameOver = () => {
    const beat = score > highScore;
    setIsNewPersonalBest(beat);
    setPhase("dead");
    if (beat) {
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

  const { speedKmh, gear } = useMemo(() => {
    if (!gameState || (phase !== "playing" && phase !== "paused")) {
      return { speedKmh: 35, gear: 1 };
    }
    const now = typeof performance !== "undefined" ? performance.now() : 0;
    const braking =
      typeof gameState.player.brakeUntil === "number" && now < gameState.player.brakeUntil;
    const nitroBoost =
      typeof gameState.nitroBoostUntil === "number" && now < gameState.nitroBoostUntil;
    const scroll = gameState.speed * (braking ? 0.36 : 1) * (nitroBoost ? 1.38 : 1);
    return arcadeScrollToKmhGear(scroll);
  }, [gameState, phase]);

  const dispatchRunnerAction = useCallback((dir: SwipeDirection) => {
    const mappedDir = dir === "left" ? "right" : dir === "right" ? "left" : dir;
    canvasRef.current?.dispatchAction(mappedDir);
  }, []);

  useSwipeGesture(
    gameSurfaceRef,
    (dir) => {
      if (phase === "playing") {
        dispatchRunnerAction(dir);
      }
    },
    18
  );

  return (
    <div
      ref={gameSurfaceRef}
      className="runner-vignette runner-scanlines relative h-screen w-screen touch-none overflow-hidden bg-void"
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
            cityId={cityId}
            characterTint={characterTint}
          />
        </ErrorBoundary>
      )}

      <GameHUD
        score={score}
        coinsCollected={coinsCollected}
        phase={phase}
        speedKmh={speedKmh}
        gear={gear}
        isMuted={isMuted}
        onPauseToggle={handlePauseToggle}
        onMuteToggle={handleMuteToggle}
      />

      <GameOverlay
        phase={phase}
        score={score}
        highScore={highScore}
        isNewPersonalBest={isNewPersonalBest}
        onStart={handleStart}
        onRestart={handleRestart}
        onResume={handlePauseToggle}
      />
    </div>
  );
}
