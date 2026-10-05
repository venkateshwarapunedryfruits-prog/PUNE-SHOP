"use client";

import Link from "next/link";
import { startTransition, useActionState, useRef, useState } from "react";
import { saveProduct } from "@/app/admin/actions";
import type { Category, Product } from "@/lib/types";
import { Switch } from "./Switch";

const MAX_SIDE = 1400;

/** Shrinks a photo in the browser so uploads stay small and fast. */
async function compressImage(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.85));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    return file;
  }
}

export function ProductForm({ categories, product }: { categories: Category[]; product?: Product }) {
  const [state, action, pending] = useActionState(saveProduct, undefined);
  const [wholesale, setWholesale] = useState(product?.wholesale_enabled ?? false);
  const [available, setAvailable] = useState(product?.is_available ?? true);
  const [preview, setPreview] = useState<string | null>(product?.image_url ?? null);
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const picked = input.files?.[0];
    if (!picked) return;
    setProcessing(true);
    const small = await compressImage(picked);
    const dt = new DataTransfer();
    dt.items.add(small);
    input.files = dt.files; // the form now submits the compressed file
    setPreview(URL.createObjectURL(small));
    setProcessing(false);
  }

  return (
    <form
      onSubmit={(e) => {
        // submit manually so React does not clear the form when the server returns an error
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="mt-8 grid gap-8 lg:grid-cols-[340px_1fr]"
    >
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="current_image_url" value={product?.image_url ?? ""} />

      {/* Image */}
      <div>
        <span className="eyebrow mb-2 block text-muted">Product Image</span>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border border-dashed border-gold/50 bg-white transition hover:border-gold"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview
            <img src={preview} alt="Preview" className="size-full object-contain p-4" />
          ) : (
            <span className="text-center text-sm text-muted">
              <span className="font-display block text-4xl text-gold">+</span>
              Click to upload
            </span>
          )}
          {preview && (
            <span className="eyebrow absolute inset-x-0 bottom-0 bg-forest/85 py-3 text-paper opacity-0 transition group-hover:opacity-100">
              Change image
            </span>
          )}
          {processing && (
            <span className="absolute inset-0 flex items-center justify-center bg-paper/80 text-sm text-muted">Preparing…</span>
          )}
        </button>
        <input ref={fileRef} type="file" name="image" accept="image/*" onChange={onPickImage} className="hidden" />
        <p className="mt-2 text-xs text-muted">Square photos on a white background look best.</p>
      </div>

      {/* Details */}
      <div className="space-y-6 rounded-3xl border border-line bg-paper p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Product Name" className="sm:col-span-2">
            <input name="name" defaultValue={product?.name} required className="field" placeholder="e.g. Mogra Agarbatti" />
          </Field>
          <Field label="Category" className="sm:col-span-2">
            <select name="category_id" defaultValue={product?.category_id ?? ""} required className="field">
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="MRP (₹)">
            <input name="mrp" type="number" min="0" step="0.01" inputMode="decimal" defaultValue={product?.mrp} required className="field" />
          </Field>
          <Field label="Member Price (₹)">
            <input
              name="member_price"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              defaultValue={product?.member_price}
              required
              className="field"
            />
          </Field>
        </div>

        {/* Wholesale */}
        <div className={`rounded-2xl border p-5 transition ${wholesale ? "border-gold/40 bg-gold-soft/40" : "border-line"}`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-ink">Wholesale Price</p>
              <p className="text-xs text-muted">Show a bulk price with a minimum order quantity.</p>
            </div>
            <Switch tone="gold" name="wholesale_enabled" label="Wholesale price" checked={wholesale} onChange={setWholesale} />
          </div>
          {/* kept in the DOM when off so values are remembered */}
          <div className={`mt-5 grid gap-5 sm:grid-cols-2 ${wholesale ? "" : "hidden"}`}>
            <Field label="Wholesale Price (₹)">
              <input
                name="wholesale_price"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                defaultValue={product?.wholesale_price ?? ""}
                required={wholesale}
                className="field"
              />
            </Field>
            <Field label="Minimum Quantity">
              <input
                name="wholesale_min_qty"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                defaultValue={product?.wholesale_min_qty ?? ""}
                required={wholesale}
                className="field"
                placeholder="e.g. 12"
              />
            </Field>
          </div>
        </div>

        {/* Availability */}
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-line p-5">
          <div>
            <p className="font-semibold text-ink">Available</p>
            <p className="text-xs text-muted">When off, this product is hidden from the website.</p>
          </div>
          <Switch name="is_available" label="Available on website" checked={available} onChange={setAvailable} />
        </div>

        {state?.error && (
          <p role="alert" className="rounded-xl bg-rose/10 px-4 py-3 text-sm text-rose">
            {state.error}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-line pt-6">
          <Link href="/admin" className="eyebrow rounded-full px-5 py-3.5 text-muted transition hover:text-ink">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={pending || processing}
            className="eyebrow rounded-full bg-forest px-8 py-3.5 text-paper transition hover:bg-forest-2 disabled:opacity-60"
          >
            {pending ? "Saving…" : product ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="eyebrow mb-2 block text-muted">{label}</span>
      {children}
    </label>
  );
}
