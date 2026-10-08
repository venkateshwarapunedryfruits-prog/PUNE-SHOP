"use client";

import { useMemo, useRef, useState } from "react";
import type { Category, Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { DownloadRateListButton } from "./DownloadRateListButton";

type Props = {
  categories: Category[];
  products: Product[];
  error?: string;
};

// In the "All" view each category shows this many products, then a "View all" button.
const PREVIEW_COUNT = 4;

export function Catalog({ categories, products, error }: Props) {
  const [active, setActive] = useState<string>("all");
  const [query, setQuery] = useState("");
  const topRef = useRef<HTMLDivElement>(null);

  // Switching category while scrolled down the page jumps back to the top of the catalogue.
  function selectCategory(id: string) {
    setActive(id);
    const top = topRef.current;
    if (top && top.getBoundingClientRect().top < 0) top.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Only categories that actually have products on display
  const sections = useMemo(
    () =>
      categories
        .map((c) => ({ ...c, products: products.filter((p) => p.category_id === c.id) }))
        .filter((c) => c.products.length > 0),
    [categories, products],
  );

  const q = query.trim().toLowerCase();
  const visible = sections
    .filter((s) => active === "all" || s.id === active)
    .map((s) => ({ ...s, products: q ? s.products.filter((p) => p.name.toLowerCase().includes(q)) : s.products }))
    .filter((s) => s.products.length > 0);
  const resultCount = visible.reduce((n, s) => n + s.products.length, 0);
  // Only the "All" view is shortened; a single category or a search shows everything.
  const preview = active === "all" && !q;

  return (
    <div ref={topRef}>
      {/* Toolbar: categories + search */}
      <div className="sticky top-0 z-20 border-b border-line bg-ivory/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 pb-3 pt-1 sm:px-8 md:flex-row md:items-center md:justify-between md:py-0">
          <nav className="no-scrollbar -mx-5 flex overflow-x-auto px-1.5 sm:-mx-8 sm:px-4.5 md:mx-0 md:gap-1 md:px-0" aria-label="Categories">
            <Tab label="All" count={products.length} active={active === "all"} onClick={() => selectCategory("all")} />
            {sections.map((s) => (
              <Tab
                key={s.id}
                label={s.name}
                count={s.products.length}
                active={active === s.id}
                onClick={() => selectCategory(s.id)}
              />
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-2.5 md:flex-nowrap">
            <label className="relative block flex-1 md:w-72">
              <span className="sr-only">Search products</span>
              <svg
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive("all"); // search across every category
                }}
                placeholder="Search products…"
                className="w-full rounded-full border border-line bg-paper py-2.5 pl-11 pr-4 text-base outline-none transition placeholder:text-muted/80 focus:border-gold focus:ring-4 focus:ring-gold/10 sm:py-2.5 sm:text-sm"
              />
            </label>

            <DownloadRateListButton
              categories={categories}
              products={products}
              activeCategoryId={active}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 pb-10 sm:px-8">
        {q && (
          <p className="pt-6 text-sm text-muted sm:pt-8">
            {resultCount} {resultCount === 1 ? "result" : "results"} for{" "}
            <span className="font-medium text-ink">“{query.trim()}”</span>
          </p>
        )}

        {visible.map((section) => {
          const shown = preview ? section.products.slice(0, PREVIEW_COUNT) : section.products;
          const hidden = section.products.length - shown.length;

          return (
            <section key={section.id} className="pt-9 sm:pt-16" aria-labelledby={`cat-${section.id}`}>
              <div className="mb-5 flex items-end justify-between gap-4 border-b border-line pb-3 sm:mb-7 sm:pb-4">
                <div>
                  <span className="eyebrow text-gold">Collection</span>
                  <h2 id={`cat-${section.id}`} className="font-display mt-1 text-3xl font-semibold text-forest sm:text-4xl">
                    {section.name}
                  </h2>
                </div>
                <span className="pb-1 text-sm text-muted">
                  {section.products.length} {section.products.length === 1 ? "product" : "products"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
                {shown.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {hidden > 0 && (
                <div className="mt-6 sm:mt-10 sm:flex sm:justify-center">
                  <button
                    type="button"
                    onClick={() => selectCategory(section.id)}
                    className="group flex w-full items-center justify-center gap-3 rounded-full bg-forest px-8 py-[1.15rem] text-paper shadow-luxe transition hover:bg-forest-2 active:scale-[0.98] sm:w-auto sm:min-w-[26rem] sm:py-5"
                  >
                    <span className="text-sm font-semibold uppercase tracking-[0.16em] sm:text-[0.95rem]">
                      View all {section.name}
                    </span>
                    <span className="rounded-full bg-gold px-2.5 py-0.5 text-xs font-bold text-paper">
                      {section.products.length}
                    </span>
                    <ArrowIcon />
                  </button>
                </div>
              )}
            </section>
          );
        })}

        {visible.length === 0 && (
          <div className="py-28 text-center">
            <p className="font-display text-3xl text-forest">
              {error ? "Catalogue unavailable" : q ? "No products found" : "Catalogue coming soon"}
            </p>
            <p className="mt-2 text-sm text-muted">
              {error ? "Please check back shortly." : q ? "Try a different name or browse all categories." : "Products will appear here shortly."}
            </p>
            {q && (
              <button
                onClick={() => {
                  setQuery("");
                  setActive("all");
                }}
                className="eyebrow mt-6 rounded-full border border-forest px-5 py-2.5 text-forest transition hover:bg-forest hover:text-paper"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Tab({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`relative shrink-0 whitespace-nowrap px-3.5 py-3 text-sm transition md:px-4 md:py-5 ${
        active ? "font-semibold text-forest" : "text-muted hover:text-ink"
      }`}
    >
      {label}
      <span className={`ml-1.5 text-xs ${active ? "text-gold" : "text-muted/70"}`}>{count}</span>
      <span
        className={`absolute inset-x-3.5 bottom-0 h-[2px] rounded-full bg-gold transition-transform duration-300 md:inset-x-4 ${
          active ? "scale-x-100" : "scale-x-0"
        }`}
      />
    </button>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4 transition-transform duration-300 group-hover:translate-x-1"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path d="M5 12h14m-5-5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
