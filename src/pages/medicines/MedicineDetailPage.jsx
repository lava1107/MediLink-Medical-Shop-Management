import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPinned, CalendarClock } from "lucide-react";
import { T } from "../../utils/theme.js";
import { formatCurrency, formatDate } from "../../utils/format.js";
import { useApp } from "../../hooks/useApp.js";
import { stockStatus } from "../../services/medicineService.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Btn from "../../components/common/Btn.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";

export default function MedicineDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { db } = useApp();
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

  const batches = db.batches.filter((b) => b.medicineId === med.id);
  const totalQty = batches.reduce((a, b) => a + b.quantity, 0);
  const availQty = batches.reduce((a, b) => a + b.available, 0);

  return (
    <div>
      <button onClick={() => navigate("/medicines")} className="flex items-center gap-1.5 text-xs font-semibold mb-4" style={{ color: T.blue }}>
        <ArrowLeft size={14} /> Back to Medicines
      </button>
      <PageHeader
        title={med.name}
        subtitle={`${med.generic} · ${med.strength}`}
        crumbs={["MediLink", "Medicines", med.name]}
        action={<StatusBadge status={stockStatus(availQty)} />}
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
            <div className="flex justify-between">
              <span style={{ color: "#9AA6B2" }}>Available Quantity</span>
              <span className="font-medium" style={{ color: T.navy }}>
                {availQty}
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
              {["Batch No.", "Branch", "Mfg Date", "Expiry Date", "Quantity", "Selling Price", "Status"].map((h) => (
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
    </div>
  );
}
