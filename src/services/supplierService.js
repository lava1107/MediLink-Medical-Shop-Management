import { api } from "./api.js";

export async function getSuppliers() {
  return await api.get("/suppliers");
}

export async function getSupplierById(id) {
  return await api.get(`/suppliers/${id}`);
}

export async function createSupplier(payload) {
  return await api.post("/suppliers", payload);
}

export async function updateSupplier(id, payload) {
  return await api.put(`/suppliers/${id}`, payload);
}

export async function deleteSupplier(id) {
  return await api.delete(`/suppliers/${id}`);
}
