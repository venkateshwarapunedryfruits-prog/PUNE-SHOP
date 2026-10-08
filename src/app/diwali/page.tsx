import Link from "next/link";
import { DIWALI_BOXES } from "@/lib/diwali";
import { DiwaliOrderForm } from "@/components/diwali/DiwaliOrderForm";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Diwali Dry Fruit Gift Boxes — ${site.name}`,
  description: "Handcrafted Diwali gift boxes with premium cashew, almonds, pista, raisins & walnut. Order custom festive packs starting at ₹240.",
};

export default function DiwaliPage() {
  return (
    <div className="min-h-screen bg-ivory text-ink">
      {/* Top Navigation */}
      <header className="border-b border-line bg-paper/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest transition hover:text-gold-deep"
          >
            ← Back to Store Catalogue
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted sm:inline">Questions? Call:</span>
            <a
              href={`tel:${site.phone}`}
              className="rounded-full border border-gold/40 bg-gold-soft/50 px-3 py-1 text-xs font-bold text-forest hover:bg-gold-soft"
            >
              📞 {site.phone}
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-12">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#12301f] via-[#214f35] to-[#12301f] p-6 text-paper shadow-luxe sm:p-10 md:p-12">
          <div className="pointer-events-none absolute -right-10 -top-10 size-64 rounded-full bg-gold/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 size-64 rounded-full bg-forest-2/50 blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/20 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-gold-soft">
              🪔 Shubh Deepavali Exclusive
            </span>
            <h1 className="font-display mt-3 text-3xl font-extrabold leading-tight text-paper sm:text-4xl md:text-5xl">
              Handcrafted Dry Fruit Gift Boxes
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-gold-soft/90 sm:text-base">
              Celebrate the festival of lights with the purest dry fruits from Venkateshwara Pune.
              Packed in luxury festive gift boxes with transparent wholesale pricing.
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-xs sm:gap-3">
              <span className="rounded-lg bg-paper/10 px-3 py-1.5 backdrop-blur-xs font-semibold">
                ✓ 4 Mini Box & 6 Mini Box Formats
              </span>
              <span className="rounded-lg bg-paper/10 px-3 py-1.5 backdrop-blur-xs font-semibold">
                ✓ Starting from ₹240 / Box
              </span>
              <span className="rounded-lg bg-paper/10 px-3 py-1.5 backdrop-blur-xs font-semibold">
                ✓ Bulk Corporate & Family Orders
              </span>
            </div>
          </div>
        </div>

        {/* The 4 Box Options Grid */}
        <section className="mt-12 sm:mt-16">
          <div className="border-b border-line pb-4">
            <span className="eyebrow text-gold-deep">Our 4 Festive Variants</span>
            <h2 className="font-display mt-1 text-2xl font-bold text-forest sm:text-3xl">
              Choose Your Perfect Gift Box
            </h2>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {DIWALI_BOXES.map((box) => (
              <div
                key={box.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-paper p-5 shadow-xs transition duration-200 hover:-translate-y-1 hover:border-gold hover:shadow-luxe"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-gold-soft px-2.5 py-0.5 text-[0.62rem] font-bold text-gold-deep">
                      {box.badge}
                    </span>
                    <span className="text-xs font-bold text-muted">{box.totalWeight}g Net</span>
                  </div>

                  <h3 className="font-display mt-3 text-xl font-bold text-ink">
                    {box.shortTitle}
                  </h3>

                  <p className="mt-1 text-xs text-muted leading-relaxed">
                    {box.description}
                  </p>

                  <div className="mt-4 rounded-xl border border-line/80 bg-ivory/50 p-3">
                    <p className="eyebrow text-[0.6rem] text-muted">Box Contents ({box.weightPerBox}g each):</p>
                    <ul className="mt-1 space-y-0.5 text-xs font-medium text-ink">
                      {box.contents.map((c, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="text-gold">•</span> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-5 border-t border-line pt-3">
                  <div className="flex items-baseline justify-between">
                    <span className="eyebrow text-muted">All-Inclusive</span>
                    <span className="text-2xl font-extrabold text-forest">{formatPrice(box.price)}</span>
                  </div>
                  <a
                    href="#order-form"
                    className="mt-3 block w-full rounded-full bg-forest py-2.5 text-center text-xs font-bold uppercase tracking-wider text-paper transition hover:bg-forest-2 active:scale-98"
                  >
                    Select & Order
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Order Section */}
        <section id="order-form" className="mt-12 sm:mt-16">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-6">
              <span className="eyebrow text-gold-deep">Fast & Easy</span>
              <h2 className="font-display text-2xl font-bold text-forest sm:text-3xl">
                Place Your Custom Diwali Order
              </h2>
              <p className="mt-1 text-xs text-muted sm:text-sm">
                Enter your quantities and contact details. We confirm orders instantly and provide WhatsApp updates.
              </p>
            </div>

            <DiwaliOrderForm />
          </div>
        </section>
      </main>

      <footer className="mt-16 border-t border-line bg-paper py-6 text-center text-xs text-muted">
        <p>© {new Date().getFullYear()} {site.legalName} • {site.address}</p>
        <p className="mt-1 text-gold">Happy Diwali & Prosperous New Year</p>
      </footer>
    </div>
  );
}
