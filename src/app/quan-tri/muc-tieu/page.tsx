import { getSavingsGoals, getTotalSavings } from "@/lib/data";
import SavingsClient from "@/components/SavingsClient";

export const dynamic = "force-dynamic";

export default async function SavingsPage() {
  const [goals, totalSavings] = await Promise.all([
    getSavingsGoals(),
    getTotalSavings(),
  ]);

  return <SavingsClient goals={goals} totalSavings={totalSavings} />;
}
