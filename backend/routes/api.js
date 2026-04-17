import { Router } from "express";
import * as catalogController from "../controllers/catalogController.js";
import * as playerController from "../controllers/playerController.js";
import * as rewardsController from "../controllers/rewardsController.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true, service: "dashrunner-backend" });
});

router.get("/catalog", catalogController.getCatalog);

router.get("/player/:wallet", playerController.getPlayer);
router.patch("/player/:wallet", playerController.patchPlayer);
router.post("/player/:wallet/buy-character", playerController.purchaseCharacter);
router.post("/player/:wallet/shop-buy", playerController.purchaseShopItem);

router.post("/rewards/daily-claim", rewardsController.dailyClaim);

export default router;
