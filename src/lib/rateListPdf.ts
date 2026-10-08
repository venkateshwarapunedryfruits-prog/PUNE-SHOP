import { site } from "./site";
import { formatPrice, type Category, type Product } from "./types";

declare global {
  interface Window {
    jspdf?: {
      jsPDF: new (options?: { orientation?: "p" | "portrait" | "l" | "landscape"; unit?: "pt" | "mm" | "in" | "px"; format?: string | number[] }) => any;
    };
  }
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
 * Falls back to a clean printable print-to-PDF window if external scripts fail.
 */
export async function downloadRateListPdf({
  categories,
  products,
  selectedCategoryId,
}: ExportRateListOptions): Promise<void> {
  // Filter products according to category selection
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

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const today = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    // --- Header ---
    doc.setFillColor(18, 48, 31); // Forest Green #12301f
    doc.rect(0, 0, pageWidth, 28, "F");

    // Gold accent stripe
    doc.setFillColor(169, 132, 74); // Gold #a9844a
    doc.rect(0, 28, pageWidth, 2, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(site.name.toUpperCase(), 14, 11);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(241, 231, 211); // soft gold
    doc.text(site.tagline, 14, 17);
    doc.text(`${site.address}  |  Tel: ${site.phone}`, 14, 23);

    // Right-aligned header badge
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text("RATE LIST", pageWidth - 14, 12, { align: "right" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Updated: ${today}`, pageWidth - 14, 18, { align: "right" });

    let currentY = 36;

    // --- Category Sections & Tables ---
    sections.forEach((section) => {
      // Check if near bottom of page
      if (currentY > pageHeight - 40) {
        doc.addPage();
        currentY = 16;
      }

      // Category Section Title
      doc.setFillColor(241, 231, 211); // Light gold accent block
      doc.roundedRect(14, currentY, pageWidth - 28, 7.5, 1.5, 1.5, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(18, 48, 31);
      doc.text(section.name.toUpperCase(), 17, currentY + 5.2);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(123, 115, 102);
      doc.text(`${section.products.length} products`, pageWidth - 17, currentY + 5.2, { align: "right" });

      currentY += 9;

      // Table Data
      const tableBody = section.products.map((p, idx) => {
        const wholesaleStr =
          p.wholesale_enabled && p.wholesale_price != null ? formatPrice(p.wholesale_price) : "—";
        const minQtyStr =
          p.wholesale_enabled && p.wholesale_min_qty != null ? `${p.wholesale_min_qty} pcs` : "—";

        return [
          String(idx + 1),
          p.name,
          formatPrice(p.mrp),
          formatPrice(p.member_price),
          wholesaleStr,
          minQtyStr,
        ];
      });

      (doc as any).autoTable({
        startY: currentY,
        margin: { left: 14, right: 14 },
        head: [["#", "Product Name", "MRP", "Member Price", "Wholesale Rate", "Min Qty"]],
        body: tableBody,
        theme: "grid",
        styles: {
          fontSize: 8.5,
          cellPadding: 2.2,
          lineColor: [229, 220, 203], // #e5dccb
          lineWidth: 0.2,
          textColor: [29, 27, 22],
        },
        headStyles: {
          fillColor: [18, 48, 31],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8.5,
          halign: "left",
        },
        alternateRowStyles: {
          fillColor: [251, 248, 241],
        },
        columnStyles: {
          0: { cellWidth: 8, halign: "center", fontStyle: "bold" },
          1: { cellWidth: "auto", fontStyle: "bold" },
          2: { cellWidth: 24, halign: "right", textColor: [123, 115, 102] },
          3: { cellWidth: 28, halign: "right", fontStyle: "bold", textColor: [18, 48, 31] },
          4: { cellWidth: 28, halign: "right", fontStyle: "bold", textColor: [138, 106, 54] },
          5: { cellWidth: 22, halign: "center", textColor: [123, 115, 102] },
        },
        didDrawPage: (data: any) => {
          // Footer on each page
          const str = `Page ${data.pageNumber}`;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(150, 150, 150);
          doc.text(
            `${site.legalName} • Subject to change without prior notice`,
            14,
            pageHeight - 6,
          );
          doc.text(str, pageWidth - 14, pageHeight - 6, { align: "right" });
        },
      });

      currentY = (doc as any).lastAutoTable.finalY + 8;
    });

    // Save File
    const filename = `${site.name.toLowerCase().replace(/\s+/g, "-")}-rate-list-${today.replace(/\s+/g, "-")}.pdf`;
    doc.save(filename);
  } catch (error) {
    console.warn("jsPDF dynamic load error, falling back to printable view:", error);
    printRateSheetFallback({ categories, products, selectedCategoryId });
  }
}

/** Fallback printable rate sheet view in case CDN scripts are blocked. */
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
        @page { size: A4 portrait; margin: 12mm 15mm; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: system-ui, -apple-system, sans-serif; color: #1d1b16; background: #fff; line-height: 1.4; padding: 10px; }
        .header { border-bottom: 2px solid #a9844a; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
        .title { font-size: 24px; font-weight: 700; color: #12301f; text-transform: uppercase; }
        .tagline { font-size: 11px; color: #a9844a; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 2px; }
        .contact { font-size: 11px; color: #7b7366; margin-top: 4px; }
        .meta { text-align: right; font-size: 11px; color: #7b7366; }
        .badge { display: inline-block; background: #12301f; color: #fff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 4px; margin-bottom: 4px; }
        .category-block { margin-bottom: 22px; page-break-inside: avoid; }
        .cat-title { background: #f6f1e7; color: #12301f; font-size: 13px; font-weight: 700; padding: 6px 10px; border-left: 4px solid #a9844a; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { background: #12301f; color: #fff; font-weight: 600; text-align: left; padding: 6px 8px; font-size: 11px; }
        td { padding: 6px 8px; border-bottom: 1px solid #e5dccb; }
        tr:nth-child(even) { background: #faf8f5; }
        .num { width: 24px; text-align: center; font-weight: 600; }
        .name { font-weight: 600; color: #12301f; }
        .mrp { text-align: right; color: #7b7366; text-decoration: line-through; }
        .member { text-align: right; font-weight: 700; color: #12301f; }
        .wholesale { text-align: right; font-weight: 700; color: #8a6a36; }
        .qty { text-align: center; color: #7b7366; }
        .footer { margin-top: 30px; font-size: 10px; color: #999; text-align: center; border-top: 1px solid #ddd; padding-top: 10px; }
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
          <div class="cat-title">${s.name} (${s.products.length} Items)</div>
          <table>
            <thead>
              <tr>
                <th class="num">#</th>
                <th>Product Name</th>
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
                  <td class="mrp">${formatPrice(p.mrp)}</td>
                  <td class="member">${formatPrice(p.member_price)}</td>
                  <td class="wholesale">${p.wholesale_enabled && p.wholesale_price != null ? formatPrice(p.wholesale_price) : "—"}</td>
                  <td class="qty">${p.wholesale_enabled && p.wholesale_min_qty != null ? p.wholesale_min_qty + " pcs" : "—"}</td>
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
