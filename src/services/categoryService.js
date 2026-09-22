import { api } from "./api.js";

export async function getCategories() {
  return await api.get("/categories");
}

export async function createCategory(payload) {
  return await api.post("/categories", payload);
}

export async function updateCategory(id, payload) {
  return await api.put(`/categories/${id}`, payload);
}

export async function deleteCategory(id) {
  return await api.delete(`/categories/${id}`);
}
