export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category_id: string | null;
  description: string | null;
  transaction_date: string;
  created_at: string;
  category?: Category;
}

export interface MonthlySummary {
  month: string;
  total_income: number;
  total_expense: number;
  balance: number;
}

export interface CategorySummary {
  category_id: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  total: number;
  percentage: number;
}

export interface Budget {
  id: string;
  category_id: string;
  month: string;
  limit_amount: number;
  created_at: string;
  category?: Category;
}

export interface BudgetStatus {
  category_id: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  limit_amount: number;
  spent_amount: number;
  percentage: number;
}

export interface RecurringTransaction {
  id: string;
  amount: number;
  type: TransactionType;
  category_id: string | null;
  description: string | null;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_date: string;
  is_active: boolean;
  created_at: string;
  category?: Category;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  icon: string;
  color: string;
  is_completed: boolean;
  created_at: string;
}

export interface TotalSavings {
  total_saved: number;
  total_target: number;
  overall_percentage: number;
}
