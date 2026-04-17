"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/characters", label: "Runners" },
  { href: "/city", label: "City" },
  { href: "/shop", label: "Shop" },
  { href: "/rewards", label: "Rewards" },
  { href: "/settings", label: "Settings" },
] as const;

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(120,40,140,0.35),transparent),radial-gradient(circle_at_bottom,rgba(8,40,48,0.9),#05060d)] pb-24 text-cyan-50">
      <header className="sticky top-0 z-20 border-b border-cyan-400/10 bg-[#050810]/75 px-4 py-3.5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <Link
            href="/"
            className="font-orbitron text-lg font-bold tracking-tight text-transparent [background:linear-gradient(100deg,#f0abfc,#67e8f9,#fde68a)] bg-clip-text drop-shadow-[0_0_12px_rgba(34,211,238,0.2)]"
          >
            DashRunner
          </Link>
          <Link
            href="/play"
            className="rounded-full border border-fuchsia-400/35 bg-gradient-to-r from-fuchsia-600/35 to-cyan-600/25 px-4 py-2 font-orbitron text-[11px] font-bold uppercase tracking-[0.15em] text-cyan-50 shadow-[0_0_20px_rgba(244,114,182,0.15)] transition hover:border-cyan-300/45 hover:from-fuchsia-500/45 hover:to-cyan-500/35"
          >
            Run
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-cyan-400/10 bg-[#050810]/88 px-2 py-2 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl justify-between gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex-1 rounded-xl px-1 py-2 text-center font-rajdhani text-[10px] font-semibold uppercase tracking-wide sm:text-[11px] ${
                  active
                    ? "border border-fuchsia-400/25 bg-fuchsia-500/15 text-fuchsia-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                    : "text-cyan-100/65 transition hover:bg-white/[0.04] hover:text-cyan-50"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
