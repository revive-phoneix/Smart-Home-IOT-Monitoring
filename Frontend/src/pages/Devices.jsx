import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DeviceCard from '../components/DeviceCard';
import { getDevices, toggleDevice, getPowerHistory as fetchPowerHistory, getAlerts as fetchAlerts } from '../services/api';
import socket from '../services/socket';
import '../styles/Devices.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Activity, AlertTriangle, CircleAlert, CircleCheck, Clock3, BatteryCharging, Droplets, Plus, RefreshCw, Thermometer, Zap } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const getDeviceMetricProfile = (type) => {
  const normalizedType = String(type || '').trim().toLowerCase();

  if (['temperature-centric', 'temperature', 'ac', 'oven', 'thermostat'].includes(normalizedType)) {
    return 'temperature-humidity';
  }

  if (['humidity-centric', 'humidifier', 'dehumidifier'].includes(normalizedType)) {
    return 'humidity-only';
  }

  if (['water-quality-centric', 'water quality centric', 'water quality', 'water'].includes(normalizedType)) {
    return 'power-energy';
  }

  if (['sensor-centric', 'sensor'].includes(normalizedType)) {
    return 'power-energy';
  }

  return 'power-energy';
};

const normalizeAlertSeverity = (severityValue) => {
  const severity = String(severityValue || 'LOW').trim().toUpperCase();

  if (severity === 'HIGH' || severity === 'CRITICAL') return 'HIGH';
  if (severity === 'MEDIUM' || severity === 'WARNING') return 'MEDIUM';
  return 'LOW';
};

const formatAlertDateTime = (dateValue) => {
  if (!dateValue) return 'just now';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'just now';

  return date
    .toLocaleString([], { hour12: true })
    .replace('AM', 'am')
    .replace('PM', 'pm');
};

const parseNumericValue = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }

  return Number.NaN;
};

const formatDecimal = (value) => {
  if (!Number.isFinite(value)) return '0';
  return value.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
};

const getVoltageAndCurrent = (device, powerDraw) => {
  const defaultVoltage = 220;
  const voltageRaw = parseNumericValue(device?.voltage);
  const currentRaw = parseNumericValue(device?.current);

  const voltage = voltageRaw > 0 ? voltageRaw : defaultVoltage;
  const derivedCurrent = voltage > 0 ? powerDraw / voltage : 0;
  const current = currentRaw >= 0 ? currentRaw : derivedCurrent;

  return {
    voltage: formatDecimal(voltage),
    current: formatDecimal(current),
  };
};

const formatEnvironmentalReading = (value, unit) => {
  const numeric = parseNumericValue(value);
  if (!Number.isFinite(numeric) || numeric === 0) {
    return 'NIL';
  }
  return `${formatDecimal(numeric)}${unit}`;
};

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [powerHistoryData, setPowerHistoryData] = useState([]);
  const [deviceAlerts, setDeviceAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [resolvedAlertsCount, setResolvedAlertsCount] = useState(0);

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const selectedDeviceId = selectedDevice?._id;

  const syncDevices = useCallback(async () => {
    try {
      const { data } = await getDevices();
      setDevices(data);

      if (selectedDeviceId) {
        const latestSelected = data.find((device) => device._id === selectedDeviceId);
        if (latestSelected) {
          setSelectedDevice(latestSelected);
        }
      }
    } catch {
      // Keep existing state if socket sync request fails.
    }
  }, [selectedDeviceId]);

  const syncResolvedAlertsCount = useCallback(async () => {
    try {
      const { data } = await fetchAlerts();
      const resolvedCount = (data || []).filter(
        (alert) => String(alert?.status || 'ACTIVE').toUpperCase() === 'RESOLVED'
      ).length;
      setResolvedAlertsCount(resolvedCount);
    } catch {
      // Keep the current count if alert sync request fails.
    }
  }, []);

  useEffect(() => {
    const fetchDevices = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [{ data: devicesData }, { data: alertsData }] = await Promise.all([
          getDevices(),
          fetchAlerts(),
        ]);
        setDevices(devicesData);
        const resolvedCount = (alertsData || []).filter(
          (alert) => String(alert?.status || 'ACTIVE').toUpperCase() === 'RESOLVED'
        ).length;
        setResolvedAlertsCount(resolvedCount);
      } catch {
        setError('Failed to load devices.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDevices();
  }, []);

  useEffect(() => {
    const onDeviceCreated = () => {
      syncDevices();
    };

    const onDeviceToggled = (updatedDevice) => {
      if (!updatedDevice?._id) {
        syncDevices();
        return;
      }

      setDevices((prev) => prev.map((d) => (d._id === updatedDevice._id ? updatedDevice : d)));
      if (selectedDevice?._id === updatedDevice._id) {
        setSelectedDevice(updatedDevice);
      }
    };

    const onPowerUpdated = (payload) => {
      if (activeTab === 'metrics' && selectedDevice?._id && payload?.deviceId === selectedDevice._id) {
        fetchPowerHistory(selectedDevice._id)
          .then(({ data }) => setPowerHistoryData(data))
          .catch(() => setPowerHistoryData([]));
      }
    };

    const onAlertChanged = () => {
      syncResolvedAlertsCount();
      if (activeTab === 'alerts' && selectedDevice) {
        fetchAlerts()
          .then(({ data }) => {
            const normalized = (data || []).map((alert) => ({
              ...alert,
              severity: normalizeAlertSeverity(alert.severity || alert.type),
              status: (alert.status || 'ACTIVE').toUpperCase(),
              deviceName: alert.deviceName || 'Unknown Device',
            }));

            const filtered = normalized.filter((alert) => (
              (alert.deviceId && String(alert.deviceId) === selectedDevice._id)
              || alert.deviceName === selectedDevice.name
            ));

            setDeviceAlerts(filtered.filter((alert) => alert.status === 'ACTIVE'));
          })
          .catch(() => setDeviceAlerts([]));
      }
    };

    socket.on('device:created', onDeviceCreated);
    socket.on('device:toggled', onDeviceToggled);
    socket.on('power:updated', onPowerUpdated);
    socket.on('alert:resolved', onAlertChanged);
    socket.on('alerts:resolvedAll', onAlertChanged);
    socket.on('alerts:clearedResolved', onAlertChanged);
    socket.on('alerts:clearedAll', onAlertChanged);

    return () => {
      socket.off('device:created', onDeviceCreated);
      socket.off('device:toggled', onDeviceToggled);
      socket.off('power:updated', onPowerUpdated);
      socket.off('alert:resolved', onAlertChanged);
      socket.off('alerts:resolvedAll', onAlertChanged);
      socket.off('alerts:clearedResolved', onAlertChanged);
      socket.off('alerts:clearedAll', onAlertChanged);
    };
  }, [activeTab, selectedDevice, syncDevices, syncResolvedAlertsCount]);

  useEffect(() => {
    if (activeTab === 'metrics' && selectedDevice) {
      const fetchDevicePowerHistory = async () => {
        try {
          const { data } = await fetchPowerHistory(selectedDevice._id);
          setPowerHistoryData(data);
        } catch (err) {
          console.error('Failed to fetch power history:', err);
          setPowerHistoryData([]);
        }
      };

      fetchDevicePowerHistory();
    }
  }, [activeTab, selectedDevice]);

  useEffect(() => {
    if (activeTab === 'alerts' && selectedDevice) {
      const fetchDeviceAlerts = async () => {
        setAlertsLoading(true);
        try {
          const { data } = await fetchAlerts();
          const normalized = (data || []).map((alert) => ({
            ...alert,
            severity: normalizeAlertSeverity(alert.severity || alert.type),
            status: (alert.status || 'ACTIVE').toUpperCase(),
            deviceName: alert.deviceName || 'Unknown Device',
          }));
          const filtered = normalized.filter((alert) => (
            (alert.deviceId && String(alert.deviceId) === selectedDevice._id)
            || alert.deviceName === selectedDevice.name
          ));
          const activeOnly = filtered.filter((alert) => alert.status === 'ACTIVE');
          setDeviceAlerts(activeOnly);
        } catch {
          setDeviceAlerts([]);
        } finally {
          setAlertsLoading(false);
        }
      };

      fetchDeviceAlerts();
    }
  }, [activeTab, selectedDevice]);

  const totalDevices = devices.length;
  const onlineDevices = devices.filter((d) => d.status).length;
  const totalPower = devices
    .filter((d) => d.status)
    .reduce((sum, d) => sum + (d.powerUsage || 0), 0);

  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      const matchesSearch = device.name.toLowerCase().includes(search.trim().toLowerCase()) || device.type.toLowerCase().includes(search.trim().toLowerCase());
      const matchesType = filterType === 'all' || device.type === filterType;
      const matchesStatus = filterStatus === 'all' || (filterStatus === 'on' ? device.status : !device.status);
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [devices, search, filterType, filterStatus]);

  const handleToggle = async (id) => {
    try {
      const { data: updatedDevice } = await toggleDevice(id);
      setDevices((prev) => prev.map((d) => (d._id === id ? updatedDevice : d)));
      if (selectedDevice?._id === id) {
        setSelectedDevice(updatedDevice);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to toggle device');
    }
  };

  const openDetails = (device) => {
    setSelectedDevice(device);
    setActiveTab('overview');
  };

  const closeDetails = () => setSelectedDevice(null);

  const getPowerHistory = (device) => {
    if (!device) return [];

    if (powerHistoryData && powerHistoryData.length > 0) {
      const historyEntry = powerHistoryData[0];

      if (historyEntry && historyEntry.Power && historyEntry.Energy) {
        const chartData = historyEntry.Power.map((powerItem, index) => {
          const energyItem = historyEntry.Energy[index];
          return {
            time: powerItem.time || '00:00',
            power: powerItem.power || 0,
            energy: energyItem ? energyItem.energy : 0,
          };
        });
        return chartData;
      }

      return powerHistoryData.map((entry) => ({
        time: entry.time || '00:00',
        power: entry.power || 0,
        energy: entry.energy || 0,
      }));
    }

    return [];
  };

  const selectedDeviceMetricProfile = selectedDevice ? getDeviceMetricProfile(selectedDevice.type) : 'power-energy';
  const showTemperature = selectedDeviceMetricProfile === 'temperature-humidity';
  const showHumidity = selectedDeviceMetricProfile === 'temperature-humidity' || selectedDeviceMetricProfile === 'humidity-only';
  const rawDeviceStatus = selectedDevice?.status;
  const detailsStatusVariant =
    rawDeviceStatus === false
      ? 'off'
      : typeof rawDeviceStatus === 'string' && rawDeviceStatus.toLowerCase() === 'inactive'
      ? 'inactive'
      : rawDeviceStatus
      ? 'on'
      : 'off';
  const detailsStatusText = detailsStatusVariant === 'inactive' ? 'INACTIVE' : detailsStatusVariant.toUpperCase();

  const renderTabContent = () => {
    if (!selectedDevice) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <div className="details-overview">
            <div className="overview-cards">
              <div className="overview-card blue">
                <span className="overview-card-label">
                  <Zap size={18} />
                  Power Usage
                </span>
                <strong>{selectedDevice.powerUsage ?? '0'}W</strong>
              </div>
              <div className="overview-card purple">
                <span className="overview-card-label">
                  <BatteryCharging size={18} />
                  Energy
                </span>
                <strong>{selectedDevice.energy ?? '4.8'} kWh</strong>
              </div>
              {showTemperature && (
                <div className="overview-card warm">
                  <span className="overview-card-label">
                    <Thermometer size={18} />
                    Temperature
                  </span>
                  <strong>{formatEnvironmentalReading(selectedDevice.temperature, '°C')}</strong>
                </div>
              )}
              {showHumidity && (
                <div className="overview-card aqua">
                  <span className="overview-card-label">
                    <Droplets size={18} />
                    Humidity
                  </span>
                  <strong>{formatEnvironmentalReading(selectedDevice.humidity, '%')}</strong>
                </div>
              )}
            </div>

            <div className="overview-details-card">
              <h4 className="overview-section-title">
                <Activity size={21} />
                Device Information
              </h4>
              <div className="overview-section-divider" />
              <div className="overview-info-grid">
                <div className="device-info-item">
                  <span>Device ID:</span>
                  <strong>{selectedDevice._id ?? selectedDevice.deviceId ?? 'dev-001'}</strong>
                </div>
                <div className="device-info-item">
                  <span>Type:</span>
                  <strong>{selectedDevice.type ?? 'Device'}</strong>
                </div>
                <div className="device-info-item">
                  <span>Voltage:</span>
                  <strong>{selectedDevice.voltage ?? '220V'}</strong>
                </div>
                <div className="device-info-item">
                  <span>Current:</span>
                  <strong>{selectedDevice.current ?? '5.5A'}</strong>
                </div>
                <div className="device-info-item">
                  <span>Last Updated:</span>
                  <strong>{selectedDevice.updated ?? '28m ago'}</strong>
                </div>
                <div className="device-info-item device-status-container">
                  <span className="device-status-label">Status:</span>
                  <strong className={`device-status-pill ${detailsStatusVariant}`}>{detailsStatusText}</strong>
                </div>
              </div>
            </div>
          </div>
        );
      case 'metrics': {
        const history = getPowerHistory(selectedDevice);
        const powerDraw = selectedDevice.status ? Number(selectedDevice.powerUsage ?? 0) : 0;
        const totalEnergy = selectedDevice.status ? Number(selectedDevice.energy ?? 0) : 0;
        const { voltage, current } = getVoltageAndCurrent(selectedDevice, powerDraw);

        if (history.length === 0) {
          return (
            <div className="metrics-overview">
              <div className="empty-state">
                <p>No power history data available for this device.</p>
                <p>Please ensure power history entries have been added to the database.</p>
              </div>
            </div>
          );
        }

        const chartData = {
          labels: history.map((point) => point.time),
          datasets: [
            {
              label: 'Power (W)',
              data: history.map((point) => point.power),
              borderColor: '#2f7bff',
              backgroundColor: 'rgba(47, 123, 255, 0.2)',
              tension: 0.3,
            },
            {
              label: 'Energy (kWh)',
              data: history.map((point) => point.energy),
              borderColor: '#8e5fff',
              backgroundColor: 'rgba(142, 95, 255, 0.2)',
              tension: 0.3,
            },
          ],
        };

        const chartOptions = {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: false },
          },
          scales: {
            y: { beginAtZero: true },
          },
        };

        return (
          <div className="metrics-overview">
            <div className="overview-chart-card">
              <h4>Power Usage Over Time</h4>
              <Line data={chartData} options={chartOptions} />
            </div>

            <div className="metrics-grid">
              <div className="metric-box">
                <h5>Current Readings</h5>
                <div className="metric-row"><span>Power Draw:</span><strong>{formatDecimal(powerDraw)}W</strong></div>
                <div className="metric-row"><span>Voltage:</span><strong>{voltage}V</strong></div>
                <div className="metric-row"><span>Current:</span><strong>{current}A</strong></div>
                <div className="metric-row"><span>Total Energy:</span><strong>{formatDecimal(totalEnergy)} kWh</strong></div>
              </div>
              {(showTemperature || showHumidity) && (
                <div className="metric-box">
                  <h5>Environmental</h5>
                  {showTemperature && <div className="metric-row"><span>Temperature:</span><strong>{formatEnvironmentalReading(selectedDevice.temperature, '°C')}</strong></div>}
                  {showHumidity && <div className="metric-row"><span>Humidity:</span><strong>{formatEnvironmentalReading(selectedDevice.humidity, '%')}</strong></div>}
                </div>
              )}
            </div>
          </div>
        );
      }
      case 'alerts':
        return (
          <div className="alerts-panel">
            {alertsLoading ? (
              <div className="device-alert-card empty">
                <span>Loading alerts...</span>
              </div>
            ) : deviceAlerts.length > 0 ? deviceAlerts.map((alert, index) => (
              <div className={`device-alert-card ${String(alert.severity || 'LOW').toLowerCase()}`} key={index}>
                <div className="device-alert-top-row">
                  <span className={`device-alert-severity-chip ${String(alert.severity || 'LOW').toLowerCase()}`}>
                    {alert.severity === 'HIGH' ? <CircleAlert size={16} /> : alert.severity === 'MEDIUM' ? <AlertTriangle size={16} /> : <CircleCheck size={16} />}
                    {alert.severity.charAt(0) + alert.severity.slice(1).toLowerCase()}
                  </span>
                  <span className="device-alert-time">
                    <Clock3 size={14} />
                    {formatAlertDateTime(alert.createdAt)}
                  </span>
                </div>
                <div className="device-alert-message">{alert.message}</div>
              </div>
            )) : (
              <div className="device-alert-card empty">
                <span>No alerts available.</span>
              </div>
            )}
          </div>
        );
      case 'settings':
        return (
          <div className="settings-panel">
            <div className="settings-card">
              <h4>Device Controls</h4>
              <div className="setting-row">
                <div>
                  <p className="setting-label">Power State</p>
                  <p className="setting-helper">Turn device on or off</p>
                </div>
                <button className={`settings-switch ${selectedDevice.status ? 'on' : 'off'}`} onClick={() => handleToggle(selectedDevice._id)}>
                  {selectedDevice.status ? 'ON' : 'OFF'}
                </button>
              </div>

              {selectedDevice.type && selectedDevice.type.toLowerCase() === 'ac' && (
                <>
                  <div className="setting-row radio-row">
                    <label>Operation Mode</label>
                    <div className="mode-options">
                      {['Auto', 'Cool', 'Heat', 'Fan Only'].map((mode) => (
                        <button
                          key={mode}
                          className={`mode-btn ${selectedDevice.mode === mode ? 'active' : ''}`}
                          onClick={() => setSelectedDevice((prev) => ({ ...prev, mode }))}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="setting-row slider-row">
                    <label>Temperature Threshold</label>
                    <div className="slider-wave">
                      <input
                        type="range"
                        min="16"
                        max="30"
                        value={selectedDevice.tempThreshold ?? 24}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setSelectedDevice((prev) => ({ ...prev, tempThreshold: value }));
                        }}
                      />
                      <span>{selectedDevice.tempThreshold ?? 24}°C</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="settings-card advanced">
              <h4>About Device</h4>
              <div className="device-info-row"><span>Firmware Version:</span><strong>{selectedDevice.firmware ?? 'v2.3.1'}</strong></div>
              <div className="device-info-row"><span>MAC Address:</span><strong>{selectedDevice.mac ?? 'DEV-001-AC-LIVING'}</strong></div>
              <div className="device-info-row"><span>Last Maintenance:</span><strong>{selectedDevice.lastMaintenance ?? 'Jan 15, 2026'}</strong></div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const navigate = useNavigate();

  return (
    <div className="devices-page">
      <div className="devices-top">
        <div className="devices-top-header">
          <h2>Devices</h2>
          <div className="devices-header-actions">
            <button className="devices-action-btn devices-action-btn-secondary" onClick={() => window.location.reload()}>
              <RefreshCw size={22} />
              <span>Refresh</span>
            </button>
            <button className="devices-action-btn devices-action-btn-primary" onClick={() => navigate('/add-device')}>
              <Plus size={24} />
              <span>Add Device</span>
            </button>
          </div>
        </div>

        <div className="devices-summary">
          <div className="stat-card"><span>Total Devices</span><strong>{totalDevices}</strong></div>
          <div className="stat-card"><span>Online</span><strong>{onlineDevices}</strong></div>
          <div className="stat-card"><span>Resolved Alerts</span><strong>{resolvedAlertsCount}</strong></div>
          <div className="stat-card"><span>Total Power</span><strong>{totalPower}W</strong></div>
        </div>

        <div className="devices-controls">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search devices by name or type..." />
          <div className="filters">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="Temperature-Centric">Temperature-Centric</option>
              <option value="Humidity-Centric">Humidity-Centric</option>
              <option value="Power-Centric">Power-Centric</option>
              <option value="Energy-Centric">Energy-Centric</option>
              <option value="Water-Quality-Centric">Water-Quality-Centric</option>
              <option value="Control-Centric">Control-Centric</option>
              <option value="Air-Quality-Centric">Air-Quality-Centric</option>
              <option value="Sensor-Centric">Sensor-Centric</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="on">On</option>
              <option value="off">Off</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="empty-state">Loading devices...</div>
      ) : error ? (
        <div className="empty-state">{error}</div>
      ) : filteredDevices.length === 0 ? (
        <div className="empty-state">No devices found. Please add devices in the database to see them here.</div>
      ) : (
        <div className="device-grid">
          {filteredDevices.map((device) => (
            <DeviceCard key={device._id} device={device} onToggle={handleToggle} onViewDetails={openDetails} />
          ))}
        </div>
      )}

      {selectedDevice && (
        <div className="details-modal-overlay" onClick={closeDetails}>
          <div className="details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="details-header">
              <div className="details-header-main">
                <h3>{selectedDevice.name}</h3>
                <div className="details-meta-row">
                  <span className="tag details-device-type">{selectedDevice.type ?? 'Device'}</span>
                  <span className={`details-status ${selectedDevice.status ? 'online' : 'offline'}`}>
                    {selectedDevice.status ? 'Online' : 'Offline'}
                  </span>
                  <span className="details-location-meta">
                    <span className="details-location-icon" aria-hidden="true">📍</span>
                    {selectedDevice.location ?? 'Unknown'}
                  </span>
                </div>
              </div>
              <div className="details-actions">
                <button
                  className={`status-toggle ${selectedDevice.status ? 'on' : 'off'}`}
                  onClick={() => handleToggle(selectedDevice._id)}
                >
                  ●
                </button>
                <button className={`power-indicator ${selectedDevice.status ? 'online' : 'offline'}`} title={selectedDevice.status ? 'Online' : 'Offline'}>
                  ⏻
                </button>
                <button className="close-button" onClick={closeDetails}>✕</button>
              </div>
            </div>

            <div className="details-tabs">
              {['overview', 'metrics', 'alerts', 'settings'].map((tab) => (
                <button
                  key={tab}
                  className={activeTab === tab ? 'active' : ''}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="details-content">{renderTabContent()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Devices;
