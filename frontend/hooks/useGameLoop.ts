import { useEffect, useRef } from "react";

/**
 * Custom hook that manages a requestAnimationFrame-based game loop.
 *
 * @param tick - Callback function called on each frame with delta time (dt) in milliseconds
 * @param enabled - Boolean indicating if the loop should be running
 */
export function useGameLoop(
  tick: (dt: number) => void,
  enabled: boolean
): void {
  const tickRef = useRef(tick);
  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Keep the tick callback fresh without causing effect re-runs
  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  useEffect(() => {
    if (!enabled) {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (currentTime: number) => {
      // Compute delta time, capped at 50ms to prevent spiral-of-death on tab blur
      let dt = currentTime - lastTimeRef.current;
      dt = Math.min(dt, 50);
      lastTimeRef.current = currentTime;

      // Call the tick function
      tickRef.current(dt);

      // Schedule next frame
      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);

    // Cleanup: cancel the animation frame
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [enabled]);
}
