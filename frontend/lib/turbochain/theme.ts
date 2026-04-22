/**
 * TurboChain design tokens: palette, radii, and Framer Motion presets (no looping animations).
 * Spacing: use `rem` for vertical rhythm between sections; use `px` inside components (padding/gaps on controls).
 */

/** Page background — asphalt */
export const turboBg = "#0c0c0e";
/** Elevated panels */
export const turboSurface = "#161412";
/** Card / stat surfaces */
export const turboCard = "#1c1a18";
/** Primary accent — racing orange / tach */
export const turboLime = "#FF7A2E";
/** Secondary accent — nitro / rival strip */
export const turboCyan = "#FFB347";
/** Danger / brake / warnings */
export const turboAmber = "#E53935";

/** Border radii: 8px / 12px / 16px */
export const turboRadius = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;

/** Stat bars: 0.6s, custom ease, 0.08s stagger between bars */
export const turboStatBarTransition = {
  duration: 0.6,
  ease: [0.16, 1, 0.3, 1] as const,
};

export const turboStatBarStagger = 0.08;

/** Live speed readout — spring, not looping */
export const turboSpeedSpring = { type: "spring" as const, stiffness: 200, damping: 22 };

/** AI commentary bubble entrance (single play per message) */
export const turboAiBubbleEnter = {
  initial: { y: 12, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.35 },
};

/** Auto-dismiss AI strip copy after this many seconds (parent should clear) */
export const turboAiAutoDismissMs = 4000;

/** Results: position digit spring feel (approximated with tween for integers) */
export const turboResultsCardStagger = 0.1;

/** Upgrade CTA micro-interaction */
export const turboUpgradeButtonSpring = { type: "spring" as const, stiffness: 400, damping: 18 };
