// Business details shown on the website — edit freely.
export const site = {
  name: "Venkateshwara",
  // Small gold line under the name in the header, also used in the browser tab title.
  tagline: "Dry Fruit Shop Pune",
  legalName: "Venkateshwara Co-operative Power & Agro Processing Ltd.",
  address: "Shoppers Orbit, Pune, Maharashtra",
  // What Google Maps should search for (place name or "lat,lng").
  mapQuery: "Shoppers Orbit Pune",
  phone: "+91 89562 91587",
};

export const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&output=embed`;
export const mapDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(site.mapQuery)}`;
