// frontend/src/components/AnalyticsCharts.tsx
import React, { useMemo } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { alpha, Box, Skeleton, Typography, useTheme } from '@mui/material';
import { chartPalette } from '../theme';
import { formatNumber, formatShortDate } from '../utils/format';

ChartJS.register(ArcElement, BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip);

const CHART_HEIGHT = 280;

/** Shared look for all charts: theme-aware text and grid colours, no fixed aspect ratio. */
function useChartColors() {
  const theme = useTheme();
  return { text: theme.palette.text.secondary, grid: theme.palette.divider, paper: theme.palette.background.paper };
}

const Frame: React.FC<{ loading: boolean; empty: boolean; emptyText: string; children: React.ReactNode }> = ({
  loading,
  empty,
  emptyText,
  children,
}) => (
  <Box sx={{ height: CHART_HEIGHT, position: 'relative' }}>
    {loading ? (
      <Skeleton variant="rounded" height={CHART_HEIGHT} />
    ) : empty ? (
      <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}>
        <Typography color="text.secondary">{emptyText}</Typography>
      </Box>
    ) : (
      children
    )}
  </Box>
);

type SeriesProps = { data?: Record<string, number>; loading: boolean };

export const StockByCategoryChart: React.FC<SeriesProps> = ({ data = {}, loading }) => {
  const colors = useChartColors();
  const labels = Object.keys(data);

  const chartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: 'Units in stock',
          data: labels.map((label) => data[label]),
          backgroundColor: labels.map((_, i) => chartPalette[i % chartPalette.length]),
          borderRadius: 8,
          maxBarThickness: 56,
        },
      ],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );

  return (
    <Frame loading={loading} empty={labels.length === 0} emptyText="No stock yet">
      <Bar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: colors.text }, grid: { display: false } },
            y: { beginAtZero: true, ticks: { color: colors.text }, grid: { color: colors.grid } },
          },
        }}
      />
    </Frame>
  );
};

export const DailyShipmentsChart: React.FC<SeriesProps> = ({ data = {}, loading }) => {
  const theme = useTheme();
  const colors = useChartColors();
  // Dates arrive sorted from the API, but sorting here keeps the chart correct if that ever changes.
  const dates = Object.keys(data).sort();

  const chartData = useMemo(
    () => ({
      labels: dates.map(formatShortDate),
      datasets: [
        {
          label: 'Units due',
          data: dates.map((d) => data[d]),
          borderColor: theme.palette.primary.main,
          backgroundColor: alpha(theme.palette.primary.main, 0.15),
          fill: true,
          tension: 0.35,
          pointRadius: 3,
        },
      ],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, theme.palette.primary.main]
  );

  return (
    <Frame loading={loading} empty={dates.length === 0} emptyText="No shipments scheduled">
      <Line
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: colors.text, maxTicksLimit: 8 }, grid: { display: false } },
            y: { beginAtZero: true, ticks: { color: colors.text }, grid: { color: colors.grid } },
          },
        }}
      />
    </Frame>
  );
};

const STATUS_COLORS: Record<string, string> = {
  Pending: '#9aa4b8',
  'In Transit': '#4f6bed',
  Delivered: '#22c55e',
  Delayed: '#ef4444',
};

export const ShipmentStatusChart: React.FC<SeriesProps> = ({ data = {}, loading }) => {
  const colors = useChartColors();
  const labels = Object.keys(data);
  const total = labels.reduce((sum, label) => sum + data[label], 0);

  const chartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          data: labels.map((label) => data[label]),
          backgroundColor: labels.map((label, i) => STATUS_COLORS[label] ?? chartPalette[i % chartPalette.length]),
          borderColor: colors.paper,
          borderWidth: 3,
        },
      ],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, colors.paper]
  );

  return (
    <Frame loading={loading} empty={total === 0} emptyText="No shipments yet">
      <Doughnut
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          cutout: '68%',
          plugins: {
            legend: { position: 'bottom', labels: { color: colors.text, usePointStyle: true } },
            tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${formatNumber(ctx.parsed)}` } },
          },
        }}
      />
    </Frame>
  );
};
