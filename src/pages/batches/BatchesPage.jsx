import React, { useState } from "react";
import { Pencil } from "lucide-react";
import { useApp } from "../../hooks/useApp.js";
import { formatCurrency, formatDate } from "../../utils/format.js";
import { updateBatch } from "../../services/batchService.js";
import { medicineStock } from "../../services/medicineService.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import IconBtn from "../../components/common/IconBtn.jsx";
import Btn from "../../components/common/Btn.jsx";
import Modal from "../../components/common/Modal.jsx";
import { FormInput, FormSelect } from "../../components/common/FormControls.jsx";

export default function BatchesPage() {
  const { db, setDb, toast, refreshDb } = useApp();
  const [editModal, setEditModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [editForm, setEditForm] = useState({
    batchNo: "",
    rack: "",
    mfgDate: "",
    expiryDate: "",
    quantity: 0,
    available: 0,
    purchasePrice: 0,
    sellingPrice: 0,
    status: "Safe",
  });

  function openEdit(b) {
    setEditingBatch(b);
    setEditForm({
      batchNo: b.batchNo || "",
      rack: b.rack || "",
      mfgDate: b.mfgDate ? b.mfgDate.split("T")[0] : "",
      expiryDate: b.expiryDate ? b.expiryDate.split("T")[0] : "",
      quantity: b.quantity ?? 0,
      available: b.available ?? 0,
      purchasePrice: b.purchasePrice ?? 0,
      sellingPrice: b.sellingPrice ?? 0,
      status: b.status || "Safe",
    });
    setEditModal(true);
  }

  async function handleSaveEdit() {
    if (!editForm.batchNo || editForm.available === undefined) {
      toast("Please fill in batch number and available quantity.", "error");
      return;
    }
    try {
      const payload = {
        ...editForm,
        quantity: Number(editForm.quantity),
        available: Number(editForm.available),
        purchasePrice: Number(editForm.purchasePrice) || 0,
        sellingPrice: Number(editForm.sellingPrice) || 0,
      };
      const updated = await updateBatch(editingBatch.id, payload);

      setDb((d) => {
        const nextBatches = (d.batches || []).map((b) =>
          b.id === editingBatch.id ? { ...b, ...payload, ...updated } : b
        );
        // Also sync medicine total stock if this batch belongs to a medicine
        const medId = editingBatch.medicineId;
        let nextMeds = d.medicines || [];
        if (medId) {
          const totalStock = medicineStock({ id: medId }, nextBatches);
          nextMeds = nextMeds.map((m) => (m.id === medId ? { ...m, stock: totalStock } : m));
        }
        return {
          ...d,
          batches: nextBatches,
          medicines: nextMeds,
        };
      });

      toast("Batch updated successfully.");
      setEditModal(false);
      refreshDb?.();
    } catch (err) {
      toast(err.message || "Failed to update batch.", "error");
    }
  }

  return (
    <div>
      <PageHeader
        title="Medicine Batch Management"
        subtitle="Track batch-level stock, rack location and expiry"
        crumbs={["MediLink", "Medicine Batches"]}
      />
      <DataTable
        columns={[
          { key: "batchNo", label: "Batch No.", sortable: true },
          { key: "medicineName", label: "Medicine", sortable: true },
          { key: "branchName", label: "Branch" },
          { key: "mfgDate", label: "Mfg Date", render: (r) => formatDate(r.mfgDate) },
          { key: "expiryDate", label: "Expiry Date", sortable: true, render: (r) => formatDate(r.expiryDate) },
          { key: "available", label: "Available Qty", sortable: true },
          { key: "rack", label: "Rack" },
          { key: "sellingPrice", label: "Selling Price", render: (r) => formatCurrency(r.sellingPrice) },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
        ]}
        data={db.batches}
        searchKeys={["batchNo", "medicineName", "branchName"]}
        filters={[
          { key: "branchName", label: "Branch", options: (db.branches || []).map((b) => b.name) },
          { key: "status", label: "Expiry Status", options: ["Safe", "Expiring Soon", "Expired"] },
        ]}
        actions={(b) => (
          <div className="flex items-center gap-1">
            <IconBtn icon={Pencil} tone="blue" title="Edit Batch" onClick={() => openEdit(b)} />
          </div>
        )}
        pageSize={10}
      />

      <Modal
        open={editModal}
        onClose={() => setEditModal(false)}
        title={`Edit Batch ${editingBatch?.batchNo || ""}`}
        footer={
          <>
            <Btn variant="secondary" onClick={() => setEditModal(false)}>
              Cancel
            </Btn>
            <Btn onClick={handleSaveEdit}>Save Changes</Btn>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Batch Number"
            required
            value={editForm.batchNo}
            onChange={(e) => setEditForm((f) => ({ ...f, batchNo: e.target.value }))}
          />
          <FormInput
            label="Rack Location"
            value={editForm.rack}
            onChange={(e) => setEditForm((f) => ({ ...f, rack: e.target.value }))}
          />
          <FormInput
            label="Available Quantity"
            required
            type="number"
            min="0"
            value={editForm.available}
            onChange={(e) => setEditForm((f) => ({ ...f, available: e.target.value }))}
          />
          <FormInput
            label="Total Quantity"
            required
            type="number"
            min="0"
            value={editForm.quantity}
            onChange={(e) => setEditForm((f) => ({ ...f, quantity: e.target.value }))}
          />
          <FormInput
            label="Selling Price (₹)"
            type="number"
            step="0.01"
            min="0"
            value={editForm.sellingPrice}
            onChange={(e) => setEditForm((f) => ({ ...f, sellingPrice: e.target.value }))}
          />
          <FormInput
            label="Purchase Price (₹)"
            type="number"
            step="0.01"
            min="0"
            value={editForm.purchasePrice}
            onChange={(e) => setEditForm((f) => ({ ...f, purchasePrice: e.target.value }))}
          />
          <FormInput
            label="Mfg Date"
            type="date"
            value={editForm.mfgDate}
            onChange={(e) => setEditForm((f) => ({ ...f, mfgDate: e.target.value }))}
          />
          <FormInput
            label="Expiry Date"
            type="date"
            value={editForm.expiryDate}
            onChange={(e) => setEditForm((f) => ({ ...f, expiryDate: e.target.value }))}
          />
          <div className="col-span-2">
            <FormSelect
              label="Expiry Status"
              value={editForm.status}
              onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="Safe">Safe</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Expired">Expired</option>
            </FormSelect>
          </div>
        </div>
      </Modal>
    </div>
  );
}

