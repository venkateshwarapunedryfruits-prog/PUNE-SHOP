"use server";

import { createClient } from "@/lib/supabase/server";
import { DIWALI_BOXES, validateIndianMobile, type OrderItemDetail } from "@/lib/diwali";
import { site } from "@/lib/site";

export type OrderFormState =
  | {
      ok?: boolean;
      /** False when the database insert failed: the customer must send the order on WhatsApp. */
      saved?: boolean;
      orderId?: string;
      error?: string;
      customerName?: string;
      customerPhone?: string;
      notes?: string;
      totalPrice?: number;
      items?: OrderItemDetail[];
      itemsSummary?: string;
    }
  | undefined;

export async function placeDiwaliOrder(_: OrderFormState, formData: FormData): Promise<OrderFormState> {
  const customerName = String(formData.get("customer_name") ?? "").trim();
  const customerPhone = String(formData.get("customer_phone") ?? "").replace(/\D/g, "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!customerName) {
    return { error: "Please enter your full name. / कृपया आपले पूर्ण नाव टाका." };
  }

  if (!validateIndianMobile(customerPhone)) {
    return { error: "Please enter a valid 10-digit mobile number. / कृपया योग्य १०-अंकी मोबाईल नंबर टाका." };
  }

  // Parse items from form
  const items: OrderItemDetail[] = [];
  let calculatedTotal = 0;
  let totalBoxes = 0;

  for (const box of DIWALI_BOXES) {
    const qty = Number(formData.get(`qty_${box.id}`));
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

  // The id is generated here rather than read back with .select(): the public may
  // insert orders but not read them (RLS), and INSERT … RETURNING needs read access.
  const orderId = crypto.randomUUID();
  const row = {
    id: orderId,
    customer_name: customerName,
    customer_phone: customerPhone,
    box_type: boxTypeSummary,
    quantity: totalBoxes,
    unit_price: items[0].unitPrice,
    total_price: calculatedTotal,
    items_detail: items,
    delivery_type: "Store Pickup (Shoppers Orbit Pune)",
    address: site.address,
    notes,
    status: "new",
  };

  const result = {
    ok: true,
    customerName,
    customerPhone,
    notes,
    totalPrice: calculatedTotal,
    items,
    itemsSummary,
  };

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("diwali_orders").insert(row);

    if (error) {
      console.error("Could not save Diwali order:", error.message);
      return { ...result, saved: false };
    }

    return { ...result, saved: true, orderId };
  } catch (err) {
    console.error("Order placement exception:", err);
    return { ...result, saved: false };
  }
}
