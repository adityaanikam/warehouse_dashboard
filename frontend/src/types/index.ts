// frontend/src/types/index.ts

// Represents a Supplier
export interface ISupplier {
  id: number;
  name: string;
  contact_person?: string;
  email: string;
  phone?: string;
}

// Represents an Inventory Item
export interface IInventoryItem {
  id: number;
  name: string;
  quantity: number;
  category: string;
  price: number;
  supplier_id?: number;
  supplier?: ISupplier;
}

// Represents a Shipment
export interface IShipment {
  id: number;
  item_id: number;
  item: IInventoryItem;
  quantity: number;
  origin: string;
  destination: string;
  status: string;
  estimated_delivery_date: string; // Comes as string from API
}

// Represents a mock tip/alert from JSON Server
export interface ITip {
  id: number;
  message: string;
  severity: "info" | "warning" | "success" | "error";
}