'use client';

import React, { useEffect, useState, useMemo, useCallback, memo, Suspense, useContext } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Container,
  Chip,
  IconButton,
  tableCellClasses,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  Grid,
  TableSortLabel,
  InputAdornment,
  Paper,
  TablePagination,
  Skeleton,
  Collapse
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ExpenseService, ExpenseFilters } from '@/app/services/expenseService';
import { SavedReceipt } from '@/app/services/receiptService';
import { formatCurrency, SORT_DIRECTIONS, type SortConfig } from '@/app/constants/expense';
import CloseIcon from '@mui/icons-material/Close';
import { SidebarContext } from '@/app/contexts/SidebarContext';

// Dynamically import heavy components
const ReceiptDetailsPanel = dynamic(() => import('@/app/components/expense/ReceiptDetailsPanel'), {
  loading: () => <ReceiptDetailsSkeleton />,
  ssr: false
});

const ReceiptDetails = dynamic(() => import('@/app/components/expense/ReceiptDetails'), {
  loading: () => <ReceiptDetailsSkeleton />,
  ssr: false
});

const ExpenseLineItems = dynamic(() => import('@/app/components/expense/ExpenseLineItems'), {
  loading: () => (
    <StyledCard>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Skeleton width={200} height={32} />
          <Skeleton width={120} height={36} />
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {[...Array(5)].map((_, index) => (
                  <StyledTableCell key={index}>
                    <Skeleton width={100} />
                  </StyledTableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(3)].map((_, index) => (
                <TableRow key={index}>
                  {[...Array(5)].map((_, cellIndex) => (
                    <StyledTableCell key={cellIndex}>
                      <Skeleton width={cellIndex === 0 ? 200 : 100} />
                    </StyledTableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </StyledCard>
  ),
  ssr: false
});

// Memoized components
const TableRowSkeleton = memo(() => (
  <StyledTableRow>
    <StyledTableCell><Skeleton width={80} /></StyledTableCell>
    <StyledTableCell><Skeleton width={120} /></StyledTableCell>
    <StyledTableCell><Skeleton width={150} /></StyledTableCell>
    <StyledTableCell align="right"><Skeleton width={100} /></StyledTableCell>
    <StyledTableCell align="right"><Skeleton width={80} /></StyledTableCell>
    <StyledTableCell align="right"><Skeleton width={100} /></StyledTableCell>
    <StyledTableCell><Skeleton width={80} height={24} /></StyledTableCell>
    <StyledTableCell align="right"><Skeleton width={40} /></StyledTableCell>
  </StyledTableRow>
));

TableRowSkeleton.displayName = 'TableRowSkeleton';

const LoadingSkeleton = memo(() => (
  <StyledCard>
    {/* Header Skeleton */}
    <Box sx={{ px: 3, pt: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Skeleton width={200} height={40} sx={{ mb: 1 }} />
          <Skeleton width={300} height={24} />
        </Box>
        <Skeleton width={120} height={36} />
      </Box>
    </Box>

    {/* Search Bar Skeleton */}
    <Box sx={{ px: 3, mb: 3 }}>
      <Skeleton width={400} height={40} />
    </Box>

    {/* Table Skeleton */}
    <Box sx={{ px: 3 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {[...Array(8)].map((_, index) => (
                <StyledTableCell key={index}>
                  <Skeleton width={index === 0 ? 80 : 120} />
                </StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRowSkeleton key={index} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ py: 2 }}>
        <Skeleton width={400} height={40} />
      </Box>
    </Box>
  </StyledCard>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

const ReceiptDetailsSkeleton = memo(() => (
  <StyledCard>
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Skeleton width={200} height={32} />
        <Skeleton width={100} height={32} />
      </Box>
      <Grid container spacing={2}>
        {[...Array(6)].map((_, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Skeleton width="100%" height={60} />
          </Grid>
        ))}
      </Grid>
    </Box>
  </StyledCard>
));

ReceiptDetailsSkeleton.displayName = 'ReceiptDetailsSkeleton';

// Memoized styled components
const StyledCard = memo(styled(Card)(({ theme }) => ({
  height: '100%',
  padding: 0,
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
  overflow: 'hidden',
})));

const StyledTableCell = memo(styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.secondary,
    fontWeight: 600,
    fontSize: '0.875rem',
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    whiteSpace: 'nowrap',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: '0.875rem',
    padding: theme.spacing(2),
    color: theme.palette.text.primary,
  },
})));

const StyledTableRow = memo(styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '& td': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  '&.selected': {
    backgroundColor: theme.palette.action.selected,
    '&:hover': {
      backgroundColor: theme.palette.action.selected,
    },
  },
})));

const StyledTableContainer = memo(styled(TableContainer)(({ theme }) => ({
  '&::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.background.paper,
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.grey[200],
    borderRadius: '4px',
    border: `2px solid ${theme.palette.background.paper}`,
    '&:hover': {
      background: theme.palette.grey[300],
    },
  },
})));

const StatusChip = memo(styled(Chip)(({ theme }) => ({
  borderRadius: theme.spacing(0.75),
  fontWeight: 500,
  fontSize: '0.75rem',
  height: 24,
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
})));

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  discount: number;
}

// Memoized table header component
const TableHeader = memo(({ sortConfig, onSort }: { 
  sortConfig: SortConfig; 
  onSort: (field: string) => void;
}) => (
  <TableHead>
    <TableRow>
      <StyledTableCell>
        <TableSortLabel
          active={sortConfig.field === 'date'}
          direction={sortConfig.field === 'date' ? sortConfig.direction : 'asc'}
          onClick={() => onSort('date')}
        >
          Date
        </TableSortLabel>
      </StyledTableCell>
      <StyledTableCell>
        <TableSortLabel
          active={sortConfig.field === 'invoiceId'}
          direction={sortConfig.field === 'invoiceId' ? sortConfig.direction : 'asc'}
          onClick={() => onSort('invoiceId')}
        >
          Invoice/Receipt #
        </TableSortLabel>
      </StyledTableCell>
      <StyledTableCell>
        <TableSortLabel
          active={sortConfig.field === 'vendorName'}
          direction={sortConfig.field === 'vendorName' ? sortConfig.direction : 'asc'}
          onClick={() => onSort('vendorName')}
        >
          Vendor
        </TableSortLabel>
      </StyledTableCell>
      <StyledTableCell align="right">
        <TableSortLabel
          active={sortConfig.field === 'subtotal'}
          direction={sortConfig.field === 'subtotal' ? sortConfig.direction : 'asc'}
          onClick={() => onSort('subtotal')}
        >
          Amount
        </TableSortLabel>
      </StyledTableCell>
      <StyledTableCell align="right">
        <TableSortLabel
          active={sortConfig.field === 'taxAmount'}
          direction={sortConfig.field === 'taxAmount' ? sortConfig.direction : 'asc'}
          onClick={() => onSort('taxAmount')}
        >
          VAT
        </TableSortLabel>
      </StyledTableCell>
      <StyledTableCell align="right">
        <TableSortLabel
          active={sortConfig.field === 'total'}
          direction={sortConfig.field === 'total' ? sortConfig.direction : 'asc'}
          onClick={() => onSort('total')}
        >
          Total
        </TableSortLabel>
      </StyledTableCell>
      <StyledTableCell>Status</StyledTableCell>
      <StyledTableCell align="right">Actions</StyledTableCell>
    </TableRow>
  </TableHead>
));

TableHeader.displayName = 'TableHeader';

// Memoized expense row component
const ExpenseRow = memo(({ 
  expense, 
  selected, 
  onRowClick, 
  onStatusChange, 
  onMenuClick,
  getStatusChipProps 
}: {
  expense: SavedReceipt;
  selected: boolean;
  onRowClick: (receipt: SavedReceipt) => void;
  onStatusChange: (id: string, status: string) => void;
  onMenuClick: (event: React.MouseEvent<HTMLElement>, expense: SavedReceipt) => void;
  getStatusChipProps: (status: string | undefined) => any;
}) => (
  <StyledTableRow 
    onClick={() => onRowClick(expense)}
    className={selected ? 'selected' : ''}
    sx={{ cursor: 'pointer' }}
  >
    <StyledTableCell>
      <Typography variant="body2">
        {new Date(expense.date).toLocaleDateString()}
      </Typography>
    </StyledTableCell>
    <StyledTableCell>
      <Typography variant="body2">
        {expense.invoiceId}
      </Typography>
    </StyledTableCell>
    <StyledTableCell>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {expense.vendorName}
      </Typography>
    </StyledTableCell>
    <StyledTableCell align="right">
      <Typography variant="body2">
        {formatCurrency(expense.subtotal)}
      </Typography>
    </StyledTableCell>
    <StyledTableCell align="right">
      <Typography variant="body2">
        {formatCurrency(expense.taxAmount)}
      </Typography>
    </StyledTableCell>
    <StyledTableCell align="right">
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {formatCurrency(expense.total)}
      </Typography>
    </StyledTableCell>
    <StyledTableCell>
      <StatusChip 
        {...getStatusChipProps(expense.status)}
        onClick={(e) => {
          e.stopPropagation();
          const newStatus = expense.status === 'Pending' ? 'Approved' : 'Pending';
          onStatusChange(expense.id, newStatus);
        }}
      />
    </StyledTableCell>
    <StyledTableCell align="right">
      <IconButton 
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onMenuClick(e, expense);
        }}
        sx={{ 
          opacity: 0.7,
          transition: 'opacity 0.2s ease',
          '&:hover': {
            opacity: 1,
          }
        }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
    </StyledTableCell>
  </StyledTableRow>
));

ExpenseRow.displayName = 'ExpenseRow';

function ExpensesPage() {
  const router = useRouter();
  const { setIsCollapsed } = useContext(SidebarContext);
  const [showFilters, setShowFilters] = useState(false);
  
  const expenseService = useMemo(() => new ExpenseService(), []);
  
  const [tableState, setTableState] = useState({
    expenses: [] as SavedReceipt[],
    loading: true,
    page: 0,
    rowsPerPage: 10,
    total: 0
  });

  const [filterState, setFilterState] = useState({
    filters: {
      startDate: '',
      endDate: '',
      status: '',
      invoiceId: '',
      minAmount: undefined,
      maxAmount: undefined
    } as ExpenseFilters,
    searchQuery: '',
    sortConfig: {
      field: 'date',
      direction: SORT_DIRECTIONS.DESC,
    } as SortConfig,
    debouncedSearch: ''
  });

  const [uiState, setUiState] = useState({
    error: null as string | null,
    successMessage: null as string | null,
    selectedExpense: null as SavedReceipt | null,
    selectedReceipt: null as SavedReceipt | null,
    editingReceipt: null as SavedReceipt | null,
    anchorEl: null as HTMLElement | null,
    deleteDialogOpen: false
  });

  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilterState(prev => ({ ...prev, debouncedSearch: prev.searchQuery }));
    }, 500);
    return () => clearTimeout(timer);
  }, [filterState.searchQuery]);

  const fetchExpenses = useCallback(async () => {
    try {
      setTableState(prev => ({ ...prev, loading: true }));
      
      const response = await expenseService.getAllExpenses({
        ...filterState.filters,
        page: tableState.page,
        limit: tableState.rowsPerPage,
        vendor: filterState.debouncedSearch || undefined,
        sortField: filterState.sortConfig.field,
        sortDirection: filterState.sortConfig.direction
      });

      setTableState(prev => ({ 
        ...prev, 
        expenses: response.data,
        total: response.total,
        loading: false 
      }));
      setUiState(prev => ({ ...prev, error: null }));
    } catch (err) {
      console.error('Error in fetchExpenses:', err);
      setUiState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch expenses. Please try again.' 
      }));
      setTableState(prev => ({ ...prev, loading: false }));
    }
  }, [expenseService, filterState.filters, filterState.debouncedSearch, filterState.sortConfig, tableState.page, tableState.rowsPerPage]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleMenuClick = useCallback((event: React.MouseEvent<HTMLElement>, expense: SavedReceipt) => {
    setUiState(prev => ({
      ...prev,
      anchorEl: event.currentTarget,
      selectedExpense: expense
    }));
  }, []);

  const handleMenuClose = useCallback(() => {
    setUiState(prev => ({ ...prev, anchorEl: null }));
  }, []);

  const handleDeleteClick = useCallback(() => {
    handleMenuClose();
    setUiState(prev => ({ ...prev, deleteDialogOpen: true }));
  }, [handleMenuClose]);

  const handleDeleteConfirm = useCallback(async () => {
    const { selectedExpense } = uiState;
    if (!selectedExpense) return;

    try {
      await expenseService.deleteExpense(selectedExpense.id);
      setUiState(prev => ({ 
        ...prev,
        successMessage: 'Expense deleted successfully',
        deleteDialogOpen: false,
        selectedExpense: null
      }));
      fetchExpenses();
    } catch (err) {
      setUiState(prev => ({
        ...prev,
        error: 'Failed to delete expense. Please try again.',
        deleteDialogOpen: false,
        selectedExpense: null
      }));
    }
  }, [expenseService, fetchExpenses, uiState.selectedExpense]);

  const handleStatusChange = useCallback(async (id: string, newStatus: string) => {
    try {
      await expenseService.updateExpenseStatus(id, newStatus);
      setUiState(prev => ({ ...prev, successMessage: 'Status updated successfully' }));
      fetchExpenses();
    } catch (err) {
      setUiState(prev => ({ 
        ...prev, 
        error: 'Failed to update status. Please try again.' 
      }));
    }
  }, [expenseService, fetchExpenses]);

  const handleSort = useCallback((field: string) => {
    setFilterState(prev => ({
      ...prev,
      sortConfig: {
        field,
        direction: prev.sortConfig.field === field && prev.sortConfig.direction === SORT_DIRECTIONS.ASC
          ? SORT_DIRECTIONS.DESC
          : SORT_DIRECTIONS.ASC,
      }
    }));
    setTableState(prev => ({ ...prev, page: 0 }));
  }, []);

  const getStatusChipProps = useCallback((status: string | undefined) => {
    const currentStatus = (status || 'Pending').toLowerCase();
    
    switch (currentStatus) {
      case 'approved':
        return {
          color: 'success' as const,
          label: 'Approved',
          variant: 'outlined' as const,
        };
      case 'pending':
        return {
          color: 'warning' as const,
          label: 'Pending',
          variant: 'outlined' as const,
        };
      case 'rejected':
        return {
          color: 'error' as const,
          label: 'Rejected',
          variant: 'outlined' as const,
        };
      default:
        return {
          color: 'default' as const,
          label: status || 'Pending',
          variant: 'outlined' as const,
        };
    }
  }, []);

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setTableState(prev => ({ ...prev, page: newPage }));
  }, []);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setTableState(prev => ({ 
      ...prev,
      rowsPerPage: newRowsPerPage,
      page: 0
    }));
  }, []);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterState(prev => ({ 
      ...prev, 
      searchQuery: event.target.value 
    }));
    setTableState(prev => ({ ...prev, page: 0 }));
  }, []);

  useEffect(() => {
    if (uiState.selectedReceipt) {
      setIsCollapsed(true);
    }
  }, [uiState.selectedReceipt, setIsCollapsed]);

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={uiState.selectedReceipt ? 8 : 12}>
            <StyledCard>
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4">
                  Expenses
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button 
                    variant="text" 
                    onClick={toggleFilters} 
                    sx={{ 
                      color: 'green', 
                      textTransform: 'none',
                      fontWeight: 'medium',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 128, 0, 0.04)'
                      }
                    }}
                  >
                    Search
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => router.push('/expenses/record')}
                  >
                    Add Expense
                  </Button>
                </Box>
              </Box>

              <Collapse in={showFilters}>
                <Box sx={{ mt: 2, p: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Search & Filter
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        placeholder="Search by vendor name..."
                        value={filterState.searchQuery}
                        onChange={handleSearchChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        placeholder="Invoice/Receipt #"
                        value={filterState.filters.invoiceId || ''}
                        onChange={(e) => {
                          setFilterState(prev => ({
                            ...prev,
                            filters: {
                              ...prev.filters,
                              invoiceId: e.target.value
                            }
                          }));
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        select
                        fullWidth
                        label="Status"
                        value={filterState.filters.status || ''}
                        onChange={(e) => {
                          setFilterState(prev => ({
                            ...prev,
                            filters: {
                              ...prev.filters,
                              status: e.target.value
                            }
                          }));
                        }}
                      >
                        <MenuItem value="">All Statuses</MenuItem>
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Approved">Approved</MenuItem>
                        <MenuItem value="Rejected">Rejected</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="From Date"
                        type="date"
                        value={filterState.filters.startDate || ''}
                        onChange={(e) => {
                          setFilterState(prev => ({
                            ...prev,
                            filters: {
                              ...prev.filters,
                              startDate: e.target.value
                            }
                          }));
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="To Date"
                        type="date"
                        value={filterState.filters.endDate || ''}
                        onChange={(e) => {
                          setFilterState(prev => ({
                            ...prev,
                            filters: {
                              ...prev.filters,
                              endDate: e.target.value
                            }
                          }));
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                          fullWidth
                          label="Min Amount"
                          type="number"
                          value={filterState.filters.minAmount || ''}
                          onChange={(e) => {
                            setFilterState(prev => ({
                              ...prev,
                              filters: {
                                ...prev.filters,
                                minAmount: e.target.value ? parseFloat(e.target.value) : undefined
                              }
                            }));
                          }}
                        />
                        <TextField
                          fullWidth
                          label="Max Amount"
                          type="number"
                          value={filterState.filters.maxAmount || ''}
                          onChange={(e) => {
                            setFilterState(prev => ({
                              ...prev,
                              filters: {
                                ...prev.filters,
                                maxAmount: e.target.value ? parseFloat(e.target.value) : undefined
                              }
                            }));
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button 
                          variant="outlined"
                          onClick={() => {
                            setFilterState(prev => ({
                              ...prev,
                              searchQuery: '',
                              filters: {},
                              debouncedSearch: ''
                            }));
                          }}
                        >
                          Clear Filters
                        </Button>
                        <Button 
                          variant="contained"
                          onClick={() => {
                            setFilterState(prev => ({
                              ...prev,
                              debouncedSearch: prev.searchQuery
                            }));
                            setTableState(prev => ({ ...prev, page: 0 }));
                          }}
                        >
                          Apply Filters
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Collapse>

              <Box sx={{ px: 3 }}>
                <StyledTableContainer>
                  <Table>
                    <TableHeader 
                      sortConfig={filterState.sortConfig}
                      onSort={handleSort}
                    />
                    <TableBody>
                      {tableState.loading ? (
                        [...Array(tableState.rowsPerPage)].map((_, index) => (
                          <TableRowSkeleton key={index} />
                        ))
                      ) : (
                        tableState.expenses.map((expense) => (
                          <ExpenseRow
                            key={expense.id}
                            expense={expense}
                            selected={uiState.selectedReceipt?.id === expense.id}
                            onRowClick={(receipt) => setUiState(prev => ({ 
                              ...prev, 
                              selectedReceipt: receipt 
                            }))}
                            onStatusChange={handleStatusChange}
                            onMenuClick={handleMenuClick}
                            getStatusChipProps={getStatusChipProps}
                          />
                        ))
                      )}
                    </TableBody>
                  </Table>
                </StyledTableContainer>

                <TablePagination
                  component="div"
                  count={tableState.total}
                  page={tableState.page}
                  onPageChange={handleChangePage}
                  rowsPerPage={tableState.rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                />
              </Box>
            </StyledCard>
          </Grid>

          {uiState.selectedReceipt && (
            <Grid item xs={12} md={4}>
              <Box sx={{ position: 'sticky', top: 24 }}>
                <Suspense fallback={<LoadingSkeleton />}>
                  <ReceiptDetailsPanel
                    receipt={uiState.selectedReceipt}
                    onClose={() => {
                      setUiState(prev => ({ 
                        ...prev, 
                        selectedReceipt: null 
                      }));
                      setIsCollapsed(false);
                    }}
                    onEdit={() => setUiState(prev => ({ 
                      ...prev, 
                      editingReceipt: prev.selectedReceipt 
                    }))}
                  />
                </Suspense>
              </Box>
            </Grid>
          )}
        </Grid>

        <Snackbar
          open={!!uiState.error || !!uiState.successMessage}
          autoHideDuration={6000}
          onClose={() => setUiState(prev => ({ 
            ...prev, 
            error: null, 
            successMessage: null 
          }))}
        >
          <Alert
            severity={uiState.error ? "error" : "success"}
            onClose={() => setUiState(prev => ({ 
              ...prev, 
              error: null, 
              successMessage: null 
            }))}
          >
            {uiState.error || uiState.successMessage}
          </Alert>
        </Snackbar>

        <Menu
          anchorEl={uiState.anchorEl}
          open={Boolean(uiState.anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            handleMenuClose();
            if (uiState.selectedExpense) {
              router.push(`/expenses/${uiState.selectedExpense.id}`);
            }
          }}>
            View Details
          </MenuItem>
          <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
            Delete
          </MenuItem>
        </Menu>

        <Dialog
          open={uiState.deleteDialogOpen}
          onClose={() => setUiState(prev => ({ ...prev, deleteDialogOpen: false }))}
        >
          <DialogTitle>Delete Expense</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this expense? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUiState(prev => ({ 
              ...prev, 
              deleteDialogOpen: false 
            }))}>
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={!!uiState.editingReceipt}
          onClose={() => setUiState(prev => ({ ...prev, editingReceipt: null }))}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Edit Receipt</Typography>
              <IconButton
                onClick={() => setUiState(prev => ({ ...prev, editingReceipt: null }))}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {uiState.editingReceipt && (
              <Box sx={{ py: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Suspense fallback={<LoadingSkeleton />}>
                      <ReceiptDetails
                        receiptData={uiState.editingReceipt}
                        onUpdate={(field, value) => {
                          setUiState(prev => ({
                            ...prev,
                            editingReceipt: prev.editingReceipt ? {
                              ...prev.editingReceipt,
                              [field]: value
                            } : null
                          }));
                        }}
                      />
                    </Suspense>
                  </Grid>
                  <Grid item xs={12}>
                    <Suspense fallback={<LoadingSkeleton />}>
                      <ExpenseLineItems
                        lineItems={uiState.editingReceipt.lineItems}
                        onUpdateLineItem={(index, field, value) => {
                          setUiState(prev => {
                            if (!prev.editingReceipt) return prev;
                            const newLineItems = [...prev.editingReceipt.lineItems];
                            newLineItems[index] = {
                              ...newLineItems[index],
                              [field]: value
                            };
                            return {
                              ...prev,
                              editingReceipt: {
                                ...prev.editingReceipt,
                                lineItems: newLineItems
                              }
                            };
                          });
                        }}
                        onAddLineItem={() => {
                          setUiState(prev => {
                            if (!prev.editingReceipt) return prev;
                            const newLineItem: LineItem = {
                              id: `item-${Date.now()}`,
                              description: '',
                              quantity: 1,
                              unitPrice: 0,
                              amount: 0,
                              discount: 0
                            };
                            return {
                              ...prev,
                              editingReceipt: {
                                ...prev.editingReceipt,
                                lineItems: [...prev.editingReceipt.lineItems, newLineItem]
                              }
                            };
                          });
                        }}
                        onRemoveLineItem={(index) => {
                          setUiState(prev => {
                            if (!prev.editingReceipt) return prev;
                            const newLineItems = prev.editingReceipt.lineItems.filter((_, i) => i !== index);
                            return {
                              ...prev,
                              editingReceipt: {
                                ...prev.editingReceipt,
                                lineItems: newLineItems
                              }
                            };
                          });
                        }}
                      />
                    </Suspense>
                  </Grid>
                </Grid>
                <Box sx={{ 
                  mt: 3, 
                  display: 'flex', 
                  justifyContent: 'flex-end',
                  gap: 2 
                }}>
                  <Button
                    onClick={() => setUiState(prev => ({ 
                      ...prev, 
                      editingReceipt: null 
                    }))}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      if (uiState.editingReceipt) {
                        handleStatusChange(
                          uiState.editingReceipt.id,
                          uiState.editingReceipt.status
                        );
                        setUiState(prev => ({ ...prev, editingReceipt: null }));
                      }
                    }}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </Container>
  );
}

export default memo(ExpensesPage); 