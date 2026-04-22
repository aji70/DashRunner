import { ethers } from "ethers";
import {
  dashRunnerAddress,
  encodeBuyCharacter,
  encodeClaimDailyReward,
  encodeDashStep,
  encodeSetLoadout,
  encodeSubmitRun,
  encodeSignalBare,
  encodeSignalTagged,
  encodeUsdcApprove,
  getProvider,
  getReadContract,
  isConfigured,
  readFullSnapshot,
  rpcUrl,
  txPayload,
  chainId,
} from "../services/dashRunnerChain.js";

export function meta(_req, res) {
  const addr = dashRunnerAddress();
  const rpc = rpcUrl();
  res.json({
    success: true,
    chainId: chainId(),
    contractAddress: addr || null,
    rpcConfigured: Boolean(rpc),
    note:
      "POST /tx/* returns unsigned calldata for Privy wallets. Sender must execute = user pays gas unless using a sponsor/paymaster.",
  });
}

export async function snapshot(req, res) {
  try {
    let wallet = String(req.params.wallet || "").trim();
    if (!wallet) return res.status(400).json({ success: false, message: "wallet required" });
    wallet = ethers.getAddress(wallet);
    if (!isConfigured()) return res.json({ success: true, snapshot: null, configured: false });
    const snapshot = await readFullSnapshot(wallet);
    return res.json({ success: true, configured: true, snapshot });
  } catch (e) {
    return res.status(400).json({ success: false, message: String(e?.shortMessage || e?.message || e) });
  }
}

function parseU256(obj, keys) {
  const out = {};
  for (const k of keys) {
    const raw = obj[k];
    if (raw === undefined || raw === null) throw new Error(`missing ${k}`);
    const s = typeof raw === "bigint" ? raw.toString() : String(raw).trim();
    out[k] = BigInt(s);
  }
  return out;
}

export async function prepareSubmitRun(req, res) {
  try {
    const {
      score,
      coinsCollected,
      distanceTraveled,
      jumps,
      leftActions,
      rightActions,
      boostCollected,
    } = parseU256(req.body ?? {}, [
      "score",
      "coinsCollected",
      "distanceTraveled",
      "jumps",
      "leftActions",
      "rightActions",
      "boostCollected",
    ]);
    const data = encodeSubmitRun({
      score,
      coinsCollected,
      distanceTraveled,
      jumps,
      leftActions,
      rightActions,
      boostCollected,
    });
    res.json({
      success: true,
      wallet: req.chainWallet,
      transaction: txPayload(data),
      action: "submitRun",
    });
  } catch (e) {
    res.status(400).json({ success: false, message: String(e?.message || e) });
  }
}

export async function prepareBuyCharacter(req, res) {
  try {
    const cid = Number(req.body?.characterId);
    if (!Number.isFinite(cid) || cid < 0 || cid > 255) {
      return res.status(400).json({ success: false, message: "characterId required (0–255)" });
    }
    const data = encodeBuyCharacter(cid);
    res.json({
      success: true,
      wallet: req.chainWallet,
      transaction: txPayload(data),
      action: "buyCharacter",
      reminder: "Approve USDC first (prepare-usdc-approve) unless allowance covers price.",
    });
  } catch (e) {
    res.status(400).json({ success: false, message: String(e?.message || e) });
  }
}

export async function prepareSetLoadout(req, res) {
  try {
    const characterId = Number(req.body?.characterId);
    const cityId = Number(req.body?.cityId);
    if (!Number.isFinite(characterId) || characterId < 0 || characterId > 255) {
      return res.status(400).json({ success: false, message: "characterId invalid" });
    }
    if (!Number.isFinite(cityId) || cityId < 0 || cityId > 255) {
      return res.status(400).json({ success: false, message: "cityId invalid" });
    }
    const data = encodeSetLoadout(characterId, cityId);
    res.json({ success: true, wallet: req.chainWallet, transaction: txPayload(data), action: "setLoadout" });
  } catch (e) {
    res.status(400).json({ success: false, message: String(e?.message || e) });
  }
}

export async function prepareClaimDailyReward(req, res) {
  try {
    const data = encodeClaimDailyReward();
    res.json({
      success: true,
      wallet: req.chainWallet,
      transaction: txPayload(data),
      action: "claimDailyReward",
    });
  } catch (e) {
    res.status(400).json({ success: false, message: String(e?.message || e) });
  }
}

export async function prepareSignal(req, res) {
  try {
    const tag = req.body?.tag;
    const data =
      tag === undefined || tag === null || tag === ""
        ? encodeSignalBare()
        : encodeSignalTagged(BigInt(String(tag)));
    res.json({
      success: true,
      wallet: req.chainWallet,
      transaction: txPayload(data),
      action: tag === undefined || tag === null || tag === "" ? "signal" : "signal(uint256)",
    });
  } catch (e) {
    res.status(400).json({ success: false, message: String(e?.message || e) });
  }
}

export async function prepareDashStep(req, res) {
  try {
    const data = encodeDashStep();
    res.json({
      success: true,
      wallet: req.chainWallet,
      transaction: txPayload(data),
      action: "dashStep",
    });
  } catch (e) {
    res.status(400).json({ success: false, message: String(e?.message || e) });
  }
}

export async function prepareUsdcApprove(req, res) {
  try {
    const spender = String(req.body?.spender || dashRunnerAddress()).trim();
    ethers.getAddress(spender);
    const amount = BigInt(String(req.body?.amount ?? "").trim() || "0");
    if (amount <= 0n) {
      return res.status(400).json({ success: false, message: "amount (raw USDC units) required" });
    }
    const c = getReadContract();
    const usdc = await c.usdc();
    if (!usdc || usdc === ethers.ZeroAddress) {
      return res.status(503).json({ success: false, message: "USDC not configured on contract" });
    }
    const data = encodeUsdcApprove(spender, amount);
    res.json({
      success: true,
      wallet: req.chainWallet,
      transaction: {
        chainId: chainId(),
        to: usdc,
        data,
        value: "0x0",
      },
      action: "approve",
      spender,
    });
  } catch (e) {
    res.status(400).json({ success: false, message: String(e?.message || e) });
  }
}

/** Read-only: USDC allowance for game contract */
export async function usdcAllowance(req, res) {
  try {
    const wallet = ethers.getAddress(String(req.params.wallet || "").trim());
    const c = getReadContract();
    const usdcAddr = await c.usdc();
    if (!usdcAddr || usdcAddr === ethers.ZeroAddress) {
      return res.json({ success: true, allowance: "0", usdc: null });
    }
    const erc = new ethers.Contract(
      usdcAddr,
      ["function allowance(address,address) view returns (uint256)"],
      getProvider()
    );
    const allowance = await erc.allowance(wallet, dashRunnerAddress());
    res.json({ success: true, allowance: allowance.toString(), usdc: usdcAddr });
  } catch (e) {
    res.status(400).json({ success: false, message: String(e?.message || e) });
  }
}
