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
import type {
  GameState,
  Lane,
  ObstacleType,
} from "@/types/runner";

interface GameCanvasProps {
  onScoreChange: (score: number) => void;
  onCoinsChange: (coins: number) => void;
  onCoinCollect: () => void;
  onGameOver: () => void;
  onPhaseChange: (phase: "idle" | "playing" | "paused" | "dead") => void;
  onGameStateUpdate?: (state: GameState) => void;
  onPlayerLaneChange?: (lane: 0 | 1 | 2) => void;
  onJumpChange?: (jumping: boolean) => void;
  onSlideChange?: (sliding: boolean) => void;
}

export interface GameCanvasHandle {
  dispatchAction: (dir: SwipeDirection) => void;
  reset: () => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
}

// Game constants
const BASE_SPEED = 0.3;
const GRAVITY = 0.00145;
const JUMP_VELOCITY = -0.92;
const LERP_FACTOR = 0.18;
/** Swipe down: temporary scroll slowdown (brake), ms. */
const BRAKE_DURATION_MS = 820;
const BRAKE_SCROLL_MUL = 0.36;
/**
 * Car threat band: player x must be within this fraction of canvas width of the car’s lane
 * center to count as “in lane” (tighter than lane spacing so adjacent-lane traffic doesn’t read as yours).
 */
const CAR_LANE_HIT_FRAC = 0.24;
/** Ignore a few px at the feet so a car that has mostly cleared below doesn’t snag on the last row of pixels. */
const CAR_VERTICAL_INSET = 6;
const SPAWN_INTERVAL = 950;
const MAX_SPEED = 0.7;
const SPEED_SCALE = 0.12;
const PLAYER_WIDTH = 20;
const PLAYER_HEIGHT = 40;
/** Lower = more traffic vs coin streaks. */
const COIN_RUSH_CHANCE = 0.55;
/** Chance to spawn a second car in another lane on the same beat. */
const OBSTACLE_CHANCE = 0.28;
/** Extra car in a third lane sometimes (staggered up-road). */
const EXTRA_TRAFFIC_CHANCE = 0.12;
const COIN_RUSH_STREAK_LENGTH = 3;
/** Ignore ticks until the canvas has real dimensions (avoids lane math at width 0 → false collisions). */
const MIN_PLAYABLE_SIZE = 48;

// Colors
const COLOR_BG = "#010F10";
const COLOR_LANE_LINE = "rgba(0,240,255,0.08)";
const COLOR_COIN = "#FFD700";
const COLOR_OBSTACLE = "#1a3a3c";
const COLOR_OBSTACLE_STROKE = "rgba(0,240,255,0.4)";
const COLOR_PLAYER = "#FFFFFF";

const GameCanvas = forwardRef<GameCanvasHandle, GameCanvasProps>(
  ({ onScoreChange, onCoinsChange, onCoinCollect, onGameOver, onPhaseChange, onGameStateUpdate, onPlayerLaneChange, onJumpChange, onSlideChange }, ref) => {
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
      spawnTimer: SPAWN_INTERVAL,
      frameId: 0,
    });

    const dimRef = useRef({ width: 0, height: 0, dpr: 1 });
    const currentLaneXRef = useRef(0);
    const lastScoreSyncRef = useRef(0);
    const [gameLoopEnabled, setGameLoopEnabled] = useState(false);

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

    const spawnCoinBurst = useCallback((baseLane: Lane) => {
      const patternRoll = Math.random();
      const lateralOffset = 22;
      const forwardGap = 22;

      if (patternRoll < 0.4) {
        // Straight lane streak
        for (let i = 0; i < COIN_RUSH_STREAK_LENGTH; i++) {
          spawnCoin(baseLane, -90 - i * forwardGap);
        }
        return;
      }

      if (patternRoll < 0.75) {
        // Zig-zag streak
        for (let i = 0; i < COIN_RUSH_STREAK_LENGTH; i++) {
          const lane = (Math.max(0, Math.min(2, baseLane + (i % 2 === 0 ? 0 : (baseLane === 2 ? -1 : 1))))) as Lane;
          spawnCoin(lane, -90 - i * forwardGap);
        }
        return;
      }

      // Wide "splash" pattern across lanes
      spawnCoin(0, -90);
      spawnCoin(1, -90 - lateralOffset * 0.3);
      spawnCoin(2, -90);
      spawnCoin(1, -90 - forwardGap);
      spawnCoin(baseLane, -90 - forwardGap * 1.6);
    }, [spawnCoin]);

    const spawnObstacle = useCallback((lane: Lane) => {
      const gameState = gameStateRef.current;
      const roll = Math.random();
      let type: ObstacleType;
      let height: number;

      if (roll < 0.7) {
        type = "car";
        height = 40;
      } else if (roll < 0.85) {
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

      // Handle orientation changes and window resizes
      window.addEventListener("resize", updateCanvasSize);
      window.addEventListener("orientationchange", updateCanvasSize);

      return () => {
        window.removeEventListener("resize", updateCanvasSize);
        window.removeEventListener("orientationchange", updateCanvasSize);
      };
    }, []);

    const handleTick = useCallback((dt: number) => {
      const gameState = gameStateRef.current;
      if (gameState.phase !== "playing") return;

      const { width, height } = dimRef.current;
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      // Before resize runs, width/height can be 0; getLaneX(..., 0) collapses every lane to x=0 so all
      // obstacles overlap the player and trigger instant game-over on the first car spawn.
      if (width < MIN_PLAYABLE_SIZE || height < MIN_PLAYABLE_SIZE) {
        return;
      }

      gameState.player.vy += GRAVITY * dt;
      gameState.player.y += gameState.player.vy * dt;

      const groundY = height * 0.75;
      if (gameState.player.y >= groundY) {
        gameState.player.y = groundY;
        gameState.player.vy = 0;
        if (gameState.player.state === "jumping") {
          gameState.player.state = "running";
        }
      }

      const targetLaneX = getLaneX(gameState.player.lane, width);
      currentLaneXRef.current +=
        (targetLaneX - currentLaneXRef.current) * LERP_FACTOR;

      const braking =
        typeof gameState.player.brakeUntil === "number" &&
        performance.now() < gameState.player.brakeUntil;
      const scrollMul = braking ? BRAKE_SCROLL_MUL : 1;
      const scrollSpeed = gameState.speed * scrollMul;

      gameState.distance += scrollSpeed * dt;
      gameState.speed = Math.min(
        MAX_SPEED,
        BASE_SPEED + Math.log(1 + gameState.distance / 1000) * SPEED_SCALE
      );

      // Update score based on distance traveled (1 point per 10 pixels)
      const newScore = Math.floor(gameState.distance / 10);
      if (newScore !== lastScoreSyncRef.current) {
        lastScoreSyncRef.current = newScore;
        gameState.score = newScore;
        onScoreChange(newScore);
      }

      gameState.spawnTimer -= dt;
      if (gameState.spawnTimer <= 0) {
        const randomLane = Math.floor(Math.random() * 3) as Lane;
        const isCoin = Math.random() < COIN_RUSH_CHANCE;

        if (isCoin) {
          spawnCoinBurst(randomLane);
        } else {
          spawnObstacle(randomLane);
          if (Math.random() < OBSTACLE_CHANCE) {
            const otherLane = ((randomLane + 1 + Math.floor(Math.random() * 2)) % 3) as Lane;
            spawnObstacle(otherLane);
            gameState.obstacles[gameState.obstacles.length - 1].y = -185;
          }
          if (Math.random() < EXTRA_TRAFFIC_CHANCE) {
            const extraLane = ((randomLane + 2) % 3) as Lane;
            spawnObstacle(extraLane);
            gameState.obstacles[gameState.obstacles.length - 1].y = -265;
          }
        }

        gameState.spawnTimer = SPAWN_INTERVAL / gameState.speed;
      }

      gameState.obstacles.forEach((obs) => {
        obs.y += scrollSpeed * dt;
      });
      gameState.coins.forEach((coin) => {
        coin.y += scrollSpeed * dt;
      });

      // Hitbox matches the drawn player rect (top = player.y, same as renderGame).
      const playerRect = {
        x: currentLaneXRef.current - PLAYER_WIDTH / 2 + 7,
        y: gameState.player.y,
        w: PLAYER_WIDTH - 14,
        h: PLAYER_HEIGHT,
      };

      // Only cars can end the run; use explicit separation + “passed” so nothing behind you can kill you.
      for (const obstacle of gameState.obstacles) {
        if (obstacle.type !== "car") continue;
        if (obstacle.passedPlayer) continue;

        const playerCx = currentLaneXRef.current;
        const obsCx = getLaneX(obstacle.lane, width);
        const lateral = Math.abs(playerCx - obsCx);
        if (lateral > width * CAR_LANE_HIT_FRAC) continue;

        const obsTop = obstacle.y;
        const obsBottom = obstacle.y + obstacle.height;
        const playerTop = playerRect.y + CAR_VERTICAL_INSET;
        const playerBottom = playerRect.y + playerRect.h - CAR_VERTICAL_INSET;

        // Car is entirely below the player’s forgiving hitbox → you’ve passed it; never collide again.
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
          playerRect.x < obsRect.x + obsRect.w &&
          playerRect.x + playerRect.w > obsRect.x;
        const hitY = playerTop < obsBottom && obsTop < playerBottom;

        if (hitX && hitY) {
          gameState.phase = "dead";
          onGameOver();
          return;
        }
      }

      for (const coin of gameState.coins) {
        if (coin.collected) continue;

        const coinX = getLaneX(coin.lane, width);
        const coinY = coin.y;
        const playerCenterX = currentLaneXRef.current;
        const playerCenterY = gameState.player.y + PLAYER_HEIGHT / 2;

        const dist = Math.sqrt(
          (coinX - playerCenterX) ** 2 + (coinY - playerCenterY) ** 2
        );

        if (dist < coin.radius + 32) {
          coin.collected = true;
          gameState.coinsCollected++;
          onCoinsChange(gameState.coinsCollected);
          onCoinCollect();
        }
      }

      gameState.obstacles = gameState.obstacles.filter(
        (obs) => obs.y < height + 100
      );
      gameState.coins = gameState.coins.filter((coin) => coin.y < height + 100);

      // Update 3D scene with game state
      if (onGameStateUpdate) {
        onGameStateUpdate(gameState);
      }
      if (onPlayerLaneChange) {
        onPlayerLaneChange(gameState.player.lane);
      }
      if (onJumpChange) {
        onJumpChange(gameState.player.state === "jumping");
      }
      if (onSlideChange) {
        onSlideChange(false);
      }

      renderGame(ctx, gameState, width, height, currentLaneXRef.current);
    }, [onScoreChange, onCoinsChange, onCoinCollect, onGameOver, onGameStateUpdate, onPlayerLaneChange, onJumpChange, onSlideChange, spawnCoinBurst, spawnObstacle]);

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
            gameState.player.slideEndTime = undefined;
          }
          break;
        case "down":
          // Brake: slow traffic scroll briefly (no squat — squat falsely widened overlap with cars).
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
          spawnTimer: SPAWN_INTERVAL,
          frameId: 0,
        };
        if (width >= MIN_PLAYABLE_SIZE) {
          currentLaneXRef.current = getLaneX(gameStateRef.current.player.lane, width);
        }
        lastScoreSyncRef.current = 0;
        setGameLoopEnabled(false);
      },
      start: () => {
        gameStateRef.current.phase = "playing";
        setGameLoopEnabled(true);
        onPhaseChange("playing");
      },
      pause: () => {
        setGameLoopEnabled(false);
      },
      resume: () => {
        setGameLoopEnabled(true);
      },
    }));

    const drawParallaxBackground = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      distance: number
    ) => {
      // Far background - buildings (slowest, scrolls down)
      ctx.fillStyle = "#0a0a1a";
      const buildingSpacing = 300;
      const buildingYOffset = (distance * 0.1) % buildingSpacing;

      for (let i = -2; i < height / buildingSpacing + 3; i++) {
        const buildingY = i * buildingSpacing - buildingYOffset;
        if (buildingY > height) continue;

        // Draw 3 buildings per row across the width
        for (let col = 0; col < 4; col++) {
          const buildingX = (col * width) / 3;
          const buildingHeight = 100 + ((i * col * 13) % 60);
          ctx.fillRect(buildingX, buildingY, width / 3, buildingHeight);

          // Building windows
          ctx.fillStyle = "#00F0FF";
          for (let row = 0; row < buildingHeight / 20; row++) {
            for (let wcol = 0; wcol < 4; wcol++) {
              ctx.fillRect(
                buildingX + wcol * (width / 12) + 5,
                buildingY + row * 20 + 5,
                8,
                8
              );
            }
          }
          ctx.fillStyle = "#0a0a1a";
        }
      }

      // Mid background - trees (medium speed)
      ctx.fillStyle = "#1a3a2a";
      const treeSpacing = 200;
      const treeYOffset = (distance * 0.25) % treeSpacing;

      for (let i = -2; i < height / treeSpacing + 3; i++) {
        const treeY = i * treeSpacing - treeYOffset;
        if (treeY > height) continue;

        // Trees spread across width
        for (let col = 0; col < 5; col++) {
          const treeX = (col * width) / 5;
          const treeHeight = 60 + ((i * col * 7) % 30);

          // Tree trunk
          ctx.fillStyle = "#1a3a2a";
          ctx.fillRect(treeX + 8, treeY, 8, treeHeight);

          // Tree foliage
          ctx.fillStyle = "#00FF00";
          ctx.beginPath();
          ctx.arc(treeX + 12, treeY, 20, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Close background - small details (fastest)
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
      playerX: number
    ) => {
      ctx.fillStyle = COLOR_BG;
      ctx.fillRect(0, 0, width, height);

      // Draw parallax background
      drawParallaxBackground(ctx, width, height, gameState.distance);

      ctx.strokeStyle = COLOR_LANE_LINE;
      ctx.lineWidth = 2;
      const lane1X = width / 3;
      const lane2X = (2 * width) / 3;
      ctx.beginPath();
      ctx.moveTo(lane1X, 0);
      ctx.lineTo(lane1X, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(lane2X, 0);
      ctx.lineTo(lane2X, height);
      ctx.stroke();

      const groundY = height * 0.75;
      ctx.strokeStyle = "rgba(0,240,255,0.2)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();

      gameState.coins.forEach((coin) => {
        if (coin.collected) return;
        const coinX = getLaneX(coin.lane, width);
        const r = coin.radius;
        // Radial fill so it reads as a thick disc, not a flat dot.
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

      gameState.obstacles.forEach((obs) => {
        const obsX = getLaneX(obs.lane, width) - obs.width / 2;
        ctx.fillStyle = COLOR_OBSTACLE;
        ctx.fillRect(obsX, obs.y, obs.width, obs.height);
        ctx.strokeStyle = COLOR_OBSTACLE_STROKE;
        ctx.lineWidth = 2;
        ctx.strokeRect(obsX, obs.y, obs.width, obs.height);
      });

      const playerY = gameState.player.y;
      const playerH = PLAYER_HEIGHT;

      ctx.fillStyle = COLOR_PLAYER;
      ctx.fillRect(
        playerX - PLAYER_WIDTH / 2,
        playerY,
        PLAYER_WIDTH,
        playerH
      );

      ctx.strokeStyle = COLOR_COIN;
      ctx.lineWidth = 1;
      ctx.strokeRect(
        playerX - PLAYER_WIDTH / 2,
        playerY,
        PLAYER_WIDTH,
        playerH
      );
    };

    return (
      <canvas
        ref={canvasRef}
        tabIndex={0}
        className="touch-none block w-full h-screen cursor-none bg-[#010F10]"
        style={{ display: "block", maxHeight: "100dvh" }}
      />
    );
  }
);

GameCanvas.displayName = "GameCanvas";

export { GameCanvas };
