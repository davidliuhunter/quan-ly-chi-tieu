'use server';

import { revalidatePath } from 'next/cache';
import { supabase, isConfigured } from './supabase';
import type { Transaction, Category } from './types';

// ─── Danh mục ────────────────────────────────────────────────────────────────

export async function createCategory(formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const type = (formData.get('type') as string)?.trim();
  const icon = (formData.get('icon') as string)?.trim() || '📌';
  const color = (formData.get('color') as string)?.trim() || '#6b7280';

  if (!name || !type) return { success: false, error: 'Vui lòng điền tên và loại danh mục.' };
  if (!['income', 'expense'].includes(type)) return { success: false, error: 'Loại danh mục không hợp lệ.' };

  if (!isConfigured || !supabase) return { success: true };

  const { error } = await supabase.from('categories').insert({ name, type, icon, color });
  if (error) return { success: false, error: error.message };

  revalidatePath('/quan-tri/danh-muc');
  revalidatePath('/');
  return { success: true };
}

export async function updateCategory(id: string, formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const icon = (formData.get('icon') as string)?.trim();
  const color = (formData.get('color') as string)?.trim();

  if (!isConfigured || !supabase) return { success: true };

  const update: Record<string, string> = {};
  if (name) update.name = name;
  if (icon) update.icon = icon;
  if (color) update.color = color;

  const { error } = await supabase.from('categories').update(update).eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/quan-tri/danh-muc');
  revalidatePath('/');
  return { success: true };
}

export async function deleteCategory(id: string) {
  if (!isConfigured || !supabase) return { success: true };

  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/quan-tri/danh-muc');
  return { success: true };
}

// ─── Giao dịch ───────────────────────────────────────────────────────────────

export async function createTransaction(formData: FormData) {
  const amountStr = (formData.get('amount') as string)?.trim();
  const type = (formData.get('type') as string)?.trim();
  const category_id = (formData.get('category_id') as string)?.trim() || null;
  const description = (formData.get('description') as string)?.trim() || null;
  const transaction_date = (formData.get('transaction_date') as string)?.trim();

  const amount = Number(amountStr);
  if (!amountStr || isNaN(amount) || amount <= 0) return { success: false, error: 'Số tiền không hợp lệ.' };
  if (!type || !['income', 'expense'].includes(type)) return { success: false, error: 'Loại giao dịch không hợp lệ.' };
  if (!transaction_date) return { success: false, error: 'Vui lòng chọn ngày.' };

  if (!isConfigured || !supabase) return { success: true };

  const { error } = await supabase.from('transactions').insert({
    amount,
    type,
    category_id,
    description,
    transaction_date,
  });
  if (error) return { success: false, error: error.message };

  revalidatePath('/');
  revalidatePath('/quan-tri/giao-dich');
  return { success: true };
}

export async function updateTransaction(id: string, formData: FormData) {
  if (!isConfigured || !supabase) return { success: true };

  const update: Record<string, unknown> = {};
  const amountStr = (formData.get('amount') as string)?.trim();
  const type = (formData.get('type') as string)?.trim();
  const category_id = (formData.get('category_id') as string)?.trim();
  const description = (formData.get('description') as string)?.trim();
  const transaction_date = (formData.get('transaction_date') as string)?.trim();

  if (amountStr) {
    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) return { success: false, error: 'Số tiền không hợp lệ.' };
    update.amount = amount;
  }
  if (type) update.type = type;
  if (category_id !== undefined) update.category_id = category_id || null;
  if (description !== undefined) update.description = description || null;
  if (transaction_date) update.transaction_date = transaction_date;

  const { error } = await supabase.from('transactions').update(update).eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/');
  revalidatePath('/quan-tri/giao-dich');
  return { success: true };
}

export async function deleteTransaction(id: string) {
  if (!isConfigured || !supabase) return { success: true };

  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/');
  revalidatePath('/quan-tri/giao-dich');
  return { success: true };
}
