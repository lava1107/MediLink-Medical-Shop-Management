import { api } from "./api.js";

export async function getBranches() {
  return await api.get("/branches");
}

export async function getBranchById(id) {
  return await api.get(`/branches/${id}`);
}

export async function createBranch(payload) {
  return await api.post("/branches", payload);
}

export async function updateBranch(id, payload) {
  return await api.put(`/branches/${id}`, payload);
}

export async function deleteBranch(id) {
  return await api.delete(`/branches/${id}`);
}
