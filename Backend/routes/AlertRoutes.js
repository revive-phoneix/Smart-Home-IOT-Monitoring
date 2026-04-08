import express from "express";
import {
	getAlerts,
	resolveAlert,
	clearResolvedAlerts,
	clearAllAlerts,
	resolveAllAlerts,
} from "../controllers/AlertControllers.js";

const router = express.Router();

router.get("/", getAlerts);
router.put("/:id/resolve", resolveAlert);
router.put("/resolve-all", resolveAllAlerts);
router.delete("/resolved", clearResolvedAlerts);
router.delete("/all", clearAllAlerts);

export default router;