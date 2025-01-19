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
  data: any;
  type?: string;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ data, type }) => {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const seconds2hours = (seconds: number) => seconds / 3600.0;

    if (Array.isArray(data) || type === "sizeOnDisk") {
      const sortedData = Array.isArray(data)
        ? data.sort((a: any, b: any) => {
            if (type === "totalPlayTime") return b.total_time - a.total_time;
            if (type === "requests") return b.requestCount - a.requestCount;
            return b.time - a.time;
          }).slice(0, 10)
        : Object.entries(data)
            .map(([label, sizeOnDisk]) => ({ label: label.replace(/^\d+ - /, ''), sizeOnDisk }))
            .sort((a: any, b: any) => b.sizeOnDisk - a.sizeOnDisk);

      setChartData({
        labels: sortedData.map((item: any) => {
          if (type === "totalPlayTime") return item.user_name;
          if (type === "requests") return item.displayName;
          return item.label;
        }),
        datasets: [
          {
            label: type === "requests" ? 'Requests' : type === "sizeOnDisk" ? 'Size on Disk (GB)' : 'Hours',
            data: sortedData.map((item: any) => {
              if (type === "totalPlayTime") return seconds2hours(item.total_time);
              if (type === "requests") return item.requestCount;
              if (type === "sizeOnDisk") return item.sizeOnDisk;
              return seconds2hours(item.time);
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