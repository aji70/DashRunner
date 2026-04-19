"use client";

import { motion } from "framer-motion";
import type { RacingHudSnapshot } from "@/types/racing";
import { formatRaceTimeMs } from "@/lib/racing/formatRaceTime";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/lib/cn";

function IconPause({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="5" y="4" width="5" height="16" rx="1" />
      <rect x="14" y="4" width="5" height="16" rx="1" />
    </svg>
  );
}

function IconVolumeOn({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M11 5 6 9H3v6h3l5 4V5Z" fill="currentColor" stroke="none" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" strokeLinecap="round" />
    </svg>
  );
}

function IconVolumeOff({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M11 5 6 9H3v6h3l5 4V5Z" fill="currentColor" stroke="none" />
      <path d="m17 9 5 5M22 9l-5 5" strokeLinecap="round" />
    </svg>
  );
}

const iconBtn =
  "pointer-events-auto flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.1] bg-[var(--panel)]/95 text-cyan-200 shadow-[var(--shadow-panel)] backdrop-blur-md transition hover:border-[var(--line-bright)] hover:text-fuchsia-100";

const SPEEDO_MIN_KMH = 35;
const SPEEDO_MAX_KMH = 240;

function RacingSpeedCluster({ speedKmh, gear }: { speedKmh: number; gear: number }) {
  const t = Math.max(0, Math.min(1, (speedKmh - SPEEDO_MIN_KMH) / (SPEEDO_MAX_KMH - SPEEDO_MIN_KMH)));
  const theta = Math.PI * (1 - t);
  const cx = 60;
  const cy = 60;
  const needleR = 40;
  const nx = cx + needleR * Math.cos(theta);
  const ny = cy - needleR * Math.sin(theta);

  return (
    <GlassPanel className="shadow-lift">
      <div className="flex items-end gap-3 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3">
        <div className="relative h-[76px] w-[124px] shrink-0 sm:h-[84px] sm:w-[132px]">
          <svg viewBox="0 0 120 68" className="h-full w-full overflow-visible" aria-hidden>
            <defs>
              <linearGradient id="raceGaugeStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(192, 132, 252)" stopOpacity="0.9" />
                <stop offset="55%" stopColor="rgb(34, 211, 238)" stopOpacity="0.95" />
                <stop offset="100%" stopColor="rgb(52, 211, 153)" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            <path
              d="M 12 60 A 48 48 0 0 1 108 60"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M 12 60 A 48 48 0 0 1 108 60"
              fill="none"
              stroke="url(#raceGaugeStroke)"
              strokeWidth="5"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={`${t * 100} 100`}
            />
            <line
              x1={cx}
              y1={cy}
              x2={nx}
              y2={ny}
              stroke="rgba(248,250,252,0.95)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx={cx} cy={cy} r={4} fill="rgb(15,23,42)" stroke="rgba(34,211,238,0.6)" strokeWidth="1.5" />
          </svg>
          <div className="pointer-events-none absolute bottom-0 left-1/2 w-[88%] -translate-x-1/2 text-center">
            <p className="font-orbitron text-2xl font-black tabular-nums leading-none tracking-tight text-slate-50 sm:text-[1.65rem]">
              {speedKmh}
            </p>
            <p className="mt-0.5 font-rajdhani text-[9px] font-semibold uppercase tracking-[0.28em] text-cyan-200/55">km/h</p>
          </div>
        </div>
        <div className="min-w-[3.25rem] pb-0.5 text-right">
          <p className="font-rajdhani text-[9px] font-semibold uppercase tracking-[0.22em] text-[var(--text-dim)]">Gear</p>
          <p className="font-orbitron text-3xl font-black tabular-nums leading-none text-fuchsia-200 sm:text-[2.1rem]">{gear}</p>
        </div>
      </div>
    </GlassPanel>
  );
}

interface RaceHUDProps {
  snap: RacingHudSnapshot | null;
  coinsCollected: number;
  phase: "playing" | "paused";
  isMuted: boolean;
  onPauseToggle: () => void;
  onMuteToggle: () => void;
}

export function RaceHUD({ snap, coinsCollected, phase, isMuted, onPauseToggle, onMuteToggle }: RaceHUDProps) {
  const progress = snap && snap.finishDistance > 0 ? Math.min(1, snap.distance / snap.finishDistance) : 0;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <div className="absolute left-3 right-[5.5rem] top-3 z-20 sm:left-4 sm:right-36 sm:top-4">
        <GlassPanel className="shadow-lift">
          <div className="grid grid-cols-2 divide-x divide-cyan-400/15 sm:grid-cols-4">
            <div className="px-2 py-2 sm:px-3 sm:py-2.5">
              <p className="font-rajdhani text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-dim)]">Lap</p>
              <p className="font-orbitron text-lg font-bold tabular-nums text-fuchsia-100 sm:text-xl">
                {snap ? `${Math.min(snap.currentLap, snap.laps)}/${snap.laps}` : "—"}
              </p>
            </div>
            <div className="px-2 py-2 sm:px-3 sm:py-2.5">
              <p className="font-rajdhani text-[9px] font-semibold uppercase tracking-[0.18em] text-cyan-200/70">Lap time</p>
              <p className="font-orbitron text-lg font-bold tabular-nums text-cyan-100 sm:text-xl">
                {snap ? formatRaceTimeMs(snap.currentLapTimeMs) : "—"}
              </p>
            </div>
            <div className="hidden px-2 py-2 sm:block sm:px-3 sm:py-2.5">
              <p className="font-rajdhani text-[9px] font-semibold uppercase tracking-[0.18em] text-emerald-200/70">Best</p>
              <p className="font-orbitron text-lg font-bold tabular-nums text-emerald-100 sm:text-xl">
                {snap?.bestLapMs != null ? formatRaceTimeMs(snap.bestLapMs) : "—"}
              </p>
            </div>
            <div className="px-2 py-2 sm:px-3 sm:py-2.5">
              <p className="font-rajdhani text-[9px] font-semibold uppercase tracking-[0.18em] text-amber-200/55">Coins</p>
              <div className="flex items-center gap-1">
                <span className="text-amber-200">◆</span>
                <span className="font-orbitron text-lg font-bold tabular-nums text-amber-200 sm:text-xl">{coinsCollected}</span>
              </div>
            </div>
          </div>
          <div className="border-t border-cyan-400/10 px-3 py-2">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400"
                style={{ width: `${progress * 100}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>
            <p className="mt-1 font-rajdhani text-[9px] uppercase tracking-widest text-[var(--text-dim)]">Race progress</p>
          </div>
        </GlassPanel>
      </div>

      <div className="absolute right-3 top-3 z-20 flex items-center gap-2 sm:right-4 sm:top-4 sm:gap-2.5">
        {phase === "playing" && (
          <>
            <motion.button
              type="button"
              onClick={onPauseToggle}
              whileTap={{ scale: 0.92 }}
              className={cn(iconBtn, "shadow-neon-cyan")}
              title="Pause"
            >
              <IconPause className="h-4 w-4" />
            </motion.button>
            <motion.button
              type="button"
              onClick={onMuteToggle}
              whileTap={{ scale: 0.92 }}
              className={cn(iconBtn, "shadow-neon-cyan")}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <IconVolumeOff className="h-5 w-5" /> : <IconVolumeOn className="h-5 w-5" />}
            </motion.button>
          </>
        )}
      </div>

      {phase === "playing" && (
        <div className="pointer-events-none absolute bottom-3 right-3 z-20 sm:bottom-4 sm:right-4">
          <RacingSpeedCluster speedKmh={snap?.speedKmh ?? SPEEDO_MIN_KMH} gear={snap?.gear ?? 1} />
        </div>
      )}

      {phase === "playing" && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 4, duration: 1 }}
          className="pointer-events-none absolute bottom-3 left-0 right-0 z-10 text-center text-xs font-rajdhani font-semibold uppercase tracking-widest text-cyan-300/60"
        >
          ← swipe → lane | ↑ jump | ↓ brake
        </motion.div>
      )}
    </div>
  );
}
