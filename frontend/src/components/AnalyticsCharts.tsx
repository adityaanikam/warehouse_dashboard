// frontend/src/components/AnalyticsCharts.tsx
import React, { useMemo } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Box, Skeleton, Typography, useTheme } from '@mui/material';
import { colors, fonts } from '../theme';
import { formatNumber, formatShortDate } from '../utils/format';

ChartJS.register(BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip);

const CHART_HEIGHT = 280;

/** Shared look for all charts: mono axis labels, ink-coloured marks, dashed grid. */
function useChartStyle() {
  const theme = useTheme();
  const text = theme.palette.text.secondary;
  return {
    ink: theme.palette.text.primary,
    text,
    grid: theme.palette.divider,
    tick: { color: text, font: { family: fonts.mono, size: 11 } },
  };
}

const Frame: React.FC<{ loading: boolean; empty: boolean; emptyText: string; children: React.ReactNode }> = ({
  loading,
  empty,
  emptyText,
  children,
}) => (
  <Box sx={{ height: CHART_HEIGHT, position: 'relative' }}>
    {loading ? (
      <Skeleton variant="rectangular" height={CHART_HEIGHT} />
    ) : empty ? (
      <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}>
        <Typography color="text.secondary" variant="caption">
          {emptyText}
        </Typography>
      </Box>
    ) : (
      children
    )}
  </Box>
);

type SeriesProps = { data?: Record<string, number>; loading: boolean };

/** Ink bars; the category with the least stock is picked out in safety orange. */
export const StockByCategoryChart: React.FC<SeriesProps> = ({ data = {}, loading }) => {
  const style = useChartStyle();
  const labels = Object.keys(data);
  const lowest = labels.length > 1 ? Math.min(...labels.map((l) => data[l])) : undefined;

  const chartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: 'Units in stock',
          data: labels.map((label) => data[label]),
          backgroundColor: labels.map((label) => (data[label] === lowest ? colors.orange : style.ink)),
          borderRadius: 0,
          maxBarThickness: 48,
        },
      ],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, style.ink]
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
            x: { ticks: style.tick, grid: { display: false }, border: { color: style.ink, width: 2 } },
            y: { beginAtZero: true, ticks: style.tick, grid: { color: style.grid }, border: { display: false } },
          },
        }}
      />
    </Frame>
  );
};

/** Straight segments with square markers, like points plotted on graph paper. */
export const DailyShipmentsChart: React.FC<SeriesProps> = ({ data = {}, loading }) => {
  const style = useChartStyle();
  // Dates arrive sorted from the API, but sorting here keeps the chart correct if that ever changes.
  const dates = Object.keys(data).sort();

  const chartData = useMemo(
    () => ({
      labels: dates.map(formatShortDate),
      datasets: [
        {
          label: 'Units due',
          data: dates.map((d) => data[d]),
          borderColor: style.ink,
          borderWidth: 2,
          backgroundColor: colors.orange,
          pointStyle: 'rect' as const,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0,
        },
      ],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, style.ink]
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
            x: { ticks: { ...style.tick, maxTicksLimit: 8 }, grid: { display: false }, border: { color: style.ink, width: 2 } },
            y: { beginAtZero: true, ticks: style.tick, grid: { color: style.grid }, border: { display: false } },
          },
        }}
      />
    </Frame>
  );
};

const STATUS_ORDER = ['Pending', 'In Transit', 'Delivered', 'Delayed'];

const STATUS_FILL: Record<string, string> = {
  Pending: '#a89f86',
  'In Transit': colors.orange,
  Delivered: '#3f6b2a',
  Delayed: '#b3261e',
};

/**
 * One long bar split by status, with a count under each segment, instead of a doughnut.
 * Plain divs, so it needs no canvas and reads at a glance.
 */
export const ShipmentStatusChart: React.FC<SeriesProps> = ({ data = {}, loading }) => {
  const total = Object.values(data).reduce((sum, n) => sum + n, 0);
  const statuses = [...STATUS_ORDER.filter((s) => s in data), ...Object.keys(data).filter((s) => !STATUS_ORDER.includes(s))];

  return (
    <Frame loading={loading} empty={total === 0} emptyText="No shipments yet">
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3 }}>
        <Box>
          <Typography sx={{ fontFamily: fonts.mono, fontWeight: 600, fontSize: '3rem', lineHeight: 1, letterSpacing: '-0.04em' }}>
            {formatNumber(total)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            SHIPMENTS ON RECORD
          </Typography>
        </Box>

        <Box
          role="img"
          aria-label={statuses.map((s) => `${s}: ${data[s]}`).join(', ')}
          sx={{ display: 'flex', height: 30, border: (theme) => `2px solid ${theme.palette.text.primary}` }}
        >
          {statuses
            .filter((s) => data[s] > 0)
            .map((s) => (
              <Box
                key={s}
                title={`${s}: ${data[s]}`}
                sx={{
                  width: `${(data[s] / total) * 100}%`,
                  bgcolor: STATUS_FILL[s] ?? 'text.secondary',
                  '& + &': { borderLeft: (theme) => `2px solid ${theme.palette.text.primary}` },
                }}
              />
            ))}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
          {statuses.map((s) => (
            <Box key={s} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, flexShrink: 0, bgcolor: STATUS_FILL[s] ?? 'text.secondary', border: (theme) => `1.5px solid ${theme.palette.text.primary}` }} />
              <Typography variant="caption" sx={{ textTransform: 'uppercase' }}>
                {s}
              </Typography>
              <Typography variant="caption" sx={{ ml: 'auto', fontWeight: 600 }}>
                {formatNumber(data[s])}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Frame>
  );
};
