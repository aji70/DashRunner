"use client";

import { useEffect, useState } from "react";
import {
  loadLocalProfile,
  saveLocalProfile,
  pullProfileFromServer,
  type PlayerProfileV1,
} from "@/lib/playerProfile";
import { apiSend } from "@/lib/api";
import { PageHeader, Kbd } from "@/components/ui/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { InlineNotice } from "@/components/ui/InlineNotice";

export default function SettingsPage() {
  const [profile, setProfile] = useState<PlayerProfileV1 | null>(null);
  const [walletInput, setWalletInput] = useState("");
  const [muted, setMuted] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const p = loadLocalProfile();
    setProfile(p);
    setWalletInput(p.walletAddress || "");
    setMuted(typeof window !== "undefined" && window.localStorage.getItem("runner_muted") === "true");
  }, []);

  const persistMute = (next: boolean) => {
    setMuted(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("runner_muted", next ? "true" : "false");
    }
  };

  const saveWallet = async () => {
    setMsg(null);
    const w = walletInput.trim();
    if (!w) {
      const next = { ...loadLocalProfile(), walletAddress: null };
      saveLocalProfile(next);
      setProfile(next);
      setMsg("Cleared wallet. Progress stays on-device only.");
      return;
    }
    try {
      const pulled = await pullProfileFromServer(w);
      if (pulled) {
        setProfile(pulled);
        setMsg("Wallet saved and synced from the backend.");
      } else {
        const next = { ...loadLocalProfile(), walletAddress: w };
        saveLocalProfile(next);
        setProfile(next);
        setMsg("Wallet saved locally. Start the backend to sync.");
      }
    } catch (e) {
      setMsg(String((e as Error)?.message || e));
    }
  };

  const pushPrefs = async () => {
    if (!profile?.walletAddress) {
      setMsg("Set a wallet first to push loadout.");
      return;
    }
    setMsg(null);
    try {
      await apiSend(`/api/player/${encodeURIComponent(profile.walletAddress)}`, {
        method: "PATCH",
        body: JSON.stringify({
          selectedCharacterId: profile.selectedCharacterId,
          selectedCityId: profile.selectedCityId,
        }),
      });
      setMsg("Loadout pushed to backend.");
    } catch (e) {
      setMsg(String((e as Error)?.message || e));
    }
  };

  return (
    <div className="space-y-10">
      <PageHeader eyebrow="Identity" title="Settings">
        Connect a wallet address for API sync. Treat this as read-only plumbing until you add signature verification for
        production.
      </PageHeader>

      <GlassPanel className="space-y-8 p-6 sm:p-8">
        <TextField label="Wallet address" value={walletInput} onChange={(e) => setWalletInput(e.target.value)} placeholder="0x…" />

        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={saveWallet}>
            Save & sync
          </Button>
          <Button variant="secondary" onClick={pushPrefs}>
            Push loadout
          </Button>
        </div>

        <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-white/[0.06] bg-black/30 p-4 transition hover:border-cyan-400/20">
          <input
            type="checkbox"
            checked={muted}
            onChange={(e) => persistMute(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-white/20 bg-black/50 text-fuchsia-500 focus:ring-cyan-400/40"
          />
          <span>
            <span className="block font-orbitron text-xs font-bold uppercase tracking-wide text-[var(--text-primary)]">
              Mute in-game audio
            </span>
            <span className="mt-1 block font-rajdhani text-sm text-[var(--text-secondary)]">
              Stored in <Kbd>localStorage</Kbd> as <Kbd>runner_muted</Kbd>.
            </span>
          </span>
        </label>
      </GlassPanel>

      {profile ? (
        <GlassPanel className="p-6 sm:p-8">
          <p className="font-rajdhani text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--text-dim)]">
            Cached profile
          </p>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="font-rajdhani text-xs text-[var(--text-dim)]">Soft currency</dt>
              <dd className="mt-1 font-orbitron text-xl font-bold tabular-nums text-cyan-100">{profile.softCurrency}</dd>
            </div>
            <div>
              <dt className="font-rajdhani text-xs text-[var(--text-dim)]">Claim streak</dt>
              <dd className="mt-1 font-orbitron text-xl font-bold tabular-nums text-fuchsia-100">{profile.claimStreak}</dd>
            </div>
          </dl>
        </GlassPanel>
      ) : null}

      {msg ? (
        <InlineNotice tone={msg.includes("synced") || msg.includes("pushed") ? "success" : "info"}>{msg}</InlineNotice>
      ) : null}
    </div>
  );
}
