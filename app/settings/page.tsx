'use client';

import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
} from '@mui/material';
import TokenVerification from '@/app/components/zoho-books/TokenVerification';

export default function SettingsPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Zoho Books Integration
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Verify your Zoho Books API connection and view connected organizations.
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <TokenVerification />
        </Paper>
      </Box>
    </Container>
  );
} 