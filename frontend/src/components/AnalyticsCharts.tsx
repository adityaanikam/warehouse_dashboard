// frontend/src/components/AnalyticsCharts.tsx
import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ChartData } from 'chart.js';
import { Typography, Box } from '@mui/material';
import { getStockByCategory, getDailyShipments } from '../api/apiService';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

/**
 * Displays analytics charts for stock levels and shipment trends.
 */
const AnalyticsCharts: React.FC = () => {
  const [stockData, setStockData] = useState<ChartData<'bar'>>({ labels: [], datasets: [] });
  const [shipmentData, setShipmentData] = useState<ChartData<'line'>>({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [stockRes, shipmentRes] = await Promise.all([
            getStockByCategory(),
            getDailyShipments()
        ]);
        
        // Process stock data
        const stockChartData = stockRes.data;
        setStockData({
          labels: Object.keys(stockChartData),
          datasets: [{
            label: 'Stock Quantity',
            data: Object.values(stockChartData),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
          }],
        });

        // Process shipment data
        const shipmentChartData = shipmentRes.data;
        const sortedDates = Object.keys(shipmentChartData).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());
        setShipmentData({
          labels: sortedDates,
          datasets: [{
            label: 'Items Shipped',
            data: sortedDates.map(date => shipmentChartData[date]),
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            fill: true,
          }],
        });
      } catch (error) {
          console.error("Failed to fetch analytics data:", error);
      } finally {
          setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="h6">Stock Levels by Category</Typography>
        {loading ? <p>Loading chart...</p> : <Bar data={stockData} />}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="h6">Daily Shipments Trend</Typography>
        {loading ? <p>Loading chart...</p> : <Line data={shipmentData} />}
      </Box>
    </Box>
  );
};

export default AnalyticsCharts;