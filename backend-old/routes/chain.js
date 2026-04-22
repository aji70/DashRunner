import { Router } from "express";
import * as chainController from "../controllers/chainController.js";
import { requirePrivyWallet } from "../services/privyAuth.js";

const router = Router();

router.get("/meta", chainController.meta);
router.get("/wallet/:wallet/snapshot", chainController.snapshot);
router.get("/wallet/:wallet/usdc-allowance", chainController.usdcAllowance);

router.post("/tx/prepare-submit-run", requirePrivyWallet, chainController.prepareSubmitRun);
router.post("/tx/prepare-buy-character", requirePrivyWallet, chainController.prepareBuyCharacter);
router.post("/tx/prepare-set-loadout", requirePrivyWallet, chainController.prepareSetLoadout);
router.post("/tx/prepare-claim-daily-reward", requirePrivyWallet, chainController.prepareClaimDailyReward);
router.post("/tx/prepare-signal", requirePrivyWallet, chainController.prepareSignal);
router.post("/tx/prepare-dash-step", requirePrivyWallet, chainController.prepareDashStep);
router.post("/tx/prepare-usdc-approve", requirePrivyWallet, chainController.prepareUsdcApprove);

export default router;
