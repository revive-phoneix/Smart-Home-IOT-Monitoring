import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

// Register components (VERY IMPORTANT)
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const PowerChart = ({ data = [] }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <p className="chart-empty">No power usage data available.</p>;
  }

  const chartData = {
    labels: data.map((d) => d.name),
    datasets: [
      {
        label: "Power Usage (Watts)",
        data: data.map((d) => d.power),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default PowerChart;