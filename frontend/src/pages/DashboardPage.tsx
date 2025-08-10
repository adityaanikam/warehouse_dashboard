// frontend/src/pages/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, Alert } from '@mui/material';
import AnalyticsCharts from '../components/AnalyticsCharts';
import ImageUploadAI from '../components/ImageUploadAI';
import { getLowStockAlerts, getTips } from '../api/apiService';
import { IInventoryItem, ITip } from '../types';

/**
 * Renders the main dashboard, including analytics and AI features.
 */
const DashboardPage: React.FC = () => {
  const [lowStockItems, setLowStockItems] = useState<IInventoryItem[]>([]);
  const [tips, setTips] = useState<ITip[]>([]);

  useEffect(() => {
    // Fetch low stock items
    getLowStockAlerts()
      .then(response => setLowStockItems(response.data))
      .catch(console.error);
    
    // Fetch tips from JSON server
    getTips()
      .then(data => setTips(data))
      .catch(console.error);
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Analytics Charts */}
        <Paper sx={{ p: 2 }}>
          <AnalyticsCharts />
        </Paper>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* AI Image Upload */}
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              AI Product Detection
            </Typography>
            <ImageUploadAI />
          </Paper>
          
          {/* Low Stock and Tips Alerts */}
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              Alerts & Tips
            </Typography>
            {/* Low Stock Alerts */}
            {lowStockItems.map(item => (
              <Alert severity="warning" key={item.id} sx={{ mb: 1 }}>
                Low stock for {item.name}! Current quantity: {item.quantity}.
              </Alert>
            ))}
            {/* Static Tips */}
            {tips.map(tip => (
              <Alert severity={tip.severity} key={tip.id} sx={{ mb: 1 }}>
                {tip.message}
              </Alert>
            ))}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;