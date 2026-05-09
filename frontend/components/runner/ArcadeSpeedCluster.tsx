"use client";

import { useId } from "react";

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
    <div
      className="flex items-end gap-3 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3 rounded-lg"
      style={{
        backgroundColor: "rgba(5, 8, 25, 0.85)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(0, 229, 204, 0.2)",
      }}
    >
      <div className="relative h-[76px] w-[124px] shrink-0 sm:h-[84px] sm:w-[132px]">
        <svg viewBox="0 0 120 68" className="h-full w-full overflow-visible" aria-hidden>
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00E5CC" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#00E5CC" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          {/* Background arc */}
          <path
            d="M 12 60 A 48 48 0 0 1 108 60"
            fill="none"
            stroke="rgba(0, 229, 204, 0.2)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Filled arc - teal */}
          <path
            d="M 12 60 A 48 48 0 0 1 108 60"
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="5"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${t * 100} 100`}
          />
          {/* Needle - white */}
          <line
            x1={cx}
            y1={cy}
            x2={nx}
            y2={ny}
            stroke="rgba(255, 255, 255, 0.95)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Center circle */}
          <circle cx={cx} cy={cy} r={4} fill="#0a0a1a" stroke="#00E5CC" strokeWidth="1.5" />
        </svg>
        <div className="pointer-events-none absolute bottom-0 left-1/2 w-[88%] -translate-x-1/2 text-center">
          <p className="font-orbitron text-2xl font-black tabular-nums leading-none tracking-tight sm:text-[1.65rem]" style={{ color: "#00E5CC" }}>
            {speedKmh}
          </p>
          <p className="mt-0.5 font-inter text-[9px] font-semibold uppercase tracking-[0.28em] text-white/50">km/h</p>
        </div>
      </div>
      <div className="min-w-[3.25rem] pb-0.5 text-right">
        <p className="font-inter text-[9px] font-semibold uppercase tracking-[0.22em] text-white/50">Gear</p>
        <p className="font-orbitron text-3xl font-black tabular-nums leading-none sm:text-[2.1rem]" style={{ color: "#00E5CC" }}>
          {gear}
        </p>
      </div>
    </div>
  );
}
