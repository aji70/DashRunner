"use client";

import Link from "next/link";
import { motion } from "framer-motion";

function RacingStripes() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-full w-2 bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent"
          style={{ left: `${(i + 1) * 25}%` }}
          animate={{ y: [0, 100] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
}

const racingModes = [
  { label: "Endless Runner", desc: "Survive the streets", icon: "🏃" },
  { label: "Race Mode", desc: "Compete & Earn", icon: "🏁" },
  { label: "NFT Garage", desc: "Collect rare cars", icon: "🏎️" },
  { label: "Leaderboard", desc: "Global rankings", icon: "🏆" },
];

const statsData = [
  { number: "50K+", label: "Active Racers" },
  { number: "$2.5M", label: "Prize Pool" },
  { number: "Web3", label: "Verified" },
];

export function LandingHero() {
  return (
    <div className="relative space-y-0 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden bg-black">
        {/* Background with gradient and animated stripes */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-black to-black" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.15),rgba(6,182,212,0))]" />
          <RacingStripes />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(0deg, transparent 24%, rgba(6, 182, 212, 0.3) 25%, rgba(6, 182, 212, 0.3) 26%, transparent 27%, transparent 74%, rgba(6, 182, 212, 0.3) 75%, rgba(6, 182, 212, 0.3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(6, 182, 212, 0.3) 25%, rgba(6, 182, 212, 0.3) 26%, transparent 27%, transparent 74%, rgba(6, 182, 212, 0.3) 75%, rgba(6, 182, 212, 0.3) 76%, transparent 77%, transparent)",
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center">
          {/* Top badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 backdrop-blur"
          >
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-rajdhani text-sm font-bold uppercase text-cyan-300">
              Live Racing • Web3 Ready
            </span>
          </motion.div>

          {/* Main title */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="max-w-4xl font-orbitron text-6xl font-black uppercase leading-tight sm:text-7xl md:text-8xl"
          >
            <span className="block text-white">Race</span>
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
              The Speed
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 max-w-xl font-rajdhani text-lg text-white/70 sm:text-xl"
          >
            Compete globally. Earn crypto. Own your cars. Pure Web3 racing.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center"
          >
            <Link
              href="/play?start=1"
              className="group relative inline-flex items-center justify-center rounded-xl border-2 border-cyan-400 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 px-8 py-4 font-orbitron text-lg font-bold uppercase text-cyan-300 transition hover:from-cyan-600/40 hover:to-blue-600/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]"
            >
              <span className="relative z-10">▶ Play Now</span>
            </Link>
            <Link
              href="/play?mode=racing"
              className="group relative inline-flex items-center justify-center rounded-xl border-2 border-white/30 bg-white/5 px-8 py-4 font-orbitron text-lg font-bold uppercase text-white transition backdrop-blur hover:bg-white/10 hover:border-white/50"
            >
              <span className="relative z-10">🏎️ Race Mode</span>
            </Link>
          </motion.div>

          {/* Floating stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 grid gap-8 sm:grid-cols-3"
          >
            {statsData.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-orbitron text-3xl font-bold text-cyan-400">
                  {stat.number}
                </div>
                <div className="mt-2 font-rajdhani text-sm uppercase text-white/60">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center"
        >
          <span className="font-rajdhani text-xs uppercase text-white/50">Scroll</span>
          <svg className="mt-2 h-5 w-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </section>

      {/* Racing Modes Section */}
      <section className="relative border-t border-cyan-500/20 bg-gradient-to-b from-black via-slate-950 to-black py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center font-orbitron text-4xl font-black uppercase text-white sm:text-5xl"
          >
            Choose Your Race
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {racingModes.map((mode, i) => (
              <motion.div
                key={mode.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group relative overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/50 to-black/50 p-6 backdrop-blur transition hover:border-cyan-400/60"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent opacity-0 transition group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="text-4xl">{mode.icon}</div>
                  <h3 className="mt-4 font-orbitron text-lg font-bold text-white">
                    {mode.label}
                  </h3>
                  <p className="mt-2 font-rajdhani text-sm text-white/60">{mode.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Web3 Features Section */}
      <section className="relative border-t border-cyan-500/20 bg-black py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 sm:grid-cols-2">
            {/* Left side - Features */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="font-orbitron text-3xl font-black uppercase text-white">
                Own Your{" "}
                <span className="text-cyan-400">Digital Assets</span>
              </h2>
              <div className="mt-8 space-y-6">
                {[
                  { icon: "🔗", title: "Blockchain Verified", desc: "All cars are NFTs on-chain" },
                  { icon: "💰", title: "Real Rewards", desc: "Earn crypto while racing" },
                  { icon: "🛡️", title: "True Ownership", desc: "You control your assets" },
                  { icon: "🌍", title: "Global Market", desc: "Trade on any DEX" },
                ].map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="flex gap-4"
                  >
                    <div className="text-2xl">{feature.icon}</div>
                    <div>
                      <h3 className="font-rajdhani font-bold text-white">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-white/60">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right side - Stats Box */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col justify-center"
            >
              <div className="space-y-4 rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-8 backdrop-blur">
                <div className="flex items-baseline gap-3">
                  <span className="font-orbitron text-4xl font-black text-cyan-400">
                    1000+
                  </span>
                  <span className="font-rajdhani text-sm uppercase text-white/70">
                    NFT Cars
                  </span>
                </div>

                <div className="h-1 w-24 bg-gradient-to-r from-cyan-400 to-transparent" />

                <div>
                  <p className="font-rajdhani text-sm leading-relaxed text-white/80">
                    Unique, tradeable NFT cars. Earn more by racing. Sell on open markets. Your assets, your rules.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <span className="rounded-full bg-cyan-500/20 px-3 py-1 font-rajdhani text-xs text-cyan-300">
                    ERC-721
                  </span>
                  <span className="rounded-full bg-blue-500/20 px-3 py-1 font-rajdhani text-xs text-blue-300">
                    Celo Chain
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative border-t border-cyan-500/20 bg-gradient-to-b from-black to-slate-950 py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-orbitron text-4xl font-black uppercase text-white sm:text-5xl">
              Ready to{" "}
              <span className="text-cyan-400">Dominate</span>?
            </h2>
            <p className="mt-4 font-rajdhani text-lg text-white/70">
              Join thousands of racers. Compete. Earn. Own.
            </p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="mt-8"
            >
              <Link
                href="/play?start=1"
                className="inline-flex items-center justify-center rounded-xl border-2 border-cyan-400 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 px-12 py-5 font-orbitron text-xl font-bold uppercase text-cyan-300 transition hover:from-cyan-600/50 hover:to-blue-600/50 hover:shadow-[0_0_40px_rgba(6,182,212,0.5)]"
              >
                Enter The Race
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
