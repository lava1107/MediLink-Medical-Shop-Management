// Mock, REST-shaped service implementing the Medicine Availability workflow:
// 1) current branch  2) nearby MediLink branches (distance-filtered)  3) nearby
// registered partner shops (distance-filtered, centered on the CURRENT branch).
// Availability is only ever checked, never used to auto-transfer stock between locations.
import { PARTNER_AVAILABILITY, PARTNER_SHOPS } from "../data/mockData.js";
import { calculateDistance } from "../utils/geo.js";

export const BRANCH_RADIUS_OPTIONS = [5, 10, 25, 50, 100];
export const PARTNER_RADIUS_OPTIONS = [2, 5, 10, 25];
export const DEFAULT_BRANCH_RADIUS = 25;
export const DEFAULT_PARTNER_RADIUS = 5;

export function findMedicine(medicines, query) {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  return (
    medicines.find(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.generic.toLowerCase().includes(q) ||
        m.brand.toLowerCase().includes(q)
    ) || null
  );
}

export async function checkCurrentBranch(batches, medicineId, branchName) {
  await new Promise((r) => setTimeout(r, 150));
  return batches.find((b) => b.medicineId === medicineId && b.branchName === branchName && b.status !== "Expired" && b.available > 0) || null;
}

/**
 * Finds MediLink branches (other than the current one) that stock the medicine,
 * are within `radiusKm` of the current branch's lat/lng, and sorts nearest-first.
 * Distant branches are never force-included -- an empty result is expected and correct.
 */
export async function checkNearbyBranches(batches, branches, medicineId, currentBranch, radiusKm = DEFAULT_BRANCH_RADIUS) {
  await new Promise((r) => setTimeout(r, 200));
  return branches
    .filter((b) => b.name !== currentBranch.name)
    .map((b) => {
      const distance = calculateDistance(currentBranch.lat, currentBranch.lng, b.lat, b.lng);
      const batch = batches.find((bt) => bt.medicineId === medicineId && bt.branchName === b.name && bt.status !== "Expired" && bt.available > 0);
      return batch && distance !== null && distance <= radiusKm ? { branch: b, batch, distance } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Finds registered ACTIVE partner shops stocking the medicine, within `radiusKm`
 * of the current branch's lat/lng (never another branch), sorted nearest-first.
 */
export async function checkNearbyPartnerShops(medicineName, currentBranch, radiusKm = DEFAULT_PARTNER_RADIUS) {
  await new Promise((r) => setTimeout(r, 200));
  return PARTNER_AVAILABILITY.filter((pa) => pa.medicineName === medicineName)
    .map((pa) => {
      const shop = PARTNER_SHOPS.find((s) => s.id === pa.shopId);
      if (!shop || shop.status !== "Active") return null;
      const distance = calculateDistance(currentBranch.lat, currentBranch.lng, shop.lat, shop.lng);
      return distance !== null && distance <= radiusKm ? { ...pa, shop, distance } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.distance - b.distance);
}

export { calculateDistance };
