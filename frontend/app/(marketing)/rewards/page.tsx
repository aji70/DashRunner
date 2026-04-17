"use client";

import { useState } from "react";
import { loadLocalProfile, saveLocalProfile, pullProfileFromServer } from "@/lib/playerProfile";
import { apiSend } from "@/lib/api";

export default function RewardsPage() {
  const [status, setStatus] = useState<string | null>(null);

  const claim = async () => {
    setStatus(null);
    const p = loadLocalProfile();
    if (!p.walletAddress) {
      setStatus("Add a wallet in Settings first, then tap “Save & sync” so the player row exists.");
      return;
    }
    try {
      const res = await apiSend<{
        success: boolean;
        already_claimed?: boolean;
        streak?: number;
        payout?: number;
        softCurrency?: number;
        message?: string;
      }>("/api/rewards/daily-claim", {
        method: "POST",
        body: JSON.stringify({ wallet: p.walletAddress }),
      });
      if (!res.success) {
        setStatus(res.message || "Claim failed");
        return;
      }
      await pullProfileFromServer(p.walletAddress);
      if (res.already_claimed) {
        setStatus(`Already claimed today. Streak: ${res.streak ?? "—"}.`);
      } else {
        setStatus(`Claimed +${res.payout ?? 0} coins. Streak ${res.streak ?? "—"}. Balance ${res.softCurrency ?? "—"}.`);
      }
      const local = loadLocalProfile();
      if (res.softCurrency != null) saveLocalProfile({ ...local, softCurrency: res.softCurrency });
    } catch (e) {
      setStatus(String((e as Error)?.message || e));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-orbitron text-2xl font-bold text-fuchsia-100">Daily rewards</h1>
        <p className="mt-2 text-sm text-cyan-100/75">
          Off-chain streak lives in the DashRunner backend. The contract exposes <code className="text-cyan-300/90">claimDailyReward</code>{" "}
          for an on-chain mirror you can call from a client or relayer.
        </p>
      </div>
      <button
        type="button"
        onClick={claim}
        className="rounded-2xl border border-yellow-200/40 bg-yellow-300/15 px-8 py-4 font-orbitron text-sm font-semibold uppercase tracking-wide text-yellow-50 transition hover:bg-yellow-300/25"
      >
        Claim today
      </button>
      {status && <p className="text-sm text-cyan-100/85">{status}</p>}
    </div>
  );
}
