import Link from "next/link";
import Image from "next/image";
import { DIWALI_BOXES } from "@/lib/diwali";
import { DiwaliOrderForm } from "@/components/diwali/DiwaliOrderForm";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Diwali Dry Fruit Gift Boxes — ${site.displayName}`,
  description: "Handcrafted Diwali gift boxes packed with premium cashew, almonds, pista, raisins & walnut. Order custom festive packs starting at ₹240. Shoppers Orbit Pune.",
};

export default function DiwaliPage() {
  return (
    <div className="min-h-screen bg-ivory text-ink">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8 sm:py-4">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest transition hover:text-gold-deep"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            <span>Back to Rate List • मुख्य दर सूची</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted sm:inline">Store Enquiry:</span>
            <a
              href={`tel:${site.phone.replace(/\s/g, "")}`}
              className="rounded-full border border-gold/40 bg-gold-soft/50 px-3.5 py-1.5 text-xs font-bold text-forest hover:bg-gold-soft"
            >
              📞 {site.phone}
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-10">
        {/* Festive Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#12301f] via-[#214f35] to-[#12301f] p-6 text-paper shadow-luxe sm:p-10 md:p-12">
          <div className="pointer-events-none absolute -right-10 -top-10 size-64 rounded-full bg-gold/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 size-64 rounded-full bg-forest-2/50 blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/20 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-gold-soft">
              <span>🪔</span>
              <span>Shubh Deepavali Special • दिवाळी भेट बॉक्सेस</span>
            </div>

            <h1 className="font-display mt-3 text-2xl font-extrabold leading-tight text-paper sm:text-4xl md:text-5xl">
              Handcrafted Dry Fruit Gift Boxes
            </h1>
            <p className="mt-1 text-sm font-medium text-gold sm:text-lg">
              हातसफाईने तयार केलेले दर्जेदार सुकामेवा गिफ्ट बॉक्सेस
            </p>

            <p className="mt-3 text-xs leading-relaxed text-gold-soft/90 sm:text-sm md:text-base">
              Celebrate this Diwali with the finest Californian Almonds, Jumbo Cashews, Irani Pistachios, Golden Raisins & Walnuts from Venkateshwara Pune.
              Packed in designer festive boxes with transparent pricing.
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-xs sm:gap-3">
              <span className="rounded-lg bg-paper/10 px-3 py-1.5 font-semibold backdrop-blur-xs">
                ✓ 4 Mini Box & 6 Mini Box Formats
              </span>
              <span className="rounded-lg bg-paper/10 px-3 py-1.5 font-semibold backdrop-blur-xs">
                ✓ Starting at ₹240 / Filled Box
              </span>
              <span className="rounded-lg bg-paper/10 px-3 py-1.5 font-semibold backdrop-blur-xs">
                ✓ 100% Filled Boxes • भरलेले डबे
              </span>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------
            THE 4 FESTIVE VARIANTS (WITH REAL PHOTOS FROM USER)
            ------------------------------------------------------------- */}
        <section className="mt-10 sm:mt-14">
          <div className="border-b border-line pb-4">
            <span className="eyebrow text-gold-deep">Our 4 Festive Options • ४ खास पर्याय</span>
            <h2 className="font-display mt-1 text-2xl font-bold text-forest sm:text-3xl">
              Choose Your Festive Gift Box
            </h2>
            <p className="mt-0.5 text-xs text-muted sm:text-sm">
              Each variant is shown with its real festive box and filled dry fruit compartments.
            </p>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {DIWALI_BOXES.map((box) => (
              <div
                key={box.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-paper shadow-xs transition duration-200 hover:-translate-y-1 hover:border-gold hover:shadow-luxe"
              >
                <div>
                  {/* Real Image of the Box (Full set with lid + filled tray) */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-ivory">
                    <Image
                      src={box.image}
                      alt={box.name}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-2.5 left-2.5 rounded-full bg-forest/90 px-2.5 py-0.5 text-[0.62rem] font-bold text-gold-soft backdrop-blur-xs">
                      {box.totalWeight}g Net Total
                    </div>
                    {box.badge && (
                      <div className="absolute top-2.5 right-2.5 rounded-full bg-gold px-2.5 py-0.5 text-[0.62rem] font-bold text-paper shadow-2xs">
                        {box.badge}
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Previews: Tray & Lid */}
                  <div className="flex items-center gap-1.5 px-4 pt-2.5">
                    {box.images.slice(1).map((thumbUrl, idx) => (
                      <div
                        key={idx}
                        className="relative size-10 overflow-hidden rounded-md border border-line bg-white shadow-2xs"
                        title={idx === 0 ? "Filled Dry Fruit Tray" : "Festive Lid"}
                      >
                        <Image
                          src={thumbUrl}
                          alt={`${box.shortTitle} preview ${idx + 1}`}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    ))}
                    <span className="text-[0.62rem] font-medium text-muted pl-1">
                      {box.boxCount} डबे (Boxes)
                    </span>
                  </div>

                  <div className="p-4 pt-3">
                    <h3 className="font-display text-lg font-bold text-ink">
                      {box.shortTitle}
                    </h3>

                    <p className="mt-1 text-xs text-muted leading-relaxed">
                      {box.description}
                    </p>

                    <div className="mt-3.5 rounded-xl border border-line/80 bg-ivory/60 p-3">
                      <p className="eyebrow text-[0.58rem] text-muted">
                        Box Contents ({box.weightPerBox}g each • {box.boxCount} डबे):
                      </p>
                      <ul className="mt-1.5 space-y-1 text-xs font-medium text-ink">
                        {box.contents.map((c, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="size-1 rounded-full bg-gold" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Price and Pre-Order Button */}
                <div className="border-t border-line bg-white/70 p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="eyebrow text-muted">All-Inclusive (पूर्ण दर)</span>
                    <span className="text-2xl font-extrabold text-forest">{formatPrice(box.price)}</span>
                  </div>
                  <a
                    href="#order-form"
                    className="mt-3 block w-full rounded-full bg-forest py-2.5 text-center text-xs font-bold uppercase tracking-wider text-paper shadow-sm transition hover:bg-forest-2 active:scale-98"
                  >
                    Select & Pre-Order (ऑर्डर करा) →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* -------------------------------------------------------------
            PRE-ORDER SECTION
            ------------------------------------------------------------- */}
        <section id="order-form" className="mt-14 scroll-mt-20 sm:mt-20">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-6">
              <span className="eyebrow text-gold-deep">Easy Online Pre-Order • सोपी प्री-ऑर्डर</span>
              <h2 className="font-display text-2xl font-bold text-forest sm:text-3xl">
                Pre-Order Your Diwali Gift Boxes
              </h2>
              <p className="mt-1 text-xs text-muted sm:text-sm">
                Select your required boxes, choose your convenient pickup date & time slot. Collect freshly packed boxes from our shop at Shoppers Orbit, Pune.
              </p>
            </div>

            <DiwaliOrderForm />
          </div>
        </section>
      </main>

      <footer className="mt-16 border-t border-line bg-paper py-8 text-center text-xs text-muted">
        <p>© {new Date().getFullYear()} {site.legalName}</p>
        <p className="mt-1 font-medium text-ink">{site.addressBilingual}</p>
        <p className="mt-2 text-gold">Happy Diwali & Prosperous New Year • शुभ दीपावली</p>
      </footer>
    </div>
  );
}
