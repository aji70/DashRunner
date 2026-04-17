import db from "../config/database.js";
import logger from "../config/logger.js";
import { ethers } from "ethers";

function utcDayString(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function yesterdayString() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return utcDayString(d);
}

export async function dailyClaim(req, res) {
  try {
    let wallet = String(req.body?.wallet || "").trim();
    if (!wallet) return res.status(400).json({ success: false, message: "wallet required" });
    wallet = ethers.getAddress(wallet);

    const row = await db("players").where({ wallet_address: wallet }).first();
    if (!row) {
      return res.status(404).json({ success: false, message: "Player not found — GET /api/player/:wallet first" });
    }

    const today = utcDayString();
    if (row.last_daily_claim_utc === today) {
      return res.json({
        success: true,
        already_claimed: true,
        streak: row.claim_streak,
        softCurrency: row.soft_currency,
      });
    }

    let streak = 1;
    if (row.last_daily_claim_utc === yesterdayString()) {
      streak = Number(row.claim_streak || 0) + 1;
    }

    const base = 50;
    const bonus = Math.min(streak - 1, 7) * 10;
    const payout = base + bonus;

    await db("players")
      .where({ id: row.id })
      .update({
        last_daily_claim_utc: today,
        claim_streak: streak,
        soft_currency: row.soft_currency + payout,
      });

    const next = await db("players").where({ id: row.id }).first();
    res.json({
      success: true,
      already_claimed: false,
      streak,
      payout,
      softCurrency: next.soft_currency,
    });
  } catch (e) {
    logger.error({ err: e?.message }, "dailyClaim");
    res.status(500).json({ success: false, message: "Server error" });
  }
}
