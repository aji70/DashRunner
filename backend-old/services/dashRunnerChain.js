import { ethers } from "ethers";
import logger from "../config/logger.js";
import {
  DASH_RUNNER_READ_WRITE_ABI,
  ERC20_MIN_ABI,
} from "./dashRunnerAbi.js";

export function rpcUrl() {
  return (process.env.DASHRUNNER_RPC_URL || "").trim();
}

export function dashRunnerAddress() {
  return (process.env.DASHRUNNER_CONTRACT_ADDRESS || "").trim();
}

export function chainId() {
  const raw = process.env.DASHRUNNER_CHAIN_ID ?? "42220";
  const n = Number(raw);
  return Number.isFinite(n) ? String(n) : "42220";
}

export function isConfigured() {
  return Boolean(rpcUrl() && dashRunnerAddress());
}

let provider;
let iface;

export function getInterface() {
  if (!iface) iface = new ethers.Interface(DASH_RUNNER_READ_WRITE_ABI);
  return iface;
}

export function getProvider() {
  if (!provider) provider = new ethers.JsonRpcProvider(rpcUrl());
  return provider;
}

/** @returns {ethers.Contract} read-only DashRunner at proxy */
export function getReadContract() {
  return new ethers.Contract(dashRunnerAddress(), DASH_RUNNER_READ_WRITE_ABI, getProvider());
}

/**
 * Serialize a tx request for Wagmi / Privy `sendTransaction`.
 */
export function txPayload(data, valueWei = 0n) {
  return {
    chainId: chainId(),
    to: dashRunnerAddress(),
    data,
    value: ethers.toBeHex(valueWei),
  };
}

export function encodeSubmitRun(args) {
  const {
    score,
    coinsCollected,
    distanceTraveled,
    jumps,
    leftActions,
    rightActions,
    boostCollected,
  } = args;
  return getInterface().encodeFunctionData("submitRun", [
    score,
    coinsCollected,
    distanceTraveled,
    jumps,
    leftActions,
    rightActions,
    boostCollected,
  ]);
}

export function encodeBuyCharacter(characterId) {
  return getInterface().encodeFunctionData("buyCharacter", [characterId]);
}

export function encodeSetLoadout(characterId, cityId) {
  return getInterface().encodeFunctionData("setLoadout", [characterId, cityId]);
}

export function encodeClaimDailyReward() {
  return getInterface().encodeFunctionData("claimDailyReward", []);
}

export function encodeSignalBare() {
  const fr = getInterface().getFunction("signal()");
  return getInterface().encodeFunctionData(fr, []);
}

export function encodeSignalTagged(tag) {
  return getInterface().encodeFunctionData("signal(uint256)", [tag]);
}

export function encodeDashStep() {
  return getInterface().encodeFunctionData("dashStep", []);
}

/** USDC approve for game contract as spender */
export function encodeUsdcApprove(spenderAddress, amount) {
  const i = new ethers.Interface(ERC20_MIN_ABI);
  return i.encodeFunctionData("approve", [spenderAddress, amount]);
}

export async function readFullSnapshot(wallet) {
  if (!isConfigured()) return null;
  try {
    const w = ethers.getAddress(wallet);
    const c = getReadContract();
    const best = await c.bestRun(w);
    const usdcAddr = await c.usdc();
    let usdcDecimals = 6;
    if (usdcAddr && usdcAddr !== ethers.ZeroAddress) {
      try {
        const erc20 = new ethers.Contract(usdcAddr, ERC20_MIN_ABI, getProvider());
        usdcDecimals = Number(await erc20.decimals());
      } catch {
        /* default 6 */
      }
    }
    const owned = [];
    for (let i = 0; i < 32; i += 1) {
      if (await c.ownsCharacter(w, i)) owned.push(i);
    }
    const prices = {};
    for (const id of owned.length ? [...owned, 1, 2, 3, 4, 5, 6, 7] : [1, 2, 3, 4, 5, 6, 7]) {
      try {
        const p = await c.characterPriceUsdc(id);
        if (p > 0n) prices[id] = p.toString();
      } catch {
        /* skip */
      }
    }
    return {
      wallet: w,
      chainId: chainId(),
      contractAddress: dashRunnerAddress(),
      usdc: usdcAddr,
      usdcDecimals,
      globalBestScore: (await c.globalBestScore()).toString(),
      globalBestHolder: await c.globalBestHolder(),
      scoreNft: await c.scoreNft(),
      bestRun: {
        bestScore: Number(best.bestScore),
        bestCoins: Number(best.bestCoins),
        bestDistance: Number(best.bestDistance),
        lastSubmittedAt: Number(best.lastSubmittedAt),
        bestJumps: Number(best.bestJumps),
        bestLeft: Number(best.bestLeft),
        bestRight: Number(best.bestRight),
        bestBoostCollected: Number(best.bestBoostCollected),
      },
      selectedCharacterId: Number(await c.selectedCharacterId(w)),
      selectedCityId: Number(await c.selectedCityId(w)),
      ownedCharacterIds: owned.sort((a, b) => a - b),
      chainDaily: {
        lastClaimDayIndex: Number(await c.lastDailyClaimDayIndex(w)),
        streak: Number(await c.dailyClaimStreak(w)),
      },
      dashSteps: Number(await c.dashSteps(w)),
      characterPriceUsdcById: prices,
    };
  } catch (e) {
    logger.warn({ err: String(e?.message || e) }, "readFullSnapshot failed");
    return null;
  }
}
