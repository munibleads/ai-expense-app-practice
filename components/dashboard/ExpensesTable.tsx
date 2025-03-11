'use client';

import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Button,
  Stack,
  Chip
} from '@mui/material';

interface Expense {
  id: string;
  category: string;
  price: string;
  status: 'Paid' | 'Out of date' | 'Progress';
}

const expenses: Expense[] = [
  { id: 'INV-1990', category: 'Android', price: '$83.74', status: 'Paid' },
  { id: 'INV-1991', category: 'Mac', price: '$97.14', status: 'Out of date' },
  { id: 'INV-1992', category: 'Windows', price: '$68.71', status: 'Progress' },
  { id: 'INV-1993', category: 'Android', price: '$85.21', status: 'Paid' },
  { id: 'INV-1994', category: 'Mac', price: '$52.17', status: 'Paid' }
];

function getStatusColor(status: Expense['status']) {
  switch (status) {
    case 'Paid':
      return {
        color: 'success',
        bgcolor: 'success.lighter',
      };
    case 'Out of date':
      return {
        color: 'error',
        bgcolor: 'error.lighter',
      };
    case 'Progress':
      return {
        color: 'warning',
        bgcolor: 'warning.lighter',
      };
    default:
      return {
        color: 'default',
        bgcolor: 'default.lighter',
      };
  }
}

export default function ExpensesTable() {
  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Expenses
      </Typography>

      <Box sx={{ overflow: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice ID</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((expense) => {
              const statusColor = getStatusColor(expense.status);
              return (
                <TableRow key={expense.id}>
                  <TableCell>{expense.id}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>{expense.price}</TableCell>
                  <TableCell>
                    <Chip
                      label={expense.status}
                      size="small"
                      color={statusColor.color as any}
                      sx={{
                        bgcolor: statusColor.bgcolor,
                        fontSize: '0.75rem',
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>

      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 3 }}>
        <Button variant="text" color="inherit" size="small">
          Top 7 days
        </Button>
        <Button variant="text" color="inherit" size="small">
          Top 30 days
        </Button>
        <Button variant="text" color="inherit" size="small">
          All times
        </Button>
      </Stack>
    </Card>
  );
} 