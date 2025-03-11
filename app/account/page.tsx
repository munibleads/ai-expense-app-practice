import React from 'react';
import { Box, Typography } from '@mui/material';

export default function AccountPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Account
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Account settings coming soon...
      </Typography>
    </Box>
  );
} 