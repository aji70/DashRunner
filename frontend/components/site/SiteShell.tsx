"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

const bottomLinks = [
  { href: "/", label: "Home", short: "⌂" },
  { href: "/characters", label: "Runners", short: "◎" },
  { href: "/city", label: "City", short: "▣" },
  { href: "/shop", label: "Shop", short: "◆" },
  { href: "/rewards", label: "Rewards", short: "✦" },
  { href: "/settings", label: "Settings", short: "⚙" },
] as const;

const topTextLinks = [
  { href: "/characters", label: "Runners" },
  { href: "/city", label: "City" },
  { href: "/shop", label: "Shop" },
  { href: "/rewards", label: "Rewards" },
  { href: "/settings", label: "Settings" },
] as const;

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7L8 5Z" />
    </svg>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative isolate min-h-[100dvh] text-[var(--text-primary)]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-[var(--void)] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/background.jpg)" }}
      />
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[1] app-shell-photo-mesh" />

      <div className="relative z-10 flex min-h-[100dvh] flex-col pb-28 sm:pb-24">
        <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#0a0a0a]/90 backdrop-blur-2xl">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="flex h-[3.35rem] items-center justify-between gap-2 sm:h-16">
              <Link
                href="/"
                className="group flex min-w-0 shrink items-center gap-2 sm:gap-2.5"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-[#00f0ff]/50 bg-gradient-to-br from-[#00f0ff]/20 to-[#ff00aa]/20 shadow-[0_0_20px_rgba(0,240,255,0.35)] transition group-hover:border-[#00f0ff]/80 group-hover:shadow-[0_0_28px_rgba(0,240,255,0.5)]"
                >
                  <span className="font-orbitron text-[11px] font-black leading-none text-white [text-shadow:0_0_8px_#00f0ff]">
                    DR
                  </span>
                </span>
                <div className="min-w-0 leading-tight">
                  <p
                    className="truncate font-orbitron text-sm font-bold tracking-wide sm:text-base"
                    style={{
                      textShadow: "0 0 20px rgba(0, 240, 255, 0.45), 0 0 8px rgba(255, 0, 170, 0.25)",
                    }}
                  >
                    <span className="text-transparent [background:linear-gradient(100deg,#00f0ff,#c084fc,#ff00aa)] bg-clip-text [background-clip:text] [-webkit-background-clip:text]">
                      DashRunner
                    </span>
                  </p>
                  <p className="font-rajdhani text-[9px] font-semibold uppercase tracking-[0.22em] text-white/40 sm:text-[10px]">
                    Neon city · Endless
                  </p>
                </div>
              </Link>

              <div className="flex min-w-0 items-center justify-end gap-1.5 sm:gap-2">
                <Link
                  href="/play"
                  className="group inline-flex shrink-0 items-center gap-1.5 rounded-lg border-2 border-[#00f0ff] bg-[#00f0ff]/10 px-2.5 py-1.5 font-orbitron text-[9px] font-black uppercase tracking-[0.15em] text-[#7df6ff] shadow-[0_0_20px_rgba(0,240,255,0.4)] transition hover:scale-[1.02] hover:border-[#5ef7ff] hover:bg-[#00f0ff]/20 hover:shadow-[0_0_32px_rgba(0,240,255,0.55)] sm:gap-2 sm:px-3 sm:text-[10px]"
                >
                  <PlayIcon className="h-3 w-3 opacity-95" />
                  <span className="max-[360px]:hidden sm:inline">Play</span> endless
                </Link>
                <Link
                  href="/play?mode=racing"
                  className="shrink-0 rounded-lg border-2 border-[#ff00aa] bg-[#ff00aa]/10 px-2.5 py-1.5 font-orbitron text-[9px] font-black uppercase tracking-[0.12em] text-[#fda4d0] shadow-[0_0_20px_rgba(255,0,170,0.35)] transition hover:scale-[1.02] hover:border-[#ff4dc4] hover:bg-[#ff00aa]/20 hover:shadow-[0_0_28px_rgba(255,0,170,0.5)] sm:px-3 sm:text-[10px]"
                >
                  Race
                  <span className="text-white/70">(β)</span>
                </Link>
              </div>
            </div>

            <div className="-mx-1 flex gap-0.5 overflow-x-auto border-t border-white/[0.06] py-1.5 pb-2.5 [scrollbar-width:thin] sm:gap-1.5 sm:py-2">
              {topTextLinks.map((l) => {
                const active = pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={cn(
                      "shrink-0 rounded-lg px-2.5 py-1 font-rajdhani text-[10px] font-bold uppercase tracking-[0.12em] transition sm:text-[11px] sm:tracking-wide",
                      active
                        ? "bg-white/10 text-[#7df6ff] shadow-[inset_0_0_0_1px_rgba(0,240,255,0.35)]"
                        : "text-white/50 hover:bg-white/5 hover:text-white/85"
                    )}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </header>

        <main className="relative mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>

        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.06] bg-[#0a0a0a]/95 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-5xl justify-between gap-0.5 px-2 sm:gap-1 sm:px-4">
            {bottomLinks.map((l) => {
              const active = pathname === l.href;
              return (
                <Link key={l.href} href={l.href} className="min-w-0 flex-1">
                  <motion.span
                    layout
                    className={cn(
                      "flex flex-col items-center gap-0.5 rounded-xl py-2 transition sm:flex-row sm:gap-2 sm:px-2 sm:py-2.5",
                      active
                        ? "bg-white/[0.08] text-[#a5f3fc] shadow-[inset_0_1px_0_rgba(0,240,255,0.2)]"
                        : "text-[var(--text-dim)] hover:bg-white/[0.04] hover:text-cyan-100/85"
                    )}
                  >
                    <span className="font-orbitron text-[11px] opacity-80 sm:hidden">{l.short}</span>
                    <span className="hidden font-rajdhani text-[11px] font-semibold uppercase tracking-wide sm:inline">
                      {l.label}
                    </span>
                    <span className="font-rajdhani text-[9px] font-semibold uppercase tracking-wider opacity-90 sm:hidden">
                      {l.label}
                    </span>
                  </motion.span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
