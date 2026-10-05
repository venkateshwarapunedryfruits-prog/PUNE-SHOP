import Image from "next/image";
import { Catalog } from "@/components/catalog/Catalog";
import { VisitUs } from "@/components/catalog/VisitUs";
import { createPublicClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { site } from "@/lib/site";
import type { Category, Product } from "@/lib/types";

// Prices and availability change from the admin panel, so always render fresh.
export const dynamic = "force-dynamic";

async function getCatalog(): Promise<{ categories: Category[]; products: Product[]; error?: string }> {
  if (!isSupabaseConfigured) return { categories: [], products: [], error: "Supabase is not configured yet." };

  const supabase = createPublicClient();
  const [cats, prods] = await Promise.all([
    supabase.from("categories").select("id, name").order("created_at"),
    supabase
      .from("products")
      .select("id, category_id, name, image_url, mrp, member_price, wholesale_enabled, wholesale_price, wholesale_min_qty, is_available")
      .eq("is_available", true)
      .order("name"),
  ]);

  const error = cats.error?.message ?? prods.error?.message;
  return { categories: cats.data ?? [], products: (prods.data as Product[]) ?? [], error };
}

export default async function Home() {
  const { categories, products, error } = await getCatalog();

  return (
    <>
      <header className="border-b border-line bg-paper/90">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-5 sm:px-8">
          <Image
            src="/logo.webp"
            alt={`${site.name} logo`}
            width={56}
            height={56}
            priority
            className="size-12 rounded-full ring-1 ring-line sm:size-14"
          />
          <div className="min-w-0">
            <p className="font-display text-2xl font-semibold leading-none tracking-wide text-forest sm:text-[1.9rem]">
              {site.name}
            </p>
            <p className="eyebrow mt-1.5 text-[0.6rem] leading-snug tracking-[0.14em] text-gold sm:text-[0.68rem] sm:tracking-[0.22em]">{site.legalName.replace(`${site.name} `, "")}</p>
          </div>
          <a
            href="#visit"
            className="eyebrow ml-auto hidden items-center gap-2 rounded-full border border-line px-4 py-2.5 text-forest transition hover:border-gold hover:text-gold-deep sm:inline-flex"
          >
            <PinIcon /> Visit Store
          </a>
        </div>
      </header>

      <main className="flex-1">
        <Catalog categories={categories} products={products} error={error} />
        <VisitUs />
      </main>

      <footer className="border-t border-line bg-paper">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-6 text-xs text-muted sm:flex-row sm:px-8">
          <p>© {new Date().getFullYear()} {site.legalName}</p>
          <p className="eyebrow text-gold">Prices are subject to change</p>
        </div>
      </footer>
    </>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
    </svg>
  );
}
