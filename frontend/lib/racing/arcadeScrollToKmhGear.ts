/** Matches racing/endless canvas BASE_SPEED, brake, and max scroll for HUD display. */
const MIN_SCROLL = 0.3 * 0.36;
const MAX_SCROLL = 0.72;

/** Maps effective scroll speed (px/ms) to arcade km/h and gear for the HUD speedometer. */
export function arcadeScrollToKmhGear(scrollSpeed: number): { speedKmh: number; gear: number } {
  const clamped = Math.max(MIN_SCROLL, Math.min(MAX_SCROLL, scrollSpeed));
  const u = (clamped - MIN_SCROLL) / (MAX_SCROLL - MIN_SCROLL);
  return {
    speedKmh: Math.round(35 + u * 205),
    gear: Math.min(5, 1 + Math.min(4, Math.floor(u * 5))),
  };
}
