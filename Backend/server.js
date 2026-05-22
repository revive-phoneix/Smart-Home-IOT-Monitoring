import express from "express";
import http from "http";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import authRoutes from "./routes/AuthRoutes.js";
import alertRoutes from "./routes/AlertRoutes.js";
import statsRoutes from "./routes/StatsRoutes.js";
import deviceRoutes from "./routes/DeviceRoutes.js";
import { initSocket } from "./sockets/socket.js";
import { closeMQTT, initMQTT } from "./config/mqtt.js";
import twoFactorRoutes from "./routes/TwoFactorRoutes.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Restricted CORS Configuration
const configuredOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const devOrigins = ["http://localhost:5173", "http://localhost:5174"];
const allowedOrigins = [
  ...new Set(
    process.env.NODE_ENV === "production"
      ? configuredOrigins
      : [...configuredOrigins, ...devOrigins]
  ),
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true,
};

// Middleware
// Security headers
app.use(helmet());
// HTTP request logging
app.use(morgan("tiny"));
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/devices", deviceRoutes);

initSocket(server, allowedOrigins);
initMQTT();

// Two-factor routes
app.use("/api/auth/2fa", twoFactorRoutes);

// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const shutdown = async () => {
  await closeMQTT();
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);