# Venkateshwara — Product Catalogue

A simple, premium product catalogue built with **Next.js 16** and **Supabase**.

- **Website** (`/`): products grouped by category, with category tabs, a name search and a store location with Google Maps.
  Each product shows its image, name, **MRP**, **Member price** and, if switched on, its **Wholesale price + minimum quantity**.
- **Admin panel** (`/admin`): login; add, rename and delete categories; add, edit and delete products; image upload.
  Switches control **Wholesale ON/OFF** and **Available ON/OFF**. A product that is switched off is hidden from the website.

---

## 1. Create the Supabase project (one time)

1. Go to <https://supabase.com>, then **New project**.
2. Open **SQL Editor**, then **New query**. Paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
3. *(Optional)* Run [`supabase/seed.sql`](supabase/seed.sql) the same way to load 3 starter categories and 19 products.
   The images are already in `public/products`.
   ⚠ The **prices in the seed file are samples**, so update them in the admin panel.
4. **Create your admin login:**
   1. **Authentication → Users → Add user → Create new user**: enter your email and a password, and tick *Auto Confirm User*.
   2. Back in the **SQL Editor**, allow that email to manage the catalogue:
      ```sql
      insert into public.admins (email) values ('you@example.com');
      ```
5. *(Recommended)* **Authentication → Sign In / Providers → Email**: turn off *Allow new users to sign up*.

## 2. Connect the app

Copy your keys from Supabase (**Project Settings → API Keys**, or the **Connect** button) into `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

The legacy `anon` key also works as the publishable key.

## 3. Run it

```bash
npm install      # first time only
npm run dev
```

- Website: <http://localhost:3000>
- Admin: <http://localhost:3000/admin>

For production use `npm run build && npm start`, or deploy to Vercel and add the same two environment variables.

---

## Changing business details

Edit [`src/lib/site.ts`](src/lib/site.ts) to change the company name, address, phone and the Google Maps location.
`mapQuery` can be a place name or exact coordinates such as `"18.5679,73.9143"`.

## How it is built

| Part | Where |
| --- | --- |
| Public catalogue | `src/app/page.tsx`, `src/components/catalog/*` |
| Admin pages | `src/app/admin/(panel)/*`, login at `src/app/admin/login` |
| Backend (server actions) | `src/app/admin/actions.ts` checks admin access on every action |
| Route protection | `src/proxy.ts` plus Supabase Row Level Security (`supabase/schema.sql`) |
| Product images | Supabase Storage bucket `product-images`, resized in the browser before upload |

Security: visitors can only read categories and products that are switched **on**. Only emails in the `admins` table can change anything.
