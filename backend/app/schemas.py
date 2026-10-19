# backend/app/schemas.py

from datetime import date
from typing import Dict, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

ShipmentStatus = Literal["Pending", "In Transit", "Delivered", "Delayed"]


# --- Supplier Schemas ---
class SupplierCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    contact_person: Optional[str] = Field(default=None, max_length=200)
    email: str = Field(min_length=3, max_length=254, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    phone: Optional[str] = Field(default=None, max_length=50)


class Supplier(SupplierCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int


# --- Inventory Item Schemas ---
class InventoryItemCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    quantity: int = Field(ge=0)
    category: str = Field(min_length=1, max_length=100)
    price: float = Field(ge=0)
    supplier_id: Optional[int] = None


class InventoryItem(InventoryItemCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    supplier: Optional[Supplier] = None


# --- Shipment Schemas ---
class ShipmentCreate(BaseModel):
    item_id: int
    quantity: int = Field(gt=0)
    origin: str = Field(min_length=1, max_length=300)
    destination: str = Field(min_length=1, max_length=300)
    status: ShipmentStatus = "Pending"
    estimated_delivery_date: date


class Shipment(BaseModel):
    """Response model. `status` stays a plain string so rows created before the
    status list was validated can still be returned."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    item_id: int
    quantity: int
    origin: Optional[str] = None
    destination: Optional[str] = None
    status: str
    estimated_delivery_date: Optional[date] = None
    item: InventoryItem


# --- Analytics Schemas ---
class DashboardSummary(BaseModel):
    total_items: int
    total_units: int
    inventory_value: float
    low_stock_count: int
    supplier_count: int
    shipments_by_status: Dict[str, int]
    low_stock_threshold: int
