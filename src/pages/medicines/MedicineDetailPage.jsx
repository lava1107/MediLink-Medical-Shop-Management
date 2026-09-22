import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPinned, CalendarClock, Pencil } from "lucide-react";
import { T } from "../../utils/theme.js";
import { formatCurrency, formatDate } from "../../utils/format.js";
import { useApp } from "../../hooks/useApp.js";
import { stockStatus, updateMedicine, medicineStock } from "../../services/medicineService.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Btn from "../../components/common/Btn.jsx";
import Modal from "../../components/common/Modal.jsx";
import { FormInput, FormSelect } from "../../components/common/FormControls.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";

export default function MedicineDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { db, setDb, toast, refreshDb } = useApp();
  const [editModal, setEditModal] = useState(false);
  const [form, setForm] = useState({});

  const med = db.medicines.find((m) => m.id === id);

  if (!med) {
    return (
      <div>
        <button onClick={() => navigate("/medicines")} className="flex items-center gap-1.5 text-xs font-semibold mb-4" style={{ color: T.blue }}>
          <ArrowLeft size={14} /> Back to Medicines
        </button>
        <EmptyState title="Medicine not found" />
      </div>
    );
  }

  const batches = (db.batches || []).filter(
    (b) => b.medicineId === med.id || b.medicine_id === med.id || b.medicineName === med.name
  );
  const totalQty = batches.length > 0
    ? batches.reduce((a, b) => a + (Number(b.quantity) || 0), 0)
    : (Number(med.stock) || 0);
  const availQty = medicineStock(med, db.batches);

  function openEdit() {
    setForm({
      name: med.name || "",
      generic: med.generic || "",
      brand: med.brand || "",
      manufacturer: med.manufacturer || "",
      category: med.category || "",
      type: med.type || "OTC",
      dosage: med.dosage || "Tablet",
      strength: med.strength || "",
      purchase: med.purchase || 0,
      selling: med.selling || 0,
      gst: med.gst !== undefined ? med.gst : 12,
      rx: Boolean(med.rx),
      status: med.status || "Active",
    });
    setEditModal(true);
  }

  async function handleSaveEdit() {
    if (!form.name || !form.generic || !form.manufacturer || !form.category) {
      toast("Please fill all required fields.", "error");
      return;
    }
    try {
      let updated;
      try {
        updated = await updateMedicine(med.id, form);
      } catch (apiErr) {
        console.warn("Backend unavailable, saving medicine edit locally:", apiErr.message);
        updated = { id: med.id, ...form };
      }
      setDb((d) => {
        const oldName = med.name;
        const newName = updated.name || form.name || oldName;

        return {
          ...d,
          medicines: d.medicines.map((m) => (m.id === med.id ? { ...m, ...updated, rx: Boolean(updated.rx ?? form.rx) } : m)),
          batches: (d.batches || []).map((b) =>
            b.medicineId === med.id || (oldName && b.medicineName === oldName)
              ? { ...b, medicineName: newName, medicineId: med.id }
              : b
          ),
          prescriptions: (d.prescriptions || []).map((p) =>
            p.medicineId === med.id || (oldName && p.medicine === oldName)
              ? { ...p, medicine: newName, medicineId: med.id }
              : p
          ),
          reservations: (d.reservations || []).map((r) =>
            r.medicineId === med.id || (oldName && r.medicine === oldName)
              ? { ...r, medicine: newName, medicineId: med.id }
              : r
          ),
          partnerAvailability: (d.partnerAvailability || []).map((pa) =>
            oldName && pa.medicineName === oldName ? { ...pa, medicineName: newName } : pa
          ),
        };
      });
      toast("Medicine updated successfully.");
      setEditModal(false);
      refreshDb?.();
    } catch (err) {
      toast(err.message || "Failed to update medicine.", "error");
    }
  }

  return (
    <div>
      <button onClick={() => navigate("/medicines")} className="flex items-center gap-1.5 text-xs font-semibold mb-4" style={{ color: T.blue }}>
        <ArrowLeft size={14} /> Back to Medicines
      </button>
      <PageHeader
        title={med.name}
        subtitle={`${med.generic} · ${med.strength}`}
        crumbs={["MediLink", "Medicines", med.name]}
        action={
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-xs px-3 py-1.5 rounded-xl border bg-emerald-50 text-emerald-800 border-emerald-200">
              Available: {availQty} units
            </span>
            <StatusBadge status={stockStatus(availQty)} />
            <Btn icon={Pencil} size="sm" onClick={openEdit}>
              Edit Medicine
            </Btn>
          </div>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="bg-white rounded-2xl border p-5" style={{ borderColor: T.border }}>
          <h3 className="font-bold text-sm mb-4" style={{ color: T.navy }}>
            Basic Information
          </h3>
          <div className="flex flex-col gap-2.5 text-sm">
            {[
              ["Medicine ID", med.id],
              ["Generic Name", med.generic],
              ["Brand Name", med.brand],
              ["Manufacturer", med.manufacturer],
              ["Category", med.category],
              ["Medicine Type", med.type],
              ["Dosage Form", med.dosage],
              ["Strength", med.strength],
              ["Prescription Required", med.rx ? "Yes" : "No"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b pb-2" style={{ borderColor: T.borderSoft }}>
                <span style={{ color: "#9AA6B2" }}>{k}</span>
                <span className="font-medium text-right" style={{ color: T.navy }}>
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border p-5" style={{ borderColor: T.border }}>
          <h3 className="font-bold text-sm mb-4" style={{ color: T.navy }}>
            Pricing
          </h3>
          <div className="flex flex-col gap-2.5 text-sm mb-5">
            <div className="flex justify-between border-b pb-2" style={{ borderColor: T.borderSoft }}>
              <span style={{ color: "#9AA6B2" }}>Purchase Price</span>
              <span className="font-medium" style={{ color: T.navy }}>
                {formatCurrency(med.purchase)}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2" style={{ borderColor: T.borderSoft }}>
              <span style={{ color: "#9AA6B2" }}>Selling Price</span>
              <span className="font-medium" style={{ color: T.navy }}>
                {formatCurrency(med.selling)}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2" style={{ borderColor: T.borderSoft }}>
              <span style={{ color: "#9AA6B2" }}>GST</span>
              <span className="font-medium" style={{ color: T.navy }}>
                {med.gst}%
              </span>
            </div>
          </div>
          <h3 className="font-bold text-sm mb-3" style={{ color: T.navy }}>
            Stock Summary
          </h3>
          <div className="flex flex-col gap-2.5 text-sm">
            <div className="flex justify-between">
              <span style={{ color: "#9AA6B2" }}>Total Quantity</span>
              <span className="font-medium" style={{ color: T.navy }}>
                {totalQty}
              </span>
            </div>
            <div className="flex justify-between items-center bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
              <span className="font-semibold text-emerald-900">Available Quantity</span>
              <span className="font-bold text-emerald-700 text-base">
                {availQty} units
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "#9AA6B2" }}>Number of Batches</span>
              <span className="font-medium" style={{ color: T.navy }}>
                {batches.length}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border p-5" style={{ borderColor: T.border }}>
          <h3 className="font-bold text-sm mb-4" style={{ color: T.navy }}>
            Description
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: T.navySoft }}>
            {med.name} ({med.generic}) is classified under {med.category.toLowerCase()} and manufactured by {med.manufacturer}.
            {med.rx
              ? " This is a prescription-only medicine and requires a valid doctor's prescription before dispensing."
              : " This medicine is available over the counter."}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Btn variant="secondary" size="sm" icon={MapPinned} onClick={() => navigate("/availability")}>
              Check Availability
            </Btn>
            <Btn variant="secondary" size="sm" icon={CalendarClock} onClick={() => navigate("/reservations")}>
              Reserve for Customer
            </Btn>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: T.border }}>
        <div className="px-5 py-4 border-b font-bold text-sm" style={{ borderColor: T.border, color: T.navy }}>
          Batch List
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: T.blueTint2 }}>
              {["Batch No.", "Branch", "Rack / Shelf", "Mfg Date", "Expiry Date", "Quantity", "Selling Price", "Status"].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 font-semibold" style={{ color: T.navySoft }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {batches.map((b) => (
              <tr key={b.id} className="border-t" style={{ borderColor: T.borderSoft }}>
                <td className="px-4 py-2.5 font-medium" style={{ color: T.navy }}>
                  {b.batchNo}
                </td>
                <td className="px-4 py-2.5" style={{ color: T.navySoft }}>
                  {b.branchName}
                </td>
                <td className="px-4 py-2.5">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    📍 {b.rack || "A1-01"}
                  </span>
                </td>
                <td className="px-4 py-2.5" style={{ color: T.navySoft }}>
                  {formatDate(b.mfgDate)}
                </td>
                <td className="px-4 py-2.5" style={{ color: T.navySoft }}>
                  {formatDate(b.expiryDate)}
                </td>
                <td className="px-4 py-2.5" style={{ color: T.navySoft }}>
                  {b.available} / {b.quantity}
                </td>
                <td className="px-4 py-2.5" style={{ color: T.navySoft }}>
                  {formatCurrency(b.sellingPrice)}
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={b.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={editModal}
        onClose={() => setEditModal(false)}
        title={`Edit Medicine — ${form.name}`}
        footer={
          <>
            <Btn variant="secondary" onClick={() => setEditModal(false)}>
              Cancel
            </Btn>
            <Btn onClick={handleSaveEdit}>Update Medicine</Btn>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Medicine Name" required placeholder="e.g. Dolo 650" value={form.name || ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <FormInput label="Generic Name" required placeholder="e.g. Paracetamol" value={form.generic || ""} onChange={(e) => setForm((f) => ({ ...f, generic: e.target.value }))} />
          <FormInput label="Brand" placeholder="e.g. Micro Labs" value={form.brand || ""} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} />
          <FormInput label="Manufacturer" required placeholder="e.g. Micro Labs Ltd." value={form.manufacturer || ""} onChange={(e) => setForm((f) => ({ ...f, manufacturer: e.target.value }))} />
          <FormSelect label="Category" required value={form.category || ""} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
            <option value="">Select category</option>
            {db.categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </FormSelect>
          <FormSelect label="Medicine Type" required value={form.type || "OTC"} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
            <option>OTC</option>
            <option>Prescription</option>
            <option>Antibiotic</option>
            <option>Supplement</option>
          </FormSelect>
          <FormInput label="Dosage Form" placeholder="Tablet / Syrup / Injection" value={form.dosage || ""} onChange={(e) => setForm((f) => ({ ...f, dosage: e.target.value }))} />
          <FormInput label="Strength" placeholder="e.g. 650 mg" value={form.strength || ""} onChange={(e) => setForm((f) => ({ ...f, strength: e.target.value }))} />
          <FormInput label="Purchase Price (₹)" required type="number" min="0" value={form.purchase || 0} onChange={(e) => setForm((f) => ({ ...f, purchase: e.target.value }))} />
          <FormInput label="Selling Price (₹)" required type="number" min="0" value={form.selling || 0} onChange={(e) => setForm((f) => ({ ...f, selling: e.target.value }))} />
          <FormInput label="GST (%)" type="number" min="0" value={form.gst !== undefined ? form.gst : 12} onChange={(e) => setForm((f) => ({ ...f, gst: e.target.value }))} />
          <FormSelect label="Prescription Required" value={String(form.rx)} onChange={(e) => setForm((f) => ({ ...f, rx: e.target.value === "true" }))}>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </FormSelect>
        </div>
      </Modal>
    </div>
  );
}
