"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    icon: "⚡",
    title: "Endless Runner",
    desc: "Survive the streets at breakneck speed. Dodge, jump, slide.",
    color: "from-cyan-500/20 to-cyan-500/5",
    border: "border-cyan-500/30",
    glow: "shadow-cyan-500/20",
  },
  {
    icon: "🏁",
    title: "Race Mode",
    desc: "Compete head-to-head globally. First to finish takes the prize.",
    color: "from-fuchsia-500/20 to-fuchsia-500/5",
    border: "border-fuchsia-500/30",
    glow: "shadow-fuchsia-500/20",
  },
  {
    icon: "🏎️",
    title: "NFT Garage",
    desc: "Own rare characters on-chain. Trade them on open markets.",
    color: "from-orange-500/20 to-orange-500/5",
    border: "border-orange-500/30",
    glow: "shadow-orange-500/20",
  },
  {
    icon: "🏆",
    title: "Leaderboard",
    desc: "Climb global rankings. Your score lives on-chain forever.",
    color: "from-yellow-500/20 to-yellow-500/5",
    border: "border-yellow-500/30",
    glow: "shadow-yellow-500/20",
  },
];

const stats = [
  { value: "50K+", label: "Active Runners", icon: "🏃" },
  { value: "$2.5M", label: "Prize Pool", icon: "💰" },
  { value: "60fps", label: "Smooth Gameplay", icon: "🎮" },
  { value: "Celo", label: "On-Chain", icon: "🔗" },
];

const perks = [
  { icon: "🔗", title: "Blockchain Verified", desc: "Every run recorded on Celo mainnet" },
  { icon: "💎", title: "True Ownership", desc: "Your characters are real NFTs you control" },
  { icon: "💰", title: "Earn While Playing", desc: "Score high, claim real crypto rewards" },
  { icon: "🌍", title: "Global Market", desc: "Buy, sell and trade on any DEX" },
];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

export function LandingHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="relative -mx-4 -mt-6 overflow-hidden sm:-mx-6 sm:-mt-8">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden">

        {/* layered background */}
        <div className="absolute inset-0 z-0 bg-[#020810]" />
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(6,182,212,0.18),transparent_65%)]" />
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_80%,rgba(168,85,247,0.12),transparent_60%)]" />
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_50%_40%_at_10%_90%,rgba(249,115,22,0.1),transparent_55%)]" />

        {/* grid */}
        <div
          className="absolute inset-0 z-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(6,182,212,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.8) 1px,transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* perspective road lines */}
        <div className="absolute bottom-0 left-0 right-0 z-0 h-[45%] overflow-hidden opacity-20">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute bottom-0 h-full w-px bg-gradient-to-t from-cyan-400 to-transparent"
              style={{ left: `${10 + i * 11.5}%`, transform: `perspective(400px) rotateX(55deg)` }}
            />
          ))}
        </div>

        {/* animated scan line */}
        <motion.div
          className="absolute left-0 right-0 z-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />

        {/* hero content */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 flex flex-col items-center px-4 text-center">

          {/* live badge */}
          <motion.div {...fade(0)} className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-cyan-400/30 bg-cyan-400/8 px-5 py-2 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            <span className="font-rajdhani text-sm font-bold uppercase tracking-widest text-cyan-300">
              Live on Celo · Web3 Ready
            </span>
          </motion.div>

          {/* title */}
          <motion.h1 {...fade(0.1)} className="font-orbitron text-[clamp(3.2rem,12vw,7.5rem)] font-black uppercase leading-[0.9] tracking-tight">
            <span className="block text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]">Dash</span>
            <span className="block bg-gradient-to-r from-cyan-300 via-sky-300 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_0_60px_rgba(6,182,212,0.5)]">
              Runner
            </span>
          </motion.h1>

          {/* tagline */}
          <motion.p {...fade(0.2)} className="mt-6 max-w-lg font-rajdhani text-xl font-semibold leading-relaxed text-white/60 sm:text-2xl">
            Run. Dodge. Earn.{" "}
            <span className="text-white/90">Own your legacy on-chain.</span>
          </motion.p>

          {/* CTAs */}
          <motion.div {...fade(0.3)} className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/play?start=1"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl border border-cyan-400/60 bg-gradient-to-br from-cyan-500/25 to-sky-600/15 px-8 py-4 font-orbitron text-base font-bold uppercase tracking-wider text-white shadow-[0_0_30px_rgba(6,182,212,0.25)] backdrop-blur transition-all duration-300 hover:border-cyan-300/80 hover:shadow-[0_0_50px_rgba(6,182,212,0.45)] hover:scale-[1.03]"
            >
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-300" />
              </span>
              Play Now
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/8 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
            </Link>

            <Link
              href="/play?mode=racing"
              className="group inline-flex items-center gap-2.5 rounded-2xl border border-fuchsia-500/40 bg-fuchsia-500/10 px-8 py-4 font-orbitron text-base font-bold uppercase tracking-wider text-fuchsia-200 backdrop-blur transition-all duration-300 hover:border-fuchsia-400/60 hover:bg-fuchsia-500/20 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-[1.03]"
            >
              🏁 Race Mode
            </Link>
          </motion.div>

          {/* hero image */}
          <motion.div
            {...fade(0.4)}
            className="relative mt-14 w-full max-w-sm sm:max-w-md"
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-cyan-500/20 via-transparent to-transparent blur-2xl" />
            <Image
              src="/hero-dash-prime.png"
              alt="DashRunner character"
              width={480}
              height={480}
              className="relative z-10 w-full drop-shadow-[0_0_60px_rgba(6,182,212,0.4)]"
              priority
            />
          </motion.div>
        </motion.div>

        {/* scroll cue */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5"
        >
          <span className="font-rajdhani text-[10px] uppercase tracking-[0.3em] text-white/30">Scroll</span>
          <div className="h-8 w-px bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────── */}
      <section className="relative z-10 border-y border-white/[0.06] bg-[#020810]/80 backdrop-blur-xl">
        <div className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-white/[0.06] sm:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              {...fadeIn(i * 0.08)}
              className="flex flex-col items-center gap-1 px-4 py-7 text-center"
            >
              <span className="text-2xl">{s.icon}</span>
              <span className="font-orbitron text-2xl font-black text-white sm:text-3xl">{s.value}</span>
              <span className="font-rajdhani text-xs font-semibold uppercase tracking-widest text-white/40">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────────────────── */}
      <section className="relative py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(6,182,212,0.05),transparent)]" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">

          <motion.div {...fadeIn()} className="mb-16 text-center">
            <p className="mb-3 font-rajdhani text-sm font-bold uppercase tracking-[0.3em] text-cyan-400">Game Modes</p>
            <h2 className="font-orbitron text-4xl font-black uppercase text-white sm:text-5xl">
              Choose Your{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
                Arena
              </span>
            </h2>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                {...fadeIn(i * 0.1)}
                whileHover={{ y: -6, scale: 1.02 }}
                className={`group relative overflow-hidden rounded-2xl border ${f.border} bg-gradient-to-br ${f.color} p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${f.glow}`}
              >
                {/* corner accent */}
                <div className="absolute right-0 top-0 h-16 w-16 overflow-hidden">
                  <div className={`absolute -right-8 -top-8 h-16 w-16 rounded-full bg-gradient-to-br ${f.color} blur-xl`} />
                </div>

                <div className="relative z-10">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-2xl backdrop-blur">
                    {f.icon}
                  </div>
                  <h3 className="font-orbitron text-base font-bold text-white">{f.title}</h3>
                  <p className="mt-2 font-rajdhani text-sm leading-relaxed text-white/55">{f.desc}</p>
                </div>

                {/* hover shimmer */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WEB3 SPLIT ───────────────────────────────────────────────────── */}
      <section className="relative border-t border-white/[0.06] py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_0%_50%,rgba(249,115,22,0.06),transparent)]" />
        <div className="relative mx-auto grid max-w-5xl gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">

          {/* left */}
          <motion.div {...fadeIn()}>
            <p className="mb-3 font-rajdhani text-sm font-bold uppercase tracking-[0.3em] text-orange-400">Web3 Native</p>
            <h2 className="font-orbitron text-4xl font-black uppercase leading-tight text-white sm:text-5xl">
              Own Your{" "}
              <span className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
                Digital
              </span>{" "}
              Legacy
            </h2>
            <p className="mt-5 font-rajdhani text-lg leading-relaxed text-white/55">
              Every run, every character, every achievement — permanently yours on the Celo blockchain.
            </p>

            <div className="mt-10 space-y-5">
              {perks.map((p, i) => (
                <motion.div
                  key={p.title}
                  {...fadeIn(i * 0.1)}
                  className="flex items-start gap-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg">
                    {p.icon}
                  </div>
                  <div>
                    <p className="font-rajdhani text-base font-bold text-white">{p.title}</p>
                    <p className="font-rajdhani text-sm text-white/50">{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* right — glowing card */}
          <motion.div {...fadeIn(0.15)}>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-8 backdrop-blur-sm">
              {/* glow orbs */}
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan-500/15 blur-3xl" />
              <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-fuchsia-500/15 blur-3xl" />

              <div className="relative z-10 space-y-6">
                <div>
                  <p className="font-rajdhani text-sm uppercase tracking-widest text-white/40">Total NFT Characters</p>
                  <p className="mt-1 font-orbitron text-5xl font-black text-white">1,000<span className="text-cyan-400">+</span></p>
                </div>

                <div className="h-px bg-gradient-to-r from-cyan-400/40 via-fuchsia-400/20 to-transparent" />

                <p className="font-rajdhani text-base leading-relaxed text-white/60">
                  Unique, tradeable runner characters. Each one is a real NFT — earn more by playing, sell on open markets, flex your rarest finds.
                </p>

                <div className="flex flex-wrap gap-2">
                  {["ERC-721", "Celo Chain", "USDC Rewards", "Open Market"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-rajdhani text-xs font-semibold uppercase tracking-wider text-white/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <Link
                  href="/characters"
                  className="inline-flex items-center gap-2 font-rajdhani text-sm font-bold uppercase tracking-widest text-cyan-400 transition hover:text-cyan-300"
                >
                  Browse Characters
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/[0.06] py-32">
        {/* bg */}
        <div className="absolute inset-0 bg-[#020810]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_50%,rgba(6,182,212,0.12),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_20%_80%,rgba(168,85,247,0.1),transparent_55%)]" />

        {/* grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(6,182,212,1) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,1) 1px,transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <motion.div {...fadeIn()}>
            <p className="mb-4 font-rajdhani text-sm font-bold uppercase tracking-[0.3em] text-cyan-400">
              Ready to Run?
            </p>
            <h2 className="font-orbitron text-5xl font-black uppercase leading-tight text-white sm:text-6xl">
              Start Your{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-fuchsia-400 bg-clip-text text-transparent">
                Legend
              </span>
            </h2>
            <p className="mt-5 font-rajdhani text-xl text-white/50">
              Join 50,000+ runners. Compete. Earn. Own.
            </p>

            <motion.div
              {...fadeIn(0.15)}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                href="/play?start=1"
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl border border-cyan-400/60 bg-gradient-to-br from-cyan-500/30 to-sky-600/20 px-10 py-5 font-orbitron text-lg font-bold uppercase tracking-wider text-white shadow-[0_0_40px_rgba(6,182,212,0.3)] backdrop-blur transition-all duration-300 hover:shadow-[0_0_70px_rgba(6,182,212,0.5)] hover:scale-[1.04]"
              >
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-300" />
                </span>
                Enter The Race
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              </Link>

              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-8 py-5 font-orbitron text-base font-bold uppercase tracking-wider text-white/70 backdrop-blur transition-all duration-300 hover:border-white/25 hover:bg-white/10 hover:text-white"
              >
                Browse Shop
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
