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

import {fetchPortfolioData} from "../../api/dashboard"

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);
interface PortfolioChartProps {
  activeTime: string;
}

const PortfolioChart: React.FC<PortfolioChartProps> = ({ activeTime }) => {
  const [chartData, setChartData] = useState<number[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>([]);

  useEffect(() => {
    const loadPortfolioData = async () => {
      try {
        const data = await fetchPortfolioData();
        const selectedData = data.minutes.find((item: any) => item.timeValue === activeTime);       
        if (selectedData && selectedData.labels && selectedData.line) {
          const values = generateCryptoTrend(90, 120, selectedData.labels.length * 14);
          setChartLabels(selectedData.labels);
          setChartData(values);
         
        }
      } catch (error) {
        console.error("Error loading portfolio data:", error);
      }
    };

    loadPortfolioData();
  }, [activeTime]);


  const generateCryptoTrend = (min: number, max: number, totalPoints: number) => {
    const data: number[] = [];
    let value = (min + max) / 2;
    for (let i = 0; i < totalPoints; i++) {
      const randomVal = Math.random()
      console.log(randomVal)
      const randomChange = (randomVal - 0.5) * 2; 
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
        borderColor: "#00E0FF",
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
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        ticks: {
          color: "#FFFFFF7A",
          font: { size: 18, weight: 500 },
          maxRotation: 0,
          minRotation: 0,
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
      tooltip: {
        backgroundColor: "rgb(0 2 46)",
        titleColor: "white",
        bodyColor: "white",
        displayColors: false,
        padding: { left: 26, right: 26, top: 12, bottom: 12 },
        cornerRadius: 15,
        yAlign: "bottom" as const,
        callbacks: {
          label: (context: any) => [`$${context.parsed.y.toLocaleString()}`],
        },
      },
    },
  };

  return (
    <div className="w-full h-[316px] overflowXAuto">
      <Line data={data} options={options} className="!w-full !h-full min-w-[500px] lg:min-w-[1000px]" />
    </div>
  );
};

export default PortfolioChart;
