import React, { useState } from 'react';
import {
  Box,
  Button,
  Alert,
  AlertTitle,
  CircularProgress,
  Typography,
  Paper,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

export default function TokenVerification() {
  const [status, setStatus] = useState<{
    loading: boolean;
    error?: string;
    data?: any;
  }>({
    loading: false,
  });

  const verifyToken = async () => {
    setStatus({ loading: true });
    try {
      const response = await fetch('/api/zoho-books/verify-token');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify token');
      }

      setStatus({
        loading: false,
        data,
      });
    } catch (error) {
      setStatus({
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  return (
    <Box>
      <Button
        variant="contained"
        onClick={verifyToken}
        disabled={status.loading}
        sx={{ mb: 2 }}
      >
        {status.loading ? (
          <CircularProgress size={24} sx={{ mr: 1 }} />
        ) : null}
        Verify Zoho Books Token
      </Button>

      {status.error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Error</AlertTitle>
          {status.error}
        </Alert>
      ) : null}

      {status.data ? (
        <Paper sx={{ p: 2 }}>
          {status.data.valid ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Token is valid</Typography>
              </Box>
              
              <Typography variant="subtitle1" gutterBottom>
                Connected Organizations:
              </Typography>
              
              {status.data.organizations?.map((org: any) => (
                <Box key={org.id} sx={{ mb: 2 }}>
                  <Typography>
                    <strong>Name:</strong> {org.name}
                  </Typography>
                  <Typography>
                    <strong>ID:</strong> {org.id}
                  </Typography>
                  <Typography>
                    <strong>Currency:</strong> {org.currencyCode}
                  </Typography>
                  <Typography>
                    <strong>Time Zone:</strong> {org.timeZone}
                  </Typography>
                </Box>
              ))}
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ErrorIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="h6">Token is invalid</Typography>
            </Box>
          )}
        </Paper>
      ) : null}
    </Box>
  );
} 