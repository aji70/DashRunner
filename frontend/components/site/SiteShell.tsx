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
        {/* Top Navigation Bar - redesigned */}
        <header
          className="sticky top-0 z-40 w-full flex items-center justify-between px-6 h-16"
          style={{
            backgroundColor: "rgba(5, 8, 25, 0.9)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(0, 229, 204, 0.15)",
          }}
        >
          {/* LEFT - Logo */}
          <Link href="/" className="group transition-transform hover:scale-105" style={{ paddingLeft: "20px" }}>
            <img
              src="/logo"
              alt="Dash Runner"
              style={{ height: "36px", width: "auto", objectFit: "contain" }}
            />
          </Link>

          {/* CENTRE - Wallet + Celo */}
          <div className="flex-1 flex items-center justify-center">
            <div
              className="flex items-center gap-2"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "999px",
                padding: "6px 14px",
                fontSize: "13px",
                color: "white",
              }}
            >
              <CeloIcon className="w-4 h-4 flex-shrink-0" />
              <div className="[&_button]:text-xs [&_button]:h-auto [&_button]:px-0 [&_button]:py-0 [&_button]:bg-transparent [&_button]:border-0 [&_button]:text-white [&_button]:font-inter">
                <ConnectButton
                  showBalance={false}
                  accountStatus="address"
                  chainStatus="none"
                />
              </div>
            </div>
          </div>

          {/* RIGHT - Play Button */}
          <Link
            href="/play?start=1"
            className="flex items-center gap-2 font-inter font-black uppercase tracking-wider text-slate-950 ml-6 transition-all duration-200 hover:opacity-90 flex-shrink-0"
            style={{
              background: "#00E5CC",
              padding: "10px 28px",
              clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
              fontSize: "13px",
            }}
          >
            <PlayIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Play</span>
          </Link>
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
