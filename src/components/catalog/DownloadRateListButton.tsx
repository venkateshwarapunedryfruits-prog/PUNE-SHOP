"use client";

import { useState } from "react";
import { downloadRateListPdf } from "@/lib/rateListPdf";
import type { Category, Product } from "@/lib/types";

type Props = {
  categories: Category[];
  products: Product[];
  activeCategoryId?: string;
};

export function DownloadRateListButton({ categories, products, activeCategoryId = "all" }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    if (loading) return;
    setLoading(true);
    try {
      await downloadRateListPdf({
        categories,
        products,
        selectedCategoryId: activeCategoryId,
      });
    } catch (e) {
      console.error("Failed to generate PDF:", e);
    } finally {
      setLoading(false);
    }
  }

  const isFiltered = activeCategoryId !== "all";
  const activeCategory = isFiltered ? categories.find((c) => c.id === activeCategoryId) : null;

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      title={isFiltered && activeCategory ? `Download ${activeCategory.name} Rate List PDF` : "Download Complete Rate List (PDF)"}
      className="group relative inline-flex items-center gap-2 rounded-full border border-forest/30 bg-forest px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-paper shadow-sm transition hover:bg-forest-2 hover:border-gold active:scale-95 disabled:opacity-60 sm:px-4 sm:py-2.5 sm:text-xs"
    >
      {loading ? (
        <svg className="size-3.5 animate-spin text-gold" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="size-3.5 text-gold transition-transform duration-300 group-hover:-translate-y-0.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <polyline points="9 15 12 18 15 15" />
        </svg>
      )}

      <span>
        {loading
          ? "Preparing PDF…"
          : isFiltered && activeCategory
            ? `${activeCategory.name} Rate List`
            : "Download Rate List"}
      </span>

      <span className="hidden rounded-full bg-gold/90 px-1.5 py-0.2 text-[0.62rem] font-bold text-forest sm:inline-block">
        PDF
      </span>
    </button>
  );
}
