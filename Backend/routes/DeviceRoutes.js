import express from "express";
import { toggleDevice, getDevices, createDevice, addPowerHistory, getPowerHistory } from "../controllers/DeviceControllers.js";  // UPDATED: Import getPowerHistory
import { verifyAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// All device routes are protected - require valid JWT
router.get("/", verifyAuth, getDevices);  // NEW: Route to get all devices
router.post("/", verifyAuth, createDevice); // NEW: Create a new device
router.put("/toggle/:id", verifyAuth, toggleDevice);
router.post("/:deviceId/power-history", verifyAuth, addPowerHistory); // NEW: Add power history entry
router.get("/:deviceId/power-history", verifyAuth, getPowerHistory); // NEW: Get power history for device

export default router;