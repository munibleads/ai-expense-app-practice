import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import { ReceiptData } from '@/app/services/bedrockService';
import { VAT_RATE, CURRENCY, ERROR_MESSAGES } from '@/app/constants/expense';

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

// Styled table cell for header rows
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&.header': {
    backgroundColor: theme.palette.background.default,
    fontWeight: 600,
    color: theme.palette.text.secondary,
  },
}));

// Styled text field for numbers
const NumberTextField = styled(TextField)({
  '& input': {
    textAlign: 'right',
  },
});

// Add a styled TableContainer for horizontal scrolling
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  overflowX: 'auto',
  '& .MuiTable-root': {
    minWidth: '1200px', // Minimum width to prevent squishing
  },
  '&::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.background.paper,
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.grey[300],
    borderRadius: '4px',
    '&:hover': {
      background: theme.palette.grey[400],
    },
  },
}));

interface ExpenseLineItemsProps {
  lineItems: ReceiptData['lineItems'];
  onUpdateLineItem: (index: number, field: keyof ReceiptData['lineItems'][0], value: string | number) => void;
  onAddLineItem: () => void;
  onRemoveLineItem: (index: number) => void;
  isLoading?: boolean;
}

// Column width configurations
const COLUMN_WIDTHS = {
  description: '300px', // Fixed width for description
  quantity: '100px',    // Fixed width for quantity
  unitPrice: '150px',   // Fixed width for unit price
  amount: '150px',      // Fixed width for net amount
  vat: '150px',         // Fixed width for VAT
  total: '150px',       // Fixed width for total
  actions: '80px'       // Fixed width for actions
} as const;

const ExpenseLineItems: React.FC<ExpenseLineItemsProps> = ({
  lineItems = [],
  onUpdateLineItem,
  onAddLineItem,
  onRemoveLineItem,
  isLoading = false
}) => {
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleChange = (index: number, field: keyof ReceiptData['lineItems'][0]) => 
    (event: React.ChangeEvent<HTMLInputElement>) => {
      let value: string | number = event.target.value;
      
      if (field === 'quantity') {
        value = Math.max(0, parseInt(value) || 0);
      } else if (field === 'unitPrice') {
        value = Math.max(0, parseFloat(value) || 0);
      }
      
      onUpdateLineItem(index, field, value);
      
      // Recalculate amount when quantity or unit price changes
      if (['quantity', 'unitPrice'].includes(field)) {
        const item = lineItems[index];
        const newQuantity = field === 'quantity' ? (value as number) : item.quantity;
        const newUnitPrice = field === 'unitPrice' ? (value as number) : item.unitPrice;
        
        // Calculate net amount
        const newAmount = Number((newQuantity * newUnitPrice).toFixed(2));
        onUpdateLineItem(index, 'amount', newAmount);
      }
    };

  const calculateSubtotal = useMemo(() => {
    return Number(lineItems.reduce((sum, item) => sum + item.amount, 0).toFixed(2));
  }, [lineItems]);

  const calculateVat = useMemo(() => {
    return Number((calculateSubtotal * VAT_RATE).toFixed(2));
  }, [calculateSubtotal]);

  const calculateTotal = useMemo(() => {
    return formatCurrency(calculateSubtotal + calculateVat);
  }, [calculateSubtotal, calculateVat]);

  const calculateLineItemVat = (amount: number): number => {
    return Number((amount * VAT_RATE).toFixed(2));
  };
  
  const calculateLineItemTotal = (amount: number): number => {
    return Number((amount * (1 + VAT_RATE)).toFixed(2));
  };

  return (
    <StyledCard>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Line Items
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Itemized list of expenses with discounts and tax calculations
            </Typography>
          </Box>
          <Button
            startIcon={<AddIcon />}
            onClick={onAddLineItem}
            disabled={isLoading}
            variant="text"
            color="primary"
            aria-label="Add new line item"
          >
            Add Item
          </Button>
        </Box>

        <StyledTableContainer>
          <Table aria-label="Expense line items table" size="small">
            <TableHead>
              <TableRow>
                <StyledTableCell width={COLUMN_WIDTHS.description}>Description</StyledTableCell>
                <StyledTableCell width={COLUMN_WIDTHS.quantity} align="right">Quantity</StyledTableCell>
                <StyledTableCell width={COLUMN_WIDTHS.unitPrice} align="right">Unit Price</StyledTableCell>
                <StyledTableCell width={COLUMN_WIDTHS.amount} align="right">Net Amount</StyledTableCell>
                <StyledTableCell width={COLUMN_WIDTHS.vat} align="right">VAT {VAT_RATE * 100}%</StyledTableCell>
                <StyledTableCell width={COLUMN_WIDTHS.total} align="right">Total</StyledTableCell>
                <StyledTableCell width={COLUMN_WIDTHS.actions} align="center">Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lineItems.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell width={COLUMN_WIDTHS.description}>
                    <TextField
                      fullWidth
                      multiline
                      maxRows={3}
                      size="small"
                      value={item.description}
                      onChange={handleChange(index, 'description')}
                      disabled={isLoading}
                      variant="outlined"
                      placeholder="Enter detailed item description"
                      aria-label={`Line item ${index + 1} description`}
                      required
                      error={!item.description}
                      helperText={!item.description ? ERROR_MESSAGES.REQUIRED_FIELD : ''}
                      inputProps={{
                        maxLength: 500,
                        style: { minHeight: '40px' }
                      }}
                    />
                  </TableCell>
                  <TableCell width={COLUMN_WIDTHS.quantity} align="right">
                    <NumberTextField
                      size="small"
                      type="number"
                      value={item.quantity}
                      onChange={handleChange(index, 'quantity')}
                      disabled={isLoading}
                      variant="outlined"
                      inputProps={{ 
                        min: 0,
                        step: 1,
                        'aria-label': `Line item ${index + 1} quantity`
                      }}
                      sx={{ width: '90%' }}
                      error={item.quantity <= 0}
                      helperText={item.quantity <= 0 ? ERROR_MESSAGES.INVALID_AMOUNT : ''}
                    />
                  </TableCell>
                  <TableCell width={COLUMN_WIDTHS.unitPrice} align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <Typography sx={{ mr: 1, whiteSpace: 'nowrap' }}>{CURRENCY}</Typography>
                      <NumberTextField
                        size="small"
                        type="number"
                        value={item.unitPrice}
                        onChange={handleChange(index, 'unitPrice')}
                        disabled={isLoading}
                        variant="outlined"
                        inputProps={{ 
                          min: 0,
                          step: 0.01,
                          'aria-label': `Line item ${index + 1} unit price`
                        }}
                        sx={{ width: '90%' }}
                        error={item.unitPrice <= 0}
                        helperText={item.unitPrice <= 0 ? ERROR_MESSAGES.INVALID_AMOUNT : ''}
                      />
                    </Box>
                  </TableCell>
                  <TableCell width={COLUMN_WIDTHS.amount} align="right">
                    <Typography sx={{ whiteSpace: 'nowrap' }}>
                      {CURRENCY} {formatCurrency(item.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell width={COLUMN_WIDTHS.vat} align="right">
                    <Typography sx={{ whiteSpace: 'nowrap' }}>
                      {CURRENCY} {formatCurrency(calculateLineItemVat(item.amount))}
                    </Typography>
                  </TableCell>
                  <TableCell width={COLUMN_WIDTHS.total} align="right">
                    <Typography sx={{ whiteSpace: 'nowrap' }}>
                      {CURRENCY} {formatCurrency(calculateLineItemTotal(item.amount))}
                    </Typography>
                  </TableCell>
                  <TableCell width={COLUMN_WIDTHS.actions} align="center">
                    <IconButton
                      onClick={() => onRemoveLineItem(index)}
                      disabled={isLoading}
                      color="error"
                      size="small"
                      aria-label={`Remove line item ${index + 1}`}
                      sx={{ 
                        '&:hover': {
                          backgroundColor: 'error.light',
                          '& .MuiSvgIcon-root': {
                            color: 'white'
                          }
                        }
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {lineItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="text.secondary">
                      No items added yet
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {lineItems.length > 0 && (
                <>
                  <TableRow>
                    <TableCell colSpan={3} align="right">
                      <Typography fontWeight="medium" sx={{ whiteSpace: 'nowrap' }}>Subtotal:</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold" sx={{ whiteSpace: 'nowrap' }}>
                        {CURRENCY} {formatCurrency(calculateSubtotal)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold" sx={{ whiteSpace: 'nowrap' }}>
                        {CURRENCY} {formatCurrency(calculateVat)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold" sx={{ whiteSpace: 'nowrap' }}>
                        {CURRENCY} {calculateTotal}
                      </Typography>
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </StyledTableContainer>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            VAT Amount ({VAT_RATE * 100}%):
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
            {CURRENCY} {formatCurrency(calculateVat)}
          </Typography>
        </Box>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            Total Amount:
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
            {CURRENCY} {calculateTotal}
          </Typography>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default ExpenseLineItems; 