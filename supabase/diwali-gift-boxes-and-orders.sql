-- ============================================================
--  Venkateshwara Catalogue — Diwali Gift Boxes & Custom Orders Migration
--  Supabase → SQL Editor → New query → paste this whole file → Run
-- ============================================================

begin;

-- 1. Create table for Custom Diwali Gift Box Orders
create table if not exists public.diwali_orders (
  id             uuid primary key default gen_random_uuid(),
  customer_name  text not null check (length(trim(customer_name)) > 0),
  customer_phone text not null check (length(trim(customer_phone)) >= 10),
  box_type       text not null,
  quantity       integer not null check (quantity > 0),
  unit_price     numeric(10,2) not null check (unit_price >= 0),
  total_price    numeric(10,2) not null check (total_price >= 0),
  items_detail   jsonb,
  delivery_type  text not null default 'pickup',
  address        text,
  notes          text,
  status         text not null default 'new' check (status in ('new', 'confirmed', 'packed', 'delivered', 'cancelled')),
  created_at     timestamptz not null default clock_timestamp()
);

-- Index for fast order lookups
create index if not exists diwali_orders_created_at_idx on public.diwali_orders(created_at desc);
create index if not exists diwali_orders_status_idx on public.diwali_orders(status);

-- 2. Row Level Security for diwali_orders
alter table public.diwali_orders enable row level security;

drop policy if exists "anyone can place diwali orders" on public.diwali_orders;
drop policy if exists "admins manage diwali orders" on public.diwali_orders;

-- Anyone can submit their custom Diwali box order (public form)
create policy "anyone can place diwali orders" on public.diwali_orders
  for insert
  with check (true);

-- Admins can view, update status, and manage orders
create policy "admins manage diwali orders" on public.diwali_orders
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());


-- 3. Add 'Diwali Gift Boxes' Category into Categories
insert into public.categories (name)
values ('Diwali Gift Boxes')
on conflict (name) do nothing;


-- 4. Insert / Update the 4 Diwali Gift Box Variants into Products Table
--    (So they appear in regular store catalogue, price list & PDF if desired)
with c as (
  select id from public.categories where name = 'Diwali Gift Boxes' limit 1
)
insert into public.products (
  category_id,
  name,
  image_url,
  mrp,
  member_price,
  wholesale_enabled,
  wholesale_price,
  wholesale_min_qty,
  is_available,
  is_image
)
select 
  c.id,
  v.name,
  null,
  v.price,
  v.price,
  true,
  v.wholesale_price,
  v.wholesale_min_qty,
  true,
  false
from c
cross join (
  values
    ('Diwali Gift Box: 4 Mini Boxes × 50g (Cashew, Almonds, Pista, Yellow Raisins)', 240.00, 225.00, 10),
    ('Diwali Gift Box: 4 Mini Boxes × 100g (Cashew, Almonds, Pista, Yellow Raisins)', 450.00, 430.00, 10),
    ('Diwali Gift Box: 6 Mini Boxes × 50g (Cashew, Almonds, Pista, Yellow Raisins, Black Raisins, Akrod)', 330.00, 315.00, 10),
    ('Diwali Gift Box: 6 Mini Boxes × 100g (Cashew, Almonds, Pista, Yellow Raisins, Black Raisins, Akrod)', 640.00, 610.00, 10)
) as v(name, price, wholesale_price, wholesale_min_qty)
where not exists (
  select 1 from public.products p where lower(p.name) = lower(v.name)
);

commit;


-- ============================================================
--  VERIFICATION QUERIES
-- ============================================================

-- Check Diwali Orders Table
select count(*) as total_orders from public.diwali_orders;

-- Check Diwali Gift Box Products
select 
  c.name as category,
  p.name,
  p.mrp,
  p.member_price,
  p.wholesale_price,
  p.wholesale_min_qty
from public.products p
join public.categories c on c.id = p.category_id
where c.name = 'Diwali Gift Boxes';
