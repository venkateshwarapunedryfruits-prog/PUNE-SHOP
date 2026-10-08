-- ============================================================
--  Venkateshwara Catalogue — Group Variants Migration
--  Combines 7 Agarbatti Bottles, 4 Agarbatti Pouches, and Dhoop Cones
--  into single products with multi-image galleries & fragrance lists.
--  Supabase → SQL Editor → New query → paste this whole file → Run
-- ============================================================

begin;

-- Ensure columns exist
alter table public.products 
  add column if not exists is_image boolean not null default true;

alter table public.products 
  add column if not exists images text[] not null default '{}';


-- 1. DELETE individual duplicated variants so we can insert the clean grouped products
delete from public.products
 where name in (
   'Ayodhya Agarbatti',
   'Kasturi Agarbatti',
   'Mogra Agarbatti',
   'Woods Agarbatti',
   'Sainath Flora Agarbatti',
   'Geranium Agarbatti',
   'Kesar Chandan Agarbatti',
   'Agarbatti Bottle (7 Fragrances)',
   'Agarbatti Bottle / Box (7 Fragrances)'
 );

delete from public.products
 where name in (
   'Agarbatti Pouch 100g – Ayodhya',
   'Agarbatti Pouch 100g – Kasturi',
   'Agarbatti Pouch 100g – Mogra',
   'Agarbatti Pouch 100g – Woods',
   'Agarbatti Pouch 100g (4 Fragrances)'
 );

delete from public.products
 where name in (
   'Astha Dhoop Cone 100g',
   'Vedshree Dhoop Cone 100g',
   'Vrinda Dhoop Cone 100g',
   'Dhoop Cones 100g (3 Fragrances)',
   'Dhoop Cones 100g (Astha, Vedshree, Vrinda)'
 );

delete from public.products
 where name in (
   'Astha Dhoop Cone 50g',
   'Vedshree Dhoop Cone 50g',
   'Vrinda Dhoop Cone 50g',
   'Dhoop Cones 50g (3 Fragrances)',
   'Dhoop Cones 50g (Astha, Vedshree, Vrinda)'
 );


-- 2. INSERT GROUP 1: Agarbatti Bottle / Box (All 7 Fragrances in One)
--    MRP 130, Member 45, Wholesale 35 (Min 70 pcs)
insert into public.products (
  category_id,
  name,
  image_url,
  images,
  is_image,
  mrp,
  member_price,
  wholesale_enabled,
  wholesale_price,
  wholesale_min_qty,
  is_available
)
select 
  c.id,
  'Agarbatti Bottle (7 Fragrances: Mogra, Kasturi, Kesar Chandan, Ayodhya, Sainath, Woods, Geranium)',
  'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199347/venkateshwara/products/agarbatti-ayodhya.webp',
  array[
    'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199350/venkateshwara/products/agarbatti-mogra.webp',
    'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199348/venkateshwara/products/agarbatti-kasturi.webp',
    'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199349/venkateshwara/products/agarbatti-kesar-chandan.webp',
    'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199347/venkateshwara/products/agarbatti-ayodhya.webp',
    'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199351/venkateshwara/products/agarbatti-sainath.webp',
    'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199351/venkateshwara/products/agarbatti-woods.webp',
    'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199348/venkateshwara/products/agarbatti-geranium.webp'
  ],
  true,
  130,
  45,
  true,
  35,
  70,
  true
from public.categories c
where c.name = 'Agarbatti'
limit 1;


-- 3. INSERT GROUP 2: Agarbatti Pouch 100g (All 4 Fragrances in One)
--    MRP 100, Member 45, Wholesale 35 (Min 60 pcs)
insert into public.products (
  category_id,
  name,
  image_url,
  images,
  is_image,
  mrp,
  member_price,
  wholesale_enabled,
  wholesale_price,
  wholesale_min_qty,
  is_available
)
select 
  c.id,
  'Agarbatti Pouch 100g (4 Fragrances: Ayodhya, Kasturi, Mogra, Woods)',
  'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199355/venkateshwara/products/pouch-ayodhya.webp',
  array[
    'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199355/venkateshwara/products/pouch-ayodhya.webp',
    'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199356/venkateshwara/products/pouch-kasturi.webp',
    'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199357/venkateshwara/products/pouch-mogra.webp',
    'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199357/venkateshwara/products/pouch-woods.webp'
  ],
  true,
  100,
  45,
  true,
  35,
  60,
  true
from public.categories c
where c.name = 'Agarbatti'
limit 1;


-- 4. INSERT GROUP 3: Big Dhoop Cones 100g (All 3 Fragrances in One)
--    MRP 250, Member 65, Wholesale 55 (Min 60 pcs)
insert into public.products (
  category_id,
  name,
  image_url,
  images,
  is_image,
  mrp,
  member_price,
  wholesale_enabled,
  wholesale_price,
  wholesale_min_qty,
  is_available
)
select 
  c.id,
  'Dhoop Cones 100g (Astha, Vedshree, Vrinda)',
  'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199353/venkateshwara/products/dhoop-astha.webp',
  array[
    'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199353/venkateshwara/products/dhoop-astha.webp',
    'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199353/venkateshwara/products/dhoop-vedshree.webp',
    'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199354/venkateshwara/products/dhoop-vrinda.webp'
  ],
  true,
  250,
  65,
  true,
  55,
  60,
  true
from public.categories c
where c.name = 'Dhoop Cones'
limit 1;


-- 5. INSERT GROUP 4: Small Dhoop Cones 50g (All 3 Fragrances in One)
--    MRP 125, Member 40, Wholesale 37 (Min 60 pcs)
insert into public.products (
  category_id,
  name,
  image_url,
  images,
  is_image,
  mrp,
  member_price,
  wholesale_enabled,
  wholesale_price,
  wholesale_min_qty,
  is_available
)
select 
  c.id,
  'Dhoop Cones 50g (Astha, Vedshree, Vrinda)',
  'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199353/venkateshwara/products/dhoop-astha.webp',
  array[
    'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199353/venkateshwara/products/dhoop-astha.webp',
    'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199353/venkateshwara/products/dhoop-vedshree.webp',
    'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199354/venkateshwara/products/dhoop-vrinda.webp'
  ],
  true,
  125,
  40,
  true,
  37,
  60,
  true
from public.categories c
where c.name = 'Dhoop Cones'
limit 1;

commit;

-- Verification
select 
  c.name as category,
  p.name as product,
  p.mrp,
  p.member_price,
  p.wholesale_price,
  p.wholesale_min_qty,
  cardinality(p.images) as photo_count
from public.products p
join public.categories c on c.id = p.category_id
order by c.name, p.name;
