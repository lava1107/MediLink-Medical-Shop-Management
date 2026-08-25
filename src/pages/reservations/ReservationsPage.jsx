import React, { useState } from "react";
import { Plus, Check, X, PackageCheck } from "lucide-react";
import { useApp } from "../../hooks/useApp.js";
import { useAuth } from "../../hooks/useAuth.js";
import { BRANCHES, MEDICINES, CUSTOMERS } from "../../data/mockData.js";
import { confirmReservation, markCollected, cancelReservation, createReservation } from "../../services/reservationService.js";
import { formatDate, addDays } from "../../utils/format.js";
import { TODAY } from "../../data/mockData.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Btn from "../../components/common/Btn.jsx";
import IconBtn from "../../components/common/IconBtn.jsx";
import Modal from "../../components/common/Modal.jsx";
import { FormInput, FormSelect } from "../../components/common/FormControls.jsx";

export default function ReservationsPage() {
  const { db, setDb, toast } = useApp();
  const { user } = useAuth();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    customer: "",
    medicine: "",
    branch: user.role === "Admin" ? BRANCHES[0].name : user.branch,
    quantity: 1,
    expiry: addDays(TODAY, 3),
  });

  async function updateStatus(r, action) {
    let updated;
    if (action === "confirm") updated = await confirmReservation(db.reservations, r.id);
    if (action === "collect") updated = await markCollected(db.reservations, r.id);
    if (action === "cancel") updated = await cancelReservation(db.reservations, r.id);
    setDb((d) => ({ ...d, reservations: updated }));
    toast(`Reservation ${action === "confirm" ? "confirmed" : action === "collect" ? "marked as collected" : "cancelled"}.`);
  }

  async function handleCreate() {
    if (!form.customer || !form.medicine || !form.quantity) {
      toast("Fill customer, medicine and quantity.", "error");
      return;
    }
    const updated = await createReservation(db.reservations, { ...form, createdBy: user.name });
    setDb((d) => ({ ...d, reservations: updated }));
    toast("Reservation created. This does not create a sale until the customer collects it.");
    setModal(false);
  }

  return (
    <div>
      <PageHeader
        title="Medicine Reservations"
        subtitle="Reserve medicines for customers ahead of pickup"
        crumbs={["MediLink", "Reservations"]}
        action={
          <Btn icon={Plus} onClick={() => setModal(true)}>
            New Reservation
          </Btn>
        }
      />
      <DataTable
        columns={[
          { key: "id", label: "Reservation ID", sortable: true },
          { key: "customer", label: "Customer" },
          { key: "medicine", label: "Medicine" },
          { key: "branch", label: "Branch" },
          { key: "quantity", label: "Qty" },
          { key: "resDate", label: "Reserved On", render: (r) => formatDate(r.resDate) },
          { key: "expiry", label: "Expires On", render: (r) => formatDate(r.expiry) },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
        ]}
        data={db.reservations}
        searchKeys={["customer", "medicine"]}
        filters={[{ key: "status", label: "Status", options: ["Pending", "Reserved", "Collected", "Cancelled", "Expired"] }]}
        actions={(r) =>
          r.status === "Pending" || r.status === "Reserved" ? (
            <>
              {r.status === "Pending" && <IconBtn icon={Check} tone="green" title="Confirm" onClick={() => updateStatus(r, "confirm")} />}
              {r.status === "Reserved" && <IconBtn icon={PackageCheck} tone="green" title="Mark as Collected" onClick={() => updateStatus(r, "collect")} />}
              <IconBtn icon={X} tone="red" title="Cancel" onClick={() => updateStatus(r, "cancel")} />
            </>
          ) : (
            <span className="text-[11px]" style={{ color: "#C9D2DA" }}>
              —
            </span>
          )
        }
      />
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="New Reservation"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setModal(false)}>
              Cancel
            </Btn>
            <Btn onClick={handleCreate}>Create Reservation</Btn>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <FormSelect label="Customer" required value={form.customer} onChange={(e) => setForm((f) => ({ ...f, customer: e.target.value }))}>
            <option value="">Select customer</option>
            {CUSTOMERS.map((c) => (
              <option key={c.id}>{c.name}</option>
            ))}
          </FormSelect>
          <FormSelect label="Medicine" required value={form.medicine} onChange={(e) => setForm((f) => ({ ...f, medicine: e.target.value }))}>
            <option value="">Select medicine</option>
            {MEDICINES.map((m) => (
              <option key={m.id}>{m.name}</option>
            ))}
          </FormSelect>
          <FormSelect label="Branch" required value={form.branch} onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))} disabled={user.role !== "Admin"}>
            {BRANCHES.map((b) => (
              <option key={b.id}>{b.name}</option>
            ))}
          </FormSelect>
          <FormInput label="Quantity" required type="number" min="1" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} />
          <FormInput label="Reservation Expiry" required type="date" value={form.expiry} onChange={(e) => setForm((f) => ({ ...f, expiry: e.target.value }))} />
        </div>
      </Modal>
    </div>
  );
}
