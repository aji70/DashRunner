/**
 * Interface strings for DashRunner (proxy) and USDC `approve` for `buyCharacter` flow.
 * @see contract/src/DashRunner.sol
 */
export const DASH_RUNNER_READ_WRITE_ABI = [
  "function bestRun(address) view returns (uint64 bestScore, uint64 bestCoins, uint64 bestDistance, uint64 lastSubmittedAt, uint64 bestJumps, uint64 bestLeft, uint64 bestRight, uint64 bestBoostCollected)",
  "function globalBestScore() view returns (uint256)",
  "function globalBestHolder() view returns (address)",
  "function scoreNft() view returns (address)",
  "function usdc() view returns (address)",
  "function characterPriceUsdc(uint8) view returns (uint256)",
  "function characterOwnershipMask(address) view returns (uint256)",
  "function selectedCharacterId(address) view returns (uint8)",
  "function selectedCityId(address) view returns (uint8)",
  "function lastDailyClaimDayIndex(address) view returns (uint32)",
  "function dailyClaimStreak(address) view returns (uint16)",
  "function ownsCharacter(address,uint8) view returns (bool)",
  "function dashSteps(address) view returns (uint64)",
  "function buyCharacter(uint8 characterId) external",
  "function setLoadout(uint8 characterId, uint8 cityId) external",
  "function claimDailyReward() external",
  "function submitRun(uint256 score, uint256 coinsCollected, uint256 distanceTraveled, uint256 jumps, uint256 leftActions, uint256 rightActions, uint256 boostCollected) external",
  "function signal() external",
  "function signal(uint256) external",
  "function dashStep() external",
];

export const ERC20_MIN_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
];
