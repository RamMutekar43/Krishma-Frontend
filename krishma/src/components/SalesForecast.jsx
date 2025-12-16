import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const SalesForecast = () => {
  const [data, setData] = useState({ historical: [], forecast: [] });

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/forecast-sales")
      .then((res) => res.json())
      .then((json) => {
        const product = "Chocolate Ice cream"; // dynamically change if needed
        setData(json[product]);
      });
  }, []);

  const chartData = {
    labels: [
      ...data.historical.map((item) => item.date),
      ...data.forecast.map((item) => item.date)
    ],
    datasets: [
      {
        label: "Historical Sales",
        data: [...data.historical.map((item) => item.sales), ...Array(data.forecast.length).fill(null)],
        borderColor: "#42A5F5",
        tension: 0.3,
        fill: false,
      },
      {
        label: "Predicted Sales",
        data: [...Array(data.historical.length).fill(null), ...data.forecast.map((item) => item.sales)],
        borderColor: "#FF6384",
        tension: 0.3,
        fill: false,
      },
    ],
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Sales Trend & 7-Day Forecast</h2>
      <Line data={chartData} />
    </div>
  );
};

export default SalesForecast;
