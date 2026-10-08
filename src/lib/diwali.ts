export type DiwaliBoxVariant = {
  id: string;
  name: string;
  shortTitle: string;
  boxCount: number; // 4 or 6
  weightPerBox: number; // 50 or 100 in grams
  totalWeight: number; // 200g, 400g, 300g, 600g
  contents: string[];
  dryFruitCost: number;
  boxCost: number;
  roundup: number;
  price: number; // ₹240, ₹450, ₹330, ₹640
  description: string;
  badge?: string;
};

export const DIWALI_BOXES: DiwaliBoxVariant[] = [
  {
    id: "4-box-50g",
    name: "4 Mini Boxes (50g each • 200g Total)",
    shortTitle: "4 Mini Boxes × 50g",
    boxCount: 4,
    weightPerBox: 50,
    totalWeight: 200,
    contents: ["Cashew", "Almonds", "Pista", "Yellow Raisins"],
    dryFruitCost: 213.25,
    boxCost: 20,
    roundup: 6.75,
    price: 240,
    badge: "Budget Friendly",
    description: "Elegant festive gift box packed with 50g each of Premium Cashew, California Almonds, Jumbo Pista & Golden Yellow Raisins.",
  },
  {
    id: "4-box-100g",
    name: "4 Mini Boxes (100g each • 400g Total)",
    shortTitle: "4 Mini Boxes × 100g",
    boxCount: 4,
    weightPerBox: 100,
    totalWeight: 400,
    contents: ["Cashew", "Almonds", "Pista", "Yellow Raisins"],
    dryFruitCost: 426.50,
    boxCost: 20,
    roundup: 3.50,
    price: 450,
    badge: "Most Popular",
    description: "Substantial 400g festive collection with 100g each of Premium Cashew, California Almonds, Jumbo Pista & Golden Yellow Raisins.",
  },
  {
    id: "6-box-50g",
    name: "6 Mini Boxes (50g each • 300g Total)",
    shortTitle: "6 Mini Boxes × 50g",
    boxCount: 6,
    weightPerBox: 50,
    totalWeight: 300,
    contents: ["Cashew", "Almonds", "Pista", "Yellow Raisins", "Black Raisins", "Akrod (Walnut)"],
    dryFruitCost: 310.00,
    boxCost: 20,
    roundup: 0,
    price: 330,
    badge: "6 Varieties",
    description: "Grand 6-compartment gift box with 50g each of Cashew, Almonds, Pista, Yellow Raisins, Black Raisins & Walnut Kernels.",
  },
  {
    id: "6-box-100g",
    name: "6 Mini Boxes (100g each • 600g Total)",
    shortTitle: "6 Mini Boxes × 100g",
    boxCount: 6,
    weightPerBox: 100,
    totalWeight: 600,
    contents: ["Cashew", "Almonds", "Pista", "Yellow Raisins", "Black Raisins", "Akrod (Walnut)"],
    dryFruitCost: 620.00,
    boxCost: 20,
    roundup: 0,
    price: 640,
    badge: "Royal Collection",
    description: "Royal 600g grand festive hamper with 100g each of Cashew, Almonds, Pista, Yellow Raisins, Black Raisins & Walnut Kernels.",
  },
];

export const DRY_FRUIT_RATES = [
  { item: "Cashew (Kaju)", ratePerKg: 970, perGram: "₹0.97/g" },
  { item: "Almonds (Badam)", ratePerKg: 1150, perGram: "₹1.15/g" },
  { item: "Yellow Raisins (Kismis)", ratePerKg: 500, perGram: "₹0.50/g" },
  { item: "Black Raisins (Kali Darakh)", ratePerKg: 300, perGram: "₹0.30/g" },
  { item: "Pista (Pistachio)", ratePerKg: 1640, perGram: "₹1.64/g" },
  { item: "Akrod (Walnut Kernels)", ratePerKg: 1640, perGram: "₹1.64/g" },
  { item: "Decorative Gift Box Packaging", ratePerKg: 20, perGram: "₹20 / box" },
];

export type OrderItemDetail = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type DiwaliOrder = {
  id: string;
  customer_name: string;
  customer_phone: string;
  box_type: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  items_detail?: OrderItemDetail[];
  delivery_type: "pickup" | "delivery";
  address?: string | null;
  notes?: string | null;
  status: "new" | "confirmed" | "packed" | "delivered" | "cancelled";
  created_at: string;
};

/** Validates 10-digit Indian mobile number. */
export function validateIndianMobile(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  // 10 digits starting with 6, 7, 8, or 9
  return /^[6-9]\d{9}$/.test(cleaned);
}
