'use client';

import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  Divider,
  Tooltip,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AddIcon from '@mui/icons-material/Add';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useRouter } from 'next/navigation';
import { styled } from '@mui/material/styles';

interface StatCardProps {
  title: string;
  value: string;
  change: {
    value: string;
    period: string;
  };
  trend: 'up' | 'down';
  color: string;
  isQuickActions?: boolean;
  data?: number[];
}

const MiniBarChart = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-end',
  gap: '3px',
  height: '30px',
  marginLeft: 'auto',
  marginBottom: '25px',
  minWidth: '100px',
  paddingBottom: '5px',
}));

const Bar = styled(Box)<{ value: number; maxValue: number; color: string }>(({ value, maxValue, color }) => ({
  width: '7px',
  height: `${(value / maxValue) * 100}%`,
  backgroundColor: color,
  borderRadius: '2px',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  opacity: 0.8,
  '&:hover': {
    opacity: 1,
    transform: 'scaleY(1.05)',
  },
}));

function StatCard({ title, value, change, trend, color, isQuickActions, data = [] }: StatCardProps) {
  const router = useRouter();
  const maxValue = Math.max(...(data || []));

  if (isQuickActions) {
    return (
      <Card sx={{ 
        p: 3,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0px 0px 2px rgba(145, 158, 171, 0.2), 0px 12px 24px -4px rgba(145, 158, 171, 0.12)',
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}>
        <Stack spacing={2} width="100%">
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>

          <Stack spacing={2}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => router.push('/expenses/record')}
              sx={{ 
                borderColor: '#2e7d32',
                color: '#2e7d32',
                '&:hover': {
                  borderColor: '#1b5e20',
                  bgcolor: 'rgba(46, 125, 50, 0.04)',
                },
              }}
            >
              Add Expense
            </Button>
            <Button
              variant="outlined"
              startIcon={<AssessmentIcon />}
              onClick={() => router.push('/reports')}
              sx={{ 
                borderColor: '#2e7d32',
                color: '#2e7d32',
                '&:hover': {
                  borderColor: '#1b5e20',
                  bgcolor: 'rgba(46, 125, 50, 0.04)',
                },
              }}
            >
              Generate Report
            </Button>
          </Stack>
        </Stack>
      </Card>
    );
  }

  return (
    <Card sx={{ 
      p: 2.5,
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      boxShadow: '0px 0px 2px rgba(145, 158, 171, 0.2), 0px 12px 24px -4px rgba(145, 158, 171, 0.12)',
      borderRadius: 2,
      bgcolor: 'background.paper',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0px 0px 2px rgba(145, 158, 171, 0.2), 0px 16px 32px -4px rgba(145, 158, 171, 0.15)',
      }
    }}>
      <Stack spacing={1.5} width="100%">
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
          {title}
        </Typography>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ minHeight: '60px' }}>
          <Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 700,
              fontSize: '2rem',
              color: 'text.primary',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              mb: 1
            }}>
              {value}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  color: trend === 'up' ? 'success.main' : 'error.main',
                  bgcolor: trend === 'up' ? 'success.lighter' : 'error.lighter',
                  borderRadius: 1,
                  px: 1,
                  py: 0.25,
                }}
              >
                {trend === 'up' ? (
                  <TrendingUpIcon fontSize="small" />
                ) : (
                  <TrendingDownIcon fontSize="small" />
                )}
                <Typography variant="body2" component="span" sx={{ 
                  ml: 0.5,
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}>
                  {change.value}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {change.period}
              </Typography>
            </Stack>
          </Box>

          {data && data.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <MiniBarChart>
                {data.map((value, index) => (
                  <Tooltip 
                    key={index} 
                    title={`${value.toLocaleString()} - Day ${index + 1}`}
                    placement="top"
                    arrow
                  >
                    <Bar value={value} maxValue={maxValue} color={color} />
                  </Tooltip>
                ))}
              </MiniBarChart>
            </Box>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}

export default function StatsCards() {
  const mockData = {
    receipts: [10500, 15200, 17900, 15700, 8200, 17800, 21765],
    expenses: [4100, 4900, 3600, 3200, 4500, 4700, 2876]
  };

  const stats = [
    {
      title: 'Total Receipts',
      value: '18,765',
      change: {
        value: '+2.6%',
        period: 'last 7 days'
      },
      trend: 'up' as const,
      color: '#00A76F',
      data: mockData.receipts
    },
    {
      title: 'Total Expenses',
      value: 'SAR 4,876',
      change: {
        value: '+0.2%',
        period: 'last 7 days'
      },
      trend: 'up' as const,
      color: '#22A7F0',
      data: mockData.expenses
    },
    {
      title: 'Quick Actions',
      value: '',
      change: {
        value: '',
        period: ''
      },
      trend: 'up' as const,
      color: '#F04438',
      isQuickActions: true
    }
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        },
        gap: 3,
      }}
    >
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </Box>
  );
} 