import { api } from "./api.js";

export async function getReservations() {
  return await api.get("/reservations");
}

export async function createReservation(reservations, form) {
  try {
    const created = await api.post("/reservations", form);
    return [created, ...(reservations || [])];
  } catch (err) {
    console.error("createReservation error:", err);
    throw err;
  }
}

export async function confirmReservation(reservations, id) {
  try {
    const updated = await api.patch(`/reservations/${id}/status`, { action: "confirm" });
    return (reservations || []).map((r) => (r.id === id ? updated : r));
  } catch (err) {
    console.error("confirmReservation error:", err);
    throw err;
  }
}

export async function markCollected(reservations, id) {
  try {
    const updated = await api.patch(`/reservations/${id}/status`, { action: "collect" });
    return (reservations || []).map((r) => (r.id === id ? updated : r));
  } catch (err) {
    console.error("markCollected error:", err);
    throw err;
  }
}

export async function cancelReservation(reservations, id) {
  try {
    const updated = await api.patch(`/reservations/${id}/status`, { action: "cancel" });
    return (reservations || []).map((r) => (r.id === id ? updated : r));
  } catch (err) {
    console.warn("Backend unavailable, cancelling reservation locally:", err.message);
    return (reservations || []).map((r) => (r.id === id ? { ...r, status: "Cancelled" } : r));
  }
}

export async function updateReservation(id, payload) {
  try {
    return await api.put(`/reservations/${id}`, payload);
  } catch (err) {
    console.warn("Backend unavailable, updating reservation locally:", err.message);
    return { id, ...payload };
  }
}

export async function deleteReservation(id) {
  try {
    return await api.delete(`/reservations/${id}`);
  } catch (err) {
    console.warn("Backend unavailable, deleting reservation locally:", err.message);
    return { id };
  }
}

