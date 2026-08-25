import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Pencil } from "lucide-react";
import { useApp } from "../../hooks/useApp.js";
import { formatDate } from "../../utils/format.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import Btn from "../../components/common/Btn.jsx";
import IconBtn from "../../components/common/IconBtn.jsx";

export default function CustomersPage() {
  const { db } = useApp();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Customer Management"
        subtitle="View and manage customer records"
        crumbs={["MediLink", "Customers"]}
        action={<Btn icon={Plus}>Add Customer</Btn>}
      />
      <DataTable
        columns={[
          { key: "id", label: "Customer ID", sortable: true },
          { key: "name", label: "Name", sortable: true, render: (r) => <span className="font-semibold">{r.name}</span> },
          { key: "phone", label: "Phone" },
          { key: "email", label: "Email" },
          { key: "rxRef", label: "Prescription Ref." },
          { key: "created", label: "Created Date", render: (r) => formatDate(r.created) },
        ]}
        data={db.customers}
        searchKeys={["name", "phone", "email"]}
        onRowClick={(c) => navigate(`/customers/${c.id}`)}
        actions={(c) => (
          <>
            <IconBtn icon={Eye} tone="blue" onClick={() => navigate(`/customers/${c.id}`)} />
            <IconBtn icon={Pencil} tone="blue" />
          </>
        )}
      />
    </div>
  );
}
