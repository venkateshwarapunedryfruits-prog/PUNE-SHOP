// Business details shown on the website — edit freely.
export const site = {
  name: "Venkateshwara",
  marathiName: "व्यंकटेश्‍वरा",
  displayName: "Venkateshwara Dry Fruits • व्यंकटेश्‍वरा ड्रायफ्रूट्स",
  tagline: "Pune Shop • Official Rate List & Diwali Gift Boxes",
  taglineBilingual: "पुणे शॉप • अधिकृत दर यादी (Official Rate List)",
  legalName: "Venkateshwara Co-operative Power & Agro Processing Ltd.",
  address: "Shoppers Orbit, Pune, Maharashtra",
  addressBilingual: "Shoppers Orbit, Pune, Maharashtra (शॉपर्स ऑर्बिट, पुणे)",
  mapQuery: "Shoppers Orbit Pune",
  phone: "+91 89562 91587",
  timings: "9:00 AM to 10:00 PM (All 7 Days Open • सर्व दिवस सुरू)",
};

/** Phone number in the digits-only form wa.me links expect. */
export const whatsappNumber = site.phone.replace(/\D/g, "");

export const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&output=embed`;
export const mapDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(site.mapQuery)}`;
