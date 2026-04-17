import { ethers } from "ethers";
import db from "../config/database.js";
import logger from "../config/logger.js";
import { readPlayerChainSnapshot } from "../services/dashRunnerContract.js";

function parseOwned(raw) {
  try {
    const arr = JSON.parse(raw || "[0]");
    if (!Array.isArray(arr)) return [0];
    return [...new Set([0, ...arr.map(Number)])];
  } catch {
    return [0];
  }
}

async function findOrCreate(wallet) {
  const row = await db("players").where({ wallet_address: wallet }).first();
  if (row) return row;
  await db("players").insert({
    wallet_address: wallet,
    soft_currency: 250,
    owned_character_ids: JSON.stringify([0]),
    selected_character_id: 0,
    selected_city_id: 0,
    claim_streak: 0,
  });
  return db("players").where({ wallet_address: wallet }).first();
}

export async function getPlayer(req, res) {
  try {
    let wallet = String(req.params.wallet || "").trim();
    if (!wallet) return res.status(400).json({ success: false, message: "wallet required" });
    wallet = ethers.getAddress(wallet);

    const row = await findOrCreate(wallet);
    const chain = await readPlayerChainSnapshot(wallet);

    res.json({
      success: true,
      data: {
        wallet,
        softCurrency: row.soft_currency,
        ownedCharacterIds: parseOwned(row.owned_character_ids),
        selectedCharacterId: row.selected_character_id,
        selectedCityId: row.selected_city_id,
        lastDailyClaimUtc: row.last_daily_claim_utc,
        claimStreak: row.claim_streak,
        settings: row.settings_json ? JSON.parse(row.settings_json) : {},
        chainSnapshot: chain,
      },
    });
  } catch (e) {
    logger.error({ err: e?.message }, "getPlayer");
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function patchPlayer(req, res) {
  try {
    let wallet = String(req.params.wallet || "").trim();
    if (!wallet) return res.status(400).json({ success: false, message: "wallet required" });
    wallet = ethers.getAddress(wallet);

    const body = req.body || {};
    const row = await findOrCreate(wallet);
    const owned = parseOwned(row.owned_character_ids);

    const patch = {};
    if (body.selectedCharacterId !== undefined) {
      const cid = Number(body.selectedCharacterId);
      if (!owned.includes(cid)) {
        return res.status(400).json({ success: false, message: "Character not owned" });
      }
      patch.selected_character_id = cid;
    }
    if (body.selectedCityId !== undefined) {
      const cy = Number(body.selectedCityId);
      if (cy < 0 || cy > 31) return res.status(400).json({ success: false, message: "Invalid city" });
      patch.selected_city_id = cy;
    }
    if (body.settings !== undefined) {
      patch.settings_json = JSON.stringify(body.settings);
    }

    if (Object.keys(patch).length) {
      await db("players").where({ id: row.id }).update(patch);
    }

    const next = await db("players").where({ id: row.id }).first();
    res.json({
      success: true,
      data: {
        wallet,
        softCurrency: next.soft_currency,
        ownedCharacterIds: parseOwned(next.owned_character_ids),
        selectedCharacterId: next.selected_character_id,
        selectedCityId: next.selected_city_id,
        lastDailyClaimUtc: next.last_daily_claim_utc,
        claimStreak: next.claim_streak,
        settings: next.settings_json ? JSON.parse(next.settings_json) : {},
      },
    });
  } catch (e) {
    logger.error({ err: e?.message }, "patchPlayer");
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function purchaseCharacter(req, res) {
  try {
    let wallet = String(req.params.wallet || "").trim();
    wallet = ethers.getAddress(wallet);
    const characterId = Number(req.body?.characterId);
    if (!Number.isFinite(characterId) || characterId <= 0) {
      return res.status(400).json({ success: false, message: "characterId required" });
    }

    const prices = { 1: 400, 2: 650, 3: 900 };
    const price = prices[characterId];
    if (!price) return res.status(400).json({ success: false, message: "Unknown character" });

    const row = await findOrCreate(wallet);
    const owned = parseOwned(row.owned_character_ids);
    if (owned.includes(characterId)) {
      return res.json({ success: true, alreadyOwned: true, data: { ownedCharacterIds: owned } });
    }
    if (row.soft_currency < price) {
      return res.status(402).json({ success: false, message: "Not enough soft currency" });
    }

    const nextOwned = [...owned, characterId].sort((a, b) => a - b);
    await db("players")
      .where({ id: row.id })
      .update({
        soft_currency: row.soft_currency - price,
        owned_character_ids: JSON.stringify(nextOwned),
      });

    const next = await db("players").where({ id: row.id }).first();
    res.json({
      success: true,
      data: {
        softCurrency: next.soft_currency,
        ownedCharacterIds: parseOwned(next.owned_character_ids),
      },
    });
  } catch (e) {
    logger.error({ err: e?.message }, "purchaseCharacter");
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function purchaseShopItem(req, res) {
  try {
    let wallet = String(req.params.wallet || "").trim();
    wallet = ethers.getAddress(wallet);
    const itemId = String(req.body?.itemId || "");
    const prices = {
      coin_magnet_1h: 120,
      shield_crash: 200,
      trail_pack: 350,
      city_pass: 500,
    };
    const price = prices[itemId];
    if (!price) return res.status(400).json({ success: false, message: "Unknown item" });

    const row = await findOrCreate(wallet);
    if (row.soft_currency < price) {
      return res.status(402).json({ success: false, message: "Not enough soft currency" });
    }

    await db("players")
      .where({ id: row.id })
      .update({ soft_currency: row.soft_currency - price });

    const next = await db("players").where({ id: row.id }).first();
    res.json({
      success: true,
      data: { softCurrency: next.soft_currency, itemId },
    });
  } catch (e) {
    logger.error({ err: e?.message }, "purchaseShopItem");
    res.status(500).json({ success: false, message: "Server error" });
  }
}
