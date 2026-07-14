import { getCategories } from "@/lib/data";
import CategoriesClient from "@/components/CategoriesClient";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();
  return <CategoriesClient categories={categories} />;
}
