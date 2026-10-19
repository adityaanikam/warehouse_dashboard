# backend/app/models.py

from sqlalchemy import Column, Date, Float, ForeignKey, Index, Integer, String
from sqlalchemy.orm import relationship

from .database import Base


class Supplier(Base):
    """A company that supplies inventory items ('suppliers' table)."""

    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, unique=True, nullable=False)
    contact_person = Column(String)
    email = Column(String, unique=True, index=True)
    phone = Column(String)


class InventoryItem(Base):
    """A stocked product ('items' table)."""

    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    quantity = Column(Integer, default=0, nullable=False)
    category = Column(String, index=True)
    price = Column(Float, default=0.0, nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), index=True)

    supplier = relationship("Supplier")


class Shipment(Base):
    """A movement of an inventory item ('shipments' table)."""

    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"), index=True, nullable=False)
    quantity = Column(Integer, nullable=False)
    origin = Column(String)
    destination = Column(String)
    status = Column(String, default="Pending", index=True)  # Pending, In Transit, Delivered, Delayed
    estimated_delivery_date = Column(Date)

    item = relationship("InventoryItem")

    __table_args__ = (
        # Speeds up the daily-shipments analytics (group by date).
        Index("ix_shipments_delivery_date", "estimated_delivery_date"),
    )
