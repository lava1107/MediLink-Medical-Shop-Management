import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Pill, Tags, Truck, UserRound, Building2, ShoppingCart, Receipt, ClipboardList,
  CircleAlert, CalendarX2, CalendarClock, PackageX, Clock, Plus, PackagePlus,
} from "lucide-react";
import { T } from "../../utils/theme.js";
import { formatCurrency, formatDate } from "../../utils/format.js";
import { TODAY } from "../../data/mockData.js";
import { useApp } from "../../hooks/useApp.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import StatCard from "../../components/common/StatCard.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Btn from "../../components/common/Btn.jsx";
import { SALES_TREND, PURCHASE_TREND, BRANCH_PERF, TOP_MEDS, PIE_COLORS } from "./dashboardData.js";

export default function AdminDashboard() {
  const { db } = useApp();
  const navigate = useNavigate();

  const lowStock = db.batches.filter((b) => b.available > 0 && b.available <= 20).length;
  const nearExpiry = db.batches.filter((b) => b.status === "Expiring Soon").length;
  const expired = db.batches.filter((b) => b.status === "Expired").length;
  const activeRes = db.reservations.filter((r) => r.status === "Pending" || r.status === "Reserved").length;
  const todaySales = db.sales.filter((s) => s.date === TODAY).reduce((a, s) => a + s.amount, 0);
  const currentMonth = TODAY.slice(0, 7); // "2026-08"
  const monthlyRevenue = db.sales.filter((s) => s.date.startsWith(currentMonth)).reduce((a, s) => a + s.amount, 0);

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Overview across all branches · Thursday, 20 August 2026" />
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-5">
        <StatCard icon={Pill} label="Total Medicines" value={db.medicines.length} tone="blue" onClick={() => navigate("/medicines")} />
        <StatCard icon={Tags} label="Categories" value={db.categories.length} tone="navy" onClick={() => navigate("/categories")} />
        <StatCard icon={Truck} label="Suppliers" value={db.suppliers.length} tone="blue" onClick={() => navigate("/suppliers")} />
        <StatCard icon={UserRound} label="Customers" value={db.customers.length} tone="green" onClick={() => navigate("/customers")} />
        <StatCard icon={Building2} label="Branches" value={db.branches.length} tone="navy" onClick={() => navigate("/branches")} />
        <StatCard icon={ShoppingCart} label="Today's Sales" value={formatCurrency(todaySales)} tone="green" trend={8.2} onClick={() => navigate("/reports/daily-sales")} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <StatCard icon={Receipt} label="Monthly Revenue" value={formatCurrency(monthlyRevenue)} tone="green" trend={11.4} onClick={() => navigate("/reports/monthly-sales")} />
        <StatCard icon={ClipboardList} label="Total Purchases" value={db.purchases.length} tone="blue" onClick={() => navigate("/purchases")} />
        <StatCard icon={CircleAlert} label="Low Stock Medicines" value={lowStock} tone="amber" onClick={() => navigate("/reports/low-stock")} />
        <StatCard icon={CalendarX2} label="Near Expiry Medicines" value={nearExpiry} tone="amber" onClick={() => navigate("/reports/near-expiry")} />
        <StatCard icon={CalendarClock} label="Active Reservations" value={activeRes} tone="blue" onClick={() => navigate("/reservations")} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        <div className="xl:col-span-2 bg-white rounded-2xl border p-5" style={{ borderColor: T.border }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm" style={{ color: T.navy }}>
              Sales Overview — This Week
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={SALES_TREND}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.blue} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={T.blue} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.borderSoft} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9AA6B2" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9AA6B2" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: `1px solid ${T.border}`, fontSize: 12 }} />
              <Area type="monotone" dataKey="sales" stroke={T.blue} strokeWidth={2.5} fill="url(#salesGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl border p-5" style={{ borderColor: T.border }}>
          <h3 className="font-bold text-sm mb-4" style={{ color: T.navy }}>
            Branch Performance
          </h3>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={BRANCH_PERF} dataKey="revenue" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
                {BRANCH_PERF.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: `1px solid ${T.border}`, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5 mt-1">
            {BRANCH_PERF.map((b, i) => (
              <div key={b.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5" style={{ color: T.navySoft }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  {b.name}
                </span>
                <span className="font-semibold" style={{ color: T.navy }}>
                  {formatCurrency(b.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        <div className="xl:col-span-2 bg-white rounded-2xl border p-5" style={{ borderColor: T.border }}>
          <h3 className="font-bold text-sm mb-4" style={{ color: T.navy }}>
            Purchase Overview — Monthly Trend
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={PURCHASE_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.borderSoft} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9AA6B2" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9AA6B2" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: `1px solid ${T.border}`, fontSize: 12 }} />
              <Bar dataKey="purchase" fill={T.green} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl border p-5" style={{ borderColor: T.border }}>
          <h3 className="font-bold text-sm mb-4" style={{ color: T.navy }}>
            Top Selling Medicines
          </h3>
          <div className="flex flex-col gap-3">
            {TOP_MEDS.map((m, i) => (
              <div key={m.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: T.navy }} className="font-medium">
                    {m.name}
                  </span>
                  <span style={{ color: "#9AA6B2" }}>{m.units} units</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: T.borderSoft }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${(m.units / 412) * 100}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-white rounded-2xl border overflow-hidden" style={{ borderColor: T.border }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: T.border }}>
            <h3 className="font-bold text-sm" style={{ color: T.navy }}>
              Recent Sales
            </h3>
            <button onClick={() => navigate("/sales")} className="text-xs font-semibold" style={{ color: T.blue }}>
              View all
            </button>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: T.blueTint2 }}>
                {["Bill No.", "Customer", "Branch", "Amount", "Payment", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 font-semibold" style={{ color: T.navySoft }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {db.sales.slice(0, 6).map((s) => (
                <tr key={s.id} className="border-t" style={{ borderColor: T.borderSoft }}>
                  <td className="px-4 py-2.5 font-medium" style={{ color: T.navy }}>
                    {s.bill}
                  </td>
                  <td className="px-4 py-2.5" style={{ color: T.navySoft }}>
                    {s.customer}
                  </td>
                  <td className="px-4 py-2.5" style={{ color: T.navySoft }}>
                    {s.branch.replace(" Branch", "")}
                  </td>
                  <td className="px-4 py-2.5 font-semibold" style={{ color: T.navy }}>
                    {formatCurrency(s.amount)}
                  </td>
                  <td className="px-4 py-2.5" style={{ color: T.navySoft }}>
                    {s.payment}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={s.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-2xl border p-5 flex flex-col gap-4" style={{ borderColor: T.border }}>
          <div>
            <h3 className="font-bold text-sm mb-3" style={{ color: T.navy }}>
              Alerts
            </h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: T.amberTint }}>
                <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: T.amber }}>
                  <CircleAlert size={13} /> Low stock
                </span>
                <span className="text-xs font-bold" style={{ color: T.amber }}>
                  {lowStock}
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: T.amberTint }}>
                <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: T.amber }}>
                  <CalendarX2 size={13} /> Near expiry
                </span>
                <span className="text-xs font-bold" style={{ color: T.amber }}>
                  {nearExpiry}
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: T.redTint }}>
                <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: T.red }}>
                  <PackageX size={13} /> Expired medicines
                </span>
                <span className="text-xs font-bold" style={{ color: T.red }}>
                  {expired}
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: T.blueTint }}>
                <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: T.blue }}>
                  <Clock size={13} /> Pending reservations
                </span>
                <span className="text-xs font-bold" style={{ color: T.blue }}>
                  {db.reservations.filter((r) => r.status === "Pending").length}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-sm mb-3" style={{ color: T.navy }}>
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Btn size="sm" variant="secondary" icon={ShoppingCart} onClick={() => navigate("/sales")}>
                New Sale
              </Btn>
              <Btn size="sm" variant="secondary" icon={Plus} onClick={() => navigate("/medicines")}>
                Add Medicine
              </Btn>
              <Btn size="sm" variant="secondary" icon={PackagePlus} onClick={() => navigate("/purchases")}>
                Add Purchase
              </Btn>
              <Btn size="sm" variant="secondary" icon={UserRound} onClick={() => navigate("/customers")}>
                Add Customer
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
