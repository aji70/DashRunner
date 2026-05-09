"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay, ease: "easeOut" as const },
});

const scaleIn = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.65, delay, ease: "easeOut" as const },
});

function Web3Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 font-rajdhani text-[11px] font-semibold uppercase tracking-wider text-white/70 backdrop-blur-sm">
      {children}
    </span>
  );
}

function HUDRing({ delay, size = "md" }: { delay: number; size?: "sm" | "md" | "lg" }) {
  const sizeMap = { sm: "w-24 h-24", md: "w-40 h-40", lg: "w-56 h-56" };
  return (
    <motion.div
      {...scaleIn(delay)}
      className={`absolute ${sizeMap[size]} rounded-full border-2 border-cyan-400/20 pointer-events-none`}
    />
  );
}

export function LandingHero() {
  return (
    <div className="relative -mx-4 -mt-6 overflow-hidden sm:-mx-6 sm:-mt-8">
      {/* deep dark background */}
      <div className="absolute inset-0 z-0 bg-[#0a0e27]" />

      {/* neon gradient accents */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_0%,rgba(6,182,212,0.25),transparent_50%)]" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_100%,rgba(249,115,22,0.15),transparent_55%)]" />

      {/* side accent glows */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_40%_at_10%_50%,rgba(168,85,247,0.12),transparent_50%)]" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_40%_at_90%_50%,rgba(249,115,22,0.12),transparent_50%)]" />

      {/* neon grid */}
      <div
        className="absolute inset-0 z-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(6,182,212,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.8) 1px,transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* speed lines - horizontal motion */}
      <div className="absolute top-1/3 left-0 right-0 z-0 h-px overflow-hidden opacity-40">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`speedline-h-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent"
            style={{ top: `${i * 15}px`, width: "100%" }}
            animate={{ x: [-1000, 1000] }}
            transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>

      {/* perspective road lines */}
      <div className="absolute bottom-0 left-0 right-0 z-0 h-[35%] overflow-hidden opacity-15">
        {[...Array(8)].map((_, i) => (
          <div
            key={`roadline-${i}`}
            className="absolute bottom-0 h-full w-px bg-gradient-to-t from-cyan-300 via-cyan-400 to-transparent"
            style={{ left: `${10 + i * 11.5}%`, transform: `perspective(420px) rotateX(55deg)` }}
          />
        ))}
      </div>

      {/* scan line */}
      <motion.div
        className="absolute left-0 right-0 z-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent"
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />

      <section className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        {/* HUD decorative rings around central area */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <HUDRing delay={0.1} size="lg" />
          <HUDRing delay={0.2} size="md" />
          <HUDRing delay={0.3} size="sm" />
        </div>

        {/* top badge */}
        <motion.div {...fadeUp(0.05)} className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-6 py-3 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-300" />
          </span>
          <span className="font-rajdhani text-xs font-bold uppercase tracking-widest text-cyan-300">
            🏁 Next-Gen Racing
          </span>
        </motion.div>

        {/* main title - aggressive racing style */}
        <motion.h1
          {...fadeUp(0.12)}
          className="font-orbitron text-[clamp(3rem,10vw,7rem)] font-black uppercase leading-[0.85] tracking-tighter drop-shadow-[0_0_80px_rgba(6,182,212,0.3)]"
        >
          <span className="block text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text">
            DASH RUNNER
          </span>
        </motion.h1>

        {/* subtitle */}
        <motion.p {...fadeUp(0.2)} className="mt-6 max-w-2xl font-rajdhani text-sm sm:text-base font-semibold leading-relaxed text-white/70 tracking-wide">
          Race. Dodge. Survive. Score forever on-chain.
        </motion.p>

        {/* gameplay features */}
        <motion.div {...fadeUp(0.28)} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Web3Chip>⚡ High-Speed Dodging</Web3Chip>
          <Web3Chip>🔗 On-Chain Scoring</Web3Chip>
          <Web3Chip>💎 Collect NFTs</Web3Chip>
        </motion.div>

        {/* central car showcase with cinematic layout */}
        <motion.div {...scaleIn(0.35)} className="mt-12 w-full max-w-6xl px-4">
          <div className="relative">
            {/* car container with motion blur effect */}
            <div className="relative flex items-center justify-center py-12">
              {/* holographic overlay glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-cyan-500/20 via-transparent to-orange-500/10 blur-3xl opacity-60" />
              <div className="absolute -inset-20 rounded-full bg-cyan-500/15 blur-3xl opacity-40 animate-pulse" />
              <div className="absolute -inset-32 rounded-full bg-orange-500/10 blur-3xl opacity-30 animate-pulse" style={{ animationDelay: "0.5s" }} />

              <div className="relative z-10">
                <Image
                  src="/hero-dash-prime.png"
                  alt="Futuristic Race Car"
                  width={400}
                  height={300}
                  className="w-[280px] sm:w-[380px] md:w-[480px] drop-shadow-[0_0_100px_rgba(6,182,212,0.4)] drop-shadow-[0_20px_40px_rgba(249,115,22,0.2)] animate-float"
                  priority
                  style={{
                    animation: "float 3s ease-in-out infinite",
                    filter: "drop-shadow(0 0 40px rgba(6,182,212,0.5))",
                  }}
                />
              </div>
            </div>

            {/* CTA buttons - neon glowing style */}
            <motion.div {...fadeUp(0.45)} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/play?start=1"
                className="group relative px-10 py-5 rounded-2xl font-orbitron font-bold uppercase tracking-wider text-white text-lg overflow-hidden border-2 border-cyan-400 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 shadow-[0_0_40px_rgba(6,182,212,0.4),inset_0_0_40px_rgba(6,182,212,0.1)] transition-all duration-300 hover:shadow-[0_0_80px_rgba(6,182,212,0.6),inset_0_0_60px_rgba(6,182,212,0.2)] hover:scale-110 hover:border-cyan-300"
              >
                <span className="relative z-10 flex items-center gap-3">
                  ⚡ Play Now
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-500 group-hover:translate-x-full" />
              </Link>

              <Link
                href="#connect-wallet"
                className="group relative px-10 py-5 rounded-2xl font-orbitron font-bold uppercase tracking-wider text-white text-lg overflow-hidden border-2 border-orange-400 bg-gradient-to-r from-orange-500/20 to-amber-600/20 shadow-[0_0_40px_rgba(249,115,22,0.4),inset_0_0_40px_rgba(249,115,22,0.1)] transition-all duration-300 hover:shadow-[0_0_80px_rgba(249,115,22,0.6),inset_0_0_60px_rgba(249,115,22,0.2)] hover:scale-110 hover:border-orange-300"
              >
                <span className="relative z-10 flex items-center gap-3">
                  🔗 Connect Wallet
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-500 group-hover:translate-x-full" />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* crypto & features grid */}
        <motion.div
          {...fadeUp(0.52)}
          className="mt-14 flex flex-wrap items-center justify-center gap-4"
        >
          <Web3Chip>💰 Celo Chain</Web3Chip>
          <Web3Chip>🏆 Live Leaderboards</Web3Chip>
          <Web3Chip>💎 Rare NFTs</Web3Chip>
          <Web3Chip>⚡ 60fps Racing</Web3Chip>
        </motion.div>

        {/* bottom hint */}
        <motion.div
          className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="font-rajdhani text-[10px] uppercase tracking-[0.3em] text-white/30">Scroll</span>
          <div className="h-7 w-px bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </section>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
}

