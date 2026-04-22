"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";
import { loadLocalProfile, saveLocalProfile } from "@/lib/playerProfile";

/** Persists the connected EVM address into the local player profile for shop/rewards API calls. */
export function WalletProfileSync() {
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (typeof window === "undefined" || !isConnected || !address) {
      return;
    }
    const p = loadLocalProfile();
    if (p.walletAddress?.toLowerCase() === address.toLowerCase()) {
      return;
    }
    saveLocalProfile({ ...p, walletAddress: address });
  }, [address, isConnected]);

  return null;
}
