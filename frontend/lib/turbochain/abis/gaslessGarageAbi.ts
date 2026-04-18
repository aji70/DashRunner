/**
 * Minimal ABI for TurboChain `GaslessGarage` — gasless stat upgrades via wagmi `useWriteContract`.
 * Regenerate from Foundry `out/GaslessGarage.sol/GaslessGarage.json` when the contract interface changes.
 */
export const gaslessGarageAbi = [
  {
    type: "function",
    name: "upgradeStats",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "speed", type: "uint8" },
      { name: "handling", type: "uint8" },
      { name: "acceleration", type: "uint8" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getCarSpecs",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      {
        name: "specs",
        type: "tuple",
        components: [
          { name: "speed", type: "uint8" },
          { name: "handling", type: "uint8" },
          { name: "acceleration", type: "uint8" },
          { name: "tier", type: "uint8" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "carName",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "name_", type: "string" }],
  },
] as const;
