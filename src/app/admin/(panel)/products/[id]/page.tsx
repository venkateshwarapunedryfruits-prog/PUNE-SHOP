import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Category, Product } from "@/lib/types";

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: categories }, { data: product }] = await Promise.all([
    supabase.from("categories").select("id, name").order("created_at"),
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
  ]);
  if (!product) notFound();

  return (
    <>
      <Link href="/admin" className="eyebrow text-muted transition hover:text-forest">
        ← Products
      </Link>
      <h1 className="font-display mt-3 text-4xl font-semibold text-forest">Edit Product</h1>
      <ProductForm categories={(categories as Category[]) ?? []} product={product as Product} />
    </>
  );
}
