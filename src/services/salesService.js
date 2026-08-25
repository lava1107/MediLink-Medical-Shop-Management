// Mock, REST-shaped service for sales / POS billing.
import { pad } from "../utils/format.js";
import { TODAY } from "../data/mockData.js";

export async function getSales(sales) {
  await new Promise((r) => setTimeout(r, 120));
  return sales;
}

export async function getSaleById(sales, id) {
  await new Promise((r) => setTimeout(r, 100));
  return sales.find((s) => s.id === id) || null;
}

/**
 * Creates a sale (bill) and returns the updated sales + batches arrays.
 * @param {object} db - { sales, batches }
 * @param {object} form - { cart: [{batchId, qty}], customerName, branch, pharmacistName, payment, grandTotal }
 */
export async function createSale(db, form) {
  await new Promise((r) => setTimeout(r, 200));
  const billNo = `MDL/26-27/${1000 + db.sales.length + 1}`;
  const newSale = {
    id: `SAL-${pad(db.sales.length + 1)}`,
    bill: billNo,
    customer: form.customerName || "Walk-in Customer",
    pharmacist: form.pharmacistName,
    branch: form.branch,
    amount: Math.round(form.grandTotal),
    payment: form.payment,
    date: TODAY,
    status: "Completed",
  };
  const updatedBatches = db.batches.map((b) => {
    const item = form.cart.find((i) => i.batchId === b.id);
    return item ? { ...b, available: b.available - item.qty } : b;
  });
  return { sales: [newSale, ...db.sales], batches: updatedBatches };
}
