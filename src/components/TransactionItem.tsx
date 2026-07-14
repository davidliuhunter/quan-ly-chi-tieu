import type { Transaction } from "@/lib/types";

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export default function TransactionItem({ transaction }: { transaction: Transaction }) {
  const isIncome = transaction.type === "income";

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <span className="text-xl">{transaction.category?.icon ?? "📌"}</span>
        <div>
          <p className="font-medium text-gray-800 text-sm">
            {transaction.category?.name ?? "Không danh mục"}
          </p>
          {transaction.description && (
            <p className="text-xs text-gray-400">{transaction.description}</p>
          )}
          <p className="text-xs text-gray-400">{formatDate(transaction.transaction_date)}</p>
        </div>
      </div>
      <span className={`font-semibold text-sm ${isIncome ? "text-income" : "text-expense"}`}>
        {isIncome ? "+" : "-"}{formatMoney(transaction.amount)}
      </span>
    </div>
  );
}
