"use client";

import { useState } from "react";
import Image from "next/image";
import { formatPrice, type Product } from "@/lib/types";

type Props = {
  product: Product;
  viewMode?: "table" | "photo";
};

/** Extracts fragrance or variant list from names formatted like "Name (Variants: A, B, C)" */
function extractVariants(name: string): { displayName: string; variants: string[] } {
  const match = name.match(/^(.*?)\s*\((?:.*?:)?\s*(.*?)\)$/);
  if (match) {
    const rawVariants = match[2].trim();
    const list = rawVariants.split(/,\s*/).map((s) => s.trim()).filter(Boolean);
    if (list.length > 1) {
      return { displayName: match[1].trim(), variants: list };
    }
  }
  return { displayName: name, variants: [] };
}

export function ProductCard({ product: p, viewMode = "table" }: Props) {
  // Normalize images list
  const imageList = (p.images && p.images.length > 0)
    ? p.images.filter((url) => typeof url === "string" && url.trim().length > 0)
    : (p.image_url && p.image_url.trim().length > 0 ? [p.image_url] : []);

  const hasImages = imageList.length > 0;
  const showImage = (p.is_image !== false) && hasImages;

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const hasWholesale = p.wholesale_enabled && p.wholesale_price != null;
  const savings = p.mrp > p.member_price ? p.mrp - p.member_price : 0;
  const { displayName, variants } = extractVariants(p.name);

  // -------------------------------------------------------------------
  // 1. COMPACT TABLE CARD (Default: Simple, crisp, big bold text, no MRP strikethrough)
  // -------------------------------------------------------------------
  if (viewMode === "table") {
    return (
      <article className="group flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-line/80 bg-paper p-3.5 shadow-xs transition duration-200 hover:border-gold hover:shadow-md sm:rounded-2xl sm:p-4">
        <div>
          {/* Product Name in BIG, clear, premium bold text */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg font-bold leading-tight text-ink sm:text-[1.3rem]">
              {displayName}
            </h3>

            {hasImages && (
              <span className="shrink-0 rounded-md bg-gold-soft/60 px-1.5 py-0.5 text-[0.65rem] font-semibold text-gold-deep">
                {imageList.length} photo{imageList.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Fragrance / Variant chips if multiple fragrances in one product */}
          {variants.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {variants.map((v, i) => (
                <span
                  key={i}
                  className="rounded border border-line bg-white px-1.5 py-0.5 text-[0.66rem] font-medium text-ink"
                >
                  {v}
                </span>
              ))}
            </div>
          )}

          {/* Clean, compact rate table */}
          <div className="mt-3 overflow-hidden rounded-xl border border-line bg-white">
            <table className="w-full border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-line bg-ivory/60 text-[0.66rem] font-bold uppercase tracking-wider text-muted sm:text-[0.7rem]">
                  <th className="px-2.5 py-1.5 sm:px-3 sm:py-2">Tier</th>
                  <th className="px-2.5 py-1.5 text-right sm:px-3 sm:py-2">Rate</th>
                  <th className="px-2.5 py-1.5 text-right sm:px-3 sm:py-2">Terms</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {/* MRP Row — NO strikethrough, clean clear number */}
                <tr>
                  <td className="px-2.5 py-2 font-medium text-muted sm:px-3">MRP</td>
                  <td className="px-2.5 py-2 text-right text-sm font-semibold text-ink sm:px-3 sm:text-base">
                    {formatPrice(p.mrp)}
                  </td>
                  <td className="px-2.5 py-2 text-right text-[0.7rem] text-muted sm:px-3 sm:text-xs">
                    Standard
                  </td>
                </tr>

                {/* Member Rate Row */}
                <tr className="bg-forest/[0.04]">
                  <td className="px-2.5 py-2 font-bold text-forest sm:px-3">Member</td>
                  <td className="px-2.5 py-2 text-right text-base font-extrabold text-forest sm:px-3 sm:text-lg">
                    {formatPrice(p.member_price)}
                  </td>
                  <td className="px-2.5 py-2 text-right text-[0.72rem] font-bold text-forest sm:px-3 sm:text-xs">
                    {savings > 0 ? `Save ${formatPrice(savings)}` : "Special"}
                  </td>
                </tr>

                {/* Wholesale Rate Row */}
                {hasWholesale ? (
                  <tr className="bg-gold-soft/30">
                    <td className="px-2.5 py-2 font-bold text-gold-deep sm:px-3">Wholesale</td>
                    <td className="px-2.5 py-2 text-right text-base font-extrabold text-gold-deep sm:px-3 sm:text-lg">
                      {formatPrice(p.wholesale_price)}
                    </td>
                    <td className="px-2.5 py-2 text-right text-[0.72rem] font-semibold text-gold-deep sm:px-3 sm:text-xs">
                      Min {p.wholesale_min_qty} pcs
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </article>
    );
  }

  // -------------------------------------------------------------------
  // 2. PHOTO CARD VIEW (With images & big text placeholder)
  // -------------------------------------------------------------------
  const currentImageUrl = imageList[activeImgIndex] || imageList[0];
  const hasMultipleImages = imageList.length > 1;

  function handlePrev(e: React.MouseEvent) {
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  }

  function handleNext(e: React.MouseEvent) {
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line/80 bg-paper transition duration-200 hover:border-gold hover:shadow-md sm:rounded-2xl">
      {/* Image or Named Typography Tile */}
      <div className="relative aspect-square overflow-hidden bg-white">
        {showImage ? (
          <>
            <Image
              src={currentImageUrl}
              alt={p.name}
              fill
              sizes="(min-width: 1280px) 300px, (min-width: 1024px) 25vw, 50vw"
              className="object-contain p-2.5 transition duration-300 group-hover:scale-[1.03] sm:p-4"
            />

            {hasMultipleImages && (
              <>
                <div className="absolute right-2 top-2 z-10 rounded-full bg-forest/85 px-2 py-0.5 text-[0.62rem] font-semibold text-paper">
                  {activeImgIndex + 1}/{imageList.length}
                </div>

                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous"
                  className="absolute left-1.5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/95 p-1 text-forest shadow sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <ChevronLeftIcon />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next"
                  className="absolute right-1.5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/95 p-1 text-forest shadow sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <ChevronRightIcon />
                </button>

                <div className="absolute inset-x-0 bottom-2 z-10 flex justify-center gap-1">
                  {imageList.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      aria-label={`Photo ${idx + 1}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImgIndex(idx);
                      }}
                      className={`size-1.5 rounded-full transition-all ${
                        idx === activeImgIndex ? "w-3 bg-gold" : "bg-ink/20"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          /* NO IMAGE: BIG NAME TYPOGRAPHY TILE */
          <div className="relative flex size-full flex-col items-center justify-center bg-gradient-to-br from-[#12301f] to-[#1e4a32] p-4 text-center">
            <div className="pointer-events-none absolute inset-2 rounded-xl border border-gold/30" />
            <p className="font-display px-2 text-xl font-bold leading-snug text-paper sm:text-2xl">
              {displayName}
            </p>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col border-t border-line/80 p-3 sm:p-3.5">
        <h3 className="font-display text-base font-bold leading-snug text-ink sm:text-lg">
          {displayName}
        </h3>

        <div className="mt-2.5 space-y-1 text-xs sm:text-sm">
          {/* MRP — NO STRIKETHROUGH */}
          <div className="flex items-baseline justify-between">
            <span className="font-medium text-muted">MRP</span>
            <span className="font-semibold text-ink">{formatPrice(p.mrp)}</span>
          </div>

          {/* Member Price */}
          <div className="flex items-baseline justify-between">
            <span className="font-bold text-forest">Member</span>
            <span className="text-base font-extrabold text-forest">{formatPrice(p.member_price)}</span>
          </div>
        </div>

        {hasWholesale && (
          <div className="mt-2.5 rounded-lg border border-gold/30 bg-gold-soft/50 px-2.5 py-1.5 text-xs">
            <div className="flex items-baseline justify-between font-bold text-gold-deep">
              <span>Wholesale</span>
              <span className="text-sm">{formatPrice(p.wholesale_price)}</span>
            </div>
            <span className="text-[0.68rem] text-muted">Min. {p.wholesale_min_qty} pcs</span>
          </div>
        )}
      </div>
    </article>
  );
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
