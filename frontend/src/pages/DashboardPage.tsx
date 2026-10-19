// frontend/src/pages/DashboardPage.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import InventoryIcon from '@mui/icons-material/Inventory2Outlined';
import WarehouseIcon from '@mui/icons-material/WarehouseOutlined';
import PaidIcon from '@mui/icons-material/PaidOutlined';
import WarningIcon from '@mui/icons-material/WarningAmberOutlined';
import LocalShippingIcon from '@mui/icons-material/LocalShippingOutlined';
import {
  getDailyShipments,
  getDashboardSummary,
  getErrorMessage,
  getLowStockAlerts,
  getStockByCategory,
} from '../api/apiService';
import { IDashboardSummary, IInventoryItem } from '../types';
import { formatCompactCurrency, formatNumber } from '../utils/format';
import { DailyShipmentsChart, ShipmentStatusChart, StockByCategoryChart } from '../components/AnalyticsCharts';
import ImageUploadAI from '../components/ImageUploadAI';
import StatCard from '../components/StatCard';
import { colors, hazardStripes } from '../theme';

type DashboardData = {
  summary?: IDashboardSummary;
  stock?: Record<string, number>;
  daily?: Record<string, number>;
  lowStock?: IInventoryItem[];
};

const Section: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  subtitle,
  action,
  children,
}) => (
  <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 1,
        px: 2.5,
        py: 1.25,
        bgcolor: colors.ink,
        color: colors.nightText,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h6" noWrap sx={{ lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" noWrap sx={{ color: colors.yellow, display: 'block' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
    <Box aria-hidden sx={{ height: 6, background: hazardStripes(6) }} />
    <Box sx={{ p: 2.5, flexGrow: 1 }}>{children}</Box>
  </Paper>
);

const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    // Independent requests, so one slow or failing endpoint does not blank the whole page.
    const [summary, stock, daily, lowStock] = await Promise.allSettled([
      getDashboardSummary(),
      getStockByCategory(),
      getDailyShipments(),
      getLowStockAlerts(),
    ]);
    const failed = [summary, stock, daily, lowStock].find((r): r is PromiseRejectedResult => r.status === 'rejected');
    if (failed) setError(getErrorMessage(failed.reason, 'Some dashboard data could not be loaded.'));
    setData({
      summary: summary.status === 'fulfilled' ? summary.value : undefined,
      stock: stock.status === 'fulfilled' ? stock.value : undefined,
      daily: daily.status === 'fulfilled' ? daily.value : undefined,
      lowStock: lowStock.status === 'fulfilled' ? lowStock.value : undefined,
    });
    setUpdatedAt(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { summary } = data;
  const activeShipments = summary
    ? (summary.shipments_by_status['In Transit'] ?? 0) + (summary.shipments_by_status['Pending'] ?? 0)
    : undefined;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4">Overview</Typography>
          <Typography color="text.secondary">
            {updatedAt ? `Updated ${updatedAt.toLocaleTimeString()}` : 'Loading the latest numbers...'}
          </Typography>
        </Box>
        <Tooltip title="Refresh">
          <span>
            <IconButton onClick={load} disabled={loading} aria-label="refresh dashboard">
              <RefreshIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {loading && <LinearProgress color="secondary" sx={{ mb: 2, borderRadius: 0 }} />}
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={load}>Retry</Button>}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Products" value={summary && formatNumber(summary.total_items)}
            caption={summary && `${formatNumber(summary.supplier_count)} suppliers`} icon={<InventoryIcon />} loading={loading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Units in stock" value={summary && formatNumber(summary.total_units)} tone="secondary"
            icon={<WarehouseIcon />} loading={loading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Inventory value" value={summary && formatCompactCurrency(summary.inventory_value)} tone="success"
            icon={<PaidIcon />} loading={loading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Low stock items" value={summary && formatNumber(summary.low_stock_count)}
            caption={summary && `under ${summary.low_stock_threshold} units`}
            tone={summary && summary.low_stock_count > 0 ? 'warning' : 'success'} icon={<WarningIcon />} loading={loading} />
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Section title="Stock by category" subtitle="Total units on hand per category">
            <StockByCategoryChart data={data.stock} loading={loading} />
          </Section>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Section title="Shipment status" subtitle={activeShipments === undefined ? undefined : `${formatNumber(activeShipments)} still on the way`}>
            <ShipmentStatusChart data={summary?.shipments_by_status} loading={loading} />
          </Section>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Section title="Deliveries by date" subtitle="Units due per estimated delivery date">
            <DailyShipmentsChart data={data.daily} loading={loading} />
          </Section>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Section
            title="Needs restocking"
            subtitle="Lowest stock first"
            action={<Button component={RouterLink} to="/inventory" size="small" color="inherit" variant="outlined" startIcon={<LocalShippingIcon />} sx={{ borderColor: colors.yellow, color: colors.yellow, flexShrink: 0 }}>Inventory</Button>}
          >
            {!loading && (data.lowStock?.length ?? 0) === 0 ? (
              <Alert severity="success">Nothing is running low. Stock levels look healthy.</Alert>
            ) : (
              <List dense disablePadding sx={{ maxHeight: 280, overflow: 'auto' }}>
                {(data.lowStock ?? []).map((item) => (
                  <ListItem key={item.id} disableGutters divider
                    secondaryAction={<Chip size="small" color={item.quantity === 0 ? 'error' : 'warning'} label={`${item.quantity} left`} />}>
                    <ListItemText primary={item.name} secondary={item.supplier?.name ?? item.category} />
                  </ListItem>
                ))}
              </List>
            )}
          </Section>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Section title="Product photo detection" subtitle="Demo of the upload-to-prediction flow">
            <Box sx={{ maxWidth: 520 }}>
              <ImageUploadAI />
            </Box>
          </Section>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
