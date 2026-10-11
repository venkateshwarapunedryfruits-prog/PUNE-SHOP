import Image from "next/image";
import Link from "next/link";
import { DiwaliOrder } from "@/components/diwali/DiwaliOrder";
import { WhatsAppIcon } from "@/components/diwali/WhatsAppIcon";
import { DIWALI_BOXES } from "@/lib/diwali";
import { mapDirectionsUrl, site, whatsappNumber } from "@/lib/site";
import { formatPrice } from "@/lib/types";

export const dynamic = "force-dynamic";

const startingPrice = formatPrice(Math.min(...DIWALI_BOXES.map((b) => b.price)));
const telHref = `tel:${site.phone.replace(/\s/g, "")}`;

export const metadata = {
  title: `Diwali Dry Fruit Gift Boxes — ${site.displayName}`,
  description: `Diwali gift boxes with cashew, almonds, pista, raisins & walnut, from ${startingPrice}. Order online and collect from our shop at Shoppers Orbit, Pune.`,
};

const STEPS = ["Choose boxes • बॉक्स निवडा", "Enter name & mobile • नाव व मोबाईल", "Collect from shop • दुकानातून घ्या"];

export default function DiwaliPage() {
  return (
    <div className="min-h-screen bg-ivory text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Image
              src="/logo.webp"
              alt=""
              width={40}
              height={40}
              className="size-9 shrink-0 rounded-full ring-1 ring-line sm:size-10"
            />
            <span className="min-w-0">
              <span className="font-display block text-lg leading-none font-bold text-forest">{site.name}</span>
              <span className="mt-1 block text-[0.7rem] font-semibold text-muted">← Rate list • दर सूची</span>
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp us"
              className="flex size-10 items-center justify-center rounded-full bg-[#25D366] text-white transition hover:bg-[#20ba5a]"
            >
              <WhatsAppIcon className="size-5" />
            </a>
            <a
              href={telHref}
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-gold/40 bg-gold-soft/60 px-4 text-sm font-bold text-forest transition hover:bg-gold-soft"
            >
              📞 <span className="sm:hidden">Call</span>
              <span className="hidden sm:inline">{site.phone}</span>
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <section className="py-8 sm:py-12">
          <p className="eyebrow text-gold-deep">🪔 Shubh Deepavali • शुभ दीपावली</p>
          <h1 className="font-display mt-2 text-3xl leading-tight font-extrabold text-forest sm:text-5xl">
            Dry Fruit Gift Boxes
          </h1>
          <p className="mt-1 text-lg font-semibold text-gold-deep sm:text-xl">सुकामेवा गिफ्ट बॉक्स</p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Cashew, almonds, pista, raisins and walnut in festive boxes, from {startingPrice}. Choose your boxes,
            place your order, and collect from our shop at Shoppers Orbit, Pune.
          </p>

          <ol className="mt-5 flex flex-wrap gap-x-6 gap-y-2.5 text-sm font-semibold text-ink">
            {STEPS.map((step, i) => (
              <li key={step} className="flex items-center gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-forest text-xs font-bold text-gold-soft">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </section>

        <DiwaliOrder />
      </main>

      <section className="bg-forest text-paper">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Questions? • काही शंका?</h2>
            <p className="mt-1 text-sm text-gold-soft">Call or WhatsApp us • फोन किंवा व्हॉट्सअ‍ॅप करा</p>
            <p className="mt-3 text-sm leading-relaxed text-paper/80">
              {site.addressBilingual}
              <br />
              {site.timings}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#20ba5a]"
            >
              <WhatsAppIcon /> WhatsApp
            </a>
            <a
              href={telHref}
              className="inline-flex items-center gap-2 rounded-full bg-paper px-5 py-3 text-sm font-bold text-forest transition hover:bg-gold-soft"
            >
              📞 {site.phone}
            </a>
            <a
              href={mapDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-5 py-3 text-sm font-bold text-gold-soft transition hover:bg-paper/10"
            >
              📍 Directions • मार्ग
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-line bg-paper py-6 text-center text-xs text-muted">
        © {new Date().getFullYear()} {site.legalName}
      </footer>
    </div>
  );
}
