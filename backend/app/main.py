# backend/app/main.py
import os
import random
from contextlib import asynccontextmanager
from typing import Dict, List

from fastapi import Depends, FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .database import engine, get_db

MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # the mock AI endpoint never needs more than this


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Create tables on startup (not at import time) so tests can swap the engine first.
    models.Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Warehouse Inventory API",
    description="API for managing warehouse inventory, shipments, and suppliers.",
    version="1.1.0",
    lifespan=lifespan,
)

# --- CORS ---
# Local dev and the deployed frontend are allowed by default. Extra origins can be
# added without a code change: CORS_ORIGINS="https://a.com,https://b.com".
DEFAULT_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "https://warehouse-dashboard-chi.vercel.app",
]
origins = DEFAULT_ORIGINS + [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    # Any Vercel preview deployment of this project, without listing each URL.
    allow_origin_regex=r"https://warehouse-dashboard-[a-z0-9-]+-aditya-nikams-projects\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

Limit = Query(default=100, ge=1, le=500, description="Maximum rows to return")
Skip = Query(default=0, ge=0)


def _bad_request(exc: ValueError) -> HTTPException:
    """Constraint conflicts are 409, every other validation problem is 400."""
    return HTTPException(status_code=409 if isinstance(exc, crud.ConflictError) else 400, detail=str(exc))


def _found(obj, label: str):
    if obj is None:
        raise HTTPException(status_code=404, detail=f"{label} not found")
    return obj


# --- Health ---

@app.get("/", tags=["Health"])
def read_root():
    return {"message": "Welcome to the Warehouse Inventory API"}


@app.get("/health", tags=["Health"])
def health(db: Session = Depends(get_db)):
    """Liveness plus a database round trip, for uptime monitors and Render."""
    db.execute(text("SELECT 1"))
    return {"status": "ok"}


# --- Inventory Item Endpoints ---

@app.post("/items/", response_model=schemas.InventoryItem, status_code=201, tags=["Inventory"])
def create_item(item: schemas.InventoryItemCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_item(db, item)
    except ValueError as exc:
        raise _bad_request(exc)


@app.get("/items/", response_model=List[schemas.InventoryItem], tags=["Inventory"])
def read_items(skip: int = Skip, limit: int = Limit, db: Session = Depends(get_db)):
    return crud.get_items(db, skip=skip, limit=limit)


@app.get("/items/{item_id}", response_model=schemas.InventoryItem, tags=["Inventory"])
def read_item(item_id: int, db: Session = Depends(get_db)):
    return _found(crud.get_item(db, item_id), "Item")


@app.put("/items/{item_id}", response_model=schemas.InventoryItem, tags=["Inventory"])
def update_item(item_id: int, item: schemas.InventoryItemCreate, db: Session = Depends(get_db)):
    try:
        return _found(crud.update_item(db, item_id, item), "Item")
    except ValueError as exc:
        raise _bad_request(exc)


@app.delete("/items/{item_id}", response_model=schemas.InventoryItem, tags=["Inventory"])
def delete_item(item_id: int, db: Session = Depends(get_db)):
    try:
        return _found(crud.delete_item(db, item_id), "Item")
    except ValueError as exc:
        raise _bad_request(exc)


# --- Supplier Endpoints ---

@app.post("/suppliers/", response_model=schemas.Supplier, status_code=201, tags=["Suppliers"])
def create_supplier(supplier: schemas.SupplierCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_supplier(db, supplier)
    except ValueError as exc:
        raise _bad_request(exc)


@app.get("/suppliers/", response_model=List[schemas.Supplier], tags=["Suppliers"])
def read_suppliers(skip: int = Skip, limit: int = Limit, db: Session = Depends(get_db)):
    return crud.get_suppliers(db, skip=skip, limit=limit)


@app.get("/suppliers/{supplier_id}", response_model=schemas.Supplier, tags=["Suppliers"])
def read_supplier(supplier_id: int, db: Session = Depends(get_db)):
    return _found(crud.get_supplier(db, supplier_id), "Supplier")


@app.put("/suppliers/{supplier_id}", response_model=schemas.Supplier, tags=["Suppliers"])
def update_supplier(supplier_id: int, supplier: schemas.SupplierCreate, db: Session = Depends(get_db)):
    try:
        return _found(crud.update_supplier(db, supplier_id, supplier), "Supplier")
    except ValueError as exc:
        raise _bad_request(exc)


@app.delete("/suppliers/{supplier_id}", response_model=schemas.Supplier, tags=["Suppliers"])
def delete_supplier(supplier_id: int, db: Session = Depends(get_db)):
    try:
        return _found(crud.delete_supplier(db, supplier_id), "Supplier")
    except ValueError as exc:
        raise _bad_request(exc)


# --- Shipment Endpoints ---

@app.post("/shipments/", response_model=schemas.Shipment, status_code=201, tags=["Shipments"])
def create_shipment(shipment: schemas.ShipmentCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_shipment(db, shipment)
    except ValueError as exc:
        raise _bad_request(exc)


@app.get("/shipments/", response_model=List[schemas.Shipment], tags=["Shipments"])
def read_shipments(skip: int = Skip, limit: int = Limit, db: Session = Depends(get_db)):
    return crud.get_shipments(db, skip=skip, limit=limit)


@app.get("/shipments/{shipment_id}", response_model=schemas.Shipment, tags=["Shipments"])
def read_shipment(shipment_id: int, db: Session = Depends(get_db)):
    return _found(crud.get_shipment(db, shipment_id), "Shipment")


@app.put("/shipments/{shipment_id}", response_model=schemas.Shipment, tags=["Shipments"])
def update_shipment(shipment_id: int, shipment: schemas.ShipmentCreate, db: Session = Depends(get_db)):
    try:
        return _found(crud.update_shipment(db, shipment_id, shipment), "Shipment")
    except ValueError as exc:
        raise _bad_request(exc)


@app.delete("/shipments/{shipment_id}", response_model=schemas.Shipment, tags=["Shipments"])
def delete_shipment(shipment_id: int, db: Session = Depends(get_db)):
    return _found(crud.delete_shipment(db, shipment_id), "Shipment")


# --- AI & Analytics Endpoints ---

@app.post("/predict_image/", tags=["AI Features"])
async def predict_product_from_image(file: UploadFile = File(...)):
    """Mock AI feature: accepts an image and returns a random product guess.

    The image content is only size-checked, never analysed. This demonstrates the
    upload-to-prediction data flow, not a real vision model.
    """
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Image is larger than 5 MB")

    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "prediction": {
            "product_name": random.choice(["Laptop", "Keyboard", "Mouse", "Monitor", "Webcam"]),
            "estimated_quantity": random.randint(1, 50),
        },
    }


@app.get("/analytics/low_stock_alerts/", response_model=List[schemas.InventoryItem], tags=["Analytics"])
def get_low_stock_items(
    threshold: int = Query(default=crud.DEFAULT_LOW_STOCK_THRESHOLD, ge=0),
    db: Session = Depends(get_db),
):
    """Items below the stock threshold, lowest stock first."""
    return crud.get_low_stock_items(db, threshold)


@app.get("/analytics/stock_by_category/", response_model=Dict[str, int], tags=["Analytics"])
def get_stock_by_category(db: Session = Depends(get_db)):
    """Total units per category (one grouped SQL query)."""
    return crud.stock_by_category(db)


@app.get("/analytics/daily_shipments/", response_model=Dict[str, int], tags=["Analytics"])
def get_daily_shipments(db: Session = Depends(get_db)):
    """Units shipped per estimated delivery date (one grouped SQL query)."""
    return crud.daily_shipments(db)


@app.get("/analytics/summary/", response_model=schemas.DashboardSummary, tags=["Analytics"])
def get_dashboard_summary(
    threshold: int = Query(default=crud.DEFAULT_LOW_STOCK_THRESHOLD, ge=0),
    db: Session = Depends(get_db),
):
    """Headline numbers for the dashboard cards."""
    return crud.dashboard_summary(db, threshold)
