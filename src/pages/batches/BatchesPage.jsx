import React, { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { useApp } from "../../hooks/useApp.js";
import { formatCurrency, formatDate } from "../../utils/format.js";
import { createBatch, updateBatch } from "../../services/batchService.js";
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

  const [addBatchModal, setAddBatchModal] = useState(false);
  const [addBatchForm, setAddBatchForm] = useState({
    medicineId: "",
    branchName: "Kovilpatti Branch",
    batchNo: "",
    available: 100,
    quantity: 100,
    mfgDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0],
    rack: "A1-01",
    purchasePrice: 0,
    sellingPrice: 0,
  });

  function openAddBatch() {
    const firstMed = db.medicines?.[0];
    setAddBatchForm({
      medicineId: firstMed?.id || "",
      branchName: db.branches?.[0]?.name || "Kovilpatti Branch",
      batchNo: `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
      available: 100,
      quantity: 100,
      mfgDate: new Date().toISOString().split("T")[0],
      expiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0],
      rack: "A1-01",
      purchasePrice: firstMed?.purchase || 0,
      sellingPrice: firstMed?.selling || 0,
    });
    setAddBatchModal(true);
  }

  async function handleSaveAddBatch() {
    if (!addBatchForm.medicineId || !addBatchForm.batchNo || addBatchForm.available === undefined) {
      toast("Please select a medicine and enter batch number and available quantity.", "error");
      return;
    }
    try {
      const med = db.medicines.find((m) => m.id === addBatchForm.medicineId) || { id: addBatchForm.medicineId, name: "Medicine" };
      const selectedBranch = db.branches.find((b) => b.name === addBatchForm.branchName) || { id: "BR-01", name: addBatchForm.branchName };

      const payload = {
        batchNo: addBatchForm.batchNo,
        medicineId: med.id,
        branchId: selectedBranch.id,
        branchName: selectedBranch.name,
        mfgDate: addBatchForm.mfgDate,
        expiryDate: addBatchForm.expiryDate,
        quantity: Number(addBatchForm.quantity || addBatchForm.available),
        available: Number(addBatchForm.available),
        purchasePrice: Number(addBatchForm.purchasePrice || med.purchase || 0),
        sellingPrice: Number(addBatchForm.sellingPrice || med.selling || 0),
        rack: addBatchForm.rack || "A1-01",
      };

      const created = await createBatch(payload);

      setDb((d) => {
        const nextBatches = [
          {
            id: created.id || `BAT-${Date.now().toString().slice(-4)}`,
            medicineName: med.name,
            ...payload,
            ...created,
          },
          ...(d.batches || []),
        ];
        const nextStock = medicineStock(med, nextBatches);
        const nextMeds = (d.medicines || []).map((m) =>
          m.id === med.id ? { ...m, stock: nextStock } : m
        );
        return {
          ...d,
          batches: nextBatches,
          medicines: nextMeds,
        };
      });

      toast(`Added batch ${addBatchForm.batchNo} (${addBatchForm.available} units) successfully!`);
      setAddBatchModal(false);
      refreshDb?.();
    } catch (err) {
      toast(err.message || "Failed to create batch.", "error");
    }
  }

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
        action={
          <Btn icon={Plus} onClick={openAddBatch}>
            Add Batch / Stock
          </Btn>
        }
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

      {/* Add New Batch / Stock Modal */}
      <Modal
        open={addBatchModal}
        onClose={() => setAddBatchModal(false)}
        title="Add New Batch / Stock"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setAddBatchModal(false)}>
              Cancel
            </Btn>
            <Btn onClick={handleSaveAddBatch}>Create Batch</Btn>
          </>
        }
      >
        <div className="flex flex-col gap-3.5 text-xs">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
            Create a new batch to immediately add available stock to any medicine at any branch.
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <div className="col-span-2">
              <FormSelect
                label="Select Medicine"
                required
                value={addBatchForm.medicineId}
                onChange={(e) => {
                  const mId = e.target.value;
                  const found = db.medicines.find((x) => x.id === mId);
                  setAddBatchForm((f) => ({
                    ...f,
                    medicineId: mId,
                    purchasePrice: found?.purchase || f.purchasePrice,
                    sellingPrice: found?.selling || f.sellingPrice,
                  }));
                }}
              >
                <option value="">-- Choose Medicine --</option>
                {db.medicines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.generic} · {m.strength})
                  </option>
                ))}
              </FormSelect>
            </div>
            <FormSelect
              label="Branch"
              required
              value={addBatchForm.branchName}
              onChange={(e) => setAddBatchForm((f) => ({ ...f, branchName: e.target.value }))}
            >
              {db.branches.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </FormSelect>
            <FormInput
              label="Batch Number"
              required
              placeholder="e.g. BAT-2026-01"
              value={addBatchForm.batchNo}
              onChange={(e) => setAddBatchForm((f) => ({ ...f, batchNo: e.target.value }))}
            />
            <FormInput
              label="Available Quantity (Stock to Add)"
              required
              type="number"
              min="1"
              value={addBatchForm.available}
              onChange={(e) =>
                setAddBatchForm((f) => ({
                  ...f,
                  available: Number(e.target.value),
                  quantity: Number(e.target.value),
                }))
              }
            />
            <FormInput
              label="Rack / Shelf Location"
              value={addBatchForm.rack}
              onChange={(e) => setAddBatchForm((f) => ({ ...f, rack: e.target.value }))}
            />
            <FormInput
              label="Manufacturing Date"
              required
              type="date"
              value={addBatchForm.mfgDate}
              onChange={(e) => setAddBatchForm((f) => ({ ...f, mfgDate: e.target.value }))}
            />
            <FormInput
              label="Expiry Date"
              required
              type="date"
              value={addBatchForm.expiryDate}
              onChange={(e) => setAddBatchForm((f) => ({ ...f, expiryDate: e.target.value }))}
            />
            <FormInput
              label="Purchase Price (₹)"
              type="number"
              min="0"
              value={addBatchForm.purchasePrice}
              onChange={(e) => setAddBatchForm((f) => ({ ...f, purchasePrice: Number(e.target.value) }))}
            />
            <FormInput
              label="Selling Price (₹)"
              type="number"
              min="0"
              value={addBatchForm.sellingPrice}
              onChange={(e) => setAddBatchForm((f) => ({ ...f, sellingPrice: Number(e.target.value) }))}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

