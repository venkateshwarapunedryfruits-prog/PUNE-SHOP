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
  // 1. TABLE-STYLE VIEW (Default: Simple, easy, compact rate table)
  // -------------------------------------------------------------------
  if (viewMode === "table") {
    return (
      <article className="group flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-line bg-paper p-4 shadow-xs transition duration-300 hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-luxe sm:rounded-3xl sm:p-5">
        <div>
          {/* Header Bar */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold-soft/70 px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-gold-deep sm:text-[0.68rem]">
              <TableMiniIcon /> Rate Card
            </span>

            {/* Photo count indicator if photos exist */}
            {hasImages && (
              <span className="inline-flex items-center gap-1 text-[0.68rem] text-muted">
                <CameraMiniIcon /> {imageList.length} photo{imageList.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Product Name in prominent text */}
          <h3 className="font-display mt-2 text-lg font-bold leading-snug text-ink transition group-hover:text-forest sm:text-2xl">
            {displayName}
          </h3>

          {/* Fragrance / Variant chips if multiple fragrances in one product */}
          {variants.length > 0 && (
            <div className="mt-2.5">
              <p className="eyebrow text-[0.6rem] text-muted">
                Available in {variants.length} Fragrances:
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {variants.map((v, i) => (
                  <span
                    key={i}
                    className="rounded-md border border-line bg-white/90 px-2 py-0.5 text-[0.68rem] font-medium text-ink shadow-2xs"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Simple & Easy Price Table */}
          <div className="mt-3.5 overflow-hidden rounded-xl border border-line bg-white/95 shadow-2xs sm:mt-4">
            <table className="w-full border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-line bg-ivory/80 text-[0.64rem] font-semibold uppercase tracking-wider text-muted sm:text-[0.68rem]">
                  <th className="px-3 py-2">Rate Type</th>
                  <th className="px-3 py-2 text-right">Price</th>
                  <th className="px-3 py-2 text-right">Benefit / MOQ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {/* MRP Row */}
                <tr>
                  <td className="px-3 py-2.5 font-medium text-muted">MRP</td>
                  <td className="px-3 py-2.5 text-right font-medium text-muted line-through">
                    {formatPrice(p.mrp)}
                  </td>
                  <td className="px-3 py-2.5 text-right text-[0.7rem] text-muted sm:text-xs">
                    Standard Retail
                  </td>
                </tr>

                {/* Member Rate Row */}
                <tr className="bg-forest/[0.04]">
                  <td className="px-3 py-2.5 font-bold text-forest">Member Rate</td>
                  <td className="px-3 py-2.5 text-right text-sm font-bold text-forest sm:text-base">
                    {formatPrice(p.member_price)}
                  </td>
                  <td className="px-3 py-2.5 text-right text-[0.7rem] font-bold text-forest sm:text-xs">
                    {savings > 0 ? `Save ${formatPrice(savings)}` : "Special"}
                  </td>
                </tr>

                {/* Wholesale Rate Row */}
                {hasWholesale ? (
                  <tr className="bg-gold-soft/40">
                    <td className="px-3 py-2.5 font-semibold text-gold-deep">Wholesale Rate</td>
                    <td className="px-3 py-2.5 text-right text-sm font-bold text-gold-deep sm:text-base">
                      {formatPrice(p.wholesale_price)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-[0.7rem] font-semibold text-gold-deep sm:text-xs">
                      Min {p.wholesale_min_qty} pcs
                    </td>
                  </tr>
                ) : (
                  <tr className="text-muted/60">
                    <td className="px-3 py-2 text-[0.7rem]">Wholesale</td>
                    <td className="px-3 py-2 text-right text-[0.7rem]">—</td>
                    <td className="px-3 py-2 text-right text-[0.68rem]">Retail qty only</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3 text-xs">
          <span className="flex items-center gap-1 font-medium text-forest">
            <CheckCircleIcon /> In Stock & Ready
          </span>
          <span className="eyebrow text-gold">Official Store Rate</span>
        </div>
      </article>
    );
  }

  // -------------------------------------------------------------------
  // 2. PHOTO CARD VIEW (With images & multi-image carousel)
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
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-paper transition duration-300 hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-luxe sm:rounded-3xl">
      {/* Image container OR Named Placeholder */}
      <div className="relative aspect-square overflow-hidden bg-white">
        {showImage ? (
          <>
            <Image
              src={currentImageUrl}
              alt={p.name}
              fill
              sizes="(min-width: 1280px) 300px, (min-width: 1024px) 25vw, 50vw"
              className="object-contain p-3 transition duration-500 group-hover:scale-[1.04] sm:p-5"
            />

            {/* Multi-image indicators & navigation */}
            {hasMultipleImages && (
              <>
                {/* Photo counter */}
                <div className="absolute right-2.5 top-2.5 z-10 flex items-center gap-1 rounded-full bg-forest/85 px-2 py-0.5 text-[0.62rem] font-semibold text-paper backdrop-blur-xs">
                  <CameraMiniIcon />
                  <span>
                    {activeImgIndex + 1}/{imageList.length}
                  </span>
                </div>

                {/* Left arrow */}
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous photo"
                  className="absolute left-1.5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/95 p-1.5 text-forest shadow-md transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <ChevronLeftIcon />
                </button>

                {/* Right arrow */}
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next photo"
                  className="absolute right-1.5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/95 p-1.5 text-forest shadow-md transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <ChevronRightIcon />
                </button>

                {/* Bottom dots */}
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
                        idx === activeImgIndex ? "w-3 bg-gold" : "bg-ink/20 hover:bg-ink/40"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          /* NO IMAGE: KEEP PLACEHOLDER WITH PRODUCT NAME IN BIG TEXT */
          <div className="relative flex size-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#12301f] to-[#1e4a32] p-5 text-center shadow-inner">
            <div className="pointer-events-none absolute inset-2.5 rounded-2xl border border-gold/30" />
            <div className="pointer-events-none absolute -bottom-5 -right-5 font-display text-8xl font-black text-white/[0.04]">
              V
            </div>
            <span className="eyebrow mb-1.5 text-[0.6rem] tracking-[0.24em] text-gold-soft">
              Venkateshwara
            </span>
            <p className="font-display text-xl font-bold leading-tight text-paper sm:text-2xl md:text-[1.55rem] px-2">
              {displayName}
            </p>
            <span className="mt-3 inline-block rounded-full bg-gold/20 px-2.5 py-0.5 text-[0.62rem] font-medium tracking-wider text-gold-soft border border-gold/30">
              Pure Quality
            </span>
          </div>
        )}
      </div>

      {/* Card Details */}
      <div className="flex flex-1 flex-col border-t border-line p-3.5 sm:p-5">
        <h3 className="font-display text-lg font-semibold leading-snug text-ink sm:text-[1.35rem]">
          {displayName}
        </h3>

        {/* Variants pill list if multiple fragrances */}
        {variants.length > 0 && (
          <p className="mt-1 text-xs text-muted">
            {variants.length} fragrances available
          </p>
        )}

        <dl className="mt-3 space-y-1.5 text-sm sm:mt-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2">
            <dt className="eyebrow text-muted">MRP</dt>
            <dd className="text-muted line-through">{formatPrice(p.mrp)}</dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-2">
            <dt className="eyebrow text-forest">Member</dt>
            <dd className="text-base font-bold text-forest sm:text-lg">{formatPrice(p.member_price)}</dd>
          </div>
        </dl>

        <div className="mt-auto pt-3 sm:pt-4">
          {hasWholesale ? (
            <div className="rounded-xl border border-gold/30 bg-gold-soft/60 px-3 py-2">
              <p className="eyebrow text-gold-deep">Wholesale</p>
              <div className="mt-0.5 flex flex-wrap items-baseline justify-between gap-x-2">
                <span className="font-bold text-gold-deep">{formatPrice(p.wholesale_price)}</span>
                <span className="text-[0.7rem] text-muted sm:text-xs">Min. {p.wholesale_min_qty} pcs</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function TableMiniIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3 text-gold-deep" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 3h18v18H3z" />
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
    </svg>
  );
}

function CameraMiniIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3 text-gold" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3 text-forest" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
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
