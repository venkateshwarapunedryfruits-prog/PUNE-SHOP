"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/diwali-orders", label: "🪔 Diwali Orders" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="ml-1 flex gap-0.5 sm:ml-8 sm:gap-1">
      {links.map((l) => {
        const active = l.href === "/admin" ? pathname === "/admin" || pathname.startsWith("/admin/products") : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`whitespace-nowrap rounded-full px-3 py-2 text-sm transition sm:px-4 ${
              active ? "bg-paper/10 font-semibold text-gold" : "text-paper/75 hover:text-paper"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
