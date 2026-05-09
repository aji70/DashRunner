"use client";

import Link from "next/link";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate w-screen h-[100dvh] bg-slate-950 text-white overflow-hidden">
      {/* Background image */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-slate-900 bg-cover bg-no-repeat"
        style={{ backgroundImage: "url(/background.jpg)" }}
      />

      <div className="relative z-10 flex w-screen h-[100dvh] flex-col overflow-hidden">
        {/* Top Navigation Bar - redesigned */}
        <header
          className="sticky top-0 z-40 w-full flex items-center justify-between px-3 sm:px-6 h-14 sm:h-16"
          style={{
            backgroundColor: "rgba(5, 8, 25, 0.9)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(0, 229, 204, 0.15)",
          }}
        >
          {/* LEFT - Logo */}
          <Link href="/" className="group transition-transform hover:scale-105 flex-shrink-0">
            <img
              src="/logo.jpg"
              alt="Dash Runner"
              style={{ height: "28px", width: "auto", objectFit: "contain" }}
            />
          </Link>

          {/* CENTRE - Wallet Pill (mobile optimized) */}
          <div className="flex-1 flex items-center justify-center px-2">
            <div
              className="flex items-center gap-1.5 min-h-[44px]"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "999px",
                padding: "5px 12px",
                fontSize: "12px",
                color: "white",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />
              <span className="text-white font-mono font-semibold truncate">
                0xE8...cbc
              </span>
            </div>
          </div>

          {/* RIGHT - Play Button */}
          <Link
            href="/play?start=1"
            className="flex items-center justify-center font-inter font-black uppercase tracking-wider text-slate-950 ml-2 transition-all duration-200 hover:opacity-90 flex-shrink-0 min-h-[44px]"
            style={{
              background: "#00E5CC",
              padding: "0 16px",
              clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
              fontSize: "13px",
              height: "36px",
            }}
          >
            <span className="sm:hidden">▶</span>
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
