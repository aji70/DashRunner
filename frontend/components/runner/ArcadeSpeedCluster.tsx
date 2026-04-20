"use client";

import { useId } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";

const SPEEDO_MIN_KMH = 35;
const SPEEDO_MAX_KMH = 240;

export function ArcadeSpeedCluster({ speedKmh, gear }: { speedKmh: number; gear: number }) {
  const gradId = useId().replace(/:/g, "");
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
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
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
              stroke={`url(#${gradId})`}
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
