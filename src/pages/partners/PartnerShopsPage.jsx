import React from "react";
import { Plus, Eye, Pencil } from "lucide-react";
import { useApp } from "../../hooks/useApp.js";
import { useAuth } from "../../hooks/useAuth.js";
import { PARTNER_AVAILABILITY, PARTNER_SHOPS, BRANCHES } from "../../data/mockData.js";
import { calculateDistance } from "../../utils/geo.js";
import { T } from "../../utils/theme.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Btn from "../../components/common/Btn.jsx";
import IconBtn from "../../components/common/IconBtn.jsx";

export default function PartnerShopsPage() {
  const { db } = useApp();
  const { user, currentBranch } = useAuth();
  const activeBranchName = user.role === "Admin" ? currentBranch : user.branch;
  const activeBranch = db.branches.find((b) => b.name === activeBranchName) || BRANCHES[0];

  const rows = db.partnerShops.map((s) => ({
    ...s,
    distanceKm: calculateDistance(activeBranch.lat, activeBranch.lng, s.lat, s.lng),
  }));

  return (
    <div>
      <PageHeader
        title="Partner Medical Shops"
        subtitle={`Registered shops, distance shown from ${activeBranch.name}`}
        crumbs={["MediLink", "Partner Medical Shops"]}
        action={<Btn icon={Plus}>Register Shop</Btn>}
      />
      <DataTable
        columns={[
          { key: "id", label: "Shop ID", sortable: true },
          { key: "name", label: "Shop Name", sortable: true, render: (r) => <span className="font-semibold">{r.name}</span> },
          { key: "owner", label: "Owner" },
          { key: "phone", label: "Phone" },
          { key: "city", label: "City" },
          { key: "license", label: "License No." },
          { key: "distanceKm", label: "Distance", sortable: true, render: (r) => `${r.distanceKm} km` },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
        ]}
        data={rows}
        searchKeys={["name", "owner", "city"]}
        actions={() => (
          <>
            <IconBtn icon={Eye} tone="blue" />
            <IconBtn icon={Pencil} tone="blue" />
          </>
        )}
      />
      <div className="mt-6">
        <h3 className="font-bold text-sm mb-3" style={{ color: T.navy }}>
          Partner Medicine Availability (Registered Data)
        </h3>
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: T.border }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: T.blueTint2 }}>
                {["Shop", "Medicine", "Available Qty", "Last Updated"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 font-semibold" style={{ color: T.navySoft }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PARTNER_AVAILABILITY.map((pa, i) => (
                <tr key={i} className="border-t" style={{ borderColor: T.borderSoft }}>
                  <td className="px-4 py-2.5 font-medium" style={{ color: T.navy }}>
                    {PARTNER_SHOPS.find((s) => s.id === pa.shopId)?.name}
                  </td>
                  <td className="px-4 py-2.5" style={{ color: T.navySoft }}>
                    {pa.medicineName}
                  </td>
                  <td className="px-4 py-2.5" style={{ color: T.navySoft }}>
                    {pa.quantity}
                  </td>
                  <td className="px-4 py-2.5" style={{ color: T.navySoft }}>
                    {pa.lastUpdated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] mt-2" style={{ color: "#9AA6B2" }}>
          Availability shown is limited to shops registered on MediLink and is not a live feed from every pharmacy. Stock is never transferred automatically
          between branches or partners.
        </p>
      </div>
    </div>
  );
}
