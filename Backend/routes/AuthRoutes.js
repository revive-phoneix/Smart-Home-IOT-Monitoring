import express from "express";
import {
	signup,
	login,
	loginWithGoogle,
	getProfile,
	updateProfile,
	getUserSettings,
	updateUserSettings,
	createBackup,
	clearUserCache,
	deleteAccount,
} from "../controllers/AuthControllers.js";
import { verifyAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/google", loginWithGoogle);

// Protected routes
router.get("/profile", verifyAuth, getProfile);
router.put("/profile", verifyAuth, updateProfile);
router.get("/settings", verifyAuth, getUserSettings);
router.put("/settings", verifyAuth, updateUserSettings);
router.post("/settings/backup", verifyAuth, createBackup);
router.post("/settings/clear-cache", verifyAuth, clearUserCache);
router.delete("/account", verifyAuth, deleteAccount);

export default router;