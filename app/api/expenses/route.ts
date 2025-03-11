import { NextRequest, NextResponse } from 'next/server';
import { SavedReceipt } from '@/app/services/receiptService';
import { getAllReceipts, getReceipt, updateReceipt, deleteReceipt } from '../receipts/db';

// Helper function to filter expenses based on query parameters
function filterExpenses(expenses: SavedReceipt[], filters: any): SavedReceipt[] {
  return expenses.filter(expense => {
    let match = true;
    
    if (filters.startDate) {
      match = match && new Date(expense.date) >= new Date(filters.startDate);
    }
    
    if (filters.endDate) {
      match = match && new Date(expense.date) <= new Date(filters.endDate);
    }
    
    if (filters.status) {
      match = match && expense.status === filters.status;
    }
    
    if (filters.vendor) {
      match = match && expense.vendorName.toLowerCase().includes(filters.vendor.toLowerCase());
    }
    
    if (filters.invoiceId) {
      match = match && expense.invoiceId.toLowerCase().includes(filters.invoiceId.toLowerCase());
    }
    
    if (filters.minAmount !== undefined) {
      const minAmount = parseFloat(filters.minAmount);
      if (!isNaN(minAmount)) {
        const totalValue = typeof expense.total === 'string' ? parseFloat(expense.total) : expense.total;
        match = match && totalValue >= minAmount;
      }
    }
    
    if (filters.maxAmount !== undefined) {
      const maxAmount = parseFloat(filters.maxAmount);
      if (!isNaN(maxAmount)) {
        const totalValue = typeof expense.total === 'string' ? parseFloat(expense.total) : expense.total;
        match = match && totalValue <= maxAmount;
      }
    }
    
    return match;
  });
}

// Helper function to sort expenses
function sortExpenses(expenses: SavedReceipt[], sortField: string, sortDirection: string): SavedReceipt[] {
  return [...expenses].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'invoiceId':
        comparison = a.invoiceId.localeCompare(b.invoiceId);
        break;
      case 'vendorName':
        comparison = a.vendorName.localeCompare(b.vendorName);
        break;
      case 'subtotal': {
        const aValue = typeof a.subtotal === 'string' ? parseFloat(a.subtotal) || 0 : a.subtotal || 0;
        const bValue = typeof b.subtotal === 'string' ? parseFloat(b.subtotal) || 0 : b.subtotal || 0;
        comparison = aValue - bValue;
        break;
      }
      case 'taxAmount': {
        const aValue = typeof a.taxAmount === 'string' ? parseFloat(a.taxAmount) || 0 : a.taxAmount || 0;
        const bValue = typeof b.taxAmount === 'string' ? parseFloat(b.taxAmount) || 0 : b.taxAmount || 0;
        comparison = aValue - bValue;
        break;
      }
      case 'total': {
        const aValue = typeof a.total === 'string' ? parseFloat(a.total) || 0 : a.total || 0;
        const bValue = typeof b.total === 'string' ? parseFloat(b.total) || 0 : b.total || 0;
        comparison = aValue - bValue;
        break;
      }
      default:
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    
    return sortDirection === 'desc' ? -comparison : comparison;
  });
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const filters = {
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      status: searchParams.get('status'),
      vendor: searchParams.get('vendor'),
      invoiceId: searchParams.get('invoiceId'),
      minAmount: searchParams.get('minAmount'),
      maxAmount: searchParams.get('maxAmount'),
    };

    // Get pagination parameters
    const page = parseInt(searchParams.get('page') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    
    // Get sorting parameters
    const sortField = searchParams.get('sortField') || 'date';
    const sortDirection = searchParams.get('sortDirection') || 'desc';

    // Get all receipts
    const allReceipts = await getAllReceipts();
    
    // Apply filters
    const filteredExpenses = filterExpenses(allReceipts, filters);
    
    // Apply sorting
    const sortedExpenses = sortExpenses(filteredExpenses, sortField, sortDirection);
    
    // Apply pagination
    const startIndex = page * limit;
    const endIndex = startIndex + limit;
    const paginatedExpenses = sortedExpenses.slice(startIndex, endIndex);
    
    return NextResponse.json({
      data: paginatedExpenses,
      total: sortedExpenses.length,
      page,
      limit
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, status } = await request.json();
    const receipt = await getReceipt(id);
    
    if (!receipt) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    // Update the receipt with the new status
    const updatedReceipt = await updateReceipt(id, { ...receipt, status });
    return NextResponse.json(updatedReceipt);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    await deleteReceipt(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
} 