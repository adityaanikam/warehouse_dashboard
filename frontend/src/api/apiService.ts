// frontend/src/api/apiService.ts
import axios from 'axios';
import {
  IDashboardSummary,
  IInventoryItem,
  IPrediction,
  IShipment,
  ISupplier,
} from '../types';

// Base URL of the FastAPI backend (set REACT_APP_API_URL for deployed builds).
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const apiClient = axios.create({ baseURL: API_BASE_URL, timeout: 20000 });

type InventoryPayload = Omit<IInventoryItem, 'id' | 'supplier'>;
type SupplierPayload = Omit<ISupplier, 'id'>;
type ShipmentPayload = Omit<IShipment, 'id' | 'item'>;

/**
 * Turns any failed request into a readable sentence.
 * FastAPI returns `detail` as a string for our own errors and as a list of
 * `{loc, msg}` objects for validation errors, so both shapes are handled.
 */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return error.code === 'ECONNABORTED'
        ? 'The server took too long to respond.'
        : 'Cannot reach the server. Is the backend running?';
    }
    const detail = error.response.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      return detail
        .map((d: { loc?: (string | number)[]; msg?: string }) => {
          const field = d.loc?.filter((part) => part !== 'body').join('.');
          return field ? `${field}: ${d.msg}` : d.msg;
        })
        .join('; ');
    }
  }
  return fallback;
}

// --- Inventory ---
export const getInventoryItems = async (): Promise<IInventoryItem[]> =>
  (await apiClient.get('/items/', { params: { limit: 500 } })).data;
export const createInventoryItem = async (payload: InventoryPayload) =>
  (await apiClient.post('/items/', payload)).data as IInventoryItem;
export const updateInventoryItem = async (id: number, payload: InventoryPayload) =>
  (await apiClient.put(`/items/${id}`, payload)).data as IInventoryItem;
export const deleteInventoryItem = async (id: number) => (await apiClient.delete(`/items/${id}`)).data;

// --- Suppliers ---
export const getSuppliers = async (): Promise<ISupplier[]> =>
  (await apiClient.get('/suppliers/', { params: { limit: 500 } })).data;
export const createSupplier = async (payload: SupplierPayload) =>
  (await apiClient.post('/suppliers/', payload)).data as ISupplier;
export const updateSupplier = async (id: number, payload: SupplierPayload) =>
  (await apiClient.put(`/suppliers/${id}`, payload)).data as ISupplier;
export const deleteSupplier = async (id: number) => (await apiClient.delete(`/suppliers/${id}`)).data;

// --- Shipments ---
export const getShipments = async (): Promise<IShipment[]> =>
  (await apiClient.get('/shipments/', { params: { limit: 500 } })).data;
export const createShipment = async (payload: ShipmentPayload) =>
  (await apiClient.post('/shipments/', payload)).data as IShipment;
export const updateShipment = async (id: number, payload: ShipmentPayload) =>
  (await apiClient.put(`/shipments/${id}`, payload)).data as IShipment;
export const deleteShipment = async (id: number) => (await apiClient.delete(`/shipments/${id}`)).data;

// --- Mock AI ---
/** Uploads an image to the mock prediction endpoint (the backend does not analyse it). */
export const uploadProductImage = async (file: File): Promise<{ prediction: IPrediction }> => {
  const formData = new FormData();
  formData.append('file', file);
  return (await apiClient.post('/predict_image/', formData)).data;
};

// --- Analytics ---
export const getDashboardSummary = async (): Promise<IDashboardSummary> =>
  (await apiClient.get('/analytics/summary/')).data;
export const getStockByCategory = async (): Promise<Record<string, number>> =>
  (await apiClient.get('/analytics/stock_by_category/')).data;
export const getDailyShipments = async (): Promise<Record<string, number>> =>
  (await apiClient.get('/analytics/daily_shipments/')).data;
export const getLowStockAlerts = async (): Promise<IInventoryItem[]> =>
  (await apiClient.get('/analytics/low_stock_alerts/')).data;
