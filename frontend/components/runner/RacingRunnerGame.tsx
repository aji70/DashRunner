"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { RacingGameCanvas, type RacingGameCanvasHandle } from "./RacingGameCanvas";
import { RaceHUD } from "./RaceHUD";
import { RaceCountdownOverlay } from "./RaceCountdownOverlay";
import { RaceResultsOverlay } from "./RaceResultsOverlay";
import { ErrorBoundary } from "./ErrorBoundary";
import type { GameState } from "@/types/runner";
import type { RaceResult, RacingHudSnapshot } from "@/types/racing";
import { buildRaceSpawnSchedule } from "@/lib/racing/buildRaceSpawnSchedule";
import { useSwipeGesture, type SwipeDirection } from "@/hooks/useSwipeGesture";
import { assertValidCityId, characterAccent, loadLocalProfile } from "@/lib/playerProfile";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { motion } from "framer-motion";

const Game3DScene = dynamic(
  () => import("./Game3DScene").then((mod) => mod.Game3DScene),
  { ssr: false }
);

const LAP_LENGTH = 2800;
const LAPS = 3;

type RaceUi = "idle" | "countdown" | "running" | "paused" | "dead" | "results";

export function RacingRunnerGame() {
  const router = useRouter();
  const [cityId, setCityId] = useState(0);
  const [characterTint, setCharacterTint] = useState<string | undefined>(undefined);
  const [raceUi, setRaceUi] = useState<RaceUi>("idle");
  const [countdownStep, setCountdownStep] = useState(-1);
  const [hudSnap, setHudSnap] = useState<RacingHudSnapshot | null>(null);
  const [coins, setCoins] = useState(0);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<RaceResult | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerLane, setPlayerLane] = useState<0 | 1 | 2>(1);
  const [isJumping, setIsJumping] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const canvasRef = useRef<RacingGameCanvasHandle>(null);
  const gameSurfaceRef = useRef<HTMLDivElement>(null);
  const coinSoundRef = useRef<HTMLAudioElement | null>(null);
  const themeSoundRef = useRef<HTMLAudioElement | null>(null);
  const countdownAbortRef = useRef(false);
  const countdownTimersRef = useRef<number[]>([]);
  const countdownGenRef = useRef(0);
  const autoCountdownStartedRef = useRef(false);

  const seed = cityId * 10007 + 4242;
  const finishDistance = LAP_LENGTH * LAPS;
  const spawnEvents = useMemo(() => buildRaceSpawnSchedule(finishDistance, seed), [finishDistance, seed]);

  useEffect(() => {
    if (themeSoundRef.current) {
      if (isMuted) {
        themeSoundRef.current.pause();
      } else if (raceUi === "running") {
        themeSoundRef.current.play().catch(() => {});
      }
    }
  }, [isMuted, raceUi]);

  const clearCountdownTimers = useCallback(() => {
    countdownTimersRef.current.forEach((id) => clearTimeout(id));
    countdownTimersRef.current = [];
  }, []);

  const beginCountdown = useCallback(() => {
    clearCountdownTimers();
    const gen = ++countdownGenRef.current;
    setRaceUi("countdown");
    setResult(null);
    countdownAbortRef.current = false;
    const steps = [3, 2, 1, 0] as const;
    let i = 0;
    setCountdownStep(steps[0]!);

    const schedule = (fn: () => void, delay: number) => {
      const id = window.setTimeout(fn, delay) as unknown as number;
      countdownTimersRef.current.push(id);
    };

    const tick = () => {
      if (countdownAbortRef.current || countdownGenRef.current !== gen) return;
      i++;
      if (i < steps.length) {
        setCountdownStep(steps[i]!);
        schedule(tick, 650);
      } else {
        setCountdownStep(-1);
        canvasRef.current?.reset();
        canvasRef.current?.start();
        setRaceUi("running");
        setCoins(0);
        setScore(0);
        setHudSnap(null);
      }
    };
    schedule(tick, 650);
  }, [clearCountdownTimers]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedMute = localStorage.getItem("runner_muted");
    if (savedMute === "true") setIsMuted(true);
    const profile = loadLocalProfile();
    setCityId(assertValidCityId(profile.selectedCityId));
    setCharacterTint(characterAccent(profile.selectedCharacterId));
    if (autoCountdownStartedRef.current) return;
    autoCountdownStartedRef.current = true;
    beginCountdown();
  }, [beginCountdown]);

  const handleRaceFinish = useCallback(
    (r: RaceResult) => {
      setResult(r);
      setRaceUi("results");
      const key = `runner_race_best_${cityId}`;
      const prev = localStorage.getItem(key);
      const prevMs = prev ? parseInt(prev, 10) : Infinity;
      if (r.totalTimeMs < prevMs) {
        localStorage.setItem(key, String(Math.floor(r.totalTimeMs)));
      }
    },
    [cityId]
  );

  const handleGameOver = useCallback(() => {
    setRaceUi("dead");
  }, []);

  const handleRestartRace = () => {
    beginCountdown();
  };

  const handleExitRace = () => {
    countdownAbortRef.current = true;
    countdownGenRef.current++;
    clearCountdownTimers();
    canvasRef.current?.reset();
    setRaceUi("idle");
    setCountdownStep(-1);
    setResult(null);
    setGameState(null);
    router.push("/play?start=1");
  };

  const handlePauseToggle = () => {
    if (raceUi === "running") {
      setRaceUi("paused");
      canvasRef.current?.pause();
    } else if (raceUi === "paused") {
      setRaceUi("running");
      canvasRef.current?.resume();
    }
  };

  const handleMuteToggle = () => {
    const next = !isMuted;
    setIsMuted(next);
    localStorage.setItem("runner_muted", String(next));
  };

  const dispatchRunnerAction = useCallback((dir: SwipeDirection) => {
    const mappedDir = dir === "left" ? "right" : dir === "right" ? "left" : dir;
    canvasRef.current?.dispatchAction(mappedDir);
  }, []);

  useSwipeGesture(
    gameSurfaceRef,
    (dir) => {
      if (raceUi === "running") {
        dispatchRunnerAction(dir);
      }
    },
    18
  );

  const onHudTick = useCallback((snap: RacingHudSnapshot) => {
    setHudSnap(snap);
  }, []);

  const show3D = gameState && (raceUi === "running" || raceUi === "paused");

  return (
    <div
      ref={gameSurfaceRef}
      className="runner-vignette runner-scanlines relative h-screen w-screen touch-none overflow-hidden bg-void"
      style={{ maxHeight: "100dvh" }}
      tabIndex={0}
    >
      <audio ref={coinSoundRef} src="/coins.wav" preload="auto" />
      <audio
        ref={themeSoundRef}
        src="/theme.mp3"
        preload="auto"
        loop
        onLoadedMetadata={(e) => {
          (e.target as HTMLAudioElement).volume = 0.45;
        }}
      />

      <div
        className={raceUi === "idle" ? "fixed inset-0 z-0 opacity-0" : "fixed inset-0 z-0"}
        style={{ left: raceUi === "idle" ? "-9999px" : 0 }}
      >
        <RacingGameCanvas
          key={seed}
          ref={canvasRef}
          finishDistance={finishDistance}
          lapLength={LAP_LENGTH}
          laps={LAPS}
          spawnEvents={spawnEvents}
          onScoreChange={setScore}
          onCoinsChange={setCoins}
          onCoinCollect={() => {
            if (coinSoundRef.current) {
              coinSoundRef.current.currentTime = 0;
              coinSoundRef.current.play().catch(() => {});
            }
          }}
          onGameOver={handleGameOver}
          onRaceFinish={handleRaceFinish}
          onPhaseChange={() => {}}
          onGameStateUpdate={setGameState}
          onPlayerLaneChange={setPlayerLane}
          onJumpChange={setIsJumping}
          onSlideChange={setIsSliding}
          onHudTick={onHudTick}
        />
      </div>

      {show3D && (
        <ErrorBoundary>
          <Game3DScene
            gameState={gameState!}
            catPosition={Math.max(0, gameState!.distance / 140)}
            playerLane={playerLane}
            jumping={isJumping}
            sliding={isSliding}
            cityId={cityId}
            characterTint={characterTint}
          />
        </ErrorBoundary>
      )}

      {(raceUi === "running" || raceUi === "paused") && (
        <RaceHUD
          snap={hudSnap}
          coinsCollected={coins}
          phase={raceUi === "paused" ? "paused" : "playing"}
          isMuted={isMuted}
          onPauseToggle={handlePauseToggle}
          onMuteToggle={handleMuteToggle}
        />
      )}

      {raceUi === "countdown" && countdownStep >= 0 && <RaceCountdownOverlay step={countdownStep} />}

      {result && raceUi === "results" && <RaceResultsOverlay result={result} onRestart={handleRestartRace} />}

      {raceUi === "dead" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-auto absolute inset-0 z-40 flex items-end justify-center bg-black/60 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center sm:pb-0"
        >
          <GlassPanel className="mx-4 max-w-md px-6 py-8 text-center shadow-lift">
            <p className="font-rajdhani text-[11px] font-semibold uppercase tracking-[0.35em] text-rose-300/80">Crashed</p>
            <h2 className="mt-2 font-orbitron text-2xl font-black text-slate-100">DNF</h2>
            <p className="mt-2 font-rajdhani text-sm text-[var(--text-secondary)]">Score this run: {score.toLocaleString()}</p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleRestartRace}
                className="rounded-2xl border border-orange-400/40 bg-orange-500/20 py-3 font-orbitron text-sm font-bold uppercase tracking-[0.12em] text-orange-50"
              >
                Retry race
              </button>
              <button type="button" onClick={handleExitRace} className="font-rajdhani text-xs uppercase text-[var(--text-dim)] hover:text-orange-200">
                Exit to menu
              </button>
            </div>
          </GlassPanel>
        </motion.div>
      )}
    </div>
  );
}
