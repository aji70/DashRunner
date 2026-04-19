import type { Lane } from "@/types/runner";
import type { RaceSpawnEvent } from "@/types/racing";
import { mulberry32 } from "./prng";

const PATTERNS: Array<"line" | "zigzag" | "splash"> = ["line", "zigzag", "splash"];

/**
 * Builds ordered spawn events for [0, totalRaceDistance). Spacing and lanes are deterministic from `seed`.
 */
export function buildRaceSpawnSchedule(totalRaceDistance: number, seed: number): RaceSpawnEvent[] {
  const rand = mulberry32(seed);
  const events: RaceSpawnEvent[] = [];
  let nextD = 280 + Math.floor(rand() * 200);

  while (nextD < totalRaceDistance - 120) {
    const lane = Math.floor(rand() * 3) as Lane;
    const roll = rand();

    if (roll < 0.52) {
      const pattern = PATTERNS[Math.floor(rand() * PATTERNS.length)]!;
      events.push({ d: nextD, kind: "coinBurst", baseLane: lane, pattern });
    } else {
      events.push({ d: nextD, kind: "obstacle", lane });
      if (rand() < 0.22) {
        const lane2 = ((lane + 1 + Math.floor(rand() * 2)) % 3) as Lane;
        events.push({ d: nextD + 4, kind: "obstacle", lane: lane2 });
      }
    }

    nextD += 320 + Math.floor(rand() * 520);
  }

  events.sort((a, b) => a.d - b.d);
  return events;
}
