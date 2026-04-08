import mqtt from "mqtt";
import Device from "../models/Device.js";
import Alert from "../models/Alerts.js";
import { getIO } from "../sockets/socket.js";

let mqttClient = null;

const formatMqttError = (error) => {
  if (!error) return "unknown error";

  const message = error.message || "no message";
  const code = error.code ? ` code=${error.code}` : "";
  const errno = error.errno ? ` errno=${error.errno}` : "";

  return `${message}${code}${errno}`.trim();
};

const parseJsonPayload = (bufferPayload) => {
  try {
    const text = String(bufferPayload || "").trim();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const toBooleanStatus = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return ["true", "1", "on", "online", "active"].includes(normalized);
  }
  return false;
};

const normalizeSeverity = (value) => {
  const severity = String(value || "LOW").trim().toUpperCase();
  if (severity === "HIGH" || severity === "CRITICAL") return "HIGH";
  if (severity === "MEDIUM" || severity === "WARNING") return "MEDIUM";
  return "LOW";
};

const findDeviceByTopicOrPayload = async (topic, payload = {}) => {
  const topicParts = String(topic).split("/");
  const topicDeviceToken = topicParts.length >= 3 ? topicParts[2] : null;
  const payloadDeviceToken = payload.deviceId || payload.deviceName || null;
  const token = payloadDeviceToken || topicDeviceToken;

  if (!token) return null;

  const device = await Device.findOne({
    $or: [{ _id: token }, { name: token }],
  }).catch(() => null);

  return device;
};

const handleTelemetryMessage = async (topic, payload) => {
  const device = await findDeviceByTopicOrPayload(topic, payload);
  if (!device) return;

  const updates = {};

  if (typeof payload.powerUsage === "number") updates.powerUsage = payload.powerUsage;
  if (typeof payload.energy === "number") updates.energy = payload.energy;
  if (typeof payload.temperature === "number") updates.temperature = payload.temperature;
  if (typeof payload.humidity === "number") updates.humidity = payload.humidity;
  if (payload.status !== undefined) updates.status = toBooleanStatus(payload.status);

  if (Object.keys(updates).length === 0) return;

  const updatedDevice = await Device.findByIdAndUpdate(device._id, updates, { new: true });
  if (!updatedDevice) return;

  const io = getIO();
  if (io) {
    io.emit("power:updated", {
      deviceId: String(updatedDevice._id),
      powerUsage: updatedDevice.powerUsage,
      energy: updatedDevice.energy,
      temperature: updatedDevice.temperature,
      humidity: updatedDevice.humidity,
    });

    io.emit("device:toggled", updatedDevice);
  }
};

const handleStatusMessage = async (topic, payload) => {
  const device = await findDeviceByTopicOrPayload(topic, payload);
  if (!device) return;

  const nextStatus = toBooleanStatus(payload.status ?? payload.value);
  const updatedDevice = await Device.findByIdAndUpdate(
    device._id,
    { status: nextStatus },
    { new: true }
  );

  const io = getIO();
  if (io && updatedDevice) {
    io.emit("device:toggled", updatedDevice);
  }
};

const handleAlertMessage = async (topic, payload) => {
  const device = await findDeviceByTopicOrPayload(topic, payload);

  const createdAlert = await Alert.create({
    deviceId: device?._id,
    deviceName: payload.deviceName || device?.name || "Unknown Device",
    message: payload.message || "Alert from MQTT device",
    severity: normalizeSeverity(payload.severity),
    status: "ACTIVE",
    createdAt: new Date(),
  });

  const io = getIO();
  if (io) {
    io.emit("alert:created", createdAlert);
  }
};

const subscribeDefaultTopics = () => {
  if (!mqttClient) return;

  const topics = [
    "smarthome/devices/+/telemetry",
    "smarthome/devices/+/status",
    "smarthome/devices/+/alerts",
    "smarthome/alerts",
  ];

  mqttClient.subscribe(topics, (error) => {
    if (error) {
      console.error("MQTT subscription error:", error.message);
    } else {
      console.log("MQTT subscriptions active:", topics.join(", "));
    }
  });
};

const onMessage = async (topic, message) => {
  const payload = parseJsonPayload(message);
  if (!payload) return;

  try {
    if (topic.endsWith("/telemetry")) {
      await handleTelemetryMessage(topic, payload);
      return;
    }

    if (topic.endsWith("/status")) {
      await handleStatusMessage(topic, payload);
      return;
    }

    if (topic.endsWith("/alerts") || topic === "smarthome/alerts") {
      await handleAlertMessage(topic, payload);
    }
  } catch (error) {
    console.error("MQTT message handling error:", error.message);
  }
};

export const initMQTT = () => {
  const mqttEnabled = String(process.env.MQTT_ENABLED || "false").toLowerCase() === "true";
  if (!mqttEnabled) {
    console.log("MQTT disabled (set MQTT_ENABLED=true to enable).");
    return null;
  }

  const brokerUrl = process.env.MQTT_BROKER_URL || "mqtt://localhost:1883";
  const clientId = process.env.MQTT_CLIENT_ID || `smarthome-backend-${Date.now()}`;

  mqttClient = mqtt.connect(brokerUrl, {
    clientId,
    username: process.env.MQTT_USERNAME || undefined,
    password: process.env.MQTT_PASSWORD || undefined,
    clean: true,
    reconnectPeriod: 2000,
    connectTimeout: 10_000,
  });

  mqttClient.on("connect", () => {
    console.log(`MQTT connected: ${brokerUrl}`);
    subscribeDefaultTopics();
  });

  mqttClient.on("error", (error) => {
    console.error("MQTT connection error:", formatMqttError(error));
  });

  mqttClient.on("offline", () => {
    console.log("MQTT client offline. Broker may be unavailable.");
  });

  mqttClient.on("reconnect", () => {
    console.log("MQTT reconnecting...");
  });

  mqttClient.on("close", () => {
    console.log("MQTT connection closed.");
  });

  mqttClient.on("message", (topic, message) => {
    onMessage(topic, message);
  });

  return mqttClient;
};

export const publishMQTTMessage = (topic, payload, options = { qos: 1, retain: false }) => {
  if (!mqttClient || !mqttClient.connected) {
    return false;
  }

  mqttClient.publish(topic, JSON.stringify(payload), options);
  return true;
};

export const closeMQTT = async () => {
  if (!mqttClient) return;

  await new Promise((resolve) => {
    mqttClient.end(false, {}, resolve);
  });

  mqttClient = null;
};
