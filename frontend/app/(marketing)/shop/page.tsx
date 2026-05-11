"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SHOP_ITEMS } from "@/lib/gameCatalog";
import { loadLocalProfile, pullProfileFromServer } from "@/lib/playerProfile";
import { apiSend } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { InlineNotice } from "@/components/ui/InlineNotice";

const kindTone = {
  boost: "cyan" as const,
  cosmetic: "magenta" as const,
  bundle: "amber" as const,
};

const kindLabel = {
  boost: "WEAPONS",
  cosmetic: "ARMOR",
  bundle: "INTEL",
};

export default function ShopPage() {
  const [coins, setCoins] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setCoins(loadLocalProfile().softCurrency);
  }, []);

  const buy = async (itemId: string, price: number) => {
    setMsg(null);
    const p = loadLocalProfile();
    if (!p.walletAddress) {
      setMsg("Ghost mode active. Connect wallet to post your score on-chain.");
      return;
    }
    if (p.softCurrency < price) {
      setMsg("Not enough $DASH. Claim daily rewards or sync a funded wallet.");
      return;
    }
    try {
      await apiSend(`/api/player/${encodeURIComponent(p.walletAddress)}/shop-buy`, {
        method: "POST",
        body: JSON.stringify({ itemId }),
      });
      const next = await pullProfileFromServer(p.walletAddress);
      setCoins(next?.softCurrency ?? p.softCurrency - price);
      setMsg(`Purchased ${itemId}.`);
    } catch (e) {
      setMsg(String((e as Error)?.message || e));
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <PageHeader eyebrow="Economy" title="Black Market" className="max-w-xl">
          NULLBLOCK doesn't know this exists. Keep it that way.
        </PageHeader>
        <GlassPanel className="w-full shrink-0 px-6 py-5 sm:max-w-xs">
          <p className="font-rajdhani text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--text-dim)]">
            $DASH Balance
          </p>
          <p className="mt-2 font-orbitron text-3xl font-black tabular-nums text-orange-100" style={{ textShadow: "0 0 20px rgba(251,146,60,0.28)" }}>
            {coins.toLocaleString()}
          </p>
          <p className="mt-2 font-rajdhani text-sm text-[var(--text-dim)]">$DASH available for weapons & gear.</p>
        </GlassPanel>
      </div>

      <div className="space-y-4">
        {SHOP_ITEMS.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <GlassPanel className="p-5 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-6">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-orbitron text-lg font-bold text-[var(--text-primary)]">{item.name}</h2>
                  <Badge tone={kindTone[item.kind]}>{kindLabel[item.kind]}</Badge>
                </div>
                <p className="mt-2 font-rajdhani text-[15px] leading-relaxed text-[var(--text-secondary)]">{item.description}</p>
              </div>
              <Button variant="primary" onClick={() => buy(item.id, item.priceCoins)} className="mt-4 w-full shrink-0 sm:mt-0 sm:w-auto">
                Acquire · {item.priceCoins} $DASH
              </Button>
            </GlassPanel>
          </motion.div>
        ))}
      </div>

      {msg ? (
        <InlineNotice tone={msg.startsWith("Purchased") ? "success" : "warn"}>{msg}</InlineNotice>
      ) : null}
    </div>
  );
}
