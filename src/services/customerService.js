import { api } from "./api.js";

export async function getCustomers() {
  return await api.get("/customers");
}

export async function getCustomerById(id) {
  return await api.get(`/customers/${id}`);
}

export async function createCustomer(payload) {
  return await api.post("/customers", payload);
}

export async function updateCustomer(id, payload) {
  return await api.put(`/customers/${id}`, payload);
}

export async function deleteCustomer(id) {
  return await api.delete(`/customers/${id}`);
}
