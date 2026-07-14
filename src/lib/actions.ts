'use server';

import { revalidatePath } from 'next/cache';
import { supabase, isConfigured } from './supabase';
import type { Transaction, Category, SavingsGoal } from './types';

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

// ─── Ngân sách ───────────────────────────────────────────────────────────────

export async function createBudget(formData: FormData) {
  const category_id = (formData.get('category_id') as string)?.trim();
  const month = (formData.get('month') as string)?.trim();
  const limitStr = (formData.get('limit_amount') as string)?.trim();

  const limit_amount = Number(limitStr);
  if (!category_id || !month) return { success: false, error: 'Vui lòng chọn danh mục và tháng.' };
  if (!limitStr || isNaN(limit_amount) || limit_amount <= 0) return { success: false, error: 'Số tiền giới hạn không hợp lệ.' };

  if (!isConfigured || !supabase) return { success: true };

  const { error } = await supabase.from('budgets').insert({ category_id, month, limit_amount });
  if (error) return { success: false, error: error.message };

  revalidatePath('/quan-tri/ngan-sach');
  return { success: true };
}

export async function updateBudget(id: string, formData: FormData) {
  const limitStr = (formData.get('limit_amount') as string)?.trim();

  if (!isConfigured || !supabase) return { success: true };

  const update: Record<string, unknown> = {};
  if (limitStr) {
    const limit_amount = Number(limitStr);
    if (isNaN(limit_amount) || limit_amount <= 0) return { success: false, error: 'Số tiền giới hạn không hợp lệ.' };
    update.limit_amount = limit_amount;
  }

  const { error } = await supabase.from('budgets').update(update).eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/quan-tri/ngan-sach');
  return { success: true };
}

export async function deleteBudget(id: string) {
  if (!isConfigured || !supabase) return { success: true };

  const { error } = await supabase.from('budgets').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/quan-tri/ngan-sach');
  return { success: true };
}

// ─── Tiết kiệm ───────────────────────────────────────────────────────────────

export async function createSavingsGoal(formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const targetStr = (formData.get('target_amount') as string)?.trim();
  const deadline = (formData.get('deadline') as string)?.trim() || null;
  const icon = (formData.get('icon') as string)?.trim() || '🎯';
  const color = (formData.get('color') as string)?.trim() || '#3b82f6';

  const target_amount = Number(targetStr);
  if (!name) return { success: false, error: 'Vui lòng nhập tên mục tiêu.' };
  if (!targetStr || isNaN(target_amount) || target_amount <= 0) return { success: false, error: 'Số tiền mục tiêu không hợp lệ.' };

  if (!isConfigured || !supabase) return { success: true };

  const { error } = await supabase.from('savings_goals').insert({
    name, target_amount, current_amount: 0, deadline, icon, color,
  });
  if (error) return { success: false, error: error.message };

  revalidatePath('/quan-tri/muc-tieu');
  return { success: true };
}

export async function updateSavingsGoal(id: string, formData: FormData) {
  if (!isConfigured || !supabase) return { success: true };

  const update: Record<string, unknown> = {};
  const name = (formData.get('name') as string)?.trim();
  const targetStr = (formData.get('target_amount') as string)?.trim();
  const deadline = (formData.get('deadline') as string)?.trim();
  const icon = (formData.get('icon') as string)?.trim();
  const color = (formData.get('color') as string)?.trim();

  if (name) update.name = name;
  if (targetStr) {
    const target_amount = Number(targetStr);
    if (isNaN(target_amount) || target_amount <= 0) return { success: false, error: 'Số tiền mục tiêu không hợp lệ.' };
    update.target_amount = target_amount;
  }
  if (deadline !== undefined) update.deadline = deadline || null;
  if (icon) update.icon = icon;
  if (color) update.color = color;

  const { error } = await supabase.from('savings_goals').update(update).eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/quan-tri/muc-tieu');
  return { success: true };
}

export async function deleteSavingsGoal(id: string) {
  if (!isConfigured || !supabase) return { success: true };

  const { error } = await supabase.from('savings_goals').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/quan-tri/muc-tieu');
  return { success: true };
}

export async function updateSavingsProgress(goalId: string, amount: number) {
  if (!isConfigured || !supabase) return { success: true };

  // Lấy current_amount hiện tại
  const { data: goal, error: fetchError } = await supabase
    .from('savings_goals')
    .select('current_amount, target_amount')
    .eq('id', goalId)
    .single();

  if (fetchError) return { success: false, error: fetchError.message };
  if (!goal) return { success: false, error: 'Không tìm thấy mục tiêu.' };

  const newAmount = (goal as SavingsGoal).current_amount + amount;
  const isCompleted = newAmount >= (goal as SavingsGoal).target_amount;

  const { error } = await supabase
    .from('savings_goals')
    .update({ current_amount: newAmount, is_completed: isCompleted })
    .eq('id', goalId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/quan-tri/muc-tieu');
  return { success: true };
}

// ─── Giao dịch định kỳ ──────────────────────────────────────────────────────

export async function createRecurring(formData: FormData) {
  const amountStr = (formData.get('amount') as string)?.trim();
  const type = (formData.get('type') as string)?.trim();
  const category_id = (formData.get('category_id') as string)?.trim() || null;
  const description = (formData.get('description') as string)?.trim() || null;
  const frequency = (formData.get('frequency') as string)?.trim();
  const next_date = (formData.get('next_date') as string)?.trim();

  const amount = Number(amountStr);
  if (!amountStr || isNaN(amount) || amount <= 0) return { success: false, error: 'Số tiền không hợp lệ.' };
  if (!type || !['income', 'expense'].includes(type)) return { success: false, error: 'Loại giao dịch không hợp lệ.' };
  if (!frequency || !['daily', 'weekly', 'monthly', 'yearly'].includes(frequency)) return { success: false, error: 'Tần suất không hợp lệ.' };
  if (!next_date) return { success: false, error: 'Vui lòng chọn ngày tiếp theo.' };

  if (!isConfigured || !supabase) return { success: true };

  const { error } = await supabase.from('recurring_transactions').insert({
    amount, type, category_id, description, frequency, next_date,
  });
  if (error) return { success: false, error: error.message };

  revalidatePath('/quan-tri/giao-dich');
  return { success: true };
}

export async function updateRecurring(id: string, formData: FormData) {
  if (!isConfigured || !supabase) return { success: true };

  const update: Record<string, unknown> = {};
  const amountStr = (formData.get('amount') as string)?.trim();
  const type = (formData.get('type') as string)?.trim();
  const category_id = (formData.get('category_id') as string)?.trim();
  const description = (formData.get('description') as string)?.trim();
  const frequency = (formData.get('frequency') as string)?.trim();
  const next_date = (formData.get('next_date') as string)?.trim();
  const isActiveStr = (formData.get('is_active') as string)?.trim();

  if (amountStr) {
    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) return { success: false, error: 'Số tiền không hợp lệ.' };
    update.amount = amount;
  }
  if (type) update.type = type;
  if (category_id !== undefined) update.category_id = category_id || null;
  if (description !== undefined) update.description = description || null;
  if (frequency) update.frequency = frequency;
  if (next_date) update.next_date = next_date;
  if (isActiveStr) update.is_active = isActiveStr === 'true';

  const { error } = await supabase.from('recurring_transactions').update(update).eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/quan-tri/giao-dich');
  return { success: true };
}

export async function deleteRecurring(id: string) {
  if (!isConfigured || !supabase) return { success: true };

  const { error } = await supabase.from('recurring_transactions').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/quan-tri/giao-dich');
  return { success: true };
}
