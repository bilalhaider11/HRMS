import React, { useRef, useEffect, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler,
  Legend,
  ChartOptions,
  Chart,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { fetchMarketStatsData, MarketStatsData } from "../../api/dashboard";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler,
  Legend
);

const LineChart: React.FC = () => {
  const chartRef = useRef<Chart<"line"> | null>(null);
  const [chartData, setChartData] = useState<MarketStatsData | null>(null);


  useEffect(() => {
    const loadMarketStatsData = async () => {
      try {
        const data = await fetchMarketStatsData();
        setChartData(data);
      } catch (error) {
        console.error(error);
      }
    };

    loadMarketStatsData();
  }, []);

  useEffect(() => {
    if (!chartRef.current || !chartData) return;
    const chart = chartRef.current;
    const ctx = chart.ctx;

    const gradient1 = ctx.createLinearGradient(0, 0, 0, 300);
    gradient1.addColorStop(0, "rgba(255, 171, 45, 0.4)");
    gradient1.addColorStop(1, "rgba(255, 171, 45, 0.0)");

    const gradient2 = ctx.createLinearGradient(0, 0, 0, 300);
    gradient2.addColorStop(0, "rgba(0, 173, 163, 0.4)");
    gradient2.addColorStop(1, "rgba(0, 173, 163, 0.0)");

    if (chart.data.datasets[0]) chart.data.datasets[0].backgroundColor = gradient1;
    if (chart.data.datasets[1]) chart.data.datasets[1].backgroundColor = gradient2;
    chart.update();
  }, [chartData]);

  const generateSmoothSteps = (values: number[]) => {
    const steppedData: number[] = [];
    for (let i = 0; i < values.length; i++) {
      steppedData.push(values[i]);
      if (i < values.length - 1) steppedData.push(values[i]); 
    }
    return steppedData;
  };

  const labels =
    chartData?.labels.flatMap((label: string, i: number) =>
      i < chartData.labels.length - 1 ? [label, ""] : [label]
    ) || [];

  const data = chartData
    ? {
        labels,
        datasets: [
          {
            label: "line1",
            data: generateSmoothSteps(chartData.line1),
            borderColor: "#FFAB2D",
            fill: true,
            borderWidth: 4,
            pointRadius: 0,
            tension: 0.9,
            borderCapStyle: "round" as const,
            cubicInterpolationMode: "monotone" as const,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: "#FFAB2D",
            pointHoverBorderColor: "#283573",
            pointHoverBorderWidth: 4,
          },
          {
            label: "line2",
            data: generateSmoothSteps(chartData.line2),
            borderColor: "#00ADA3",
            fill: true,
            borderWidth: 4,
            pointRadius: 0,
            tension: 0.9,
            borderCapStyle: "round" as const,
            cubicInterpolationMode: "monotone" as const,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: "#00ADA3",
            pointHoverBorderColor: "#283573",
            pointHoverBorderWidth: 4,
          },
        ],
      }
    : { labels: [], datasets: [] };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgb(0 2 46)",
        titleColor: "white",
        bodyColor: "white",
        displayColors: false,
        padding: { left: 26, right: 26, top: 12, bottom: 12 },
        cornerRadius: 15,
        yAlign: "bottom",
        callbacks: {
          label: (context: any) => [`$${context.parsed.y.toLocaleString()}`],
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: {
          color: "white",
          font: { size: 14, weight: 500 },
        },
      },
      y: {
        beginAtZero: true,
        max: 800000,
        ticks: {
          color: "white",
          font: { size: 14, weight: 500 },
          stepSize: 200000,
          callback: (tickValue: number | string) =>
            typeof tickValue === "number" ? `${tickValue / 1000}k` : tickValue,
        },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
    },
    elements: {
      line: {
        borderJoinStyle: "round",
        capBezierPoints: true,
      },
    },
    interaction: {
      mode: "nearest",
      intersect: false,
    },
  };

  return (
    <div className="w-full h-[320px] font-poppins overflowXAuto">
      <Line
        ref={chartRef}
        data={data}
        options={options}
        className="!w-full !h-full min-w-[500px] lg:min-w-[1000px]"
      />
    </div>
  );
};

export default LineChart;
