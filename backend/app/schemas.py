# backend/app/schemas.py

from pydantic import BaseModel
from typing import Optional
from datetime import date

# --- Supplier Schemas ---
class SupplierBase(BaseModel):
    name: str
    contact_person: Optional[str] = None
    email: str
    phone: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class Supplier(SupplierBase):
    id: int

    class Config:
        from_attributes = True # <-- This was changed

# --- Inventory Item Schemas ---
class InventoryItemBase(BaseModel):
    name: str
    quantity: int
    category: str
    price: float
    supplier_id: Optional[int] = None

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItem(InventoryItemBase):
    id: int
    supplier: Optional[Supplier] = None

    class Config:
        from_attributes = True # <-- This was changed

# --- Shipment Schemas ---
class ShipmentBase(BaseModel):
    item_id: int
    quantity: int
    origin: str
    destination: str
    status: str
    estimated_delivery_date: date

class ShipmentCreate(ShipmentBase):
    pass

class Shipment(ShipmentBase):
    id: int
    item: InventoryItem

    class Config:
        from_attributes = True # <-- This was changed