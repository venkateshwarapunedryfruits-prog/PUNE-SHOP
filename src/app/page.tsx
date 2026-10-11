import Image from "next/image";
import Link from "next/link";
import { Catalog } from "@/components/catalog/Catalog";
import { VisitUs } from "@/components/catalog/VisitUs";
import { createPublicClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { site } from "@/lib/site";
import { STARTER_CATEGORIES, STARTER_PRODUCTS } from "@/lib/starterCatalog";
import type { Category, Product } from "@/lib/types";

// Prices and availability change from the admin panel, so always render fresh.
export const dynamic = "force-dynamic";

async function getCatalog(): Promise<{ categories: Category[]; products: Product[]; error?: string }> {
  // No database connected (local preview): show the built-in sample catalogue
  if (!isSupabaseConfigured) {
    return { categories: STARTER_CATEGORIES, products: STARTER_PRODUCTS };
  }

  // With a database, never fall back to the sample catalogue: its prices are not the shop's.
  // If loading fails, the page says the rate list is unavailable instead.
  try {
    const supabase = createPublicClient();
    const catsPromise = supabase.from("categories").select("id, name").order("created_at");

    const full = await supabase
      .from("products")
      .select("id, category_id, name, image_url, images, is_image, mrp, member_price, wholesale_enabled, wholesale_price, wholesale_min_qty, is_available")
      .eq("is_available", true)
      .order("name");

    // Databases that haven't run the multiple-images migration have no images / is_image columns
    const prods = full.error?.message?.toLowerCase().includes("column")
      ? await supabase
          .from("products")
          .select("id, category_id, name, image_url, mrp, member_price, wholesale_enabled, wholesale_price, wholesale_min_qty, is_available")
          .eq("is_available", true)
          .order("name")
      : full;

    const cats = await catsPromise;
    const error = prods.error?.message ?? cats.error?.message;
    if (error) {
      console.error("getCatalog error:", error);
      return { categories: [], products: [], error };
    }

    return { categories: cats.data ?? [], products: (prods.data as unknown as Product[]) ?? [] };
  } catch (err) {
    console.error("getCatalog error:", err);
    return { categories: [], products: [], error: "Could not load the rate list." };
  }
}

export default async function Home() {
  const { categories, products, error } = await getCatalog();

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-8 sm:py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.webp"
              alt={`${site.name} logo`}
              width={52}
              height={52}
              priority
              className="size-11 rounded-full ring-1 ring-line sm:size-13"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-1.5">
                <p className="font-display text-xl font-bold leading-none tracking-tight text-forest sm:text-2xl">
                  {site.name}
                </p>
                <span className="text-xs font-semibold text-gold sm:text-sm">
                  ({site.marathiName})
                </span>
              </div>
              <p className="mt-1 text-[0.62rem] font-bold tracking-wider text-muted sm:text-[0.68rem] uppercase">
                {site.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/diwali"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-forest to-forest-2 px-3.5 py-2 text-xs font-bold text-paper shadow-xs transition hover:brightness-110 active:scale-95"
            >
              <span>🪔</span>
              <span className="hidden sm:inline">Diwali Gift Boxes •</span>
              <span>दिवाळी बॉक्सेस</span>
            </Link>

            <a
              href="#visit"
              className="hidden items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-xs font-semibold text-forest transition hover:border-gold md:inline-flex"
            >
              <PinIcon />
              <span>Visit Store • दुकान</span>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-16 sm:pb-8">
        <Catalog categories={categories} products={products} error={error} />
        <VisitUs />
      </main>

      <footer className="border-t border-line bg-paper">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-6 text-xs text-muted sm:flex-row sm:px-8">
          <p>© {new Date().getFullYear()} {site.legalName} • {site.address}</p>
          <p className="font-semibold text-gold">Prices are subject to market changes • दर बाजारभावानुसार बदलू शकतात</p>
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
