import requests
import random
from faker import Faker
from datetime import datetime, timedelta

# --- Configuration ---
API_BASE_URL = "https://warehouse-dashboard-y8u6.onrender.com"
NUM_SUPPLIERS = 50
NUM_ITEMS = 50
NUM_SHIPMENTS = 50

# Initialize Faker to generate fake data
fake = Faker()

def seed_suppliers():
    """Seeds the database with fake suppliers."""
    print("Seeding suppliers...")
    supplier_ids = []
    for _ in range(NUM_SUPPLIERS):
        payload = {
            "name": fake.company(),
            "contact_person": fake.name(),
            "email": fake.email(),
            "phone": fake.phone_number()
        }
        try:
            response = requests.post(f"{API_BASE_URL}/suppliers/", json=payload)
            response.raise_for_status() # Raise an exception for bad status codes
            supplier_ids.append(response.json()["id"])
            print(f"  Created supplier: {payload['name']}")
        except requests.exceptions.RequestException as e:
            print(f"  Error creating supplier: {e}")
    return supplier_ids

def seed_inventory_items(supplier_ids):
    """Seeds the database with fake inventory items."""
    print("\nSeeding inventory items...")
    item_ids = []
    product_categories = ["Electronics", "Office Supplies", "Hardware", "Apparel", "Groceries"]
    for _ in range(NUM_ITEMS):
        payload = {
            "name": f"{fake.word().capitalize()} {fake.word().capitalize()}", # e.g., "Plastic Chair"
            "quantity": random.randint(10, 500),
            "category": random.choice(product_categories),
            "price": round(random.uniform(5.99, 999.99), 2),
            "supplier_id": random.choice(supplier_ids) if supplier_ids else None
        }
        try:
            response = requests.post(f"{API_BASE_URL}/items/", json=payload)
            response.raise_for_status()
            item_ids.append(response.json()["id"])
            print(f"  Created item: {payload['name']}")
        except requests.exceptions.RequestException as e:
            print(f"  Error creating item: {e}")
    return item_ids
    
def seed_shipments(item_ids):
    """Seeds the database with fake shipments."""
    print("\nSeeding shipments...")
    shipment_statuses = ["Pending", "In Transit", "Delivered", "Delayed"]
    for _ in range(NUM_SHIPMENTS):
        # Generate a random date within the next 30 days
        delivery_date = (datetime.now() + timedelta(days=random.randint(1, 30))).strftime("%Y-%m-%d")
        
        payload = {
            "item_id": random.choice(item_ids),
            "quantity": random.randint(1, 50),
            "origin": fake.address().replace('\n', ', '),
            "destination": fake.address().replace('\n', ', '),
            "status": random.choice(shipment_statuses),
            "estimated_delivery_date": delivery_date
        }
        try:
            response = requests.post(f"{API_BASE_URL}/shipments/", json=payload)
            response.raise_for_status()
            print(f"  Created shipment for item ID: {payload['item_id']}")
        except requests.exceptions.RequestException as e:
            print(f"  Error creating shipment: {e}")


if __name__ == "__main__":
    print("--- Starting Database Seeding ---")
    supplier_ids = seed_suppliers()
    if supplier_ids:
        item_ids = seed_inventory_items(supplier_ids)
        if item_ids:
            seed_shipments(item_ids)
    print("\n--- Database Seeding Complete! ---")
    print("You can now refresh your frontend application.")