import Device from "../models/Device.js";
import PowerHistory from "../models/PowerHistory.js";
import mongoose from "mongoose";
import { getIO } from "../sockets/socket.js";

export const toggleDevice = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid device id" });
    }

    const existingDevice = await Device.findById(id).select("status");
    if (!existingDevice) {
      return res.status(404).json({ message: "Device not found" });
    }

    const updatedDevice = await Device.findByIdAndUpdate(
      id,
      { $set: { status: !Boolean(existingDevice.status) } },
      { new: true }
    );

    const io = getIO();
    if (io) {
      io.emit("device:toggled", updatedDevice);
    }

    res.json(updatedDevice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// NEW: Function to get all devices with power history
export const getDevices = async (req, res) => {
  try {
    const devices = await Device.find().populate("powerHistory");
    res.json(devices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createDevice = async (req, res) => {
  try {
    const {
      name,
      type,
      location,
      powerUsage,
      energy,
      temperature,
      humidity,
      firmware,
      mac,
      lastMaintenance,
    } = req.body;

    const newDevice = await Device.create({
      name,
      type,
      status: false,
      location,
      powerUsage,
      energy,
      temperature,
      humidity,
      firmware,
      mac,
      lastMaintenance,
      powerHistory: [],
    });

    const io = getIO();
    if (io) {
      io.emit("device:created", newDevice);
    }

    res.status(201).json(newDevice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// NEW: Function to add power history entry
export const addPowerHistory = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { Power, Energy } = req.body;

    // Get device name and location to include in power history
    const device = await Device.findById(deviceId);
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    const powerHistoryEntry = await PowerHistory.create({
      deviceId,
      name: device.name,
      location: device.location,
      Power: Power || [],
      Energy: Energy || [],
    });

    await Device.findByIdAndUpdate(deviceId, {
      $push: { powerHistory: powerHistoryEntry._id },
    });

    const io = getIO();
    if (io) {
      io.emit("power:updated", {
        deviceId,
        powerHistory: powerHistoryEntry,
      });
    }

    res.status(201).json(powerHistoryEntry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// NEW: Function to get power history for a specific device
export const getPowerHistory = async (req, res) => {
  try {
    const { deviceId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(deviceId)) {
      return res.status(400).json({ message: "Invalid device id" });
    }

    const device = await Device.findById(deviceId).select("name location");
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    let powerHistory = await PowerHistory.find({ deviceId })
      .sort({ timestamp: 1 });

    // Fallback for legacy/manual imports that were saved without proper ObjectId linkage.
    if (powerHistory.length === 0) {
      powerHistory = await PowerHistory.find({
        name: device.name,
        location: device.location,
      }).sort({ timestamp: 1 });
    }

    res.json(powerHistory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};