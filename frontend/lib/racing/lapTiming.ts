/**
 * Each time `distance` crosses a multiple of `lapLength` (up to `laps` × lapLength), append one lap time.
 */
export function recordLapCrossings(
  prevDistance: number,
  distance: number,
  lapLength: number,
  laps: number,
  lapStartMs: number,
  nowMs: number,
  lapTimesMs: number[]
): { lapStartMs: number; lapTimesMs: number[] } {
  let start = lapStartMs;
  const times = [...lapTimesMs];
  const a = Math.floor(prevDistance / lapLength);
  const b = Math.min(laps, Math.floor(distance / lapLength));

  for (let i = a; i < b; i++) {
    const t = nowMs - start;
    times.push(t);
    start = nowMs;
  }

  return { lapStartMs: start, lapTimesMs: times };
}
