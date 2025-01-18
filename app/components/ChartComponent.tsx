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
  data: any; // Adjust the type according to your data structure
}

const ChartComponent: React.FC<ChartComponentProps> = ({ data }) => {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    if (Array.isArray(data)) {
      const sortedData = data.sort((a: any, b: any) => b.time - a.time).slice(0, 10);

      setChartData({
        labels: sortedData.map((item: any) => item.label),
        datasets: [
          {
            label: 'Time',
            data: sortedData.map((item: any) => item.time),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      });
    } else {
      console.error('Data is not an array:', data);
    }
  }, [data]);

  return (
    <div>
      {chartData ? <Bar data={chartData} /> : <p>Loading...</p>}
    </div>
  );
};

export default ChartComponent;