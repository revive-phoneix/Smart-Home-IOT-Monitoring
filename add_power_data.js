// Script to add power history data for all devices
const devices = [
  { id: "69cea40346aa3413b7dc219c", name: "Bedroom Light", location: "Bedroom", powerData: [5, 10, 8, 12, 7], energyData: [0.05, 0.10, 0.08, 0.12, 0.07] },
  { id: "69cea40346aa3413b7dc219d", name: "Kitchen Light", location: "Kitchen", powerData: [15, 20, 18, 22, 16], energyData: [0.015, 0.020, 0.018, 0.022, 0.016] },
  { id: "69cea40346aa3413b7dc219e", name: "Air Conditioner", location: "Living Room", powerData: [1200, 1500, 1400, 1800, 1300], energyData: [1.2, 1.5, 1.4, 1.8, 1.3] },
  { id: "69cea40346aa3413b7dc219f", name: "Ceiling Fan", location: "Bedroom", powerData: [75, 60, 80, 65, 70], energyData: [0.075, 0.060, 0.080, 0.065, 0.070] }
];

const times = ["00:00", "02:00", "04:00", "06:00", "08:00"];

devices.forEach(device => {
  times.forEach((time, index) => {
    fetch(`http://localhost:5000/api/devices/${device.id}/power-history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        time: time,
        power: device.powerData[index],
        energy: device.energyData[index]
      })
    })
    .then(response => response.json())
    .then(data => console.log(`Added data for ${device.name} at ${time}:`, data))
    .catch(error => console.error('Error:', error));
  });
});
