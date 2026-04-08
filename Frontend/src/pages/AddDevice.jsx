import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDevice } from '../services/api';
import '../styles/AddDevice.css';

const AddDevice = () => {
  const [form, setForm] = useState({
    type: 'Temperature-Centric',
    name: '',
    location: '',
    powerUsage: '',
    energy: '',
    temperature: '',
    humidity: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const needsTemperature = ['Temperature-Centric'].includes(form.type);
      const needsHumidity = ['Temperature-Centric', 'Humidity-Centric'].includes(form.type);

      const payload = {
        ...form,
        powerUsage: form.powerUsage === '' ? 0 : Number(form.powerUsage),
        energy: form.energy === '' ? 0 : Number(form.energy),
        temperature: needsTemperature ? (form.temperature === '' ? 0 : Number(form.temperature)) : 0,
        humidity: needsHumidity ? (form.humidity === '' ? 0 : Number(form.humidity)) : 0,
        status: false,
      };

      await addDevice(payload);
      navigate('/devices');
    } catch {
      setError('Failed to add device. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="add-device-page">
      <div className="add-device-card">
        <h2>Add New Device</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Device Type
            <select name="type" value={form.type} onChange={handleChange} required>
              <option value="Temperature-Centric">Temperature-Centric</option>
              <option value="Humidity-Centric">Humidity-Centric</option>
              <option value="Power-Centric">Power-Centric</option>
              <option value="Energy-Centric">Energy-Centric</option>
              <option value="Water-Quality-Centric">Water-Quality-Centric</option>
              <option value="Control-Centric">Control-Centric</option>
              <option value="Air-Quality-Centric">Air-Quality-Centric</option>
              <option value="Sensor-Centric">Sensor-Centric</option>
            </select>
          </label>

          <label>
            Device Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label>
            Device Location
            <input name="location" value={form.location} onChange={handleChange} placeholder="Living Room" required />
          </label>

          <label>
            Power (W)
            <input name="powerUsage" type="number" value={form.powerUsage} onChange={handleChange} min="0" placeholder="0" required />
          </label>

          <label>
            Energy (kWh)
            <input name="energy" type="number" value={form.energy} onChange={handleChange} min="0" step="0.01" placeholder="0" required />
          </label>

          {['Temperature-Centric'].includes(form.type) && (
            <label>
              Temperature (°C)
              <input name="temperature" type="number" value={form.temperature} onChange={handleChange} placeholder="0" />
            </label>
          )}

          {['Temperature-Centric', 'Humidity-Centric'].includes(form.type) && (
            <label>
              Humidity (%)
              <input name="humidity" type="number" value={form.humidity} onChange={handleChange} placeholder="0" />
            </label>
          )}

          {error && <p className="error">{error}</p>}
          <div className="add-device-actions">
            <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Device'}</button>
            <button type="button" onClick={() => navigate('/devices')} className="cancel">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDevice;
