// Generates a real, downloadable PDF invoice for a completed sale using jsPDF +
// jspdf-autotable. Triggered from Sales & Billing when "Generate Bill" succeeds.
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "./format.js";
import { T } from "./theme.js";

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/**
 * @param {object} params
 * @param {object} params.sale - the sale record returned by salesService.createSale (has .bill, .date, .payment, .amount)
 * @param {object} params.branch - branch object { name, address, city, state, pin, phone, email }
 * @param {string} params.customerName
 * @param {Array}  params.items - [{ name, generic, batchNo, expiryDate, qty, price, discount, gst, lineTotal }]
 * @param {number} params.subtotal
 * @param {number} params.discount
 * @param {number} params.gst
 * @param {number} params.grandTotal
 */
export function generateInvoicePdf({ sale, branch, customerName, items, subtotal, discount, gst, grandTotal }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  const [blueR, blueG, blueB] = hexToRgb(T.blue);
  const [navyR, navyG, navyB] = hexToRgb(T.navy);

  // Header
  doc.setFillColor(blueR, blueG, blueB);
  doc.rect(0, 0, pageWidth, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("MediLink", marginX, 32);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Medical Shop Management System", marginX, 48);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("TAX INVOICE", pageWidth - marginX, 32, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Invoice No: ${sale.bill}`, pageWidth - marginX, 48, { align: "right" });
  doc.text(`Date: ${formatDate(sale.date)}`, pageWidth - marginX, 60, { align: "right" });

  // Branch + customer info block
  doc.setTextColor(navyR, navyG, navyB);
  let y = 96;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Branch", marginX, y);
  doc.text("Billed To", pageWidth / 2 + 10, y);
  doc.setFont("helvetica", "normal");
  y += 14;
  doc.text(branch?.name || "-", marginX, y);
  doc.text(customerName || "Walk-in Customer", pageWidth / 2 + 10, y);
  y += 14;
  if (branch?.address) doc.text(`${branch.address}, ${branch.city}`, marginX, y);
  y += 14;
  if (branch?.phone) doc.text(`Phone: ${branch.phone}`, marginX, y);
  y += 20;

  // Line items table
  const rows = items.map((it) => [
    it.name,
    it.generic || "-",
    it.batchNo || "-",
    it.expiryDate ? formatDate(it.expiryDate) : "-",
    String(it.qty),
    formatCurrency(it.price),
    `${it.discount || 0}%`,
    `${it.gst || 0}%`,
    formatCurrency(it.lineTotal),
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: marginX, right: marginX },
    head: [["Medicine", "Generic Name", "Batch No.", "Expiry", "Qty", "Unit Price", "Disc.", "GST", "Line Total"]],
    body: rows,
    styles: { fontSize: 8.5, cellPadding: 5 },
    headStyles: { fillColor: [blueR, blueG, blueB], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 249, 253] },
  });

  const afterTableY = doc.lastAutoTable.finalY + 20;

  // Totals block, right-aligned
  const totalsX = pageWidth - marginX;
  let ty = afterTableY;
  doc.setFontSize(10);
  const totalLine = (label, value, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(label, totalsX - 150, ty);
    doc.text(value, totalsX, ty, { align: "right" });
    ty += 16;
  };
  totalLine("Subtotal", formatCurrency(subtotal));
  totalLine("Discount", `-${formatCurrency(discount)}`);
  totalLine("GST", `+${formatCurrency(gst)}`);
  doc.setDrawColor(220, 220, 220);
  doc.line(totalsX - 150, ty - 4, totalsX, ty - 4);
  totalLine("Grand Total", formatCurrency(grandTotal), true);
  totalLine("Payment Method", sale.payment);

  // Footer
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(140, 150, 160);
  doc.text("Thank you for choosing MediLink. This is a computer-generated invoice.", marginX, doc.internal.pageSize.getHeight() - 30);

  const safeName = sale.bill.replace(/[\\/]/g, "-");
  doc.save(`MediLink_Invoice_${safeName}.pdf`);
}
