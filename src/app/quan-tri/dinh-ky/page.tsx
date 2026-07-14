import { getRecurringTransactions, getCategories } from "@/lib/data";
import RecurringClient from "@/components/RecurringClient";

export const dynamic = "force-dynamic";

export default async function RecurringPage() {
  const [recurring, categories] = await Promise.all([
    getRecurringTransactions(),
    getCategories(),
  ]);
  return <RecurringClient recurring={recurring} categories={categories} />;
}
