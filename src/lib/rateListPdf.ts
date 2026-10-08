import { site } from "./site";
import type { Category, Product } from "./types";

declare global {
  interface Window {
    jspdf?: {
      jsPDF: new (options?: { orientation?: "p" | "portrait" | "l" | "landscape"; unit?: "pt" | "mm" | "in" | "px"; format?: string | number[] }) => any;
    };
  }
}

/** Formats currency strictly using ASCII "Rs." so standard PDF Helvetica never hides or clips digits. */
function pdfPrice(value: number | string | null | undefined): string {
  if (value == null) return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return "—";
  return `Rs. ${num.toLocaleString("en-IN")}`;
}

/** Loads an external script dynamically. */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

/** Ensures jsPDF and jspdf-autotable are loaded on the window. */
async function loadJsPdfAndAutoTable(): Promise<any> {
  if (window.jspdf?.jsPDF) {
    return window.jspdf.jsPDF;
  }
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js");
  if (!window.jspdf?.jsPDF) {
    throw new Error("jsPDF was not initialized");
  }
  return window.jspdf.jsPDF;
}

export type ExportRateListOptions = {
  categories: Category[];
  products: Product[];
  selectedCategoryId?: string;
};

/**
 * Downloads the Rate List as a clean, branded PDF file.
 * Formats all numbers clearly with zero truncation.
 */
export async function downloadRateListPdf({
  categories,
  products,
  selectedCategoryId,
}: ExportRateListOptions): Promise<void> {
  const relevantCategories =
    selectedCategoryId && selectedCategoryId !== "all"
      ? categories.filter((c) => c.id === selectedCategoryId)
      : categories;

  const sections = relevantCategories
    .map((c) => ({
      ...c,
      products: products.filter((p) => p.category_id === c.id && p.is_available),
    }))
    .filter((s) => s.products.length > 0);

  if (sections.length === 0) {
    alert("No active products available to export.");
    return;
  }

  try {
    const jsPDFConstructor = await loadJsPdfAndAutoTable();
    const doc = new jsPDFConstructor({ orientation: "portrait", unit: "mm", format: "a4" });

    const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
    const margin = 12; // 12mm margins each side -> 186mm table width
    const today = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    // --- Header Banner ---
    doc.setFillColor(18, 48, 31); // Forest Green #12301f
    doc.rect(0, 0, pageWidth, 28, "F");

    // Gold accent stripe
    doc.setFillColor(169, 132, 74); // Gold #a9844a
    doc.rect(0, 28, pageWidth, 2.5, "F");

    // Title & Tagline
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(site.name.toUpperCase(), margin, 11);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(241, 231, 211); // soft gold
    doc.text(site.tagline, margin, 17);
    doc.text(`${site.address}  |  Tel: ${site.phone}`, margin, 23);

    // Right-aligned header badge
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text("OFFICIAL RATE LIST", pageWidth - margin, 12, { align: "right" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Updated: ${today}`, pageWidth - margin, 18, { align: "right" });

    let currentY = 36;

    // --- Category Sections & Tables ---
    sections.forEach((section) => {
      // Check if page needs break before category header
      if (currentY > pageHeight - 45) {
        doc.addPage();
        currentY = 16;
      }

      // Category Section Title Banner
      doc.setFillColor(241, 231, 211); // Light gold
      doc.roundedRect(margin, currentY, pageWidth - margin * 2, 8, 1.5, 1.5, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(18, 48, 31);
      doc.text(section.name.toUpperCase(), margin + 3, currentY + 5.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(123, 115, 102);
      doc.text(`${section.products.length} Items`, pageWidth - margin - 3, currentY + 5.5, { align: "right" });

      currentY += 10;

      // Clean ASCII Table Data (Never clips numbers)
      const tableBody = section.products.map((p, idx) => {
        const wholesaleStr =
          p.wholesale_enabled && p.wholesale_price != null ? pdfPrice(p.wholesale_price) : "—";
        const minQtyStr =
          p.wholesale_enabled && p.wholesale_min_qty != null ? `${p.wholesale_min_qty} pcs` : "Single";

        return [
          String(idx + 1),
          p.name,
          pdfPrice(p.mrp),
          pdfPrice(p.member_price),
          wholesaleStr,
          minQtyStr,
        ];
      });

      (doc as any).autoTable({
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [["#", "Product Name / Fragrance", "MRP", "Member Rate", "Wholesale Rate", "Min Qty"]],
        body: tableBody,
        theme: "grid",
        styles: {
          font: "helvetica",
          fontSize: 8.5,
          cellPadding: 2.8,
          lineColor: [225, 218, 203],
          lineWidth: 0.2,
          textColor: [29, 27, 22],
          overflow: "linebreak",
        },
        headStyles: {
          fillColor: [18, 48, 31],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8.5,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [250, 247, 240],
        },
        columnStyles: {
          0: { cellWidth: 8, halign: "center", fontStyle: "bold" },
          1: { cellWidth: 80, fontStyle: "bold" }, // Generous width for product names
          2: { cellWidth: 24, halign: "right", textColor: [120, 110, 100] },
          3: { cellWidth: 25, halign: "right", fontStyle: "bold", textColor: [18, 48, 31] },
          4: { cellWidth: 26, halign: "right", fontStyle: "bold", textColor: [138, 106, 54] },
          5: { cellWidth: 23, halign: "center", textColor: [90, 85, 80] },
        },
        didDrawPage: (data: any) => {
          // Bottom Footer
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(140, 140, 140);
          doc.text(
            `${site.legalName} • Rates subject to change without notice`,
            margin,
            pageHeight - 6,
          );
          doc.text(`Page ${data.pageNumber}`, pageWidth - margin, pageHeight - 6, { align: "right" });
        },
      });

      currentY = (doc as any).lastAutoTable.finalY + 8;
    });

    // Save PDF
    const filename = `${site.name.toLowerCase().replace(/\s+/g, "-")}-rate-list-${today.replace(/\s+/g, "-")}.pdf`;
    doc.save(filename);
  } catch (error) {
    console.warn("jsPDF dynamic load error, falling back to printable view:", error);
    printRateSheetFallback({ categories, products, selectedCategoryId });
  }
}

/** Fallback printable rate sheet view with crystal clear layout. */
export function printRateSheetFallback({
  categories,
  products,
  selectedCategoryId,
}: ExportRateListOptions): void {
  const relevantCategories =
    selectedCategoryId && selectedCategoryId !== "all"
      ? categories.filter((c) => c.id === selectedCategoryId)
      : categories;

  const sections = relevantCategories
    .map((c) => ({
      ...c,
      products: products.filter((p) => p.category_id === c.id && p.is_available),
    }))
    .filter((s) => s.products.length > 0);

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow pop-ups to open the printable Rate List.");
    return;
  }

  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>${site.name} — Rate List (${today})</title>
      <style>
        @page { size: A4 portrait; margin: 12mm 14mm; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: system-ui, -apple-system, sans-serif; color: #1d1b16; background: #fff; line-height: 1.4; padding: 12px; }
        .header { border-bottom: 3px solid #a9844a; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
        .title { font-size: 24px; font-weight: 800; color: #12301f; text-transform: uppercase; }
        .tagline { font-size: 11px; color: #a9844a; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 2px; }
        .contact { font-size: 11px; color: #7b7366; margin-top: 4px; }
        .meta { text-align: right; font-size: 11px; color: #7b7366; }
        .badge { display: inline-block; background: #12301f; color: #fff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 4px; margin-bottom: 4px; }
        .category-block { margin-bottom: 22px; page-break-inside: avoid; }
        .cat-title { background: #f6f1e7; color: #12301f; font-size: 13px; font-weight: 700; padding: 6px 12px; border-left: 4px solid #a9844a; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; display: flex; justify-content: space-between; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { background: #12301f; color: #fff; font-weight: 600; text-align: left; padding: 7px 10px; font-size: 11px; }
        td { padding: 7px 10px; border-bottom: 1px solid #e5dccb; }
        tr:nth-child(even) { background: #faf8f5; }
        .num { width: 28px; text-align: center; font-weight: 600; }
        .name { font-weight: 600; color: #12301f; max-width: 250px; }
        .mrp { text-align: right; color: #7b7366; text-decoration: line-through; white-space: nowrap; }
        .member { text-align: right; font-weight: 700; color: #12301f; white-space: nowrap; }
        .wholesale { text-align: right; font-weight: 700; color: #8a6a36; white-space: nowrap; }
        .qty { text-align: center; color: #7b7366; white-space: nowrap; }
        .footer { margin-top: 30px; font-size: 10px; color: #888; text-align: center; border-top: 1px solid #ddd; padding-top: 10px; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 15px; display: flex; gap: 10px;">
        <button onclick="window.print()" style="background: #12301f; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer;">Print / Save as PDF</button>
        <button onclick="window.close()" style="background: #eee; border: 1px solid #ccc; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Close</button>
      </div>

      <div class="header">
        <div>
          <div class="title">${site.name}</div>
          <div class="tagline">${site.tagline}</div>
          <div class="contact">${site.address} • Tel: ${site.phone}</div>
        </div>
        <div class="meta">
          <div class="badge">OFFICIAL RATE LIST</div>
          <div>Issued: ${today}</div>
        </div>
      </div>

      ${sections
        .map(
          (s) => `
        <div class="category-block">
          <div class="cat-title">
            <span>${s.name}</span>
            <span style="font-size: 10px; font-weight: normal; color: #7b7366;">${s.products.length} Products</span>
          </div>
          <table>
            <thead>
              <tr>
                <th class="num">#</th>
                <th>Product Name / Fragrance</th>
                <th style="text-align: right;">MRP</th>
                <th style="text-align: right;">Member Price</th>
                <th style="text-align: right;">Wholesale Rate</th>
                <th style="text-align: center;">Min Qty</th>
              </tr>
            </thead>
            <tbody>
              ${s.products
                .map(
                  (p, i) => `
                <tr>
                  <td class="num">${i + 1}</td>
                  <td class="name">${p.name}</td>
                  <td class="mrp">${pdfPrice(p.mrp)}</td>
                  <td class="member">${pdfPrice(p.member_price)}</td>
                  <td class="wholesale">${p.wholesale_enabled && p.wholesale_price != null ? pdfPrice(p.wholesale_price) : "—"}</td>
                  <td class="qty">${p.wholesale_enabled && p.wholesale_min_qty != null ? p.wholesale_min_qty + " pcs" : "Single"}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `,
        )
        .join("")}

      <div class="footer">
        © ${new Date().getFullYear()} ${site.legalName} • All prices are subject to change without prior notice.
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 400);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
