import express from "express";
import {
	getAlerts,
	resolveAlert,
	clearResolvedAlerts,
	clearAllAlerts,
	resolveAllAlerts,
} from "../controllers/AlertControllers.js";
import { verifyAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// All alert routes are protected - require valid JWT
router.get("/", verifyAuth, getAlerts);
router.put("/:id/resolve", verifyAuth, resolveAlert);
router.put("/resolve-all", verifyAuth, resolveAllAlerts);
router.delete("/resolved", verifyAuth, clearResolvedAlerts);
router.delete("/all", verifyAuth, clearAllAlerts);

export default router;