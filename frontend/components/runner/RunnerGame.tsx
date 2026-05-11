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

const ACT_TARGETS = {
  1: 2000,
  2: 5000,
  3: 10000,
  4: 18000,
  5: 30000,
};

const ACT_NAMES = {
  1: "THE SPRAWL",
  2: "NEON QUARTER",
  3: "THE CHAIN BRIDGE",
  4: "DEAD NODE",
  5: "GENESIS BLOCK",
};

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
  const scoreRef = useRef(0);
  const [score, setScore] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerLane, setPlayerLane] = useState<0 | 1 | 2>(1);
  const [isJumping, setIsJumping] = useState(false);
  const [cityId, setCityId] = useState(0);
  const [characterTint, setCharacterTint] = useState<string | undefined>(undefined);
  const [isNewPersonalBest, setIsNewPersonalBest] = useState(false);
  const [nearMiss, setNearMiss] = useState(false);
  const [showActTitle, setShowActTitle] = useState(true);
  const [enforcerDistance, setEnforcerDistance] = useState(999);
  const [vignetteIntensity, setVignetteIntensity] = useState(0);
  const [showCatchWarning, setShowCatchWarning] = useState(false);
  const [caughtByEnforcer, setCaughtByEnforcer] = useState(false);
  const [isBoostActive, setIsBoostActive] = useState(false);
  const [boostOnCooldown, setBoostOnCooldown] = useState(false);
  const [showGhostActivated, setShowGhostActivated] = useState(false);
  const [currentAct, setCurrentAct] = useState(1);
  const [showActComplete, setShowActComplete] = useState(false);
  const [completedAct, setCompletedAct] = useState(0);
  const [enforcerBlocked, setEnforcerBlocked] = useState(false);
  const [nitroCount, setNitroCount] = useState(0);
  const [showCoinCollect, setShowCoinCollect] = useState(false);
  const [showNitroCollect, setShowNitroCollect] = useState(false);
  const boostStateRef = useRef({ isBoosting: false, onCooldown: false });
  const lastTapRef = useRef(0);
  const BOOST_DURATION = 2000;
  const BOOST_COOLDOWN = 8000;
  const gameSurfaceRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<GameCanvasHandle>(null);
  const coinSoundRef = useRef<HTMLAudioElement | null>(null);
  const themeSoundRef = useRef<HTMLAudioElement | null>(null);
  const nearMissTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const actTitleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Detect near misses from obstacles
  useEffect(() => {
    if (!gameState || phase !== "playing") {
      return;
    }

    if (gameState.obstacles && gameState.obstacles.length > 0) {
      const playerZ = gameState.distance / 140;
      const hasNearMiss = gameState.obstacles.some((obs) => {
        const obsZ = -obs.y / 140;
        const distance = Math.abs(playerZ - obsZ);
        return distance < 1.5 && distance > 0.1;
      });

      if (hasNearMiss && !nearMiss) {
        setNearMiss(true);
        if (nearMissTimeoutRef.current) {
          clearTimeout(nearMissTimeoutRef.current);
        }
        nearMissTimeoutRef.current = setTimeout(() => {
          setNearMiss(false);
        }, 300);
      }
    }
  }, [gameState, phase, nearMiss]);

  // Hide ACT title after 3 seconds
  useEffect(() => {
    if (phase === "playing" && showActTitle) {
      if (actTitleTimeoutRef.current) {
        clearTimeout(actTitleTimeoutRef.current);
      }
      actTitleTimeoutRef.current = setTimeout(() => {
        setShowActTitle(false);
      }, 3000);
    }
    return () => {
      if (actTitleTimeoutRef.current) {
        clearTimeout(actTitleTimeoutRef.current);
      }
    };
  }, [phase, showActTitle]);

  // Reset ACT title on game start
  useEffect(() => {
    if (phase === "playing") {
      setShowActTitle(true);
      setVignetteIntensity(0);
      setShowCatchWarning(false);
      setEnforcerDistance(999);
      setCaughtByEnforcer(false);
    }
  }, [phase]);

  // Update vignette and warning based on enforcer distance
  useEffect(() => {
    if (enforcerDistance < 20) {
      const intensity = (20 - enforcerDistance) / 20;
      setVignetteIntensity(intensity);
    } else {
      setVignetteIntensity(0);
    }

    if (enforcerDistance < 5) {
      setShowCatchWarning(true);
    } else {
      setShowCatchWarning(false);
    }
  }, [enforcerDistance]);

  const handleEnforcerCaught = useCallback(() => {
    canvasRef.current?.pause();
    setCaughtByEnforcer(true);
    setPhase("dead");
  }, []);

  const handleEnforcerDistanceChange = useCallback((distance: number) => {
    setEnforcerDistance(distance);
  }, []);

  const activateBoost = useCallback(() => {
    if (boostStateRef.current.isBoosting || boostStateRef.current.onCooldown) {
      return;
    }

    boostStateRef.current.isBoosting = true;
    setIsBoostActive(true);
    setShowGhostActivated(true);

    // Hide activation message after 0.5s
    setTimeout(() => {
      setShowGhostActivated(false);
    }, 500);

    // End boost after duration
    setTimeout(() => {
      boostStateRef.current.isBoosting = false;
      setIsBoostActive(false);
      boostStateRef.current.onCooldown = true;
      setBoostOnCooldown(true);

      // End cooldown
      setTimeout(() => {
        boostStateRef.current.onCooldown = false;
        setBoostOnCooldown(false);
      }, BOOST_COOLDOWN);
    }, BOOST_DURATION);
  }, []);

  const handleCoinCollected = useCallback(() => {
    setCoinsCollected((prev) => prev + 1);
    handleCoinCollect();
    setShowCoinCollect(true);
    setTimeout(() => {
      setShowCoinCollect(false);
    }, 400);
  }, []);

  const handleNitroCollected = useCallback(() => {
    setNitroCount((prev) => prev + 1);

    // Activate boost immediately if not already boosting
    if (!boostStateRef.current.isBoosting && !boostStateRef.current.onCooldown) {
      activateBoost();
    }

    setShowNitroCollect(true);
    setTimeout(() => {
      setShowNitroCollect(false);
    }, 1500);
  }, [activateBoost]);

  // Expose pickup functions to window for 3D scene access
  useEffect(() => {
    (window as any).__addCoin = () => {
      setCoinsCollected((prev) => prev + 1);
      if (coinSoundRef.current) {
        coinSoundRef.current.currentTime = 0;
        coinSoundRef.current.play().catch(() => {});
      }
      setShowCoinCollect(true);
      setTimeout(() => {
        setShowCoinCollect(false);
      }, 400);
    };

    (window as any).__addNitro = () => {
      setNitroCount((prev) => prev + 1);
      setShowNitroCollect(true);
      setTimeout(() => {
        setShowNitroCollect(false);
      }, 1500);
    };

    (window as any).__activateBoost = () => {
      if (!boostStateRef.current.isBoosting && !boostStateRef.current.onCooldown) {
        activateBoost();
      }
    };

    return () => {
      delete (window as any).__addCoin;
      delete (window as any).__addNitro;
      delete (window as any).__activateBoost;
    };
  }, [activateBoost]);

  // Setup keyboard and touch listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && phase === "playing") {
        e.preventDefault();
        activateBoost();
      }
    };

    const handleTouchEnd = () => {
      const now = Date.now();
      if (now - lastTapRef.current < 300 && phase === "playing") {
        activateBoost();
      }
      lastTapRef.current = now;
    };

    if (phase === "playing") {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [phase, activateBoost]);

  const handleStart = useCallback(() => {
    canvasRef.current?.reset();
    setScore(0);
    setCoinsCollected(0);
    setNitroCount(0);
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

  const handleGameOver = useCallback(() => {
    const currentScore = scoreRef.current;
    const beat = currentScore > highScore;
    if (beat) {
      setHighScore(currentScore);
      setIsNewPersonalBest(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("runner_highscore", currentScore.toString());
      }
    }
    // Freeze the scene and show game over modal
    canvasRef.current?.pause();
    setPhase("dead");
    console.log("[HANDLE_GAME_OVER] Phase set to dead, showing modal");
  }, [highScore]);

  const handleRestart = () => {
    handleStart();
  };

  const handleScoreChange = (newScore: number) => {
    scoreRef.current = newScore;
    setScore(newScore);

    // Check for act completion
    const target = ACT_TARGETS[currentAct as keyof typeof ACT_TARGETS];
    if (target && newScore >= target && !showActComplete) {
      triggerActComplete(currentAct);
    }
  };

  const triggerActComplete = (act: number) => {
    canvasRef.current?.pause();
    setShowActComplete(true);
    setCompletedAct(act);

    // If act 5, game is won
    if (act === 5) {
      // Trigger full game win (for now, just show complete)
      return;
    }

    // Auto-advance to next act after 4 seconds
    setTimeout(() => {
      setCurrentAct(act + 1);
      canvasRef.current?.resume();
      setShowActComplete(false);
      setShowActTitle(true);
      setTimeout(() => {
        setShowActTitle(false);
      }, 3000);
    }, 4000);
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
    // Keep phase as "playing" always
    if (newPhase !== "playing") {
      return;
    }
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
    canvasRef.current?.dispatchAction(dir);
  }, []);

  useSwipeGesture(
    gameSurfaceRef,
    dispatchRunnerAction,
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
          onSlideChange={() => {}}
          isBoostActive={isBoostActive}
        />
      </div>

      {/* 3D rendering */}
      {gameState && phase !== "idle" && (
        <ErrorBoundary>
          <Game3DScene
            catPosition={Math.max(0, gameState.distance / 140)}
            playerLane={playerLane}
            jumping={isJumping}
            cityId={cityId}
            characterTint={characterTint}
            currentSpeed={speedKmh}
            maxSpeed={240}
            gamePhase={phase}
            obstacles={gameState.obstacles}
            isBoostActive={isBoostActive}
            onEnforcerDistanceChange={handleEnforcerDistanceChange}
            onEnforcerCaught={handleEnforcerCaught}
            onEnforcerBlocked={(blocked) => {
              if (blocked) {
                setEnforcerBlocked(true);
                setTimeout(() => setEnforcerBlocked(false), 1000);
              }
            }}
            onCoinCollect={handleCoinCollected}
            onNitroCollect={handleNitroCollected}
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
        isBoostActive={isBoostActive}
        isBoostOnCooldown={boostOnCooldown}
        onPauseToggle={handlePauseToggle}
        onMuteToggle={handleMuteToggle}
      />

      <GameOverlay
        phase={phase}
        score={score}
        highScore={highScore}
        distance={gameState?.distance || 0}
        coins={coinsCollected}
        isNewPersonalBest={isNewPersonalBest}
        caughtByEnforcer={caughtByEnforcer}
        onStart={handleStart}
        onRestart={handleRestart}
        onResume={handlePauseToggle}
      />

      {/* ACT Title Overlay */}
      {showActTitle && phase === "playing" && (
        <div style={{
          position: 'fixed',
          inset: 0,
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          animation: 'actFadeInOut 3s ease forwards',
          pointerEvents: 'none',
          zIndex: 20,
        }}>
          <style>{`
            @keyframes actFadeInOut {
              0%   { opacity: 0; transform: translateX(-50%) translateY(10px) }
              15%  { opacity: 1; transform: translateX(-50%) translateY(0) }
              75%  { opacity: 1 }
              100% { opacity: 0 }
            }
          `}</style>
          <div style={{
            color: 'rgba(255,34,68,0.7)',
            fontSize: '12px',
            letterSpacing: '6px',
            fontFamily: 'Bebas Neue',
            fontWeight: 'bold',
          }}>ACT {currentAct}</div>
          <div style={{
            color: '#ffffff',
            fontSize: '36px',
            letterSpacing: '4px',
            fontFamily: 'Bebas Neue',
            fontWeight: 'black',
          }}>{ACT_NAMES[currentAct as keyof typeof ACT_NAMES]}</div>
          <div style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: '13px',
            letterSpacing: '2px',
            fontFamily: 'monospace',
          }}>Celo City Underground // 2047</div>
        </div>
      )}

      {/* Near Miss Red Flash */}
      {nearMiss && (
        <div style={{
          position: 'fixed',
          inset: 0,
          border: '4px solid #ff2244',
          boxShadow: 'inset 0 0 40px rgba(255,34,68,0.4)',
          pointerEvents: 'none',
          animation: 'flashRed 0.3s ease forwards',
          zIndex: 25,
        }}>
          <style>{`
            @keyframes flashRed {
              0%   { opacity: 1 }
              100% { opacity: 0 }
            }
          `}</style>
        </div>
      )}

      {/* Enforcer Threat Meter */}
      {phase === "playing" && enforcerDistance < 999 && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          zIndex: 30,
        }}>
          <div style={{
            color: '#ff2244',
            fontSize: '10px',
            letterSpacing: '3px',
            fontFamily: 'Bebas Neue',
            fontWeight: 'bold',
          }}>⚠ NULLBLOCK ENFORCER</div>
          <div style={{
            width: '200px',
            height: '4px',
            background: 'rgba(255,34,68,0.2)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${Math.max(0, Math.min(100, (1 - enforcerDistance / 60) * 100))}%`,
              background: enforcerDistance < 15 ? '#ff0022' : '#ff6644',
              transition: 'width 0.1s, background 0.3s',
            }} />
          </div>
        </div>
      )}

      {/* Red Vignette Overlay */}
      {vignetteIntensity > 0 && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: `radial-gradient(ellipse at center, transparent 40%, rgba(255,0,34,${vignetteIntensity * 0.6}) 100%)`,
          pointerEvents: 'none',
          transition: 'background 0.3s',
          zIndex: 25,
        }} />
      )}

      {/* Enforcer Closing In Warning */}
      {showCatchWarning && (
        <div style={{
          position: 'fixed',
          top: '35%',
          width: '100%',
          textAlign: 'center',
          color: '#ff2244',
          fontSize: '24px',
          fontFamily: 'Bebas Neue',
          letterSpacing: '6px',
          animation: 'glitch 0.3s infinite',
          zIndex: 30,
        }}>
          <style>{`
            @keyframes glitch {
              0%   { transform: translateX(0) }
              20%  { transform: translateX(-3px) }
              40%  { transform: translateX(3px) }
              60%  { transform: translateX(-2px) }
              80%  { transform: translateX(2px) }
              100% { transform: translateX(0) }
            }
          `}</style>
          NULLBLOCK IS CLOSING IN
        </div>
      )}

      {/* Ghost Mode Activation Flash */}
      {showGhostActivated && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#00E5CC',
          fontSize: '32px',
          fontFamily: 'Bebas Neue',
          letterSpacing: '4px',
          fontWeight: 'bold',
          animation: 'ghostActivate 0.5s ease forwards',
          zIndex: 35,
          pointerEvents: 'none',
        }}>
          <style>{`
            @keyframes ghostActivate {
              0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.8) }
              50%  { opacity: 1; transform: translate(-50%, -50%) scale(1.1) }
              100% { opacity: 0; transform: translate(-50%, -50%) scale(1) }
            }
          `}</style>
          👻 GHOST MODE ACTIVATED
        </div>
      )}

      {/* Act Progress Bar */}
      {phase === "playing" && (
        <div style={{
          position: 'absolute',
          top: '48px',
          left: 0,
          right: 0,
          height: '2px',
          background: 'rgba(255,255,255,0.08)',
          zIndex: 20,
        }}>
          <div style={{
            height: '100%',
            width: `${Math.min(100, (score / ACT_TARGETS[currentAct as keyof typeof ACT_TARGETS]) * 100)}%`,
            background: 'linear-gradient(90deg, #00E5CC, #7B2FFF)',
            transition: 'width 0.3s',
          }} />
        </div>
      )}

      {/* Act Complete Overlay */}
      {showActComplete && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5,0,20,0.92)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          animation: 'fadeIn 0.5s ease forwards',
          zIndex: 100,
        }}>
          <style>{`
            @keyframes fadeIn {
              0%   { opacity: 0 }
              100% { opacity: 1 }
            }
          `}</style>

          <div style={{
            color: '#00E5CC',
            fontSize: '13px',
            letterSpacing: '6px',
            fontFamily: 'Bebas Neue',
            fontWeight: 'bold',
          }}>SCORE POSTED TO CHAIN</div>

          <div style={{
            color: '#ffffff',
            fontSize: '64px',
            fontFamily: 'Bebas Neue',
            fontWeight: 'black',
            textShadow: '0 0 30px rgba(0,229,204,0.6)',
          }}>ACT {completedAct} COMPLETE</div>

          <div style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '22px',
            fontFamily: 'Bebas Neue',
            letterSpacing: '3px',
          }}>{ACT_NAMES[completedAct as keyof typeof ACT_NAMES]}</div>

          <div style={{
            background: 'rgba(0,229,204,0.08)',
            border: '1px solid rgba(0,229,204,0.3)',
            borderRadius: '8px',
            padding: '20px 40px',
            textAlign: 'center',
            marginTop: '8px',
          }}>
            <div style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '11px',
              letterSpacing: '3px',
              fontFamily: 'Bebas Neue',
            }}>NULLBLOCK TRIED TO STOP YOU</div>
            <div style={{
              color: '#00E5CC',
              fontSize: '48px',
              fontFamily: 'Bebas Neue',
              fontWeight: 'black',
            }}>{score}</div>
            <div style={{
              color: '#F5C518',
              fontSize: '16px',
              fontFamily: 'Bebas Neue',
              letterSpacing: '1px',
            }}>+{ACT_TARGETS[completedAct as keyof typeof ACT_TARGETS]} $DASH EARNED</div>
          </div>

          <div style={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: '12px',
            letterSpacing: '2px',
            fontFamily: 'monospace',
            marginTop: '8px',
          }}>
            {completedAct < 5
              ? `ENTERING ${ACT_NAMES[(completedAct + 1) as keyof typeof ACT_NAMES]} IN 4 SECONDS...`
              : 'FINAL ACT COMPLETE — YOU WIN'}
          </div>
        </div>
      )}

      {/* Enforcer Blocked Flash */}
      {enforcerBlocked && (
        <div style={{
          position: 'fixed',
          top: '15%',
          width: '100%',
          textAlign: 'center',
          color: '#00E5CC',
          fontSize: '20px',
          fontFamily: 'Bebas Neue',
          letterSpacing: '4px',
          animation: 'fadeOut 1s ease forwards',
          zIndex: 30,
        }}>
          <style>{`
            @keyframes fadeOut {
              0%   { opacity: 1 }
              100% { opacity: 0 }
            }
          `}</style>
          ⚡ ENFORCER BLOCKED BY TRAFFIC
        </div>
      )}

      {/* Nitro Count */}
      {phase === "playing" && (
        <div style={{
          position: 'absolute',
          top: '48px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#00E5CC',
          fontFamily: 'Bebas Neue',
          fontSize: '14px',
          letterSpacing: '2px',
        }}>
          👻 {nitroCount} NITRO
        </div>
      )}

      {/* Coin Collect Flash */}
      {showCoinCollect && (
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#F5C518',
          fontSize: '28px',
          fontFamily: 'Bebas Neue',
          letterSpacing: '4px',
          animation: 'floatUp 0.4s ease forwards',
          pointerEvents: 'none',
          zIndex: 50,
        }}>
          <style>{`
            @keyframes floatUp {
              0%   { opacity: 1; transform: translateX(-50%) translateY(0) }
              100% { opacity: 0; transform: translateX(-50%) translateY(-30px) }
            }
          `}</style>
          +1 $DASH
        </div>
      )}

      {/* Nitro Collect Flash */}
      {showNitroCollect && (
        <div style={{
          position: 'fixed',
          top: '30%',
          width: '100%',
          textAlign: 'center',
          pointerEvents: 'none',
          zIndex: 50,
        }}>
          <style>{`
            @keyframes glitch {
              0%   { transform: translateX(0) }
              20%  { transform: translateX(-3px) }
              40%  { transform: translateX(3px) }
              60%  { transform: translateX(-2px) }
              80%  { transform: translateX(2px) }
              100% { transform: translateX(0) }
            }
            @keyframes nitroFadeOut {
              0% { opacity: 1 }
              100% { opacity: 0 }
            }
          `}</style>
          <div style={{
            color: '#00E5CC',
            fontSize: '36px',
            fontFamily: 'Bebas Neue',
            letterSpacing: '6px',
            textShadow: '0 0 20px rgba(0,229,204,0.8)',
            animation: 'glitch 0.3s ease, nitroFadeOut 1.2s ease forwards',
          }}>
            👻 GHOST MODE ACTIVATED
          </div>
          <div style={{
            color: 'rgba(0,229,204,0.6)',
            fontSize: '14px',
            letterSpacing: '4px',
            marginTop: '8px',
            animation: 'nitroFadeOut 1.2s ease forwards',
          }}>
            NULLBLOCK CANNOT SEE YOU
          </div>
        </div>
      )}
    </div>
  );
}
