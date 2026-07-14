import { unstable_noStore as noStore } from 'next/cache';
import { supabase, isConfigured } from './supabase';
import { mockCategories, mockTransactions } from './mock-data';
import type { Category, Transaction, MonthlySummary, CategorySummary } from './types';

function logError(label: string, error: { message: string } | null) {
  if (error) console.error(`[supabase:${label}] ${error.message}`);
}

// ─── Danh mục ────────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  noStore();
  if (!isConfigured || !supabase) return mockCategories;

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('type', { ascending: false })
    .order('name');

  logError('getCategories', error);
  return (data as Category[]) ?? [];
}

export async function getCategoriesByType(type: 'income' | 'expense'): Promise<Category[]> {
  noStore();
  if (!isConfigured || !supabase) return mockCategories.filter((c) => c.type === type);

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('type', type)
    .order('name');

  logError('getCategoriesByType', error);
  return (data as Category[]) ?? [];
}

// ─── Giao dịch ───────────────────────────────────────────────────────────────

export async function getTransactions(limit = 50): Promise<Transaction[]> {
  noStore();
  if (!isConfigured || !supabase) return mockTransactions.slice(0, limit);

  const { data, error } = await supabase
    .from('transactions')
    .select('*, category:categories(*)')
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  logError('getTransactions', error);
  return (data as Transaction[]) ?? [];
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  noStore();
  if (!isConfigured || !supabase) return mockTransactions.find((t) => t.id === id) ?? null;

  const { data, error } = await supabase
    .from('transactions')
    .select('*, category:categories(*)')
    .eq('id', id)
    .single();

  logError('getTransactionById', error);
  return (data as Transaction) ?? null;
}

// ─── Thống kê ────────────────────────────────────────────────────────────────

export async function getMonthlySummary(year: number): Promise<MonthlySummary[]> {
  noStore();
  if (!isConfigured || !supabase) {
    // Mock summary
    return [
      { month: `${year}-07`, total_income: 17000000, total_expense: 435000, balance: 16565000 },
      { month: `${year}-06`, total_income: 15000000, total_expense: 5200000, balance: 9800000 },
      { month: `${year}-05`, total_income: 15000000, total_expense: 4300000, balance: 10700000 },
    ];
  }

  const { data, error } = await supabase.rpc('get_monthly_summary', { year_param: year });
  logError('getMonthlySummary', error);
  return (data as MonthlySummary[]) ?? [];
}

export async function getCategorySummary(
  type: 'income' | 'expense',
  year: number,
  month: number,
): Promise<CategorySummary[]> {
  noStore();
  if (!isConfigured || !supabase) {
    if (type === 'expense') {
      return [
        { category_id: 'cat-1', category_name: 'Ăn uống', category_icon: '🍜', category_color: '#ef4444', total: 50000, percentage: 11.5 },
        { category_id: 'cat-2', category_name: 'Di chuyển', category_icon: '🚗', category_color: '#f97316', total: 35000, percentage: 8 },
        { category_id: 'cat-3', category_name: 'Mua sắm', category_icon: '🛒', category_color: '#8b5cf6', total: 200000, percentage: 46 },
        { category_id: 'cat-4', category_name: 'Giải trí', category_icon: '🎮', category_color: '#ec4899', total: 150000, percentage: 34.5 },
      ];
    }
    return [
      { category_id: 'cat-7', category_name: 'Lương', category_icon: '💰', category_color: '#22c55e', total: 15000000, percentage: 88.2 },
      { category_id: 'cat-8', category_name: 'Thưởng', category_icon: '🎁', category_color: '#3b82f6', total: 2000000, percentage: 11.8 },
    ];
  }

  const { data, error } = await supabase.rpc('get_category_summary', {
    type_param: type,
    year_param: year,
    month_param: month,
  });
  logError('getCategorySummary', error);
  return (data as CategorySummary[]) ?? [];
}
