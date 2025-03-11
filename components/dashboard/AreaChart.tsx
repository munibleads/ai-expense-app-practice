'use client';

import { Card, CardHeader, CardContent, Box } from '@mui/material';
import { BarChart } from '@mui/x-charts';

interface ExpensesByCategoryProps {
  year: string;
}

const data = [
  { id: 0, value: 35000, label: 'Travel', color: '#0EA5E9' },
  { id: 1, value: 67900, label: 'Office Supplies', color: '#F59E0B' },
  { id: 2, value: 10100, label: 'Equipment', color: '#EC4899' },
  { id: 3, value: 28500, label: 'Services', color: '#2e7d32' },
  { id: 4, value: 14300, label: 'Others', color: '#9333ea' }
].sort((a, b) => b.value - a.value); // Sort by value descending

export default function ExpensesByCategory({ year }: ExpensesByCategoryProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title="Expenses by Category"
        subheader="(+43%) than last year"
        action={
          <select
            value={year}
            onChange={(e) => console.log(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: '#fff',
              color: '#1C1C1C',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#90caf9';
              e.currentTarget.style.backgroundColor = '#f5f5f5';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#e0e0e0';
              e.currentTarget.style.backgroundColor = '#fff';
            }}
          >
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
        }
        sx={{
          p: 3,
          pb: 0,
          '& .MuiCardHeader-title': {
            fontSize: '1.125rem',
            fontWeight: 600,
          },
          '& .MuiCardHeader-subheader': {
            fontSize: '0.875rem',
            color: 'success.main',
          },
        }}
      />
      <CardContent sx={{ p: 3, pb: '16px !important' }}>
        <BarChart
          dataset={data}
          yAxis={[{
            scaleType: 'band',
            dataKey: 'label',
            tickLabelStyle: {
              fontSize: 11,
              fontWeight: 500,
              fill: '#637381',
            },
          }]}
          xAxis={[{
            tickLabelStyle: {
              fontSize: 11,
              fontWeight: 500,
              fill: '#637381',
            },
            min: 0,
            valueFormatter: (value: number) => `SAR ${(value / 1000).toFixed(1)}k`,
          }]}
          series={[{
            dataKey: 'value',
            valueFormatter: (value: number) => `SAR ${(value / 1000).toFixed(1)}k`,
            color: '#2e7d32',
            highlightScope: {
              highlighted: 'item',
              faded: 'global'
            },
          }]}
          layout="horizontal"
          height={200}
          margin={{ top: 10, right: 20, bottom: 24, left: 100 }}
          sx={{
            '.MuiBarElement-root': {
              borderRadius: 1,
            },
            '.MuiBarElement-root:hover': {
              filter: 'brightness(0.9)',
            },
          }}
        />
      </CardContent>
    </Card>
  );
} 