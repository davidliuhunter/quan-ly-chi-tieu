"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createBudget, updateBudget, deleteBudget } from "@/lib/actions";
import type { BudgetStatus, Category } from "@/lib/types";

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

interface Props {
  budgetStatus: BudgetStatus[];
  categories: Category[];
  currentMonth: string;
}

export default function BudgetClient({ budgetStatus, categories, currentMonth }: Props) {
  const [month, setMonth] = useState(currentMonth);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BudgetStatus | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const expenseCategories = categories.filter((c) => c.type === "expense");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("month", month);

    const result = editing
      ? await updateBudget(editing.category_id, formData)
      : await createBudget(formData);

    if (!result.success) {
      setError(result.error ?? "Có lỗi xảy ra.");
    } else {
      setShowForm(false);
      setEditing(null);
      (e.target as HTMLFormElement).reset();
    }
    setSubmitting(false);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Bạn có chắc muốn xóa ngân sách này?")) return;
    await deleteBudget(categoryId);
  };

  const openEdit = (item: BudgetStatus) => {
    setEditing(item);
    setShowForm(true);
  };

  // Lọc danh mục chưa có ngân sách
  const usedCategoryIds = new Set(budgetStatus.map((b) => b.category_id));
  const availableCategories = expenseCategories.filter((c) => !usedCategoryIds.has(c.id));

  return (
    <div className="space-y-4">
      {/* Chọn tháng */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tháng:</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setEditing(null);
            setShowForm(!showForm);
            setError("");
          }}
          disabled={!showForm && availableCategories.length === 0}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {showForm ? "Đóng" : "+ Thêm ngân sách"}
        </motion.button>
      </div>

      {/* Form thêm/sửa */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleSubmit}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {editing ? "Sửa ngân sách" : "Thêm ngân sách mới"}
              </h3>

              {/* Chọn danh mục */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Danh mục
                </label>
                <select
                  name="category_id"
                  defaultValue={editing?.category_id ?? ""}
                  required
                  disabled={!!editing}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>
                    Chọn danh mục chi tiêu
                  </option>
                  {(editing ? expenseCategories : availableCategories).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Số tiền giới hạn */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Giới hạn chi tiêu (VND)
                </label>
                <input
                  type="number"
                  name="limit_amount"
                  defaultValue={editing?.limit_amount ?? ""}
                  required
                  min={1000}
                  step={1000}
                  placeholder="Ví dụ: 3000000"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium"
                >
                  {submitting ? "Đang lưu..." : editing ? "Cập nhật" : "Thêm"}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                    setError("");
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium"
                >
                  Hủy
                </motion.button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Danh sách ngân sách */}
      <AnimatePresence mode="popLayout">
        {budgetStatus.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-500 dark:text-gray-400"
          >
            Chưa có ngân sách nào cho tháng này.
          </motion.div>
        ) : (
          <div className="space-y-2">
            {budgetStatus.map((cat, index) => (
              <motion.div
                key={cat.category_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="flex items-center gap-3 p-4">
                  <span className="text-2xl">{cat.category_icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {cat.category_name}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 ml-2 whitespace-nowrap">
                        {formatMoney(cat.spent_amount)} / {formatMoney(cat.limit_amount)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                      <motion.div
                        className="h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(cat.percentage, 100)}%` }}
                        transition={{ duration: 0.6, delay: index * 0.05, ease: "easeOut" }}
                        style={{
                          backgroundColor:
                            cat.percentage > 80
                              ? "#ef4444"
                              : cat.percentage > 50
                                ? "#f59e0b"
                                : "#22c55e",
                        }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span
                        className="text-xs font-medium"
                        style={{
                          color:
                            cat.percentage > 80
                              ? "#ef4444"
                              : cat.percentage > 50
                                ? "#f59e0b"
                                : "#22c55e",
                        }}
                      >
                        {cat.percentage}%
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(cat)}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(cat.category_id)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
