import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler
);


const HoldingChart: React.FC<{holdingData?: any}> = ({ holdingData }) => {
  const [chartData, setChartData] = useState<number[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>([]);

  useEffect(() => {
    const labels = holdingData?.labels ;
    const values = generateCryptoTrend(90, 120, labels.length * 10);
    setChartLabels(labels);
    setChartData(values);
  }, [holdingData]);

  const generateCryptoTrend = (
    min: number,
    max: number,
    totalPoints: number
  ) => {
    const data: number[] = [];
    let value = (min + max) / 2;
    for (let i = 0; i < totalPoints; i++) {
      const randomChange = (Math.random() - 0.5) * 2;
      value = Math.min(max, Math.max(min, value + randomChange));
      data.push(value);
    }
    return data;
  };

  const data = {
    labels: chartData.map((_, i) => (i % 15 === 0 ? chartLabels[i / 15] : "")),
    datasets: [
      {
        data: chartData,
        borderColor: "#FFFFFF52",
        borderWidth: 2.5,
        tension: 0.3,
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    scales: {
      x: {
        ticks: {
          display: false,
        },
        grid: { display: false },
      },
      y: {
        display: false,
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  return (
    <div className="w-full h-[50px]">
      <Line
        data={data}
        options={options}
        height={50}
        className="!w-full !h-full"
      />
    </div>
  );
};

export default HoldingChart;
