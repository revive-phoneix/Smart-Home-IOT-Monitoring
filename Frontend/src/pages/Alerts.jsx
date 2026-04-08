import React, { useEffect, useMemo, useState } from "react";
import { Bell, CircleAlert, CircleCheck, TriangleAlert } from "lucide-react";
import {
  getAlerts,
  getDevices,
  resolveAlert,
} from "../services/api";
import socket from "../services/socket";
import "../styles/Alerts.css";

const STATUS_OPTIONS = ["ALL", "ACTIVE", "RESOLVED"];
const SEVERITY_OPTIONS = ["ALL", "HIGH", "MEDIUM", "LOW"];

const formatRelativeTime = (dateValue) => {
  if (!dateValue) return "just now";

  const date = new Date(dateValue);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? "" : "s"} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
};

const normalizeSeverity = (value) => {
  const severity = String(value || "LOW").trim().toUpperCase();
  if (severity === "HIGH" || severity === "CRITICAL") return "HIGH";
  if (severity === "MEDIUM" || severity === "WARNING") return "MEDIUM";
  return "LOW";
};

const normalizeAlert = (alert) => ({
  ...alert,
  severity: normalizeSeverity(alert.severity || alert.type || "LOW"),
  status: String(alert.status || "ACTIVE").toUpperCase(),
  deviceName: alert.deviceName || "Unknown Device",
});

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [deviceNames, setDeviceNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "ALL",
    severity: "ALL",
    device: "ALL_DEVICES",
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [{ data: alertData }, { data: devicesData }] = await Promise.all([
          getAlerts(),
          getDevices(),
        ]);

        setAlerts((alertData || []).map((alert) => normalizeAlert(alert)));
        setDeviceNames((devicesData || []).map((d) => d.name).slice(0, 8));
      } catch {
        setError("Failed to load alerts.");
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const onAlertResolved = (updatedAlert) => {
      if (!updatedAlert?._id) return;
      setAlerts((prev) => prev.map((alert) => (
        alert._id === updatedAlert._id ? normalizeAlert(updatedAlert) : alert
      )));
    };

    const reloadAlerts = async () => {
      try {
        const { data } = await getAlerts();
        setAlerts((data || []).map((alert) => normalizeAlert(alert)));
      } catch {
        // Keep current state if sync call fails.
      }
    };

    const onAlertsClearedAll = () => {
      setAlerts([]);
    };

    socket.on("alert:resolved", onAlertResolved);
    socket.on("alerts:resolvedAll", reloadAlerts);
    socket.on("alerts:clearedResolved", reloadAlerts);
    socket.on("alerts:clearedAll", onAlertsClearedAll);

    return () => {
      socket.off("alert:resolved", onAlertResolved);
      socket.off("alerts:resolvedAll", reloadAlerts);
      socket.off("alerts:clearedResolved", reloadAlerts);
      socket.off("alerts:clearedAll", onAlertsClearedAll);
    };
  }, []);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => (
      (filters.status === "ALL" || alert.status === filters.status)
      && (filters.severity === "ALL" || alert.severity === filters.severity)
      && (filters.device === "ALL_DEVICES" || alert.deviceName === filters.device)
    ));
  }, [alerts, filters]);

  const activeCount = alerts.filter((alert) => alert.status === "ACTIVE").length;
  const resolvedCount = alerts.filter((alert) => alert.status === "RESOLVED").length;

  const handleResolve = async (id) => {
    try {
      const { data } = await resolveAlert(id);
      setAlerts((prev) => prev.map((alert) => (alert._id === id ? normalizeAlert(data) : alert)));
    } catch {
      setError("Failed to resolve alert.");
    }
  };

  const severityIcon = (severity) => {
    if (severity === "HIGH") return <CircleAlert size={18} />;
    if (severity === "MEDIUM") return <TriangleAlert size={18} />;
    return <CircleCheck size={18} />;
  };

  return (
    <div className="alerts-page">
      <div className="alerts-header">
        <div className="alerts-title-wrap">
          <h1><Bell size={30} /> IoT Alerts</h1>
          <p className="alerts-stats">
            <span className="active-count">{activeCount} Active</span>
            <span className="dot">•</span>
            <span className="resolved-count">{resolvedCount} Resolved</span>
            <span className="dot">•</span>
            {filteredAlerts.length} Showing
          </p>
        </div>
      </div>

      <div className="alerts-filters-card">
        <div className="filter-item">
          <label htmlFor="status-filter">Status</label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0) + option.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor="severity-filter">Severity</label>
          <select
            id="severity-filter"
            value={filters.severity}
            onChange={(e) => setFilters((prev) => ({ ...prev, severity: e.target.value }))}
          >
            {SEVERITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0) + option.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor="device-filter">Device</label>
          <select
            id="device-filter"
            value={filters.device}
            onChange={(e) => setFilters((prev) => ({ ...prev, device: e.target.value }))}
          >
            <option value="ALL_DEVICES">All Devices</option>
            {deviceNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="alerts-list">
        {error && <p className="alerts-error">{error}</p>}

        {loading ? (
          <p className="empty">Loading alerts...</p>
        ) : filteredAlerts.length === 0 ? (
          <p className="empty">No alerts found.</p>
        ) : (
          filteredAlerts.map((alert) => (
            <div key={alert._id} className={`alert-card ${alert.severity.toLowerCase()}`}>
              <div className="alert-main">
                <h3 className="alert-title">
                  <span className="severity-icon">{severityIcon(alert.severity)}</span>
                  {alert.deviceName}
                  <span className={`badge ${alert.severity.toLowerCase()}`}>{alert.severity}</span>
                </h3>
                <p className="alert-message">{alert.message || "New alert detected"}</p>
                <span className="meta">
                  {formatRelativeTime(alert.createdAt)}
                  <span className="dot">•</span>
                  <span className={alert.status === "ACTIVE" ? "status-active" : "status-resolved"}>
                    {alert.status.charAt(0) + alert.status.slice(1).toLowerCase()}
                  </span>
                </span>
              </div>

              {alert.status === "ACTIVE" && (
                <button className="resolve-btn" onClick={() => handleResolve(alert._id)}>
                  Mark as Resolved
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Alerts;