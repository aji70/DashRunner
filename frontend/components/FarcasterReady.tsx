"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect } from "react";

/** Signals the host that the Mini App UI is ready (Farcaster / MiniPay shell). */
export default function FarcasterReady() {
  useEffect(() => {
    void sdk.actions.ready();
  }, []);
  return null;
}
