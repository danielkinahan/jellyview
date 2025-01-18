"use client";
import { useEffect, useState } from 'react';
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

const ChartComponent = () => {
  const [chartData, setChartData] = useState<any>(null);
  const [days, setDays] = useState(28);
  const [endDate, setEndDate] = useState('2025-01-15');
  const [timezoneOffset, setTimezoneOffset] = useState(-5);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch(`/api/movies?days=${days}&endDate=${endDate}&timezoneOffset=${timezoneOffset}`);
        const data = await response.json();

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
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    getData();
  }, [days, endDate, timezoneOffset]);

  if (!chartData) return <div>Loading...</div>;

  return (
    <div>
      <Bar data={chartData} />
    </div>
  );
};

export default ChartComponent;