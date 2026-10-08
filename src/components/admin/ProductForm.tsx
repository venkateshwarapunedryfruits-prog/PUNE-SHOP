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
  
  // Image toggle (is_image)
  const [isImageEnabled, setIsImageEnabled] = useState(
    product ? (product.is_image !== false) : true
  );

  // Existing images array
  const initialImages = (product?.images && product.images.length > 0)
    ? product.images
    : (product?.image_url ? [product.image_url] : []);
  const [existingImages, setExistingImages] = useState<string[]>(initialImages);

  const [processing, setProcessing] = useState(false);
  const [customUrls, setCustomUrls] = useState("");
  const multiFileRef = useRef<HTMLInputElement>(null);

  // Staged newly compressed files
  const [newFiles, setNewFiles] = useState<{ file: File; preview: string }[]>([]);

  async function onPickNewImages(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const pickedFiles = Array.from(input.files ?? []);
    if (pickedFiles.length === 0) return;

    setProcessing(true);
    const compressedList: { file: File; preview: string }[] = [];

    for (const f of pickedFiles) {
      const small = await compressImage(f);
      compressedList.push({ file: small, preview: URL.createObjectURL(small) });
    }

    setNewFiles((prev) => [...prev, ...compressedList]);
    setProcessing(false);
    // Reset input so same files can be re-selected if desired
    input.value = "";
  }

  function removeExistingImage(index: number) {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  }

  function removeNewFile(index: number) {
    setNewFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  function setExistingAsPrimary(index: number) {
    setExistingImages((prev) => {
      const item = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [item, ...rest];
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        
        // Pass retained existing images as JSON
        data.set("existing_images", JSON.stringify(existingImages));
        data.set("custom_image_urls", customUrls);

        // Attach staged new files
        data.delete("new_images");
        for (const item of newFiles) {
          data.append("new_images", item.file);
        }

        // Maintain is_image switch state
        if (isImageEnabled) {
          data.set("is_image", "on");
        } else {
          data.delete("is_image");
        }

        startTransition(() => action(data));
      }}
      className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]"
    >
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="current_image_url" value={existingImages[0] ?? ""} />

      {/* Media & Display Options */}
      <div className="space-y-5">
        {/* Image Display Mode Toggle */}
        <div className="rounded-2xl border border-line bg-paper p-4.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-ink">Show Product Image</p>
              <p className="text-xs text-muted">
                {isImageEnabled
                  ? "Shows product photo(s) on the store."
                  : "Table mode: shows compact rate card without photo placeholder."}
              </p>
            </div>
            <Switch
              tone="gold"
              name="is_image"
              label="Enable product image"
              checked={isImageEnabled}
              onChange={setIsImageEnabled}
            />
          </div>
        </div>

        {/* Image Gallery Upload & Management */}
        <div className={`space-y-4 rounded-3xl border border-line bg-paper p-5 transition ${isImageEnabled ? "" : "opacity-50"}`}>
          <div className="flex items-center justify-between">
            <span className="eyebrow block text-muted">Product Photos</span>
            <span className="text-xs text-muted">
              {existingImages.length + newFiles.length} photo{existingImages.length + newFiles.length === 1 ? "" : "s"}
            </span>
          </div>

          {!isImageEnabled && (
            <div className="rounded-xl border border-gold/30 bg-gold-soft/50 p-3 text-xs text-gold-deep">
              ℹ️ <strong>Image is turned OFF.</strong> This product will show a compact rate table on the catalog without an empty image box.
            </div>
          )}

          {/* Primary / Active photo preview */}
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-line bg-white">
            {existingImages.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={existingImages[0]}
                alt="Primary Preview"
                className="size-full object-contain p-4"
              />
            ) : newFiles.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={newFiles[0].preview}
                alt="New upload preview"
                className="size-full object-contain p-4"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                <span className="font-display text-4xl text-gold/60">+</span>
                <span className="mt-1 text-sm text-muted">No photo uploaded</span>
              </div>
            )}
            <span className="eyebrow absolute left-2.5 top-2.5 rounded-full bg-forest/80 px-2.5 py-0.5 text-paper backdrop-blur-xs">
              Primary Photo
            </span>
          </div>

          {/* Multiple thumbnails strip */}
          {(existingImages.length > 1 || newFiles.length > 0) && (
            <div>
              <p className="eyebrow mb-2 text-xs text-muted">All Photos (Click to make primary)</p>
              <div className="flex flex-wrap gap-2">
                {/* Existing remote images */}
                {existingImages.map((url, idx) => (
                  <div
                    key={url + idx}
                    className={`group relative size-16 overflow-hidden rounded-xl border bg-white p-1 transition ${
                      idx === 0 ? "border-gold ring-2 ring-gold/20" : "border-line"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      onClick={() => setExistingAsPrimary(idx)}
                      className="size-full cursor-pointer object-contain"
                    />
                    <button
                      type="button"
                      title="Remove photo"
                      onClick={() => removeExistingImage(idx)}
                      className="absolute right-0.5 top-0.5 rounded-full bg-rose p-0.5 text-paper opacity-0 transition group-hover:opacity-100"
                    >
                      <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth={3}>
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* Staged new files */}
                {newFiles.map((item, idx) => (
                  <div
                    key={item.preview}
                    className="group relative size-16 overflow-hidden rounded-xl border border-forest/40 bg-white p-1"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.preview} alt="" className="size-full object-contain" />
                    <span className="absolute bottom-0.5 left-0.5 rounded bg-forest px-1 text-[0.55rem] font-bold text-paper">
                      New
                    </span>
                    <button
                      type="button"
                      title="Remove photo"
                      onClick={() => removeNewFile(idx)}
                      className="absolute right-0.5 top-0.5 rounded-full bg-rose p-0.5 text-paper opacity-0 transition group-hover:opacity-100"
                    >
                      <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth={3}>
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            type="button"
            onClick={() => multiFileRef.current?.click()}
            disabled={processing}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gold/70 bg-white py-3 text-xs font-semibold uppercase tracking-wider text-forest transition hover:bg-gold-soft/30 active:scale-98 disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" className="size-4 text-gold" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {processing ? "Compressing Photos…" : "+ Add Photos (Multi-select)"}
          </button>
          <input
            ref={multiFileRef}
            type="file"
            multiple
            accept="image/*"
            onChange={onPickNewImages}
            className="hidden"
          />

          {/* Optional Cloudinary / CDN Link Input */}
          <details className="text-xs text-muted">
            <summary className="cursor-pointer font-medium hover:text-ink">
              Add photos via Web URLs (Cloudinary, etc.)
            </summary>
            <div className="mt-2 space-y-1">
              <textarea
                value={customUrls}
                onChange={(e) => setCustomUrls(e.target.value)}
                rows={2}
                placeholder="Paste image URLs separated by comma or new lines"
                className="field text-xs font-mono"
              />
              <p className="text-[0.68rem] text-muted">
                Tip: Multiple URLs can be separated by commas or new lines.
              </p>
            </div>
          </details>
        </div>
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
