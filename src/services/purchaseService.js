// Mock, REST-shaped service for purchases. See medicineService.js for the pattern.
import { pad, addDays } from "../utils/format.js";
import { TODAY } from "../data/mockData.js";

export async function getPurchases(purchases) {
  await new Promise((r) => setTimeout(r, 120));
  return purchases;
}

export async function getPurchaseById(purchases, id) {
  await new Promise((r) => setTimeout(r, 100));
  return purchases.find((p) => p.id === id) || null;
}

/**
 * Creates a new purchase record plus the resulting medicine batches.
 * @param {object} db - current app db slice ({ purchases, batches, medicines })
 * @param {object} form - { supplier, branch, items: [{medicine, batchNo, mfgDate, expiryDate, qty, price}], grandTotal, paymentStatus }
 */
export async function createPurchase(db, form) {
  await new Promise((r) => setTimeout(r, 200));
  const today = TODAY;
  const id = `PUR-${pad(db.purchases.length + 1)}`;
  const invoice = `${form.supplier.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 3)}/INV/${1000 + db.purchases.length}`;
  const RACKS = ["A1-01", "A1-02", "A2-05", "B1-03", "B2-01", "C1-04", "C2-02", "D1-01"];

  const newPurchase = {
    id,
    invoice,
    supplier: form.supplier,
    branch: form.branch,
    purchasedBy: form.purchasedBy || "Admin",
    date: today,
    amount: Math.round(form.grandTotal),
    payment: form.paymentStatus,
    status: "Received",
  };

  const newBatches = form.items.map((it, idx) => ({
    id: `BAT-NEW-${Date.now()}-${idx}`,
    batchNo: it.batchNo,
    medicineId: db.medicines.find((m) => m.name === it.medicine)?.id || "MED-00",
    medicineName: it.medicine,
    branchId: db.branches?.find((b) => b.name === form.branch)?.id,
    branchName: form.branch,
    mfgDate: it.mfgDate || today,
    expiryDate: it.expiryDate || addDays(today, 365),
    quantity: Number(it.qty),
    available: Number(it.qty),
    purchasePrice: Number(it.price),
    sellingPrice: Math.round(Number(it.price) * 1.5),
    rack: RACKS[idx % RACKS.length],
    created: today,
    updated: today,
  }));

  return {
    purchases: [newPurchase, ...db.purchases],
    batches: [...newBatches, ...db.batches],
  };
}
