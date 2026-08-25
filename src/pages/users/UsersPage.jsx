import React, { useState } from "react";
import { Plus, Pencil, Trash2, XCircle, CheckCircle2 } from "lucide-react";
import { pad } from "../../utils/format.js";
import { BRANCHES } from "../../data/mockData.js";
import { useApp } from "../../hooks/useApp.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Btn from "../../components/common/Btn.jsx";
import IconBtn from "../../components/common/IconBtn.jsx";
import Modal, { ConfirmDialog } from "../../components/common/Modal.jsx";
import { FormInput, FormSelect } from "../../components/common/FormControls.jsx";
import { T } from "../../utils/theme.js";

export default function UsersPage() {
  const { db, setDb, toast } = useApp();
  const [modal, setModal] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [form, setForm] = useState({});

  function openAdd() {
    setForm({ name: "", username: "", email: "", phone: "", password: "", role: "Pharmacist", branch: BRANCHES[0].name, status: "Active" });
    setModal({ mode: "add" });
  }
  function openEdit(u) {
    setForm({ ...u });
    setModal({ mode: "edit", id: u.id });
  }
  function save() {
    if (!form.name || !form.username || !form.email) {
      toast("Please fill all required fields.", "error");
      return;
    }
    if (modal.mode === "add") {
      const id = `USR-${pad(db.users.length + 1)}`;
      setDb((d) => ({ ...d, users: [...d.users, { ...form, id, created: "2026-08-20", lastLogin: "—" }] }));
      toast("User created successfully.");
    } else {
      setDb((d) => ({ ...d, users: d.users.map((u) => (u.id === modal.id ? { ...u, ...form } : u)) }));
      toast("User updated successfully.");
    }
    setModal(null);
  }
  function toggleStatus(u) {
    setDb((d) => ({ ...d, users: d.users.map((x) => (x.id === u.id ? { ...x, status: x.status === "Active" ? "Inactive" : "Active" } : x)) }));
    toast(`${u.name} ${u.status === "Active" ? "deactivated" : "activated"}.`);
  }
  function remove(u) {
    setDb((d) => ({ ...d, users: d.users.filter((x) => x.id !== u.id) }));
    toast("User deleted.");
  }

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Manage staff accounts and role-based access"
        crumbs={["MediLink", "Users"]}
        action={
          <Btn icon={Plus} onClick={openAdd}>
            Add User
          </Btn>
        }
      />
      <DataTable
        columns={[
          { key: "id", label: "User ID", sortable: true },
          { key: "name", label: "Name", sortable: true },
          { key: "username", label: "Username" },
          { key: "email", label: "Email" },
          { key: "role", label: "Role", render: (r) => <span className="font-semibold" style={{ color: r.role === "Admin" ? T.blue : T.navySoft }}>{r.role}</span> },
          { key: "branch", label: "Branch" },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
          { key: "lastLogin", label: "Last Login" },
        ]}
        data={db.users}
        searchKeys={["name", "username", "email"]}
        filters={[
          { key: "role", label: "Role", options: ["Admin", "Pharmacist"] },
          { key: "status", label: "Status", options: ["Active", "Inactive"] },
        ]}
        actions={(u) => (
          <>
            <IconBtn icon={Pencil} tone="blue" title="Edit" onClick={() => openEdit(u)} />
            <IconBtn icon={u.status === "Active" ? XCircle : CheckCircle2} tone={u.status === "Active" ? "red" : "green"} title={u.status === "Active" ? "Deactivate" : "Activate"} onClick={() => toggleStatus(u)} />
            <IconBtn icon={Trash2} tone="red" title="Delete" onClick={() => setConfirmDel(u)} />
          </>
        )}
      />
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === "add" ? "Add New User" : "Edit User"}
        footer={
          <>
            <Btn variant="secondary" onClick={() => setModal(null)}>
              Cancel
            </Btn>
            <Btn onClick={save}>Save User</Btn>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Full Name" required value={form.name || ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <FormInput label="Username" required value={form.username || ""} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
          <FormInput label="Email" required type="email" value={form.email || ""} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <FormInput label="Phone" value={form.phone || ""} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <FormInput
            label="Password"
            type="password"
            placeholder={modal?.mode === "edit" ? "Leave blank to keep unchanged" : ""}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
          <FormSelect label="Role" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
            <option>Admin</option>
            <option>Pharmacist</option>
          </FormSelect>
          <FormSelect label="Branch" value={form.branch} onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))}>
            {BRANCHES.map((b) => (
              <option key={b.id}>{b.name}</option>
            ))}
          </FormSelect>
          <FormSelect label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
            <option>Active</option>
            <option>Inactive</option>
          </FormSelect>
        </div>
      </Modal>
      <ConfirmDialog
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        onConfirm={() => remove(confirmDel)}
        danger
        title="Delete user?"
        message={`This will permanently remove ${confirmDel?.name} from the system.`}
      />
    </div>
  );
}
