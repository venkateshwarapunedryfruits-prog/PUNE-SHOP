"use client";

import { useActionState, useState } from "react";
import { placeDiwaliOrder } from "@/app/diwali/actions";
import { DIWALI_BOXES, validateIndianMobile } from "@/lib/diwali";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/types";

export function DiwaliOrderForm({ initialBoxId }: { initialBoxId?: string }) {
  const [state, formAction, pending] = useActionState(placeDiwaliOrder, undefined);

  // Quantities for each of the 4 boxes
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const b of DIWALI_BOXES) {
      initial[b.id] = b.id === (initialBoxId ?? "4-box-100g") ? 1 : 0;
    }
    return initial;
  });

  const [phone, setPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("pickup");

  const isPhoneValid = validateIndianMobile(phone);

  function updateQty(id: string, delta: number) {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] ?? 0) + delta),
    }));
  }

  // Calculate live total
  const totalBoxes = Object.values(quantities).reduce((sum, q) => sum + q, 0);
  const totalPrice = DIWALI_BOXES.reduce(
    (sum, b) => sum + (quantities[b.id] ?? 0) * b.price,
    0
  );

  // WhatsApp link if order is placed
  const whatsappNumber = site.phone.replace(/\D/g, "");
  const whatsappOrderMessage = state?.ok
    ? encodeURIComponent(
        `*Diwali Gift Box Order Confirmation*\n` +
          `Order ID: #${state.orderId?.slice(0, 8).toUpperCase()}\n` +
          `Customer: ${state.customerName}\n` +
          `Phone: ${state.customerPhone}\n\n` +
          `*Items:*\n${state.itemsSummary}\n\n` +
          `*Total Amount:* ₹${state.totalPrice}\n` +
          `Delivery: ${deliveryType === "pickup" ? "Store Pickup (Shoppers Orbit)" : "Home Delivery"}\n\n` +
          `Please confirm my order. Thank you!`
      )
    : "";

  if (state?.ok) {
    return (
      <div className="rounded-3xl border border-gold/40 bg-paper p-6 text-center shadow-luxe sm:p-10">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-forest text-gold">
          <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <span className="eyebrow mt-4 inline-block text-gold-deep">Order Placed Successfully</span>
        <h3 className="font-display mt-1 text-2xl font-bold text-forest sm:text-3xl">
          Thank you, {state.customerName}!
        </h3>
        <p className="mt-2 text-xs text-muted sm:text-sm">
          Order ID: <span className="font-mono font-bold text-ink">#{state.orderId?.slice(0, 8).toUpperCase()}</span>
        </p>

        <div className="mx-auto my-6 max-w-md rounded-2xl border border-line bg-white/90 p-4 text-left shadow-2xs">
          <p className="eyebrow text-muted">Order Summary</p>
          <pre className="mt-2 whitespace-pre-wrap font-sans text-xs text-ink sm:text-sm">
            {state.itemsSummary}
          </pre>
          <div className="mt-3 flex items-baseline justify-between border-t border-line pt-2">
            <span className="font-bold text-ink">Total Payable:</span>
            <span className="text-lg font-extrabold text-forest">{formatPrice(state.totalPrice)}</span>
          </div>
        </div>

        <p className="text-xs text-muted">
          Our team at Venkateshwara Shop will prepare your gift boxes freshly with premium quality dry fruits.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappOrderMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-[#20ba5a] sm:w-auto"
          >
            <WhatsAppIcon /> Send Order on WhatsApp
          </a>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex w-full items-center justify-center rounded-full border border-line px-5 py-3 text-xs font-semibold text-muted transition hover:text-ink sm:w-auto"
          >
            Place Another Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-3xl border border-line/90 bg-paper p-5 shadow-luxe sm:p-8">
      <div className="border-b border-line pb-4">
        <span className="eyebrow text-gold-deep">Step 1 • Choose Box Quantities</span>
        <h3 className="font-display mt-0.5 text-xl font-bold text-forest sm:text-2xl">
          Select Your Gift Boxes
        </h3>
        <p className="text-xs text-muted">You can customize any quantity for each box variant.</p>
      </div>

      {/* 4 Box Type Selectors */}
      <div className="divide-y divide-line/70">
        {DIWALI_BOXES.map((box) => {
          const qty = quantities[box.id] ?? 0;
          return (
            <div key={box.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <input type="hidden" name={`qty_${box.id}`} value={qty} />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-display text-base font-bold text-ink sm:text-lg">
                    {box.name}
                  </h4>
                  {box.badge && (
                    <span className="rounded-full bg-gold-soft px-2 py-0.2 text-[0.62rem] font-bold text-gold-deep">
                      {box.badge}
                    </span>
                  )}
                </div>

                <p className="mt-0.5 text-xs text-muted">{box.contents.join(" • ")}</p>

                <div className="mt-1 text-xs">
                  <span className="font-bold text-forest sm:text-sm">{formatPrice(box.price)}</span>
                  <span className="text-muted"> / box ({box.totalWeight}g dry fruits)</span>
                </div>
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-full border border-line bg-white p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => updateQty(box.id, -1)}
                    disabled={qty === 0}
                    className="flex size-7 items-center justify-center rounded-full text-sm font-bold text-ink transition hover:bg-ivory disabled:opacity-30"
                  >
                    –
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-ink">{qty}</span>
                  <button
                    type="button"
                    onClick={() => updateQty(box.id, 1)}
                    className="flex size-7 items-center justify-center rounded-full bg-forest text-sm font-bold text-paper transition hover:bg-forest-2"
                  >
                    +
                  </button>
                </div>

                <span className="w-18 text-right text-xs font-bold text-ink sm:text-sm">
                  {qty > 0 ? formatPrice(qty * box.price) : "₹0"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Total Highlight */}
      <div className="my-5 flex items-center justify-between rounded-2xl border border-gold/30 bg-gold-soft/50 p-4">
        <div>
          <p className="eyebrow text-gold-deep">Total Boxes</p>
          <p className="text-sm font-bold text-ink">{totalBoxes} box{totalBoxes === 1 ? "" : "es"}</p>
        </div>
        <div className="text-right">
          <p className="eyebrow text-gold-deep">Grand Total</p>
          <p className="text-xl font-extrabold text-forest sm:text-2xl">{formatPrice(totalPrice)}</p>
        </div>
      </div>

      {/* Customer Contact Details */}
      <div className="mt-6 space-y-4 border-t border-line pt-5">
        <div className="border-b border-line/60 pb-3">
          <span className="eyebrow text-gold-deep">Step 2 • Customer Information</span>
          <h4 className="font-display text-lg font-bold text-forest">Your Contact & Delivery</h4>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="eyebrow mb-1.5 block text-muted" htmlFor="customer_name">
              Full Name *
            </label>
            <input
              id="customer_name"
              name="customer_name"
              required
              placeholder="e.g. Ramesh Kulkarni"
              className="field"
            />
          </div>

          <div>
            <label className="eyebrow mb-1.5 flex items-center justify-between text-muted" htmlFor="customer_phone">
              <span>Mobile Number (10 Digits) *</span>
              {phone && (
                <span className={`text-[0.65rem] font-bold ${isPhoneValid ? "text-forest" : "text-rose"}`}>
                  {isPhoneValid ? "✓ Valid Number" : "10 Digits required"}
                </span>
              )}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">
                +91
              </span>
              <input
                id="customer_phone"
                name="customer_phone"
                type="tel"
                maxLength={10}
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="9876543210"
                className={`field pl-12 ${phone && !isPhoneValid ? "border-rose focus:border-rose focus:ring-rose/10" : ""}`}
              />
            </div>
          </div>
        </div>

        {/* Delivery Mode */}
        <div>
          <span className="eyebrow mb-1.5 block text-muted">Delivery Option</span>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition ${
                deliveryType === "pickup"
                  ? "border-forest bg-forest text-paper"
                  : "border-line bg-white text-muted hover:text-ink"
              }`}
            >
              <input
                type="radio"
                name="delivery_type"
                value="pickup"
                checked={deliveryType === "pickup"}
                onChange={() => setDeliveryType("pickup")}
                className="hidden"
              />
              <span>🏬 Store Pickup (Shoppers Orbit)</span>
            </label>

            <label
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition ${
                deliveryType === "delivery"
                  ? "border-forest bg-forest text-paper"
                  : "border-line bg-white text-muted hover:text-ink"
              }`}
            >
              <input
                type="radio"
                name="delivery_type"
                value="delivery"
                checked={deliveryType === "delivery"}
                onChange={() => setDeliveryType("delivery")}
                className="hidden"
              />
              <span>🚚 Home Delivery (Pune)</span>
            </label>
          </div>
        </div>

        {deliveryType === "delivery" && (
          <div>
            <label className="eyebrow mb-1.5 block text-muted" htmlFor="address">
              Delivery Address in Pune *
            </label>
            <textarea
              id="address"
              name="address"
              rows={2}
              required
              placeholder="Flat no, Building name, Area / Landmark, Pune"
              className="field text-xs sm:text-sm"
            />
          </div>
        )}

        <div>
          <label className="eyebrow mb-1.5 block text-muted" htmlFor="notes">
            Special Requests / Corporate Message (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            placeholder="e.g. Please pack by 25th Oct, corporate greeting card required, etc."
            className="field text-xs sm:text-sm"
          />
        </div>
      </div>

      {state?.error && (
        <p role="alert" className="mt-4 rounded-xl bg-rose/10 px-4 py-3 text-xs font-medium text-rose">
          {state.error}
        </p>
      )}

      {/* Submit Button */}
      <div className="mt-6 border-t border-line pt-4">
        <button
          type="submit"
          disabled={pending || totalBoxes === 0 || !isPhoneValid}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-forest py-3.5 text-xs font-bold uppercase tracking-wider text-paper shadow-luxe transition hover:bg-forest-2 active:scale-98 disabled:opacity-50 cursor-pointer sm:text-sm"
        >
          {pending ? (
            <span>Placing Order…</span>
          ) : (
            <span>
              Confirm Order for {totalBoxes} Box{totalBoxes === 1 ? "" : "es"} ({formatPrice(totalPrice)}) →
            </span>
          )}
        </button>
        <p className="mt-2 text-center text-[0.68rem] text-muted">
          Payment on delivery or store pickup. We verify every order immediately.
        </p>
      </div>
    </form>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}
