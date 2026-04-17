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
    <div className="flex min-h-[100dvh] flex-col bg-[radial-gradient(circle_at_top,_#2a1452,_#12091f_55%,_#05060d)] pb-24 text-cyan-50">
      <header className="sticky top-0 z-20 border-b border-fuchsia-400/15 bg-black/25 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <Link href="/" className="font-orbitron text-lg font-bold tracking-tight text-transparent [background:linear-gradient(90deg,#f0abfc,#67e8f9,#fde68a)] bg-clip-text">
            DashRunner
          </Link>
          <Link
            href="/play"
            className="rounded-full border border-cyan-300/40 bg-cyan-400/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-cyan-100 transition hover:bg-cyan-400/25"
          >
            Run
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-fuchsia-400/20 bg-black/55 px-2 py-2 backdrop-blur-lg">
        <div className="mx-auto flex max-w-3xl justify-between gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex-1 rounded-xl px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-wide sm:text-xs ${
                  active ? "bg-fuchsia-500/25 text-fuchsia-100" : "text-cyan-100/70 hover:bg-white/5"
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
