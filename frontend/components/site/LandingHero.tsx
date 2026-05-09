"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useEffect, useState, useRef } from "react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

// Game mode cards - reordered so QUICK RACE is center
const gameModes = [
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

function CarouselCard({
  mode,
  distance,
  onClick,
}: {
  mode: (typeof gameModes)[0];
  distance: number; // 0 = center, 1 = adjacent, 2 = far
  onClick: () => void;
}) {
  const Icon = mode.icon;

  // Size tiers based on distance from center
  let cardWidth = 190;
  let cardHeight = 110;
  let iconSize = 22;
  let labelSize = 12;
  let showSubtitle = false;
  let scale = 0.85;
  let opacity = 0.5;

  if (distance === 0) {
    // Centre card
    cardWidth = 260;
    cardHeight = 140;
    iconSize = 34;
    labelSize = 16;
    showSubtitle = true;
    scale = 1;
    opacity = 1;
  } else if (distance === 1) {
    // Adjacent cards (±1)
    cardWidth = 220;
    cardHeight = 120;
    iconSize = 26;
    labelSize = 13;
    showSubtitle = false;
    scale = 0.85;
    opacity = 0.5;
  }
  // distance === 2: far cards - use defaults above

  return (
    <motion.div
      animate={{
        scale: scale,
        opacity: opacity,
      }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={onClick}
      className="flex-shrink-0 cursor-pointer"
    >
      <div
        className="relative flex flex-col items-center justify-center gap-1.5 transition-all duration-200"
        style={{
          width: `${cardWidth}px`,
          height: `${cardHeight}px`,
          backgroundColor: "rgba(5, 8, 25, 0.85)",
          border: "1px solid rgba(0, 229, 204, 0.2)",
          clipPath: "polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)",
          filter: distance === 0 ? "none" : "blur(1px)",
          boxShadow: distance === 0 ? "0 -4px 20px rgba(0, 229, 204, 0.5), inset 3px 0 0 #00E5CC" : "none",
        }}
      >
        {/* Icon */}
        <Icon
          className="flex-shrink-0"
          style={{
            width: `${iconSize}px`,
            height: `${iconSize}px`,
            color: "#00E5CC",
            strokeWidth: "2.5",
          }}
        />

        {/* Label */}
        <span
          className="font-inter font-bold uppercase text-center text-white"
          style={{
            fontSize: `${labelSize}px`,
            letterSpacing: "1px",
          }}
        >
          {mode.label}
        </span>

        {/* Subtitle - only show on centre card */}
        {showSubtitle && (
          <span
            className="text-[10px] font-inter text-center leading-tight"
            style={{
              color: "rgba(255,255,255,0.45)",
            }}
          >
            {mode.subtitle}
          </span>
        )}
      </div>
    </motion.div>
  );
}

function Carousel({ isLocked, mounted }: { isLocked: boolean; mounted: boolean }) {
  const [activeIndex, setActiveIndex] = useState(2); // QUICK RACE is at index 2
  const [isMobile, setIsMobile] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardsPerView = isMobile ? 3 : 5;
  const sideCards = Math.floor(cardsPerView / 2);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev - 1 + gameModes.length) % gameModes.length);
      } else if (e.key === "ArrowRight") {
        setActiveIndex((prev) => (prev + 1) % gameModes.length);
      }
    };

    if (carouselRef.current) {
      carouselRef.current.addEventListener("keydown", handleKeyDown);
      return () => carouselRef.current?.removeEventListener("keydown", handleKeyDown);
    }
  }, []);

  const handleCardClick = (index: number) => {
    setActiveIndex(index);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + gameModes.length) % gameModes.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % gameModes.length);
  };

  // Get visible cards indices
  const visibleIndices: number[] = [];
  for (let i = -sideCards; i <= sideCards; i++) {
    visibleIndices.push((activeIndex + i + gameModes.length) % gameModes.length);
  }

  if (isLocked) {
    return (
      <div className="h-32 flex items-center justify-center">
        <p className="font-inter text-lg font-semibold tracking-wider" style={{ color: "#00E5CC" }}>
          🔗 Connect wallet to access game modes
        </p>
      </div>
    );
  }

  return (
    <motion.div
      {...fadeUp(0.5)}
      ref={carouselRef}
      tabIndex={0}
      className="relative flex items-center justify-center mt-6"
      style={{
        outline: "none",
        height: "160px",
      }}
    >
      {/* Left Arrow */}
      <button
        onClick={handlePrev}
        className="absolute flex items-center justify-center text-2xl transition-all duration-200 hover:scale-110 hover:opacity-100 z-10"
        style={{
          left: "calc(50% - 360px)",
          width: "40px",
          height: "40px",
          border: "1px solid rgba(0,229,204,0.4)",
          background: "rgba(0,229,204,0.08)",
          color: "#00E5CC",
          borderRadius: "50%",
          cursor: "pointer",
          opacity: 0.7,
        }}
        aria-label="Previous card"
      >
        ‹
      </button>

      {/* Cards Container */}
      <div
        className="flex items-center justify-center gap-4 overflow-hidden"
        style={{
          perspective: "1000px",
        }}
      >
        {visibleIndices.map((index, idx) => {
          const distance = Math.abs(idx - sideCards);
          return (
            <div key={index} onClick={() => handleCardClick(index)}>
              <CarouselCard
                mode={gameModes[index]}
                distance={distance}
                onClick={() => handleCardClick(index)}
              />
            </div>
          );
        })}
      </div>

      {/* Right Arrow */}
      <button
        onClick={handleNext}
        className="absolute flex items-center justify-center text-2xl transition-all duration-200 hover:scale-110 hover:opacity-100 z-10"
        style={{
          right: "calc(50% - 360px)",
          width: "40px",
          height: "40px",
          border: "1px solid rgba(0,229,204,0.4)",
          background: "rgba(0,229,204,0.08)",
          color: "#00E5CC",
          borderRadius: "50%",
          cursor: "pointer",
          opacity: 0.7,
        }}
        aria-label="Next card"
      >
        ›
      </button>

      {/* Center card link */}
      <Link href={gameModes[activeIndex].href} className="absolute inset-0 pointer-events-none" />
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
    <div className="relative w-full overflow-hidden -mx-4 -mt-6 sm:-mx-6 sm:-mt-8" style={{ height: "calc(100vh - 64px)" }}>
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

      {/* Content - positioned higher */}
      <section
        className="relative z-10 w-full flex flex-col items-center px-4 text-center"
        style={{
          height: "100%",
          justifyContent: "flex-start",
          paddingTop: "8vh",
        }}
      >
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

        {/* Main headline */}
        <motion.h1
          {...fadeUp(0.2)}
          className="font-bebas text-[clamp(3rem,10vw,8rem)] font-black italic -skew-x-12 leading-none text-white drop-shadow-[0_0_30px_rgba(0,229,204,0.5)]"
        >
          DASH RUNNER
        </motion.h1>

        {/* Tagline */}
        <motion.p
          {...fadeUp(0.3)}
          className="mt-4 max-w-xl font-inter text-base sm:text-lg font-medium text-white/90 leading-relaxed"
        >
          Race. Dodge. Survive. Score forever on-chain.
        </motion.p>

        {/* CTA Buttons or Connected Address */}
        {!isConnected ? (
          <motion.div
            {...fadeUp(0.4)}
            className="mt-8 flex flex-col sm:flex-row items-center gap-6"
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
        ) : (
          <motion.div
            {...fadeUp(0.4)}
            className="mt-8 inline-flex items-center gap-2 font-inter text-sm"
            style={{
              background: "rgba(0,229,204,0.1)",
              border: "1px solid #00E5CC",
              color: "#00E5CC",
              borderRadius: "999px",
              padding: "8px 20px",
              fontSize: "13px",
            }}
          >
            <span>✓ Racing as</span>
            <span className="font-mono font-bold">0x...</span>
          </motion.div>
        )}

        {/* Carousel */}
        {mounted && <Carousel isLocked={!isConnected} mounted={mounted} />}
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
