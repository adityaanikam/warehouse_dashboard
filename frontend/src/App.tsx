// frontend/src/App.tsx
import React, { useMemo, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { CssBaseline, PaletteMode, ThemeProvider } from '@mui/material';
import AppLayout from './components/AppLayout';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import ShipmentsPage from './pages/ShipmentsPage';
import SuppliersPage from './pages/SuppliersPage';
import { createAppTheme } from './theme';

const MODE_KEY = 'warehouse-color-mode';

/** Saved choice first, then the operating system preference. */
function initialMode(): PaletteMode {
  try {
    const saved = window.localStorage.getItem(MODE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // Storage can be blocked (private mode); fall through to the OS preference.
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function App() {
  const [mode, setMode] = useState<PaletteMode>(initialMode);
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const toggleMode = () => {
    setMode((previous) => {
      const next = previous === 'light' ? 'dark' : 'light';
      try {
        window.localStorage.setItem(MODE_KEY, next);
      } catch {
        // Ignore: the choice just will not persist.
      }
      return next;
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppLayout mode={mode} onToggleMode={toggleMode}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/shipments" element={<ShipmentsPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
