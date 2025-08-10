# AI-Powered Warehouse Inventory & Monitoring Dashboard

**🌐 [Live Demo](https://warehouse-dashboard-chi.vercel.app/)**

This is a full-stack web application built for a developer assessment. It provides a comprehensive dashboard for managing warehouse inventory, tracking shipments, and handling supplier information.

A key feature is a mock AI endpoint that demonstrates a full frontend-to-backend-to-frontend data flow for a simulated product image analysis.

---

## Tech Stack

- **Frontend**: React (TypeScript), MUI, Chart.js, Axios
- **Backend**: Python, FastAPI, SQLAlchemy
- **Database**: PostgreSQL (Production), SQLite (Local)
- **Deployment**: Vercel (Frontend), Render (Backend)

---

## Features

- **Inventory, Shipment, & Supplier Management**: Full CRUD operations for all core data models.
- **Analytics Dashboard**: Visual charts for "Stock Levels by Category" and "Daily Shipments Trend."
- **Low-Stock Alerts**: A simple predictive feature that flags items with quantities below a certain threshold.
- **Mock AI Image Analysis**: Upload **any image** to simulate product detection. The backend does not actually analyze the image content. Instead, it demonstrates the API functionality by randomly returning one of the following predefined product names: **Laptop, Keyboard, Mouse, Monitor, or Webcam**.

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
```

The backend will be available at `http://localhost:8000`

### 2. Frontend Application (React)

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies and start the development server
npm install
npm start
```

The frontend will be available at `http://localhost:3000`

### 3. JSON Server (Optional - for mock tips data)

```bash
# Navigate to the json-server directory
cd json-server

# Install and run JSON server
npm install -g json-server
json-server --watch db.json --port 3001
```

---

## API Endpoints

### Core CRUD Operations
- `GET /items/` - Retrieve all inventory items
- `POST /items/` - Create new inventory item
- `PUT /items/{id}` - Update inventory item
- `DELETE /items/{id}` - Delete inventory item

- `GET /suppliers/` - Retrieve all suppliers
- `POST /suppliers/` - Create new supplier
- `PUT /suppliers/{id}` - Update supplier
- `DELETE /suppliers/{id}` - Delete supplier

- `GET /shipments/` - Retrieve all shipments
- `POST /shipments/` - Create new shipment
- `PUT /shipments/{id}` - Update shipment
- `DELETE /shipments/{id}` - Delete shipment

### Analytics & AI
- `GET /analytics/stock_by_category/` - Stock levels by category
- `GET /analytics/daily_shipments/` - Daily shipments trend
- `GET /analytics/low_stock_alerts/` - Low stock alerts
- `POST /predict_image/` - Mock AI image analysis

---

## Project Structure

```
warehouse_dashboard_bhatiyani/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI application
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── crud.py          # Database operations
│   │   └── database.py      # Database configuration
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── api/            # API service functions
│   │   └── types/          # TypeScript type definitions
│   └── package.json
└── json-server/
    └── db.json             # Mock data for tips
```

---

## Key Features Explained

### Mock AI Image Analysis
This feature demonstrates a complete frontend-to-backend integration workflow:

1. **Frontend**: User uploads any image file through the UI
2. **Backend**: Receives the file and validates it's an image
3. **Mock Processing**: Instead of actual image analysis, the backend randomly selects from predefined products
4. **Response**: Returns a mock prediction with product name and estimated quantity
5. **Frontend**: Displays the "prediction" result to the user

This simulates how a real AI-powered inventory system would work without requiring actual computer vision models.

### Analytics Dashboard
- **Stock Levels by Category**: Bar chart showing total inventory quantities grouped by product category
- **Daily Shipments Trend**: Line chart displaying shipment quantities over time
- **Low Stock Alerts**: Real-time alerts for items with quantities below threshold

### Responsive Design
The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

The sidebar automatically collapses on smaller screens and can be toggled with a hamburger menu.

---

## Deployment

### Frontend (Vercel)
- Automatically deployed from GitHub repository
- Environment variables configured for production API endpoints
- Optimized build process with TypeScript compilation

### Backend (Render)
- Python FastAPI application deployed as a web service
- PostgreSQL database for production data
- Environment-based CORS configuration for security
- Health check endpoint for monitoring

---

## Development Notes

- **TypeScript**: Full type safety throughout the frontend
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Form Validation**: Real-time validation with helpful error messages
- **Loading States**: Proper loading indicators for better UX
- **Database**: Eager loading implemented to prevent N+1 query problems

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## License

This project is created for assessment purposes.