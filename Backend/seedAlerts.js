import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Alert from "./models/Alerts.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sampleAlertsPath = path.resolve(__dirname, "../Sample Data/alerts.json");

const seedAlerts = async () => {
  try {
    const rawData = await fs.readFile(sampleAlertsPath, "utf-8");
    const alerts = JSON.parse(rawData);

    await mongoose.connect(process.env.MONGO_URI);
    await Alert.deleteMany({});
    await Alert.insertMany(alerts);

    console.log(`Seeded ${alerts.length} alerts.`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed alerts:", error);
    process.exit(1);
  }
};

seedAlerts();
