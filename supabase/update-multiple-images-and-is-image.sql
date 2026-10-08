-- ============================================================
--  Venkateshwara Catalogue — Multiple Images & Image Toggle Migration
--  Supabase → SQL Editor → New query → paste this whole file → Run
--
--  This migration:
--  1. Adds `is_image` (boolean): control whether to show product photo
--     or show the compact "rate table" card instead (no empty placeholder).
--  2. Adds `images` (text[]): allows multiple photos per product.
--  3. Migrates existing single `image_url` into the `images` array.
--  4. Sets `is_image = false` for products that don't have photos so they
--     instantly display as clean, compact rate tables.
-- ============================================================

begin;

-- 1. Add `is_image` column (default true)
alter table public.products 
  add column if not exists is_image boolean not null default true;

-- 2. Add `images` column (array of text URLs, default empty array)
alter table public.products 
  add column if not exists images text[] not null default '{}';

-- 3. Populate `images` array from existing `image_url` where not already set
update public.products
   set images = array[image_url]
 where image_url is not null 
   and trim(image_url) <> ''
   and (images is null or cardinality(images) = 0);

-- 4. Set `is_image = false` for products that have no images (so they display as table cards)
update public.products
   set is_image = false
 where (image_url is null or trim(image_url) = '')
   and (images is null or cardinality(images) = 0);

-- 5. Ensure products that have images have is_image = true
update public.products
   set is_image = true
 where (image_url is not null and trim(image_url) <> '')
    or (images is not null and cardinality(images) > 0);

commit;


-- ============================================================
--  HOW TO USE: EXAMPLES FOR YOUR PRODUCTS
-- ============================================================

-- Example A: Add multiple images to a product (e.g. Cashew 500g)
-- update public.products
--    set is_image = true,
--        image_url = 'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199352/venkateshwara/products/cashew-500g.webp',
--        images = array[
--          'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199352/venkateshwara/products/cashew-500g.webp',
--          'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199346/venkateshwara/products/agarbatti-5-in-1.webp'
--        ]
--  where name ilike '%cashew%';

-- Example B: Turn OFF image for a product (show clean table card, no placeholder)
-- update public.products
--    set is_image = false
--  where name ilike '%pouch%';

-- Example C: Turn ON image for a product
-- update public.products
--    set is_image = true
--  where name ilike '%pouch%';


-- ============================================================
--  CHECK / VERIFY YOUR DATA
-- ============================================================
select 
  p.name,
  p.is_image as show_image,
  cardinality(p.images) as image_count,
  p.image_url as primary_photo,
  p.images as all_photos
from public.products p
order by p.name;
