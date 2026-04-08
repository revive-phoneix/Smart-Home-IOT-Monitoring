import express from "express";
import { toggleDevice, getDevices, createDevice, addPowerHistory, getPowerHistory } from "../controllers/DeviceControllers.js";  // UPDATED: Import getPowerHistory

const router = express.Router();

router.get("/", getDevices);  // NEW: Route to get all devices
router.post("/", createDevice); // NEW: Create a new device
router.put("/toggle/:id", toggleDevice);
router.post("/:deviceId/power-history", addPowerHistory); // NEW: Add power history entry
router.get("/:deviceId/power-history", getPowerHistory); // NEW: Get power history for device

export default router;