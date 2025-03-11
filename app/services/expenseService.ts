import { SavedReceipt } from './receiptService';
import { ConfigService } from './configService';

export interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  vendor?: string;
  invoiceId?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
  sortField?: string;
  sortDirection?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export class ExpenseService {
  private apiEndpoint: string;
  private configService: ConfigService;

  constructor() {
    this.configService = ConfigService.getInstance();
    const config = this.configService.getApiConfig();
    this.apiEndpoint = config.endpoint;
  }

  async getAllExpenses(filters?: ExpenseFilters): Promise<PaginatedResponse<SavedReceipt>> {
    try {
      let url = `${this.apiEndpoint}/receipts`;
      
      // Add query parameters for filters
      if (filters) {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.status) params.append('status', filters.status);
        if (filters.vendor) params.append('vendor', filters.vendor);
        if (filters.invoiceId) params.append('invoiceId', filters.invoiceId);
        if (filters.minAmount !== undefined) params.append('minAmount', filters.minAmount.toString());
        if (filters.maxAmount !== undefined) params.append('maxAmount', filters.maxAmount.toString());
        if (filters.page !== undefined) params.append('page', filters.page.toString());
        if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
        if (filters.sortField) params.append('sortField', filters.sortField);
        if (filters.sortDirection) params.append('sortDirection', filters.sortDirection);
        url += `?${params.toString()}`;
      }

      console.log('Fetching expenses from:', url);
      const response = await fetch(url);
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch expenses');
      }

      const result = await response.json();
      return {
        data: result.data || result,
        total: result.total || result.length,
        page: filters?.page || 0,
        limit: filters?.limit || 10
      };
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw new Error('Failed to fetch expenses. Please try again later.');
    }
  }

  async updateExpenseStatus(id: string, status: string): Promise<SavedReceipt> {
    try {
      const response = await fetch(`${this.apiEndpoint}/receipts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update expense status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating expense status:', error);
      throw new Error('Failed to update expense status. Please try again later.');
    }
  }

  async deleteExpense(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiEndpoint}/receipts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw new Error('Failed to delete expense. Please try again later.');
    }
  }
} 