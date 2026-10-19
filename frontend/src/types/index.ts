// frontend/src/types/index.ts

export interface ISupplier {
  id: number;
  name: string;
  contact_person?: string | null;
  email: string;
  phone?: string | null;
}

export interface IInventoryItem {
  id: number;
  name: string;
  quantity: number;
  category: string;
  price: number;
  supplier_id?: number | null;
  supplier?: ISupplier | null;
}

export const SHIPMENT_STATUSES = ['Pending', 'In Transit', 'Delivered', 'Delayed'] as const;
export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

export interface IShipment {
  id: number;
  item_id: number;
  item: IInventoryItem;
  quantity: number;
  origin?: string | null;
  destination?: string | null;
  status: string;
  estimated_delivery_date?: string | null; // ISO date from the API
}

/** Headline numbers returned by GET /analytics/summary/. */
export interface IDashboardSummary {
  total_items: number;
  total_units: number;
  inventory_value: number;
  low_stock_count: number;
  supplier_count: number;
  shipments_by_status: Record<string, number>;
  low_stock_threshold: number;
}

/** Result of the (mock) image analysis endpoint. */
export interface IPrediction {
  product_name: string;
  estimated_quantity: number;
}
