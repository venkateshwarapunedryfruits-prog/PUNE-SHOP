import { createClient } from "@/lib/supabase/server";
import { DiwaliOrdersTable } from "@/components/admin/DiwaliOrdersTable";
import type { DiwaliOrder } from "@/lib/diwali";

export const dynamic = "force-dynamic";

export default async function DiwaliOrdersPage() {
  const supabase = await createClient();

  let orders: DiwaliOrder[] = [];
  try {
    const { data, error } = await supabase
      .from("diwali_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      orders = data as DiwaliOrder[];
    }
  } catch (err) {
    console.warn("Could not fetch diwali_orders:", err);
  }

  return (
    <>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="eyebrow text-gold-deep">Special Festive Management</span>
          <h1 className="font-display mt-0.5 text-3xl font-bold text-forest sm:text-4xl">
            Diwali Gift Box Orders
          </h1>
        </div>
      </div>

      <DiwaliOrdersTable orders={orders} />
    </>
  );
}
