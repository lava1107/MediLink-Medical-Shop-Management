import React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Receipt, UserRound, CalendarClock, CircleAlert, CalendarX2, Search, MapPinned, Handshake } from "lucide-react";
import { T } from "../../utils/theme.js";
import { formatCurrency, formatDate } from "../../utils/format.js";
import { TODAY } from "../../data/mockData.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useApp } from "../../hooks/useApp.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import StatCard from "../../components/common/StatCard.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Btn from "../../components/common/Btn.jsx";

export default function PharmacistDashboard() {
  const { user } = useAuth();
  const { db } = useApp();
  const navigate = useNavigate();

  const branchSales = db.sales.filter((s) => s.branch === user.branch);
  const todaySales = branchSales.filter((s) => s.date === TODAY).reduce((a, s) => a + s.amount, 0);
  const todayBills = branchSales.filter((s) => s.date === TODAY).length;
  const branchBatches = db.batches.filter((b) => b.branchName === user.branch);
  const lowStock = branchBatches.filter((b) => b.available > 0 && b.available <= 20).length;
  const nearExpiry = branchBatches.filter((b) => b.status === "Expiring Soon").length;
  const pendingRes = db.reservations.filter((r) => r.branch === user.branch && (r.status === "Pending" || r.status === "Reserved")).length;

  return (
    <div>
      <PageHeader title={`Welcome back, ${user.name.split(" ")[0]}`} subtitle={`${user.branch} · Thursday, 20 August 2026`} />
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard icon={ShoppingCart} label="Today's Sales" value={formatCurrency(todaySales)} tone="green" onClick={() => navigate("/reports/daily-sales")} />
        <StatCard icon={Receipt} label="Today's Bills" value={todayBills} tone="blue" onClick={() => navigate("/reports/daily-sales")} />
        <StatCard icon={UserRound} label="Customers Served" value={new Set(branchSales.map((s) => s.customer)).size} tone="navy" onClick={() => navigate("/customers")} />
        <StatCard icon={CalendarClock} label="Pending Reservations" value={pendingRes} tone="amber" onClick={() => navigate("/reservations")} />
        <StatCard icon={CircleAlert} label="Low Stock" value={lowStock} tone="amber" onClick={() => navigate("/reports/low-stock")} />
        <StatCard icon={CalendarX2} label="Expiring Medicines" value={nearExpiry} tone="red" onClick={() => navigate("/reports/near-expiry")} />
      </div>

      <div className="bg-white rounded-2xl border p-5 mb-5" style={{ borderColor: T.border }}>
        <h3 className="font-bold text-sm mb-3" style={{ color: T.navy }}>
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
          <Btn variant="primary" icon={ShoppingCart} onClick={() => navigate("/sales")}>
            New Bill
          </Btn>
          <Btn variant="secondary" icon={Search} onClick={() => navigate("/medicines")}>
            Search Medicine
          </Btn>
          <Btn variant="secondary" icon={MapPinned} onClick={() => navigate("/availability")}>
            Check Other Branch
          </Btn>
          <Btn variant="secondary" icon={Handshake} onClick={() => navigate("/partners")}>
            Check Partner Shop
          </Btn>
          <Btn variant="secondary" icon={CalendarClock} onClick={() => navigate("/reservations")}>
            Reserve Medicine
          </Btn>
        </div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: T.border }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: T.border }}>
          <h3 className="font-bold text-sm" style={{ color: T.navy }}>
            Recent Transactions
          </h3>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: T.blueTint2 }}>
              {["Bill No.", "Customer", "Amount", "Payment", "Date", "Status"].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 font-semibold" style={{ color: T.navySoft }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {branchSales.slice(0, 6).map((s) => (
              <tr key={s.id} className="border-t" style={{ borderColor: T.borderSoft }}>
                <td className="px-4 py-2.5 font-medium" style={{ color: T.navy }}>
                  {s.bill}
                </td>
                <td className="px-4 py-2.5" style={{ color: T.navySoft }}>
                  {s.customer}
                </td>
                <td className="px-4 py-2.5 font-semibold" style={{ color: T.navy }}>
                  {formatCurrency(s.amount)}
                </td>
                <td className="px-4 py-2.5" style={{ color: T.navySoft }}>
                  {s.payment}
                </td>
                <td className="px-4 py-2.5" style={{ color: T.navySoft }}>
                  {formatDate(s.date)}
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={s.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
