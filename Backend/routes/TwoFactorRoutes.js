import express from "express";
import { verifyAuth } from "../middleware/authMiddleware.js";
import { setup2FA, verify2FA } from "../controllers/TwoFactorControllers.js";

const router = express.Router();

// Protect these routes with authentication
router.post("/setup", verifyAuth, setup2FA);
router.post("/verify", verifyAuth, verify2FA);

export default router;
