"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { turboWagmiConfig } from "@/lib/turbochain/wagmi";
import { turboBg, turboLime } from "@/lib/turbochain/theme";

import "@rainbow-me/rainbowkit/styles.css";

type TurboWeb3ProviderProps = {
  children: ReactNode;
};

/**
 * Client-side Web3 stack for TurboChain routes: React Query, wagmi, RainbowKit (dark theme tuned to Turbo palette).
 */
export function TurboWeb3Provider({ children }: TurboWeb3ProviderProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={turboWagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: turboLime,
            accentColorForeground: turboBg,
            borderRadius: "medium",
            overlayBlur: "small",
          })}
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
