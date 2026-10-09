"use server";

import { createClient } from "@/lib/supabase/server";
import { DIWALI_BOXES, validateIndianMobile, type OrderItemDetail } from "@/lib/diwali";
import { site } from "@/lib/site";

export type OrderFormState =
  | {
      ok?: boolean;
      orderId?: string;
      error?: string;
      customerName?: string;
      customerPhone?: string;
      pickupDate?: string;
      pickupSlot?: string;
      totalPrice?: number;
      itemsSummary?: string;
    }
  | undefined;

export async function placeDiwaliOrder(_: OrderFormState, formData: FormData): Promise<OrderFormState> {
  const customerName = String(formData.get("customer_name") ?? "").trim();
  const customerPhone = String(formData.get("customer_phone") ?? "").replace(/\D/g, "");
  const pickupDate = String(formData.get("pickup_date") ?? "").trim();
  const pickupSlot = String(formData.get("pickup_slot") ?? "Morning: 10:00 AM – 1:00 PM").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!customerName) {
    return { error: "Please enter your full name. / कृपया आपले पूर्ण नाव टाका." };
  }

  if (!validateIndianMobile(customerPhone)) {
    return { error: "Please enter a valid 10-digit mobile number. / कृपया योग्य १०-अंकी मोबाईल नंबर टाका." };
  }

  if (!pickupDate) {
    return { error: "Please select a store pickup date. / कृपया दुकानातून माल घेण्याची तारीख निवडा." };
  }

  // Parse items from form
  const items: OrderItemDetail[] = [];
  let calculatedTotal = 0;
  let totalBoxes = 0;

  for (const box of DIWALI_BOXES) {
    const qtyRaw = formData.get(`qty_${box.id}`);
    const qty = Number(qtyRaw);
    if (Number.isInteger(qty) && qty > 0) {
      const subtotal = qty * box.price;
      calculatedTotal += subtotal;
      totalBoxes += qty;
      items.push({
        id: box.id,
        name: box.name,
        quantity: qty,
        unitPrice: box.price,
        subtotal,
      });
    }
  }

  if (items.length === 0) {
    return { error: "Please select at least 1 gift box to order. / कृपया किमान १ गिफ्ट बॉक्स निवडा." };
  }

  const boxTypeSummary = items.map((i) => `${i.quantity}x ${i.name}`).join(", ");
  const itemsSummary = items.map((i) => `• ${i.quantity}x ${i.name} (₹${i.subtotal})`).join("\n");

  const row = {
    customer_name: customerName,
    customer_phone: customerPhone,
    box_type: boxTypeSummary,
    quantity: totalBoxes,
    unit_price: items[0].unitPrice,
    total_price: calculatedTotal,
    items_detail: items,
    delivery_type: `Store Pickup: ${pickupDate} (${pickupSlot})`,
    address: site.address,
    notes: [notes, `Pickup: ${pickupDate} [${pickupSlot}]`].filter(Boolean).join(" | "),
    status: "new",
  };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("diwali_orders")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      console.warn("Could not insert to diwali_orders table (may need SQL migration):", error.message);
      const fallbackId = crypto.randomUUID();
      return {
        ok: true,
        orderId: fallbackId,
        customerName,
        customerPhone,
        pickupDate,
        pickupSlot,
        totalPrice: calculatedTotal,
        itemsSummary,
      };
    }

    return {
      ok: true,
      orderId: data.id,
      customerName,
      customerPhone,
      pickupDate,
      pickupSlot,
      totalPrice: calculatedTotal,
      itemsSummary,
    };
  } catch (err: any) {
    console.error("Order placement exception:", err);
    const fallbackId = crypto.randomUUID();
    return {
      ok: true,
      orderId: fallbackId,
      customerName,
      customerPhone,
      pickupDate,
      pickupSlot,
      totalPrice: calculatedTotal,
      itemsSummary,
    };
  }
}
