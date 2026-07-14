"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  updateSavingsProgress,
} from "@/lib/actions";
import type { SavingsGoal, TotalSavings } from "@/lib/types";

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const ICON_OPTIONS = ["💻", "✈️", "🛡️", "🏠", "🚗", "🎓", "💰", "🎁", "🏥", "📱", "🐶", "💍", "🎬", "📚", "🏖️"];
const COLOR_OPTIONS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#a855f7", "#6b7280"];

interface Props {
  goals: SavingsGoal[];
  totalSavings: TotalSavings;
}

export default function SavingsClient({ goals, totalSavings }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SavingsGoal | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [progressGoalId, setProgressGoalId] = useState<string | null>(null);
  const [progressAmount, setProgressAmount] = useState("");

  const activeGoals = goals.filter((g) => !g.is_completed);
  const completedGoals = goals.filter((g) => g.is_completed);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = editing
      ? await updateSavingsGoal(editing.id, formData)
      : await createSavingsGoal(formData);

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
    if (!confirm("Bạn có chắc muốn xóa mục tiêu này?")) return;
    await deleteSavingsGoal(id);
  };

  const handleComplete = async (goal: SavingsGoal) => {
    if (!confirm(`Đánh dấu hoàn thành "${goal.name}"?`)) return;
    const formData = new FormData();
    formData.set("name", goal.name);
    formData.set("target_amount", String(goal.target_amount));
    await updateSavingsGoal(goal.id, formData);
  };

  const handleAddProgress = async (goalId: string) => {
    const amount = Number(progressAmount);
    if (!progressAmount || isNaN(amount) || amount <= 0) {
      setError("Vui lòng nhập số tiền hợp lệ.");
      return;
    }
    setSubmitting(true);
    setError("");
    const result = await updateSavingsProgress(goalId, amount);
    if (!result.success) {
      setError(result.error ?? "Có lỗi xảy ra.");
    } else {
      setProgressGoalId(null);
      setProgressAmount("");
    }
    setSubmitting(false);
  };

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return "Không thời hạn";
    return new Date(deadline).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Tổng quan tiết kiệm */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
      >
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Tổng quan tiết kiệm
        </h3>
        <div className="flex items-end justify-between mb-2">
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatMoney(totalSavings.total_saved)}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            / {formatMoney(totalSavings.total_target)}
          </span>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(totalSavings.overall_percentage, 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
          {totalSavings.overall_percentage}% hoàn thành
        </p>
      </motion.div>

      {/* Nút thêm mục tiêu */}
      <div className="flex justify-end">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setEditing(null);
            setShowForm(!showForm);
            setError("");
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {showForm ? "Đóng" : "+ Thêm mục tiêu"}
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
                {editing ? "Sửa mục tiêu" : "Thêm mục tiêu mới"}
              </h3>

              {/* Tên mục tiêu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tên mục tiêu
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editing?.name ?? ""}
                  required
                  placeholder="Ví dụ: Mua laptop mới"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Số tiền mục tiêu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Số tiền mục tiêu (VND)
                </label>
                <input
                  type="number"
                  name="target_amount"
                  defaultValue={editing?.target_amount ?? ""}
                  required
                  min={1000}
                  step={1000}
                  placeholder="Ví dụ: 30000000"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Ngày hạn */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ngày hạn (không bắt buộc)
                </label>
                <input
                  type="date"
                  name="deadline"
                  defaultValue={editing?.deadline ?? ""}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Icon & Màu */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Icon
                  </label>
                  <select
                    name="icon"
                    defaultValue={editing?.icon ?? "🎯"}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  >
                    {ICON_OPTIONS.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Màu
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {COLOR_OPTIONS.map((color) => (
                      <label key={color} className="cursor-pointer">
                        <input
                          type="radio"
                          name="color"
                          value={color}
                          defaultChecked={editing ? editing.color === color : color === "#3b82f6"}
                          className="sr-only peer"
                        />
                        <span
                          className="block w-6 h-6 rounded-full border-2 border-transparent peer-checked:border-gray-900 dark:peer-checked:border-white transition-all"
                          style={{ backgroundColor: color }}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

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

      {/* Danh sách mục tiêu đang thực hiện */}
      {activeGoals.length === 0 && completedGoals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-gray-500 dark:text-gray-400"
        >
          Chưa có mục tiêu tiết kiệm nào.
        </motion.div>
      ) : (
        <>
          {activeGoals.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                Đang thực hiện ({activeGoals.length})
              </h3>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {activeGoals.map((goal, index) => {
                    const pct = goal.target_amount > 0
                      ? Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100)
                      : 0;
                    const barColor =
                      pct >= 100 ? "#22c55e" : pct >= 50 ? "#f59e0b" : goal.color;

                    return (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{goal.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                  {goal.name}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  Hạn: {formatDeadline(goal.deadline)}
                                </p>
                              </div>
                              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 ml-2">
                                {pct}%
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                              <motion.div
                                className="h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.6, delay: index * 0.05, ease: "easeOut" }}
                                style={{ backgroundColor: barColor }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {formatMoney(goal.current_amount)} / {formatMoney(goal.target_amount)}
                            </p>

                            {/* Actions */}
                            <div className="flex gap-2 mt-3 flex-wrap">
                              {/* Nút thêm tiến độ */}
                              {progressGoalId === goal.id ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={progressAmount}
                                    onChange={(e) => setProgressAmount(e.target.value)}
                                    placeholder="Số tiền"
                                    min={1000}
                                    className="w-28 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1 text-xs text-gray-900 dark:text-gray-100"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleAddProgress(goal.id)}
                                    disabled={submitting}
                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded text-xs font-medium"
                                  >
                                    OK
                                  </button>
                                  <button
                                    onClick={() => {
                                      setProgressGoalId(null);
                                      setProgressAmount("");
                                    }}
                                    className="px-2 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded text-xs"
                                  >
                                    Hủy
                                  </button>
                                </div>
                              ) : (
                                <motion.button
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setProgressGoalId(goal.id)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium"
                                >
                                  + Thêm tiến độ
                                </motion.button>
                              )}

                              <button
                                onClick={() => {
                                  setEditing(goal);
                                  setShowForm(true);
                                }}
                                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleComplete(goal)}
                                className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-xs font-medium hover:bg-amber-200 dark:hover:bg-amber-900/50"
                              >
                                Hoàn thành
                              </button>
                              <button
                                onClick={() => handleDelete(goal.id)}
                                className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/50"
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Mục tiêu đã hoàn thành */}
          {completedGoals.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                Đã hoàn thành ({completedGoals.length})
              </h3>
              <div className="space-y-2 opacity-75">
                {completedGoals.map((goal, index) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{goal.icon}</span>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-semibold text-gray-500 dark:text-gray-400 line-through">
                            {goal.name}
                          </h4>
                          <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                            ✓ Hoàn thành
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {formatMoney(goal.current_amount)} / {formatMoney(goal.target_amount)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="text-xs text-red-400 hover:text-red-500"
                      >
                        Xóa
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
