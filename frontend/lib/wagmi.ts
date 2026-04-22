import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import { celo, celoAlfajores, localhost, sepolia } from "wagmi/chains";

/**
 * Single wagmi + RainbowKit config for DashRunner (Celo / MiniPay) and TurboChain demo pages.
 * Set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` from https://cloud.walletconnect.com
 */
export const appWagmiConfig = getDefaultConfig({
  appName: "DashRunner",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "DEMO_WALLETCONNECT_PROJECT_ID",
  chains: [celo, celoAlfajores, sepolia, localhost],
  transports: {
    [celo.id]: http(),
    [celoAlfajores.id]: http(),
    [sepolia.id]: http(),
    [localhost.id]: http(),
  },
  ssr: true,
});
