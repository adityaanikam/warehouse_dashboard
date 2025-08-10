# backend/app/crud.py

from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from . import models, schemas

# --- Inventory Item CRUD ---

def get_item(db: Session, item_id: int):
    """Retrieve a single inventory item by ID with eager loading."""
    return db.query(models.InventoryItem).options(joinedload(models.InventoryItem.supplier)).filter(models.InventoryItem.id == item_id).first()

def get_items(db: Session, skip: int = 0, limit: int = 100):
    """Retrieve all inventory items with eager loading of supplier relationships."""
    return db.query(models.InventoryItem).options(joinedload(models.InventoryItem.supplier)).offset(skip).limit(limit).all()

def create_item(db: Session, item: schemas.InventoryItemCreate):
    """Create a new inventory item with validation."""
    try:
        db_item = models.InventoryItem(**item.dict())
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item
    except IntegrityError:
        db.rollback()
        raise ValueError("Item with this name already exists or invalid supplier_id")

def update_item(db: Session, item_id: int, item: schemas.InventoryItemCreate):
    """Update an existing inventory item."""
    try:
        db_item = db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id).first()
        if db_item:
            for key, value in item.dict().items():
                setattr(db_item, key, value)
            db.commit()
            db.refresh(db_item)
        return db_item
    except IntegrityError:
        db.rollback()
        raise ValueError("Invalid data provided for update")

def delete_item(db: Session, item_id: int):
    """Delete an inventory item."""
    db_item = db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
    return db_item

# --- Supplier CRUD ---

def get_supplier(db: Session, supplier_id: int):
    """Retrieve a single supplier by ID."""
    return db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()

def get_suppliers(db: Session, skip: int = 0, limit: int = 100):
    """Retrieve all suppliers."""
    return db.query(models.Supplier).offset(skip).limit(limit).all()

def create_supplier(db: Session, supplier: schemas.SupplierCreate):
    """Create a new supplier with validation."""
    try:
        db_supplier = models.Supplier(**supplier.dict())
        db.add(db_supplier)
        db.commit()
        db.refresh(db_supplier)
        return db_supplier
    except IntegrityError:
        db.rollback()
        raise ValueError("Supplier with this name or email already exists")

def update_supplier(db: Session, supplier_id: int, supplier: schemas.SupplierCreate):
    """Update an existing supplier."""
    try:
        db_supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
        if db_supplier:
            for key, value in supplier.dict().items():
                setattr(db_supplier, key, value)
            db.commit()
            db.refresh(db_supplier)
        return db_supplier
    except IntegrityError:
        db.rollback()
        raise ValueError("Invalid data provided for update")

def delete_supplier(db: Session, supplier_id: int):
    """Delete a supplier."""
    db_supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
    if db_supplier:
        db.delete(db_supplier)
        db.commit()
    return db_supplier

# --- Shipment CRUD ---

def get_shipment(db: Session, shipment_id: int):
    """Retrieve a single shipment by ID with eager loading."""
    return db.query(models.Shipment).options(joinedload(models.Shipment.item).joinedload(models.InventoryItem.supplier)).filter(models.Shipment.id == shipment_id).first()

def get_shipments(db: Session, skip: int = 0, limit: int = 100):
    """Retrieve all shipments with eager loading of item and supplier relationships."""
    return db.query(models.Shipment).options(joinedload(models.Shipment.item).joinedload(models.InventoryItem.supplier)).offset(skip).limit(limit).all()

def create_shipment(db: Session, shipment: schemas.ShipmentCreate):
    """Create a new shipment with validation."""
    try:
        # Validate that the referenced item exists
        item = db.query(models.InventoryItem).filter(models.InventoryItem.id == shipment.item_id).first()
        if not item:
            raise ValueError("Referenced item does not exist")
        
        db_shipment = models.Shipment(**shipment.dict())
        db.add(db_shipment)
        db.commit()
        db.refresh(db_shipment)
        return db_shipment
    except IntegrityError:
        db.rollback()
        raise ValueError("Invalid shipment data provided")

def update_shipment(db: Session, shipment_id: int, shipment: schemas.ShipmentCreate):
    """Update an existing shipment."""
    try:
        # Validate that the referenced item exists
        item = db.query(models.InventoryItem).filter(models.InventoryItem.id == shipment.item_id).first()
        if not item:
            raise ValueError("Referenced item does not exist")
            
        db_shipment = db.query(models.Shipment).filter(models.Shipment.id == shipment_id).first()
        if db_shipment:
            for key, value in shipment.dict().items():
                setattr(db_shipment, key, value)
            db.commit()
            db.refresh(db_shipment)
        return db_shipment
    except IntegrityError:
        db.rollback()
        raise ValueError("Invalid data provided for update")

def delete_shipment(db: Session, shipment_id: int):
    """Delete a shipment."""
    db_shipment = db.query(models.Shipment).filter(models.Shipment.id == shipment_id).first()
    if db_shipment:
        db.delete(db_shipment)
        db.commit()
    return db_shipment