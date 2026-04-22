"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import { useGameLoop } from "@/hooks/useGameLoop";
import { useSwipeGesture, type SwipeDirection } from "@/hooks/useSwipeGesture";
import type { GameState, Lane, ObstacleType } from "@/types/runner";
import type { RaceResult, RaceSpawnEvent, RacingHudSnapshot } from "@/types/racing";
import { arcadeScrollToKmhGear } from "@/lib/racing/arcadeScrollToKmhGear";
import { drawNitroBottle } from "@/lib/runner/drawNitroBottle";

const BASE_SPEED = 0.3;
const GRAVITY = 0.00145;
const JUMP_VELOCITY = -0.92;
const LERP_FACTOR = 0.18;
const BRAKE_DURATION_MS = 820;
const BRAKE_SCROLL_MUL = 0.36;
const CAR_LANE_HIT_FRAC = 0.24;
const CAR_VERTICAL_INSET = 6;
const MAX_SPEED = 0.72;
const SPEED_SCALE = 0.11;
const PLAYER_WIDTH = 20;
const PLAYER_HEIGHT = 40;
const COIN_RUSH_STREAK_LENGTH = 2;
const NITRO_SCROLL_MUL = 1.38;
const NITRO_BOOST_MS = 2400;
const NITRO_HIT_R = 22;
const MIN_PLAYABLE_SIZE = 48;

const COLOR_BG = "#12100e";
const COLOR_LANE_LINE = "rgba(0,240,255,0.08)";
const COLOR_COIN = "#FFD700";
const COLOR_OBSTACLE = "#1a3a3c";
const COLOR_OBSTACLE_STROKE = "rgba(0,240,255,0.4)";
const COLOR_PLAYER = "#FFFFFF";

export type RacingCanvasPhase = "idle" | "playing" | "dead" | "finished";

export interface RacingGameCanvasProps {
  finishDistance: number;
  lapLength: number;
  laps: number;
  spawnEvents: RaceSpawnEvent[];
  onScoreChange: (score: number) => void;
  onCoinsChange: (coins: number) => void;
  onCoinCollect: () => void;
  onGameOver: () => void;
  onRaceFinish: (result: RaceResult) => void;
  onPhaseChange: (phase: RacingCanvasPhase) => void;
  onGameStateUpdate?: (state: GameState) => void;
  onPlayerLaneChange?: (lane: 0 | 1 | 2) => void;
  onJumpChange?: (jumping: boolean) => void;
  onSlideChange?: (sliding: boolean) => void;
  onHudTick?: (snap: RacingHudSnapshot) => void;
}

export interface RacingGameCanvasHandle {
  dispatchAction: (dir: SwipeDirection) => void;
  reset: () => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
}

const RacingGameCanvas = forwardRef<RacingGameCanvasHandle, RacingGameCanvasProps>(
  (
    {
      finishDistance,
      lapLength,
      laps,
      spawnEvents,
      onScoreChange,
      onCoinsChange,
      onCoinCollect,
      onGameOver,
      onRaceFinish,
      onPhaseChange,
      onGameStateUpdate,
      onPlayerLaneChange,
      onJumpChange,
      onSlideChange,
      onHudTick,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameStateRef = useRef<GameState>({
      phase: "idle",
      score: 0,
      coinsCollected: 0,
      speed: BASE_SPEED,
      distance: 0,
      player: {
        lane: 1,
        state: "running",
        y: 0,
        vy: 0,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
      },
      obstacles: [],
      coins: [],
      nitros: [],
      spawnTimer: 999999,
      frameId: 0,
    });

    const dimRef = useRef({ width: 0, height: 0, dpr: 1 });
    const currentLaneXRef = useRef(0);
    const lastScoreSyncRef = useRef(0);
    const [gameLoopEnabled, setGameLoopEnabled] = useState(false);
    const spawnCursorRef = useRef(0);
    const raceFinishedRef = useRef(false);
    const lapTimesRef = useRef<number[]>([]);
    const lapStartMsRef = useRef(0);
    const raceStartMsRef = useRef(0);
    const bestLapRef = useRef<number | null>(null);
    const prevDistanceRef = useRef(0);

    const getLaneX = (lane: Lane, width: number): number => {
      return [width / 6, width / 2, (5 * width) / 6][lane];
    };

    const spawnCoin = useCallback((lane: Lane, y: number) => {
      const gameState = gameStateRef.current;
      gameState.coins.push({
        id: gameState.frameId++,
        lane,
        y,
        radius: 8,
        collected: false,
      });
    }, []);

    const spawnCoinBurstPattern = useCallback(
      (baseLane: Lane, pattern: "line" | "zigzag" | "splash") => {
        const forwardGap = 22;
        const lateralOffset = 22;
        if (pattern === "line") {
          for (let i = 0; i < COIN_RUSH_STREAK_LENGTH; i++) {
            spawnCoin(baseLane, -90 - i * forwardGap);
          }
          return;
        }
        if (pattern === "zigzag") {
          for (let i = 0; i < COIN_RUSH_STREAK_LENGTH; i++) {
            const lane = Math.max(0, Math.min(2, baseLane + (i % 2 === 0 ? 0 : baseLane === 2 ? -1 : 1))) as Lane;
            spawnCoin(lane, -90 - i * forwardGap);
          }
          return;
        }
        spawnCoin(0, -90);
        spawnCoin(1, -90 - lateralOffset * 0.3);
        spawnCoin(2, -90);
      },
      [spawnCoin]
    );

    const spawnNitro = useCallback((lane: Lane, y: number) => {
      const gameState = gameStateRef.current;
      gameState.nitros.push({
        id: gameState.frameId++,
        lane,
        y,
        collected: false,
      });
    }, []);

    const spawnObstacle = useCallback((lane: Lane) => {
      const gameState = gameStateRef.current;
      const roll = Math.random();
      let type: ObstacleType;
      let height: number;
      if (roll < 0.72) {
        type = "car";
        height = 40;
      } else if (roll < 0.88) {
        type = "wall";
        height = 60;
      } else {
        type = "barrier";
        height = 20;
      }
      gameState.obstacles.push({
        id: gameState.frameId++,
        lane,
        y: -130,
        type,
        width: 40,
        height,
      });
    }, []);

    const applySpawnEvent = useCallback(
      (ev: RaceSpawnEvent) => {
        if (ev.kind === "obstacle") {
          spawnObstacle(ev.lane);
          return;
        }
        if (ev.kind === "coinBurst") {
          spawnCoinBurstPattern(ev.baseLane, ev.pattern);
          return;
        }
        if (!gameStateRef.current.nitros.length) {
          spawnNitro(ev.lane, -95);
        }
      },
      [spawnObstacle, spawnCoinBurstPattern, spawnNitro]
    );

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const updateCanvasSize = () => {
        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = Math.min(window.innerHeight, window.innerHeight);
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.scale(dpr, dpr);
        dimRef.current = { width, height, dpr };
        const gameState = gameStateRef.current;
        gameState.player.y = height * 0.75;
        currentLaneXRef.current = getLaneX(gameState.player.lane, width);
      };

      updateCanvasSize();
      window.addEventListener("resize", updateCanvasSize);
      window.addEventListener("orientationchange", updateCanvasSize);
      return () => {
        window.removeEventListener("resize", updateCanvasSize);
        window.removeEventListener("orientationchange", updateCanvasSize);
      };
    }, []);

    const drawParallaxBackground = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      distance: number
    ) => {
      ctx.fillStyle = "#0a0a1a";
      const buildingSpacing = 300;
      const buildingYOffset = (distance * 0.1) % buildingSpacing;
      for (let i = -2; i < height / buildingSpacing + 3; i++) {
        const buildingY = i * buildingSpacing - buildingYOffset;
        if (buildingY > height) continue;
        for (let col = 0; col < 4; col++) {
          const buildingX = (col * width) / 3;
          const buildingHeight = 100 + ((i * col * 13) % 60);
          ctx.fillRect(buildingX, buildingY, width / 3, buildingHeight);
          ctx.fillStyle = "#FFB347";
          for (let row = 0; row < buildingHeight / 20; row++) {
            for (let wcol = 0; wcol < 4; wcol++) {
              ctx.fillRect(buildingX + wcol * (width / 12) + 5, buildingY + row * 20 + 5, 8, 8);
            }
          }
          ctx.fillStyle = "#0a0a1a";
        }
      }
      ctx.fillStyle = "#1a3a2a";
      const treeSpacing = 200;
      const treeYOffset = (distance * 0.25) % treeSpacing;
      for (let i = -2; i < height / treeSpacing + 3; i++) {
        const treeY = i * treeSpacing - treeYOffset;
        if (treeY > height) continue;
        for (let col = 0; col < 5; col++) {
          const treeX = (col * width) / 5;
          const treeHeight = 60 + ((i * col * 7) % 30);
          ctx.fillStyle = "#1a3a2a";
          ctx.fillRect(treeX + 8, treeY, 8, treeHeight);
          ctx.fillStyle = "#00FF00";
          ctx.beginPath();
          ctx.arc(treeX + 12, treeY, 20, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.fillStyle = "#004d66";
      const detailSpacing = 150;
      const detailYOffset = (distance * 0.4) % detailSpacing;
      for (let i = -2; i < height / detailSpacing + 3; i++) {
        const detailY = i * detailSpacing - detailYOffset;
        if (detailY > height) continue;
        for (let col = 0; col < 6; col++) {
          const detailX = (col * width) / 6;
          ctx.fillRect(detailX, detailY, 20, 25);
        }
      }
    };

    const renderGame = (
      ctx: CanvasRenderingContext2D,
      gameState: GameState,
      width: number,
      height: number,
      playerX: number,
      progress: number
    ) => {
      ctx.fillStyle = COLOR_BG;
      ctx.fillRect(0, 0, width, height);
      drawParallaxBackground(ctx, width, height, gameState.distance);

      ctx.strokeStyle = COLOR_LANE_LINE;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width / 3, 0);
      ctx.lineTo(width / 3, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo((2 * width) / 3, 0);
      ctx.lineTo((2 * width) / 3, height);
      ctx.stroke();

      const groundY = height * 0.75;
      ctx.strokeStyle = "rgba(0,240,255,0.2)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();

      const barY = 8;
      ctx.fillStyle = "rgba(0,240,255,0.12)";
      ctx.fillRect(12, barY, width - 24, 6);
      ctx.fillStyle = "rgba(34,211,238,0.85)";
      ctx.fillRect(12, barY, Math.max(0, (width - 24) * progress), 6);

      gameState.coins.forEach((coin) => {
        if (coin.collected) return;
        const coinX = getLaneX(coin.lane, width);
        const r = coin.radius;
        const g = ctx.createRadialGradient(coinX - r * 0.35, coin.y - r * 0.35, r * 0.15, coinX, coin.y, r);
        g.addColorStop(0, "#fff9d6");
        g.addColorStop(0.45, COLOR_COIN);
        g.addColorStop(1, "#b8860b");
        ctx.fillStyle = g;
        ctx.shadowColor = COLOR_COIN;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(coinX, coin.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(120, 90, 20, 0.55)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(coinX, coin.y, r * 0.92, 0, Math.PI * 2);
        ctx.stroke();
      });

      gameState.nitros.forEach((nitro) => {
        if (nitro.collected) return;
        drawNitroBottle(ctx, getLaneX(nitro.lane, width), nitro.y);
      });

      gameState.obstacles.forEach((obs) => {
        const obsX = getLaneX(obs.lane, width) - obs.width / 2;
        ctx.fillStyle = COLOR_OBSTACLE;
        ctx.fillRect(obsX, obs.y, obs.width, obs.height);
        ctx.strokeStyle = COLOR_OBSTACLE_STROKE;
        ctx.lineWidth = 2;
        ctx.strokeRect(obsX, obs.y, obs.width, obs.height);
      });

      const playerY = gameState.player.y;
      ctx.fillStyle = COLOR_PLAYER;
      ctx.fillRect(playerX - PLAYER_WIDTH / 2, playerY, PLAYER_WIDTH, PLAYER_HEIGHT);
      ctx.strokeStyle = COLOR_COIN;
      ctx.lineWidth = 1;
      ctx.strokeRect(playerX - PLAYER_WIDTH / 2, playerY, PLAYER_WIDTH, PLAYER_HEIGHT);
    };

    const handleTick = useCallback(
      (dt: number) => {
        const gameState = gameStateRef.current;
        if (gameState.phase !== "playing") return;
        if (raceFinishedRef.current) return;

        const { width, height } = dimRef.current;
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;
        if (width < MIN_PLAYABLE_SIZE || height < MIN_PLAYABLE_SIZE) return;

        const groundY = height * 0.75;
        const now = performance.now();

        gameState.player.vy += GRAVITY * dt;
        gameState.player.y += gameState.player.vy * dt;
        if (gameState.player.y >= groundY) {
          gameState.player.y = groundY;
          gameState.player.vy = 0;
          if (gameState.player.state === "jumping") {
            gameState.player.state = "running";
          }
        }

        const targetLaneX = getLaneX(gameState.player.lane, width);
        currentLaneXRef.current += (targetLaneX - currentLaneXRef.current) * LERP_FACTOR;

        const braking =
          typeof gameState.player.brakeUntil === "number" && now < gameState.player.brakeUntil;
        const scrollMul = braking ? BRAKE_SCROLL_MUL : 1;
        const nitroBoost =
          typeof gameState.nitroBoostUntil === "number" && now < gameState.nitroBoostUntil;
        const nitroMul = nitroBoost ? NITRO_SCROLL_MUL : 1;
        const scrollSpeed = gameState.speed * scrollMul * nitroMul;

        const prevD = gameState.distance;
        let nextD = prevD + scrollSpeed * dt;
        if (nextD > finishDistance) {
          nextD = finishDistance;
        }
        gameState.distance = nextD;

        gameState.speed = Math.min(
          MAX_SPEED,
          BASE_SPEED + Math.log(1 + Math.min(gameState.distance, finishDistance) / 1000) * SPEED_SCALE
        );

        const newScore = Math.floor(gameState.distance / 10);
        if (newScore !== lastScoreSyncRef.current) {
          lastScoreSyncRef.current = newScore;
          gameState.score = newScore;
          onScoreChange(newScore);
        }

        const nextBoundary = (lapTimesRef.current.length + 1) * lapLength;
        if (
          lapTimesRef.current.length < laps &&
          prevD < nextBoundary &&
          gameState.distance >= nextBoundary
        ) {
          const t = now - lapStartMsRef.current;
          lapTimesRef.current = [...lapTimesRef.current, t];
          lapStartMsRef.current = now;
          bestLapRef.current = bestLapRef.current === null ? t : Math.min(bestLapRef.current, t);
        }

        prevDistanceRef.current = gameState.distance;

        while (
          spawnCursorRef.current < spawnEvents.length &&
          gameState.distance >= spawnEvents[spawnCursorRef.current]!.d
        ) {
          applySpawnEvent(spawnEvents[spawnCursorRef.current]!);
          spawnCursorRef.current++;
        }

        gameState.obstacles.forEach((obs) => {
          obs.y += scrollSpeed * dt;
        });
        gameState.coins.forEach((coin) => {
          coin.y += scrollSpeed * dt;
        });
        gameState.nitros.forEach((n) => {
          n.y += scrollSpeed * dt;
        });

        const playerRect = {
          x: currentLaneXRef.current - PLAYER_WIDTH / 2 + 7,
          y: gameState.player.y,
          w: PLAYER_WIDTH - 14,
          h: PLAYER_HEIGHT,
        };

        for (const obstacle of gameState.obstacles) {
          if (obstacle.type !== "car") continue;
          if (obstacle.passedPlayer) continue;
          const playerCx = currentLaneXRef.current;
          const obsCx = getLaneX(obstacle.lane, width);
          if (Math.abs(playerCx - obsCx) > width * CAR_LANE_HIT_FRAC) continue;
          const obsTop = obstacle.y;
          const obsBottom = obstacle.y + obstacle.height;
          const playerTop = playerRect.y + CAR_VERTICAL_INSET;
          const playerBottom = playerRect.y + playerRect.h - CAR_VERTICAL_INSET;
          if (obsTop >= playerBottom) {
            obstacle.passedPlayer = true;
            continue;
          }
          const obsRect = {
            x: obsCx - obstacle.width / 2,
            y: obstacle.y,
            w: obstacle.width,
            h: obstacle.height,
          };
          const hitX =
            playerRect.x < obsRect.x + obsRect.w && playerRect.x + playerRect.w > obsRect.x;
          const hitY = playerTop < obsBottom && obsTop < playerBottom;
          if (hitX && hitY) {
            gameState.phase = "dead";
            onGameOver();
            setGameLoopEnabled(false);
            onPhaseChange("dead");
            return;
          }
        }

        for (const coin of gameState.coins) {
          if (coin.collected) continue;
          const coinX = getLaneX(coin.lane, width);
          const coinY = coin.y;
          const playerCenterX = currentLaneXRef.current;
          const playerCenterY = gameState.player.y + PLAYER_HEIGHT / 2;
          const dist = Math.sqrt((coinX - playerCenterX) ** 2 + (coinY - playerCenterY) ** 2);
          if (dist < coin.radius + 32) {
            coin.collected = true;
            gameState.coinsCollected++;
            onCoinsChange(gameState.coinsCollected);
            onCoinCollect();
          }
        }

        for (const nitro of gameState.nitros) {
          if (nitro.collected) continue;
          const nx = getLaneX(nitro.lane, width);
          const ny = nitro.y;
          const playerCenterX = currentLaneXRef.current;
          const playerCenterY = gameState.player.y + PLAYER_HEIGHT / 2;
          const dist = Math.hypot(nx - playerCenterX, ny - playerCenterY);
          if (dist < NITRO_HIT_R) {
            nitro.collected = true;
            gameState.nitroBoostUntil = now + NITRO_BOOST_MS;
          }
        }

        gameState.obstacles = gameState.obstacles.filter((obs) => obs.y < height + 100);
        gameState.coins = gameState.coins.filter((coin) => coin.y < height + 100);
        gameState.nitros = gameState.nitros.filter((n) => n.y < height + 120);

        if (gameState.distance >= finishDistance && !raceFinishedRef.current) {
          raceFinishedRef.current = true;
          const totalTimeMs = now - raceStartMsRef.current;
          const times = lapTimesRef.current.slice(0, laps);
          let best = bestLapRef.current ?? times[0] ?? totalTimeMs;
          for (const t of times) {
            best = Math.min(best, t);
          }
          onRaceFinish({
            totalTimeMs,
            lapTimesMs: times,
            bestLapMs: best,
            coinsCollected: gameState.coinsCollected,
          });
          gameState.phase = "idle";
          setGameLoopEnabled(false);
          onPhaseChange("finished");
          const progress = 1;
          renderGame(ctx, gameState, width, height, currentLaneXRef.current, progress);
          return;
        }

        const currentLap = Math.min(laps, Math.floor(gameState.distance / lapLength) + 1);
        const currentLapTimeMs = now - lapStartMsRef.current;
        const { speedKmh, gear } = arcadeScrollToKmhGear(scrollSpeed);
        onHudTick?.({
          currentLap,
          laps,
          lapLength,
          distance: gameState.distance,
          finishDistance,
          currentLapTimeMs,
          bestLapMs: bestLapRef.current,
          speedKmh,
          gear,
        });

        if (onGameStateUpdate) onGameStateUpdate(gameState);
        if (onPlayerLaneChange) onPlayerLaneChange(gameState.player.lane);
        if (onJumpChange) onJumpChange(gameState.player.state === "jumping");
        if (onSlideChange) onSlideChange(false);

        const progress = finishDistance > 0 ? Math.min(1, gameState.distance / finishDistance) : 0;
        renderGame(ctx, gameState, width, height, currentLaneXRef.current, progress);
      },
      [
        finishDistance,
        lapLength,
        laps,
        spawnEvents,
        onScoreChange,
        onCoinsChange,
        onCoinCollect,
        onGameOver,
        onRaceFinish,
        onPhaseChange,
        onGameStateUpdate,
        onPlayerLaneChange,
        onJumpChange,
        onSlideChange,
        onHudTick,
        applySpawnEvent,
      ]
    );

    useGameLoop(handleTick, gameLoopEnabled);

    const handleSwipe = useCallback((dir: SwipeDirection) => {
      const gameState = gameStateRef.current;
      if (gameState.phase !== "playing") return;
      const groundY = dimRef.current.height * 0.75;
      const isOnGround = gameState.player.y >= groundY - 8;
      switch (dir) {
        case "left":
          if (gameState.player.lane > 0) {
            gameState.player.lane = (gameState.player.lane - 1) as Lane;
          }
          break;
        case "right":
          if (gameState.player.lane < 2) {
            gameState.player.lane = (gameState.player.lane + 1) as Lane;
          }
          break;
        case "up":
          if (isOnGround && gameState.player.state !== "jumping") {
            gameState.player.state = "jumping";
            gameState.player.vy = JUMP_VELOCITY;
          }
          break;
        case "down":
          if (isOnGround) {
            gameState.player.brakeUntil = performance.now() + BRAKE_DURATION_MS;
            gameState.player.vy = 0;
          }
          break;
      }
    }, []);

    useSwipeGesture(canvasRef, handleSwipe);

    useImperativeHandle(ref, () => ({
      dispatchAction: handleSwipe,
      reset: () => {
        const { width, height } = dimRef.current;
        raceFinishedRef.current = false;
        spawnCursorRef.current = 0;
        lapTimesRef.current = [];
        bestLapRef.current = null;
        prevDistanceRef.current = 0;
        gameStateRef.current = {
          phase: "idle",
          score: 0,
          coinsCollected: 0,
          speed: BASE_SPEED,
          distance: 0,
          player: {
            lane: 1,
            state: "running",
            y: height >= MIN_PLAYABLE_SIZE ? height * 0.75 : 0,
            vy: 0,
            width: PLAYER_WIDTH,
            height: PLAYER_HEIGHT,
          },
          obstacles: [],
          coins: [],
          nitros: [],
          nitroBoostUntil: undefined,
          spawnTimer: 999999,
          frameId: 0,
        };
        if (width >= MIN_PLAYABLE_SIZE) {
          currentLaneXRef.current = getLaneX(gameStateRef.current.player.lane, width);
        }
        lastScoreSyncRef.current = 0;
        setGameLoopEnabled(false);
      },
      start: () => {
        const now = performance.now();
        raceFinishedRef.current = false;
        spawnCursorRef.current = 0;
        lapTimesRef.current = [];
        bestLapRef.current = null;
        lapStartMsRef.current = now;
        raceStartMsRef.current = now;
        prevDistanceRef.current = 0;
        gameStateRef.current.phase = "playing";
        gameStateRef.current.distance = 0;
        gameStateRef.current.speed = BASE_SPEED;
        setGameLoopEnabled(true);
        onPhaseChange("playing");
      },
      pause: () => setGameLoopEnabled(false),
      resume: () => {
        if (!raceFinishedRef.current && gameStateRef.current.phase === "playing") {
          setGameLoopEnabled(true);
        }
      },
    }));

    return (
      <canvas
        ref={canvasRef}
        tabIndex={0}
        className="touch-none block h-screen w-full cursor-none bg-[#12100e]"
        style={{ display: "block", maxHeight: "100dvh" }}
      />
    );
  }
);

RacingGameCanvas.displayName = "RacingGameCanvas";

export { RacingGameCanvas };
