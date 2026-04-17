import { ethers } from "ethers";
import logger from "../config/logger.js";

let provider;
let contract;

function addr() {
  return (process.env.DASHRUNNER_CONTRACT_ADDRESS || "").trim();
}

function rpc() {
  return (process.env.DASHRUNNER_RPC_URL || "").trim();
}

export function isContractConfigured() {
  return Boolean(rpc() && addr());
}

const abi = [
  "function bestRun(address) view returns (uint64,uint64,uint64,uint64,uint64,uint64,uint64,uint64)",
  "function selectedCharacterId(address) view returns (uint8)",
  "function selectedCityId(address) view returns (uint8)",
  "function ownsCharacter(address,uint8) view returns (bool)",
  "function lastDailyClaimDayIndex(address) view returns (uint32)",
  "function dailyClaimStreak(address) view returns (uint16)",
];

export async function readPlayerChainSnapshot(wallet) {
  if (!isContractConfigured()) return null;
  try {
    if (!provider) provider = new ethers.JsonRpcProvider(rpc());
    if (!contract) contract = new ethers.Contract(addr(), abi, provider);
    const w = ethers.getAddress(wallet);
    const best = await contract.bestRun(w);
    const characterId = Number(await contract.selectedCharacterId(w));
    const cityId = Number(await contract.selectedCityId(w));
    const lastDay = Number(await contract.lastDailyClaimDayIndex(w));
    const streak = Number(await contract.dailyClaimStreak(w));
    const owned = [];
    for (let i = 0; i < 8; i += 1) {
      if (await contract.ownsCharacter(w, i)) owned.push(i);
    }
    return {
      wallet: w,
      bestRun: {
        bestScore: Number(best[0]),
        bestCoins: Number(best[1]),
        bestDistance: Number(best[2]),
        lastSubmittedAt: Number(best[3]),
      },
      selectedCharacterId: characterId,
      selectedCityId: cityId,
      ownedCharacterIds: owned,
      chainDaily: { lastClaimDayIndex: lastDay, streak },
    };
  } catch (e) {
    logger.warn({ err: String(e?.message || e) }, "readPlayerChainSnapshot failed");
    return null;
  }
}
