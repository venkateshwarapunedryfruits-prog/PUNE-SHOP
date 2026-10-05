import type { Metadata } from "next";
import Image from "next/image";
import { site } from "@/lib/site";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: `Admin Login — ${site.name}` };

export default function LoginPage() {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-forest px-5 py-16">
      {/* soft gold glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-gold/15 blur-3xl" />

      <div className="relative w-full max-w-md rounded-[28px] border border-gold/25 bg-paper p-8 shadow-2xl shadow-black/40 sm:p-10">
        <div className="flex flex-col items-center text-center">
          <Image src="/logo.webp" alt="" width={72} height={72} className="rounded-full ring-1 ring-line" priority />
          <p className="font-display mt-5 text-3xl font-semibold text-forest">{site.name}</p>
          <p className="eyebrow mt-2 text-gold">Admin Panel</p>
          <div className="mt-5 h-px w-12 bg-gold/60" />
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
