import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Receipt, Pill, CircleAlert } from "lucide-react";
import { T } from "../../utils/theme.js";
import { formatCurrency, formatDate } from "../../utils/format.js";
import { TODAY } from "../../data/mockData.js";
import { useApp } from "../../hooks/useApp.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import StatCard from "../../components/common/StatCard.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";

export default function BranchDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { db } = useApp();
  const br = db.branches.find((b) => b.id === id);

  if (!br) {
    return (
      <div>
        <button onClick={() => navigate("/branches")} className="flex items-center gap-1.5 text-xs font-semibold mb-4" style={{ color: T.blue }}>
          <ArrowLeft size={14} /> Back to Branches
        </button>
        <EmptyState title="Branch not found" />
      </div>
    );
  }

  const batches = db.batches.filter((b) => b.branchName === br.name);
  const sales = db.sales.filter((s) => s.branch === br.name);
  const staff = db.users.filter((u) => u.branch === br.name);
  const monthlySales = sales.reduce((a, s) => a + s.amount, 0) * 5.2;

  return (
    <div>
      <button onClick={() => navigate("/branches")} className="flex items-center gap-1.5 text-xs font-semibold mb-4" style={{ color: T.blue }}>
        <ArrowLeft size={14} /> Back to Branches
      </button>
      <PageHeader title={br.name} subtitle={`${br.address}, ${br.city} - ${br.pin}`} crumbs={["MediLink", "Branches", br.name]} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <StatCard icon={ShoppingCart} label="Today's Sales" value={formatCurrency(sales.filter((s) => s.date === TODAY).reduce((a, s) => a + s.amount, 0))} tone="green" />
        <StatCard icon={Receipt} label="Monthly Sales" value={formatCurrency(monthlySales)} tone="blue" />
        <StatCard icon={Pill} label="Medicines Available" value={batches.filter((b) => b.available > 0).length} tone="navy" />
        <StatCard icon={CircleAlert} label="Low Stock" value={batches.filter((b) => b.available > 0 && b.available <= 20).length} tone="amber" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border p-5 lg:col-span-1" style={{ borderColor: T.border }}>
          <h3 className="font-bold text-sm mb-4" style={{ color: T.navy }}>
            Branch Information
          </h3>
          <div className="flex flex-col gap-3 text-sm">
            {[
              ["Manager", br.manager],
              ["Phone", br.phone],
              ["Email", br.email],
              ["Hours", `${br.opening} – ${br.closing}`],
              ["Staff", staff.length + " employees"],
              ["State", br.state],
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
        <div className="lg:col-span-2 bg-white rounded-2xl border overflow-hidden" style={{ borderColor: T.border }}>
          <div className="px-5 py-4 border-b font-bold text-sm" style={{ borderColor: T.border, color: T.navy }}>
            Expiring / Low Stock Medicines
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: T.blueTint2 }}>
                {["Medicine", "Batch", "Quantity", "Expiry", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 font-semibold" style={{ color: T.navySoft }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {batches
                .filter((b) => b.status !== "Safe" || b.available <= 20)
                .slice(0, 8)
                .map((b) => (
                  <tr key={b.id} className="border-t" style={{ borderColor: T.borderSoft }}>
                    <td className="px-4 py-2.5 font-medium" style={{ color: T.navy }}>
                      {b.medicineName}
                    </td>
                    <td className="px-4 py-2.5" style={{ color: T.navySoft }}>
                      {b.batchNo}
                    </td>
                    <td className="px-4 py-2.5" style={{ color: T.navySoft }}>
                      {b.available}
                    </td>
                    <td className="px-4 py-2.5" style={{ color: T.navySoft }}>
                      {formatDate(b.expiryDate)}
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
    </div>
  );
}
