"use client";

import { useState } from "react";
import Image from "next/image";
import { formatPrice, type Product } from "@/lib/types";

export function ProductCard({ product: p }: { product: Product }) {
  // Normalize images list (supports both new `images` array and legacy `image_url`)
  const imageList = (p.images && p.images.length > 0)
    ? p.images.filter((url) => typeof url === "string" && url.trim().length > 0)
    : (p.image_url && p.image_url.trim().length > 0 ? [p.image_url] : []);

  // Determine if this product should display image(s) or table-only card
  // If is_image is explicitly false, or if there are no images available, show table view.
  const hasImages = imageList.length > 0;
  const showImage = (p.is_image !== false) && hasImages;

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const hasWholesale = p.wholesale_enabled && p.wholesale_price != null;
  const savings = p.mrp > p.member_price ? p.mrp - p.member_price : 0;

  // -------------------------------------------------------------
  // NO IMAGE CASE: TABLE-STYLE CARD (No image placeholder!)
  // -------------------------------------------------------------
  if (!showImage) {
    return (
      <article className="group flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-line bg-paper p-3.5 shadow-xs transition duration-300 hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-luxe sm:rounded-3xl sm:p-5">
        <div>
          {/* Header pill */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold-soft/70 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-gold-deep sm:text-[0.65rem]">
              <TableMiniIcon /> Rate Table
            </span>
            <span className="text-[0.65rem] font-medium text-muted">
              {hasWholesale ? "Bulk + Retail" : "Retail"}
            </span>
          </div>

          {/* Product Title */}
          <h3 className="font-display mt-2.5 text-base font-semibold leading-snug text-ink transition group-hover:text-forest sm:text-xl">
            {p.name}
          </h3>

          {/* Little Table layout for the product rates */}
          <div className="mt-3 overflow-hidden rounded-xl border border-line bg-white/95 shadow-2xs sm:mt-4">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-line bg-ivory/80 text-[0.62rem] font-semibold uppercase tracking-wider text-muted sm:text-[0.66rem]">
                  <th className="px-2.5 py-1.5 sm:px-3 sm:py-2">Tier</th>
                  <th className="px-2.5 py-1.5 text-right sm:px-3 sm:py-2">Price</th>
                  <th className="px-2.5 py-1.5 text-right sm:px-3 sm:py-2">Terms</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {/* MRP Row */}
                <tr>
                  <td className="px-2.5 py-2 font-medium text-muted sm:px-3">MRP</td>
                  <td className="px-2.5 py-2 text-right font-medium text-muted line-through sm:px-3">
                    {formatPrice(p.mrp)}
                  </td>
                  <td className="px-2.5 py-2 text-right text-[0.65rem] text-muted sm:px-3 sm:text-xs">
                    Standard
                  </td>
                </tr>

                {/* Member Row */}
                <tr className="bg-forest/[0.04]">
                  <td className="px-2.5 py-2 font-bold text-forest sm:px-3">Member</td>
                  <td className="px-2.5 py-2 text-right text-xs font-bold text-forest sm:px-3 sm:text-sm">
                    {formatPrice(p.member_price)}
                  </td>
                  <td className="px-2.5 py-2 text-right text-[0.65rem] font-bold text-forest sm:px-3 sm:text-xs">
                    {savings > 0 ? `Save ${formatPrice(savings)}` : "Special"}
                  </td>
                </tr>

                {/* Wholesale Row (if available) */}
                {hasWholesale ? (
                  <tr className="bg-gold-soft/40">
                    <td className="px-2.5 py-2 font-semibold text-gold-deep sm:px-3">Wholesale</td>
                    <td className="px-2.5 py-2 text-right text-xs font-bold text-gold-deep sm:px-3 sm:text-sm">
                      {formatPrice(p.wholesale_price)}
                    </td>
                    <td className="px-2.5 py-2 text-right text-[0.65rem] font-medium text-gold-deep sm:px-3 sm:text-xs">
                      Min {p.wholesale_min_qty} pcs
                    </td>
                  </tr>
                ) : (
                  <tr className="text-muted/60">
                    <td className="px-2.5 py-1.5 text-[0.68rem] sm:px-3">Wholesale</td>
                    <td className="px-2.5 py-1.5 text-right text-[0.68rem] sm:px-3">—</td>
                    <td className="px-2.5 py-1.5 text-right text-[0.65rem] sm:px-3">Single qty</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info banner */}
        <div className="mt-3.5 flex items-center justify-between border-t border-line/60 pt-2.5 text-[0.7rem] sm:mt-4">
          <span className="flex items-center gap-1 font-medium text-forest">
            <CheckCircleIcon /> In Stock
          </span>
          <span className="eyebrow text-gold">Official Rate</span>
        </div>
      </article>
    );
  }

  // -------------------------------------------------------------
  // IMAGE CASE: SHOW IMAGE (with multi-image support if > 1)
  // -------------------------------------------------------------
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
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-white">
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
            {/* Image counter badge */}
            <div className="absolute right-2.5 top-2.5 z-10 flex items-center gap-1 rounded-full bg-forest/80 px-2 py-0.5 text-[0.62rem] font-semibold text-paper backdrop-blur-xs">
              <CameraIcon />
              <span>
                {activeImgIndex + 1}/{imageList.length}
              </span>
            </div>

            {/* Previous button */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-1.5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-forest shadow-md transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronLeftIcon />
            </button>

            {/* Next button */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-1.5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-forest shadow-md transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronRightIcon />
            </button>

            {/* Bottom dots */}
            <div className="absolute inset-x-0 bottom-2 z-10 flex justify-center gap-1">
              {imageList.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Go to image ${idx + 1}`}
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
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col border-t border-line p-3.5 sm:p-5">
        <h3 className="font-display text-lg font-semibold leading-snug text-ink sm:text-[1.4rem]">{p.name}</h3>

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

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3 text-forest" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3 text-gold" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
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
