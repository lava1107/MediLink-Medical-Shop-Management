import { api } from "./api.js";

export async function getUsers() {
  return await api.get("/users");
}

export async function getUserById(id) {
  return await api.get(`/users/${id}`);
}

export async function createUser(payload) {
  return await api.post("/users", payload);
}

export async function updateUser(id, payload) {
  return await api.put(`/users/${id}`, payload);
}

export async function toggleUserStatus(id) {
  return await api.patch(`/users/${id}/status`);
}

export async function deleteUser(id) {
  return await api.delete(`/users/${id}`);
}
