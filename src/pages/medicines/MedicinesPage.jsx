import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Pencil } from "lucide-react";
import { useApp } from "../../hooks/useApp.js";
import { medicineStock, stockStatus, createMedicine, updateMedicine } from "../../services/medicineService.js";
import { formatCurrency } from "../../utils/format.js";
import { T } from "../../utils/theme.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Btn from "../../components/common/Btn.jsx";
import IconBtn from "../../components/common/IconBtn.jsx";
import Modal from "../../components/common/Modal.jsx";
import { FormInput, FormSelect } from "../../components/common/FormControls.jsx";

export default function MedicinesPage() {
  const { db, setDb, toast, refreshDb } = useApp();
  const navigate = useNavigate();
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    generic: "",
    brand: "",
    manufacturer: "",
    category: "",
    type: "OTC",
    dosage: "Tablet",
    strength: "",
    purchase: 0,
    selling: 0,
    gst: 12,
    rx: false,
    status: "Active",
  });

  const rows = db.medicines.map((m) => {
    const medBatches = (db.batches || []).filter(
      (b) => b.medicineId === m.id || b.medicine_id === m.id || b.medicineName === m.name
    );
    const racks = [...new Set(medBatches.map((b) => b.rack).filter(Boolean))].join(", ");
    return {
      ...m,
      stock: medicineStock(m, db.batches),
      rack: racks || "Rack A1",
    };
  });

  function openAdd() {
    setEditingId(null);
    setForm({
      name: "",
      generic: "",
      brand: "",
      manufacturer: "",
      category: "",
      type: "OTC",
      dosage: "Tablet",
      strength: "",
      purchase: 0,
      selling: 0,
      gst: 12,
      rx: false,
      status: "Active",
    });
    setModal(true);
  }

  function openEdit(med) {
    setEditingId(med.id);
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
    setModal(true);
  }

  async function handleSave() {
    if (!form.name || !form.generic || !form.manufacturer || !form.category) {
      toast("Please fill all required fields.", "error");
      return;
    }
    try {
      if (editingId) {
        let updated;
        try {
          updated = await updateMedicine(editingId, form);
        } catch (apiErr) {
          console.warn("Backend unavailable, saving medicine edit locally:", apiErr.message);
          updated = { id: editingId, ...form };
        }
        setDb((d) => {
          const oldMed = (d.medicines || []).find((m) => m.id === editingId);
          const oldName = oldMed?.name;
          const newName = updated.name || form.name || oldName;

          return {
            ...d,
            medicines: d.medicines.map((m) => (m.id === editingId ? { ...m, ...updated, rx: Boolean(updated.rx ?? form.rx) } : m)),
            batches: (d.batches || []).map((b) =>
              b.medicineId === editingId || (oldName && b.medicineName === oldName)
                ? { ...b, medicineName: newName, medicineId: editingId }
                : b
            ),
            prescriptions: (d.prescriptions || []).map((p) =>
              p.medicineId === editingId || (oldName && p.medicine === oldName)
                ? { ...p, medicine: newName, medicineId: editingId }
                : p
            ),
            reservations: (d.reservations || []).map((r) =>
              r.medicineId === editingId || (oldName && r.medicine === oldName)
                ? { ...r, medicine: newName, medicineId: editingId }
                : r
            ),
            partnerAvailability: (d.partnerAvailability || []).map((pa) =>
              oldName && pa.medicineName === oldName ? { ...pa, medicineName: newName } : pa
            ),
          };
        });
        toast("Medicine updated successfully.");
      } else {
        let created;
        try {
          created = await createMedicine(form);
        } catch (apiErr) {
          console.warn("Backend unavailable, creating medicine locally:", apiErr.message);
          created = { id: `MED-${String((db.medicines?.length || 0) + 1).padStart(2, "0")}`, ...form, stock: 0 };
        }
        setDb((d) => ({
          ...d,
          medicines: [...d.medicines, created],
        }));
        toast("Medicine added successfully.");
      }
      setModal(false);
      refreshDb?.();
    } catch (err) {
      toast(err.message || "Failed to save medicine.", "error");
    }
  }

  return (
    <div>
      <PageHeader
        title="Medicines"
        subtitle="Manage the full medicine catalogue"
        crumbs={["MediLink", "Medicines"]}
        action={
          <Btn icon={Plus} onClick={openAdd}>
            Add Medicine
          </Btn>
        }
      />
      <DataTable
        columns={[
          { key: "id", label: "Medicine ID", sortable: true },
          { key: "name", label: "Medicine Name", sortable: true, render: (r) => <span className="font-semibold">{r.name}</span> },
          { key: "generic", label: "Generic Name" },
          { key: "category", label: "Category" },
          { key: "manufacturer", label: "Manufacturer" },
          { key: "strength", label: "Strength" },
          {
            key: "rx",
            label: "Rx",
            render: (r) =>
              r.rx ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded" style={{ background: T.redTint, color: T.red }}>
                  Required
                </span>
              ) : (
                <span className="text-[11px] px-2 py-0.5 rounded" style={{ background: T.borderSoft, color: "#6B7280" }}>
                  OTC
                </span>
              ),
          },
          { key: "selling", label: "Selling Price", sortable: true, render: (r) => formatCurrency(r.selling) },
          {
            key: "rack",
            label: "Rack / Shelf",
            render: (r) => (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                📍 {r.rack}
              </span>
            ),
          },
          {
            key: "stock",
            label: "Available Qty",
            sortable: true,
            render: (r) => (
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs px-2 py-0.5 rounded border bg-blue-50/70 text-blue-900 border-blue-200">
                  {r.stock} units
                </span>
                <StatusBadge status={stockStatus(r.stock)} />
              </div>
            ),
          },
        ]}
        data={rows}
        searchKeys={["name", "generic", "brand", "manufacturer"]}
        filters={[
          { key: "category", label: "Category", options: [...new Set(rows.map((r) => r.category))] },
          { key: "manufacturer", label: "Manufacturer", options: [...new Set(rows.map((r) => r.manufacturer))] },
          { key: "type", label: "Type", options: [...new Set(rows.map((r) => r.type))] },
        ]}
        onRowClick={(r) => navigate(`/medicines/${r.id}`)}
        actions={(r) => (
          <>
            <IconBtn icon={Eye} tone="blue" onClick={() => navigate(`/medicines/${r.id}`)} />
            <IconBtn icon={Pencil} tone="blue" title="Edit Medicine" onClick={(e) => { e.stopPropagation(); openEdit(r); }} />
          </>
        )}
      />
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editingId ? `Edit Medicine — ${form.name}` : "Add New Medicine"}
        footer={
          <>
            <Btn variant="secondary" onClick={() => setModal(false)}>
              Cancel
            </Btn>
            <Btn onClick={handleSave}>
              {editingId ? "Update Medicine" : "Save Medicine"}
            </Btn>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Medicine Name" required placeholder="e.g. Dolo 650" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <FormInput label="Generic Name" required placeholder="e.g. Paracetamol" value={form.generic} onChange={(e) => setForm((f) => ({ ...f, generic: e.target.value }))} />
          <FormInput label="Brand" placeholder="e.g. Micro Labs" value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} />
          <FormInput label="Manufacturer" required placeholder="e.g. Micro Labs Ltd." value={form.manufacturer} onChange={(e) => setForm((f) => ({ ...f, manufacturer: e.target.value }))} />
          <FormSelect label="Category" required value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
            <option value="">Select category</option>
            {db.categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </FormSelect>
          <FormSelect label="Medicine Type" required value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
            <option>OTC</option>
            <option>Prescription</option>
            <option>Antibiotic</option>
            <option>Supplement</option>
          </FormSelect>
          <FormInput label="Dosage Form" placeholder="Tablet / Syrup / Injection" value={form.dosage} onChange={(e) => setForm((f) => ({ ...f, dosage: e.target.value }))} />
          <FormInput label="Strength" placeholder="e.g. 650 mg" value={form.strength} onChange={(e) => setForm((f) => ({ ...f, strength: e.target.value }))} />
          <FormInput label="Purchase Price (₹)" required type="number" min="0" value={form.purchase} onChange={(e) => setForm((f) => ({ ...f, purchase: e.target.value }))} />
          <FormInput label="Selling Price (₹)" required type="number" min="0" value={form.selling} onChange={(e) => setForm((f) => ({ ...f, selling: e.target.value }))} />
          <FormInput label="GST (%)" type="number" min="0" value={form.gst} onChange={(e) => setForm((f) => ({ ...f, gst: e.target.value }))} />
          <FormSelect label="Prescription Required" value={String(form.rx)} onChange={(e) => setForm((f) => ({ ...f, rx: e.target.value === "true" }))}>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </FormSelect>
        </div>
      </Modal>
    </div>
  );
}
