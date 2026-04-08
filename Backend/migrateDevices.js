import dotenv from "dotenv";
import mongoose from "mongoose";
import Device from "./models/Device.js";

dotenv.config();

const mapDeviceType = (type) => {
  const normalizedType = String(type || "").trim().toLowerCase();

  if (["temperature-centric", "ac", "oven", "thermostat", "temperature"].includes(normalizedType)) {
    return "Temperature-Centric";
  }

  if (["humidity-centric", "humidifier", "dehumidifier", "humidity"].includes(normalizedType)) {
    return "Humidity-Centric";
  }

  if (["sensor-centric", "sensor"].includes(normalizedType)) {
    return "Sensor-Centric";
  }

  if (["air-quality-centric", "air quality", "air-quality", "air purifier", "air quality monitor"].includes(normalizedType)) {
    return "Air-Quality-Centric";
  }

  if (["water-quality-centric", "water quality centric", "water quality", "water"].includes(normalizedType)) {
    return "Water-Quality-Centric";
  }

  if (["control-centric", "light", "fan", "security", "smart plug", "switch"].includes(normalizedType)) {
    return "Control-Centric";
  }

  if (["energy-centric", "geyser", "heavy load"].includes(normalizedType)) {
    return "Energy-Centric";
  }

  return "Power-Centric";
};

const run = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in the environment.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const devices = await Device.find();
    let updatedCount = 0;

    for (const device of devices) {
      const nextType = mapDeviceType(device.type);
      const updates = {};

      if (device.type !== nextType) {
        updates.type = nextType;
      }

      if (device.status === undefined) {
        updates.status = false;
      }

      if (device.powerUsage === undefined || device.powerUsage === null) {
        updates.powerUsage = 0;
      }

      if (device.energy === undefined || device.energy === null) {
        updates.energy = 0;
      }

      if (device.temperature === undefined || device.temperature === null) {
        updates.temperature = 0;
      }

      if (device.humidity === undefined || device.humidity === null) {
        updates.humidity = 0;
      }

      if (Object.keys(updates).length > 0) {
        await Device.updateOne({ _id: device._id }, { $set: updates });
        updatedCount += 1;
      }
    }

    console.log(`Device migration complete. Updated ${updatedCount} documents.`);
  } catch (error) {
    console.error("Device migration failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
