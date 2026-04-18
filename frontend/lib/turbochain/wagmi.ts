import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import { localhost, sepolia } from "wagmi/chains";

/**
 * Wagmi + RainbowKit configuration for TurboChain garage writes and read-only stat calls.
 * Set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in production (https://cloud.walletconnect.com).
 */
export const turboWagmiConfig = getDefaultConfig({
  appName: "TurboChain",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "turbochain_dev_placeholder",
  chains: [localhost, sepolia],
  transports: {
    [localhost.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
});
