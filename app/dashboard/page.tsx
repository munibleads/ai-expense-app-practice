'use client';

import { Box, Container, Grid } from '@mui/material';
import WelcomeCard from '@/components/dashboard/WelcomeCard';
import StatsCards from '@/components/dashboard/StatsCards';
import MonthlyExpensesChart from '@/components/dashboard/DownloadChart';
import ExpensesByCategory from '@/components/dashboard/AreaChart';
import ExpensesTable from '@/components/dashboard/ExpensesTable';

export default function DashboardPage() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Grid container spacing={3}>
          {/* Welcome Card */}
          <Grid item xs={12} md={8}>
            <WelcomeCard 
              name="Haseeb Jamil"
              message="Track and manage your expenses efficiently with our AI-powered expense management system."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 2,
                bgcolor: '#1C1C1C',
                backgroundImage: 'url(/featured-app-bg.jpg)',
                backgroundSize: 'cover',
                color: 'white',
              }}
            >
              <Box sx={{ mb: 1 }}>
                <Box
                  component="span"
                  sx={{
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: 'success.main',
                    color: 'white',
                    fontSize: '0.75rem',
                  }}
                >
                  FEATURED APP
                </Box>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Box component="h3" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 1 }}>
                  AI Expense Analysis
                </Box>
                <Box component="p" sx={{ color: 'grey.400', fontSize: '0.875rem' }}>
                  Get insights into your spending patterns with AI-powered analysis.
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Stats Cards */}
          <Grid item xs={12}>
            <StatsCards />
          </Grid>

          {/* Charts */}
          <Grid item xs={12} md={6}>
            <Box sx={{ height: '100%' }}>
              <MonthlyExpensesChart />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: '100%' }}>
              <ExpensesByCategory year="2023" />
            </Box>
          </Grid>

          {/* Expenses Table */}
          <Grid item xs={12}>
            <ExpensesTable />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
} 