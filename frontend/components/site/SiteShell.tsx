"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7L8 5Z" />
    </svg>
  );
}

function CeloIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="#FCFF52" />
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 2a8 8 0 110 16 8 8 0 010-16z" fill="#1F1E1B" />
    </svg>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {

  return (
    <div className="relative isolate min-h-[100dvh] bg-slate-950 text-white">
      {/* Background image */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-slate-900 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/background.jpg)" }}
      />

      <div className="relative z-10 flex min-h-[100dvh] flex-col">
        {/* Top Navigation Bar - simplified */}
        <header
          className="sticky top-0 z-40 border-b border-slate-700/30"
          style={{
            backgroundColor: "rgba(5, 5, 20, 0.75)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="mx-auto h-16 px-4 sm:px-6 max-w-7xl flex items-center justify-between gap-4">
            {/* Logo left */}
            <Link href="/" className="group flex items-center gap-2 transition-transform hover:scale-105">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600">
                <span className="font-bebas text-lg font-bold text-slate-950">DR</span>
              </div>
              <span className="hidden sm:block font-bebas text-xl font-bold text-white">DASH RUNNER</span>
            </Link>

            {/* Wallet + Celo centre */}
            <div className="flex-1 flex items-center justify-center gap-2">
              <div className="[&_button]:h-9 [&_button]:text-xs [&_button]:rounded-lg [&_button]:px-3">
                <ConnectButton
                  showBalance={false}
                  accountStatus="address"
                  chainStatus="icon"
                />
              </div>
              <div className="hidden sm:flex items-center gap-1">
                <CeloIcon className="w-5 h-5" />
              </div>
            </div>

            {/* Play button right */}
            <Link
              href="/play?start=1"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-inter font-bold uppercase tracking-wider text-slate-950 bg-cyan-500 hover:bg-cyan-400 transition-colors duration-200 text-sm shadow-[0_0_20px_rgba(0,229,204,0.3)]"
            >
              <PlayIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Play</span>
            </Link>
          </div>
        </header>

        {/* Main content */}
        <main className="relative w-full flex-1">{children}</main>
      </div>

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
