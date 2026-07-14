import { getMonthlySummary, getCategorySummary, getTransactions } from "@/lib/data";
import DashboardClient from "@/components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [monthlySummary, expenseByCategory, incomeByCategory, recentTransactions] =
    await Promise.all([
      getMonthlySummary(currentYear),
      getCategorySummary("expense", currentYear, currentMonth),
      getCategorySummary("income", currentYear, currentMonth),
      getTransactions(5),
    ]);

  const currentMonthSummary = monthlySummary.find(
    (s) => s.month === `${currentYear}-${String(currentMonth).padStart(2, "0")}`
  );

  return (
    <DashboardClient
      currentMonthSummary={currentMonthSummary}
      monthlySummary={monthlySummary}
      expenseByCategory={expenseByCategory}
      incomeByCategory={incomeByCategory}
      recentTransactions={recentTransactions}
    />
  );
}
