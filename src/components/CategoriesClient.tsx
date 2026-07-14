"use client";

import { useState } from "react";
import { createCategory, updateCategory, deleteCategory } from "@/lib/actions";
import type { Category } from "@/lib/types";

const EMOJI_OPTIONS = ["🍜", "🚗", "🛒", "🎮", "📋", "💊", "📚", "💰", "🎁", "📈", "🏠", "💡", "📱", "✈️", "🐶", "🎓", "💻", "🎬", "🏥", "📌"];
const COLOR_OPTIONS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280", "#a855f7"];

interface Props {
  categories: Category[];
}

export default function CategoriesClient({ categories }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  const filtered = categories.filter((c) => filter === "all" || c.type === filter);

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    if (!editing && !formData.get("name")) {
      setError("Vui lòng nhập tên danh mục.");
      setSubmitting(false);
      return;
    }

    const result = editing
      ? await updateCategory(editing.id, formData)
      : await createCategory(formData);

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
    if (!confirm("Xóa danh mục sẽ đặt các giao dịch liên quan về 'Không danh mục'. Tiếp tục?")) return;
    await deleteCategory(id);
  };

  return (
    <div className="space-y-4">
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
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(!showForm);
          }}
          className="btn-primary text-sm"
        >
          + Thêm danh mục
        </button>
      </div>

      {showForm && (
        <div className="card-glass">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">
            {editing ? "✏️ Sửa danh mục" : "➕ Thêm danh mục mới"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục</label>
                <input
                  name="name"
                  defaultValue={editing?.name ?? ""}
                  className="input-field"
                  placeholder="VD: Ăn uống"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại</label>
                <select name="type" defaultValue={editing?.type ?? "expense"} className="input-field">
                  <option value="expense">Chi tiêu</option>
                  <option value="income">Thu nhập</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <div className="flex flex-wrap gap-1">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <label key={emoji} className="cursor-pointer">
                      <input type="radio" name="icon" value={emoji} defaultChecked={editing?.icon === emoji} className="hidden peer" />
                      <span className="inline-block p-2 rounded-lg peer-checked:bg-blue-100 peer-checked:ring-2 peer-checked:ring-blue-500 hover:bg-gray-100 text-lg">
                        {emoji}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Màu sắc</label>
              <div className="flex gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <label key={color} className="cursor-pointer">
                    <input type="radio" name="color" value={color} defaultChecked={editing?.color === color} className="hidden peer" />
                    <span
                      className="block w-8 h-8 rounded-full peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-blue-500 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  </label>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="btn-primary text-sm">
                {submitting ? "Đang lưu..." : editing ? "Cập nhật" : "Thêm"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
                className="btn-ghost text-sm"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((cat) => (
          <div key={cat.id} className="card-glass flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{cat.icon}</span>
              <div>
                <p className="font-medium text-gray-800">{cat.name}</p>
                <p className="text-xs text-gray-400">
                  {cat.type === "income" ? "Thu nhập" : "Chi tiêu"}
                </p>
              </div>
            </div>
            <div className="hidden group-hover:flex gap-1">
              <button
                onClick={() => {
                  setEditing(cat);
                  setShowForm(true);
                }}
                className="text-xs text-blue-600 hover:underline"
              >
                Sửa
              </button>
              <button onClick={() => handleDelete(cat.id)} className="text-xs text-red-600 hover:underline">
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <div className="text-5xl mb-3">📂</div>
          <p className="font-medium">Chưa có danh mục nào</p>
          <p className="text-sm mt-1">Thêm danh mục để phân loại giao dịch</p>
        </div>
      )}
    </div>
  );
}
