"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteProduct, setAvailability, setWholesale } from "@/app/admin/actions";
import { formatPrice, type Category, type Product } from "@/lib/types";
import { Switch } from "./Switch";

type Overrides = Record<string, Partial<Pick<Product, "is_available" | "wholesale_enabled">>>;

export function ProductTable({ categories, products }: { categories: Category[]; products: Product[] }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [overrides, setOverrides] = useState<Overrides>({});
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const categoryName = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const q = query.trim().toLowerCase();
  const rows = products
    .map((p) => ({ ...p, ...overrides[p.id] }))
    .filter((p) => (filter === "all" || p.category_id === filter) && (!q || p.name.toLowerCase().includes(q)));

  function toggle(p: Product, field: "is_available" | "wholesale_enabled", value: boolean) {
    setError(null);
    setOverrides((o) => ({ ...o, [p.id]: { ...o[p.id], [field]: value } }));
    startTransition(async () => {
      const res = field === "is_available" ? await setAvailability(p.id, value) : await setWholesale(p.id, value);
      if (res?.error) {
        setError(res.error);
        setOverrides((o) => ({ ...o, [p.id]: { ...o[p.id], [field]: !value } }));
      }
    });
  }

  function remove(p: Product) {
    if (!confirm(`Delete “${p.name}”? This cannot be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteProduct(p.id);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {[{ id: "all", name: "All" }, ...categories].map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${
                filter === c.id ? "border-forest bg-forest text-paper" : "border-line bg-paper text-muted hover:text-ink"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          className="field md:max-w-xs"
        />
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-rose/10 px-4 py-3 text-sm text-rose">
          {error}
        </p>
      )}

      <div className="mt-5 overflow-hidden rounded-3xl border border-line bg-paper">
        <div className="eyebrow hidden grid-cols-[minmax(0,2.4fr)_0.8fr_0.8fr_1.5fr_0.8fr_auto] gap-4 border-b border-line bg-ivory/60 px-5 py-3.5 text-muted lg:grid">
          <span>Product</span>
          <span>MRP</span>
          <span>Member</span>
          <span>Wholesale</span>
          <span>Available</span>
          <span className="w-24" />
        </div>

        {rows.length === 0 && (
          <p className="px-5 py-16 text-center text-sm text-muted">
            {products.length === 0 ? "No products yet — add your first product." : "No products match."}
          </p>
        )}

        <ul className="divide-y divide-line">
          {rows.map((p) => {
            const wholesaleReady = p.wholesale_price != null && p.wholesale_min_qty != null;
            return (
              <li
                key={p.id}
                className={`grid gap-x-4 gap-y-2.5 px-5 py-4 transition lg:grid-cols-[minmax(0,2.4fr)_0.8fr_0.8fr_1.5fr_0.8fr_auto] lg:items-center ${
                  p.is_available ? "" : "bg-ivory/50"
                }`}
              >
                {/* product */}
                <div className="flex min-w-0 items-center gap-4">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-line bg-white">
                    {p.image_url && <Image src={p.image_url} alt="" fill sizes="56px" className="object-contain p-1" />}
                  </div>
                  <div className="min-w-0">
                    <p className={`truncate font-semibold ${p.is_available ? "text-ink" : "text-muted line-through"}`}>
                      {p.name}
                    </p>
                    <p className="text-xs text-muted">{categoryName[p.category_id]}</p>
                  </div>
                </div>

                <Cell label="MRP">{formatPrice(p.mrp)}</Cell>
                <Cell label="Member">
                  <span className="font-semibold text-forest">{formatPrice(p.member_price)}</span>
                </Cell>

                <Cell label="Wholesale">
                  {wholesaleReady ? (
                    <span className="flex items-center gap-3">
                      <Switch
                        tone="gold"
                        label={`Wholesale price for ${p.name}`}
                        checked={p.wholesale_enabled}
                        onChange={(v) => toggle(p, "wholesale_enabled", v)}
                      />
                      <span className={`text-xs leading-tight ${p.wholesale_enabled ? "text-gold-deep" : "text-muted"}`}>
                        {formatPrice(p.wholesale_price)}
                        <br />
                        min {p.wholesale_min_qty} pcs
                      </span>
                    </span>
                  ) : (
                    <Link href={`/admin/products/${p.id}`} className="text-xs text-muted underline-offset-4 hover:text-gold-deep hover:underline">
                      Not set — add
                    </Link>
                  )}
                </Cell>

                <Cell label="Available">
                  <Switch
                    label={`${p.name} visible on website`}
                    checked={p.is_available}
                    onChange={(v) => toggle(p, "is_available", v)}
                  />
                </Cell>

                <div className="flex justify-end gap-1 lg:w-24">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="rounded-full px-3 py-1.5 text-sm font-medium text-forest transition hover:bg-ivory"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => remove(p)}
                    className="rounded-full px-3 py-1.5 text-sm text-muted transition hover:bg-rose/10 hover:text-rose"
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm lg:block">
      <span className="eyebrow text-muted lg:hidden">{label}</span>
      <div>{children}</div>
    </div>
  );
}
