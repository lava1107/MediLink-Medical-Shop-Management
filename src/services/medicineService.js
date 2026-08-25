// Mock, REST-shaped service for medicines. Each function currently reads/writes the
// in-memory list handed to it (typically AppContext's `db.medicines`) but mirrors the
// signature you'd use for `GET/POST/PUT/DELETE /api/medicines` once a backend exists.

export async function getMedicines(medicines) {
  await new Promise((r) => setTimeout(r, 120));
  return medicines;
}

export async function getMedicineById(medicines, id) {
  await new Promise((r) => setTimeout(r, 100));
  return medicines.find((m) => m.id === id) || null;
}

export async function createMedicine(medicines, payload) {
  await new Promise((r) => setTimeout(r, 150));
  const nextNum = medicines.length + 1;
  const id = `MED-${String(nextNum).padStart(2, "0")}`;
  return [...medicines, { id, ...payload }];
}

export async function updateMedicine(medicines, id, payload) {
  await new Promise((r) => setTimeout(r, 150));
  return medicines.map((m) => (m.id === id ? { ...m, ...payload } : m));
}

export async function deleteMedicine(medicines, id) {
  await new Promise((r) => setTimeout(r, 120));
  return medicines.filter((m) => m.id !== id);
}

export function medicineStock(medicine, batches) {
  return batches
    .filter((b) => b.medicineId === medicine.id && b.status !== "Expired")
    .reduce((total, b) => total + b.available, 0);
}

export function stockStatus(qty) {
  if (qty <= 0) return "Out of Stock";
  if (qty <= 40) return "Low Stock";
  return "In Stock";
}
