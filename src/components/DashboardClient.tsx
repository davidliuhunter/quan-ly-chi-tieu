"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import type { MonthlySummary, CategorySummary, Transaction } from "@/lib/types";
import TransactionItem from "./TransactionItem";

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

interface Props {
  currentMonthSummary?: MonthlySummary;
  monthlySummary: MonthlySummary[];
  expenseByCategory: CategorySummary[];
  incomeByCategory: CategorySummary[];
  recentTransactions: Transaction[];
}

export default function DashboardClient({
  currentMonthSummary,
  monthlySummary,
  expenseByCategory,
  incomeByCategory,
  recentTransactions,
}: Props) {
  const barData = monthlySummary
    .slice(0, 6)
    .reverse()
    .map((m) => ({
      month: m.month.slice(5),
      "Thu nhập": Number(m.total_income),
      "Chi tiêu": Number(m.total_expense),
    }));

  return (
    <div className="space-y-6">
      {/* Tổng quan tháng hiện tại */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Thu nhập tháng này</p>
          <p className="text-2xl font-bold text-income">
            {formatMoney(Number(currentMonthSummary?.total_income ?? 0))}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Chi tiêu tháng này</p>
          <p className="text-2xl font-bold text-expense">
            {formatMoney(Number(currentMonthSummary?.total_expense ?? 0))}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Số dư</p>
          <p className={`text-2xl font-bold ${Number(currentMonthSummary?.balance ?? 0) >= 0 ? "text-income" : "text-expense"}`}>
            {formatMoney(Number(currentMonthSummary?.balance ?? 0))}
          </p>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biểu đồ cột thu/chi 6 tháng */}
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">📊 Thu nhập & Chi tiêu 6 tháng gần đây</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(0)}M`} />
                <Tooltip formatter={(v: number) => formatMoney(v)} />
                <Bar dataKey="Thu nhập" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Chi tiêu" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ tròn chi tiêu theo danh mục */}
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">🍩 Chi tiêu theo danh mục (tháng này)</h2>
          {expenseByCategory.length === 0 ? (
            <p className="text-gray-400 text-center py-12">Chưa có dữ liệu</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    dataKey="total"
                    nameKey="category_name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={3}
                  >
                    {expenseByCategory.map((entry) => (
                      <Cell key={entry.category_id} fill={entry.category_color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatMoney(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-2">
            {expenseByCategory.map((cat) => (
              <div key={cat.category_id} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.category_color }} />
                <span>{cat.category_icon} {cat.category_name}</span>
                <span className="font-medium">{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Giao dịch gần đây */}
      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-4">📋 Giao dịch gần đây</h2>
        {recentTransactions.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Chưa có giao dịch nào</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentTransactions.map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
