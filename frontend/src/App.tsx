// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import ShipmentsPage from './pages/ShipmentsPage';
import SuppliersPage from './pages/SuppliersPage';

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/shipments" element={<ShipmentsPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
