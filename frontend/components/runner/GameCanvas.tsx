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
} from "@/types/runner";

interface GameCanvasProps {
  onScoreChange: (score: number) => void;
  onCoinsChange: (coins: number) => void;
  onGameOver: () => void;
  onPhaseChange: (phase: "idle" | "playing" | "paused" | "dead") => void;
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
const GRAVITY = 0.0018;
const JUMP_VELOCITY = -0.7;
const SLIDE_DURATION = 600;
const LERP_FACTOR = 0.18;
const SPAWN_INTERVAL = 1800;
const SPEED_SCALE = 0.15;
const PLAYER_WIDTH = 20;
const PLAYER_HEIGHT = 40;

// Colors
const COLOR_BG = "#010F10";
const COLOR_LANE_LINE = "rgba(0,240,255,0.08)";
const COLOR_COIN = "#00F0FF";
const COLOR_OBSTACLE = "#1a3a3c";
const COLOR_OBSTACLE_STROKE = "rgba(0,240,255,0.4)";
const COLOR_PLAYER = "#FFFFFF";

const GameCanvas = forwardRef<GameCanvasHandle, GameCanvasProps>(
  ({ onScoreChange, onCoinsChange, onGameOver, onPhaseChange }, ref) => {
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

      if (
        gameState.player.state === "sliding" &&
        gameState.player.slideEndTime &&
        performance.now() > gameState.player.slideEndTime
      ) {
        gameState.player.state = "running";
        gameState.player.slideEndTime = undefined;
      }

      const targetLaneX = getLaneX(gameState.player.lane, width);
      currentLaneXRef.current +=
        (targetLaneX - currentLaneXRef.current) * LERP_FACTOR;

      gameState.distance += gameState.speed * dt;
      gameState.speed =
        BASE_SPEED + Math.log(1 + gameState.distance / 1000) * SPEED_SCALE;

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
        const isCoin = Math.random() < 0.7;

        if (isCoin) {
          gameState.coins.push({
            id: gameState.frameId++,
            lane: randomLane,
            y: -30,
            radius: 8,
            collected: false,
          });
        } else {
          const isWall = Math.random() < 0.5;
          gameState.obstacles.push({
            id: gameState.frameId++,
            lane: randomLane,
            y: -60,
            type: isWall ? "wall" : "barrier",
            width: 40,
            height: isWall ? 60 : 20,
          });
        }

        gameState.spawnTimer = SPAWN_INTERVAL / gameState.speed;
      }

      gameState.obstacles.forEach((obs) => {
        obs.y += gameState.speed * dt;
      });
      gameState.coins.forEach((coin) => {
        coin.y += gameState.speed * dt;
      });

      const playerRect = {
        x: currentLaneXRef.current - PLAYER_WIDTH / 2 + 7,
        y:
          gameState.player.state === "sliding"
            ? groundY - PLAYER_HEIGHT * 0.45 + 5
            : groundY - PLAYER_HEIGHT + 10,
        w: PLAYER_WIDTH - 14,
        h:
          gameState.player.state === "sliding"
            ? PLAYER_HEIGHT * 0.45
            : PLAYER_HEIGHT - 20,
      };

      for (const obstacle of gameState.obstacles) {
        if (
          obstacle.type === "wall" &&
          gameState.player.state === "jumping"
        ) {
          continue;
        }
        if (
          obstacle.type === "barrier" &&
          gameState.player.state === "sliding"
        ) {
          continue;
        }

        const obsRect = {
          x: getLaneX(obstacle.lane, width) - obstacle.width / 2,
          y: obstacle.y,
          w: obstacle.width,
          h: obstacle.height,
        };

        const collision =
          playerRect.x < obsRect.x + obsRect.w &&
          playerRect.x + playerRect.w > obsRect.x &&
          playerRect.y < obsRect.y + obsRect.h &&
          playerRect.y + playerRect.h > obsRect.y;

        if (collision) {
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
        const playerCenterY = groundY - PLAYER_HEIGHT / 2;

        const dist = Math.sqrt(
          (coinX - playerCenterX) ** 2 + (coinY - playerCenterY) ** 2
        );

        if (dist < coin.radius + 20) {
          coin.collected = true;
          gameState.coinsCollected++;
          onCoinsChange(gameState.coinsCollected);
        }
      }

      gameState.obstacles = gameState.obstacles.filter(
        (obs) => obs.y < height + 100
      );
      gameState.coins = gameState.coins.filter((coin) => coin.y < height + 100);

      renderGame(ctx, gameState, width, height, currentLaneXRef.current);
    }, [onScoreChange, onCoinsChange, onGameOver]);

    useGameLoop(handleTick, gameLoopEnabled);

    const handleSwipe = useCallback((dir: SwipeDirection) => {
      const gameState = gameStateRef.current;
      if (gameState.phase !== "playing") return;

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
          if (gameState.player.y === dimRef.current.height * 0.75) {
            gameState.player.state = "jumping";
            gameState.player.vy = JUMP_VELOCITY;
          }
          break;
        case "down":
          gameState.player.state = "sliding";
          gameState.player.slideEndTime = performance.now() + SLIDE_DURATION;
          break;
      }
    }, []);

    useSwipeGesture(canvasRef, handleSwipe);

    useImperativeHandle(ref, () => ({
      dispatchAction: handleSwipe,
      reset: () => {
        gameStateRef.current = {
          phase: "idle",
          score: 0,
          coinsCollected: 0,
          speed: BASE_SPEED,
          distance: 0,
          player: {
            lane: 1,
            state: "running",
            y: dimRef.current.height * 0.75,
            vy: 0,
            width: PLAYER_WIDTH,
            height: PLAYER_HEIGHT,
          },
          obstacles: [],
          coins: [],
          spawnTimer: SPAWN_INTERVAL,
          frameId: 0,
        };
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
      const groundY = height * 0.75;
      const skyHeight = groundY;

      // Far background - buildings (slowest)
      ctx.fillStyle = "#0a0a1a";
      const buildingSpacing = 150;
      const buildingOffset = (distance * 0.15) % buildingSpacing;

      for (let i = -2; i < width / buildingSpacing + 2; i++) {
        const buildingX = i * buildingSpacing - buildingOffset;
        const buildingHeight = 120 + ((i * 17) % 80);
        ctx.fillRect(buildingX, skyHeight - buildingHeight, 80, buildingHeight);

        // Building windows
        ctx.fillStyle = "#00F0FF";
        for (let row = 0; row < buildingHeight / 15; row++) {
          for (let col = 0; col < 3; col++) {
            ctx.fillRect(
              buildingX + col * 20 + 8,
              skyHeight - buildingHeight + row * 15 + 5,
              8,
              8
            );
          }
        }
        ctx.fillStyle = "#0a0a1a";
      }

      // Mid background - trees (medium speed)
      ctx.fillStyle = "#1a3a2a";
      const treeSpacing = 120;
      const treeOffset = (distance * 0.25) % treeSpacing;

      for (let i = -2; i < width / treeSpacing + 2; i++) {
        const treeX = i * treeSpacing - treeOffset;
        const treeHeight = 80 + ((i * 11) % 40);

        // Tree trunk
        ctx.fillStyle = "#1a3a2a";
        ctx.fillRect(treeX + 15, skyHeight - treeHeight, 10, treeHeight);

        // Tree foliage
        ctx.fillStyle = "#00FF00";
        ctx.beginPath();
        ctx.arc(treeX + 20, skyHeight - treeHeight, 25, 0, Math.PI * 2);
        ctx.fill();
      }

      // Close background - small details (fastest)
      ctx.fillStyle = "#004d66";
      const detailSpacing = 80;
      const detailOffset = (distance * 0.4) % detailSpacing;

      for (let i = -2; i < width / detailSpacing + 2; i++) {
        const detailX = i * detailSpacing - detailOffset;
        ctx.fillRect(detailX, skyHeight - 30, 25, 30);
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
        ctx.fillStyle = COLOR_COIN;
        ctx.shadowColor = COLOR_COIN;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(coinX, coin.y, coin.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      gameState.obstacles.forEach((obs) => {
        const obsX = getLaneX(obs.lane, width) - obs.width / 2;
        ctx.fillStyle = COLOR_OBSTACLE;
        ctx.fillRect(obsX, obs.y, obs.width, obs.height);
        ctx.strokeStyle = COLOR_OBSTACLE_STROKE;
        ctx.lineWidth = 2;
        ctx.strokeRect(obsX, obs.y, obs.width, obs.height);
      });

      const playerY =
        gameState.player.state === "sliding"
          ? groundY - PLAYER_HEIGHT * 0.45
          : gameState.player.y;
      const playerH =
        gameState.player.state === "sliding"
          ? PLAYER_HEIGHT * 0.45
          : PLAYER_HEIGHT;

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
