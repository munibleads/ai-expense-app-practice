'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Stack,
} from '@mui/material';
import AppsIcon from '@mui/icons-material/Apps';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FolderIcon from '@mui/icons-material/Folder';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ChatIcon from '@mui/icons-material/Chat';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useSidebar } from '@/app/contexts/SidebarContext';
import Logo from '@/components/common/Logo';

const DRAWER_WIDTH = 240;
const HEADER_HEIGHT = 70;

const menuItems = [
  {
    title: 'MENU',
    items: [
      { name: 'Dashboard', icon: <AppsIcon />, href: '/dashboard', active: true },
      { name: 'Expenses', icon: <ShoppingBagIcon />, href: '/expenses' },
      { name: 'Zoho Books', icon: <AccountBalanceWalletIcon />, href: '/zoho-books' },
      { name: 'Chat with AI', icon: <ChatIcon />, href: '/chat' },
      { name: 'Profile', icon: <PersonIcon />, href: '/profile' },
      { name: 'Settings', icon: <SettingsIcon />, href: '/settings' },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed } = useSidebar();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isCollapsed ? 70 : DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: isCollapsed ? 70 : DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #f0f0f0',
          transition: 'width 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box 
        sx={{ 
          minHeight: HEADER_HEIGHT,
          height: HEADER_HEIGHT,
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          px: isCollapsed ? 1 : 3,
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Stack 
          component={Link}
          href="/dashboard"
          direction="row" 
          alignItems="center" 
          spacing={0.15}
          sx={{
            transition: 'all 0.3s ease',
            textDecoration: 'none',
            '&:hover': {
              opacity: 0.8,
            }
          }}
        >
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}>
            <Logo width={isCollapsed ? 50 : 40} height={isCollapsed ? 50 : 40} />
          </Box>
          {!isCollapsed && (
            <>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  color: '#2e7d32',
                }}
              >
                Expenses
              </Typography>
              <Box
                sx={{
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: '#f5f5f5',
                  color: '#637381',
                  fontSize: '0.625rem',
                  fontWeight: 500,
                  ml: 0.5,
                }}
              >
                Beta
              </Box>
            </>
          )}
        </Stack>
      </Box>

      <Box 
        sx={{ 
          p: isCollapsed ? 1 : 2.5,
          overflow: 'auto',
          flexGrow: 1,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#f0f0f0',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#e0e0e0',
          },
          scrollbarWidth: 'thin',
          scrollbarColor: '#f0f0f0 transparent',
        }}
      >
        {menuItems.map((section) => (
          <Box key={section.title} sx={{ mb: 4 }}>
            {!isCollapsed && (
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: '#637381',
                  display: 'block',
                  mb: 2,
                }}
              >
                {section.title}
              </Typography>
            )}
            <List sx={{ p: 0 }}>
              {section.items.map((item) => (
                <ListItem
                  key={item.name}
                  component={Link}
                  href={item.href}
                  sx={{
                    px: isCollapsed ? 1 : 2,
                    py: 1,
                    mb: 0.5,
                    borderRadius: 1,
                    bgcolor: pathname === item.href ? '#e8f5e9' : 'transparent',
                    color: pathname === item.href ? '#2e7d32' : '#637381',
                    '&:hover': {
                      bgcolor: pathname === item.href ? '#e8f5e9' : '#f5f5f5',
                    },
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: isCollapsed ? 0 : 36,
                    color: pathname === item.href ? '#2e7d32' : '#637381',
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  {!isCollapsed && (
                    <ListItemText 
                      primary={item.name}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: pathname === item.href ? 600 : 400,
                      }}
                    />
                  )}
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </Box>

      {/* Collapse Button */}
      <Box
        sx={{
          borderTop: '1px solid #f0f0f0',
          p: 2,
          display: 'flex',
          justifyContent: 'center',
          bgcolor: 'background.paper',
        }}
      >
        <IconButton 
          onClick={() => setIsCollapsed(!isCollapsed)}
          sx={{ 
            width: 40,
            height: 40,
            borderRadius: '50%',
            color: 'text.secondary',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: '#e8f5e9',
              color: '#2e7d32',
            },
          }}
        >
          {isCollapsed ? <MenuIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>
    </Drawer>
  );
} 