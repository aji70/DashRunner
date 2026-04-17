const cities = [
  { id: 0, name: "Neo Veridia", tagline: "Glass towers & synth fog", region: "Pacific megasprawl" },
  { id: 1, name: "Helios Grid", tagline: "Solar flares on midnight rails", region: "Desert arcology" },
  { id: 2, name: "Crimson Harbor", tagline: "Neon rain over wet asphalt", region: "Coastal old-world" },
  { id: 3, name: "Evergreen Sprint", tagline: "Biolume parks & clean lanes", region: "Forest-ring city" },
  { id: 4, name: "Magma Ward", tagline: "Heat shimmer & hazard glow", region: "Volcanic industrial" },
  { id: 5, name: "Aurora Line", tagline: "Polar lights on frozen rooftops", region: "Arctic transit hub" },
];

const characters = [
  { id: 0, name: "Dash Prime", role: "Starter frame", accentHex: "#22d3ee", priceCoins: 0, onChainId: 0 },
  { id: 1, name: "Volt Lynx", role: "Agile striker", accentHex: "#c084fc", priceCoins: 400, onChainId: 1 },
  { id: 2, name: "Solar Fox", role: "Speed focus", accentHex: "#fbbf24", priceCoins: 650, onChainId: 2 },
  { id: 3, name: "Cinder Runner", role: "Endurance build", accentHex: "#fb7185", priceCoins: 900, onChainId: 3 },
];

const shop = [
  {
    id: "coin_magnet_1h",
    name: "Coin Magnet (1h)",
    description: "Extra soft currency from synced runs for one hour.",
    priceCoins: 120,
    kind: "boost",
  },
  {
    id: "shield_crash",
    name: "Crash Shield ×3",
    description: "Forgive the next three face-plants in ranked sync.",
    priceCoins: 200,
    kind: "boost",
  },
  {
    id: "trail_pack",
    name: "Holo Trail Pack",
    description: "Cosmetic particle trails for your runner.",
    priceCoins: 350,
    kind: "cosmetic",
  },
  {
    id: "city_pass",
    name: "City Hopper Pass",
    description: "Unlocks all city routes in the hub for seven days.",
    priceCoins: 500,
    kind: "bundle",
  },
];

export function getCatalog(_req, res) {
  res.json({
    success: true,
    data: { cities, characters, shop },
  });
}
