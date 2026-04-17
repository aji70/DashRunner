import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";

const shortcuts = [
  { href: "/characters", label: "Runners" },
  { href: "/city", label: "City" },
  { href: "/shop", label: "Shop" },
  { href: "/rewards", label: "Rewards" },
  { href: "/settings", label: "Settings" },
] as const;

export default function LandingPage() {
  return (
    <div className="flex min-h-[calc(100dvh-12rem)] flex-col items-center justify-center gap-8 pb-8 pt-4 sm:min-h-[calc(100dvh-10rem)] sm:gap-10">
      <div className="text-center">
        <h1 className="font-orbitron text-5xl font-black uppercase leading-none tracking-tight text-transparent sm:text-7xl md:text-8xl [background:linear-gradient(100deg,#fae8ff,#67e8f9,#fef08a)] bg-clip-text">
          DashRunner
        </h1>
        <p className="mt-3 font-rajdhani text-sm font-semibold uppercase tracking-[0.35em] text-[var(--text-dim)] sm:text-base">
          Swipe · jump · slide · chase the high score
        </p>
      </div>

      <Link
        href="/play"
        className="inline-flex min-w-[12rem] items-center justify-center rounded-2xl border-2 border-fuchsia-400/50 bg-gradient-to-br from-fuchsia-600 to-violet-950 px-12 py-5 font-orbitron text-base font-black uppercase tracking-[0.25em] text-white shadow-neon-fuchsia transition hover:scale-[1.03] active:scale-[0.97] sm:min-w-[14rem] sm:py-6 sm:text-lg"
      >
        Play
      </Link>

      <div className="flex w-full max-w-md flex-col gap-2 sm:max-w-sm sm:gap-2.5">
        {shortcuts.map((s) => (
          <Link key={s.href} href={s.href} className="block w-full">
            <GlassPanel hover className="w-full py-3.5 text-center sm:py-4">
              <span className="font-orbitron text-xs font-bold uppercase tracking-widest text-cyan-100/90 sm:text-sm">
                {s.label}
              </span>
            </GlassPanel>
          </Link>
        ))}
      </div>
    </div>
  );
}
