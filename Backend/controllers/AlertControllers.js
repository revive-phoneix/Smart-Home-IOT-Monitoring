import Alert from "../models/Alerts.js";
import { getIO } from "../sockets/socket.js";

const normalizeAlert = (alert) => ({
  ...alert,
  severity: (alert.severity || "LOW").toUpperCase(),
  status: (alert.status || "ACTIVE").toUpperCase(),
  deviceName: alert.deviceName || "Unknown Device",
});

export const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.json(alerts.map((alert) => normalizeAlert(alert.toObject())));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const resolveAlert = async (req, res) => {
  try {
    const updatedAlert = await Alert.findByIdAndUpdate(
      req.params.id,
      { status: "RESOLVED", resolvedAt: new Date() },
      { new: true }
    );

    if (!updatedAlert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    const io = getIO();
    if (io) {
      io.emit("alert:resolved", normalizeAlert(updatedAlert.toObject()));
    }

    res.json(normalizeAlert(updatedAlert.toObject()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const clearResolvedAlerts = async (req, res) => {
  try {
    const result = await Alert.deleteMany({ status: "RESOLVED" });

    const io = getIO();
    if (io) {
      io.emit("alerts:clearedResolved", { deletedCount: result.deletedCount });
    }

    res.json({ deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const clearAllAlerts = async (req, res) => {
  try {
    const result = await Alert.deleteMany({});

    const io = getIO();
    if (io) {
      io.emit("alerts:clearedAll", { deletedCount: result.deletedCount });
    }

    res.json({ deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const resolveAllAlerts = async (req, res) => {
  try {
    const result = await Alert.updateMany(
      { status: { $ne: "RESOLVED" } },
      { $set: { status: "RESOLVED", resolvedAt: new Date() } }
    );

    const io = getIO();
    if (io) {
      io.emit("alerts:resolvedAll", { modifiedCount: result.modifiedCount });
    }

    res.json({ modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};