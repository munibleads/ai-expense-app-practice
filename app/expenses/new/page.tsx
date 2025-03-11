'use client';

import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import HierarchicalSelect from '@/app/components/common/HierarchicalSelect';
import { parseAccountData } from '@/app/utils/accountUtils';
import { format } from 'date-fns';

// Import the account data
const expenseAccountData = `Cost Of Goods Sold
Cost of Goods Sold
     • [ 50100 ] Direct Labor
         • [ 50101 ] Field Staff Salaries & Wages
     • [ 50500 ] Equipment Hire
     • [ 50400 ] Material Cost
     • [ 50700 ] Project / Jobs Cost
         • [ 50701 ] Kemya Project
         • [ 50703 ] Ma'aden
         • [ 50702 ] Sinopec / Aramco IPC - Qatif
     • [ 50600 ] Project Consumables
     • [ 50300 ] Services / Subcontractors
     • [ 50200 ] Workers End of Service`;

const paidThroughData = `Bank
[ 10200 ] Bank Accounts
[ 10202 ] MCC Al-Rajhi Account
[ 10201 ] MCC Saudi National Bank
[ 10221 ] STC PAY Merchant
Cash
[ 10100 ] Cash Accounts
     • [ 10101 ] Cash in Hand`;

export default function NewExpensePage() {
  const [date, setDate] = useState<Date | null>(new Date());
  const [vendorName, setVendorName] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [expenseAccountId, setExpenseAccountId] = useState('');
  const [paidThroughAccountId, setPaidThroughAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const expenseAccounts = parseAccountData(expenseAccountData);
  const paidThroughAccounts = parseAccountData(paidThroughData);

  const handleExpenseAccountChange = (value: string) => {
    setExpenseAccountId(value);
  };

  const handlePaidThroughChange = (event: SelectChangeEvent) => {
    setPaidThroughAccountId(event.target.value as string);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !vendorName || !expenseAccountId || !paidThroughAccountId || !amount || !receipt) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('date', format(date, 'yyyy-MM-dd'));
      formData.append('vendorName', vendorName);
      formData.append('vatNumber', vatNumber);
      formData.append('expenseAccountId', expenseAccountId);
      formData.append('paidThroughAccountId', paidThroughAccountId);
      formData.append('amount', amount);
      formData.append('receipt', receipt);

      const response = await fetch('/api/zoho-books/expenses', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create expense');
      }

      setSuccess(true);
      // Reset form
      setDate(new Date());
      setVendorName('');
      setVatNumber('');
      setExpenseAccountId('');
      setPaidThroughAccountId('');
      setAmount('');
      setReceipt(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            New Expense
          </Typography>

          <Card>
            <CardContent>
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <DatePicker
                      label="Receipt Date"
                      value={date}
                      onChange={(newValue: Date | null) => setDate(newValue)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Vendor Name"
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="VAT Number"
                      value={vatNumber}
                      onChange={(e) => setVatNumber(e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Expense Account</InputLabel>
                      <HierarchicalSelect
                        options={expenseAccounts}
                        value={expenseAccountId}
                        onChange={handleExpenseAccountChange}
                        label="Expense Account"
                        placeholder="Select Expense Account"
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Paid Through</InputLabel>
                      <HierarchicalSelect
                        options={paidThroughAccounts}
                        value={paidThroughAccountId}
                        onChange={handlePaidThroughChange}
                        label="Paid Through"
                        placeholder="Select Paid Through Account"
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      InputProps={{
                        inputProps: { min: 0, step: 0.01 },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      sx={{ height: '56px' }}
                    >
                      {receipt ? receipt.name : 'Upload Receipt'}
                      <input
                        type="file"
                        hidden
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setReceipt(file);
                        }}
                      />
                    </Button>
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={loading}
                      size="large"
                    >
                      {loading ? 'Saving...' : 'Save Expense'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>

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

          <Snackbar
            open={success}
            autoHideDuration={6000}
            onClose={() => setSuccess(false)}
          >
            <Alert
              onClose={() => setSuccess(false)}
              severity="success"
              sx={{ width: '100%' }}
            >
              Expense saved successfully
            </Alert>
          </Snackbar>
        </Box>
      </Container>
    </LocalizationProvider>
  );
} 