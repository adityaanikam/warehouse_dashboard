# backend/tests/conftest.py
import os
import tempfile

# The database URL must be set before the app modules are imported, because the
# engine is created at import time. A temp file keeps every test off the real DB.
_DB_FILE = os.path.join(tempfile.mkdtemp(prefix="warehouse-tests-"), "test.db")
os.environ["DATABASE_URL"] = f"sqlite:///{_DB_FILE}"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app import models  # noqa: E402
from app.database import engine  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture()
def client():
    """A client backed by a fresh, empty database for every test."""
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture()
def supplier(client):
    response = client.post(
        "/suppliers/",
        json={"name": "Acme Traders", "contact_person": "Asha", "email": "asha@acme.in", "phone": "9999999999"},
    )
    assert response.status_code == 201
    return response.json()


def make_item(client, name="Laptop", quantity=25, category="Electronics", price=500.0, supplier_id=None):
    response = client.post(
        "/items/",
        json={"name": name, "quantity": quantity, "category": category, "price": price, "supplier_id": supplier_id},
    )
    assert response.status_code == 201, response.text
    return response.json()
