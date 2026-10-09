"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type { Category, Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { DownloadRateListButton } from "./DownloadRateListButton";

type Props = {
  categories: Category[];
  products: Product[];
  error?: string;
};

const PREVIEW_COUNT = 4;

export function Catalog({ categories, products, error }: Props) {
  const [active, setActive] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "photo">("table");
  const topRef = useRef<HTMLDivElement>(null);

  function selectCategory(id: string) {
    setActive(id);
    const top = topRef.current;
    if (top && top.getBoundingClientRect().top < 0) {
      top.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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
  const preview = active === "all" && !q;

  return (
    <div ref={topRef}>
      {/* -------------------------------------------------------------
          HERO CARD FOR PDF RATE LIST
          ------------------------------------------------------------- */}
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-8 sm:pt-6">
        <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#12301f] via-[#1b432c] to-[#0f281a] p-5 shadow-luxe sm:p-7 md:p-8">
          <div className="pointer-events-none absolute -right-8 -top-8 size-52 rounded-full bg-gold/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 size-48 rounded-full bg-forest-2/40 blur-2xl" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/15 px-3 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-gold-soft sm:text-[0.68rem]">
                <span>Official Rate Card • अधिकृत दर सूची ({products.length} Products)</span>
              </div>
              <h1 className="font-display mt-2 text-2xl font-bold leading-tight text-paper sm:text-3xl md:text-4xl">
                Wholesale & Retail Rate List • घाऊक व किरकोळ दर सूची
              </h1>
              <p className="mt-1 text-xs text-gold-soft/80 sm:text-sm">
                Verified member pricing & bulk wholesale terms. Download official printable PDF rate card below.
              </p>
            </div>

            <div className="shrink-0 pt-1 sm:pt-0">
              <DownloadRateListButton
                categories={categories}
                products={products}
                activeCategoryId={active}
                variant="hero"
              />
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          SUB-HERO BANNER FOR DIWALI GIFT BOXES
          ------------------------------------------------------------- */}
      <div className="mx-auto max-w-7xl px-4 pt-3.5 sm:px-8 sm:pt-4">
        <div className="relative overflow-hidden rounded-3xl border border-gold/40 bg-gradient-to-r from-gold-soft/80 via-paper to-gold-soft/80 p-4 shadow-xs sm:p-6">
          <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xl">🪔</span>
                <span className="rounded-full bg-forest px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-gold-soft">
                  Diwali Festive Special • दिवाळी विशेष
                </span>
                <span className="hidden text-xs font-bold text-gold-deep sm:inline">
                  Starting at ₹240 / Filled Box
                </span>
              </div>

              <h2 className="font-display mt-1 text-xl font-bold text-forest sm:text-2xl md:text-[1.65rem]">
                Diwali Special Dry Fruit Gift Boxes • दिवाळी गिफ्ट बॉक्सेस
              </h2>
              <p className="mt-0.5 text-xs text-muted sm:text-sm">
                100% filled 4-box & 6-box gift sets with Cashew, Almonds, Pista, Raisins & Walnut. Select store pickup date and pre-order online.
              </p>

              {/* Quick price pills */}
              <div className="mt-2.5 flex flex-wrap gap-1.5 text-[0.68rem] font-semibold">
                <span className="rounded-md border border-line bg-white/95 px-2 py-0.5 text-ink shadow-2xs">
                  4-Box (50g • 200g): <strong className="text-forest font-bold">₹240</strong>
                </span>
                <span className="rounded-md border border-line bg-white/95 px-2 py-0.5 text-ink shadow-2xs">
                  4-Box (100g • 400g): <strong className="text-forest font-bold">₹450</strong>
                </span>
                <span className="rounded-md border border-line bg-white/95 px-2 py-0.5 text-ink shadow-2xs">
                  6-Box (50g • 300g): <strong className="text-forest font-bold">₹330</strong>
                </span>
                <span className="rounded-md border border-line bg-white/95 px-2 py-0.5 text-ink shadow-2xs">
                  6-Box (100g • 600g): <strong className="text-forest font-bold">₹640</strong>
                </span>
              </div>
            </div>

            <div className="shrink-0 pt-1 sm:pt-0">
              <Link
                href="/diwali"
                className="group inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3 text-xs font-bold uppercase tracking-wider text-paper shadow-md transition hover:bg-forest-2 active:scale-95"
              >
                <span>Pre-Order Gift Boxes (प्री-ऑर्डर करा)</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          CATEGORY BAR & TOOLBAR (Sticky)
          ------------------------------------------------------------- */}
      <div className="sticky top-[58px] z-20 mt-4 border-b border-line/80 bg-ivory/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2.5 px-4 py-2 sm:px-8 sm:py-2.5">
          {/* Mobile Category Dropdown */}
          <div className="relative md:hidden">
            <label className="sr-only" htmlFor="category-select-mobile">
              Category
            </label>
            <select
              id="category-select-mobile"
              value={active}
              onChange={(e) => selectCategory(e.target.value)}
              className="appearance-none rounded-full border border-line bg-paper py-2 pl-3.5 pr-8 text-xs font-bold text-forest shadow-2xs outline-none focus:border-gold"
            >
              <option value="all">All Categories / सर्व ({products.length})</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.products.length})
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>

          {/* Desktop Category Navigation Tabs */}
          <nav className="no-scrollbar hidden items-center gap-1 overflow-x-auto md:flex" aria-label="Categories">
            <Tab label="All / सर्व" count={products.length} active={active === "all"} onClick={() => selectCategory("all")} />
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

          {/* Right Toolbar: Compact Search & View Mode Toggle */}
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <label className="relative block w-36 sm:w-56 md:w-64">
              <span className="sr-only">Search products</span>
              <svg
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
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
                  setActive("all");
                }}
                placeholder="Search / शोधा…"
                className="w-full rounded-full border border-line bg-paper py-1.5 pl-8 pr-3 text-xs outline-none transition placeholder:text-muted/70 focus:border-gold sm:py-2 sm:pl-9 sm:text-xs"
              />
            </label>

            {/* View Mode Toggle: Table (Default) vs Photos */}
            <div className="inline-flex rounded-full border border-line bg-paper p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                title="Table Format / टेबल व्ह्यू"
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition cursor-pointer sm:px-3 sm:py-1.5 ${
                  viewMode === "table" ? "bg-forest text-paper" : "text-muted hover:text-ink"
                }`}
              >
                <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M3 3h18v18H3z" />
                  <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
                </svg>
                <span className="hidden sm:inline">Table / टेबल</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("photo")}
                title="Photo View / फोटो व्ह्यू"
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition cursor-pointer sm:px-3 sm:py-1.5 ${
                  viewMode === "photo" ? "bg-forest text-paper" : "text-muted hover:text-ink"
                }`}
              >
                <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
                <span className="hidden sm:inline">Photos / फोटो</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          PRODUCT GRID LISTINGS
          ------------------------------------------------------------- */}
      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-8">
        {q && (
          <p className="pt-5 text-sm text-muted">
            {resultCount} {resultCount === 1 ? "result" : "results"} for{" "}
            <span className="font-semibold text-ink">“{query.trim()}”</span>
          </p>
        )}

        {visible.map((section) => {
          const shown = preview ? section.products.slice(0, PREVIEW_COUNT) : section.products;
          const hidden = section.products.length - shown.length;

          return (
            <section key={section.id} className="pt-8 sm:pt-12" aria-labelledby={`cat-${section.id}`}>
              <div className="mb-4 flex items-end justify-between border-b border-line pb-2.5 sm:mb-6 sm:pb-3">
                <div>
                  <span className="eyebrow text-gold">Category • वर्गवारी</span>
                  <h2 id={`cat-${section.id}`} className="font-display mt-0.5 text-2xl font-bold text-forest sm:text-3xl">
                    {section.name}
                  </h2>
                </div>
                <span className="text-xs font-medium text-muted">
                  {section.products.length} {section.products.length === 1 ? "item" : "items"}
                </span>
              </div>

              {/* 2-Grid for Table View, or 4-Grid for Photos */}
              <div
                className={
                  viewMode === "table"
                    ? "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2 sm:gap-4"
                    : "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5"
                }
              >
                {shown.map((p) => (
                  <ProductCard key={p.id} product={p} viewMode={viewMode} />
                ))}
              </div>

              {hidden > 0 && (
                <div className="mt-6 flex justify-center sm:mt-8">
                  <button
                    type="button"
                    onClick={() => selectCategory(section.id)}
                    className="group inline-flex items-center gap-2.5 rounded-full bg-forest px-6 py-3 text-xs font-bold uppercase tracking-wider text-paper shadow-sm transition hover:bg-forest-2 active:scale-98 cursor-pointer"
                  >
                    <span>View all {section.name} • सर्व पहा</span>
                    <span className="rounded-full bg-gold px-2 py-0.5 text-[0.68rem] font-bold text-paper">
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
          <div className="py-24 text-center">
            <p className="font-display text-2xl font-bold text-forest">
              {error ? "Catalogue unavailable • दर यादी लोड होत आहे" : q ? "No products match • उत्पादन सापडले नाही" : "Coming soon"}
            </p>
            <p className="mt-1 text-sm text-muted">
              {error ? "Please check back shortly." : "Try adjusting your search terms."}
            </p>
            {q && (
              <button
                onClick={() => {
                  setQuery("");
                  setActive("all");
                }}
                className="mt-4 rounded-full border border-forest px-4 py-2 text-xs font-bold uppercase tracking-wider text-forest transition hover:bg-forest hover:text-paper"
              >
                Clear search • शोध साफ करा
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
      className={`relative shrink-0 whitespace-nowrap px-3.5 py-2 text-xs font-bold transition md:px-4 cursor-pointer ${
        active ? "text-forest" : "text-muted hover:text-ink"
      }`}
    >
      {label}
      <span className={`ml-1 text-[0.68rem] ${active ? "text-gold" : "text-muted/60"}`}>{count}</span>
      <span
        className={`absolute inset-x-3.5 bottom-0 h-[2px] rounded-full bg-gold transition-transform duration-200 md:inset-x-4 ${
          active ? "scale-x-100" : "scale-x-0"
        }`}
      />
    </button>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="M5 12h14m-5-5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
