import express from "express";
import { getStats } from "../controllers/StatsControllers.js";
import { verifyAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Stats route is protected - requires valid JWT
router.get("/", verifyAuth, getStats);

export default router;