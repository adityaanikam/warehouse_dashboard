# backend/app/models.py

from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class InventoryItem(Base):
    """
    SQLAlchemy model for an inventory item.
    Represents the 'items' table in the database.
    """
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    quantity = Column(Integer, default=0)
    category = Column(String, index=True)
    price = Column(Float, default=0.0)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))

    supplier = relationship("Supplier")

class Shipment(Base):
    """
    SQLAlchemy model for a shipment.
    Represents the 'shipments' table in the database.
    """
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"))
    quantity = Column(Integer)
    origin = Column(String)
    destination = Column(String)
    status = Column(String, default="Pending") # e.g., Pending, In Transit, Delivered
    estimated_delivery_date = Column(Date)

    item = relationship("InventoryItem")

class Supplier(Base):
    """
    SQLAlchemy model for a supplier.
    Represents the 'suppliers' table in the database.
    """
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, unique=True, nullable=False)
    contact_person = Column(String)
    email = Column(String, unique=True, index=True)
    phone = Column(String)