import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Pencil } from "lucide-react";
import { useApp } from "../../hooks/useApp.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Btn from "../../components/common/Btn.jsx";
import IconBtn from "../../components/common/IconBtn.jsx";

export default function SuppliersPage() {
  const { db } = useApp();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Supplier Management"
        subtitle="Manage medicine suppliers and distributors"
        crumbs={["MediLink", "Suppliers"]}
        action={<Btn icon={Plus}>Add Supplier</Btn>}
      />
      <DataTable
        columns={[
          { key: "id", label: "Supplier ID", sortable: true },
          { key: "name", label: "Supplier Name", sortable: true, render: (r) => <span className="font-semibold">{r.name}</span> },
          { key: "contact", label: "Contact Person" },
          { key: "phone", label: "Phone" },
          { key: "city", label: "City" },
          { key: "gst", label: "GST Number" },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
        ]}
        data={db.suppliers}
        searchKeys={["name", "company", "contact", "gst"]}
        filters={[{ key: "status", label: "Status", options: ["Active", "Inactive"] }]}
        onRowClick={(s) => navigate(`/suppliers/${s.id}`)}
        actions={(s) => (
          <>
            <IconBtn icon={Eye} tone="blue" onClick={() => navigate(`/suppliers/${s.id}`)} />
            <IconBtn icon={Pencil} tone="blue" />
          </>
        )}
      />
    </div>
  );
}
