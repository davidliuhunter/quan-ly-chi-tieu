import { getBudgetStatus, getCategories } from "@/lib/data";
import BudgetClient from "@/components/BudgetClient";

export const dynamic = "force-dynamic";

export default async function BudgetPage() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [budgetStatus, categories] = await Promise.all([
    getBudgetStatus(currentMonth),
    getCategories(),
  ]);

  return <BudgetClient budgetStatus={budgetStatus} categories={categories} currentMonth={currentMonth} />;
}
