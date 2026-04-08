import React from "react";
import {
  AlertCircle,
  AlertTriangle,
  CircleCheck,
  ChevronRight,
  Droplets,
  MapPin,
  Power,
  Thermometer,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import "../styles/DeviceCard.css";

const DeviceCard = ({ device, onToggle, onViewDetails }) => {
  const deviceId = device?._id || device?.id;
  const rawStatus = device?.status;
  const normalizedStatus = typeof rawStatus === "string" ? rawStatus.trim().toUpperCase() : rawStatus;

  const isOn = typeof normalizedStatus === "string"
    ? ["ON", "ACTIVE", "TRUE", "1"].includes(normalizedStatus)
    : Boolean(normalizedStatus);

  const hasConnectionState = typeof device?.connectionState === "string";
  const isOnline = hasConnectionState
    ? String(device.connectionState).trim().toLowerCase() === "online"
    : isOn;

  const canToggle = hasConnectionState ? isOnline : true;
  const displayPowerUsage = isOn ? device?.powerUsage ?? 0 : 0;
  const displayEnergyUsage = isOn ? device?.energyConsumption ?? device?.energy ?? 0 : 0;
  const displayTemperature = isOn ? formatMetricValue(device?.temperature, "°C") : "OFF";
  const displayHumidity = isOn ? formatMetricValue(device?.humidity, "%") : "0%";
  const metricProfile = getDeviceMetricProfile(device?.type);
  const showTemperature = metricProfile === "temperature-humidity";
  const showHumidity = metricProfile === "temperature-humidity" || metricProfile === "humidity-only";

  const deviceStatus = normalizedStatus;
  const statusLabel =
    hasConnectionState
      ? isOnline
        ? "Online"
        : "Offline"
      : deviceStatus === "ON"
      ? "Online"
      : deviceStatus === "OFF"
      ? "Offline"
      : deviceStatus === "INACTIVE"
      ? "Inactive"
      : isOn
      ? "Online"
      : "Offline";

  const statusClass =
    statusLabel === "Online"
      ? "online"
      : statusLabel === "Offline"
      ? "offline"
      : "inactive";

  let normalizedAlerts = [];
  if (Array.isArray(device?.alerts)) {
    normalizedAlerts = device.alerts.map((alert) => ({
      ...alert,
      severity: normalizeAlertSeverity(alert),
    }));
  } else if (device?.alert) {
    normalizedAlerts = [{ id: "legacy-alert", severity: "MEDIUM", message: String(device.alert) }];
  }

  const lowAlerts = normalizedAlerts.filter((a) => a.severity === "LOW").length;
  const mediumAlerts = normalizedAlerts.filter((a) => a.severity === "MEDIUM").length;
  const highAlerts = normalizedAlerts.filter((a) => a.severity === "HIGH").length;

  const handleToggle = () => {
    const nextState = !isOn;
    if (deviceId) {
      onToggle(deviceId, nextState);
    }
  };

  return (
    <div className="device-card">
      <div className="device-card-header">
        <div>
          <div className="device-meta" style={{ marginTop: 0, marginBottom: 6 }}>
            <span className={`status-dot ${statusClass}`} />
            <h3>{device?.name || "Unnamed Device"}</h3>
          </div>

          <div className="device-meta">
            <span className="tag">{device?.type || "Device"}</span>
            <span className={`tag status ${statusClass}`}>
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              {statusLabel}
            </span>
          </div>

          {(highAlerts > 0 || mediumAlerts > 0 || lowAlerts > 0) && (
            <div className="alert-severity-row" style={{ marginTop: 8 }}>
              {highAlerts > 0 && (
                <span className="alert-severity-chip high" title="High alerts">
                  <AlertCircle size={12} />
                  High
                </span>
              )}
              {mediumAlerts > 0 && (
                <span className="alert-severity-chip medium" title="Medium alerts">
                  <AlertTriangle size={12} />
                  Medium
                </span>
              )}
              {lowAlerts > 0 && (
                <span className="alert-severity-chip low" title="Low alerts">
                  <CircleCheck size={12} />
                  Low
                </span>
              )}
            </div>
          )}
        </div>

        <div className="toggle-row">
          <button
            className={`status-toggle ${isOn && isOnline ? "on" : ""}`}
            onClick={handleToggle}
            disabled={!canToggle}
            title={canToggle ? "Toggle device" : "Device offline"}
          />
          <div className={`power-indicator ${isOn && isOnline ? "online" : "offline"}`}>
            <Power size={14} />
          </div>
        </div>
      </div>

      <div className="device-location">
        <MapPin size={14} style={{ verticalAlign: "text-bottom", marginRight: 6 }} />
        {device?.location || "Unknown"}
      </div>

      <div className="device-stat-grid">
        <div className="stat-box blue">
          <span className="stat-label">
            <Zap size={13} style={{ verticalAlign: "text-bottom", marginRight: 4 }} />
            Power
          </span>
          <div className="stat-value">{displayPowerUsage}W</div>
        </div>

        <div className="stat-box purple">
          <span className="stat-label">
            <Power size={13} style={{ verticalAlign: "text-bottom", marginRight: 4 }} />
            Energy
          </span>
          <div className="stat-value">{displayEnergyUsage} kWh</div>
        </div>

        {showTemperature && (
          <>
            <div className="stat-box warm">
              <span className="stat-label">
                <Thermometer size={13} style={{ verticalAlign: "text-bottom", marginRight: 4 }} />
                Temp
              </span>
              <div className="stat-value">{displayTemperature}</div>
            </div>
          </>
        )}

        {showHumidity && (
          <>
            <div className="stat-box aqua">
              <span className="stat-label">
                <Droplets size={13} style={{ verticalAlign: "text-bottom", marginRight: 4 }} />
                Humidity
              </span>
              <div className="stat-value">{displayHumidity}</div>
            </div>
          </>
        )}
      </div>

      <div className="device-footer-lines">
        <span>Updated {getTimeAgo(device?.lastUpdated || device?.updatedAt || device?.updated)}</span>
      </div>

      <div className="device-card-footer">
        <button className="view-details-btn" onClick={() => onViewDetails(device)}>
          View Details <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

function getTimeAgo(dateValue) {
  if (!dateValue) return "just now";

  if (typeof dateValue === "string") {
    const normalized = dateValue.trim();

    // Some device records already store relative time text (e.g. "2m ago").
    if (/ago$/i.test(normalized)) {
      return normalized;
    }

    const asNumber = Number(normalized);
    if (!Number.isNaN(asNumber) && Number.isFinite(asNumber)) {
      dateValue = asNumber;
    }
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "recently";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds <= 0) return "just now";

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function getDeviceMetricProfile(type) {
  const normalizedType = String(type || "").trim().toLowerCase();

  if (["temperature-centric", "temperature", "ac", "oven", "thermostat"].includes(normalizedType)) {
    return "temperature-humidity";
  }

  if (["humidity-centric", "humidifier", "dehumidifier"].includes(normalizedType)) {
    return "humidity-only";
  }

  if (["sensor-centric", "sensor"].includes(normalizedType)) {
    return "power-energy";
  }

  return "power-energy";
}

function normalizeAlertSeverity(alert) {
  const rawSeverity = String(alert?.severity || alert?.type || "").trim().toUpperCase();

  if (rawSeverity === "HIGH" || rawSeverity === "CRITICAL") {
    return "HIGH";
  }

  if (rawSeverity === "MEDIUM" || rawSeverity === "WARNING") {
    return "MEDIUM";
  }

  return "LOW";
}

function formatMetricValue(value, unit = "") {
  const numericValue = parseNumericValue(value);

  if (Number.isFinite(numericValue) && numericValue !== 0) {
    return `${formatDecimal(numericValue)}${unit}`;
  }

  if (value === null || value === undefined || String(value).trim() === "" || numericValue === 0) {
    return "NIL";
  }

  return "NIL";
}

function parseNumericValue(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }

  return Number.NaN;
}

function formatDecimal(value) {
  if (!Number.isFinite(value)) return "0";
  return value.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}

export default DeviceCard;