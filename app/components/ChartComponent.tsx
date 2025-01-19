"use client";
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ChartComponentProps {
  data: Record<string, number>;
  type?: string;
}

interface ChartData {
  user_name?: string;
  displayName?: string;
  label?: string;
  total_time?: number;
  requestCount?: number;
  time?: number;
  sizeOnDisk?: number;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ data, type }) => {
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
    }[];
  } | null>(null);

  useEffect(() => {
    const seconds2hours = (seconds: number) => seconds / 3600.0;

    if (Array.isArray(data) || type === "sizeOnDisk") {
      const sortedData = Array.isArray(data)
        ? data.sort((a: ChartData, b: ChartData) => {
            if (type === "totalPlayTime") return (b.total_time ?? 0) - (a.total_time ?? 0);
            if (type === "requests") return (b.requestCount ?? 0) - (a.requestCount ?? 0);
            return (b.time ?? 0) - (a.time ?? 0);
          }).slice(0, 10)
        : Object.entries(data)
            .map(([label, sizeOnDisk]) => ({ label: label.replace(/^\d+ - /, ''), sizeOnDisk: sizeOnDisk as number }))
            .sort((a: ChartData, b: ChartData) => (b.sizeOnDisk ?? 0) - (a.sizeOnDisk ?? 0));

      setChartData({
        labels: sortedData.map((item: ChartData) => {
          if (type === "totalPlayTime") return item.user_name ?? '';
          if (type === "requests") return item.displayName ?? '';
          return item.label ?? '';
        }),
        datasets: [
          {
            label: type === "requests" ? 'Requests' : type === "sizeOnDisk" ? 'Size on Disk (GB)' : 'Hours',
            data: sortedData.map((item: ChartData) => {
              if (type === "totalPlayTime") return seconds2hours(item.total_time ?? 0);
              if (type === "requests") return item.requestCount ?? 0;
              if (type === "sizeOnDisk") return item.sizeOnDisk ?? 0;
              return seconds2hours(item.time ?? 0);
            }),
            backgroundColor: type === "totalPlayTime" ? 'rgba(153, 102, 255, 0.2)' : 'rgba(75, 192, 192, 0.2)',
            borderColor: type === "totalPlayTime" ? 'rgba(153, 102, 255, 1)' : 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      });
    } else {
      console.error('Data is not an array:', data);
    }
  }, [data, type]);

  return (
    <div>
      {chartData ? <Bar data={chartData} /> : <p>Loading...</p>}
    </div>
  );
};

export default ChartComponent;