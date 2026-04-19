/** Format milliseconds as M:SS.cs for HUD and results. */
export function formatRaceTimeMs(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "0:00.00";
  const totalCs = Math.floor(ms / 10);
  const cs = totalCs % 100;
  const totalSec = Math.floor(totalCs / 100);
  const s = totalSec % 60;
  const m = Math.floor(totalSec / 60);
  return `${m}:${s.toString().padStart(2, "0")}.${cs.toString().padStart(2, "0")}`;
}
