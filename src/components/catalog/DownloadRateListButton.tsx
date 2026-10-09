"use client";

import { useState } from "react";
import { downloadRateListPdf } from "@/lib/rateListPdf";
import type { Category, Product } from "@/lib/types";

type Props = {
  categories: Category[];
  products: Product[];
  activeCategoryId?: string;
  variant?: "hero" | "minimal";
};

export function DownloadRateListButton({
  categories,
  products,
  activeCategoryId = "all",
  variant = "hero",
}: Props) {
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

  if (variant === "hero") {
    return (
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        title="Download Official Rate List PDF"
        className="group relative inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-gold to-[#c59d5b] px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-forest shadow-md transition duration-200 hover:brightness-105 active:scale-95 disabled:opacity-60 cursor-pointer"
      >
        {loading ? (
          <svg className="size-4 animate-spin text-forest" viewBox="0 0 24 24" fill="none">
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
            className="size-4 text-forest transition-transform duration-200 group-hover:-translate-y-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
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
            ? "Generating PDF… • PDF तयार होत आहे…"
            : isFiltered && activeCategory
              ? `Download ${activeCategory.name} PDF • दर यादी`
              : "Download Rate List (PDF) • दर यादी डाउनलोड करा"}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="group inline-flex items-center gap-1.5 rounded-full border border-forest/30 bg-forest px-3 py-1.5 text-xs font-semibold text-paper transition hover:bg-forest-2 active:scale-95 disabled:opacity-60 cursor-pointer"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-3.5 text-gold"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <polyline points="9 15 12 18 15 15" />
      </svg>
      <span>{loading ? "PDF…" : "PDF"}</span>
    </button>
  );
}
