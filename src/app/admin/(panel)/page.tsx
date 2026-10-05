import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Category, Product } from "@/lib/types";
import { ProductTable } from "@/components/admin/ProductTable";

export default async function ProductsPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("id, name").order("created_at"),
    supabase.from("products").select("*").order("name"),
  ]);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-gold">Catalogue</p>
          <h1 className="font-display mt-1 text-4xl font-semibold text-forest">Products</h1>
        </div>
        <Link
          href={categories?.length ? "/admin/products/new" : "/admin/categories"}
          className="eyebrow rounded-full bg-forest px-6 py-3.5 text-paper transition hover:bg-forest-2"
        >
          {categories?.length ? "+ Add Product" : "Add a category first"}
        </Link>
      </div>

      <ProductTable categories={(categories as Category[]) ?? []} products={(products as Product[]) ?? []} />
    </>
  );
}
