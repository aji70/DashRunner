"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { RaceResult } from "@/types/racing";
import { formatRaceTimeMs } from "@/lib/racing/formatRaceTime";
import { GlassPanel } from "@/components/ui/GlassPanel";

interface RaceResultsOverlayProps {
  result: RaceResult | null;
  onRestart: () => void;
}

export function RaceResultsOverlay({ result, onRestart }: RaceResultsOverlayProps) {
  if (!result) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pointer-events-auto absolute inset-0 z-40 flex items-end justify-center bg-black/65 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center sm:pb-0"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="w-full max-w-md px-3 sm:px-4"
      >
        <GlassPanel className="px-6 py-8 text-center shadow-lift sm:px-8 sm:py-10">
          <p className="font-rajdhani text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-300/80">Finished</p>
          <h2 className="mt-2 font-orbitron text-3xl font-black uppercase text-orange-100 sm:text-4xl">Race complete</h2>
          <p className="mt-1 font-orbitron text-2xl font-bold tabular-nums text-rose-200">{formatRaceTimeMs(result.totalTimeMs)}</p>
          <p className="mt-1 font-rajdhani text-sm text-[var(--text-secondary)]">Total time</p>

          <div className="mt-6 grid gap-2 text-left">
            <p className="font-rajdhani text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--text-dim)]">Laps</p>
            <ul className="space-y-1.5 font-orbitron text-sm tabular-nums text-slate-200">
              {result.lapTimesMs.map((t, i) => (
                <li key={i} className="flex justify-between border-b border-white/[0.06] py-1">
                  <span className="text-[var(--text-dim)]">Lap {i + 1}</span>
                  <span>{formatRaceTimeMs(t)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 flex justify-between font-orbitron text-sm text-emerald-200">
              <span>Best lap</span>
              <span>{formatRaceTimeMs(result.bestLapMs)}</span>
            </p>
            <p className="flex justify-between font-rajdhani text-sm text-amber-200/90">
              <span>Coins</span>
              <span>{result.coinsCollected}</span>
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={onRestart}
              className="w-full rounded-2xl border border-orange-400/40 bg-gradient-to-br from-orange-500/30 to-slate-950 py-3.5 font-orbitron text-sm font-bold uppercase tracking-[0.15em] text-orange-50 transition hover:scale-[1.01] active:scale-[0.99]"
            >
              Race again
            </button>
            <Link
              href="/play?start=1"
              className="block w-full rounded-2xl border border-white/[0.1] py-3.5 text-center font-orbitron text-xs font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] transition hover:bg-white/[0.05]"
            >
              Endless run
            </Link>
            <Link href="/" className="block text-center font-rajdhani text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-dim)] hover:text-orange-200">
              Hub
            </Link>
          </div>
        </GlassPanel>
      </motion.div>
    </motion.div>
  );
}
