"use client";

import { useActionState, useMemo, useState } from "react";
import Image from "next/image";
import { placeDiwaliOrder } from "@/app/diwali/actions";
import { DIWALI_BOXES, validateIndianMobile } from "@/lib/diwali";
import { site, mapDirectionsUrl } from "@/lib/site";
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
  const isPhoneValid = validateIndianMobile(phone);

  // Today string for date limits
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [today]);

  // Generate 7 quick pickup dates
  const quickDates = useMemo(() => {
    const list: { dateStr: string; displayLabel: string; subLabel: string }[] = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const dayName = days[d.getDay()];
      const monthName = months[d.getMonth()];
      const dayNum = d.getDate();

      list.push({
        dateStr,
        displayLabel: i === 0 ? "Today (आज)" : i === 1 ? "Tomorrow (उद्या)" : `${dayName}, ${dayNum} ${monthName}`,
        subLabel: `${dayNum} ${monthName}`,
      });
    }
    return list;
  }, [today]);

  const [selectedDate, setSelectedDate] = useState<string>(quickDates[0]?.dateStr ?? todayStr);
  const [selectedSlot, setSelectedSlot] = useState<string>(site.pickupSlots[0]?.label ?? "Morning / सकाळ (10:00 AM – 1:00 PM)");

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
        `*Diwali Gift Box Pre-Order Confirmation*\n` +
          `Order ID: #${state.orderId?.slice(0, 8).toUpperCase()}\n` +
          `Customer: ${state.customerName}\n` +
          `Phone: ${state.customerPhone}\n` +
          `*Store Pickup Date:* ${state.pickupDate}\n` +
          `*Time Slot:* ${state.pickupSlot}\n\n` +
          `*Items:*\n${state.itemsSummary}\n\n` +
          `*Total Amount:* ₹${state.totalPrice}\n` +
          `*Store Address:* Shoppers Orbit, Pune\n\n` +
          `Please confirm my festive box pre-order. Thank you!`
      )
    : "";

  if (state?.ok) {
    return (
      <div className="rounded-3xl border border-gold/40 bg-paper p-6 text-center shadow-luxe sm:p-10">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-forest text-gold shadow-md">
          <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <span className="eyebrow mt-4 inline-block text-gold-deep">
          Pre-Order Confirmed • प्री-ऑर्डर नोंदवली
        </span>
        <h3 className="font-display mt-1 text-2xl font-bold text-forest sm:text-3xl">
          Thank You, {state.customerName}!
        </h3>
        <p className="mt-1 text-xs text-muted sm:text-sm">
          Order ID: <span className="font-mono font-bold text-ink">#{state.orderId?.slice(0, 8).toUpperCase()}</span>
        </p>

        {/* Pickup Highlight Box */}
        <div className="mx-auto my-5 max-w-md rounded-2xl border border-gold/40 bg-gold-soft/50 p-4 text-left shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-forest">
            <span className="text-base">📍</span>
            <span>Store Pickup Details • दुकानातून घेण्याची वेळ:</span>
          </div>
          <div className="mt-2 space-y-1 text-xs sm:text-sm">
            <p>
              <strong className="text-ink">Date (तारीख):</strong>{" "}
              <span className="font-bold text-forest">{state.pickupDate}</span>
            </p>
            <p>
              <strong className="text-ink">Time Slot (वेळ):</strong>{" "}
              <span className="font-semibold text-ink">{state.pickupSlot}</span>
            </p>
            <p className="text-[0.75rem] text-muted">
              <strong>Location:</strong> {site.address}
            </p>
          </div>
        </div>

        <div className="mx-auto my-4 max-w-md rounded-2xl border border-line bg-white/90 p-4 text-left shadow-2xs">
          <p className="eyebrow text-muted">Order Summary • एकूण तपशील</p>
          <pre className="mt-2 whitespace-pre-wrap font-sans text-xs text-ink sm:text-sm">
            {state.itemsSummary}
          </pre>
          <div className="mt-3 flex items-baseline justify-between border-t border-line pt-2">
            <span className="font-bold text-ink">Total Amount:</span>
            <span className="text-xl font-extrabold text-forest">{formatPrice(state.totalPrice)}</span>
          </div>
        </div>

        <p className="mx-auto max-w-md text-xs text-muted">
          Your boxes will be prepared fresh with top grade dry fruits and packed ready for pickup at Shoppers Orbit Pune.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappOrderMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-[#20ba5a] sm:w-auto"
          >
            <WhatsAppIcon /> Send Order on WhatsApp (व्हॉट्सअ‍ॅपवर पाठवा)
          </a>

          <a
            href={mapDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center rounded-full border border-line px-5 py-3 text-xs font-semibold text-forest transition hover:border-gold sm:w-auto"
          >
            📍 View Store on Google Maps
          </a>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-3xl border border-line/90 bg-paper p-5 shadow-luxe sm:p-8">
      {/* -------------------------------------------------------------
          STEP 1: SELECT BOX QUANTITIES
          ------------------------------------------------------------- */}
      <div className="border-b border-line pb-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="eyebrow text-gold-deep">Step 1 • बॉक्स निवडा</span>
            <h3 className="font-display mt-0.5 text-xl font-bold text-forest sm:text-2xl">
              Choose Box Quantities • बॉक्सची संख्या निवडा
            </h3>
          </div>
          <span className="rounded-full bg-gold-soft px-2.5 py-1 text-[0.68rem] font-bold text-gold-deep">
            {totalBoxes} selected
          </span>
        </div>
        <p className="mt-1 text-xs text-muted">
          All boxes are filled with premium grade Cashews, Almonds, Pistachios, Raisins & Walnuts.
        </p>
      </div>

      {/* 4 Box Type Selectors */}
      <div className="divide-y divide-line/70">
        {DIWALI_BOXES.map((box) => {
          const qty = quantities[box.id] ?? 0;
          return (
            <div key={box.id} className="flex flex-col gap-3.5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <input type="hidden" name={`qty_${box.id}`} value={qty} />

              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-line bg-white shadow-2xs sm:size-20">
                  <Image
                    src={box.image}
                    alt={box.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-forest/80 py-0.5 text-center text-[0.55rem] font-bold text-paper">
                    {box.totalWeight}g
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h4 className="font-display text-base font-bold text-ink sm:text-lg">
                      {box.shortTitle}
                    </h4>
                    {box.badge && (
                      <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[0.6rem] font-bold text-gold-deep">
                        {box.badge}
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 text-xs text-muted line-clamp-1">
                    {box.contents.join(" • ")}
                  </p>

                  <div className="mt-1 flex items-baseline gap-2 text-xs">
                    <span className="font-extrabold text-forest sm:text-base">{formatPrice(box.price)}</span>
                    <span className="text-muted text-[0.7rem]">per filled box (तयार भरलेला बॉक्स)</span>
                  </div>
                </div>
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0">
                <div className="flex items-center rounded-full border border-line bg-white p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => updateQty(box.id, -1)}
                    disabled={qty === 0}
                    className="flex size-8 items-center justify-center rounded-full text-base font-bold text-ink transition hover:bg-ivory disabled:opacity-30 cursor-pointer"
                  >
                    –
                  </button>
                  <span className="w-9 text-center text-xs font-bold text-ink">{qty}</span>
                  <button
                    type="button"
                    onClick={() => updateQty(box.id, 1)}
                    className="flex size-8 items-center justify-center rounded-full bg-forest text-base font-bold text-paper transition hover:bg-forest-2 cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <span className="w-20 text-right text-xs font-extrabold text-forest sm:text-sm">
                  {qty > 0 ? formatPrice(qty * box.price) : "₹0"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* -------------------------------------------------------------
          STEP 2: STORE PICKUP DATE & TIME
          ------------------------------------------------------------- */}
      <div className="mt-8 border-t border-line pt-6">
        <div className="border-b border-line/60 pb-3">
          <span className="eyebrow text-gold-deep">Step 2 • पिकअप तारीख व वेळ</span>
          <h4 className="font-display text-lg font-bold text-forest sm:text-xl">
            Select Store Pickup Date & Time • माल घेण्याची तारीख
          </h4>
          <p className="text-xs text-muted">
            Pick up your freshly packed gift boxes directly from our store at Shoppers Orbit, Pune.
          </p>
        </div>

        {/* Quick Date Buttons */}
        <div className="mt-4">
          <label className="eyebrow mb-2 block text-muted">
            Choose Pickup Date (तारीख निवडा) *
          </label>

          <input type="hidden" name="pickup_date" value={selectedDate} />

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-4">
            {quickDates.map((item) => {
              const isSelected = selectedDate === item.dateStr;
              return (
                <button
                  key={item.dateStr}
                  type="button"
                  onClick={() => setSelectedDate(item.dateStr)}
                  className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition cursor-pointer ${
                    isSelected
                      ? "border-forest bg-forest text-paper shadow-sm"
                      : "border-line bg-white text-ink hover:border-gold hover:bg-ivory/50"
                  }`}
                >
                  <span className="text-xs font-bold">{item.displayLabel}</span>
                  <span className={`text-[0.65rem] ${isSelected ? "text-gold-soft" : "text-muted"}`}>
                    {item.dateStr}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom Date Input for other dates */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-muted">Or pick another date (इतर तारीख):</span>
            <input
              type="date"
              min={todayStr}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink outline-none focus:border-gold"
            />
          </div>
        </div>

        {/* Time Slots */}
        <div className="mt-5">
          <label className="eyebrow mb-2 block text-muted">
            Select Pickup Time Slot (वेळ निवडा) *
          </label>
          <input type="hidden" name="pickup_slot" value={selectedSlot} />

          <div className="grid gap-2 sm:grid-cols-3">
            {site.pickupSlots.map((slot) => {
              const isSelected = selectedSlot === slot.label;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedSlot(slot.label)}
                  className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition cursor-pointer ${
                    isSelected
                      ? "border-forest bg-forest/10 ring-2 ring-forest text-forest font-bold"
                      : "border-line bg-white text-ink hover:border-gold"
                  }`}
                >
                  <span className="text-base">{slot.id.includes("morning") ? "🌅" : slot.id.includes("afternoon") ? "☀️" : "🌙"}</span>
                  <div className="text-xs">
                    <p className="font-bold">{slot.label}</p>
                    <p className="text-[0.65rem] text-muted">Store open 10am - 9pm</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          STEP 3: CUSTOMER CONTACT DETAILS
          ------------------------------------------------------------- */}
      <div className="mt-8 border-t border-line pt-6">
        <div className="border-b border-line/60 pb-3">
          <span className="eyebrow text-gold-deep">Step 3 • तुमची माहिती</span>
          <h4 className="font-display text-lg font-bold text-forest sm:text-xl">
            Customer Information • ग्राहकाची माहिती
          </h4>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="eyebrow mb-1.5 block text-muted" htmlFor="customer_name">
              Full Name (पूर्ण नाव) *
            </label>
            <input
              id="customer_name"
              name="customer_name"
              required
              placeholder="e.g. Ramesh Kulkarni / रमेश कुलकर्णी"
              className="field"
            />
          </div>

          <div>
            <label className="eyebrow mb-1.5 flex items-center justify-between text-muted" htmlFor="customer_phone">
              <span>Mobile Number (मोबाईल नंबर) *</span>
              {phone && (
                <span className={`text-[0.65rem] font-bold ${isPhoneValid ? "text-forest" : "text-rose"}`}>
                  {isPhoneValid ? "✓ Valid Number" : "10 Digits required"}
                </span>
              )}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">
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

        <div className="mt-4">
          <label className="eyebrow mb-1.5 block text-muted" htmlFor="notes">
            Special Requests / Corporate Message (ऐच्छिक संदेश)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            placeholder="e.g. Please pack in pink bell box, need corporate greeting card, etc."
            className="field text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* -------------------------------------------------------------
          LIVE ORDER SUMMARY
          ------------------------------------------------------------- */}
      <div className="my-6 rounded-2xl border border-gold/40 bg-gradient-to-r from-gold-soft/60 via-paper to-gold-soft/60 p-4 shadow-xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow text-gold-deep">Live Summary • एकूण निवड</p>
            <p className="text-sm font-bold text-ink">
              {totalBoxes} Box{totalBoxes === 1 ? "" : "es"} • Pickup: {selectedDate}
            </p>
            <p className="text-[0.7rem] text-muted">{selectedSlot}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="eyebrow text-gold-deep">Grand Total • एकूण रक्कम</p>
            <p className="text-2xl font-extrabold text-forest">{formatPrice(totalPrice)}</p>
          </div>
        </div>
      </div>

      {state?.error && (
        <p role="alert" className="mb-4 rounded-xl bg-rose/10 px-4 py-3 text-xs font-bold text-rose">
          ⚠️ {state.error}
        </p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={pending || totalBoxes === 0 || !isPhoneValid}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-forest py-4 text-xs font-bold uppercase tracking-wider text-paper shadow-luxe transition hover:bg-forest-2 active:scale-98 disabled:opacity-40 cursor-pointer sm:text-sm"
      >
        {pending ? (
          <span>Confirming Pre-Order… (नोंदवत आहे…)</span>
        ) : (
          <span>
            Confirm Pre-Order for {totalBoxes} Box{totalBoxes === 1 ? "" : "es"} ({formatPrice(totalPrice)}) →
          </span>
        )}
      </button>

      <p className="mt-2.5 text-center text-[0.68rem] text-muted">
        No online payment required. Pay directly upon pickup at our shop (Shoppers Orbit Pune).
      </p>
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
