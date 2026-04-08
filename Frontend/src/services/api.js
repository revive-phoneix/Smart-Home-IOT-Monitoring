import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Add JWT token to requests
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("smarthome_user") || "{}");
  if (user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// NEW: Function to get all devices
export const getDevices = () => API.get('/devices');

// NEW: Function to add device
export const addDevice = (deviceData) => API.post('/devices', deviceData);

// NEW: Function to toggle a device
export const toggleDevice = (id) => API.put(`/devices/toggle/${id}`);

// NEW: Function to get power history for a specific device
export const getPowerHistory = (deviceId) => API.get(`/devices/${deviceId}/power-history`);

export const getAlerts = () => API.get('/alerts');
export const resolveAlert = (id) => API.put(`/alerts/${id}/resolve`);
export const resolveAllAlerts = () => API.put('/alerts/resolve-all');
export const clearResolvedAlerts = () => API.delete('/alerts/resolved');
export const clearAllAlerts = () => API.delete('/alerts/all');

export const getProfile = (params = {}) => API.get('/auth/profile', { params });
export const loginWithGoogle = (idToken) => API.post('/auth/google', { idToken });
export const updateProfile = (payload) => API.put('/auth/profile', payload);
export const getUserSettings = (params = {}) => API.get('/auth/settings', { params });
export const updateUserSettings = (payload) => API.put('/auth/settings', payload);
export const createSettingsBackup = (payload) => API.post('/auth/settings/backup', payload);
export const clearSettingsCache = (payload) => API.post('/auth/settings/clear-cache', payload);
export const deleteAccount = (payload) => API.delete('/auth/account', { data: payload });

export default API;