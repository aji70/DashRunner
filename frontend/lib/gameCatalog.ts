export type CityRoute = {
  id: number;
  name: string;
  tagline: string;
  region: string;
};

export type RunnerCharacter = {
  id: number;
  name: string;
  role: string;
  accentHex: string;
  /** Soft currency price when buying off-chain (backend). */
  priceCoins: number;
  /** On-chain character id for `buyCharacter` / bitmask (must match contract). */
  onChainId: number;
};

export type ShopItem = {
  id: string;
  name: string;
  description: string;
  priceCoins: number;
  kind: "boost" | "cosmetic" | "bundle";
};

export const CITY_ROUTES: CityRoute[] = [
  { id: 0, name: "Neo Veridia", tagline: "Glass towers & synth fog", region: "Pacific megasprawl" },
  { id: 1, name: "Neon Pulse", tagline: "Holographic layers & purple haze", region: "Cyber downtown" },
  { id: 2, name: "Verdant Grove", tagline: "Biolume parks & clean lanes", region: "Forest-ring city" },
  { id: 3, name: "Evergreen Sprint", tagline: "Ancient trees & neon roads", region: "Deep forest" },
  { id: 4, name: "Helios Grid", tagline: "Solar flares on midnight rails", region: "Desert arcology" },
  { id: 5, name: "Dune Runner", tagline: "Sand storms & golden architecture", region: "Desert expanse" },
  { id: 6, name: "Crimson Harbor", tagline: "Neon rain over wet asphalt", region: "Coastal old-world" },
  { id: 7, name: "Tide Break", tagline: "Ocean spray & neon piers", region: "Seaside bay" },
  { id: 8, name: "Frost Gate", tagline: "Polar lights on frozen rooftops", region: "Arctic transit hub" },
  { id: 9, name: "Blizzard Loop", tagline: "Glacial peaks & icy paths", region: "Arctic expanse" },
  { id: 10, name: "Magma Ward", tagline: "Heat shimmer & hazard glow", region: "Volcanic industrial" },
  { id: 11, name: "Lava Forge", tagline: "Molten streams & inferno skyline", region: "Volcanic core" },
  { id: 12, name: "Synth Wave", tagline: "Retro neon & synthpop vibes", region: "Cyber underground" },
];

export const RUNNER_CHARACTERS: RunnerCharacter[] = [
  { id: 0, name: "Dash Prime", role: "Starter frame", accentHex: "#22d3ee", priceCoins: 0, onChainId: 0 },
  { id: 1, name: "Volt Lynx", role: "Agile striker", accentHex: "#c084fc", priceCoins: 400, onChainId: 1 },
  { id: 2, name: "Solar Fox", role: "Speed focus", accentHex: "#fbbf24", priceCoins: 650, onChainId: 2 },
  { id: 3, name: "Cinder Runner", role: "Endurance build", accentHex: "#fb7185", priceCoins: 900, onChainId: 3 },
];

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "coin_magnet_1h",
    name: "Coin Magnet (1h)",
    description: "Backend-tracked boost: extra soft currency from runs for one hour.",
    priceCoins: 120,
    kind: "boost",
  },
  {
    id: "shield_crash",
    name: "Crash Shield ×3",
    description: "Forgive the next three face-plants in ranked sync (off-chain).",
    priceCoins: 200,
    kind: "boost",
  },
  {
    id: "trail_pack",
    name: "Holo Trail Pack",
    description: "Cosmetic particle trails for your runner (client-side).",
    priceCoins: 350,
    kind: "cosmetic",
  },
  {
    id: "city_pass",
    name: "City Hopper Pass",
    description: "Unlocks all city routes in the hub for seven days (off-chain).",
    priceCoins: 500,
    kind: "bundle",
  },
];
