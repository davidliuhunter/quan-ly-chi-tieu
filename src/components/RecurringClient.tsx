"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createRecurring, updateRecurring, deleteRecurring } from "@/lib/actions";
import type { RecurringTransaction, Category } from "@/lib/types";
import FormattedNumberInput from "./FormattedNumberInput";
import { useToast } from "./Toast";
import { useDevice } from "./DeviceProvider";
import BottomSheet from "./BottomSheet";
import EmptyState from "./EmptyState";

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const frequencyLabels: Record<string, string> = {
  daily: "Hàng ngày",
  weekly: "Hàng tuần",
  monthly: "Hàng tháng",
  yearly: "Hàng năm",
};

interface Props {
  recurring: RecurringTransaction[];
  categories: Category[];
}

export default function RecurringClient({ recurring, categories }: Props) {
  const { show: showToast } = useToast();
  const { isDesktop } = useDevice();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RecurringTransaction | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const fd = new FormData(e.currentTarget);
    const raw = (fd.get("amount_raw") as string) || (fd.get("amount") as string) || "0";
    fd.set("amount", raw.replace(/[,.]/g, "").trim());
    const r = editing
      ? await updateRecurring(editing.id, fd)
      : await createRecurring(fd);
    if (!r.success) setErr(r.error ?? "Có lỗi xảy ra.");
    else {
      setShowForm(false);
      setEditing(null);
      showToast(editing ? "Đã cập nhật giao dịch định kỳ" : "Đã thêm giao dịch định kỳ", "success");
    }
    setLoading(false);
  };

  const del = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa giao dịch định kỳ này?")) return;
    await deleteRecurring(id);
    showToast("Đã xóa giao dịch định kỳ", "success");
  };

  const edit = (item: RecurringTransaction) => {
    setEditing(item);
    setShowForm(true);
  };

  const add = () => {
    setEditing(null);
    setShowForm(true);
  };

  const toggleActive = async (item: RecurringTransaction) => {
    const fd = new FormData();
    fd.set("is_active", String(!item.is_active));
    const r = await updateRecurring(item.id, fd);
    if (r.success) {
      showToast(
        item.is_active ? "Đã tắt giao dịch định kỳ" : "Đã bật giao dịch định kỳ",
        "success"
      );
    }
  };

  const formContent = () => (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loại</label>
        <select
          name="type"
          defaultValue={editing?.type ?? "expense"}
          className="input-field"
        >
          <option value="expense">Chi tiêu</option>
          <option value="income">Thu nhập</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số tiền (VNĐ)</label>
        <FormattedNumberInput
          name="amount"
          value={editing?.amount}
          placeholder="VD: 50,000"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Danh mục</label>
        <select
          name="category_id"
          defaultValue={editing?.category_id ?? ""}
          className="input-field"
        >
          <option value="">-- Chọn danh mục --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tần suất</label>
        <select
          name="frequency"
          defaultValue={editing?.frequency ?? "monthly"}
          className="input-field"
          required
        >
          <option value="daily">Hàng ngày</option>
          <option value="weekly">Hàng tuần</option>
          <option value="monthly">Hàng tháng</option>
          <option value="yearly">Hàng năm</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ngày tiếp theo</label>
        <input
          name="next_date"
          type="date"
          defaultValue={editing?.next_date ?? today}
          className="input-field"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ghi chú</label>
        <input
          name="description"
          defaultValue={editing?.description ?? ""}
          className="input-field"
          placeholder="VD: Tiền thuê nhà hàng tháng"
        />
      </div>
      {err && (
        <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 px-3 py-2 rounded-lg">
          {err}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary text-sm flex-1"
        >
          {loading ? "Đang lưu..." : editing ? "Cập nhật" : "Thêm"}
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
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          🔄 Giao dịch định kỳ
        </h1>
        <button onClick={add} className="btn-primary text-sm">
          + Thêm định kỳ
        </button>
      </div>

      {/* Form trên desktop */}
      {isDesktop && showForm && (
        <div className="card-glass">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
            {editing ? "✏️ Sửa giao dịch định kỳ" : "➕ Thêm giao dịch định kỳ"}
          </h2>
          {formContent()}
        </div>
      )}

      {/* BottomSheet trên mobile */}
      {!isDesktop && (
        <BottomSheet
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          title={editing ? "Sửa giao dịch định kỳ" : "Thêm giao dịch định kỳ"}
        >
          {formContent()}
        </BottomSheet>
      )}

      {/* Danh sách */}
      {recurring.length === 0 ? (
        <EmptyState
          icon="🔄"
          title="Chưa có giao dịch định kỳ"
          description="Thêm giao dịch định kỳ để tự động theo dõi các khoản thu chi lặp lại"
          action={<button onClick={add} className="btn-primary">+ Thêm định kỳ</button>}
        />
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {recurring.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className={`card-glass ${!item.is_active ? "opacity-50" : ""}`}
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xl flex-shrink-0">
                      {item.category?.icon ?? "📌"}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 dark:text-gray-100 text-sm truncate">
                        {item.description || (item.category?.name ?? "Không danh mục")}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                            item.frequency === "daily"
                              ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                              : item.frequency === "weekly"
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                              : item.frequency === "monthly"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                              : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                          }`}
                        >
                          {frequencyLabels[item.frequency]}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          📅 {new Date(item.next_date).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`font-semibold text-sm ${
                        item.type === "income" ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {item.type === "income" ? "+" : "-"}
                      {formatMoney(item.amount)}
                    </span>
                    <div className="flex flex-col gap-1 ml-2">
                      <button
                        onClick={() => toggleActive(item)}
                        className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                          item.is_active
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {item.is_active ? "Bật" : "Tắt"}
                      </button>
                      <div className="flex gap-1">
                        <button
                          onClick={() => edit(item)}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => del(item.id)}
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
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
