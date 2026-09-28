import { pad, addDays } from "../utils/format.js";

// "Today" is fixed for deterministic demo data (expiry / low-stock / recency calculations).
export const TODAY = "2026-08-20";

export const BRANCHES = [
  { id: "BR-01", name: "Kovilpatti Branch", manager: "R. Rajan", address: "12, VOC Street, Bus Stand Road", city: "Kovilpatti", state: "Tamil Nadu", pin: "628501", phone: "+91 98421 30221", email: "kovilpatti@medilink.in", opening: "08:30 AM", closing: "09:30 PM", status: "Active", staff: 6, isHQ: true, lat: 9.1734, lng: 77.8713 },
  { id: "BR-02", name: "Tirunelveli Branch", manager: "K. Meenakshi", address: "45, Trivandrum Main Road", city: "Tirunelveli", state: "Tamil Nadu", pin: "627001", phone: "+91 94432 11876", email: "tirunelveli@medilink.in", opening: "09:00 AM", closing: "09:00 PM", status: "Active", staff: 5, isHQ: false, lat: 8.7139, lng: 77.7567 },
  { id: "BR-03", name: "Madurai Branch", manager: "P. Arun Kumar", address: "8, Anna Nagar Main Road", city: "Madurai", state: "Tamil Nadu", pin: "625020", phone: "+91 90475 62310", email: "madurai@medilink.in", opening: "08:00 AM", closing: "10:00 PM", status: "Active", staff: 7, isHQ: false, lat: 9.9252, lng: 78.1198 },
];

export const CATEGORIES = [
  { id: "CAT-01", name: "Tablets", description: "Oral solid dosage tablets", status: "Active", created: "2024-01-10" },
  { id: "CAT-02", name: "Capsules", description: "Oral solid dosage capsules", status: "Active", created: "2024-01-10" },
  { id: "CAT-03", name: "Syrups", description: "Liquid oral suspensions & syrups", status: "Active", created: "2024-01-11" },
  { id: "CAT-04", name: "Injections", description: "Injectable formulations", status: "Active", created: "2024-01-12" },
  { id: "CAT-05", name: "Creams", description: "Topical creams", status: "Active", created: "2024-01-12" },
  { id: "CAT-06", name: "Ointments", description: "Topical ointments & balms", status: "Active", created: "2024-01-13" },
  { id: "CAT-07", name: "Drops", description: "Eye, ear & nasal drops", status: "Active", created: "2024-01-14" },
  { id: "CAT-08", name: "Powders", description: "Oral rehydration & other powders", status: "Active", created: "2024-01-14" },
  { id: "CAT-09", name: "Medical Devices", description: "Thermometers, BP monitors, glucometers", status: "Active", created: "2024-01-15" },
];

export const SUPPLIERS = [
  { id: "SUP-01", name: "Sun Pharma Distributors", company: "Sun Pharmaceutical Industries Ltd.", contact: "Ramesh Iyer", phone: "+91 98400 12345", email: "orders@sunpharmadist.in", address: "Guindy Industrial Estate", city: "Chennai", state: "Tamil Nadu", gst: "33AAACS1234F1Z5", license: "TN-DL-88213", status: "Active", created: "2024-02-01" },
  { id: "SUP-02", name: "Cipla Regional Supply Co.", company: "Cipla Ltd.", contact: "Anitha Raj", phone: "+91 90030 55671", email: "regional@ciplasupply.in", address: "Ambattur Industrial Area", city: "Chennai", state: "Tamil Nadu", gst: "33AAACC5678K1Z2", license: "TN-DL-77104", status: "Active", created: "2024-02-04" },
  { id: "SUP-03", name: "Madurai Pharma Agencies", company: "Madurai Pharma Agencies Pvt Ltd", contact: "S. Elango", phone: "+91 97510 66234", email: "sales@maduraipharma.in", address: "Simmakkal", city: "Madurai", state: "Tamil Nadu", gst: "33AABCM4321L1Z9", license: "TN-DL-65310", status: "Active", created: "2024-02-10" },
  { id: "SUP-04", name: "Zydus Southern Distribution", company: "Zydus Lifesciences Ltd.", contact: "Vignesh Kumar", phone: "+91 89250 44120", email: "south@zydusdist.in", address: "Perungudi", city: "Chennai", state: "Tamil Nadu", gst: "33AAECZ9988P1Z4", license: "TN-DL-91002", status: "Active", created: "2024-03-02" },
  { id: "SUP-05", name: "Tuticorin Surgical & Pharma", company: "Tuticorin Surgical Supplies", contact: "M. Josephine", phone: "+91 96001 23789", email: "info@tuticorinsurgical.in", address: "Beach Road", city: "Thoothukudi", state: "Tamil Nadu", gst: "33AADFT5566N1Z1", license: "TN-DL-40217", status: "Active", created: "2024-03-15" },
  { id: "SUP-06", name: "Alkem Regional Hub", company: "Alkem Laboratories Ltd.", contact: "Priya Dharshini", phone: "+91 91765 20984", email: "hub.tn@alkemlabs.in", address: "Madurai Bypass Road", city: "Madurai", state: "Tamil Nadu", gst: "33AABCA6789Q1Z7", license: "TN-DL-53390", status: "Inactive", created: "2024-04-01" },
];

const MED_DEFS = [
  { name: "Dolo 650", generic: "Paracetamol", brand: "Micro Labs", category: "Tablets", manufacturer: "Micro Labs Ltd.", dosage: "Tablet", strength: "650 mg", type: "OTC", rx: false, purchase: 18.5, selling: 28.0, gst: 12 },
  { name: "Crocin 650", generic: "Paracetamol", brand: "GSK", category: "Tablets", manufacturer: "GlaxoSmithKline", dosage: "Tablet", strength: "650 mg", type: "OTC", rx: false, purchase: 19.0, selling: 29.0, gst: 12 },
  { name: "Paracetamol 500mg", generic: "Paracetamol", brand: "Generic", category: "Tablets", manufacturer: "Cipla Ltd.", dosage: "Tablet", strength: "500 mg", type: "OTC", rx: false, purchase: 8.0, selling: 14.0, gst: 12 },
  { name: "Azithromycin 500mg", generic: "Azithromycin", brand: "Azithral", category: "Tablets", manufacturer: "Alembic Pharmaceuticals", dosage: "Tablet", strength: "500 mg", type: "Antibiotic", rx: true, purchase: 62.0, selling: 92.0, gst: 12 },
  { name: "Cetirizine 10mg", generic: "Cetirizine Hydrochloride", brand: "Cetzine", category: "Tablets", manufacturer: "Cipla Ltd.", dosage: "Tablet", strength: "10 mg", type: "Antihistamine", rx: false, purchase: 9.5, selling: 16.0, gst: 12 },
  { name: "Pantoprazole 40mg", generic: "Pantoprazole", brand: "Pantocid", category: "Tablets", manufacturer: "Sun Pharmaceutical", dosage: "Tablet", strength: "40 mg", type: "Prescription", rx: true, purchase: 34.0, selling: 52.0, gst: 12 },
  { name: "Amoxicillin 500mg", generic: "Amoxicillin", brand: "Mox", category: "Capsules", manufacturer: "Ranbaxy Labs", dosage: "Capsule", strength: "500 mg", type: "Antibiotic", rx: true, purchase: 41.0, selling: 63.0, gst: 12 },
  { name: "Metformin 500mg", generic: "Metformin Hydrochloride", brand: "Glycomet", category: "Tablets", manufacturer: "USV Pvt. Ltd.", dosage: "Tablet", strength: "500 mg", type: "Prescription", rx: true, purchase: 22.0, selling: 34.0, gst: 12 },
  { name: "Omeprazole 20mg", generic: "Omeprazole", brand: "Omez", category: "Capsules", manufacturer: "Dr. Reddy's Labs", dosage: "Capsule", strength: "20 mg", type: "Prescription", rx: true, purchase: 28.0, selling: 44.0, gst: 12 },
  { name: "Ibuprofen 400mg", generic: "Ibuprofen", brand: "Brufen", category: "Tablets", manufacturer: "Abbott India", dosage: "Tablet", strength: "400 mg", type: "OTC", rx: false, purchase: 14.0, selling: 22.0, gst: 12 },
  { name: "ORS Powder", generic: "Oral Rehydration Salts", brand: "Electral", category: "Powders", manufacturer: "FDC Ltd.", dosage: "Sachet", strength: "21.8 g", type: "OTC", rx: false, purchase: 12.0, selling: 20.0, gst: 5 },
  { name: "Calcium + D3 Tablets", generic: "Calcium Carbonate + Vitamin D3", brand: "Shelcal", category: "Tablets", manufacturer: "Torrent Pharmaceuticals", dosage: "Tablet", strength: "500 mg", type: "Supplement", rx: false, purchase: 45.0, selling: 68.0, gst: 12 },
  { name: "Ascoril Cough Syrup", generic: "Bromhexine + Terbutaline + Guaifenesin", brand: "Ascoril", category: "Syrups", manufacturer: "Glenmark Pharmaceuticals", dosage: "Syrup", strength: "100 ml", type: "Prescription", rx: true, purchase: 58.0, selling: 89.0, gst: 12 },
  { name: "Betadine Ointment", generic: "Povidone Iodine", brand: "Betadine", category: "Ointments", manufacturer: "Win-Medicare", dosage: "Ointment", strength: "20 g", type: "OTC", rx: false, purchase: 38.0, selling: 58.0, gst: 12 },
  { name: "Moxifloxacin Eye Drops", generic: "Moxifloxacin", brand: "Vigamox", category: "Drops", manufacturer: "Alcon Labs", dosage: "Drops", strength: "5 ml", type: "Prescription", rx: true, purchase: 72.0, selling: 108.0, gst: 12 },
  { name: "Human Mixtard Insulin", generic: "Insulin (Human)", brand: "Mixtard", category: "Injections", manufacturer: "Novo Nordisk", dosage: "Injection", strength: "40 IU/ml", type: "Prescription", rx: true, purchase: 145.0, selling: 210.0, gst: 5 },
];

let medIdCounter = 0;
export const MEDICINES = MED_DEFS.map((m) => ({ id: `MED-${pad(++medIdCounter)}`, ...m }));

const RACKS = ["A1-01", "A1-02", "A2-05", "B1-03", "B2-01", "C1-04", "C2-02", "D1-01"];

export function expiryStatus(expiryDate, today = TODAY) {
  const days = Math.round((new Date(expiryDate) - new Date(today)) / 86400000);
  if (days < 0) return "Expired";
  if (days <= 30) return "Expiring Soon";
  return "Safe";
}

let batchIdCounter = 0;
export const BATCHES = [];
MEDICINES.forEach((med, mi) => {
  BRANCHES.forEach((br, bi) => {
    // give most medicines a batch at most branches, skip a few to create realistic "unavailable" scenarios
    const skip = (mi + bi) % 7 === 6;
    if (skip) return;
    const mfg = addDays(TODAY, -(30 + mi * 5 + bi * 3));
    let expiryOffset = 240 - mi * 6 - bi * 2;
    // force a few expiring-soon and one expired batch for demo realism
    if (mi === 3 && bi === 0) expiryOffset = 18;
    if (mi === 7 && bi === 1) expiryOffset = 9;
    if (mi === 12 && bi === 2) expiryOffset = -5; // expired
    const expiry = addDays(TODAY, expiryOffset);
    const qty = 15 + ((mi * 13 + bi * 7) % 90);
    BATCHES.push({
      id: `BAT-${pad(++batchIdCounter)}`,
      batchNo: `MK${pad(mi + 1)}${bi + 1}${new Date(mfg).getFullYear()}`,
      medicineId: med.id,
      medicineName: med.name,
      branchId: br.id,
      branchName: br.name,
      mfgDate: mfg,
      expiryDate: expiry,
      quantity: qty,
      available: qty,
      purchasePrice: med.purchase,
      sellingPrice: med.selling,
      rack: RACKS[(mi + bi) % RACKS.length],
      created: mfg,
      updated: mfg,
      status: expiryStatus(expiry),
    });
  });
});

export const CUSTOMERS = [
  { id: "CUS-01", name: "Ramya Krishnan", phone: "+91 98940 12233", email: "ramya.k@gmail.com", address: "14 Kamarajar Street, Kovilpatti", rxRef: "-", created: "2024-05-02" },
  { id: "CUS-02", name: "Suresh Babu", phone: "+91 90031 44567", email: "suresh.babu@gmail.com", address: "7 North Car Street, Kovilpatti", rxRef: "RX-2291", created: "2024-06-11" },
  { id: "CUS-03", name: "Lakshmi Narayanan", phone: "+91 97159 88213", email: "lakshmi.n@yahoo.com", address: "22 Palayamkottai Road, Tirunelveli", rxRef: "-", created: "2024-06-20" },
  { id: "CUS-04", name: "Muthu Vel", phone: "+91 96297 33810", email: "muthuvel87@gmail.com", address: "3 Anna Nagar, Madurai", rxRef: "RX-3312", created: "2024-07-05" },
  { id: "CUS-05", name: "Deepa Rajendran", phone: "+91 89258 76290", email: "deepa.r@outlook.com", address: "18 Bypass Road, Madurai", rxRef: "-", created: "2024-08-14" },
  { id: "CUS-06", name: "Karthikeyan S", phone: "+91 91502 66781", email: "karthik.s@gmail.com", address: "9 Trivandrum Road, Tirunelveli", rxRef: "RX-4410", created: "2024-09-02" },
  { id: "CUS-07", name: "Vasanthi Murugan", phone: "+91 98430 11290", email: "vasanthi.m@gmail.com", address: "31 VOC Street, Kovilpatti", rxRef: "-", created: "2024-09-19" },
  { id: "CUS-08", name: "Arun Prakash", phone: "+91 90474 55321", email: "arun.prakash@gmail.com", address: "5 Simmakkal, Madurai", rxRef: "RX-5108", created: "2024-10-08" },
];

export const USERS = [
  { id: "USR-01", name: "Lavanya M", username: "lavanya.admin", email: "lavanya.admin@medilink.com", phone: "+91 90031 22110", role: "Admin", branch: "Kovilpatti Branch", status: "Active", created: "2024-01-05", lastLogin: "2026-08-20 09:12 AM" },
  { id: "USR-02", name: "M. Rajan", username: "rajan.pharmacist", email: "rajan.pharmacist@medilink.com", phone: "+91 98421 30221", role: "Pharmacist", branch: "Kovilpatti Branch", status: "Active", created: "2024-01-08", lastLogin: "2026-08-20 08:45 AM" },
  { id: "USR-03", name: "K. Meenakshi", username: "meenakshi.ph", email: "meenakshi@medilink.in", phone: "+91 94432 11876", role: "Pharmacist", branch: "Tirunelveli Branch", status: "Active", created: "2024-02-14", lastLogin: "2026-08-19 06:30 PM" },
  { id: "USR-04", name: "P. Arun Kumar", username: "arunkumar.ph", email: "arunkumar@medilink.in", phone: "+91 90475 62310", role: "Pharmacist", branch: "Madurai Branch", status: "Active", created: "2024-02-20", lastLogin: "2026-08-20 07:58 AM" },
  { id: "USR-05", name: "M. Divya", username: "divya.ph", email: "divya@medilink.in", phone: "+91 96297 40012", role: "Pharmacist", branch: "Madurai Branch", status: "Active", created: "2024-05-11", lastLogin: "2026-08-20 11:20 AM" },
  { id: "USR-06", name: "N. Bhuvaneshwari", username: "bhuvana.ph", email: "bhuvana@medilink.in", phone: "+91 89258 90341", role: "Pharmacist", branch: "Tirunelveli Branch", status: "Active", created: "2024-06-02", lastLogin: "2026-08-18 04:10 PM" },
  { id: "USR-07", name: "Dr. Sundar V", username: "sundar.admin", email: "sundar.admin@medilink.com", phone: "+91 94441 55667", role: "Admin", branch: "Madurai Branch", status: "Active", created: "2024-06-15", lastLogin: "2026-08-20 09:00 AM" },
];

const PAY_METHODS = ["Cash", "UPI", "Card"];
function genBill(i) {
  return `MDL/26-27/${1000 + i}`;
}
export const SALES = Array.from({ length: 12 }).map((_, i) => {
  const br = BRANCHES[i % 3];
  const cus = CUSTOMERS[i % CUSTOMERS.length];
  const usr = USERS.filter((u) => u.role === "Pharmacist" && u.branch === br.name)[0] || USERS[1];
  const amount = 120 + ((i * 57) % 900);
  const daysAgo = i < 4 ? 0 : i < 8 ? 1 : 2;
  return {
    id: `SAL-${pad(i + 1)}`,
    bill: genBill(i + 1),
    customer: cus.name,
    pharmacist: usr.name,
    branch: br.name,
    amount,
    payment: PAY_METHODS[i % 3],
    date: addDays(TODAY, -daysAgo),
    status: "Completed",
  };
});

export const PURCHASES = [
  { id: "PUR-01", invoice: "SPD/INV/4471", supplier: "Sun Pharma Distributors", branch: "Kovilpatti Branch", purchasedBy: "Lavanya M", date: "2026-08-15", amount: 24850, payment: "Paid", status: "Received" },
  { id: "PUR-02", invoice: "CRS/INV/8823", supplier: "Cipla Regional Supply Co.", branch: "Madurai Branch", purchasedBy: "P. Arun Kumar", date: "2026-08-16", amount: 18200, payment: "Pending", status: "Received" },
  { id: "PUR-03", invoice: "MPA/INV/1129", supplier: "Madurai Pharma Agencies", branch: "Madurai Branch", purchasedBy: "P. Arun Kumar", date: "2026-08-12", amount: 9640, payment: "Paid", status: "Received" },
  { id: "PUR-04", invoice: "ZSD/INV/6602", supplier: "Zydus Southern Distribution", branch: "Tirunelveli Branch", purchasedBy: "K. Meenakshi", date: "2026-08-10", amount: 31200, payment: "Paid", status: "Received" },
  { id: "PUR-05", invoice: "TSP/INV/3391", supplier: "Tuticorin Surgical & Pharma", branch: "Kovilpatti Branch", purchasedBy: "Lavanya M", date: "2026-08-08", amount: 5480, payment: "Partially Paid", status: "Received" },
  { id: "PUR-06", invoice: "SPD/INV/4502", supplier: "Sun Pharma Distributors", branch: "Kovilpatti Branch", purchasedBy: "Lavanya M", date: "2026-08-19", amount: 16750, payment: "Pending", status: "Ordered" },
];

export const RESERVATIONS = [
  { id: "RSV-01", customer: "Suresh Babu", medicine: "Human Mixtard Insulin", branch: "Kovilpatti Branch", quantity: 2, resDate: "2026-08-19", expiry: "2026-08-22", status: "Pending", createdBy: "R. Rajan" },
  { id: "RSV-02", customer: "Muthu Vel", medicine: "Moxifloxacin Eye Drops", branch: "Madurai Branch", quantity: 1, resDate: "2026-08-18", expiry: "2026-08-21", status: "Reserved", createdBy: "P. Arun Kumar" },
  { id: "RSV-03", customer: "Karthikeyan S", medicine: "Azithromycin 500mg", branch: "Tirunelveli Branch", quantity: 3, resDate: "2026-08-17", expiry: "2026-08-20", status: "Collected", createdBy: "K. Meenakshi" },
  { id: "RSV-04", customer: "Vasanthi Murugan", medicine: "Ascoril Cough Syrup", branch: "Kovilpatti Branch", quantity: 1, resDate: "2026-08-15", expiry: "2026-08-18", status: "Expired", createdBy: "R. Rajan" },
  { id: "RSV-05", customer: "Arun Prakash", medicine: "Metformin 500mg", branch: "Madurai Branch", quantity: 2, resDate: "2026-08-14", expiry: "2026-08-17", status: "Cancelled", createdBy: "P. Arun Kumar" },
];

// Partner shops are registered third parties, NOT MediLink branches. Distance is
// computed live (see utils/geo.js + availabilityService.js) from lat/lng, relative
// to whichever MediLink branch is currently selected — never hardcoded.
export const PARTNER_SHOPS = [
  { id: "PS-01", name: "Sri Lakshmi Medicals", owner: "T. Chandrasekar", phone: "+91 94860 12093", email: "srilakshmi.med@gmail.com", address: "Main Bazaar Street", city: "Kovilpatti", state: "Tamil Nadu", pin: "628501", license: "TN-DL-22013", status: "Active", created: "2024-04-10", lat: 9.1802, lng: 77.8756 },
  { id: "PS-02", name: "Apollo Medical Centre", owner: "R. Kalaivani", phone: "+91 98653 40217", email: "apollomedcentre@gmail.com", address: "New Bus Stand Road", city: "Kovilpatti", state: "Tamil Nadu", pin: "628502", license: "TN-DL-22098", status: "Active", created: "2024-04-18", lat: 9.1655, lng: 77.8639 },
  { id: "PS-03", name: "Health Care Pharmacy", owner: "M. Sivakumar", phone: "+91 90921 55678", email: "healthcarepharmacy@gmail.com", address: "Kaspa Main Road", city: "Kovilpatti", state: "Tamil Nadu", pin: "628501", license: "TN-DL-22140", status: "Active", created: "2024-05-01", lat: 9.1601, lng: 77.8801 },
  { id: "PS-04", name: "Sivan Medical Centre", owner: "S. Elangovan", phone: "+91 90921 66789", email: "sivanmedical@gmail.com", address: "Palayamkottai Road", city: "Tirunelveli", state: "Tamil Nadu", pin: "627002", license: "TN-DL-33021", status: "Active", created: "2024-05-01", lat: 8.7300, lng: 77.7400 },
  { id: "PS-05", name: "Meenakshi Medicals", owner: "V. Ravichandran", phone: "+91 89390 66120", email: "meenakshimed@gmail.com", address: "West Masi Street", city: "Madurai", state: "Tamil Nadu", pin: "625001", license: "TN-DL-44210", status: "Active", created: "2024-05-20", lat: 9.9195, lng: 78.1193 },
];

export const PARTNER_AVAILABILITY = [
  { shopId: "PS-01", medicineName: "Human Mixtard Insulin", quantity: 12, lastUpdated: "2026-08-19 05:40 PM" },
  { shopId: "PS-02", medicineName: "Human Mixtard Insulin", quantity: 8, lastUpdated: "2026-08-20 09:10 AM" },
  { shopId: "PS-03", medicineName: "Human Mixtard Insulin", quantity: 5, lastUpdated: "2026-08-20 07:50 AM" },
  { shopId: "PS-01", medicineName: "Betadine Ointment", quantity: 14, lastUpdated: "2026-08-19 07:15 PM" },
  { shopId: "PS-04", medicineName: "Betadine Ointment", quantity: 6, lastUpdated: "2026-08-19 07:15 PM" },
  { shopId: "PS-02", medicineName: "Moxifloxacin Eye Drops", quantity: 9, lastUpdated: "2026-08-20 08:20 AM" },
  { shopId: "PS-05", medicineName: "Moxifloxacin Eye Drops", quantity: 4, lastUpdated: "2026-08-20 08:20 AM" },
];

// Prescription records for the Prescription Verification feature. Linked to
// Sales & Billing: a prescription-required medicine cannot be billed until its
// matching prescription (by customer + medicine) is Verified.
export const PRESCRIPTIONS = [
  {
    id: "RX-01",
    customerId: "CUS-02",
    customerName: "Suresh Babu",
    medicine: "Human Mixtard Insulin",
    quantity: 2,
    doctorName: "Dr. K. Balasubramanian",
    prescriptionDate: "2026-08-18",
    prescriptionRef: "RX-2291",
    status: "Verified",
    verifiedBy: "R. Rajan",
    verifiedDate: "2026-08-19",
    remarks: "Valid prescription, dosage confirmed.",
  },
  {
    id: "RX-02",
    customerId: "CUS-04",
    customerName: "Muthu Vel",
    medicine: "Azithromycin 500mg",
    quantity: 1,
    doctorName: "Dr. S. Priyanka",
    prescriptionDate: "2026-08-19",
    prescriptionRef: "RX-3312",
    status: "Pending",
    verifiedBy: "",
    verifiedDate: "",
    remarks: "",
  },
  {
    id: "RX-03",
    customerId: "CUS-06",
    customerName: "Karthikeyan S",
    medicine: "Pantoprazole 40mg",
    quantity: 1,
    doctorName: "Dr. M. Anandhi",
    prescriptionDate: "2026-07-10",
    prescriptionRef: "RX-4410",
    status: "Expired",
    verifiedBy: "Lavanya M",
    verifiedDate: "2026-07-11",
    remarks: "Prescription older than 30 days.",
  },
  {
    id: "RX-04",
    customerId: "CUS-08",
    customerName: "Arun Prakash",
    medicine: "Omeprazole 20mg",
    quantity: 1,
    doctorName: "Dr. R. Vignesh",
    prescriptionDate: "2026-08-15",
    prescriptionRef: "RX-5108",
    status: "Rejected",
    verifiedBy: "R. Rajan",
    verifiedDate: "2026-08-16",
    remarks: "Reference could not be verified with the issuing clinic.",
  },
];

export const NOTIFICATIONS = [
  { id: "N1", type: "Low Stock", title: "Low stock: Azithromycin 500mg", desc: "Kovilpatti Branch has only 6 strips remaining.", time: "2026-08-20 09:05 AM", read: false },
  { id: "N2", type: "Near Expiry", title: "Batch expiring soon: MK4118", desc: "Pantoprazole 40mg batch expires in 18 days.", time: "2026-08-20 08:50 AM", read: false },
  { id: "N3", type: "New Purchase", title: "Purchase received: SPD/INV/4471", desc: "Sun Pharma Distributors delivery confirmed at Kovilpatti.", time: "2026-08-19 04:12 PM", read: false },
  { id: "N4", type: "Reservation Created", title: "New reservation: RSV-01", desc: "Suresh Babu reserved Human Mixtard Insulin (2 units).", time: "2026-08-19 02:30 PM", read: true },
  { id: "N5", type: "Reservation Expiring", title: "Reservation expiring soon: RSV-02", desc: "Moxifloxacin Eye Drops reservation expires 2026-08-21.", time: "2026-08-19 11:00 AM", read: true },
  { id: "N6", type: "Expired Medicine", title: "Batch expired: MK3103", desc: "Calcium + D3 Tablets batch has expired at Madurai Branch.", time: "2026-08-18 09:00 AM", read: true },
  { id: "N7", type: "Branch Availability", title: "Stock transferred lookup", desc: "Tirunelveli Branch queried for Cetirizine 10mg availability.", time: "2026-08-18 03:45 PM", read: true },
  { id: "N8", type: "Reservation Cancelled", title: "Reservation cancelled: RSV-05", desc: "Arun Prakash's reservation for Metformin 500mg was cancelled.", time: "2026-08-17 01:15 PM", read: true },
];

export const RACK_LOCATIONS = RACKS;
