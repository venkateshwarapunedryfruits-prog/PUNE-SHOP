-- ============================================================
--  OPTIONAL starter catalogue (run after schema.sql)
--  Images are hosted on Cloudinary (venkateshwara/products).
--  ⚠ Prices below are SAMPLE values — update them in the admin panel.
-- ============================================================

insert into public.categories (name) values
  ('Agarbatti'),
  ('Dhoop Cones'),
  ('Kitchen Essentials')
on conflict (name) do nothing;

with c as (select id, name from public.categories)
insert into public.products
  (category_id, name, image_url, mrp, member_price, wholesale_enabled, wholesale_price, wholesale_min_qty)
values
  ((select id from c where name = 'Agarbatti'), 'Ayodhya Agarbatti',            'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199347/venkateshwara/products/agarbatti-ayodhya.webp',       120, 100, true,  85, 12),
  ((select id from c where name = 'Agarbatti'), 'Kasturi Agarbatti',            'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199348/venkateshwara/products/agarbatti-kasturi.webp',       120, 100, true,  85, 12),
  ((select id from c where name = 'Agarbatti'), 'Mogra Agarbatti',              'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199350/venkateshwara/products/agarbatti-mogra.webp',         120, 100, true,  85, 12),
  ((select id from c where name = 'Agarbatti'), 'Woods Agarbatti',              'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199351/venkateshwara/products/agarbatti-woods.webp',         120, 100, false, null, null),
  ((select id from c where name = 'Agarbatti'), 'Sainath Flora Agarbatti',      'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199351/venkateshwara/products/agarbatti-sainath.webp',       120, 100, false, null, null),
  ((select id from c where name = 'Agarbatti'), 'Geranium Agarbatti',           'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199348/venkateshwara/products/agarbatti-geranium.webp',      120, 100, false, null, null),
  ((select id from c where name = 'Agarbatti'), 'Kesar Chandan Agarbatti',      'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199349/venkateshwara/products/agarbatti-kesar-chandan.webp', 120, 100, false, null, null),
  ((select id from c where name = 'Agarbatti'), '5 in 1 Panchagavya Agarbatti', 'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199346/venkateshwara/products/agarbatti-5-in-1.webp',        450, 399, true, 360, 6),
  ((select id from c where name = 'Agarbatti'), 'Agarbatti Pouch 100g – Ayodhya', 'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199355/venkateshwara/products/pouch-ayodhya.webp',          60,  50, true,  42, 24),
  ((select id from c where name = 'Agarbatti'), 'Agarbatti Pouch 100g – Kasturi', 'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199356/venkateshwara/products/pouch-kasturi.webp',          60,  50, true,  42, 24),
  ((select id from c where name = 'Agarbatti'), 'Agarbatti Pouch 100g – Mogra',   'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199357/venkateshwara/products/pouch-mogra.webp',            60,  50, false, null, null),
  ((select id from c where name = 'Agarbatti'), 'Agarbatti Pouch 100g – Woods',   'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199357/venkateshwara/products/pouch-woods.webp',            60,  50, false, null, null),
  ((select id from c where name = 'Dhoop Cones'), 'Astha Dhoop Cone 100g',      'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199353/venkateshwara/products/dhoop-astha.webp',              90,  75, true,  65, 12),
  ((select id from c where name = 'Dhoop Cones'), 'Vedshree Dhoop Cone 100g',   'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199353/venkateshwara/products/dhoop-vedshree.webp',           90,  75, false, null, null),
  ((select id from c where name = 'Dhoop Cones'), 'Vrinda Dhoop Cone 100g',     'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199354/venkateshwara/products/dhoop-vrinda.webp',             90,  75, false, null, null),
  ((select id from c where name = 'Kitchen Essentials'), 'Turmeric Powder 200g',   'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199358/venkateshwara/products/turmeric-200g.webp',         80,  70, true,  60, 20),
  ((select id from c where name = 'Kitchen Essentials'), 'Turmeric Powder 500g',   'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199359/venkateshwara/products/turmeric-500g.webp',        180, 160, true, 140, 10),
  ((select id from c where name = 'Kitchen Essentials'), 'Cashew 500g',            'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199352/venkateshwara/products/cashew-500g.webp',          650, 590, false, null, null),
  ((select id from c where name = 'Kitchen Essentials'), 'Gir Cow Ghee 250ml',     'https://res.cloudinary.com/d8mvq75f/image/upload/v1791199355/venkateshwara/products/gir-cow-ghee-250ml.webp',   750, 690, false, null, null);
