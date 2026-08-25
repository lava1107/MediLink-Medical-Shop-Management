// Mock, REST-shaped service for prescription verification. Integrates with
// Medicine Management (medicine.rx flag) and Sales & Billing (Generate Bill is
// gated on a Verified prescription for any Rx-required cart item).

export async function getPrescriptions(prescriptions) {
  await new Promise((r) => setTimeout(r, 120));
  return prescriptions;
}

export async function getPrescriptionById(prescriptions, id) {
  await new Promise((r) => setTimeout(r, 100));
  return prescriptions.find((p) => p.id === id) || null;
}

/**
 * Finds an existing prescription for this customer + medicine pair, if any.
 * Used by Sales & Billing to look up verification status when a Rx-required
 * medicine is added to the cart.
 */
export function findPrescription(prescriptions, customerName, medicineName) {
  return (
    prescriptions.find((p) => p.customerName === customerName && p.medicine === medicineName) || null
  );
}

export async function createPrescription(prescriptions, payload) {
  await new Promise((r) => setTimeout(r, 150));
  const nextNum = prescriptions.length + 1;
  const id = `RX-${String(nextNum).padStart(2, "0")}`;
  const record = { id, status: "Pending", verifiedBy: "", verifiedDate: "", remarks: "", ...payload };
  return [record, ...prescriptions];
}

export async function verifyPrescription(prescriptions, id, verifiedBy, remarks = "") {
  await new Promise((r) => setTimeout(r, 150));
  return prescriptions.map((p) =>
    p.id === id ? { ...p, status: "Verified", verifiedBy, verifiedDate: new Date().toISOString().slice(0, 10), remarks: remarks || p.remarks } : p
  );
}

export async function rejectPrescription(prescriptions, id, verifiedBy, remarks = "") {
  await new Promise((r) => setTimeout(r, 150));
  return prescriptions.map((p) =>
    p.id === id ? { ...p, status: "Rejected", verifiedBy, verifiedDate: new Date().toISOString().slice(0, 10), remarks: remarks || p.remarks } : p
  );
}
