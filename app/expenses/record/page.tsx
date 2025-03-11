'use client';

import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import ExpenseForm from '@/app/components/ExpenseForm';

export default function RecordExpensePage() {
  const router = useRouter();

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Back button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ mb: 3 }}
        >
          Back
        </Button>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            fontWeight="bold"
            sx={{ mb: 1, color: 'text.primary' }}
          >
            Record Expense
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
          >
            Upload a receipt or enter expense details manually
          </Typography>
        </Box>

        {/* Expense Form */}
        <ExpenseForm />
      </Box>
    </Container>
  );
} 