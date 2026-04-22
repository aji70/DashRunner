import { PrivyClient } from "@privy-io/server-auth";
import { ethers } from "ethers";
import logger from "../config/logger.js";

let _client;

function getClient() {
  const appId = (process.env.PRIVY_APP_ID || "").trim();
  const appSecret = (process.env.PRIVY_APP_SECRET || "").trim();
  if (!appId || !appSecret) return null;
  if (!_client) _client = new PrivyClient(appId, appSecret);
  return _client;
}

export function isPrivyConfigured() {
  return Boolean(getClient());
}

/**
 * Linked EVM addresses for a Privy user (embedded + external wallets).
 * @param {import('@privy-io/server-auth').User} user
 */
export function walletAddressesFromPrivyUser(user) {
  const set = new Set();
  const linked = user?.linkedAccounts || [];
  for (const a of linked) {
    if (a?.type === "wallet" && a.address) {
      try {
        set.add(ethers.getAddress(a.address));
      } catch {
        /* skip */
      }
    }
    if (a?.type === "smart_wallet" && a.address) {
      try {
        set.add(ethers.getAddress(a.address));
      } catch {
        /* skip */
      }
    }
  }
  return set;
}

/**
 * Express middleware: Authorization Bearer token + header x-wallet-address must match a wallet on the Privy user.
 * Set req.chainWallet = checksummed address.
 *
 * If DASHRUNNER_CHAIN_AUTH_DISABLED=true or Privy not configured, only validates address format (dev).
 */
export async function requirePrivyWallet(req, res, next) {
  const rawWallet = String(req.headers["x-wallet-address"] || "").trim();
  if (!rawWallet) {
    return res.status(400).json({ success: false, message: "x-wallet-address header required" });
  }
  let wallet;
  try {
    wallet = ethers.getAddress(rawWallet);
  } catch {
    return res.status(400).json({ success: false, message: "invalid x-wallet-address" });
  }

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  const disabled =
    String(process.env.DASHRUNNER_CHAIN_AUTH_DISABLED || "").toLowerCase() === "true" ||
    String(process.env.DASHRUNNER_CHAIN_AUTH_DISABLED || "") === "1";

  const client = getClient();
  if (disabled || !client) {
    if (!disabled && !client) {
      logger.warn("Privy not configured (PRIVY_APP_ID / PRIVY_APP_SECRET); allowing tx-prep without wallet proof");
    }
    req.chainWallet = wallet;
    return next();
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Authorization Bearer token required" });
  }

  try {
    const claims = await client.verifyAuthToken(token);
    const userId = claims.user_id ?? claims.userId ?? claims.sub ?? claims.did;
    if (!userId) {
      return res.status(401).json({ success: false, message: "invalid token claims" });
    }
    const user = await client.getUser(userId);
    const allowed = walletAddressesFromPrivyUser(user);
    if (!allowed.has(wallet)) {
      return res.status(403).json({
        success: false,
        message: "wallet is not linked to this Privy user",
      });
    }
    req.chainWallet = wallet;
    req.privyUserId = userId;
    return next();
  } catch (e) {
    logger.warn({ err: String(e?.message || e) }, "Privy verify failed");
    return res.status(401).json({ success: false, message: "invalid or expired token" });
  }
}
