"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { loadLocalProfile, saveLocalProfile, pullProfileFromServer } from "@/lib/playerProfile";
import { apiSend } from "@/lib/api";
import { PageHeader, Kbd } from "@/components/ui/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { InlineNotice } from "@/components/ui/InlineNotice";

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
    <div className="space-y-10">
      <PageHeader eyebrow="Retention" title="Daily rewards">
        Off-chain streaks live in the DashRunner backend. The contract exposes <Kbd>claimDailyReward</Kbd> for an on-chain
        mirror you can trigger from a client or relayer.
      </PageHeader>

      <GlassPanel className="relative overflow-hidden p-8 sm:p-10">
        <div className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="relative max-w-xl">
          <p className="font-rajdhani text-sm leading-relaxed text-[var(--text-secondary)]">
            One claim per wallet per UTC day. Streak multipliers stack with your backend profile — keep the rhythm.
          </p>
          <motion.button
            type="button"
            onClick={claim}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="mt-8 w-full rounded-2xl border border-amber-300/40 bg-gradient-to-r from-amber-500/85 via-amber-600/75 to-orange-950/90 px-10 py-4 font-orbitron text-sm font-bold uppercase tracking-[0.2em] text-amber-50 shadow-[0_0_36px_rgba(251,191,36,0.22)] transition hover:border-amber-200/55 sm:w-auto"
          >
            Claim today
          </motion.button>
        </div>
      </GlassPanel>

      {status ? (
        <InlineNotice
          tone={
            status.startsWith("Claimed") ? "success" : status.startsWith("Already") ? "info" : "warn"
          }
        >
          {status}
        </InlineNotice>
      ) : null}
    </div>
  );
}
