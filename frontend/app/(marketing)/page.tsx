import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-fuchsia-300/20 bg-black/25 p-8 shadow-2xl backdrop-blur-md">
        <p className="font-orbitron text-xs uppercase tracking-[0.35em] text-cyan-200/75">On-chain scores · off-chain economy</p>
        <h1 className="mt-4 bg-gradient-to-r from-fuchsia-300 via-cyan-200 to-yellow-200 bg-clip-text font-orbitron text-4xl font-bold text-transparent sm:text-5xl">
          DashRunner
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-cyan-50/85">
          Swipe through neon canyons, collect coin streaks, and sync your best runs to the DashRunner contract. Pick a runner,
          choose a city route, claim daily rewards, and spend soft currency in the shop.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/play"
            className="rounded-2xl border border-fuchsia-300 bg-fuchsia-500/25 px-6 py-3 font-orbitron text-sm font-semibold text-cyan-50 transition hover:bg-fuchsia-500/35"
          >
            Start run
          </Link>
          <Link
            href="/characters"
            className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-6 py-3 font-orbitron text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
          >
            Choose runner
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {[
          { href: "/city", title: "City routes", desc: "Six visual themes that retune fog, skyline, and lights." },
          { href: "/shop", title: "Shop", desc: "Spend soft currency on boosts and cosmetics (backend-tracked)." },
          { href: "/rewards", title: "Daily rewards", desc: "Claim streak bonuses through the API; mirror on-chain with claimDailyReward." },
          { href: "/settings", title: "Settings", desc: "Wallet, audio, and sync with the DashRunner backend." },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-fuchsia-300/30 hover:bg-black/30"
          >
            <h2 className="font-orbitron text-base font-semibold text-fuchsia-100">{card.title}</h2>
            <p className="mt-2 text-sm text-cyan-100/70">{card.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
