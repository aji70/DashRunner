"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

const gameModes = [
  {
    icon: "🏁",
    label: "Quick Race",
    subtitle: "Jump in & race now",
    href: "/play?mode=quick",
  },
  {
    icon: "🗺️",
    label: "Story Mode",
    subtitle: "Follow the campaign",
    href: "/play?mode=story",
  },
  {
    icon: "🏆",
    label: "Leaderboard",
    subtitle: "Top racers on-chain",
    href: "/leaderboard",
  },
  {
    icon: "🚗",
    label: "My Garage",
    subtitle: "Your cars & upgrades",
    href: "/characters",
  },
  {
    icon: "🏙️",
    label: "The City",
    subtitle: "Explore the open world",
    href: "/city",
  },
  {
    icon: "🛒",
    label: "Shop",
    subtitle: "Gear, NFTs & boosts",
    href: "/shop",
  },
];

function GameModeCard({ mode, isLocked, mounted }: { mode: (typeof gameModes)[0]; isLocked: boolean; mounted: boolean }) {
  return (
    <motion.div
      whileHover={!isLocked ? { scale: 1.05 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
      className="flex-shrink-0 scroll-snap-align-start"
      style={{
        scrollSnapAlign: "start",
      }}
    >
      <Link href={isLocked ? "#" : mode.href}>
        <div
          className="relative w-44 h-28 flex flex-col items-center justify-center gap-2 transition-all duration-200 cursor-pointer group"
          style={{
            backgroundColor: "rgba(5, 8, 25, 0.85)",
            border: "1px solid rgba(0, 229, 204, 0.25)",
            clipPath: "polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)",
            boxShadow: "none",
          }}
          onMouseEnter={(e) => {
            if (!isLocked) {
              e.currentTarget.style.backgroundColor = "rgba(0, 229, 204, 0.12)";
              e.currentTarget.style.borderColor = "rgba(0, 229, 204, 0.7)";
              e.currentTarget.style.boxShadow = "0 -3px 16px rgba(0, 229, 204, 0.35)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isLocked) {
              e.currentTarget.style.backgroundColor = "rgba(5, 8, 25, 0.85)";
              e.currentTarget.style.borderColor = "rgba(0, 229, 204, 0.25)";
              e.currentTarget.style.boxShadow = "none";
            }
          }}
        >
          <span className="text-3xl" style={{ color: mounted && isLocked ? "rgba(0,229,204,0.3)" : "#00E5CC" }}>
            {mode.icon}
          </span>
          <span
            className="text-xs font-inter font-bold uppercase tracking-wider text-center"
            style={{ color: mounted && isLocked ? "rgba(255,255,255,0.2)" : "white" }}
          >
            {mode.label}
          </span>
          <span
            className="text-[10px] font-inter text-center leading-tight"
            style={{
              color: mounted && isLocked ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.45)",
            }}
          >
            {mode.subtitle}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export function LandingHero() {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative w-full min-h-screen overflow-hidden -mx-4 -mt-6 sm:-mx-6 sm:-mt-8 pb-12">
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
      <section className="relative z-10 w-full h-screen flex flex-col items-center justify-center px-4 text-center">
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

          <button
            onClick={openConnectModal}
            className="relative px-10 py-4 rounded-lg font-inter font-bold uppercase tracking-wider text-cyan-300 border-2 border-cyan-500 hover:border-cyan-400 hover:text-cyan-200 transition-colors duration-200 -skew-x-2 bg-transparent hover:bg-cyan-500/10 cursor-pointer"
          >
            <span className="block skew-x-2">Connect Wallet</span>
          </button>
        </motion.div>
      </section>

      {/* Game Modes Row - scrollable */}
      <motion.div
        {...fadeUp(0.5)}
        className="relative z-10 px-4 sm:px-6 py-8"
      >
        {/* Locked overlay */}
        {mounted && !isConnected && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="font-inter text-lg font-semibold tracking-wider" style={{ color: "#00E5CC" }}>
                🔗 Connect wallet to access game modes
              </p>
            </div>
          </div>
        )}

        {/* Cards container */}
        <div
          className="mx-auto max-w-7xl"
          style={{
            filter: mounted && !isConnected ? "blur(4px)" : "none",
            opacity: mounted && !isConnected ? 0.4 : 1,
            pointerEvents: mounted && !isConnected ? "none" : "auto",
            transition: "filter 0.3s ease, opacity 0.3s ease",
          }}
        >
          <div
            className="flex gap-3 overflow-x-auto px-4 py-4"
            style={{
              scrollSnapType: "x mandatory",
              scrollBehavior: "smooth",
            }}
          >
            {gameModes.map((mode, idx) => (
              <motion.div
                key={mode.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + idx * 0.05 }}
              >
                <GameModeCard mode={mode} isLocked={!isConnected} mounted={mounted} />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');

        .font-bebas {
          font-family: 'Bebas Neue', cursive;
        }

        .font-inter {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* Hide scrollbar */
        div[style*="scrollSnapType"] {
          scrollbar-width: none;
        }

        div[style*="scrollSnapType"]::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
