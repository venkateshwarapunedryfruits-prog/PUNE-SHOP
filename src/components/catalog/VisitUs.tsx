import { mapDirectionsUrl, mapEmbedUrl, site } from "@/lib/site";

export function VisitUs() {
  return (
    <section id="visit" className="mt-16 scroll-mt-8 border-t border-line bg-forest text-paper">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1fr_1.5fr] md:items-center md:py-20">
        <div>
          <span className="eyebrow text-gold">Visit Us • आमचे दुकान</span>
          <h2 className="font-display mt-2 text-3xl font-bold sm:text-4xl md:text-5xl">
            Our Pune Store
          </h2>
          <p className="mt-1 text-sm text-gold-soft font-semibold">
            {site.marathiName} — शॉपर्स ऑर्बिट, पुणे
          </p>
          <div className="mt-4 h-px w-16 bg-gold" />

          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="eyebrow text-gold/80">Store Address • पत्ता</dt>
              <dd className="mt-1 text-base leading-relaxed text-paper/90">
                {site.legalName}
                <br />
                {site.addressBilingual}
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-gold/80">Store Timings • दुकानाची वेळ</dt>
              <dd className="mt-1 text-base font-semibold text-gold-soft">
                {site.timings}
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-gold/80">Phone • संपर्क</dt>
              <dd className="mt-1 text-base">
                <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="font-bold text-paper/90 transition hover:text-gold">
                  📞 {site.phone}
                </a>
              </dd>
            </div>
          </dl>

          <a
            href={mapDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="eyebrow mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-forest transition hover:bg-gold-soft cursor-pointer"
          >
            <span>Get Directions (गुगल मॅप मार्ग)</span>
            <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
              <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        <div className="overflow-hidden rounded-3xl border border-gold/30 shadow-2xl shadow-black/30">
          <iframe
            title={`Map showing ${site.name} store location`}
            src={mapEmbedUrl}
            className="block h-[340px] w-full sm:h-[420px]"
            style={{ border: 0, filter: "grayscale(0.2) contrast(1.05)" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
