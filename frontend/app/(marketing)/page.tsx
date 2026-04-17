"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Badge } from "@/components/ui/Badge";

const cards = [
  {
    href: "/city",
    title: "City routes",
    desc: "Six atmospheres — fog density, skyline palette, and accent lights retune the 3D lane.",
    tag: "World",
  },
  {
    href: "/shop",
    title: "Armory",
    desc: "Spend soft currency on boosts, cosmetics, and bundles tracked by your player row.",
    tag: "Economy",
  },
  {
    href: "/rewards",
    title: "Daily drops",
    desc: "Streak-aware claims through the API; mirror payouts on-chain when you wire the contract.",
    tag: "Progress",
  },
  {
    href: "/settings",
    title: "Sync",
    desc: "Wallet address, audio defaults, and loadout push for backend + contract alignment.",
    tag: "System",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="space-y-12 sm:space-y-16">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.09] bg-[var(--panel)] p-8 shadow-lift backdrop-blur-2xl sm:p-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-fuchsia-600/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-cyan-500/12 blur-3xl" />

        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_minmax(0,0.9fr)] lg:items-center">
          <div>
            <Badge tone="cyan" className="mb-5">
              On-chain scores · off-chain loop
            </Badge>
            <h1 className="font-orbitron text-4xl font-black leading-[1.05] tracking-tight text-transparent sm:text-5xl lg:text-6xl [background:linear-gradient(100deg,#fae8ff,#67e8f9,#fef08a)] bg-clip-text">
              Lane discipline meets neon velocity.
            </h1>
            <p className="mt-6 max-w-xl font-rajdhani text-lg leading-relaxed text-[var(--text-secondary)]">
              DashRunner is a tactile endless runner: swipe lanes, arc over barriers, slip under gates, and chain coins.
              Tune your runner, pick a megacity route, then sync progress when you are ready for Celo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/play"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-fuchsia-400/45 bg-gradient-to-br from-fuchsia-600/90 to-violet-950/90 px-8 py-4 font-orbitron text-xs font-bold uppercase tracking-[0.2em] text-white shadow-neon-fuchsia transition hover:scale-[1.02] active:scale-[0.98] sm:text-sm"
              >
                Enter run
              </Link>
              <Link
                href="/characters"
                className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/35 bg-cyan-500/[0.12] px-7 py-4 font-orbitron text-xs font-bold uppercase tracking-[0.18em] text-cyan-50 transition hover:border-cyan-300/50 hover:bg-cyan-500/20 sm:text-sm"
              >
                Loadout
              </Link>
            </div>
          </div>

          <GlassPanel className="p-6 sm:p-8">
            <p className="font-rajdhani text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--text-dim)]">
              Session snapshot
            </p>
            <dl className="mt-6 space-y-5">
              {[
                { k: "Control", v: "Swipe + on-screen pad" },
                { k: "Render", v: "WebGL lane + motion GLB" },
                { k: "Target", v: "MiniPay · Celo L2" },
              ].map((row) => (
                <div key={row.k} className="flex items-baseline justify-between gap-4 border-b border-white/[0.06] pb-4 last:border-0 last:pb-0">
                  <dt className="font-rajdhani text-sm text-[var(--text-dim)]">{row.k}</dt>
                  <dd className="text-right font-orbitron text-sm font-semibold text-cyan-100/95">{row.v}</dd>
                </div>
              ))}
            </dl>
          </GlassPanel>
        </div>
      </section>

      <section>
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-rajdhani text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--text-dim)]">Command deck</p>
            <h2 className="mt-1 font-orbitron text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">Everything before the sprint</h2>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((card, i) => (
            <motion.div
              key={card.href}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href={card.href} className="group block h-full">
                <GlassPanel hover className="h-full p-6 transition duration-300 group-hover:-translate-y-0.5">
                  <Badge tone="magenta" className="mb-4">
                    {card.tag}
                  </Badge>
                  <h3 className="font-orbitron text-lg font-bold text-fuchsia-100/95 group-hover:text-white sm:text-xl">
                    {card.title}
                  </h3>
                  <p className="mt-3 font-rajdhani text-[15px] leading-relaxed text-[var(--text-secondary)]">{card.desc}</p>
                  <p className="mt-5 font-rajdhani text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300/70 transition group-hover:text-cyan-200">
                    Open →
                  </p>
                </GlassPanel>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
