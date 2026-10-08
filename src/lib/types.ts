export type Category = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  category_id: string;
  name: string;
  image_url: string | null;
  images?: string[] | null;
  is_image?: boolean;
  mrp: number;
  member_price: number;
  wholesale_enabled: boolean;
  wholesale_price: number | null;
  wholesale_min_qty: number | null;
  is_available: boolean;
};

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatPrice(value: number | string | null | undefined) {
  return value == null ? "—" : inr.format(Number(value));
}
