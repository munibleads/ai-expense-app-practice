import { ExpenseService } from './expenseService';

export interface DashboardStats {
  totalExpenses: number;
  totalAmount: number;
  pendingExpenses: number;
  approvedExpenses: number;
  monthlyExpenses: {
    month: string;
    amount: number;
  }[];
  topVendors: {
    vendorName: string;
    totalAmount: number;
    expenseCount: number;
  }[];
  expensesByStatus: {
    status: string;
    count: number;
  }[];
  recentExpenses: {
    id: string;
    date: string;
    vendorName: string;
    total: number;
    status: string;
  }[];
}

export class DashboardService {
  private expenseService: ExpenseService;

  constructor() {
    this.expenseService = new ExpenseService();
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const expenses = await this.expenseService.getAllExpenses({});
      
      // Calculate total expenses and amount
      const totalExpenses = expenses.length;
      const totalAmount = expenses.reduce((sum, exp) => sum + Number(exp.total), 0);
      
      // Calculate expenses by status
      const pendingExpenses = expenses.filter(exp => exp.status?.toLowerCase() === 'pending').length;
      const approvedExpenses = expenses.filter(exp => exp.status?.toLowerCase() === 'approved').length;
      
      // Calculate monthly expenses for the last 6 months
      const monthlyExpenses = this.calculateMonthlyExpenses(expenses);
      
      // Get top vendors
      const topVendors = this.calculateTopVendors(expenses);
      
      // Get expenses by status
      const expensesByStatus = this.calculateExpensesByStatus(expenses);
      
      // Get recent expenses
      const recentExpenses = expenses
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .map(exp => ({
          id: exp.id,
          date: exp.date,
          vendorName: exp.vendorName,
          total: Number(exp.total),
          status: exp.status || 'Pending'
        }));

      return {
        totalExpenses,
        totalAmount,
        pendingExpenses,
        approvedExpenses,
        monthlyExpenses,
        topVendors,
        expensesByStatus,
        recentExpenses
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  private calculateMonthlyExpenses(expenses: any[]): { month: string; amount: number }[] {
    const months = new Map<string, number>();
    const now = new Date();
    
    // Initialize last 6 months with 0
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.set(month.toLocaleString('default', { month: 'short' }), 0);
    }
    
    // Calculate expenses for each month
    expenses.forEach(exp => {
      const expDate = new Date(exp.date);
      const monthKey = expDate.toLocaleString('default', { month: 'short' });
      if (months.has(monthKey)) {
        months.set(monthKey, (months.get(monthKey) || 0) + Number(exp.total));
      }
    });
    
    return Array.from(months.entries()).map(([month, amount]) => ({ month, amount }));
  }

  private calculateTopVendors(expenses: any[]): { vendorName: string; totalAmount: number; expenseCount: number }[] {
    const vendors = new Map<string, { totalAmount: number; expenseCount: number }>();
    
    expenses.forEach(exp => {
      if (!exp.vendorName) return;
      
      const current = vendors.get(exp.vendorName) || { totalAmount: 0, expenseCount: 0 };
      vendors.set(exp.vendorName, {
        totalAmount: current.totalAmount + Number(exp.total),
        expenseCount: current.expenseCount + 1
      });
    });
    
    return Array.from(vendors.entries())
      .map(([vendorName, stats]) => ({
        vendorName,
        ...stats
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);
  }

  private calculateExpensesByStatus(expenses: any[]): { status: string; count: number }[] {
    const statusCounts = new Map<string, number>();
    
    expenses.forEach(exp => {
      const status = exp.status || 'Pending';
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
    });
    
    return Array.from(statusCounts.entries()).map(([status, count]) => ({
      status,
      count
    }));
  }
} 