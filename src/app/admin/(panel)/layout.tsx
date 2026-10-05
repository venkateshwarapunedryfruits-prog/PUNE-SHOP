import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { site } from "@/lib/site";
import { signOut } from "../actions";
import { AdminNav } from "./AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  if (!isSupabaseConfigured) {
    return (
      <Notice title="Supabase is not connected">
        Add your project URL and publishable key to <code>.env.local</code>, then restart the server. See README.md.
      </Notice>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    return (
      <Notice title="No admin access">
        <span className="font-medium">{user.email}</span> is not listed as an admin.
        <form action={signOut} className="mt-6">
          <button className="eyebrow rounded-full border border-forest px-5 py-2.5 text-forest">Sign out</button>
        </form>
      </Notice>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-30 bg-forest text-paper">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3 sm:px-8">
          <Link href="/admin" className="flex items-center gap-3">
            <Image src="/logo.webp" alt="" width={36} height={36} priority className="shrink-0 rounded-full" />
            <span className="hidden leading-tight sm:block">
              <span className="font-display block text-xl font-semibold">{site.name}</span>
              <span className="eyebrow block text-[0.6rem] text-gold">Admin</span>
            </span>
          </Link>
          <AdminNav />
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Link
              href="/"
              target="_blank"
              className="eyebrow hidden whitespace-nowrap rounded-full px-3 py-2 text-paper/70 transition hover:text-gold sm:inline-block"
            >
              View site ↗
            </Link>
            <form action={signOut}>
              <button className="eyebrow whitespace-nowrap rounded-full border border-paper/20 px-3 py-2 text-paper/90 transition hover:border-gold hover:text-gold sm:px-4">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 sm:py-10">{children}</main>
    </div>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-20">
      <div className="max-w-md rounded-3xl border border-line bg-paper p-10 text-center shadow-luxe">
        <p className="font-display text-3xl font-semibold text-forest">{title}</p>
        <div className="mt-3 text-sm leading-relaxed text-muted">{children}</div>
      </div>
    </main>
  );
}
