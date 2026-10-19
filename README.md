# Warehouse Inventory and Monitoring Dashboard

**Live demo: [warehouse-dashboard-chi.vercel.app](https://warehouse-dashboard-chi.vercel.app/)**

A full stack dashboard for managing warehouse inventory, shipments and suppliers. A React and TypeScript
frontend talks to a FastAPI backend over a PostgreSQL database (SQLite for local development).

It started as a developer assessment and has since been tidied up: SQL level analytics, validation, tests,
a seed script and a reworked interface.

## Features

- **Inventory, shipments and suppliers**: list, search, filter, create, edit and delete from the UI.
  Deleting something that is still referenced (a supplier with items, an item with shipments) is refused
  with a clear message instead of failing silently.
- **Overview dashboard**: headline numbers (products, units in stock, inventory value, low stock), stock by
  category, shipment status, deliveries by date, and a restocking list sorted by lowest stock.
- **Validation on both sides**: the forms check input before sending, and the API rejects bad data with
  readable errors (negative quantities, malformed emails, unknown suppliers or items, unknown statuses).
- A packing-slip look (kraft paper, ink, safety orange, shipping-label cards, stamped status tags) with a **day shift / night shift** toggle that is remembered between visits, and a layout that works on phones.
- **Demo image detection**: upload a picture and get a product guess. This is a mock. The server returns a
  random product and never looks at the image. It exists to demonstrate the upload-to-prediction data flow.

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React 19, TypeScript, MUI and MUI X Data Grid, Chart.js, Axios, React Router |
| Backend | Python, FastAPI, SQLAlchemy 2, Pydantic 2 |
| Database | PostgreSQL in production, SQLite locally |
| Testing | pytest (API), Jest and Testing Library (UI) |
| Deployment | Vercel (frontend), Render (backend) |

## Run it locally

You need Python 3.11+ and Node 18+.

### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt

python -m app.seed                 # optional: fill the local database with demo data
uvicorn app.main:app --reload      # http://localhost:8000  (docs at /docs)
```

The local database is `backend/warehouse.db`. `python -m app.seed --reset` wipes and refills it. The seed
script only writes to the local database and never calls a deployed API.

### 2. Frontend

```bash
cd frontend
npm install
npm start                          # http://localhost:3000
```

The frontend calls `http://127.0.0.1:8000` by default. Point it elsewhere with `REACT_APP_API_URL`.

### 3. Tests

```bash
cd backend && pytest                       # API tests (a temporary database, never your real one)
cd frontend && npm test -- --watchAll=false
```

## API

Interactive docs are served at `/docs`. All list endpoints take `skip` and `limit` (1 to 500).

| Resource | Endpoints |
|---|---|
| Items | `GET/POST /items/`, `GET/PUT/DELETE /items/{id}` |
| Suppliers | `GET/POST /suppliers/`, `GET/PUT/DELETE /suppliers/{id}` |
| Shipments | `GET/POST /shipments/`, `GET/PUT/DELETE /shipments/{id}` |
| Analytics | `GET /analytics/summary/`, `/analytics/stock_by_category/`, `/analytics/daily_shipments/`, `/analytics/low_stock_alerts/?threshold=10` |
| Demo AI | `POST /predict_image/` (mock) |
| Health | `GET /health` (checks the database too) |

Status codes: `201` on create, `400` for invalid references, `404` when missing, `409` when a delete would
break a reference, `422` for validation errors.

## Design notes

- **Analytics run in SQL.** Category totals, delivery-date totals and the summary cards are `GROUP BY`
  queries, not Python loops over rows, so cost does not grow with the amount of data.
- **No query per row.** Item and shipment lists eager-load their related rows. A test counts the SQL
  statements for a 20-row list and fails if the number grows with the row count. The low-stock endpoint used
  to run one extra query per item, which this test now guards against.
- **Indexes** on the foreign keys, shipment status and delivery date.
- **Config through the environment**: `DATABASE_URL` (a `postgres://` URL is rewritten to `postgresql://`),
  and `CORS_ORIGINS` for extra allowed frontends. Vercel preview deployments of this project are allowed
  by a pattern.
- **Existing databases**: tables are created on startup but never altered. If you deploy this over an
  existing database, new indexes and the stricter column rules need a migration (Alembic is not set up).

## Deploying

- **Backend (Render)**: build `pip install -r backend/requirements.txt`, start
  `uvicorn app.main:app --host 0.0.0.0 --port $PORT` from the `backend` folder, set `DATABASE_URL`, and use
  `/health` as the health check path.
- **Frontend (Vercel)**: root directory `frontend`, set `REACT_APP_API_URL` to the backend URL.

## Project layout

```
backend/
  app/            main.py (routes), crud.py (queries), models.py, schemas.py, database.py, seed.py
  tests/          API tests
frontend/src/
  api/            axios client and error handling
  components/     layout, charts, forms, the shared ResourcePage table screen
  pages/          dashboard, inventory, shipments, suppliers
```

`prompts.md` records the prompts used while building the original assessment.
