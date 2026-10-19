# backend/app/crud.py

from typing import Dict, Optional

from sqlalchemy import case, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from . import models, schemas

DEFAULT_LOW_STOCK_THRESHOLD = 10


class ConflictError(ValueError):
    """Raised when a change would break a database constraint (maps to HTTP 409)."""


# --- Inventory Item CRUD ---

def _item_query():
    # Eager-load the supplier so serialising a list never triggers one query per row.
    return select(models.InventoryItem).options(joinedload(models.InventoryItem.supplier))


def get_item(db: Session, item_id: int):
    return db.scalars(_item_query().where(models.InventoryItem.id == item_id)).first()


def get_items(db: Session, skip: int = 0, limit: int = 100):
    stmt = _item_query().order_by(models.InventoryItem.id).offset(skip).limit(limit)
    return db.scalars(stmt).unique().all()


def get_low_stock_items(db: Session, threshold: int = DEFAULT_LOW_STOCK_THRESHOLD):
    stmt = (
        _item_query()
        .where(models.InventoryItem.quantity < threshold)
        .order_by(models.InventoryItem.quantity, models.InventoryItem.id)
    )
    return db.scalars(stmt).unique().all()


def _require_supplier(db: Session, supplier_id: Optional[int]) -> None:
    if supplier_id is not None and db.get(models.Supplier, supplier_id) is None:
        raise ValueError("Referenced supplier does not exist")


def create_item(db: Session, item: schemas.InventoryItemCreate):
    _require_supplier(db, item.supplier_id)
    db_item = models.InventoryItem(**item.model_dump())
    db.add(db_item)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("Item could not be saved (check the supplier)")
    return get_item(db, db_item.id)


def update_item(db: Session, item_id: int, item: schemas.InventoryItemCreate):
    db_item = db.get(models.InventoryItem, item_id)
    if db_item is None:
        return None
    _require_supplier(db, item.supplier_id)
    for key, value in item.model_dump().items():
        setattr(db_item, key, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("Invalid data provided for update")
    return get_item(db, item_id)


def delete_item(db: Session, item_id: int):
    db_item = get_item(db, item_id)
    if db_item is None:
        return None
    has_shipments = db.scalar(
        select(func.count()).select_from(models.Shipment).where(models.Shipment.item_id == item_id)
    )
    if has_shipments:
        raise ConflictError("Item has shipments. Delete or reassign them first")
    db.delete(db_item)
    db.commit()
    return db_item


# --- Supplier CRUD ---

def get_supplier(db: Session, supplier_id: int):
    return db.get(models.Supplier, supplier_id)


def get_suppliers(db: Session, skip: int = 0, limit: int = 100):
    stmt = select(models.Supplier).order_by(models.Supplier.id).offset(skip).limit(limit)
    return db.scalars(stmt).all()


def create_supplier(db: Session, supplier: schemas.SupplierCreate):
    db_supplier = models.Supplier(**supplier.model_dump())
    db.add(db_supplier)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("Supplier with this name or email already exists")
    db.refresh(db_supplier)
    return db_supplier


def update_supplier(db: Session, supplier_id: int, supplier: schemas.SupplierCreate):
    db_supplier = db.get(models.Supplier, supplier_id)
    if db_supplier is None:
        return None
    for key, value in supplier.model_dump().items():
        setattr(db_supplier, key, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("Supplier with this name or email already exists")
    db.refresh(db_supplier)
    return db_supplier


def delete_supplier(db: Session, supplier_id: int):
    db_supplier = db.get(models.Supplier, supplier_id)
    if db_supplier is None:
        return None
    in_use = db.scalar(
        select(func.count()).select_from(models.InventoryItem).where(models.InventoryItem.supplier_id == supplier_id)
    )
    if in_use:
        raise ConflictError("Supplier still has inventory items. Reassign them first")
    db.delete(db_supplier)
    db.commit()
    return db_supplier


# --- Shipment CRUD ---

def _shipment_query():
    return select(models.Shipment).options(
        joinedload(models.Shipment.item).joinedload(models.InventoryItem.supplier)
    )


def get_shipment(db: Session, shipment_id: int):
    return db.scalars(_shipment_query().where(models.Shipment.id == shipment_id)).first()


def get_shipments(db: Session, skip: int = 0, limit: int = 100):
    stmt = _shipment_query().order_by(models.Shipment.id).offset(skip).limit(limit)
    return db.scalars(stmt).unique().all()


def _require_item(db: Session, item_id: int) -> None:
    if db.get(models.InventoryItem, item_id) is None:
        raise ValueError("Referenced item does not exist")


def create_shipment(db: Session, shipment: schemas.ShipmentCreate):
    _require_item(db, shipment.item_id)
    db_shipment = models.Shipment(**shipment.model_dump())
    db.add(db_shipment)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("Invalid shipment data provided")
    return get_shipment(db, db_shipment.id)


def update_shipment(db: Session, shipment_id: int, shipment: schemas.ShipmentCreate):
    db_shipment = db.get(models.Shipment, shipment_id)
    if db_shipment is None:
        return None
    _require_item(db, shipment.item_id)
    for key, value in shipment.model_dump().items():
        setattr(db_shipment, key, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("Invalid data provided for update")
    return get_shipment(db, shipment_id)


def delete_shipment(db: Session, shipment_id: int):
    db_shipment = get_shipment(db, shipment_id)
    if db_shipment is None:
        return None
    db.delete(db_shipment)
    db.commit()
    return db_shipment


# --- Analytics (aggregated in SQL, not in Python loops) ---

def stock_by_category(db: Session) -> Dict[str, int]:
    """Total units per category. One grouped query, however many items exist."""
    category = func.coalesce(models.InventoryItem.category, "Uncategorised")
    stmt = select(category, func.coalesce(func.sum(models.InventoryItem.quantity), 0)).group_by(category)
    return {name: int(total) for name, total in db.execute(stmt).all()}


def daily_shipments(db: Session) -> Dict[str, int]:
    """Units shipped per estimated delivery date, oldest first."""
    day = models.Shipment.estimated_delivery_date
    stmt = (
        select(day, func.coalesce(func.sum(models.Shipment.quantity), 0))
        .where(day.is_not(None))
        .group_by(day)
        .order_by(day)
    )
    return {d.isoformat(): int(total) for d, total in db.execute(stmt).all()}


def dashboard_summary(db: Session, threshold: int = DEFAULT_LOW_STOCK_THRESHOLD) -> schemas.DashboardSummary:
    items = models.InventoryItem
    total_items, total_units, value, low_stock = db.execute(
        select(
            func.count(items.id),
            func.coalesce(func.sum(items.quantity), 0),
            func.coalesce(func.sum(items.quantity * items.price), 0.0),
            func.coalesce(func.sum(case((items.quantity < threshold, 1), else_=0)), 0),
        )
    ).one()
    supplier_count = db.scalar(select(func.count(models.Supplier.id))) or 0
    status_rows = db.execute(
        select(models.Shipment.status, func.count(models.Shipment.id)).group_by(models.Shipment.status)
    ).all()
    return schemas.DashboardSummary(
        total_items=int(total_items),
        total_units=int(total_units),
        inventory_value=round(float(value), 2),
        low_stock_count=int(low_stock),
        supplier_count=int(supplier_count),
        shipments_by_status={status or "Unknown": int(count) for status, count in status_rows},
        low_stock_threshold=threshold,
    )
