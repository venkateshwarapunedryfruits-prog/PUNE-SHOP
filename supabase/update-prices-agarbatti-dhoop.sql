-- ============================================================
--  Agarbatti + Dhoop: new prices, Dhoop 50g, Agarbatti Combo
--  Supabase → SQL Editor → New query → paste this whole file → Run
--
--  Wholesale is switched ON for every product below.
--  "5 in 1 Panchagavya Agarbatti" is NOT changed.
--  Safe to run again: prices are just set again, and the new
--  products are only added if they don't exist yet.
-- ============================================================

begin;

-- 1. Agarbatti pouches (100g): MRP 100, Member 45, Wholesale 35 (min 60)
update public.products p
   set mrp = 100, member_price = 45,
       wholesale_enabled = true, wholesale_price = 35, wholesale_min_qty = 60
  from public.categories c
 where p.category_id = c.id
   and c.name = 'Agarbatti'
   and p.name ilike '%pouch%';

-- 2. Agarbatti boxes (every other agarbatti): MRP 130, Member 45, Wholesale 35 (min 70)
update public.products p
   set mrp = 130, member_price = 45,
       wholesale_enabled = true, wholesale_price = 35, wholesale_min_qty = 70
  from public.categories c
 where p.category_id = c.id
   and c.name = 'Agarbatti'
   and p.name not ilike '%pouch%'
   and p.name not ilike '%5 in 1%'
   and p.name not ilike '%panchagavya%'
   and p.name not ilike '%combo%';

-- 3. Dhoop Cones 100g: MRP 250, Member 65, Wholesale 55 (min 60)
update public.products p
   set mrp = 250, member_price = 65,
       wholesale_enabled = true, wholesale_price = 55, wholesale_min_qty = 60
  from public.categories c
 where p.category_id = c.id
   and c.name = 'Dhoop Cones'
   and p.name ilike '%100g%';

-- 4. NEW Dhoop Cones 50g: MRP 125, Member 40, Wholesale 37 (min 60)
--    Photo: same as the 100g pack for now (change it in the admin panel).
insert into public.products
  (category_id, name, image_url, mrp, member_price, wholesale_enabled, wholesale_price, wholesale_min_qty)
select c.id, v.name,
       (select p.image_url from public.products p where p.name ilike v.photo_from limit 1),
       125, 40, true, 37, 60
  from public.categories c
 cross join (values
   ('Astha Dhoop Cone 50g',    'Astha Dhoop Cone 100g'),
   ('Vedshree Dhoop Cone 50g', 'Vedshree Dhoop Cone 100g'),
   ('Vrinda Dhoop Cone 50g',   'Vrinda Dhoop Cone 100g')
 ) as v(name, photo_from)
 where c.name = 'Dhoop Cones'
   and not exists (select 1 from public.products p where lower(p.name) = lower(v.name));

-- 5. NEW Agarbatti Combo (+1 agarbatti of any fragrance free):
--    MRP 399, Member 170, Wholesale 140 (min 20)
--    Photo: the Ayodhya agarbatti box for now (change it in the admin panel).
insert into public.products
  (category_id, name, image_url, mrp, member_price, wholesale_enabled, wholesale_price, wholesale_min_qty)
select c.id, 'Agarbatti Combo + 1 Agarbatti Free',
       (select p.image_url from public.products p where p.name ilike 'Ayodhya Agarbatti' limit 1),
       399, 170, true, 140, 20
  from public.categories c
 where c.name = 'Agarbatti'
   and not exists (select 1 from public.products p where p.name ilike '%combo%');

commit;


-- CHECK: every Agarbatti and Dhoop product with its prices
select c.name as category, p.name as product,
       p.mrp, p.member_price as member,
       case when p.wholesale_enabled then p.wholesale_price::text || ' (min ' || p.wholesale_min_qty || ')' else 'off' end as wholesale
  from public.products p
  join public.categories c on c.id = p.category_id
 where c.name in ('Agarbatti', 'Dhoop Cones')
 order by c.name, p.name;
