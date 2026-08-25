import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Pencil } from "lucide-react";
import { useApp } from "../../hooks/useApp.js";
import { medicineStock, stockStatus } from "../../services/medicineService.js";
import { formatCurrency } from "../../utils/format.js";
import { T } from "../../utils/theme.js";
import { CATEGORIES } from "../../data/mockData.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Btn from "../../components/common/Btn.jsx";
import IconBtn from "../../components/common/IconBtn.jsx";
import Modal from "../../components/common/Modal.jsx";
import { FormInput, FormSelect } from "../../components/common/FormControls.jsx";

export default function MedicinesPage() {
  const { db, toast } = useApp();
  const navigate = useNavigate();
  const [modal, setModal] = useState(false);

  const rows = db.medicines.map((m) => ({ ...m, stock: medicineStock(m, db.batches) }));

  return (
    <div>
      <PageHeader
        title="Medicines"
        subtitle="Manage the full medicine catalogue"
        crumbs={["MediLink", "Medicines"]}
        action={
          <Btn icon={Plus} onClick={() => setModal(true)}>
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
          { key: "stock", label: "Stock", sortable: true, render: (r) => <StatusBadge status={stockStatus(r.stock)} /> },
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
            <IconBtn icon={Pencil} tone="blue" onClick={() => toast("Edit medicine form would open here.")} />
          </>
        )}
      />
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Add New Medicine"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setModal(false)}>
              Cancel
            </Btn>
            <Btn
              onClick={() => {
                toast("Medicine added to catalogue.");
                setModal(false);
              }}
            >
              Save Medicine
            </Btn>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Medicine Name" required placeholder="e.g. Dolo 650" />
          <FormInput label="Generic Name" required placeholder="e.g. Paracetamol" />
          <FormInput label="Brand" placeholder="e.g. Micro Labs" />
          <FormInput label="Manufacturer" required placeholder="e.g. Micro Labs Ltd." />
          <FormSelect label="Category" required>
            <option value="">Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c.id}>{c.name}</option>
            ))}
          </FormSelect>
          <FormSelect label="Medicine Type" required>
            <option>OTC</option>
            <option>Prescription</option>
            <option>Antibiotic</option>
            <option>Supplement</option>
          </FormSelect>
          <FormInput label="Dosage Form" placeholder="Tablet / Syrup / Injection" />
          <FormInput label="Strength" placeholder="e.g. 650 mg" />
          <FormInput label="Purchase Price (₹)" required type="number" min="0" />
          <FormInput label="Selling Price (₹)" required type="number" min="0" />
          <FormInput label="GST (%)" type="number" min="0" defaultValue={12} />
          <FormSelect label="Prescription Required">
            <option value="false">No</option>
            <option value="true">Yes</option>
          </FormSelect>
        </div>
      </Modal>
    </div>
  );
}
