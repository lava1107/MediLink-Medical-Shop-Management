import { api } from "./api.js";

export async function getMedicines() {
  return await api.get("/medicines");
}

export async function getMedicineById(id) {
  return await api.get(`/medicines/${id}`);
}

export async function createMedicine(payload) {
  return await api.post("/medicines", payload);
}

export async function updateMedicine(id, payload) {
  return await api.put(`/medicines/${id}`, payload);
}

export async function deleteMedicine(id) {
  return await api.delete(`/medicines/${id}`);
}

export function medicineStock(medicine, batches = []) {
  if (!medicine) return 0;
  const medBatches = (batches || []).filter(
    (b) => (b.medicineId === medicine.id || b.medicine_id === medicine.id) && b.status !== "Expired"
  );
  if (medBatches.length > 0) {
    return medBatches.reduce((total, b) => total + (Number(b.available) || 0), 0);
  }
  return Number(medicine.stock) || 0;
}

export function stockStatus(qty) {
  if (qty <= 0) return "Out of Stock";
  if (qty <= 40) return "Low Stock";
  return "In Stock";
}
