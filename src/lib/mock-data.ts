import type { Category, Transaction } from './types';

export const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Ăn uống', type: 'expense', icon: '🍜', color: '#ef4444', created_at: '2026-01-01' },
  { id: 'cat-2', name: 'Di chuyển', type: 'expense', icon: '🚗', color: '#f97316', created_at: '2026-01-01' },
  { id: 'cat-3', name: 'Mua sắm', type: 'expense', icon: '🛒', color: '#8b5cf6', created_at: '2026-01-01' },
  { id: 'cat-4', name: 'Giải trí', type: 'expense', icon: '🎮', color: '#ec4899', created_at: '2026-01-01' },
  { id: 'cat-5', name: 'Hóa đơn', type: 'expense', icon: '📋', color: '#6b7280', created_at: '2026-01-01' },
  { id: 'cat-6', name: 'Sức khỏe', type: 'expense', icon: '💊', color: '#14b8a6', created_at: '2026-01-01' },
  { id: 'cat-7', name: 'Lương', type: 'income', icon: '💰', color: '#22c55e', created_at: '2026-01-01' },
  { id: 'cat-8', name: 'Thưởng', type: 'income', icon: '🎁', color: '#3b82f6', created_at: '2026-01-01' },
  { id: 'cat-9', name: 'Đầu tư', type: 'income', icon: '📈', color: '#a855f7', created_at: '2026-01-01' },
  { id: 'cat-10', name: 'Khác', type: 'expense', icon: '📌', color: '#9ca3af', created_at: '2026-01-01' },
];

export const mockTransactions: Transaction[] = [
  {
    id: 'tx-1', amount: 50000, type: 'expense', category_id: 'cat-1',
    description: 'Cơm trưa', transaction_date: '2026-07-14', created_at: '2026-07-14',
    category: mockCategories[0],
  },
  {
    id: 'tx-2', amount: 15000000, type: 'income', category_id: 'cat-7',
    description: 'Lương tháng 7', transaction_date: '2026-07-01', created_at: '2026-07-01',
    category: mockCategories[6],
  },
  {
    id: 'tx-3', amount: 200000, type: 'expense', category_id: 'cat-3',
    description: 'Mua áo mới', transaction_date: '2026-07-13', created_at: '2026-07-13',
    category: mockCategories[2],
  },
  {
    id: 'tx-4', amount: 35000, type: 'expense', category_id: 'cat-2',
    description: 'Gửi xe', transaction_date: '2026-07-12', created_at: '2026-07-12',
    category: mockCategories[1],
  },
  {
    id: 'tx-5', amount: 150000, type: 'expense', category_id: 'cat-4',
    description: 'Xem phim', transaction_date: '2026-07-10', created_at: '2026-07-10',
    category: mockCategories[3],
  },
  {
    id: 'tx-6', amount: 2000000, type: 'income', category_id: 'cat-8',
    description: 'Thưởng dự án', transaction_date: '2026-07-05', created_at: '2026-07-05',
    category: mockCategories[7],
  },
];
