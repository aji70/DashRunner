"use client";

import { motion } from "framer-motion";
import { CITY_ROUTES } from "@/lib/gameCatalog";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Badge } from "@/components/ui/Badge";

interface CitySelectorOverlayProps {
  selectedCityId: number;
  onSelectCity: (cityId: number) => void;
  onStartRace: () => void;
}

const routeGlow: Record<number, string> = {
  0: "from-orange-400/25 to-rose-600/20",
  1: "from-violet-400/25 to-purple-600/20",
  2: "from-emerald-400/20 to-green-900/15",
  3: "from-green-400/25 to-emerald-800/20",
  4: "from-amber-400/25 to-orange-600/15",
  5: "from-orange-500/25 to-amber-900/20",
  6: "from-rose-400/25 to-red-900/20",
  7: "from-orange-400/25 to-blue-900/20",
  8: "from-sky-400/25 to-indigo-900/20",
  9: "from-blue-400/25 to-orange-900/20",
  10: "from-red-500/25 to-orange-950/25",
  11: "from-red-600/25 to-yellow-900/20",
  12: "from-pink-400/25 to-purple-800/20",
};

export function CitySelectorOverlay({ selectedCityId, onSelectCity, onStartRace }: CitySelectorOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto px-4 py-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h1 className="font-orbitron text-3xl font-bold text-orange-300">SELECT ROUTE</h1>
            <p className="mt-2 font-rajdhani text-sm text-orange-200/70">Choose your city and start racing</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {CITY_ROUTES.map((city, i) => {
              const active = selectedCityId === city.id;
              const glow = routeGlow[city.id] ?? "from-orange-400/20 to-violet-950/20";
              return (
                <motion.button
                  key={city.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => onSelectCity(city.id)}
                  className="text-left"
                >
                  <GlassPanel
                    active={active}
                    hover
                    className={`h-full bg-gradient-to-br ${glow} p-3 sm:p-4 transition-all ${
                      active ? "ring-2 ring-orange-400" : ""
                    }`}
                  >
                    <Badge tone="neutral" className="mb-2 border-white/10 text-[10px]">
                      {city.region}
                    </Badge>
                    <h2 className="font-orbitron text-base font-bold text-[var(--text-primary)]">{city.name}</h2>
                    <p className="mt-1 font-rajdhani text-[13px] leading-relaxed text-[var(--text-secondary)]">
                      {city.tagline}
                    </p>
                  </GlassPanel>
                </motion.button>
              );
            })}
          </div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={onStartRace}
            className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-blue-600 px-6 py-3 font-orbitron font-bold text-white transition-all hover:shadow-lg hover:shadow-orange-500/50"
          >
            START RACE
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
