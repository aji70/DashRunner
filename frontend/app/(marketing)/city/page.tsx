"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CITY_ROUTES } from "@/lib/gameCatalog";
import { loadLocalProfile, saveLocalProfile, pushLoadoutToServer } from "@/lib/playerProfile";
import { PageHeader, Kbd } from "@/components/ui/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Badge } from "@/components/ui/Badge";
import { InlineNotice } from "@/components/ui/InlineNotice";

const routeGlow: Record<number, string> = {
  0: "from-cyan-400/25 to-fuchsia-600/20",
  1: "from-violet-400/25 to-purple-600/20",
  2: "from-emerald-400/20 to-green-900/15",
  3: "from-green-400/25 to-emerald-800/20",
  4: "from-amber-400/25 to-orange-600/15",
  5: "from-orange-500/25 to-amber-900/20",
  6: "from-rose-400/25 to-red-900/20",
  7: "from-cyan-400/25 to-blue-900/20",
  8: "from-sky-400/25 to-indigo-900/20",
  9: "from-blue-400/25 to-cyan-900/20",
  10: "from-red-500/25 to-orange-950/25",
  11: "from-red-600/25 to-yellow-900/20",
  12: "from-pink-400/25 to-purple-800/20",
};

export default function CityPage() {
  const [profile, setProfile] = useState(loadLocalProfile());
  const [msg, setMsg] = useState<string | null>(null);

  const choose = async (cityId: number) => {
    const p = loadLocalProfile();
    const next = { ...p, selectedCityId: cityId };
    saveLocalProfile(next);
    setProfile(next);
    setMsg(`Route locked to “${CITY_ROUTES.find((c) => c.id === cityId)?.name}”.`);
    if (p.walletAddress) {
      try {
        await pushLoadoutToServer(p.walletAddress, p.selectedCharacterId, cityId);
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <div className="space-y-10">
      <PageHeader eyebrow="World index" title="City routes">
        Each route rewrites fog, skyline accents, and ambient lights in the WebGL lane. IDs align with contract{" "}
        <Kbd>MAX_CITY_ID</Kbd> (0–31).
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        {CITY_ROUTES.map((city, i) => {
          const active = profile.selectedCityId === city.id;
          const glow = routeGlow[city.id] ?? "from-cyan-400/20 to-violet-950/20";
          return (
            <motion.button
              key={city.id}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
              onClick={() => choose(city.id)}
              className="text-left"
            >
              <GlassPanel active={active} hover className={`h-full bg-gradient-to-br ${glow} p-5 sm:p-6`}>
                <Badge tone="neutral" className="mb-3 border-white/10">
                  {city.region}
                </Badge>
                <h2 className="font-orbitron text-xl font-bold text-[var(--text-primary)]">{city.name}</h2>
                <p className="mt-2 font-rajdhani text-[15px] leading-relaxed text-[var(--text-secondary)]">{city.tagline}</p>
                <p className="mt-4 font-rajdhani text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300/60">
                  {active ? "● Active route" : "Tap to assign"}
                </p>
              </GlassPanel>
            </motion.button>
          );
        })}
      </div>

      {msg ? <InlineNotice tone="info">{msg}</InlineNotice> : null}
    </div>
  );
}
