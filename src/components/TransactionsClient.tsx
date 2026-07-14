"use client";

import { useState } from "react";
import { createTransaction, updateTransaction, deleteTransaction } from "@/lib/actions";
import type { Transaction, Category } from "@/lib/types";
import TransactionItem from "./TransactionItem";

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

interface Props {
  transactions: Transaction[];
  categories: Category[];
}

export default function TransactionsClient({ transactions, categories }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filteredCategories = categories.filter(
    (c) => filter === "all" || c.type === filter
  );

  const filteredTransactions = transactions.filter(
    (tx) => filter === "all" || tx.type === filter
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    let result;

    if (editing) {
      result = await updateTransaction(editing.id, formData);
    } else {
      result = await createTransaction(formData);
    }

    if (!result.success) {
      setError(result.error ?? "Có lỗi xảy ra.");
    } else {
      setShowForm(false);
      setEditing(null);
      (e.target as HTMLFormElement).reset();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa giao dịch này?")) return;
    await deleteTransaction(id);
  };

  const openEdit = (tx: Transaction) => {
    setEditing(tx);
    setShowForm(true);
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      {/* Header + Filter */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1 bg-white rounded-lg p-1 border border-gray-200">
          {(["all", "expense", "income"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === f ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {f === "all" ? "Tất cả" : f === "expense" ? "Chi tiêu" : "Thu nhập"}
            </button>
          ))}
        </div>
        <button onClick={() => { setEditing(null); setShowForm(!showForm); }} className="btn-primary text-sm">
          + Thêm giao dịch
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">
            {editing ? "✏️ Sửa giao dịch" : "➕ Thêm giao dịch mới"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại</label>
                <select
                  name="type"
                  defaultValue={editing?.type ?? "expense"}
                  className="input-field"
                  onChange={(e) => {
                    setFilter(e.target.value as "income" | "expense");
                  }}
                >
                  <option value="expense">Chi tiêu</option>
                  <option value="income">Thu nhập</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền (VNĐ)</label>
                <input
                  name="amount"
                  type="number"
                  min={1}
                  defaultValue={editing?.amount ?? ""}
                  className="input-field"
                  placeholder="VD: 50000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <select
                  name="category_id"
                  defaultValue={editing?.category_id ?? ""}
                  className="input-field"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {filteredCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày</label>
                <input
                  name="transaction_date"
                  type="date"
                  defaultValue={editing?.transaction_date ?? today}
                  className="input-field"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
              <input
                name="description"
                defaultValue={editing?.description ?? ""}
                className="input-field"
                placeholder="VD: Cơm trưa văn phòng"
              />
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="btn-primary text-sm">
                {submitting ? "Đang lưu..." : editing ? "Cập nhật" : "Thêm"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-ghost text-sm">
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transaction list */}
      <div className="card">
        {filteredTransactions.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Chưa có giao dịch nào</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 group">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xl flex-shrink-0">{tx.category?.icon ?? "📌"}</span>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">
                      {tx.category?.name ?? "Không danh mục"}
                    </p>
                    {tx.description && (
                      <p className="text-xs text-gray-400 truncate">{tx.description}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(tx.transaction_date).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`font-semibold text-sm ${tx.type === "income" ? "text-income" : "text-expense"}`}>
                    {tx.type === "income" ? "+" : "-"}{formatMoney(tx.amount)}
                  </span>
                  <div className="hidden group-hover:flex gap-1">
                    <button onClick={() => openEdit(tx)} className="text-xs text-blue-600 hover:underline">
                      Sửa
                    </button>
                    <button onClick={() => handleDelete(tx.id)} className="text-xs text-red-600 hover:underline">
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
