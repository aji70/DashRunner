"use client";

import { useEffect, useState } from "react";
import { SHOP_ITEMS } from "@/lib/gameCatalog";
import { loadLocalProfile, pullProfileFromServer } from "@/lib/playerProfile";
import { apiSend } from "@/lib/api";

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
      setMsg("Set a wallet in Settings and sync before buying.");
      return;
    }
    if (p.softCurrency < price) {
      setMsg("Not enough soft currency — claim daily rewards or start with a fresh wallet on the backend.");
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
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-orbitron text-2xl font-bold text-fuchsia-100">Shop</h1>
          <p className="mt-2 text-sm text-cyan-100/75">Spend soft currency tracked by the backend.</p>
        </div>
        <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-5 py-3 text-right">
          <p className="text-[10px] uppercase tracking-widest text-cyan-200/70">Balance</p>
          <p className="font-orbitron text-xl text-cyan-50">{coins}</p>
        </div>
      </div>

      <div className="space-y-4">
        {SHOP_ITEMS.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/25 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 className="font-orbitron text-base text-fuchsia-100">{item.name}</h2>
              <p className="mt-1 text-sm text-cyan-100/70">{item.description}</p>
              <p className="mt-2 text-xs uppercase tracking-wide text-cyan-300/60">{item.kind}</p>
            </div>
            <button
              type="button"
              onClick={() => buy(item.id, item.priceCoins)}
              className="shrink-0 rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/20 px-5 py-2 text-sm font-semibold text-fuchsia-50"
            >
              {item.priceCoins} coins
            </button>
          </div>
        ))}
      </div>
      {msg && <p className="text-sm text-yellow-100/90">{msg}</p>}
    </div>
  );
}
