// Mock, REST-shaped service for medicine reservations.
// Important business rule: a reservation is NOT a sale — only Collected status implies pickup,
// and even then the pharmacist still processes payment separately through Sales & Billing.
import { pad } from "../utils/format.js";
import { TODAY } from "../data/mockData.js";

export async function getReservations(reservations) {
  await new Promise((r) => setTimeout(r, 120));
  return reservations;
}

export async function createReservation(reservations, form) {
  await new Promise((r) => setTimeout(r, 150));
  const id = `RSV-${pad(reservations.length + 1)}`;
  const newReservation = { id, ...form, resDate: TODAY, status: "Pending" };
  return [newReservation, ...reservations];
}

export async function confirmReservation(reservations, id) {
  await new Promise((r) => setTimeout(r, 100));
  return reservations.map((r) => (r.id === id ? { ...r, status: "Reserved" } : r));
}

export async function markCollected(reservations, id) {
  await new Promise((r) => setTimeout(r, 100));
  return reservations.map((r) => (r.id === id ? { ...r, status: "Collected" } : r));
}

export async function cancelReservation(reservations, id) {
  await new Promise((r) => setTimeout(r, 100));
  return reservations.map((r) => (r.id === id ? { ...r, status: "Cancelled" } : r));
}
