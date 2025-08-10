from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict
import random
import os

from . import crud, models, schemas
from .database import SessionLocal, engine, get_db

# Create all database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Warehouse Inventory API",
    description="API for managing warehouse inventory, shipments, and suppliers.",
    version="1.0.0",
)

# --- CORS Middleware ---
# A single list for all allowed origins (local and deployed)
origins = [
    # Local development URLs
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    # Deployed frontend URLs
    "https://warehouse-dashboard-chi.vercel.app",
    "https://warehouse-dashboard-aditya-nikams-projects.vercel.app",
    "https://warehouse-dashboard-qbtrbbvf1-aditya-nikams-projects.vercel.app",
    "https://warehouse-dashboard-git-main-aditya-nikams-projects.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Welcome to the Warehouse Inventory API"}

# --- Inventory Item Endpoints ---

@app.post("/items/", response_model=schemas.InventoryItem, tags=["Inventory"])
def create_item(item: schemas.InventoryItemCreate, db: Session = Depends(get_db)):
    """Create a new inventory item."""
    try:
        return crud.create_item(db=db, item=item)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/items/", response_model=List[schemas.InventoryItem], tags=["Inventory"])
def read_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieve all inventory items."""
    items = crud.get_items(db, skip=skip, limit=limit)
    return items

@app.get("/items/{item_id}", response_model=schemas.InventoryItem, tags=["Inventory"])
def read_item(item_id: int, db: Session = Depends(get_db)):
    """Retrieve a single inventory item by ID."""
    db_item = crud.get_item(db, item_id=item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item

@app.put("/items/{item_id}", response_model=schemas.InventoryItem, tags=["Inventory"])
def update_item(item_id: int, item: schemas.InventoryItemCreate, db: Session = Depends(get_db)):
    """Update an existing inventory item."""
    try:
        db_item = crud.update_item(db, item_id=item_id, item=item)
        if db_item is None:
            raise HTTPException(status_code=404, detail="Item not found")
        return db_item
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/items/{item_id}", response_model=schemas.InventoryItem, tags=["Inventory"])
def delete_item(item_id: int, db: Session = Depends(get_db)):
    """Delete an inventory item."""
    db_item = crud.delete_item(db, item_id=item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item


# --- Supplier Endpoints ---

@app.post("/suppliers/", response_model=schemas.Supplier, tags=["Suppliers"])
def create_supplier(supplier: schemas.SupplierCreate, db: Session = Depends(get_db)):
    """Create a new supplier."""
    try:
        return crud.create_supplier(db=db, supplier=supplier)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/suppliers/", response_model=List[schemas.Supplier], tags=["Suppliers"])
def read_suppliers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieve all suppliers."""
    suppliers = crud.get_suppliers(db, skip=skip, limit=limit)
    return suppliers

@app.get("/suppliers/{supplier_id}", response_model=schemas.Supplier, tags=["Suppliers"])
def read_supplier(supplier_id: int, db: Session = Depends(get_db)):
    """Retrieve a single supplier by ID."""
    db_supplier = crud.get_supplier(db, supplier_id=supplier_id)
    if db_supplier is None:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return db_supplier

@app.put("/suppliers/{supplier_id}", response_model=schemas.Supplier, tags=["Suppliers"])
def update_supplier(supplier_id: int, supplier: schemas.SupplierCreate, db: Session = Depends(get_db)):
    """Update an existing supplier."""
    try:
        db_supplier = crud.update_supplier(db, supplier_id=supplier_id, supplier=supplier)
        if db_supplier is None:
            raise HTTPException(status_code=404, detail="Supplier not found")
        return db_supplier
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/suppliers/{supplier_id}", response_model=schemas.Supplier, tags=["Suppliers"])
def delete_supplier(supplier_id: int, db: Session = Depends(get_db)):
    """Delete a supplier."""
    db_supplier = crud.delete_supplier(db, supplier_id=supplier_id)
    if db_supplier is None:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return db_supplier


# --- Shipment Endpoints ---

@app.post("/shipments/", response_model=schemas.Shipment, tags=["Shipments"])
def create_shipment(shipment: schemas.ShipmentCreate, db: Session = Depends(get_db)):
    """Create a new shipment."""
    try:
        return crud.create_shipment(db=db, shipment=shipment)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/shipments/", response_model=List[schemas.Shipment], tags=["Shipments"])
def read_shipments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieve all shipments."""
    shipments = crud.get_shipments(db, skip=skip, limit=limit)
    return shipments

@app.get("/shipments/{shipment_id}", response_model=schemas.Shipment, tags=["Shipments"])
def read_shipment(shipment_id: int, db: Session = Depends(get_db)):
    """Retrieve a single shipment by ID."""
    db_shipment = crud.get_shipment(db, shipment_id=shipment_id)
    if db_shipment is None:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return db_shipment

@app.put("/shipments/{shipment_id}", response_model=schemas.Shipment, tags=["Shipments"])
def update_shipment(shipment_id: int, shipment: schemas.ShipmentCreate, db: Session = Depends(get_db)):
    """Update an existing shipment."""
    try:
        db_shipment = crud.update_shipment(db, shipment_id=shipment_id, shipment=shipment)
        if db_shipment is None:
            raise HTTPException(status_code=404, detail="Shipment not found")
        return db_shipment
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/shipments/{shipment_id}", response_model=schemas.Shipment, tags=["Shipments"])
def delete_shipment(shipment_id: int, db: Session = Depends(get_db)):
    """Delete a shipment."""
    db_shipment = crud.delete_shipment(db, shipment_id=shipment_id)
    if db_shipment is None:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return db_shipment


# --- AI & Analytics Endpoints ---

@app.post("/predict_image/", tags=["AI Features"])
async def predict_product_from_image(file: UploadFile = File(...)):
    """
    AI Feature: Accepts an image upload and returns a mock product prediction.
    """
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")

    mock_products = ["Laptop", "Keyboard", "Mouse", "Monitor", "Webcam"]
    predicted_product = random.choice(mock_products)
    estimated_quantity = random.randint(1, 50)

    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "prediction": {
            "product_name": predicted_product,
            "estimated_quantity": estimated_quantity,
        },
    }

@app.get("/analytics/low_stock_alerts/", response_model=List[schemas.InventoryItem], tags=["Analytics"])
def get_low_stock_items(threshold: int = 10, db: Session = Depends(get_db)):
    """
    Predictive Feature: Identifies items with stock levels below a given threshold.
    """
    items = db.query(models.InventoryItem).filter(models.InventoryItem.quantity < threshold).all()
    return items

@app.get("/analytics/stock_by_category/", response_model=Dict[str, int], tags=["Analytics"])
def get_stock_by_category(db: Session = Depends(get_db)):
    """Provides data for the 'Stock Levels by Category' chart."""
    items = crud.get_items(db, limit=1000)
    category_stock = {}
    for item in items:
        category_stock[item.category] = category_stock.get(item.category, 0) + item.quantity
    return category_stock

@app.get("/analytics/daily_shipments/", response_model=Dict[str, int], tags=["Analytics"])
def get_daily_shipments(db: Session = Depends(get_db)):
    """Provides data for the 'Daily Shipments Trend' chart."""
    shipments = crud.get_shipments(db, limit=1000)
    shipment_counts = {}
    for shipment in shipments:
        if shipment.estimated_delivery_date:
            date_str = shipment.estimated_delivery_date.isoformat()
            shipment_counts[date_str] = shipment_counts.get(date_str, 0) + shipment.quantity
    return shipment_counts