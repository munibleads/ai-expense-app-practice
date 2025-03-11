'use client';

import { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Badge,
  Avatar,
  IconButton,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import LanguageIcon from '@mui/icons-material/Language';
import { useRouter } from 'next/navigation';

const HEADER_HEIGHT = 70;

export default function TopNav() {
  const router = useRouter();

  return (
    <AppBar 
      position="static" 
      color="transparent" 
      elevation={0}
      sx={{ 
        borderBottom: '1px solid #f0f0f0',
        bgcolor: '#ffffff',
      }}
    >
      <Toolbar 
        sx={{ 
          minHeight: HEADER_HEIGHT,
          height: HEADER_HEIGHT,
          px: 3,
          '&.MuiToolbar-root': {
            padding: '0 24px',
          }
        }}
      >
        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton size="large" sx={{ color: '#637381' }}>
            <LanguageIcon />
          </IconButton>

          <IconButton size="large" sx={{ color: '#637381' }}>
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton 
            size="large" 
            sx={{ color: '#637381' }}
            onClick={() => router.push('/settings')}
          >
            <SettingsIcon />
          </IconButton>

          <IconButton 
            sx={{ p: 0 }}
            onClick={() => router.push('/profile')}
          >
            <Avatar
              src="/avatars/avatar1.jpg"
              alt="User avatar"
              sx={{ width: 40, height: 40 }}
            />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
} 