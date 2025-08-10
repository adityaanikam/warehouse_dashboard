// frontend/src/api/apiService.ts
import axios from 'axios';
import { IInventoryItem, IShipment, ISupplier, ITip } from '../types';

// The base URL for your FastAPI backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// --- Generic CRUD functions can be created if desired, but specific ones are clearer ---

/**
 * Fetches all inventory items from the backend.
 */
export const getInventoryItems = async (): Promise<IInventoryItem[]> => {
  const response = await apiClient.get('/items/');
  return response.data;
};

export const createInventoryItem = async (payload: Omit<IInventoryItem, 'id' | 'supplier'>) => {
  const response = await apiClient.post('/items/', payload);
  return response.data as IInventoryItem;
};

/**

 * Fetches all suppliers from the backend.
 */
export const getSuppliers = async (): Promise<ISupplier[]> => {
  const response = await apiClient.get('/suppliers/');
  return response.data;
};

export const createSupplier = async (payload: Omit<ISupplier, 'id'>) => {
  const response = await apiClient.post('/suppliers/', payload);
  return response.data as ISupplier;
};

/**
 * Fetches all shipments from the backend.
 */
export const getShipments = async (): Promise<IShipment[]> => {
  const response = await apiClient.get('/shipments/');
  return response.data;
};

export const createShipment = async (payload: Omit<IShipment, 'id' | 'item'>) => {
  const response = await apiClient.post('/shipments/', payload);
  return response.data as IShipment;
};

/**
 * Uploads an image file to the AI prediction endpoint.
 * @param file The image file to upload.
 */
export const uploadProductImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/predict_image/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Fetches analytics data.
 */
export const getStockByCategory = () => apiClient.get('/analytics/stock_by_category/');
export const getDailyShipments = () => apiClient.get('/analytics/daily_shipments/');
export const getLowStockAlerts = () => apiClient.get('/analytics/low_stock_alerts/');

/**
 * Fetches static tips from the JSON server.
 */
export const getTips = async (): Promise<ITip[]> => {
  // Note the different port for the JSON server
  const response = await axios.get('http://localhost:3001/tips');
  return response.data;
};