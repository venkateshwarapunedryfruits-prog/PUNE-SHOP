"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; ok?: boolean } | undefined;

const BUCKET = "product-images";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) throw new Error("This account is not allowed to manage the catalogue.");
  return supabase;
}

function refresh() {
  revalidatePath("/", "layout");
}

/* ---------------- Auth ---------------- */

export async function signIn(_: FormState, formData: FormData): Promise<FormState> {
  // Admin logins are Supabase email users whose "email" is a username such as "pune@1234"
  // (created with supabase/admin-login.local.sql). Usernames are stored lowercase.
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) return { error: "Enter your username and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: username, password });
  if (error) {
    return {
      error: error.code === "invalid_credentials" ? "Incorrect username or password." : `Sign-in failed: ${error.message}`,
    };
  }

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    await supabase.auth.signOut();
    return { error: "This account does not have admin access." };
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/* ---------------- Categories ---------------- */

export async function createCategory(_: FormState, formData: FormData): Promise<FormState> {
  const supabase = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Category name is required." };

  const { error } = await supabase.from("categories").insert({ name });
  if (error) return { error: error.code === "23505" ? "A category with this name already exists." : error.message };
  refresh();
  return { ok: true };
}

export async function renameCategory(_: FormState, formData: FormData): Promise<FormState> {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Category name is required." };

  const { error } = await supabase.from("categories").update({ name }).eq("id", id);
  if (error) return { error: error.code === "23505" ? "A category with this name already exists." : error.message };
  refresh();
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<FormState> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    return {
      error: error.code === "23503" ? "This category still has products. Move or delete them first." : error.message,
    };
  }
  refresh();
  return { ok: true };
}

/* ---------------- Products ---------------- */

function toPrice(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : NaN;
}

function storagePath(url: string | null) {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length));
}

export async function saveProduct(_: FormState, formData: FormData): Promise<FormState> {
  const supabase = await requireAdmin();

  const id = String(formData.get("id") ?? "") || null;
  const name = String(formData.get("name") ?? "").trim();
  const category_id = String(formData.get("category_id") ?? "");
  const mrp = toPrice(formData.get("mrp"));
  const member_price = toPrice(formData.get("member_price"));
  const wholesale_enabled = formData.get("wholesale_enabled") === "on";
  const wholesale_price = toPrice(formData.get("wholesale_price"));
  const minQtyRaw = String(formData.get("wholesale_min_qty") ?? "").trim();
  const wholesale_min_qty = minQtyRaw === "" ? null : Number(minQtyRaw);
  const is_available = formData.get("is_available") === "on";
  const currentImage = String(formData.get("current_image_url") ?? "") || null;
  const file = formData.get("image");

  if (!name) return { error: "Product name is required." };
  if (!category_id) return { error: "Choose a category." };
  if (mrp == null || Number.isNaN(mrp)) return { error: "Enter a valid MRP." };
  if (member_price == null || Number.isNaN(member_price)) return { error: "Enter a valid member price." };
  if (Number.isNaN(wholesale_price)) return { error: "Enter a valid wholesale price." };
  if (wholesale_min_qty != null && (!Number.isInteger(wholesale_min_qty) || wholesale_min_qty < 1)) {
    return { error: "Minimum wholesale quantity must be a whole number of at least 1." };
  }
  if (wholesale_enabled && (wholesale_price == null || wholesale_min_qty == null)) {
    return { error: "Wholesale is ON — enter the wholesale price and minimum quantity." };
  }

  // Upload a new photo if one was picked
  let image_url = currentImage;
  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/")) return { error: "Please choose an image file." };
    const ext = file.type === "image/webp" ? "webp" : (file.name.split(".").pop() ?? "jpg").toLowerCase();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, cacheControl: "31536000" });
    if (upErr) return { error: `Image upload failed: ${upErr.message}` };
    image_url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  const row = {
    name,
    category_id,
    mrp,
    member_price,
    wholesale_enabled,
    wholesale_price,
    wholesale_min_qty,
    is_available,
    image_url,
  };

  const { error } = id
    ? await supabase.from("products").update(row).eq("id", id)
    : await supabase.from("products").insert(row);
  if (error) return { error: error.message };

  // Clean up the replaced photo
  if (image_url !== currentImage) {
    const old = storagePath(currentImage);
    if (old) await supabase.storage.from(BUCKET).remove([old]);
  }

  refresh();
  redirect("/admin");
}

export async function deleteProduct(id: string): Promise<FormState> {
  const supabase = await requireAdmin();
  const { data: product } = await supabase.from("products").select("image_url").eq("id", id).single();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };

  const path = storagePath(product?.image_url ?? null);
  if (path) await supabase.storage.from(BUCKET).remove([path]);
  refresh();
  return { ok: true };
}

export async function setAvailability(id: string, value: boolean): Promise<FormState> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("products").update({ is_available: value }).eq("id", id);
  if (error) return { error: error.message };
  refresh();
  return { ok: true };
}

export async function setWholesale(id: string, value: boolean): Promise<FormState> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("products").update({ wholesale_enabled: value }).eq("id", id);
  if (error) {
    return {
      error: error.code === "23514" ? "Add a wholesale price and minimum quantity first (Edit product)." : error.message,
    };
  }
  refresh();
  return { ok: true };
}
