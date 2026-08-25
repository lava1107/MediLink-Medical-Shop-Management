import React from "react";
import { useApp } from "../../hooks/useApp.js";
import { BRANCHES } from "../../data/mockData.js";
import { formatCurrency, formatDate } from "../../utils/format.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";

export default function BatchesPage() {
  const { db } = useApp();
  return (
    <div>
      <PageHeader title="Medicine Batch Management" subtitle="Track batch-level stock, rack location and expiry" crumbs={["MediLink", "Medicine Batches"]} />
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
          { key: "branchName", label: "Branch", options: BRANCHES.map((b) => b.name) },
          { key: "status", label: "Expiry Status", options: ["Safe", "Expiring Soon", "Expired"] },
        ]}
        pageSize={10}
      />
    </div>
  );
}
