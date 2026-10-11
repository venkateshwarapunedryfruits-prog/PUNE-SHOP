import type { Product } from "./types";

export type Variant = {
  id: string;
  /** Shown on the site, e.g. "Ayodhya (अयोध्या)" */
  label: string;
  /** English only, for the PDF (its font has no Devanagari) */
  labelEn: string;
  image: string | null;
};

/** A product as shown on the site: a single product, or several merged into one card. */
export type CatalogItem = Product & { variants?: Variant[] };

const SEPARATOR = /^[–—\-:|•,+]+$/;
const SIZE = /^\(?\d+(\.\d+)?(g|gm|kg|ml|l|ltr|pcs?)?\)?$/i;

function words(text: string) {
  return text.trim().split(/\s+/).filter(Boolean);
}

function trimSeparators(list: string[]) {
  let start = 0;
  let end = list.length;
  while (start < end && SEPARATOR.test(list[start])) start++;
  while (end > start && SEPARATOR.test(list[end - 1])) end--;
  return list.slice(start, end);
}

/** A word that says what something is, not a size like "100g" or a dash. */
function isMeaningful(word: string) {
  return /[a-z]{3,}/i.test(word) && !SIZE.test(word);
}

/** "Astha Dhoop Cone 50g / आस्था धूप कोन" → ["Astha Dhoop Cone 50g", "आस्था धूप कोन"] */
function splitBilingual(name: string): [string, string | null] {
  const i = name.indexOf(" / ");
  return i === -1 ? [name.trim(), null] : [name.slice(0, i).trim(), name.slice(i + 3).trim()];
}

function imagesOf(p: Product) {
  const list = p.images?.length ? p.images : [p.image_url];
  return list.filter((u): u is string => Boolean(u?.trim()));
}

function primaryImage(p: Product) {
  return imagesOf(p)[0] ?? null;
}

/** Everything a customer pays or needs to qualify for: products must match on all of it to merge. */
function priceKey(p: Product) {
  return [
    p.category_id,
    Number(p.mrp),
    Number(p.member_price),
    p.wholesale_enabled,
    p.wholesale_enabled ? Number(p.wholesale_price) : "",
    p.wholesale_enabled ? Number(p.wholesale_min_qty) : "",
  ].join("|");
}

/**
 * The shared part of a name ("Dhoop Cone 50g") is either its first or its last words.
 * Each candidate is keyed by side + text so "Agarbatti …" and "… Agarbatti" stay apart.
 */
function candidateKeys(englishName: string) {
  const w = words(englishName);
  const keys: { key: string; side: "prefix" | "suffix"; size: number }[] = [];
  for (let k = 1; k < w.length; k++) {
    const prefix = w.slice(0, k);
    const suffix = w.slice(w.length - k);
    if (prefix.some(isMeaningful) && w.slice(k).some(isMeaningful)) {
      keys.push({ key: "P:" + prefix.join(" ").toLowerCase(), side: "prefix", size: k });
    }
    if (suffix.some(isMeaningful) && w.slice(0, w.length - k).some(isMeaningful)) {
      keys.push({ key: "S:" + suffix.join(" ").toLowerCase(), side: "suffix", size: k });
    }
  }
  return keys;
}

/** Longest run of words that every name starts (or ends) with, leaving something over in each. */
function commonWords(names: string[][], side: "prefix" | "suffix") {
  const shortest = Math.min(...names.map((n) => n.length));
  let k = 0;
  while (k < shortest - 1) {
    const at = (n: string[]) => (side === "prefix" ? n[k] : n[n.length - 1 - k]);
    if (!names.every((n) => at(n) === at(names[0]))) break;
    k++;
  }
  return k;
}

function cut(list: string[], k: number, side: "prefix" | "suffix") {
  return side === "prefix"
    ? { shared: list.slice(0, k), rest: list.slice(k) }
    : { shared: list.slice(list.length - k), rest: list.slice(0, list.length - k) };
}

function merge(members: Product[], side: "prefix" | "suffix", size: number): CatalogItem {
  const english = members.map((m) => words(splitBilingual(m.name)[0]));
  const baseEn = trimSeparators(cut(english[0], size, side).shared).join(" ");
  const labelsEn = english.map((w) => trimSeparators(cut(w, size, side).rest).join(" "));

  // Marathi halves get the same treatment, but only when every variant has one and they line up
  const marathi = members.map((m) => splitBilingual(m.name)[1]);
  let baseMr = "";
  let labelsMr: string[] | null = null;
  if (marathi.every(Boolean)) {
    const mr = marathi.map((t) => words(t!));
    for (const mrSide of ["suffix", "prefix"] as const) {
      const k = commonWords(mr, mrSide);
      if (k > 0) {
        baseMr = cut(mr[0], k, mrSide).shared.join(" ");
        labelsMr = mr.map((w) => cut(w, k, mrSide).rest.join(" "));
        break;
      }
    }
  }

  const variants: Variant[] = members.map((m, i) => ({
    id: m.id,
    label: labelsMr ? `${labelsEn[i]} (${labelsMr[i]})` : labelsEn[i],
    labelEn: labelsEn[i],
    image: primaryImage(m),
  }));

  const images = [...new Set(members.flatMap(imagesOf))];

  return {
    ...members[0],
    id: `group-${members[0].id}`,
    name: baseMr ? `${baseEn} / ${baseMr}` : baseEn,
    image_url: images[0] ?? null,
    images,
    is_image: members.some((m) => m.is_image !== false) && images.length > 0,
    variants,
  };
}

/**
 * Shows products that differ only by fragrance/flavour as one card with variant chips.
 * Products merge when they share a category, every price and wholesale term, and a name
 * that differs only at the start or end: "Astha / Vedshree / Vrinda Dhoop Cone 50g".
 * Each variant stays its own row in the admin panel, so one can be switched off on its own.
 */
export function groupVariants(products: Product[]): CatalogItem[] {
  const buckets = new Map<string, Product[]>();
  for (const p of products) {
    const key = priceKey(p);
    buckets.set(key, [...(buckets.get(key) ?? []), p]);
  }

  const mergedInto = new Map<string, CatalogItem>();
  for (const bucket of buckets.values()) {
    let pool = bucket;
    while (pool.length >= 2) {
      const groups = new Map<string, { side: "prefix" | "suffix"; size: number; members: Product[] }>();
      for (const p of pool) {
        for (const c of candidateKeys(splitBilingual(p.name)[0])) {
          const g = groups.get(c.key) ?? { side: c.side, size: c.size, members: [] };
          g.members.push(p);
          groups.set(c.key, g);
        }
      }

      let best: { side: "prefix" | "suffix"; size: number; members: Product[] } | null = null;
      for (const g of groups.values()) {
        if (g.members.length < 2) continue;
        if (!best || g.members.length > best.members.length || (g.members.length === best.members.length && g.size > best.size)) {
          best = g;
        }
      }
      if (!best) break;

      const { members } = best;
      const item = merge(members, best.side, best.size);
      for (const m of members) mergedInto.set(m.id, item);
      pool = pool.filter((p) => !members.includes(p));
    }
  }

  // Keep the original order: a merged card sits where its first variant was
  const seen = new Set<CatalogItem>();
  const result: CatalogItem[] = [];
  for (const p of products) {
    const item = mergedInto.get(p.id) ?? p;
    if (seen.has(item)) continue;
    seen.add(item);
    result.push(item);
  }
  return result;
}

/** Text a search box should match: the product name plus every variant. */
export function searchText(item: CatalogItem) {
  return [item.name, ...(item.variants?.map((v) => v.label) ?? [])].join(" ").toLowerCase();
}
