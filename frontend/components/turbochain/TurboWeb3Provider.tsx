import type { ReactNode } from "react";

type TurboWeb3ProviderProps = {
  children: ReactNode;
};

/**
 * No-op: wagmi + RainbowKit are provided app-wide from `components/wallet/WalletProvider` (root `app/providers.tsx`).
 * Kept so existing `/turbochain` imports do not break.
 */
export function TurboWeb3Provider({ children }: TurboWeb3ProviderProps) {
  return children;
}
