-- ============================================================
--  Venkateshwara Catalogue — database schema
--  Run this once in Supabase → SQL Editor → New query → Run
-- ============================================================

-- ---------- Admins ----------
-- Only emails listed here can manage the catalogue.
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;
-- (no policies: the table is never readable through the public API)

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ---------- Categories ----------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique check (length(trim(name)) > 0),
  created_at  timestamptz not null default clock_timestamp()
);

-- ---------- Products ----------
create table if not exists public.products (
  id                 uuid primary key default gen_random_uuid(),
  category_id        uuid not null references public.categories(id) on delete restrict,
  name               text not null check (length(trim(name)) > 0),
  image_url          text,
  mrp                numeric(10,2) not null check (mrp >= 0),
  member_price       numeric(10,2) not null check (member_price >= 0),
  wholesale_enabled  boolean not null default false,
  wholesale_price    numeric(10,2) check (wholesale_price >= 0),
  wholesale_min_qty  integer check (wholesale_min_qty > 0),
  is_available       boolean not null default true,
  created_at         timestamptz not null default clock_timestamp(),
  constraint wholesale_complete check (
    not wholesale_enabled
    or (wholesale_price is not null and wholesale_min_qty is not null)
  )
);
create index if not exists products_category_idx on public.products(category_id);

-- ---------- Row Level Security ----------
alter table public.categories enable row level security;
alter table public.products   enable row level security;

drop policy if exists "categories are public"   on public.categories;
drop policy if exists "admins manage categories" on public.categories;
drop policy if exists "available products are public" on public.products;
drop policy if exists "admins manage products"  on public.products;

create policy "categories are public" on public.categories
  for select using (true);

create policy "admins manage categories" on public.categories
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Visitors only ever see products that are switched ON.
create policy "available products are public" on public.products
  for select using (is_available or public.is_admin());

create policy "admins manage products" on public.products
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- Image storage ----------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "admins read product images"   on storage.objects;
drop policy if exists "admins upload product images" on storage.objects;
drop policy if exists "admins update product images" on storage.objects;
drop policy if exists "admins delete product images" on storage.objects;

-- (visitors load images through the public URL; this is for the storage API, e.g. removing old photos)
create policy "admins read product images" on storage.objects
  for select to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

create policy "admins upload product images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "admins update product images" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

create policy "admins delete product images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
