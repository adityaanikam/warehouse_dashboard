# backend/tests/test_api.py
import io

from sqlalchemy import event

from app.database import engine

from .conftest import make_item


def _make_supplier(client, index):
    response = client.post("/suppliers/", json={"name": f"Supplier {index}", "email": f"s{index}@example.com"})
    assert response.status_code == 201
    return response.json()


# --- Health ---

def test_health_checks_the_database(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


# --- Inventory ---

def test_item_crud_round_trip(client, supplier):
    created = make_item(client, supplier_id=supplier["id"])
    assert created["supplier"]["name"] == "Acme Traders"

    fetched = client.get(f"/items/{created['id']}").json()
    assert fetched["name"] == "Laptop"

    updated = client.put(
        f"/items/{created['id']}",
        json={"name": "Laptop Pro", "quantity": 5, "category": "Electronics", "price": 700, "supplier_id": supplier["id"]},
    )
    assert updated.status_code == 200
    assert updated.json()["name"] == "Laptop Pro"
    assert updated.json()["quantity"] == 5

    assert client.delete(f"/items/{created['id']}").status_code == 200
    assert client.get(f"/items/{created['id']}").status_code == 404


def test_item_validation_rejects_bad_numbers(client):
    bad = {"name": "X", "quantity": -1, "category": "A", "price": 1}
    assert client.post("/items/", json=bad).status_code == 422
    bad = {"name": "X", "quantity": 1, "category": "A", "price": -5}
    assert client.post("/items/", json=bad).status_code == 422
    bad = {"name": "", "quantity": 1, "category": "A", "price": 5}
    assert client.post("/items/", json=bad).status_code == 422


def test_item_with_unknown_supplier_is_a_400(client):
    response = client.post(
        "/items/", json={"name": "X", "quantity": 1, "category": "A", "price": 1, "supplier_id": 999}
    )
    assert response.status_code == 400
    assert "supplier" in response.json()["detail"].lower()


def test_pagination_limit_is_capped(client):
    assert client.get("/items/?limit=501").status_code == 422
    assert client.get("/items/?limit=0").status_code == 422
    assert client.get("/items/?limit=5&skip=0").status_code == 200


def test_listing_items_does_not_query_per_row(client, supplier):
    """Eager loading: the number of SQL statements must not grow with the row count."""
    for index in range(20):
        sup = _make_supplier(client, index)
        make_item(client, name=f"Item {index}", supplier_id=sup["id"])

    statements = []

    def count(_conn, _cursor, statement, *_args):
        statements.append(statement)

    event.listen(engine, "before_cursor_execute", count)
    try:
        response = client.get("/items/")
    finally:
        event.remove(engine, "before_cursor_execute", count)

    assert response.status_code == 200
    assert len(response.json()) == 20
    assert len(statements) <= 2, statements


# --- Suppliers ---

def test_duplicate_supplier_is_rejected(client, supplier):
    response = client.post("/suppliers/", json={"name": "Acme Traders", "email": "other@acme.in"})
    assert response.status_code == 400


def test_supplier_email_must_look_like_an_email(client):
    response = client.post("/suppliers/", json={"name": "Bad Email Co", "email": "not-an-email"})
    assert response.status_code == 422


def test_cannot_delete_supplier_that_still_has_items(client, supplier):
    make_item(client, supplier_id=supplier["id"])
    response = client.delete(f"/suppliers/{supplier['id']}")
    assert response.status_code == 409


# --- Shipments ---

def _shipment(item_id, quantity=10, day="2026-11-01", status="In Transit"):
    return {
        "item_id": item_id,
        "quantity": quantity,
        "origin": "Pune Hub",
        "destination": "Mumbai Port",
        "status": status,
        "estimated_delivery_date": day,
    }


def test_shipment_requires_existing_item(client):
    response = client.post("/shipments/", json=_shipment(item_id=404))
    assert response.status_code == 400


def test_shipment_rejects_unknown_status_and_zero_quantity(client):
    item = make_item(client)
    assert client.post("/shipments/", json=_shipment(item["id"], status="Teleported")).status_code == 422
    assert client.post("/shipments/", json=_shipment(item["id"], quantity=0)).status_code == 422


def test_shipment_response_includes_the_item(client):
    item = make_item(client, name="Monitor")
    created = client.post("/shipments/", json=_shipment(item["id"]))
    assert created.status_code == 201
    assert created.json()["item"]["name"] == "Monitor"
    assert client.get("/shipments/").json()[0]["item"]["name"] == "Monitor"


def test_cannot_delete_item_that_has_shipments(client):
    item = make_item(client)
    client.post("/shipments/", json=_shipment(item["id"]))
    assert client.delete(f"/items/{item['id']}").status_code == 409


# --- Analytics ---

def test_stock_by_category_sums_in_sql(client):
    make_item(client, name="A", quantity=10, category="Electronics")
    make_item(client, name="B", quantity=5, category="Electronics")
    make_item(client, name="C", quantity=7, category="Hardware")
    assert client.get("/analytics/stock_by_category/").json() == {"Electronics": 15, "Hardware": 7}


def test_daily_shipments_groups_by_date_and_is_sorted(client):
    item = make_item(client)
    client.post("/shipments/", json=_shipment(item["id"], 4, "2026-11-03"))
    client.post("/shipments/", json=_shipment(item["id"], 6, "2026-11-01"))
    client.post("/shipments/", json=_shipment(item["id"], 5, "2026-11-01"))
    data = client.get("/analytics/daily_shipments/").json()
    assert data == {"2026-11-01": 11, "2026-11-03": 4}
    assert list(data) == ["2026-11-01", "2026-11-03"]


def test_low_stock_alerts_are_sorted_and_respect_threshold(client):
    make_item(client, name="Plenty", quantity=100)
    make_item(client, name="Low", quantity=3)
    make_item(client, name="Lower", quantity=1)
    names = [i["name"] for i in client.get("/analytics/low_stock_alerts/").json()]
    assert names == ["Lower", "Low"]
    assert client.get("/analytics/low_stock_alerts/?threshold=0").json() == []


def test_low_stock_alerts_do_not_query_per_row(client, supplier):
    """This endpoint used to lazy-load each item's supplier, one query per row."""
    for index in range(20):
        # A different supplier per item, otherwise SQLAlchemy's cache hides lazy loading.
        sup = _make_supplier(client, index)
        make_item(client, name=f"Low {index}", quantity=1, supplier_id=sup["id"])

    statements = []

    def count(_conn, _cursor, statement, *_args):
        statements.append(statement)

    event.listen(engine, "before_cursor_execute", count)
    try:
        response = client.get("/analytics/low_stock_alerts/")
    finally:
        event.remove(engine, "before_cursor_execute", count)

    assert len(response.json()) == 20
    assert len(statements) <= 2, f"{len(statements)} queries: {statements[:3]}"


def test_dashboard_summary(client, supplier):
    a = make_item(client, name="A", quantity=10, price=2.0, supplier_id=supplier["id"])
    make_item(client, name="B", quantity=3, price=10.0)
    client.post("/shipments/", json=_shipment(a["id"], status="Delivered"))
    client.post("/shipments/", json=_shipment(a["id"], status="Delivered"))
    client.post("/shipments/", json=_shipment(a["id"], status="Pending"))

    summary = client.get("/analytics/summary/").json()
    assert summary["total_items"] == 2
    assert summary["total_units"] == 13
    assert summary["inventory_value"] == 50.0  # 10*2 + 3*10
    assert summary["low_stock_count"] == 1  # B (3 units) is low; A has exactly 10, which is not below 10
    assert summary["supplier_count"] == 1
    assert summary["shipments_by_status"] == {"Delivered": 2, "Pending": 1}


def test_summary_on_empty_database(client):
    summary = client.get("/analytics/summary/").json()
    assert summary["total_items"] == 0
    assert summary["inventory_value"] == 0
    assert summary["shipments_by_status"] == {}


# --- Mock AI endpoint ---

PNG = b"\x89PNG\r\n\x1a\n" + b"0" * 32


def test_predict_image_accepts_an_image(client):
    response = client.post("/predict_image/", files={"file": ("a.png", io.BytesIO(PNG), "image/png")})
    assert response.status_code == 200
    prediction = response.json()["prediction"]
    assert prediction["product_name"] in {"Laptop", "Keyboard", "Mouse", "Monitor", "Webcam"}
    assert 1 <= prediction["estimated_quantity"] <= 50


def test_predict_image_rejects_non_images(client):
    response = client.post("/predict_image/", files={"file": ("a.txt", io.BytesIO(b"hello"), "text/plain")})
    assert response.status_code == 400


def test_predict_image_rejects_oversized_files(client):
    big = io.BytesIO(b"0" * (5 * 1024 * 1024 + 10))
    response = client.post("/predict_image/", files={"file": ("big.png", big, "image/png")})
    assert response.status_code == 413
