"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RUNNER_CHARACTERS } from "@/lib/gameCatalog";
import {
  loadLocalProfile,
  saveLocalProfile,
  pullProfileFromServer,
  pushLoadoutToServer,
} from "@/lib/playerProfile";
import { apiSend } from "@/lib/api";
import { PageHeader, Kbd } from "@/components/ui/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { Badge } from "@/components/ui/Badge";

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
    <div className="space-y-10">
      <PageHeader eyebrow="Loadout" title="Runners">
        Cosmetic accents tint the in-game GLB. Purchases call <Kbd>buyCharacter</Kbd> with prices set via{" "}
        <Kbd>setCharacterPrice</Kbd> on the owner account.
      </PageHeader>

      <div className="space-y-4">
        {RUNNER_CHARACTERS.map((c, i) => {
          const owned = profile.ownedCharacterIds.includes(c.onChainId);
          const selected = profile.selectedCharacterId === c.onChainId;
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <GlassPanel active={selected} className="p-5 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-5">
                    <div
                      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.45)] sm:h-[4.5rem] sm:w-[4.5rem]"
                      style={{
                        background: `radial-gradient(circle at 28% 22%, ${c.accentHex}, #0b1220 72%)`,
                      }}
                    >
                      <div className="absolute inset-0 bg-shine-sweep opacity-30" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-orbitron text-xl font-bold text-[var(--text-primary)]">{c.name}</h2>
                        {owned ? <Badge tone="cyan">Owned</Badge> : <Badge tone="amber">Locked</Badge>}
                        {selected ? <Badge tone="magenta">Equipped</Badge> : null}
                      </div>
                      <p className="mt-1 font-rajdhani text-[15px] text-[var(--text-secondary)]">{c.role}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    {owned ? (
                      <Button
                        variant={selected ? "secondary" : "ghost"}
                        onClick={() => select(c.onChainId)}
                        className="min-w-[8.5rem]"
                      >
                        {selected ? "Equipped" : "Equip"}
                      </Button>
                    ) : (
                      <Button variant="primary" onClick={() => buy(c.onChainId, c.priceCoins)} className="min-w-[10rem]">
                        Unlock · {c.priceCoins}
                      </Button>
                    )}
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          );
        })}
      </div>

      {msg ? (
        <InlineNotice
          tone={
            /unlocked|synced/i.test(msg) && !/not enough|first/i.test(msg) ? "success" : "warn"
          }
        >
          {msg}
        </InlineNotice>
      ) : null}
    </div>
  );
}
