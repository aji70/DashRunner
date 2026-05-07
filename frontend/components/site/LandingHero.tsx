"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

const features = ["High score", "Collect coins", "Unlock runners", "Neon city upgrades"] as const;

const quickLinks = [
  { href: "/characters", label: "Runners" },
  { href: "/shop", label: "Shop" },
  { href: "/rewards", label: "Rewards" },
] as const;

const gameFeatures = [
  { icon: "🏃", title: "Endless Running", desc: "Test your reflexes with infinite challenges" },
  { icon: "🏎️", title: "Racing Mode", desc: "Compete in real-time street races" },
  { icon: "💎", title: "Collect & Earn", desc: "Gather coins to unlock premium items" },
  { icon: "🎨", title: "Customization", desc: "Personalize your runner and city" },
] as const;

function FeaturePill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "rounded-md border border-white/[0.1] bg-black/35 px-2.5 py-1 backdrop-blur-sm",
        "font-rajdhani text-[10px] font-semibold uppercase tracking-wider text-white/75"
      )}
    >
      {children}
    </span>
  );
}

function ControlsHint() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4 }}
      className="pointer-events-none absolute bottom-12 left-0 right-0 z-[1] hidden text-center sm:block"
    >
      <p className="font-rajdhani text-[9px] text-white/40 sm:text-[10px]">
        <span className="text-white/55">← →</span> lanes · <span className="text-white/55">↑</span> jump ·{" "}
        <span className="text-white/55">↓</span> brake
      </p>
    </motion.div>
  );
}

export function LandingHero() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="relative space-y-0" id="top">
      {/* Hero Section */}
      <section
        aria-label="DashRunner"
        className="relative min-h-[min(78dvh,680px)] overflow-hidden bg-void bg-cover bg-center bg-no-repeat sm:min-h-[min(85dvh,820px)]"
        style={{ backgroundImage: "url(/hero-dash-prime.png)" }}
      >
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-[#0c0c0e]/88 via-[#0c0c0e]/35 to-[#0c0c0e]/90"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 z-0 hidden bg-gradient-to-r from-[#0c0c0e]/92 via-[#0c0c0e]/50 to-[#0c0c0e]/15 md:block"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_0%,rgba(0,0,0,0.1),rgba(0,0,0,0.5))] md:opacity-90"
          aria-hidden
        />

        {/* Corner badges */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="pointer-events-none absolute left-2.5 top-3 z-[1] hidden sm:left-4 sm:top-4 sm:block"
        >
          <p className="font-rajdhani text-[8px] font-bold uppercase tracking-[0.2em] text-white/50 sm:text-[9px]">
            Dash prime
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="pointer-events-none absolute right-2.5 top-2.5 z-[1] hidden items-center gap-1.5 rounded border border-white/5 bg-black/45 px-2.5 py-1.5 text-right backdrop-blur sm:right-4 sm:top-3.5 sm:flex sm:px-3"
        >
          <p className="font-rajdhani text-[8px] uppercase text-white/50">Score</p>
          <p className="font-rajdhani text-sm font-bold tabular-nums text-white sm:text-base">428,900</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="pointer-events-none absolute left-2.5 top-[40%] z-[1] hidden -translate-y-1/2 sm:left-4 lg:block"
        >
          <div className="flex items-center gap-1 rounded border border-white/5 bg-black/45 px-2.5 py-1.5 text-amber-100/95 backdrop-blur sm:px-3">
            <span className="text-cyan-300" aria-hidden>
              ◆
            </span>
            <span className="font-rajdhani text-sm font-bold tabular-nums">1,240</span>
          </div>
        </motion.div>

        <ControlsHint />

        <div className="relative z-10 flex min-h-[min(78dvh,680px)] flex-col justify-center px-4 pb-14 pt-20 sm:min-h-[min(85dvh,820px)] sm:px-6 sm:pb-20 sm:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto w-full max-w-5xl text-center md:text-left"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="font-rajdhani text-[10px] font-bold uppercase tracking-[0.4em] text-cyan-200/80 sm:text-[11px]"
            >
              Endless · Street racing
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-2 font-orbitron text-4xl font-black uppercase leading-[0.95] tracking-[0.06em] drop-shadow-[0_2px_24px_rgba(0,0,0,0.6)] sm:text-5xl md:text-6xl"
            >
              <span className="bg-gradient-to-r from-rose-200 via-amber-100 to-cyan-200 bg-clip-text text-transparent">
                Dash
              </span>
              <span className="text-white/95">Runner</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="mx-auto mt-3 max-w-md font-rajdhani text-base leading-snug text-white/80 drop-shadow sm:text-lg md:mx-0"
            >
              Dash through the neon city. Never stop running.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="mx-auto mt-3 flex max-w-xl flex-wrap justify-center gap-2 sm:mt-4 md:mx-0 md:justify-start"
            >
              {features.map((f) => (
                <FeaturePill key={f}>{f}</FeaturePill>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center md:mx-0 md:mt-9 md:max-w-lg md:justify-start"
            >
              <Link
                href="/play?start=1"
                className="inline-flex min-h-[2.9rem] flex-1 items-center justify-center rounded-xl border border-rose-400/50 bg-gradient-to-r from-rose-600 to-violet-900/90 py-3 font-orbitron text-sm font-bold uppercase tracking-[0.16em] text-white shadow-lg shadow-black/40 transition hover:brightness-110 active:scale-[0.99] sm:flex-initial sm:px-8 sm:text-base"
              >
                ▶ Play endless
              </Link>
              <Link
                href="/play?mode=racing"
                className="inline-flex min-h-[2.9rem] flex-1 items-center justify-center rounded-xl border border-amber-300/30 bg-white/[0.08] py-3 font-orbitron text-sm font-bold uppercase tracking-[0.12em] text-amber-50/95 backdrop-blur transition hover:border-amber-200/40 hover:bg-white/12 active:scale-[0.99] sm:flex-initial sm:px-6 sm:text-base"
              >
                🏁 Race (beta)
              </Link>
            </motion.div>

            <motion.nav
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 md:justify-start"
              aria-label="Quick links"
            >
              {quickLinks.map((q) => (
                <Link
                  key={q.href}
                  href={q.href}
                  className="font-rajdhani text-sm font-semibold uppercase tracking-wide text-white/55 drop-shadow transition hover:text-cyan-200/95"
                >
                  {q.label}
                </Link>
              ))}
            </motion.nav>
          </motion.div>
        </div>

        <p className="absolute bottom-2 left-0 right-0 z-10 text-center font-rajdhani text-[10px] font-medium uppercase tracking-[0.35em] text-white/35 sm:bottom-3">
          Built for browser — instant play
        </p>
      </section>

      {/* Features Section */}
      <section className="relative bg-[#0a0a0c] py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center font-orbitron text-2xl font-bold uppercase text-white sm:text-3xl"
          >
            Why Play <span className="text-cyan-300">DashRunner</span>?
          </motion.h2>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {gameFeatures.map((feature) => (
              <motion.div
                key={feature.title}
                variants={item}
                className="group rounded-lg border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur transition hover:border-cyan-400/30 hover:bg-white/[0.05]"
              >
                <div className="text-3xl">{feature.icon}</div>
                <h3 className="mt-3 font-rajdhani text-sm font-bold uppercase tracking-wide text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 font-rajdhani text-xs text-white/60">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative border-t border-white/[0.06] bg-gradient-to-b from-[#0a0a0c] to-[#050506] py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="grid gap-6 sm:grid-cols-3 text-center"
          >
            {[
              { value: "60 FPS", label: "Smooth Performance" },
              { value: "∞", label: "Endless Gameplay" },
              { value: "Web3", label: "Blockchain Ready" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                viewport={{ once: true }}
              >
                <p className="font-orbitron text-2xl font-bold text-cyan-300 sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-2 font-rajdhani text-xs uppercase text-white/60 tracking-wide">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative border-t border-white/[0.06] bg-[#0a0a0c] py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="font-orbitron text-2xl font-bold uppercase text-white sm:text-3xl">
              Ready to Run?
            </h2>
            <p className="mt-3 font-rajdhani text-white/70">
              Jump in now and start your endless adventure
            </p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              viewport={{ once: true }}
              className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center"
            >
              <Link
                href="/play?start=1"
                className="inline-flex items-center justify-center rounded-lg border border-cyan-400/50 bg-cyan-500/15 px-6 py-3 font-orbitron text-sm font-bold uppercase tracking-wide text-cyan-50 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-500/25 active:scale-95"
              >
                ▶ Play Now
              </Link>
              <Link
                href="/characters"
                className="inline-flex items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.05] px-6 py-3 font-orbitron text-sm font-bold uppercase tracking-wide text-white transition hover:bg-white/10"
              >
                View Runners
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
