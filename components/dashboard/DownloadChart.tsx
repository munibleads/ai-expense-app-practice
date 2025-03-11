'use client';

import { Card, CardHeader, CardContent } from '@mui/material';
import { LineChart } from '@mui/x-charts';

const data = [
  { month: 'Jan', expenses: 24000 },
  { month: 'Feb', expenses: 13980 },
  { month: 'Mar', expenses: 98000 },
  { month: 'Apr', expenses: 39080 },
  { month: 'May', expenses: 48000 },
  { month: 'Jun', expenses: 38000 },
  { month: 'Jul', expenses: 43000 },
];

export default function MonthlyExpensesChart() {
  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader 
        title="Monthly Expenses" 
        subheader="(+43%) than last year"
        action={
          <select
            value="2023"
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
        <LineChart
          series={[
            {
              data: data.map(item => item.expenses),
              label: 'Expenses (SAR)',
              color: '#2e7d32',
              area: true,
              showMark: true,
              valueFormatter: (value: number) => `SAR ${(value / 1000).toFixed(1)}k`,
              curve: "monotoneX",
            },
          ]}
          xAxis={[{
            data: data.map(item => item.month),
            scaleType: 'band',
            tickLabelStyle: {
              fontSize: 11,
              fontWeight: 500,
            },
          }]}
          yAxis={[{
            tickLabelStyle: {
              fontSize: 11,
              fontWeight: 500,
            },
            min: 0,
            max: 100000,
            tickNumber: 5,
          }]}
          height={200}
          margin={{ top: 20, right: 20, bottom: 24, left: 60 }}
          sx={{
            '.MuiLineElement-root': {
              strokeWidth: 2,
            },
            '.MuiAreaElement-root': {
              fillOpacity: 0.1,
            },
            '.MuiChartsAxis-line': {
              stroke: '#e0e0e0',
            },
            '.MuiChartsAxis-tick': {
              stroke: '#e0e0e0',
            },
            '.MuiChartsAxis-label': {
              fill: '#637381',
              fontSize: '0.75rem',
            },
            '.MuiChartsAxis-tickLabel': {
              fill: '#637381',
            },
            '.MuiMarkElement-root': {
              stroke: '#2e7d32',
              scale: '0.6',
              fill: '#fff',
              strokeWidth: 2,
            },
          }}
          slotProps={{
            legend: {
              hidden: true,
            },
          }}
        />
      </CardContent>
    </Card>
  );
} 