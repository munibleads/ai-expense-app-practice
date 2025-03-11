'use client';

import { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Alert,
  Snackbar,
  Box,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ChartsOfAccountsModal from '@/app/components/zoho-books/ChartsOfAccountsModal';

interface OrganizationInfo {
  organizationId: string;
  userId: string;
  name: string;
}

interface ChartOfAccount {
  account_id: string;
  account_name: string;
  account_type: string;
  description?: string;
}

export default function ZohoBooksPage() {
  const [organizationInfo, setOrganizationInfo] = useState<OrganizationInfo | null>(null);
  const [isChartsModalOpen, setIsChartsModalOpen] = useState(false);
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetOrganizationInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/zoho-books/organization');
      if (!response.ok) {
        throw new Error('Failed to fetch organization information');
      }
      const data = await response.json();
      setOrganizationInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGetChartOfAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/zoho-books/charts-of-accounts', {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch charts of accounts');
      }
      const data = await response.json();
      setChartOfAccounts(data.chartOfAccounts || []);
      setIsChartsModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography 
          variant="h4" 
          gutterBottom
          sx={{ 
            color: 'text.primary',
            fontWeight: 600,
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <AccountBalanceWalletIcon sx={{ fontSize: 32 }} />
          Zoho Books Integration
        </Typography>

        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Organization Information
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleGetOrganizationInfo}
                disabled={loading}
                startIcon={<AccountBalanceIcon />}
              >
                {loading ? 'Loading...' : 'Get Organization Info'}
              </Button>

              {organizationInfo && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Organization ID:</strong> {organizationInfo.organizationId}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>User ID:</strong> {organizationInfo.userId}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Organization Name:</strong> {organizationInfo.name}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Charts of Accounts
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleGetChartOfAccounts}
                disabled={loading}
                startIcon={<AccountBalanceIcon />}
              >
                {loading ? 'Loading...' : 'View Charts of Accounts'}
              </Button>
            </CardContent>
          </Card>
        </Stack>

        <ChartsOfAccountsModal
          open={isChartsModalOpen}
          onClose={() => setIsChartsModalOpen(false)}
          accounts={chartOfAccounts}
        />

        <Snackbar
          open={error !== null}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert
            onClose={() => setError(null)}
            severity="error"
            sx={{ width: '100%' }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
} 