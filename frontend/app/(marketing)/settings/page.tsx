"use client";

import { useEffect, useState } from "react";
import {
  loadLocalProfile,
  saveLocalProfile,
  pullProfileFromServer,
  type PlayerProfileV1,
} from "@/lib/playerProfile";
import { apiSend } from "@/lib/api";

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
    <div className="space-y-8">
      <div>
        <h1 className="font-orbitron text-2xl font-bold text-fuchsia-100">Settings</h1>
        <p className="mt-2 text-sm text-cyan-100/75">
          Connect a wallet address for API sync (read-only verification — add signatures before production).
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-cyan-200/80">Wallet address</span>
        <input
          value={walletInput}
          onChange={(e) => setWalletInput(e.target.value)}
          placeholder="0x…"
          className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 font-mono text-sm text-cyan-50 outline-none ring-cyan-400/40 focus:ring-2"
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={saveWallet}
          className="rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/20 px-5 py-2 text-sm font-semibold text-fuchsia-50"
        >
          Save & sync
        </button>
        <button
          type="button"
          onClick={pushPrefs}
          className="rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-5 py-2 text-sm font-semibold text-cyan-50"
        >
          Push loadout
        </button>
      </div>

      <label className="flex items-center gap-3 text-sm text-cyan-100/90">
        <input type="checkbox" checked={muted} onChange={(e) => persistMute(e.target.checked)} className="h-4 w-4" />
        Mute audio in-game (stored in <code className="text-cyan-300/90">localStorage</code>)
      </label>

      {profile && (
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-cyan-100/80">
          <p>
            Soft currency (cached): <span className="font-mono text-cyan-200">{profile.softCurrency}</span>
          </p>
          <p className="mt-1">
            Streak: <span className="font-mono text-cyan-200">{profile.claimStreak}</span>
          </p>
        </div>
      )}

      {msg && <p className="text-sm text-yellow-200/90">{msg}</p>}
    </div>
  );
}
