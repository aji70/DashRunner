/** Same rules as Tycoon: explicit URL env, then Vercel preview/prod host, else localhost. */
const ROOT_URL = (() => {
  const fromEnv = process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv?.trim()) return fromEnv.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;
  return "http://localhost:3000";
})();

/**
 * Mini App manifest data (Farcaster). Served at `/.well-known/farcaster.json`.
 * `requiredChains` targets Celo mainnet for MiniPay.
 *
 * @see https://miniapps.farcaster.xyz/docs/guides/publishing
 */
export const minikitConfig = {
  miniapp: {
    version: "1" as const,
    name: "DashRunner",
    subtitle: "Neon runner for MiniPay",
    description:
      "Swipe an endless neon runner on Celo. City routes, shop, rewards, and score sync tuned for MiniPay.",
    iconUrl: `${ROOT_URL}/icon`,
    splashImageUrl: `${ROOT_URL}/icon`,
    splashBackgroundColor: "#010F10",
    homeUrl: `${ROOT_URL}/play`,
    primaryCategory: "games" as const,
    tags: ["minipay", "celo", "runner", "endless", "games"],
    heroImageUrl: `${ROOT_URL}/opengraph-image`,
    tagline: "Run on Celo in MiniPay",
    ogTitle: "DashRunner",
    ogDescription: "Neon endless runner for MiniPay on Celo.",
    ogImageUrl: `${ROOT_URL}/opengraph-image`,
    /** Celo mainnet — MiniPay default chain (CAIP-2). */
    requiredChains: ["eip155:42220"] as const,
  },
} as const;

export type MinikitConfig = typeof minikitConfig;
