import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import * as api from './api/apiService';

// Canvas is not available in jsdom, so charts are replaced with simple placeholders.
jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart" />,
  Line: () => <div data-testid="line-chart" />,
  Doughnut: () => <div data-testid="doughnut-chart" />,
}));

jest.mock('./api/apiService', () => ({
  ...jest.requireActual('./api/apiService'),
  getDashboardSummary: jest.fn(),
  getStockByCategory: jest.fn(),
  getDailyShipments: jest.fn(),
  getLowStockAlerts: jest.fn(),
  getInventoryItems: jest.fn(),
}));

const mocked = api as jest.Mocked<typeof api>;

beforeEach(() => {
  window.history.pushState({}, '', '/');
  mocked.getDashboardSummary.mockResolvedValue({
    total_items: 30,
    total_units: 4200,
    inventory_value: 125000,
    low_stock_count: 2,
    supplier_count: 12,
    shipments_by_status: { Delivered: 5, 'In Transit': 3, Pending: 1 },
    low_stock_threshold: 10,
  });
  mocked.getStockByCategory.mockResolvedValue({ Electronics: 100 });
  mocked.getDailyShipments.mockResolvedValue({ '2026-11-01': 7 });
  mocked.getLowStockAlerts.mockResolvedValue([
    { id: 1, name: 'Stapler', quantity: 2, category: 'Office Supplies', price: 5, supplier: null },
  ]);
  mocked.getInventoryItems.mockResolvedValue([]);
});

test('dashboard shows the headline numbers and the low stock list', async () => {
  render(<App />);
  expect(await screen.findByText('4,200')).toBeInTheDocument();
  expect(screen.getByText('$125K')).toBeInTheDocument();
  expect(screen.getByText('Stapler')).toBeInTheDocument();
  expect(screen.getByText('2 left')).toBeInTheDocument();
  expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
});

test('dashboard keeps working when one endpoint fails', async () => {
  mocked.getLowStockAlerts.mockRejectedValue(new Error('boom'));
  render(<App />);
  expect(await screen.findByText('4,200')).toBeInTheDocument();
  expect(await screen.findByText(/some dashboard data could not be loaded/i)).toBeInTheDocument();
});

test('inventory page shows an empty state with an add button', async () => {
  window.history.pushState({}, '', '/inventory');
  render(<App />);
  expect(await screen.findByRole('button', { name: /add item/i })).toBeInTheDocument();
  await waitFor(() => expect(mocked.getInventoryItems).toHaveBeenCalled());
});
