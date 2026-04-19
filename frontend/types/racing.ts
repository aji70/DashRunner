import type { Lane } from "./runner";

/** Single-lap scroll distance (world units; matches `GameState.distance` scale). */
export type RaceConfig = {
  trackId: string;
  /** Distance units for one full lap before wrapping to next lap. */
  lapLength: number;
  laps: number;
  /** Deterministic spawn stream. */
  seed: number;
};

export type RaceSpawnEvent =
  | { d: number; kind: "obstacle"; lane: Lane }
  | { d: number; kind: "coinBurst"; baseLane: Lane; pattern: "line" | "zigzag" | "splash" };

export type RaceResult = {
  totalTimeMs: number;
  lapTimesMs: number[];
  bestLapMs: number;
  coinsCollected: number;
};

export type RacingHudSnapshot = {
  currentLap: number;
  laps: number;
  lapLength: number;
  distance: number;
  finishDistance: number;
  currentLapTimeMs: number;
  bestLapMs: number | null;
  /** Arcade km/h derived from effective scroll speed (includes braking). */
  speedKmh: number;
  /** Gear 1–5 on the same scale as speed (drops while braking). */
  gear: number;
};
