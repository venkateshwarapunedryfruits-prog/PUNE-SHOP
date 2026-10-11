"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { placeDiwaliOrder, type OrderFormState } from "@/app/diwali/actions";
import { WhatsAppIcon } from "@/components/diwali/WhatsAppIcon";
import { DIWALI_BOXES, validateIndianMobile, type DiwaliBoxVariant } from "@/lib/diwali";
import { mapDirectionsUrl, site, whatsappNumber } from "@/lib/site";
import { formatPrice } from "@/lib/types";

const MAX_QTY = 99;

/** Product cards with quantity controls, the order form, and the confirmation that replaces both. */
export function DiwaliOrder() {
  const [state, formAction, pending] = useActionState(placeDiwaliOrder, undefined);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  // Controlled so a validation error from the server doesn't wipe what the customer typed
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const isPhoneValid = validateIndianMobile(phone);

  // The floating total bar is only useful while the customer is still browsing boxes
  const orderRef = useRef<HTMLElement>(null);
  const [reachedOrder, setReachedOrder] = useState(false);
  useEffect(() => {
    const el = orderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) =>
      setReachedOrder(entry.isIntersecting || entry.boundingClientRect.top < 0)
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const doneRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state?.ok) doneRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [state?.ok]);

  function updateQty(id: string, delta: number) {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.min(MAX_QTY, Math.max(0, (prev[id] ?? 0) + delta)),
    }));
  }

  const selected = DIWALI_BOXES.filter((b) => (quantities[b.id] ?? 0) > 0);
  const totalBoxes = selected.reduce((sum, b) => sum + quantities[b.id], 0);
  const totalPrice = selected.reduce((sum, b) => sum + quantities[b.id] * b.price, 0);

  if (state?.ok) {
    return (
      <div ref={doneRef} className="scroll-mt-24">
        <OrderConfirmation state={state} />
      </div>
    );
  }

  return (
    <>
      <section id="boxes" aria-label="Gift boxes" className="scroll-mt-20">
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
          {DIWALI_BOXES.map((box, i) => (
            <BoxCard
              key={box.id}
              box={box}
              qty={quantities[box.id] ?? 0}
              onChange={(delta) => updateQty(box.id, delta)}
              eager={i < 2}
            />
          ))}
        </div>
      </section>

      <section
        id="order"
        ref={orderRef}
        aria-labelledby="order-heading"
        className="mt-12 scroll-mt-20 sm:mt-16"
      >
        <div className="mx-auto max-w-2xl rounded-3xl border border-line bg-paper p-5 shadow-luxe sm:p-8">
          <h2 id="order-heading" className="font-display text-2xl font-bold text-forest sm:text-3xl">
            Place Your Order • ऑर्डर द्या
          </h2>
          <p className="mt-1 text-sm text-muted">
            Collect from our shop at {site.address}
            <br />
            {site.timings}
          </p>

          {/* Selected boxes */}
          <div className="mt-5 rounded-2xl border border-line bg-ivory/60 p-4">
            {selected.length === 0 ? (
              <p className="py-2 text-center text-sm text-muted">
                No boxes added yet • अजून बॉक्स निवडलेला नाही
                <a href="#boxes" className="mt-1.5 block font-bold text-forest underline underline-offset-4">
                  ↑ Choose boxes above • वरून बॉक्स निवडा
                </a>
              </p>
            ) : (
              <>
                <ul className="divide-y divide-line/70">
                  {selected.map((box) => {
                    const qty = quantities[box.id];
                    return (
                      <li key={box.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                        <div className="min-w-0">
                          <p className="font-semibold text-ink">{box.shortTitle}</p>
                          <p className="text-xs text-muted">
                            {qty} × {formatPrice(box.price)} = {formatPrice(qty * box.price)}
                          </p>
                        </div>
                        <Stepper
                          qty={qty}
                          label={box.shortTitle}
                          onChange={(delta) => updateQty(box.id, delta)}
                          size="sm"
                        />
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-1 flex items-baseline justify-between border-t border-line pt-3">
                  <span className="font-semibold text-ink">
                    Total • एकूण{" "}
                    <span className="text-sm font-normal text-muted">
                      ({totalBoxes} {totalBoxes === 1 ? "box" : "boxes"})
                    </span>
                  </span>
                  <span className="text-2xl font-extrabold text-forest">{formatPrice(totalPrice)}</span>
                </div>
              </>
            )}
          </div>

          <form action={formAction} className="mt-6 space-y-4">
            {DIWALI_BOXES.map((b) => (
              <input key={b.id} type="hidden" name={`qty_${b.id}`} value={quantities[b.id] ?? 0} />
            ))}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="customer_name" className="mb-1.5 block text-sm font-semibold text-ink">
                  Your Name • तुमचे नाव <span className="text-rose">*</span>
                </label>
                <input
                  id="customer_name"
                  name="customer_name"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="field"
                />
              </div>

              <div>
                <label htmlFor="customer_phone" className="mb-1.5 block text-sm font-semibold text-ink">
                  Mobile Number • मोबाईल नंबर <span className="text-rose">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted">
                    +91
                  </span>
                  <input
                    id="customer_phone"
                    name="customer_phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    required
                    pattern="[6-9][0-9]{9}"
                    title="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(normalizePhone(e.target.value))}
                    aria-describedby="phone-hint"
                    aria-invalid={phone.length === 10 && !isPhoneValid}
                    className={`field pl-12 ${phone.length === 10 && !isPhoneValid ? "border-rose" : ""}`}
                  />
                </div>
                <p id="phone-hint" className="mt-1 text-xs text-muted">
                  {phone.length === 10 && !isPhoneValid ? (
                    <span className="font-semibold text-rose">Please check the number • नंबर तपासा</span>
                  ) : (
                    `${phone.length}/10 digits`
                  )}
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="mb-1.5 block text-sm font-semibold text-ink">
                Note <span className="font-normal text-muted">(optional • ऐच्छिक)</span>
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="field"
              />
            </div>

            {state?.error && (
              <p role="alert" className="rounded-xl bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending || totalBoxes === 0}
              className="w-full cursor-pointer rounded-full bg-forest py-4 text-base font-bold text-paper shadow-luxe transition hover:bg-forest-2 active:scale-98 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pending
                ? "Placing order… • नोंदवत आहे…"
                : totalBoxes === 0
                  ? "Add a box to order • बॉक्स निवडा"
                  : `Place Order • ऑर्डर करा — ${formatPrice(totalPrice)}`}
            </button>

            <p className="text-center text-xs text-muted">
              No online payment. Pay at the shop when you collect. • पैसे दुकानात द्या.
            </p>
          </form>
        </div>
      </section>

      {totalBoxes > 0 && !reachedOrder && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 shadow-[0_-8px_24px_-12px_rgb(29_27_22/0.25)] backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
            <div>
              <p className="text-xs font-semibold text-muted">
                {totalBoxes} {totalBoxes === 1 ? "box" : "boxes"} • {totalBoxes} बॉक्स
              </p>
              <p className="text-xl font-extrabold leading-tight text-forest">{formatPrice(totalPrice)}</p>
            </div>
            <a
              href="#order"
              className="rounded-full bg-forest px-6 py-3 text-sm font-bold text-paper shadow-sm transition hover:bg-forest-2"
            >
              Place Order • ऑर्डर करा →
            </a>
          </div>
        </div>
      )}
    </>
  );
}

function BoxCard({
  box,
  qty,
  onChange,
  eager,
}: {
  box: DiwaliBoxVariant;
  qty: number;
  onChange: (delta: number) => void;
  eager: boolean;
}) {
  return (
    <article
      className={`flex flex-col overflow-hidden rounded-2xl border bg-paper shadow-xs transition ${
        qty > 0 ? "border-forest ring-1 ring-forest" : "border-line"
      }`}
    >
      <div className="relative aspect-video bg-ivory">
        <Image
          src={box.image}
          alt={`${box.shortTitle} gift box: ${box.contents.join(", ")}`}
          fill
          sizes="(min-width: 1152px) 560px, (min-width: 640px) 50vw, 100vw"
          loading={eager ? "eager" : "lazy"}
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-bold leading-tight text-ink sm:text-2xl">{box.shortTitle}</h3>
            <p className="mt-0.5 text-sm text-muted">
              {box.totalWeight}g total • एकूण {box.totalWeight} ग्रॅम
            </p>
          </div>
          <p className="shrink-0 text-2xl font-extrabold text-forest sm:text-3xl">{formatPrice(box.price)}</p>
        </div>

        <ul aria-label="Inside the box" className="mt-3 flex flex-wrap gap-1.5">
          {box.contents.map((item) => (
            <li key={item} className="rounded-full border border-line bg-ivory px-2.5 py-1 text-[0.8rem] font-medium text-ink">
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-4">
          {qty === 0 ? (
            <button
              type="button"
              onClick={() => onChange(1)}
              className="w-full cursor-pointer rounded-full bg-forest py-3 text-sm font-bold text-paper transition hover:bg-forest-2 active:scale-98"
            >
              + Add to Order • जोडा
            </button>
          ) : (
            <div className="flex items-center justify-between rounded-full bg-gold-soft p-1.5">
              <Stepper qty={qty} label={box.shortTitle} onChange={onChange} />
              <span className="pr-3 text-base font-bold text-forest">{formatPrice(qty * box.price)}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function Stepper({
  qty,
  label,
  onChange,
  size = "md",
}: {
  qty: number;
  label: string;
  onChange: (delta: number) => void;
  size?: "sm" | "md";
}) {
  const btn = size === "sm" ? "size-8 text-base" : "size-10 text-lg";
  return (
    <div role="group" aria-label={`Quantity of ${label}`} className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(-1)}
        aria-label={`Remove one ${label}`}
        className={`${btn} flex cursor-pointer items-center justify-center rounded-full border border-line bg-paper font-bold text-ink transition hover:border-gold`}
      >
        −
      </button>
      <span aria-live="polite" className="min-w-8 text-center text-base font-bold tabular-nums text-ink">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => onChange(1)}
        disabled={qty >= MAX_QTY}
        aria-label={`Add one ${label}`}
        className={`${btn} flex cursor-pointer items-center justify-center rounded-full bg-forest font-bold text-paper transition hover:bg-forest-2 disabled:opacity-40`}
      >
        +
      </button>
    </div>
  );
}

function OrderConfirmation({ state }: { state: NonNullable<OrderFormState> }) {
  const saved = state.saved === true;
  const shortId = state.orderId?.slice(0, 8).toUpperCase();

  const message = [
    "*Diwali Gift Box Order*",
    shortId ? `Order no: #${shortId}` : null,
    `Name: ${state.customerName}`,
    `Mobile: ${state.customerPhone}`,
    "",
    state.itemsSummary ?? "",
    `*Total: ${formatPrice(state.totalPrice)}*`,
    state.notes ? `Note: ${state.notes}` : null,
    "",
    `Pickup: ${site.address}`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-gold/40 bg-paper p-6 text-center shadow-luxe sm:p-10">
      <div
        className={`mx-auto flex size-14 items-center justify-center rounded-full ${
          saved ? "bg-forest text-gold-soft" : "bg-[#25D366] text-white"
        }`}
      >
        {saved ? (
          <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <WhatsAppIcon className="size-7" />
        )}
      </div>

      {saved ? (
        <>
          <p className="eyebrow mt-4 text-gold-deep">Order received • ऑर्डर मिळाली</p>
          <h2 className="font-display mt-1 text-2xl font-bold text-forest sm:text-3xl">
            Thank you, {state.customerName}!
          </h2>
          <p className="mt-2 text-sm text-muted">
            Order no. <span className="font-mono font-bold text-ink">#{shortId}</span>. Please mention it when you
            collect. • दुकानात हा नंबर सांगा.
          </p>
        </>
      ) : (
        <>
          <p className="eyebrow mt-4 text-rose">One more step • अजून एक पायरी</p>
          <h2 className="font-display mt-1 text-2xl font-bold text-forest sm:text-3xl">
            Send your order on WhatsApp
          </h2>
          <p className="mt-2 text-sm text-muted">
            Your order has not reached us yet. Tap the green button below to send it. • ऑर्डर पाठवण्यासाठी खालील
            बटण दाबा.
          </p>
        </>
      )}

      <div className="mx-auto mt-6 max-w-md rounded-2xl border border-line bg-ivory/60 p-4 text-left">
        <ul className="space-y-1.5 text-sm text-ink">
          {state.items?.map((item) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span>
                {item.quantity} × {DIWALI_BOXES.find((b) => b.id === item.id)?.shortTitle ?? item.name}
              </span>
              <span className="font-semibold">{formatPrice(item.subtotal)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
          <span className="font-semibold text-ink">Total • एकूण</span>
          <span className="text-2xl font-extrabold text-forest">{formatPrice(state.totalPrice)}</span>
        </div>
        <p className="mt-3 border-t border-line pt-3 text-xs text-muted">
          📍 Collect from {site.address}
          <br />
          {site.timings}
        </p>
      </div>

      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a
          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#20ba5a] sm:w-auto"
        >
          <WhatsAppIcon /> Send on WhatsApp • व्हॉट्सअ‍ॅप
        </a>
        <a
          href={mapDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center rounded-full border border-line px-6 py-3.5 text-sm font-semibold text-forest transition hover:border-gold sm:w-auto"
        >
          📍 Directions • मार्ग
        </a>
      </div>
    </div>
  );
}

/** Keeps 10 digits, dropping a +91 / 0 prefix that phone autofill may add. */
function normalizePhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits.slice(0, 10);
}
