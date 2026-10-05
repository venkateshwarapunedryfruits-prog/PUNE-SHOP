import { createClient } from "@/lib/supabase/server";
import { CategoryManager } from "@/components/admin/CategoryManager";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("id, name").order("created_at"),
    supabase.from("products").select("category_id"),
  ]);

  const counts: Record<string, number> = {};
  for (const p of products ?? []) counts[p.category_id] = (counts[p.category_id] ?? 0) + 1;

  return (
    <>
      <p className="eyebrow text-gold">Catalogue</p>
      <h1 className="font-display mt-1 text-4xl font-semibold text-forest">Categories</h1>
      <CategoryManager categories={(categories ?? []).map((c) => ({ ...c, count: counts[c.id] ?? 0 }))} />
    </>
  );
}
