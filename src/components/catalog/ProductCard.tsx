import Image from "next/image";
import { formatPrice, type Product } from "@/lib/types";

export function ProductCard({ product: p }: { product: Product }) {
  const hasWholesale = p.wholesale_enabled && p.wholesale_price != null;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-paper transition duration-300 hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-luxe sm:rounded-3xl">
      <div className="relative aspect-square overflow-hidden bg-white">
        {p.image_url ? (
          <Image
            src={p.image_url}
            alt={p.name}
            fill
            sizes="(min-width: 1280px) 300px, (min-width: 1024px) 25vw, 50vw"
            className="object-contain p-3 transition duration-500 group-hover:scale-[1.04] sm:p-5"
          />
        ) : (
          <div className="font-display flex h-full items-center justify-center text-5xl text-gold/40">
            {p.name.charAt(0)}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col border-t border-line p-3.5 sm:p-5">
        <h3 className="font-display text-lg font-semibold leading-snug text-ink sm:text-[1.4rem]">{p.name}</h3>

        <dl className="mt-3 space-y-1.5 text-sm sm:mt-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2">
            <dt className="eyebrow text-muted">MRP</dt>
            <dd className="text-muted">{formatPrice(p.mrp)}</dd>
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
