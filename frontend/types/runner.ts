// Lane positions: 0 = left, 1 = center, 2 = right
export type Lane = 0 | 1 | 2;

// Player movement states
export type PlayerState = "running" | "jumping" | "sliding";

// Game phase states
export type GamePhase = "idle" | "playing" | "paused" | "dead";

// Player entity in the game world
export interface PlayerEntity {
  lane: Lane;
  state: PlayerState;
  y: number; // vertical position (0 = top, increases downward)
  vy: number; // vertical velocity for jumping
  width: number;
  height: number;
  slideEndTime?: number; // ms timestamp when slide ends (legacy; slide unused — kept for shape compatibility)
  /** `performance.now()` until which scroll speed is reduced (brake / swipe down). */
  brakeUntil?: number;
}

// Obstacle types
export type ObstacleType = "car" | "wall" | "barrier";

// Obstacle entity (scrolling down the screen)
export interface Obstacle {
  id: number;
  lane: Lane;
  y: number; // world-space Y position
  type: ObstacleType; // wall = jump over, barrier = slide under
  width: number;
  height: number;
  /**
   * Cars only: once this car’s front has dropped below the player’s feet while we were in the
   * same lane band, it can never register a hit again — prevents “phantom” deaths after passing
   * or when changing lanes behind it.
   */
  passedPlayer?: boolean;
}

// Collectible coin entity
export interface Coin {
  id: number;
  lane: Lane;
  y: number;
  radius: number;
  collected: boolean;
}

/** Lane pickup: nitro bottle (one active pickup at a time in endless / spaced in race). */
export interface NitroPickup {
  id: number;
  lane: Lane;
  y: number;
  collected: boolean;
}

// Complete game state held in refs
export interface GameState {
  phase: GamePhase;
  score: number; // points from distance traveled
  coinsCollected: number; // number of coins picked up
  speed: number; // pixels per millisecond
  distance: number; // total pixels scrolled (for difficulty scaling)
  player: PlayerEntity;
  obstacles: Obstacle[];
  coins: Coin[];
  nitros: NitroPickup[];
  /** `performance.now()` until nitro scroll boost applies. */
  nitroBoostUntil?: number;
  spawnTimer: number; // countdown in ms
  frameId: number; // entity ID counter
}
