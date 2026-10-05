-- ============================================================
--  Move product photos to Cloudinary
--  Supabase → SQL Editor → New query → paste this whole file → Run
--
--  Switches each starter product from its local photo (/products/...)
--  to the same photo on Cloudinary. Products whose photo you already
--  changed in the admin panel are not touched. Safe to run again.
-- ============================================================

begin;

update public.products set image_url = 'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199346/venkateshwara/products/agarbatti-5-in-1.webp'
  where image_url = '/products/agarbatti-5-in-1.webp';
update public.products set image_url = 'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199347/venkateshwara/products/agarbatti-ayodhya.webp'
  where image_url = '/products/agarbatti-ayodhya.webp';
update public.products set image_url = 'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199348/venkateshwara/products/agarbatti-geranium.webp'
  where image_url = '/products/agarbatti-geranium.webp';
update public.products set image_url = 'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199348/venkateshwara/products/agarbatti-kasturi.webp'
  where image_url = '/products/agarbatti-kasturi.webp';
update public.products set image_url = 'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199349/venkateshwara/products/agarbatti-kesar-chandan.webp'
  where image_url = '/products/agarbatti-kesar-chandan.webp';
update public.products set image_url = 'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199350/venkateshwara/products/agarbatti-mogra.webp'
  where image_url = '/products/agarbatti-mogra.webp';
update public.products set image_url = 'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199351/venkateshwara/products/agarbatti-sainath.webp'
  where image_url = '/products/agarbatti-sainath.webp';
update public.products set image_url = 'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199351/venkateshwara/products/agarbatti-woods.webp'
  where image_url = '/products/agarbatti-woods.webp';
update public.products set image_url = 'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199352/venkateshwara/products/cashew-500g.webp'
  where image_url = '/products/cashew-500g.webp';
update public.products set image_url = 'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199353/venkateshwara/products/dhoop-astha.webp'
  where image_url = '/products/dhoop-astha.webp';
update public.products set image_url = 'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199353/venkateshwara/products/dhoop-vedshree.webp'
  where image_url = '/products/dhoop-vedshree.webp';
update public.products set image_url = 'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199354/venkateshwara/products/dhoop-vrinda.webp'
  where image_url = '/products/dhoop-vrinda.webp';
update public.products set image_url = 'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199355/venkateshwara/products/gir-cow-ghee-250ml.webp'
  where image_url = '/products/gir-cow-ghee-250ml.webp';
update public.products set image_url = 'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199355/venkateshwara/products/pouch-ayodhya.webp'
  where image_url = '/products/pouch-ayodhya.webp';
update public.products set image_url = 'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199356/venkateshwara/products/pouch-kasturi.webp'
  where image_url = '/products/pouch-kasturi.webp';
update public.products set image_url = 'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199357/venkateshwara/products/pouch-mogra.webp'
  where image_url = '/products/pouch-mogra.webp';
update public.products set image_url = 'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199357/venkateshwara/products/pouch-woods.webp'
  where image_url = '/products/pouch-woods.webp';
update public.products set image_url = 'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199358/venkateshwara/products/turmeric-200g.webp'
  where image_url = '/products/turmeric-200g.webp';
update public.products set image_url = 'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199359/venkateshwara/products/turmeric-500g.webp'
  where image_url = '/products/turmeric-500g.webp';

commit;

-- CHECK: "still_local" should be 0
select
  count(*) filter (where image_url like 'https://res.cloudinary.com/%') as on_cloudinary,
  count(*) filter (where image_url like '/products/%')                 as still_local,
  count(*)                                                                as total_products
from public.products;
