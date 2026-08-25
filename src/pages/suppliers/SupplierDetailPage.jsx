import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ClipboardList, CircleAlert } from "lucide-react";
import { T } from "../../utils/theme.js";
import { formatCurrency, formatDate } from "../../utils/format.js";
import { useApp } from "../../hooks/useApp.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import StatCard from "../../components/common/StatCard.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";

export default function SupplierDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { db } = useApp();
  const s = db.suppliers.find((x) => x.id === id);

  if (!s) {
    return (
      <div>
        <button onClick={() => navigate("/suppliers")} className="flex items-center gap-1.5 text-xs font-semibold mb-4" style={{ color: T.blue }}>
          <ArrowLeft size={14} /> Back to Suppliers
        </button>
        <EmptyState title="Supplier not found" />
      </div>
    );
  }

  const purchases = db.purchases.filter((p) => p.supplier === s.name);
  const totalPurchases = purchases.reduce((a, p) => a + p.amount, 0);
  const pending = purchases.filter((p) => p.payment !== "Paid").reduce((a, p) => a + p.amount, 0);

  return (
    <div>
      <button onClick={() => navigate("/suppliers")} className="flex items-center gap-1.5 text-xs font-semibold mb-4" style={{ color: T.blue }}>
        <ArrowLeft size={14} /> Back to Suppliers
      </button>
      <PageHeader title={s.name} subtitle={s.company} crumbs={["MediLink", "Suppliers", s.name]} action={<StatusBadge status={s.status} />} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="bg-white rounded-2xl border p-5" style={{ borderColor: T.border }}>
          <h3 className="font-bold text-sm mb-4" style={{ color: T.navy }}>
            Supplier Profile
          </h3>
          <div className="flex flex-col gap-2.5 text-sm">
            {[
              ["Contact Person", s.contact],
              ["Phone", s.phone],
              ["Email", s.email],
              ["Address", `${s.address}, ${s.city}`],
              ["GST Number", s.gst],
              ["License No.", s.license],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b pb-2 gap-3" style={{ borderColor: T.borderSoft }}>
                <span style={{ color: "#9AA6B2" }}>{k}</span>
                <span className="font-medium text-right" style={{ color: T.navy }}>
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>
        <StatCard icon={ClipboardList} label="Total Purchases" value={formatCurrency(totalPurchases)} tone="blue" />
        <StatCard icon={CircleAlert} label="Pending Payments" value={formatCurrency(pending)} tone="amber" />
      </div>
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: T.border }}>
        <div className="px-5 py-4 border-b font-bold text-sm" style={{ borderColor: T.border, color: T.navy }}>
          Purchase History
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: T.blueTint2 }}>
              {["Invoice No.", "Branch", "Date", "Amount", "Payment", "Status"].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 font-semibold" style={{ color: T.navySoft }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => (
              <tr key={p.id} className="border-t" style={{ borderColor: T.borderSoft }}>
                <td className="px-4 py-2.5 font-medium" style={{ color: T.navy }}>
                  {p.invoice}
                </td>
                <td className="px-4 py-2.5" style={{ color: T.navySoft }}>
                  {p.branch}
                </td>
                <td className="px-4 py-2.5" style={{ color: T.navySoft }}>
                  {formatDate(p.date)}
                </td>
                <td className="px-4 py-2.5 font-semibold" style={{ color: T.navy }}>
                  {formatCurrency(p.amount)}
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={p.payment} />
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={p.status} />
                </td>
              </tr>
            ))}
            {purchases.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <EmptyState title="No purchases yet" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
