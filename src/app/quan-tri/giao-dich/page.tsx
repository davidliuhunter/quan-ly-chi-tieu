import { getTransactions, getCategories } from "@/lib/data";
import TransactionsClient from "@/components/TransactionsClient";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const [transactions, categories] = await Promise.all([
    getTransactions(200),
    getCategories(),
  ]);

  return <TransactionsClient transactions={transactions} categories={categories} />;
}
