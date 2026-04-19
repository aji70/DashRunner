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
    <div className="-my-8 flex min-h-[calc(100dvh-9.25rem)] flex-col py-8 sm:-my-10 sm:min-h-[calc(100dvh-8.5rem)] sm:py-10">
      <div className="shrink-0 pt-2 text-center sm:pt-4">
        <h1 className="font-orbitron text-4xl font-black uppercase tracking-[0.08em] text-slate-100 sm:text-5xl md:text-6xl">
          DashRunner
        </h1>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-stretch justify-center gap-3 py-4 sm:gap-4 sm:py-6">
        <Link
          href="/play"
          className="mx-auto flex w-full max-w-sm items-center justify-center rounded-2xl border border-fuchsia-400/45 bg-gradient-to-br from-fuchsia-600 to-violet-950 py-5 font-orbitron text-lg font-black uppercase tracking-[0.2em] text-white shadow-neon-fuchsia transition hover:scale-[1.02] active:scale-[0.98] sm:max-w-md sm:py-6 sm:text-xl"
        >
          Play endless
        </Link>
        <Link
          href="/play?mode=racing"
          className="mx-auto flex w-full max-w-sm items-center justify-center rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-cyan-600/90 to-slate-950 py-4 font-orbitron text-base font-bold uppercase tracking-[0.18em] text-cyan-50 shadow-[0_0_24px_rgba(34,211,238,0.18)] transition hover:scale-[1.02] active:scale-[0.98] sm:max-w-md sm:py-5 sm:text-lg"
        >
          Race (beta)
        </Link>
      </div>

      <div className="flex min-h-0 flex-[1.2] flex-col gap-2 pb-1 sm:gap-2.5 sm:pb-2">
        {shortcuts.map((s) => (
          <Link key={s.href} href={s.href} className="flex min-h-[2.75rem] flex-1">
            <GlassPanel hover className="flex h-full min-h-[2.75rem] w-full flex-1 items-center justify-center px-4">
              <span className="font-orbitron text-xs font-bold uppercase tracking-[0.2em] text-cyan-100/85 sm:text-sm">
                {s.label}
              </span>
            </GlassPanel>
          </Link>
        ))}
      </div>
    </div>
  );
}
