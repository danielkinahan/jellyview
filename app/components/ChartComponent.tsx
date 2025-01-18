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
    function seconds2hours(seconds: number) {
      return seconds / 3600.0;
    }

    if (Array.isArray(data)) {
      let sortedData;
      if (type === "totalPlayTime") {
        sortedData = data.sort((a: any, b: any) => b.total_time - a.total_time).slice(0, 10);
        setChartData({
          labels: sortedData.map((item: any) => item.user_name),
          datasets: [
            {
              label: 'Hours',
              data: sortedData.map((item: any) => seconds2hours(item.total_time)),
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              borderColor: 'rgba(153, 102, 255, 1)',
              borderWidth: 1,
            },
          ],
        });
      } else {
        sortedData = data.sort((a: any, b: any) => b.time - a.time).slice(0, 10);
        setChartData({
          labels: sortedData.map((item: any) => item.label),
          datasets: [
            {
              label: 'Hours',
              data: sortedData.map((item: any) => seconds2hours(item.time)),
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        });
      }
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