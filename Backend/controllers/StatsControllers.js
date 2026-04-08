import Device from "../models/Device.js";

export const getStats = async (req, res) => {
  try {
    const devices = await Device.find();

    const totalDevices = devices.length;
    const activeDevices = devices.filter(d => d.status).length;

    // Calculate average temperature and humidity
    const avgTemp = devices.reduce((sum, d) => sum + (d.temperature || 0), 0) / totalDevices || 0;
    const avgHumidity = devices.reduce((sum, d) => sum + (d.humidity || 0), 0) / totalDevices || 0;

    const powerData = devices.map(d => ({
      name: d.name,
      power: d.powerUsage || 0,
    }));

    res.json({
      totalDevices,
      activeDevices,
      powerData,
      avgTemp,
      avgHumidity,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};