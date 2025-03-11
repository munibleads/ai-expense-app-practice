import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { ReceiptData } from '@/app/services/bedrockService';
import { CURRENCY, ERROR_MESSAGES } from '@/app/constants/expense';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: theme.shadows[2],
  },
}));

interface ReceiptDetailsProps {
  receiptData: Partial<ReceiptData>;
  onUpdate: (field: keyof ReceiptData, value: string) => void;
  isLoading?: boolean;
}

const ReceiptDetails: React.FC<ReceiptDetailsProps> = ({ 
  receiptData,
  onUpdate,
  isLoading = false
}) => {
  // Track which fields have been touched
  const [touchedFields, setTouchedFields] = useState<Set<keyof ReceiptData>>(new Set());

  const handleChange = (field: keyof ReceiptData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    
    // Mark field as touched
    setTouchedFields(prev => new Set(prev).add(field));
    onUpdate(field, value);
  };

  const handleBlur = (field: keyof ReceiptData) => () => {
    setTouchedFields(prev => new Set(prev).add(field));
  };

  const shouldShowError = (field: keyof ReceiptData) => {
    return touchedFields.has(field) && !receiptData[field];
  };

  const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  return (
    <StyledCard>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={3}>
          <Box textAlign="center">
            <ReceiptLongIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Receipt Details
            </Typography>
          </Box>
          
          <TextField
            fullWidth
            label="Invoice/Receipt Number"
            value={receiptData.invoiceId || ''}
            onChange={handleChange('invoiceId')}
            onBlur={handleBlur('invoiceId')}
            variant="outlined"
            disabled={isLoading}
            required
            error={shouldShowError('invoiceId')}
            helperText={shouldShowError('invoiceId') ? ERROR_MESSAGES.REQUIRED_FIELD : ''}
            inputProps={{
              'aria-label': 'Invoice/Receipt Number'
            }}
          />

          <TextField
            fullWidth
            label="Vendor Name"
            value={receiptData.vendorName || ''}
            onChange={handleChange('vendorName')}
            onBlur={handleBlur('vendorName')}
            variant="outlined"
            disabled={isLoading}
            required
            error={shouldShowError('vendorName')}
            helperText={shouldShowError('vendorName') ? ERROR_MESSAGES.REQUIRED_FIELD : ''}
            inputProps={{
              'aria-label': 'Vendor Name'
            }}
          />

          <TextField
            fullWidth
            type="date"
            label="Receipt Date"
            value={formatDateForInput(receiptData.date)}
            onChange={handleChange('date')}
            onBlur={handleBlur('date')}
            variant="outlined"
            disabled={isLoading}
            required
            error={shouldShowError('date')}
            helperText={shouldShowError('date') ? ERROR_MESSAGES.REQUIRED_FIELD : ''}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              'aria-label': 'Receipt Date',
              style: { cursor: 'pointer' }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover:not(.Mui-disabled)': {
                  '& > fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              },
              '& input:not(:disabled)': {
                cursor: 'pointer',
                backgroundColor: 'background.paper',
              },
            }}
          />

          <TextField
            fullWidth
            label="VAT Number"
            value={receiptData.vatNumber || ''}
            onChange={handleChange('vatNumber')}
            variant="outlined"
            disabled={isLoading}
            inputProps={{
              'aria-label': 'VAT Number'
            }}
          />

          <TextField
            fullWidth
            label="CR Number"
            value={receiptData.crNumber || ''}
            onChange={handleChange('crNumber')}
            variant="outlined"
            disabled={isLoading}
            inputProps={{
              'aria-label': 'CR Number'
            }}
          />
        </Stack>
      </CardContent>
    </StyledCard>
  );
};

export default ReceiptDetails; 