# AI-Powered Warehouse Inventory & Monitoring Dashboard

This is a full-stack web application built for a developer assessment. It provides a comprehensive dashboard for managing warehouse inventory, tracking shipments, and handling supplier information.

A key feature is a mock AI endpoint that demonstrates a full frontend-to-backend-to-frontend data flow for a simulated product image analysis.

---

## Tech Stack

- **Frontend**: React (TypeScript), MUI, Chart.js, Axios
- **Backend**: Python, FastAPI, SQLAlchemy
- **Database**: SQLite
- **Deployment**: Vercel (Frontend), Render (Backend)

---

## Features

- **Inventory, Shipment, & Supplier Management**: Full CRUD operations for all core data models.
- **Analytics Dashboard**: Visual charts for "Stock Levels by Category" and "Daily Shipments Trend."
- **Low-Stock Alerts**: A simple predictive feature that flags items with quantities below a certain threshold.
- **Mock AI Image Analysis**: Upload **any image** to simulate product detection. The backend will return a randomly selected product from a predefined list (**Laptop, Keyboard, Mouse, Monitor, Webcam**) to demonstrate the complete API integration.

---

## Local Setup & Installation

### 1. Backend Server (FastAPI)

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\\venv\\Scripts\\activate

# Install dependencies and run the server
pip install -r requirements.txt
uvicorn app.main:app --reload