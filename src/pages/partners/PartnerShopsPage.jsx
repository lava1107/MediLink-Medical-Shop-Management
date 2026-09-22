import React, { useState } from "react";
import { Plus, Eye, Pencil } from "lucide-react";
import { useApp } from "../../hooks/useApp.js";
import { useAuth } from "../../hooks/useAuth.js";
import { calculateDistance } from "../../utils/geo.js";
import { createPartnerShop, updatePartnerShop } from "../../services/partnerService.js";
import { T } from "../../utils/theme.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Btn from "../../components/common/Btn.jsx";
import IconBtn from "../../components/common/IconBtn.jsx";
import Modal from "../../components/common/Modal.jsx";
import { FormInput, FormSelect } from "../../components/common/FormControls.jsx";

export default function PartnerShopsPage() {
  const { db, setDb, toast } = useApp();
  const { user, currentBranch } = useAuth();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    owner: "",
    phone: "",
    email: "",
    address: "",
    city: "Kovilpatti",
    state: "Tamil Nadu",
    pin: "628501",
    license: "",
    status: "Active",
    lat: 9.17,
    lng: 77.87,
  });

  const [editModal, setEditModal] = useState(false);
  const [editingShop, setEditingShop] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    owner: "",
    phone: "",
    email: "",
    address: "",
    city: "Kovilpatti",
    state: "Tamil Nadu",
    pin: "628501",
    license: "",
    status: "Active",
    lat: 9.17,
    lng: 77.87,
  });

  const activeBranchName = user.role === "Admin" ? currentBranch : user.branch;
  const activeBranch = db.branches.find((b) => b.name === activeBranchName) || db.branches[0] || { lat: 9.1734, lng: 77.8713, name: "Kovilpatti Branch" };

  const rows = db.partnerShops.map((s) => ({
    ...s,
    distanceKm: calculateDistance(activeBranch.lat, activeBranch.lng, s.lat, s.lng),
  }));

  function openEdit(s) {
    setEditingShop(s);
    setEditForm({
      name: s.name || "",
      owner: s.owner || "",
      phone: s.phone || "",
      email: s.email || "",
      address: s.address || "",
      city: s.city || "Kovilpatti",
      state: s.state || "Tamil Nadu",
      pin: s.pin || "628501",
      license: s.license || "",
      status: s.status || "Active",
      lat: s.lat || 9.17,
      lng: s.lng || 77.87,
    });
    setEditModal(true);
  }

  async function handleSaveEdit() {
    if (!editForm.name || !editForm.owner || !editForm.phone || !editForm.address || !editForm.city) {
      toast("Please fill in shop name, owner, phone, address and city.", "error");
      return;
    }
    try {
      const updated = await updatePartnerShop(editingShop.id, editForm);
      setDb((d) => {
        const oldName = editingShop.name;
        const newName = updated.name || editForm.name || oldName;

        return {
          ...d,
          partnerShops: (d.partnerShops || []).map((s) =>
            s.id === editingShop.id ? { ...s, ...editForm, ...updated } : s
          ),
          partnerAvailability: (d.partnerAvailability || []).map((pa) =>
            pa.shopId === editingShop.id || (oldName && pa.shopName === oldName)
              ? { ...pa, shopName: newName, shopId: editingShop.id }
              : pa
          ),
        };
      });
      toast("Partner shop updated successfully.");
      setEditModal(false);
    } catch (err) {
      toast(err.message || "Failed to update partner shop.", "error");
    }
  }

  async function handleSave() {
    if (!form.name || !form.owner || !form.phone || !form.address || !form.city) {
      toast("Please fill in shop name, owner, phone, address and city.", "error");
      return;
    }
    try {
      const created = await createPartnerShop(form);
      setDb((d) => ({ ...d, partnerShops: [...d.partnerShops, created] }));
      toast("Partner shop registered successfully.");
      setModal(false);
      setForm({
        name: "",
        owner: "",
        phone: "",
        email: "",
        address: "",
        city: "Kovilpatti",
        state: "Tamil Nadu",
        pin: "628501",
        license: "",
        status: "Active",
        lat: 9.17,
        lng: 77.87,
      });
    } catch (err) {
      toast(err.message || "Failed to register partner shop.", "error");
    }
  }

  return (
    <div>
      <PageHeader
        title="Partner Medical Shops"
        subtitle={`Registered shops, distance shown from ${activeBranch.name}`}
        crumbs={["MediLink", "Partner Medical Shops"]}
        action={
          <Btn icon={Plus} onClick={() => setModal(true)}>
            Register Shop
          </Btn>
        }
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
        actions={(s) => (
          <div className="flex items-center gap-1">
            <IconBtn icon={Pencil} tone="blue" title="Edit Partner Shop" onClick={() => openEdit(s)} />
          </div>
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
              {(db.partnerAvailability || []).map((pa, i) => (
                <tr key={i} className="border-t" style={{ borderColor: T.borderSoft }}>
                  <td className="px-4 py-2.5 font-medium" style={{ color: T.navy }}>
                    {db.partnerShops.find((s) => s.id === pa.shopId)?.name || pa.shopName || pa.shopId}
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
              {(!db.partnerAvailability || db.partnerAvailability.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-center text-gray-500">
                    No partner availability records registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] mt-2" style={{ color: "#9AA6B2" }}>
          Availability shown is limited to shops registered on MediLink and is not a live feed from every pharmacy. Stock is never transferred automatically
          between branches or partners.
        </p>
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Register Partner Medical Shop"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setModal(false)}>
              Cancel
            </Btn>
            <Btn onClick={handleSave}>Register Shop</Btn>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Shop Name" required placeholder="e.g. Sri Lakshmi Medicals" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <FormInput label="Owner Name" required placeholder="e.g. T. Chandrasekar" value={form.owner} onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))} />
          <FormInput label="Phone Number" required placeholder="e.g. +91 94860 12093" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <FormInput label="Email Address" type="email" placeholder="e.g. srilakshmi.med@gmail.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <FormInput label="City" required placeholder="e.g. Kovilpatti" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
          <FormInput label="Drug License No." placeholder="e.g. TN-DL-22013" value={form.license} onChange={(e) => setForm((f) => ({ ...f, license: e.target.value }))} />
          <FormInput label="Latitude" required type="number" step="0.0001" value={form.lat} onChange={(e) => setForm((f) => ({ ...f, lat: Number(e.target.value) }))} />
          <FormInput label="Longitude" required type="number" step="0.0001" value={form.lng} onChange={(e) => setForm((f) => ({ ...f, lng: Number(e.target.value) }))} />
          <div className="col-span-2">
            <FormInput label="Address" required placeholder="e.g. Main Bazaar Street" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          </div>
          <FormSelect label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
            <option>Active</option>
            <option>Inactive</option>
          </FormSelect>
        </div>
      </Modal>

      <Modal
        open={editModal}
        onClose={() => setEditModal(false)}
        title={`Edit Partner Shop ${editingShop?.name ? `(${editingShop.name})` : ""}`}
        footer={
          <>
            <Btn variant="secondary" onClick={() => setEditModal(false)}>
              Cancel
            </Btn>
            <Btn onClick={handleSaveEdit}>Save Changes</Btn>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Shop Name" required placeholder="e.g. Sri Lakshmi Medicals" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
          <FormInput label="Owner Name" required placeholder="e.g. T. Chandrasekar" value={editForm.owner} onChange={(e) => setEditForm((f) => ({ ...f, owner: e.target.value }))} />
          <FormInput label="Phone Number" required placeholder="e.g. +91 94860 12093" value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} />
          <FormInput label="Email Address" type="email" placeholder="e.g. srilakshmi.med@gmail.com" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
          <FormInput label="City" required placeholder="e.g. Kovilpatti" value={editForm.city} onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))} />
          <FormInput label="Drug License No." placeholder="e.g. TN-DL-22013" value={editForm.license} onChange={(e) => setEditForm((f) => ({ ...f, license: e.target.value }))} />
          <FormInput label="Latitude" required type="number" step="0.0001" value={editForm.lat} onChange={(e) => setEditForm((f) => ({ ...f, lat: Number(e.target.value) }))} />
          <FormInput label="Longitude" required type="number" step="0.0001" value={editForm.lng} onChange={(e) => setEditForm((f) => ({ ...f, lng: Number(e.target.value) }))} />
          <div className="col-span-2">
            <FormInput label="Address" required placeholder="e.g. Main Bazaar Street" value={editForm.address} onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))} />
          </div>
          <FormSelect label="Status" value={editForm.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}>
            <option>Active</option>
            <option>Inactive</option>
          </FormSelect>
        </div>
      </Modal>
    </div>
  );
}
