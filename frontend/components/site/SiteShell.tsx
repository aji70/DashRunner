"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

const links = [
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
    <div className="app-mesh flex min-h-[100dvh] flex-col pb-28 text-[var(--text-primary)] sm:pb-24">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_55%_35%_at_50%_0%,rgba(232,121,249,0.08),transparent)]" />

      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[var(--abyss)]/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-[3.35rem] max-w-5xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/25 bg-gradient-to-br from-fuchsia-600/40 to-cyan-600/25 shadow-neon-cyan transition group-hover:border-fuchsia-400/40">
              <span className="font-orbitron text-[11px] font-black leading-none text-white">DR</span>
            </span>
            <div className="hidden leading-tight sm:block">
              <p className="font-orbitron text-sm font-bold tracking-wide text-transparent [background:linear-gradient(95deg,#e9d5ff,#67e8f9,#fde68a)] bg-clip-text">
                DashRunner
              </p>
              <p className="font-rajdhani text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--text-dim)]">
                Celo · endless lane
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/play"
              className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/35 bg-gradient-to-r from-fuchsia-600/45 via-fuchsia-700/35 to-violet-900/50 px-4 py-2 font-orbitron text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-neon-fuchsia transition hover:border-cyan-300/40 hover:from-fuchsia-500/55 sm:text-[11px]"
            >
              <PlayIcon className="h-3.5 w-3.5 opacity-90" />
              Play
            </Link>
          </div>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.06] bg-[var(--abyss)]/92 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-5xl justify-between gap-0.5 px-2 sm:gap-1 sm:px-4">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link key={l.href} href={l.href} className="min-w-0 flex-1">
                <motion.span
                  layout
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-xl py-2 transition sm:flex-row sm:gap-2 sm:px-2 sm:py-2.5",
                    active
                      ? "bg-white/[0.07] text-fuchsia-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
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
  );
}
