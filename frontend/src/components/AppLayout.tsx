// frontend/src/components/AppLayout.tsx
import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  PaletteMode,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/GridViewOutlined';
import InventoryIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingIcon from '@mui/icons-material/LocalShippingOutlined';
import PeopleIcon from '@mui/icons-material/StorefrontOutlined';
import DarkModeIcon from '@mui/icons-material/NightsStayOutlined';
import LightModeIcon from '@mui/icons-material/WbSunnyOutlined';
import { colors, fonts, hazardStripes } from '../theme';

const drawerWidth = 236;

const menuItems = [
  { text: 'Overview', icon: <DashboardIcon />, path: '/', code: '01' },
  { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory', code: '02' },
  { text: 'Shipments', icon: <LocalShippingIcon />, path: '/shipments', code: '03' },
  { text: 'Suppliers', icon: <PeopleIcon />, path: '/suppliers', code: '04' },
];

interface AppLayoutProps {
  children: React.ReactNode;
  mode: PaletteMode;
  onToggleMode: () => void;
}

/** App shell: an always-dark ink sidebar styled like a loading-bay board, and a plain top bar. */
export default function AppLayout({ children, mode, onToggleMode }: AppLayoutProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const current = menuItems.find((item) => item.path === location.pathname) ?? menuItems[0];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: colors.ink, color: colors.nightText }}>
      <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
        <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1.9rem', lineHeight: 1, letterSpacing: '0.04em' }}>
          WAREHOUSE
        </Typography>
        <Typography variant="caption" sx={{ color: colors.yellow }}>
          BAY 01 / STOCK + SHIPMENTS
        </Typography>
      </Box>

      <List sx={{ flexGrow: 1, pt: 1 }}>
        {menuItems.map((item) => {
          const selected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                selected={selected}
                onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: 0,
                  borderLeft: `5px solid ${selected ? colors.orange : 'transparent'}`,
                  py: 1.25,
                  color: selected ? '#fff' : '#b9b19c',
                  '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: '#2c2920' },
                  '&:hover': { backgroundColor: '#26241c', color: '#fff' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}
                />
                <Typography variant="caption" sx={{ color: selected ? colors.yellow : '#6f6957' }}>
                  {item.code}
                </Typography>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box aria-hidden sx={{ height: 14, background: hazardStripes(9) }} />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ width: { md: `calc(100% - ${drawerWidth}px)` }, ml: { md: `${drawerWidth}px` } }}>
        <Toolbar sx={{ gap: 1 }}>
          <IconButton color="inherit" aria-label="open navigation" edge="start" onClick={() => setMobileOpen(true)} sx={{ display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="subtitle1" noWrap sx={{ flexGrow: 1 }}>
            {current.code} / {current.text}
          </Typography>
          <Button
            color="inherit"
            variant="outlined"
            size="small"
            onClick={onToggleMode}
            aria-label="toggle light and dark mode"
            startIcon={mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            sx={{ borderColor: 'divider' }}
          >
            {mode === 'dark' ? 'Day shift' : 'Night shift'}
          </Button>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 0 } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 0 } }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, sm: 3 }, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
