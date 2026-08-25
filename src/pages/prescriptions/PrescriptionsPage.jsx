import React, { useState } from "react";
import { Eye, Check, X } from "lucide-react";
import { useApp } from "../../hooks/useApp.js";
import { useAuth } from "../../hooks/useAuth.js";
import { verifyPrescription, rejectPrescription } from "../../services/prescriptionService.js";
import { formatDate } from "../../utils/format.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import PrescriptionStatusBadge from "../../components/common/PrescriptionStatusBadge.jsx";
import IconBtn from "../../components/common/IconBtn.jsx";
import PrescriptionVerificationModal from "../../components/prescriptions/PrescriptionVerificationModal.jsx";

export default function PrescriptionsPage() {
  const { db, setDb, toast } = useApp();
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);

  async function handleVerify(id, remarks) {
    const updated = await verifyPrescription(db.prescriptions, id, user.name, remarks);
    setDb((d) => ({ ...d, prescriptions: updated }));
    toast("Prescription verified. Billing is now allowed for this medicine.");
    setSelected(null);
  }

  async function handleReject(id, remarks) {
    const updated = await rejectPrescription(db.prescriptions, id, user.name, remarks);
    setDb((d) => ({ ...d, prescriptions: updated }));
    toast("Prescription rejected. Billing remains blocked for this medicine.", "error");
    setSelected(null);
  }

  return (
    <div>
      <PageHeader
        title="Prescription Verification"
        subtitle="Verify or reject prescriptions before Rx-required medicines can be billed"
        crumbs={["MediLink", "Prescriptions"]}
      />
      <DataTable
        columns={[
          { key: "id", label: "Prescription ID", sortable: true },
          { key: "customerName", label: "Customer", sortable: true },
          { key: "medicine", label: "Medicine" },
          { key: "doctorName", label: "Doctor" },
          { key: "prescriptionDate", label: "Date", sortable: true, render: (r) => formatDate(r.prescriptionDate) },
          { key: "status", label: "Status", render: (r) => <PrescriptionStatusBadge status={r.status} compact /> },
          { key: "verifiedBy", label: "Verified By", render: (r) => r.verifiedBy || "—" },
          { key: "verifiedDate", label: "Verified Date", render: (r) => (r.verifiedDate ? formatDate(r.verifiedDate) : "—") },
        ]}
        data={db.prescriptions}
        searchKeys={["customerName", "medicine", "doctorName", "prescriptionRef"]}
        filters={[{ key: "status", label: "Status", options: ["Pending", "Verified", "Rejected", "Expired"] }]}
        actions={(r) => (
          <>
            <IconBtn icon={Eye} tone="blue" title="View" onClick={() => setSelected(r)} />
            {r.status === "Pending" && (
              <>
                <IconBtn icon={Check} tone="green" title="Verify" onClick={() => setSelected(r)} />
                <IconBtn icon={X} tone="red" title="Reject" onClick={() => setSelected(r)} />
              </>
            )}
          </>
        )}
      />
      <PrescriptionVerificationModal
        open={!!selected}
        onClose={() => setSelected(null)}
        prescription={selected}
        onVerify={handleVerify}
        onReject={handleReject}
      />
    </div>
  );
}
