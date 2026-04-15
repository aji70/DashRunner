import { useEffect, useRef } from "react";

export type SwipeDirection = "left" | "right" | "up" | "down";

/**
 * Custom hook that detects swipe gestures on a target element.
 *
 * @param targetRef - React ref to the target element (typically canvas)
 * @param onSwipe - Callback fired with the detected swipe direction
 * @param deadZone - Minimum pixel distance to register a swipe (default: 30)
 */
export function useSwipeGesture(
  targetRef: React.RefObject<HTMLElement | null>,
  onSwipe: (dir: SwipeDirection) => void,
  deadZone: number = 30
): void {
  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);
  const onSwipeRef = useRef(onSwipe);

  // Keep callback fresh without effect re-runs
  useEffect(() => {
    onSwipeRef.current = onSwipe;
  }, [onSwipe]);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const handleTouchStart = (e: TouchEvent) => {
      startXRef.current = e.touches[0].clientX;
      startYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startXRef.current;
      const dy = e.changedTouches[0].clientY - startYRef.current;

      // Ignore swipes below dead zone threshold
      if (Math.abs(dx) < deadZone && Math.abs(dy) < deadZone) return;

      // Determine direction with a slight bias threshold to avoid accidental diagonals.
      if (Math.abs(dx) > Math.abs(dy) * 1.15) {
        // Horizontal swipe
        onSwipeRef.current(dx > 0 ? "right" : "left");
      } else {
        // Vertical swipe
        onSwipeRef.current(dy > 0 ? "down" : "up");
      }
    };

    // Attach passive listeners for better scroll performance
    target.addEventListener("touchstart", handleTouchStart, { passive: true });
    target.addEventListener("touchend", handleTouchEnd, { passive: true });

    // Keyboard fallback for desktop testing
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          onSwipeRef.current("left");
          break;
        case "ArrowRight":
          onSwipeRef.current("right");
          break;
        case "ArrowUp":
          onSwipeRef.current("up");
          break;
        case "ArrowDown":
          onSwipeRef.current("down");
          break;
        default:
          return;
      }
      e.preventDefault();
    };

    target.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      target.removeEventListener("touchstart", handleTouchStart);
      target.removeEventListener("touchend", handleTouchEnd);
      target.removeEventListener("keydown", handleKeyDown);
    };
  }, [targetRef, deadZone]);
}
