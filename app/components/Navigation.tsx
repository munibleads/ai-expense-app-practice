'use client';

import React from 'react';
import { AppBar, Box, Toolbar, IconButton, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ChatIcon from '@mui/icons-material/Chat';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import { usePathname, useRouter } from 'next/navigation';

const Navigation = () => {
  const router = useRouter();
  const pathname = usePathname();

  const buttonStyles = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    padding: '8px 16px',
    borderRadius: 0,
    color: 'text.secondary',
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '2px',
      backgroundColor: 'primary.main',
      transform: 'scaleX(0)',
      transition: 'transform 0.2s ease-in-out',
    },
    '&:hover': {
      backgroundColor: 'action.hover',
      color: 'primary.main',
    },
    '&:focus': {
      outline: 'none',
    },
    '&.active': {
      color: 'primary.main',
      '&::after': {
        transform: 'scaleX(1)',
      },
    },
    '&:focus-visible::after': {
      transform: 'scaleX(1)',
    },
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { path: '/expenses', label: 'Expenses', icon: ReceiptIcon },
    { path: '/chat', label: 'Chat', icon: ChatIcon },
    { path: '/account', label: 'Account', icon: AccountCircleIcon },
    { path: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <AppBar 
      position="fixed"
      sx={{
        backgroundColor: 'background.paper',
        boxShadow: 'none',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Toolbar sx={{ justifyContent: 'center', gap: 2 }}>
        {navItems.map(({ path, label, icon: Icon }) => (
          <IconButton 
            key={path}
            onClick={() => router.push(path)}
            className={pathname === path ? 'active' : ''}
            sx={buttonStyles}
          >
            <Icon sx={{ fontSize: '1.2rem' }} />
            <Typography sx={{ fontSize: '0.875rem' }}>
              {label}
            </Typography>
          </IconButton>
        ))}
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 