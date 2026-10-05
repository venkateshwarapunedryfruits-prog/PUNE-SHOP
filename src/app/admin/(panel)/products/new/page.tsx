import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Category } from "@/lib/types";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("id, name").order("created_at");

  return (
    <>
      <Link href="/admin" className="eyebrow text-muted transition hover:text-forest">
        ← Products
      </Link>
      <h1 className="font-display mt-3 text-4xl font-semibold text-forest">Add Product</h1>
      <ProductForm categories={(categories as Category[]) ?? []} />
    </>
  );
}
