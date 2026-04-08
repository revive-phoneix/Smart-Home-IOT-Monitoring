import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Device from "./models/Device.js";
import PowerHistory from "./models/PowerHistory.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const samplePath = path.resolve(__dirname, "../Sample Data/powerhistories_dashboard_devices.json");

const normalize = (value) => String(value || "").trim().toLowerCase();

const run = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    const raw = await fs.readFile(samplePath, "utf-8");
    const payload = JSON.parse(raw);

    if (!Array.isArray(payload) || payload.length === 0) {
      throw new Error("No power history records found in sample JSON.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    let linkedCount = 0;
    let skippedCount = 0;

    for (const item of payload) {
      const name = String(item.name || "").trim();
      const location = String(item.location || "").trim();

      if (!name) {
        skippedCount += 1;
        continue;
      }

      const matchedDevice = await Device.findOne({
        name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
      });

      if (!matchedDevice) {
        console.log(`Skipped: device not found for '${name}'`);
        skippedCount += 1;
        continue;
      }

      // Keep exactly one latest seeded history per device from this file.
      await PowerHistory.deleteMany({ deviceId: matchedDevice._id });
      await Device.findByIdAndUpdate(matchedDevice._id, { $set: { powerHistory: [] } });

      const historyDoc = await PowerHistory.create({
        deviceId: matchedDevice._id,
        name: matchedDevice.name,
        location: matchedDevice.location || location || "Unknown",
        Power: Array.isArray(item.Power) ? item.Power : [],
        Energy: Array.isArray(item.Energy) ? item.Energy : [],
      });

      await Device.findByIdAndUpdate(matchedDevice._id, {
        $push: { powerHistory: historyDoc._id },
      });

      linkedCount += 1;
      console.log(`Linked history -> ${matchedDevice.name} (${matchedDevice._id})`);
    }

    console.log(`Done. Linked: ${linkedCount}, Skipped: ${skippedCount}`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed dashboard power history:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

run();
