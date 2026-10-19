# backend/app/seed.py
"""Fill the LOCAL database with realistic demo data.

    cd backend
    python -m app.seed            # seeds only when the tables are empty
    python -m app.seed --reset    # wipes everything first, then seeds

It writes straight to the database named by DATABASE_URL (SQLite by default), so it
never touches a deployed API. Requires `faker` (see requirements-dev.txt).
"""
import argparse
import random
from datetime import date, timedelta

from faker import Faker
from sqlalchemy import func, select

from . import models
from .database import SessionLocal, engine

CATEGORIES = {
    "Electronics": ["Laptop", "Monitor", "Keyboard", "Mouse", "Webcam", "Router", "Headset", "Power Bank"],
    "Office Supplies": ["Stapler", "Notebook", "Whiteboard", "Marker Set", "Desk Lamp", "Paper Ream"],
    "Hardware": ["Drill", "Screwdriver Set", "Toolbox", "Hammer", "Wrench", "Ladder"],
    "Apparel": ["Safety Vest", "Work Gloves", "Hard Hat", "Boots", "Uniform Shirt"],
    "Groceries": ["Rice Bag", "Cooking Oil", "Tea Pack", "Sugar Sack", "Flour Bag"],
}
STATUSES = ["Pending", "In Transit", "Delivered", "Delayed"]
WAREHOUSES = ["Pune Hub", "Mumbai Port", "Bengaluru DC", "Delhi NCR Depot", "Chennai Yard", "Hyderabad Hub"]


def seed(num_suppliers: int = 12, num_shipments: int = 60, seed_value: int = 7) -> None:
    random.seed(seed_value)
    fake = Faker("en_IN")
    Faker.seed(seed_value)

    models.Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        suppliers = []
        for _ in range(num_suppliers):
            suppliers.append(
                models.Supplier(
                    name=f"{fake.company()} {fake.unique.random_int(10, 99)}",
                    contact_person=fake.name(),
                    email=fake.unique.company_email(),
                    phone=fake.phone_number(),
                )
            )
        db.add_all(suppliers)
        db.flush()

        items = []
        for category, names in CATEGORIES.items():
            for name in names:
                # A few items are deliberately low on stock so the alerts show something.
                low = random.random() < 0.2
                items.append(
                    models.InventoryItem(
                        name=name,
                        category=category,
                        quantity=random.randint(0, 9) if low else random.randint(15, 400),
                        price=round(random.uniform(9.99, 499.99), 2),
                        supplier_id=random.choice(suppliers).id,
                    )
                )
        db.add_all(items)
        db.flush()

        today = date.today()
        for _ in range(num_shipments):
            origin, destination = random.sample(WAREHOUSES, 2)
            db.add(
                models.Shipment(
                    item_id=random.choice(items).id,
                    quantity=random.randint(1, 60),
                    origin=origin,
                    destination=destination,
                    status=random.choices(STATUSES, weights=[3, 4, 5, 1])[0],
                    estimated_delivery_date=today + timedelta(days=random.randint(-10, 20)),
                )
            )
        db.commit()
    print(f"Seeded {num_suppliers} suppliers, {sum(len(v) for v in CATEGORIES.values())} items, {num_shipments} shipments.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed the local warehouse database.")
    parser.add_argument("--reset", action="store_true", help="drop all tables first")
    args = parser.parse_args()

    if args.reset:
        models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        existing = db.scalar(select(func.count(models.InventoryItem.id))) or 0
    if existing and not args.reset:
        print(f"Database already has {existing} items. Use --reset to start over.")
        return
    seed()


if __name__ == "__main__":
    main()
