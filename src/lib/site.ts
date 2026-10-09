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
  timings: "10:00 AM to 9:00 PM (All 7 Days Open • सर्व दिवस सुरू)",
  pickupSlots: [
    { id: "slot-morning", label: "Morning / सकाळ: 10:00 AM – 1:00 PM", timeRange: "10:00 AM - 1:00 PM" },
    { id: "slot-afternoon", label: "Afternoon / दुपार: 1:00 PM – 5:00 PM", timeRange: "1:00 PM - 5:00 PM" },
    { id: "slot-evening", label: "Evening / संध्याकाळ: 5:00 PM – 9:00 PM", timeRange: "5:00 PM - 9:00 PM" },
  ],
};

export const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&output=embed`;
export const mapDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(site.mapQuery)}`;
