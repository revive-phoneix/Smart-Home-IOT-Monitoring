import { useEffect, useState } from "react";
import "../styles/Dashboard.css";
import API from "../services/api";
import socket from "../services/socket";
import PowerChart from "../components/PowerChart";

import {
  Plug,
  Activity,
  WifiOff,
  AlertTriangle,
  Thermometer,
  Droplets,
  Zap,
  Eye
} from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // 🔹 Fetch ALL data together (optimized)
  const fetchAllData = async () => {
    try {
      const [statsRes, devicesRes, alertsRes] = await Promise.all([
        API.get("/stats"),
        API.get("/devices"),
        API.get("/alerts"),
      ]);

      setStats(statsRes.data);
      setDevices(devicesRes.data);
      setAlerts(alertsRes.data);

    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  };

  // 🔹 useEffect (clean + optimized)
  useEffect(() => {
    const initialize = async () => {
      await fetchAllData();
    };

    initialize();

    const syncDashboard = () => {
      fetchAllData();
    };

    socket.on("device:created", syncDashboard);
    socket.on("device:toggled", syncDashboard);
    socket.on("power:updated", syncDashboard);
    socket.on("alert:resolved", syncDashboard);
    socket.on("alerts:resolvedAll", syncDashboard);
    socket.on("alerts:clearedResolved", syncDashboard);
    socket.on("alerts:clearedAll", syncDashboard);

    return () => {
      socket.off("device:created", syncDashboard);
      socket.off("device:toggled", syncDashboard);
      socket.off("power:updated", syncDashboard);
      socket.off("alert:resolved", syncDashboard);
      socket.off("alerts:resolvedAll", syncDashboard);
      socket.off("alerts:clearedResolved", syncDashboard);
      socket.off("alerts:clearedAll", syncDashboard);
    };
  }, []);

  // 🔹 Toggle Device
  const toggleDevice = async (id) => {
    try {
      await API.put(`/devices/toggle/${id}`);
      fetchAllData(); // refresh everything
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const turnOffAllLights = async () => {
    try {
      const lightDevices = devices.filter((device) => {
        const name = String(device.name || "").toLowerCase();
        const type = String(device.type || "").toLowerCase();
        return device.status && (name.includes("light") || type.includes("light"));
      });

      await Promise.all(lightDevices.map((device) => API.put(`/devices/toggle/${device._id}`)));
      fetchAllData();
    } catch (err) {
      console.error("Turn off lights error:", err);
    }
  };

  const turnOnAllDevices = async () => {
    try {
      const offlineDevices = devices.filter((device) => !device.status);
      await Promise.all(offlineDevices.map((device) => API.put(`/devices/toggle/${device._id}`)));
      fetchAllData();
    } catch (err) {
      console.error("Turn on all devices error:", err);
    }
  };

  const turnOffAllDevices = async () => {
    try {
      const onlineDevices = devices.filter((device) => device.status);
      await Promise.all(onlineDevices.map((device) => API.put(`/devices/toggle/${device._id}`)));
      fetchAllData();
    } catch (err) {
      console.error("Turn off all devices error:", err);
    }
  };

  const turnOffDevicesByPowerThreshold = async () => {
    try {
      const threshold = 900;
      const targetDevices = devices.filter((device) => (
        device.status && Number(device.powerUsage || 0) >= threshold
      ));

      await Promise.all(targetDevices.map((device) => API.put(`/devices/toggle/${device._id}`)));
      fetchAllData();
    } catch (err) {
      console.error("Turn off >=900W devices error:", err);
    }
  };

  const activeAlertsCount = alerts.filter(
    (alert) => String(alert?.status || "").toUpperCase() === "ACTIVE"
  ).length;

  const onlineDevices = devices.filter((device) => device.status);
  const onlineDeviceCount = onlineDevices.length;

  const onlineDevicesWithTemperature = onlineDevices.filter((device) => {
    const hasTemperatureField = Object.prototype.hasOwnProperty.call(device, "temperature");
    const rawValue = device?.temperature;
    const value = Number(rawValue);

    return hasTemperatureField && rawValue !== null && rawValue !== "" && Number.isFinite(value);
  });

  const onlineDevicesWithHumidity = onlineDevices.filter((device) => {
    const value = Number(device?.humidity);
    return Number.isFinite(value);
  });

  const avgTemperature = onlineDevicesWithTemperature.length > 0
    ? onlineDevicesWithTemperature.reduce((sum, device) => sum + Number(device?.temperature), 0) / onlineDevicesWithTemperature.length
    : 0;

  const avgHumidity = onlineDevicesWithHumidity.length > 0
    ? onlineDevicesWithHumidity.reduce((sum, device) => sum + Number(device?.humidity), 0) / onlineDevicesWithHumidity.length
    : 0;

  const avgPowerWatts = onlineDeviceCount > 0
    ? onlineDevices.reduce((sum, device) => sum + Number(device?.powerUsage || 0), 0) / onlineDeviceCount
    : 0;
  const avgPowerKw = avgPowerWatts / 1000;

  const motionSensors = devices.filter((device) => {
    const deviceName = String(device?.name || "").toLowerCase();
    const deviceType = String(device?.type || "").toLowerCase();
    return deviceName.includes("motion") || deviceType.includes("sensor");
  });
  const activeMotionSensors = motionSensors.filter((device) => device.status).length;
  const motionStatus = activeMotionSensors > 0 ? "Active" : "Inactive";

  return (
  
    <div>
      {/* <Navbar /> */}

      <div className="dashboard-layout">
        {/* <Sidebar /> */}

        <div className="dashboard-content">
          
          <h2>What is happening right now?</h2>
          <p className="subtitle">Live status of your smart home system</p>

          {/* 🔹 Top Cards */}
          <div className="card-grid">
            {/* Total Devices Connected */}
            <div className="card">
              <div>
                <p>Total Devices Connected</p>
                <h3>{stats?.totalDevices || 0}</h3>
              </div>
              <Plug className="icon blue" />
            </div>
            {/* Active Devices */}

            <div className="card">
              <div>
                <p>Active Devices</p>
                <h3>{stats?.activeDevices || 0}</h3>
              </div>
              <Activity className="icon green" />
            </div>
            {/* Offline Devices */}

            <div className="card">
              <div>
                <p>Offline Devices</p>
                <h3>
                  {(stats?.totalDevices || 0) - (stats?.activeDevices || 0)}
                </h3>
              </div>
              <WifiOff className="icon red" />
            </div>
            {/* Active Alerts */}

            <div className="card">
              <div>
                <p>Alerts Count</p>
                <h3>{activeAlertsCount}</h3>
              </div>
              <AlertTriangle className="icon orange" />
            </div>
          </div>

          {/* 🔹 Sensor Cards */}
          <div className="card-grid">
            {/* Temperature */}
            <div className="card">
              <div>
                <p>Temperature</p>
                <h3>{avgTemperature.toFixed(1)}°C</h3>
                <span>Avg Temperature</span>
              </div>
              <Thermometer className="icon red" />
            </div>
            {/* Humidity */}

            <div className="card">
              <div>
                <p>Humidity</p>
                <h3>{avgHumidity.toFixed(1)}%</h3>
                <span>Avg Level</span>
              </div>
              <Droplets className="icon blue" />
            </div>
            {/* Energy Consumption */}

            <div className="card">
              <div>
                <p>Energy Consumption</p>
                <h3>{avgPowerKw.toFixed(2)} kW</h3>
                <span>Avg Usage</span>
              </div>
              <Zap className="icon yellow" />
            </div>
            {/* Motion Detection */}

            <div className="card">
              <div>
                <p>Motion Detection</p>
                <h3>{motionStatus}</h3>
                <span>{activeMotionSensors} sensors active</span>
              </div>
              <Eye className="icon purple" />
            </div>
          </div>

          {/* 🔹 Middle Section */}
          <div className="middle-section">
            
            {/* Chart */}
            <div className="chart-box">
              <h3>Power Usage by Devices</h3>
              {stats && <PowerChart data={stats.powerData || []} />}
            </div>

            {/* Devices */}
            <div className="devices-box">
              <h3>Connected Devices</h3>

              {devices.map((device) => (
                <div key={device._id} className="device-item">
                  <span>{device.name}</span>

                  <button
                    className={device.status ? "online" : "offline"}
                    onClick={() => toggleDevice(device._id)}
                  >
                    ● {device.status ? "online" : "offline"}
                  </button>
                </div>
              ))}
            </div>

          </div>

          {/* 🔹 Quick Controls */}
          <div className="controls">
            <h3>Quick Controls</h3>

            <div className="control-grid">
              <button className="btn yellow" onClick={turnOffAllLights}>Turn OFF all lights</button>
              <button className="btn green" onClick={turnOffDevicesByPowerThreshold}>turn off heavy devices</button>
              <button className="btn blue" onClick={turnOnAllDevices}>Turn ON all devices</button>
              <button className="btn red" onClick={turnOffAllDevices}>Emergency Shutdown</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;