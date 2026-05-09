"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

export function LandingHero() {
  return (
    <div className="relative w-full h-screen overflow-hidden -mx-4 -mt-6 sm:-mx-6 sm:-mt-8">
      {/* Full viewport background image */}
      <Image
        src="/hero-dash-prime.png"
        alt="DashRunner Race Car"
        fill
        priority
        className="object-cover w-full h-full"
      />

      {/* Dark radial vignette overlay for text legibility */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.3)_0%,rgba(15,23,42,0.6)_50%,rgba(15,23,42,0.75)_100%)]" />

      {/* Additional dark overlay for extra contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/50 to-slate-900/60" />

      {/* Content - centered both vertically and horizontally */}
      <section className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4 text-center">
        {/* Badge */}
        <motion.div
          {...fadeUp(0.1)}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/50 bg-cyan-500/15 px-6 py-2.5 backdrop-blur-sm"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-inter text-xs font-bold uppercase tracking-widest text-cyan-300">
            Next-Gen Racing
          </span>
        </motion.div>

        {/* Main headline - bold italic condensed */}
        <motion.h1
          {...fadeUp(0.2)}
          className="font-bebas text-[clamp(4rem,14vw,9rem)] font-black italic -skew-x-12 leading-none text-white drop-shadow-[0_0_30px_rgba(0,229,204,0.5)]"
        >
          DASH RUNNER
        </motion.h1>

        {/* Tagline */}
        <motion.p
          {...fadeUp(0.3)}
          className="mt-6 max-w-xl font-inter text-lg sm:text-xl font-medium text-white/90 leading-relaxed"
        >
          Race. Dodge. Survive. Score forever on-chain.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          {...fadeUp(0.4)}
          className="mt-10 flex flex-col sm:flex-row items-center gap-6"
        >
          <Link
            href="/play?start=1"
            className="group relative px-10 py-4 rounded-lg font-inter font-bold uppercase tracking-wider text-white bg-cyan-500 hover:bg-cyan-400 transition-colors duration-200 -skew-x-2 shadow-[0_8px_16px_rgba(0,229,204,0.3)] hover:shadow-[0_12px_24px_rgba(0,229,204,0.5)]"
          >
            <span className="block skew-x-2">Play Now</span>
          </Link>

          <Link
            href="#connect-wallet"
            className="relative px-10 py-4 rounded-lg font-inter font-bold uppercase tracking-wider text-cyan-300 border-2 border-cyan-500 hover:border-cyan-400 hover:text-cyan-200 transition-colors duration-200 -skew-x-2 bg-transparent hover:bg-cyan-500/10"
          >
            <span className="block skew-x-2">Connect Wallet</span>
          </Link>
        </motion.div>
      </section>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');

        .font-bebas {
          font-family: 'Bebas Neue', cursive;
        }

        .font-inter {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
      `}</style>
    </div>
  );
}
