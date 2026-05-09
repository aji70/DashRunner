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

// Game mode cards with proper icon definitions
const gameModes = [
  {
    id: "quick-race",
    label: "Quick Race",
    subtitle: "Jump in & race now",
    href: "/play?mode=quick",
    icon: (props: any) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
      </svg>
    ),
  },
  {
    id: "story-mode",
    label: "Story Mode",
    subtitle: "Follow the campaign",
    href: "/play?mode=story",
    icon: (props: any) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <path d="M9 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4m0-18v18m0-18h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-10" />
      </svg>
    ),
  },
  {
    id: "leaderboard",
    label: "Leaderboard",
    subtitle: "Top racers on-chain",
    href: "/leaderboard",
    icon: (props: any) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <path d="M12 15v7M6 15v7M18 15v7M6 8h.01M6 4h.01M12 8h.01M12 4h.01M18 8h.01M18 4h.01" />
      </svg>
    ),
  },
  {
    id: "my-garage",
    label: "My Garage",
    subtitle: "Your cars & upgrades",
    href: "/characters",
    icon: (props: any) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <path d="M19 17h2v2h-2v-2zm0-4h2v2h-2v-2zM3 5a2 2 0 0 1 2-2h4l2-3h2l2 3h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z" />
      </svg>
    ),
  },
  {
    id: "the-city",
    label: "The City",
    subtitle: "Explore the open world",
    href: "/city",
    icon: (props: any) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: "shop",
    label: "Shop",
    subtitle: "Gear, NFTs & boosts",
    href: "/shop",
    icon: (props: any) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
];

function GameModeCard({
  mode,
  isLocked,
  mounted,
}: {
  mode: (typeof gameModes)[0];
  isLocked: boolean;
  mounted: boolean;
}) {
  const Icon = mode.icon;

  return (
    <motion.div
      whileHover={mounted && !isLocked ? { y: -4 } : {}}
      whileTap={mounted && !isLocked ? { y: -2 } : {}}
      className="flex-1 min-w-[160px]"
    >
      <Link href={isLocked ? "#" : mode.href}>
        <div
          className="relative h-[120px] flex flex-col items-center justify-center gap-1.5 transition-all duration-200 group cursor-pointer"
          style={{
            backgroundColor: mounted && !isLocked ? "rgba(5, 8, 25, 0.75)" : "rgba(5, 8, 25, 0.5)",
            border: mounted && !isLocked ? "1px solid rgba(0, 229, 204, 0.2)" : "1px solid rgba(0, 229, 204, 0.1)",
            clipPath: "polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)",
            boxShadow: "none",
          }}
          onMouseEnter={(e) => {
            if (mounted && !isLocked) {
              e.currentTarget.style.backgroundColor = "rgba(0, 229, 204, 0.1)";
              e.currentTarget.style.borderColor = "rgba(0, 229, 204, 0.6)";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(0, 229, 204, 0.2)";
            }
          }}
          onMouseLeave={(e) => {
            if (mounted && !isLocked) {
              e.currentTarget.style.backgroundColor = "rgba(5, 8, 25, 0.75)";
              e.currentTarget.style.borderColor = "1px solid rgba(0, 229, 204, 0.2)";
              e.currentTarget.style.boxShadow = "none";
            }
          }}
        >
          {/* Icon */}
          <Icon
            className="w-8 h-8"
            style={{
              color: mounted && !isLocked ? "#00E5CC" : "rgba(0, 229, 204, 0.3)",
              strokeWidth: "2.5",
            }}
          />

          {/* Label */}
          <span
            className="text-sm font-inter font-bold uppercase text-center"
            style={{
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "1.5px",
              color: mounted && !isLocked ? "white" : "rgba(255,255,255,0.3)",
            }}
          >
            {mode.label}
          </span>

          {/* Subtitle */}
          <span
            className="text-[11px] font-inter text-center leading-tight"
            style={{
              color: mounted && !isLocked ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)",
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
    <div className="relative w-full min-h-screen overflow-hidden -mx-4 -mt-6 sm:-mx-6 sm:-mt-8">
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
      <section className="relative z-10 w-full h-screen flex flex-col items-center justify-center px-4 text-center pb-20">
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

      {/* Game Modes Row - anchored to bottom like HUD */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 w-full"
        style={{
          background: "linear-gradient(to bottom, transparent, rgba(5,8,25,0.6))",
          pointerEvents: mounted && !isConnected ? "none" : "auto",
        }}
      >
        {/* Locked overlay */}
        {mounted && !isConnected && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="text-center pt-6">
              <p className="font-inter text-lg font-semibold tracking-wider" style={{ color: "#00E5CC" }}>
                🔗 Connect wallet to access game modes
              </p>
            </div>
          </div>
        )}

        {/* Cards container */}
        <div
          className="w-full flex gap-0.5 px-0"
          style={{
            filter: mounted && !isConnected ? "blur(3px)" : "none",
            opacity: mounted && !isConnected ? 0.5 : 1,
            transition: "filter 0.3s ease, opacity 0.3s ease",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
          }}
        >
          {gameModes.map((mode, idx) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + idx * 0.05 }}
              className="flex-1 min-w-[160px]"
            >
              <GameModeCard mode={mode} isLocked={!isConnected} mounted={mounted} />
            </motion.div>
          ))}
        </div>
      </div>

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
