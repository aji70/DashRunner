"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

const neonCyan = "#00f0ff";
const neonMagenta = "#ff00aa";
const neonPurple = "#aa00ff";

const floatFeatures = [
  { label: "High Score", delay: 0, className: "left-[4%] top-[12%] md:left-[2%] md:top-[18%]" },
  { label: "Collect Coins", delay: 0.2, className: "right-[2%] top-[22%] md:right-[3%] md:top-[28%]" },
  { label: "Unlock Runners", delay: 0.4, className: "left-[6%] bottom-[28%] md:left-[4%] md:bottom-[32%]" },
  { label: "Neon City Upgrades", delay: 0.6, className: "right-[1%] bottom-[20%] md:right-[2%] md:bottom-[24%]" },
] as const;

const quickLinks = [
  { href: "/characters", label: "Runners", icon: "◎" },
  { href: "/shop", label: "Shop", icon: "◆" },
  { href: "/rewards", label: "Rewards", icon: "✦" },
] as const;

function ParticleField() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 36 }).map((_, i) => (
        <span
          key={`neon-particle-${i}`}
          className="absolute h-0.5 w-0.5 rounded-full bg-[#00f0ff] opacity-60"
          style={{
            left: `${(i * 7 + 3) % 100}%`,
            top: `${(i * 11) % 100}%`,
            boxShadow: `0 0 6px ${neonCyan}`,
            animation: `landing-drift ${8 + (i % 5)}s ease-in-out ${(i % 8) * 0.4}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function ScrollChevron() {
  return (
    <motion.a
      href="#hero-end"
      aria-label="Scroll"
      className="group flex flex-col items-center gap-2 text-[var(--text-dim)]"
      animate={{ y: [0, 5, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <span className="font-rajdhani text-[10px] font-semibold uppercase tracking-[0.35em] text-white/40 transition group-hover:text-white/60">
        Scroll
      </span>
      <svg
        className="h-5 w-5 text-[#00f0ff]/70 drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden
      >
        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.a>
  );
}

export function LandingHero() {
  return (
    <div
      className="landing-hero-bg relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 -my-8 sm:-my-10"
      id="top"
    >
      <div className="relative mx-auto max-w-5xl overflow-hidden px-4 pb-10 pt-0 sm:px-6 sm:pb-12">
        <ParticleField />

        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#ff00aa]/20 blur-[100px]" />
        <div className="pointer-events-none absolute -right-16 top-1/3 h-64 w-64 rounded-full bg-[#00f0ff]/15 blur-[90px]" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-48 w-[120%] -translate-x-1/2 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />

        <div className="relative z-[1] grid min-h-[min(92dvh,calc(100dvh-9.25rem))] gap-8 pb-4 pt-2 lg:min-h-[min(88dvh,calc(100dvh-8.5rem))] lg:grid-cols-[1fr_min(52%,32rem)] lg:items-center lg:gap-10">
          <div className="relative z-[2] text-center lg:text-left">
            <h1
              className="hero-title-cyber font-orbitron text-[clamp(2.5rem,7vw,4.75rem)] font-black leading-[0.95] tracking-[0.1em] text-white"
            >
              DASHRUNNER
            </h1>

            <p className="mt-3 font-rajdhani text-base font-semibold text-white/80 sm:text-lg">
              <span className="text-[#00f0ff]">Endless Neon Chase</span>
              <span className="mx-2 text-white/35">•</span>
              <span className="text-[#e879f9]">Arcade Street Racing</span>
            </p>
            <p className="mt-2 font-rajdhani text-sm text-[var(--text-dim)] sm:text-base">
              Dash through the neon city. Never stop running.
            </p>

            <div className="mt-7 flex max-w-lg flex-col gap-3 sm:mx-auto sm:flex-row sm:justify-center lg:mx-0 lg:max-w-none lg:justify-start">
              <Link
                href="/play"
                className="group inline-flex min-h-[3.25rem] flex-1 items-center justify-center rounded-xl border-2 px-5 font-orbitron text-sm font-black uppercase tracking-[0.2em] text-[#0a0a0a] shadow-[0_0_32px_rgba(0,240,255,0.45),inset_0_1px_0_rgba(255,255,255,0.4)] transition hover:scale-[1.02] hover:shadow-[0_0_48px_rgba(0,240,255,0.6)] active:scale-[0.99] sm:flex-initial sm:px-8 sm:text-base"
                style={{
                  background: `linear-gradient(180deg, #5ef7ff 0%, ${neonCyan} 45%, #00b8c9 100%)`,
                  borderColor: `${neonCyan}`,
                }}
              >
                <span className="drop-shadow-sm">Play endless</span>
              </Link>
              <Link
                href="/play?mode=racing"
                className="group inline-flex min-h-[3.25rem] flex-1 items-center justify-center rounded-xl border-2 px-5 font-orbitron text-sm font-black uppercase tracking-[0.18em] text-white transition hover:scale-[1.02] active:scale-[0.99] sm:flex-initial sm:px-8 sm:text-base"
                style={{
                  background: "linear-gradient(135deg, rgba(170,0,255,0.35) 0%, rgba(255,0,170,0.25) 100%)",
                  borderColor: neonMagenta,
                  boxShadow: `0 0 28px rgba(255,0,170,0.4), 0 0 60px ${neonPurple}33, inset 0 1px 0 rgba(255,255,255,0.12)`,
                }}
              >
                <span className="[text-shadow:0_0_20px_rgba(255,0,170,0.6)]">Race (beta)</span>
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:justify-start">
              {quickLinks.map((q) => (
                <Link
                  key={q.href}
                  href={q.href}
                  className="group inline-flex items-center gap-2 font-rajdhani text-xs font-bold uppercase tracking-[0.2em] text-white/50 transition hover:text-[#00f0ff] sm:text-sm"
                >
                  <span className="text-white/30 group-hover:text-[#ff00aa]">{q.icon}</span>
                  {q.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative z-[2] max-lg:max-w-md max-lg:mx-auto max-lg:w-full">
            {floatFeatures.map((f, i) => (
              <motion.span
                key={f.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: f.delay, duration: 0.5 }}
                className={cn(
                  "absolute z-20 hidden whitespace-nowrap rounded-full border border-white/10 bg-black/50 px-3 py-1.5 font-rajdhani text-[9px] font-bold uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(0,240,255,0.15)] backdrop-blur-sm sm:text-[10px] md:block",
                  i % 2 === 0 ? "text-[#a5f3fc]" : "text-[#f0abfc]",
                  f.className
                )}
              >
                {f.label}
              </motion.span>
            ))}

            <div
              className="mb-3 flex flex-wrap justify-center gap-2 md:hidden"
              role="list"
            >
              {floatFeatures.map((f) => (
                <span
                  key={`m-${f.label}`}
                  role="listitem"
                  className="rounded-full border border-white/10 bg-black/50 px-2.5 py-1 font-rajdhani text-[8px] font-bold uppercase tracking-[0.12em] text-white/80"
                >
                  {f.label}
                </span>
              ))}
            </div>

            <div className="hero-preview-frame relative aspect-video w-full overflow-hidden rounded-2xl border-2 border-[#00f0ff]/30 shadow-[0_0_0_1px_rgba(255,0,170,0.2),0_20px_60px_rgba(0,0,0,0.5),0_0_80px_rgba(170,0,255,0.15)]">
              <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/40" />
              <div className="absolute inset-0 z-[1] mix-blend-color-dodge opacity-30 [background:linear-gradient(90deg,transparent, rgba(0,240,255,0.2), transparent)]" />
              <div className="absolute inset-0 z-[1] [background:repeating-linear-gradient(0deg,transparent,transparent_3px, rgba(0,0,0,0.15)_3px, rgba(0,0,0,0.15)_4px)]" />

              <Image
                src="/hero-dash-prime.png"
                alt="Dash Prime — neon sports car racing through a cyberpunk city at night"
                width={1920}
                height={1080}
                className="h-full w-full object-cover object-center"
                priority
                sizes="(max-width: 1024px) 100vw, 32rem"
              />

              <div className="absolute right-2 top-2 z-[3] sm:right-3 sm:top-3">
                <div
                  className="rounded-lg border border-[#00f0ff]/50 bg-[#0a0a0a]/80 px-2.5 py-1.5 font-rajdhani text-[9px] shadow-[0_0_20px_rgba(0,240,255,0.25)] backdrop-blur sm:text-[10px]"
                  style={{ color: neonCyan }}
                >
                  <div className="text-[6px] font-bold uppercase tracking-[0.2em] text-white/50">High score</div>
                  <div className="font-bold tabular-nums text-sm text-white sm:text-base">428,900</div>
                </div>
              </div>

              <div className="absolute left-2 top-1/2 z-[3] -translate-y-1/2 sm:left-3">
                <div
                  className="rounded-lg border border-[#ff00aa]/40 bg-[#0a0a0a]/80 px-2.5 py-1.5 font-rajdhani text-[9px] backdrop-blur sm:text-[10px]"
                  style={{ color: "#fbcfe8" }}
                >
                  <span className="text-sm font-bold text-white">◆</span>
                  <span className="ml-1.5 font-bold text-white/90">1,240</span>
                </div>
              </div>

              <div className="absolute bottom-2 left-0 right-0 z-[3] flex justify-center gap-2 sm:bottom-3 sm:gap-3">
                {[
                  { k: "Swipe", sub: "←/→" },
                  { k: "Jump", sub: "↑" },
                  { k: "Brake", sub: "↓" },
                ].map((c) => (
                  <div
                    key={c.k}
                    className="flex min-w-[2.4rem] flex-col items-center rounded border border-white/10 bg-black/60 px-1.5 py-1 font-orbitron text-[7px] font-bold text-white/70 sm:min-w-[2.75rem] sm:px-2 sm:text-[8px]"
                    style={{ boxShadow: "0 0 12px rgba(170,0,255,0.2)" }}
                  >
                    {c.k}
                    <span className="text-[#00f0ff]">{c.sub}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-2 text-center font-rajdhani text-[9px] uppercase tracking-[0.2em] text-white/30 lg:text-left">
              16:9 · Dash Prime preview
            </p>
          </div>
        </div>

        <div
          id="hero-end"
          className="relative z-[2] mt-2 flex flex-col items-center justify-center gap-1 border-t border-white/5 pt-6 sm:mt-4"
        >
          <p className="font-rajdhani text-[10px] font-medium uppercase tracking-[0.3em] text-white/30">
            Built for browser · Instant play
          </p>
          <ScrollChevron />
        </div>
      </div>
    </div>
  );
}
