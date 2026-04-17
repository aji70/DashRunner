"use client";

import { useState } from "react";
import { CITY_ROUTES } from "@/lib/gameCatalog";
import { loadLocalProfile, saveLocalProfile, pushLoadoutToServer } from "@/lib/playerProfile";

export default function CityPage() {
  const [profile, setProfile] = useState(loadLocalProfile());
  const [msg, setMsg] = useState<string | null>(null);

  const choose = async (cityId: number) => {
    const p = loadLocalProfile();
    const next = { ...p, selectedCityId: cityId };
    saveLocalProfile(next);
    setProfile(next);
    setMsg(`Route set to “${CITY_ROUTES.find((c) => c.id === cityId)?.name}”.`);
    if (p.walletAddress) {
      try {
        await pushLoadoutToServer(p.walletAddress, p.selectedCharacterId, cityId);
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-orbitron text-2xl font-bold text-fuchsia-100">City routes</h1>
        <p className="mt-2 text-sm text-cyan-100/75">
          Each route shifts skyline hues, fog, and accent lights in the 3D scene. IDs map to contract{" "}
          <code className="text-cyan-300/90">MAX_CITY_ID</code> (0–31).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {CITY_ROUTES.map((city) => {
          const active = profile.selectedCityId === city.id;
          return (
            <button
              key={city.id}
              type="button"
              onClick={() => choose(city.id)}
              className={`rounded-2xl border p-5 text-left transition ${
                active
                  ? "border-cyan-300/60 bg-cyan-500/15 shadow-[0_0_24px_rgba(34,211,238,0.15)]"
                  : "border-white/10 bg-black/25 hover:border-fuchsia-300/30"
              }`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-fuchsia-200/70">{city.region}</p>
              <h2 className="mt-2 font-orbitron text-lg text-fuchsia-100">{city.name}</h2>
              <p className="mt-2 text-sm text-cyan-100/75">{city.tagline}</p>
            </button>
          );
        })}
      </div>
      {msg && <p className="text-sm text-cyan-100/85">{msg}</p>}
    </div>
  );
}
