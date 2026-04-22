"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

const features = ["High score", "Collect coins", "Unlock runners", "Neon city upgrades"] as const;

const quickLinks = [
  { href: "/characters", label: "Runners" },
  { href: "/shop", label: "Shop" },
  { href: "/rewards", label: "Rewards" },
] as const;

function FeaturePill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 py-1",
        "font-rajdhani text-[10px] font-semibold uppercase tracking-wider text-white/55"
      )}
    >
      {children}
    </span>
  );
}

export function LandingHero() {
  return (
    <div
      className="relative -mx-4 -mt-2 w-[calc(100%+2rem)] sm:-mx-6 sm:mt-0 sm:w-[calc(100%+3rem)]"
      id="top"
    >
      <div className="from-void/98 via-[#0c0c0e]/90 to-void/60 bg-gradient-to-b pb-8 sm:pb-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid gap-8 pt-2 lg:grid-cols-2 lg:items-center lg:gap-10 lg:pt-4">
            <div className="order-2 text-center lg:order-1 lg:text-left">
              <p className="font-rajdhani text-[10px] font-bold uppercase tracking-[0.4em] text-cyan-400/80 sm:text-[11px]">
                Endless · Street racing
              </p>
              <h1 className="mt-2 font-orbitron text-4xl font-black uppercase leading-[0.95] tracking-[0.06em] sm:text-5xl md:text-6xl">
                <span className="bg-gradient-to-r from-rose-200 via-amber-100 to-cyan-200 bg-clip-text text-transparent">
                  Dash
                </span>
                <span className="text-white/95">Runner</span>
              </h1>
              <p className="mx-auto mt-3 max-w-md font-rajdhani text-base leading-snug text-[var(--text-secondary)] sm:text-lg lg:mx-0">
                Dash through the neon city. Never stop running.
              </p>

              <div className="mx-auto mt-2 flex max-w-md flex-wrap justify-center gap-2 sm:mt-3 lg:mx-0 lg:justify-start">
                {features.map((f) => (
                  <FeaturePill key={f}>{f}</FeaturePill>
                ))}
              </div>

              <div className="mx-auto mt-7 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center lg:mx-0 lg:mt-8 lg:max-w-lg lg:justify-start">
                <Link
                  href="/play"
                  className="inline-flex min-h-[2.9rem] flex-1 items-center justify-center rounded-xl border border-rose-400/40 bg-gradient-to-r from-rose-600 to-violet-900/90 py-3 font-orbitron text-sm font-bold uppercase tracking-[0.16em] text-white shadow-lg shadow-rose-900/30 transition hover:brightness-110 active:scale-[0.99] sm:flex-initial sm:px-8 sm:text-base"
                >
                  Play endless
                </Link>
                <Link
                  href="/play?mode=racing"
                  className="inline-flex min-h-[2.9rem] flex-1 items-center justify-center rounded-xl border border-amber-400/35 bg-white/[0.04] py-3 font-orbitron text-sm font-bold uppercase tracking-[0.12em] text-amber-50/95 transition hover:border-amber-300/50 hover:bg-white/[0.07] active:scale-[0.99] sm:flex-initial sm:px-6 sm:text-base"
                >
                  Race (beta)
                </Link>
              </div>

              <nav
                className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-white/40 lg:justify-start"
                aria-label="Quick links"
              >
                {quickLinks.map((q) => (
                  <Link
                    key={q.href}
                    href={q.href}
                    className="font-rajdhani font-semibold uppercase tracking-wide text-white/45 transition hover:text-cyan-300/90"
                  >
                    {q.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="order-1 lg:order-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative"
              >
                <div
                  className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                  style={{
                    boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset, 0 32px 80px -12px rgba(0,0,0,0.65)",
                  }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/50 via-transparent to-black/20"
                    aria-hidden
                  />
                  <Image
                    src="/hero-dash-prime.png"
                    alt="Neon city sprint — high-speed run through a futuristic street"
                    width={1920}
                    height={1080}
                    className="h-full w-full object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />

                  <div className="absolute left-2.5 top-2.5 z-[2] sm:left-3 sm:top-3">
                    <p className="font-rajdhani text-[8px] font-bold uppercase tracking-[0.2em] text-white/50">
                      Dash prime
                    </p>
                  </div>

                  <div className="absolute right-2.5 top-2.5 z-[2] flex items-center gap-1.5 rounded bg-black/55 px-2 py-1.5 text-right backdrop-blur sm:right-3 sm:top-3 sm:px-2.5">
                    <p className="font-rajdhani text-[8px] uppercase text-white/45">Score</p>
                    <p className="font-rajdhani text-sm font-bold tabular-nums text-white sm:text-base">
                      428,900
                    </p>
                  </div>
                  <div className="absolute left-2.5 top-1/2 z-[2] -translate-y-1/2 sm:left-3">
                    <div className="flex items-center gap-1 rounded bg-black/55 px-2 py-1.5 text-amber-200/90 backdrop-blur sm:px-2.5">
                      <span className="text-cyan-300" aria-hidden>
                        ◆
                      </span>
                      <span className="font-rajdhani text-sm font-bold tabular-nums">1,240</span>
                    </div>
                  </div>

                  <p className="absolute bottom-2.5 left-0 right-0 z-[2] text-center font-rajdhani text-[9px] text-white/35 sm:bottom-3 sm:text-[10px]">
                    <span className="text-white/50">← →</span> lanes · <span className="text-white/50">↑</span> jump ·{" "}
                    <span className="text-white/50">↓</span> brake
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          <p className="mt-10 text-center font-rajdhani text-[10px] font-medium uppercase tracking-[0.35em] text-white/30">
            Built for browser — instant play
          </p>
        </div>
      </div>
    </div>
  );
}
