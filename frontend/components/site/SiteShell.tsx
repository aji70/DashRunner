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
        <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[var(--abyss)]/85 backdrop-blur-2xl">
          <div className="mx-auto flex h-[3.35rem] max-w-5xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
            <Link href="/" className="group flex min-w-0 items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-orange-400/30 bg-gradient-to-br from-rose-600/45 to-orange-600/30 transition group-hover:border-orange-300/45">
                <span className="font-orbitron text-[11px] font-black leading-none text-white">DR</span>
              </span>
              <div className="min-w-0 leading-tight">
                <p className="font-orbitron text-sm font-bold tracking-wide text-transparent [background:linear-gradient(95deg,#e9d5ff,#67e8f9,#fde68a)] bg-clip-text sm:text-[15px]">
                  DashRunner
                </p>
                <p className="font-rajdhani text-[9px] font-semibold uppercase tracking-[0.26em] text-[var(--text-dim)] sm:text-[10px]">
                  Arcade · Celo
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/play?mode=racing"
                className="hidden min-[400px]:inline-flex rounded-lg border border-fuchsia-500/35 bg-fuchsia-950/30 px-2.5 py-1.5 font-orbitron text-[9px] font-bold uppercase tracking-[0.14em] text-fuchsia-200/90 transition hover:border-fuchsia-400/50 hover:bg-fuchsia-900/30 sm:px-3 sm:text-[10px]"
              >
                Race
              </Link>
              <Link
                href="/play"
                className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/50 bg-cyan-500/15 px-2.5 py-1.5 font-orbitron text-[9px] font-bold uppercase tracking-[0.12em] text-cyan-50 shadow-[0_0_20px_rgba(6,182,212,0.2)] transition hover:border-cyan-300/60 hover:bg-cyan-500/25 sm:gap-2 sm:px-3.5 sm:text-[10px]"
              >
                <PlayIcon className="h-3 w-3" />
                Play
              </Link>
            </div>
          </div>
        </header>

        <main className="relative mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>

        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.06] bg-[var(--abyss)]/92 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-2xl">
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
                        ? "bg-white/[0.07] text-rose-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                        : "text-[var(--text-dim)] hover:bg-white/[0.04] hover:text-orange-100/85"
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
