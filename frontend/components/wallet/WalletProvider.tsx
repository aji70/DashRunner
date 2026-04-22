"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { appWagmiConfig } from "@/lib/wagmi";
import { WalletProfileSync } from "./WalletProfileSync";

import "@rainbow-me/rainbowkit/styles.css";

type WalletProviderProps = {
  children: ReactNode;
};

/**
 * App-wide: React Query, wagmi, RainbowKit. Required for <ConnectButton /> in the marketing shell.
 */
export function WalletProvider({ children }: WalletProviderProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={appWagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#e11d48",
            accentColorForeground: "#fffbeb",
            borderRadius: "medium",
            overlayBlur: "small",
            fontStack: "system",
          })}
          modalSize="compact"
        >
          <WalletProfileSync />
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
