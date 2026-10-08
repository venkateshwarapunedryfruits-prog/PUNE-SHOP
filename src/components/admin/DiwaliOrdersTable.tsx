"use client";

import { useState, useTransition } from "react";
import { updateDiwaliOrderStatus, deleteDiwaliOrder } from "@/app/admin/actions";
import type { DiwaliOrder } from "@/lib/diwali";
import { formatPrice } from "@/lib/types";

type Props = {
  orders: DiwaliOrder[];
};

const STATUS_CONFIG: Record<
  DiwaliOrder["status"],
  { label: string; badgeClass: string }
> = {
  new: { label: "New Order", badgeClass: "bg-gold-soft text-gold-deep border-gold/30" },
  confirmed: { label: "Confirmed", badgeClass: "bg-blue-50 text-blue-700 border-blue-200" },
  packed: { label: "Packed", badgeClass: "bg-amber-50 text-amber-700 border-amber-200" },
  delivered: { label: "Delivered", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Cancelled", badgeClass: "bg-rose/10 text-rose border-rose/20" },
};

export function DiwaliOrdersTable({ orders }: Props) {
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [localOrders, setLocalOrders] = useState<DiwaliOrder[]>(orders);
  const [isPending, startTransition] = useTransition();

  const q = query.trim().toLowerCase();
  const filtered = localOrders.filter((o) => {
    const matchesFilter = filter === "all" || o.status === filter;
    const matchesQuery =
      !q ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(q) ||
      o.box_type.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q);
    return matchesFilter && matchesQuery;
  });

  // Calculate statistics
  const totalRevenue = localOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total_price || 0), 0);
  const newOrdersCount = localOrders.filter((o) => o.status === "new").length;
  const totalBoxes = localOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.quantity || 0), 0);

  function handleStatusChange(id: string, newStatus: DiwaliOrder["status"]) {
    setLocalOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
    startTransition(async () => {
      await updateDiwaliOrderStatus(id, newStatus);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this Diwali gift box order?")) return;
    setLocalOrders((prev) => prev.filter((o) => o.id !== id));
    startTransition(async () => {
      await deleteDiwaliOrder(id);
    });
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Metric Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-paper p-4.5 shadow-2xs">
          <p className="eyebrow text-muted">Total Orders</p>
          <p className="font-display mt-1 text-2xl font-bold text-forest">{localOrders.length}</p>
        </div>

        <div className="rounded-2xl border border-gold/40 bg-gold-soft/40 p-4.5 shadow-2xs">
          <p className="eyebrow text-gold-deep">New / Pending</p>
          <p className="font-display mt-1 text-2xl font-bold text-gold-deep">{newOrdersCount}</p>
        </div>

        <div className="rounded-2xl border border-line bg-paper p-4.5 shadow-2xs">
          <p className="eyebrow text-muted">Total Gift Boxes</p>
          <p className="font-display mt-1 text-2xl font-bold text-ink">{totalBoxes} pcs</p>
        </div>

        <div className="rounded-2xl border border-line bg-paper p-4.5 shadow-2xs">
          <p className="eyebrow text-muted">Total Revenue</p>
          <p className="font-display mt-1 text-2xl font-bold text-forest">{formatPrice(totalRevenue)}</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="no-scrollbar flex gap-1 overflow-x-auto">
          {[
            { id: "all", label: "All" },
            { id: "new", label: "New" },
            { id: "confirmed", label: "Confirmed" },
            { id: "packed", label: "Packed" },
            { id: "delivered", label: "Delivered" },
            { id: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
                filter === tab.id
                  ? "border-forest bg-forest text-paper"
                  : "border-line bg-paper text-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, phone, order ID…"
          className="field md:max-w-xs text-xs sm:text-sm"
        />
      </div>

      {/* Orders List / Table */}
      <div className="overflow-hidden rounded-3xl border border-line bg-paper">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-muted">
            <p className="font-display text-2xl text-forest">No orders found</p>
            <p className="mt-1 text-xs">
              {localOrders.length === 0
                ? "No Diwali gift box orders placed yet. They will appear here once customers order."
                : "No orders match your filter/search criteria."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {filtered.map((order) => {
              const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.new;
              const dateFormatted = new Date(order.created_at).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              });

              const waMessage = encodeURIComponent(
                `Namaste ${order.customer_name}, Venkateshwara Pune here regarding your Diwali Gift Box order #${order.id.slice(0, 8).toUpperCase()}.\nOrder Details: ${order.box_type}\nTotal Amount: ₹${order.total_price}`
              );

              return (
                <li key={order.id} className="p-4 sm:p-5 transition hover:bg-ivory/30">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    {/* Left: Customer Info */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-muted">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <h4 className="font-display text-lg font-bold text-ink">
                          {order.customer_name}
                        </h4>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[0.65rem] font-bold ${statusCfg.badgeClass}`}
                        >
                          {statusCfg.label}
                        </span>
                      </div>

                      {/* Phone & Direct Contact Links */}
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <a
                          href={`tel:${order.customer_phone}`}
                          className="font-bold text-forest hover:underline"
                        >
                          📞 +91 {order.customer_phone}
                        </a>
                        <a
                          href={`https://wa.me/91${order.customer_phone}?text=${waMessage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-[#1f8742] hover:underline"
                        >
                          💬 WhatsApp Customer
                        </a>
                        <span className="text-muted">• {dateFormatted}</span>
                      </div>
                    </div>

                    {/* Right: Price & Status Dropdown */}
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div className="text-right">
                        <p className="text-lg font-extrabold text-forest">
                          {formatPrice(order.total_price)}
                        </p>
                        <p className="text-[0.68rem] text-muted font-semibold">
                          {order.quantity} box{order.quantity === 1 ? "" : "es"}
                        </p>
                      </div>

                      {/* Status Selector */}
                      <select
                        value={order.status}
                        disabled={isPending}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value as DiwaliOrder["status"])
                        }
                        className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink shadow-2xs outline-none focus:border-gold"
                      >
                        <option value="new">New Order</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="packed">Packed</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(order.id)}
                        title="Delete order"
                        className="rounded-full p-1.5 text-muted hover:bg-rose/10 hover:text-rose transition"
                      >
                        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Order Contents & Delivery Details */}
                  <div className="mt-3.5 rounded-xl border border-line/70 bg-white/80 p-3 text-xs space-y-1.5">
                    <div>
                      <span className="eyebrow text-muted">Box Variant(s): </span>
                      <span className="font-semibold text-ink">{order.box_type}</span>
                    </div>

                    {(order.delivery_type || order.address) && (
                      <div className="flex flex-wrap items-center gap-4 text-muted">
                        {order.delivery_type && (
                          <span>
                            <strong>Mode:</strong>{" "}
                            {order.delivery_type === "delivery" ? "🚚 Delivery" : "🏬 Store Pickup"}
                          </span>
                        )}

                        {order.address && (
                          <span>
                            <strong>Address:</strong> {order.address}
                          </span>
                        )}
                      </div>
                    )}

                    {order.notes && (
                      <div className="text-muted">
                        <strong>Notes:</strong> {order.notes}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
