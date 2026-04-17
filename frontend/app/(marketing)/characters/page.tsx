"use client";

import { useEffect, useState } from "react";
import { RUNNER_CHARACTERS } from "@/lib/gameCatalog";
import {
  loadLocalProfile,
  saveLocalProfile,
  pullProfileFromServer,
  pushLoadoutToServer,
} from "@/lib/playerProfile";
import { apiSend } from "@/lib/api";

export default function CharactersPage() {
  const [profile, setProfile] = useState(loadLocalProfile());
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setProfile(loadLocalProfile());
  }, []);

  const select = async (id: number) => {
    const p = loadLocalProfile();
    if (!p.ownedCharacterIds.includes(id)) {
      setMsg("Unlock this runner first.");
      return;
    }
    const next = { ...p, selectedCharacterId: id };
    saveLocalProfile(next);
    setProfile(next);
    setMsg(null);
    if (p.walletAddress) {
      try {
        await pushLoadoutToServer(p.walletAddress, id, p.selectedCityId);
      } catch {
        /* local-only ok */
      }
    }
  };

  const buy = async (onChainId: number, price: number) => {
    setMsg(null);
    const p = loadLocalProfile();
    if (p.ownedCharacterIds.includes(onChainId)) {
      setMsg("Already unlocked.");
      return;
    }
    if (!p.walletAddress) {
      if (p.softCurrency < price) {
        setMsg("Not enough coins locally. Set a wallet and sync for server balance.");
        return;
      }
      const nextOwned = [...p.ownedCharacterIds, onChainId].sort((a, b) => a - b);
      const next = { ...p, ownedCharacterIds: nextOwned, softCurrency: p.softCurrency - price };
      saveLocalProfile(next);
      setProfile(next);
      setMsg("Unlocked locally (demo). Use a synced wallet for server purchases.");
      return;
    }
    try {
      await apiSend(`/api/player/${encodeURIComponent(p.walletAddress)}/buy-character`, {
        method: "POST",
        body: JSON.stringify({ characterId: onChainId }),
      });
      const synced = await pullProfileFromServer(p.walletAddress);
      if (synced) setProfile(synced);
      setMsg(`Runner #${onChainId} unlocked.`);
    } catch (e) {
      setMsg(String((e as Error)?.message || e));
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-orbitron text-2xl font-bold text-fuchsia-100">Runners</h1>
        <p className="mt-2 text-sm text-cyan-100/75">
          Cosmetic accents tint the GLB in-game. On-chain purchases use <code className="text-cyan-300/90">buyCharacter</code> with{" "}
          <code className="text-cyan-300/90">setCharacterPrice</code> configured by the owner.
        </p>
      </div>

      <div className="grid gap-4">
        {RUNNER_CHARACTERS.map((c) => {
          const owned = profile.ownedCharacterIds.includes(c.onChainId);
          const selected = profile.selectedCharacterId === c.onChainId;
          return (
            <div
              key={c.id}
              className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/25 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                <div
                  className="h-14 w-14 rounded-2xl border border-white/20 shadow-lg"
                  style={{ background: `radial-gradient(circle at 30% 20%, ${c.accentHex}, #0f172a)` }}
                />
                <div>
                  <h2 className="font-orbitron text-lg text-fuchsia-100">{c.name}</h2>
                  <p className="text-sm text-cyan-100/70">{c.role}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {owned ? (
                  <button
                    type="button"
                    onClick={() => select(c.onChainId)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                      selected
                        ? "border border-cyan-300 bg-cyan-400/25 text-cyan-50"
                        : "border border-white/20 bg-white/5 text-cyan-100"
                    }`}
                  >
                    {selected ? "Equipped" : "Equip"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => buy(c.onChainId, c.priceCoins)}
                    className="rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/20 px-4 py-2 text-sm font-semibold text-fuchsia-50"
                  >
                    Unlock · {c.priceCoins} coins
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {msg && <p className="text-sm text-yellow-100/90">{msg}</p>}
    </div>
  );
}
