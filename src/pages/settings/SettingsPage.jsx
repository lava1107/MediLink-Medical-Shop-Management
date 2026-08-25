import React, { useState } from "react";
import { T } from "../../utils/theme.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useApp } from "../../hooks/useApp.js";
import { BRANCHES } from "../../data/mockData.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Btn from "../../components/common/Btn.jsx";
import { FormInput } from "../../components/common/FormControls.jsx";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useApp();
  const [tab, setTab] = useState("profile");
  const tabs =
    user.role === "Admin"
      ? [
          ["profile", "Profile"],
          ["password", "Change Password"],
          ["shop", "Shop Information"],
          ["gst", "GST Settings"],
          ["branch", "Branch Settings"],
          ["notif", "Notification Preferences"],
        ]
      : [
          ["profile", "Profile"],
          ["password", "Change Password"],
          ["notif", "Notification Preferences"],
        ];

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your profile and system preferences" crumbs={["MediLink", "Settings"]} />
      <div className="flex gap-5">
        <div className="w-48 shrink-0 flex flex-col gap-1">
          {tabs.map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className="text-left px-3.5 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: tab === k ? T.blueTint : "transparent", color: tab === k ? T.blue : T.navySoft }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex-1 bg-white rounded-2xl border p-6" style={{ borderColor: T.border }}>
          {tab === "profile" && (
            <div className="max-w-lg flex flex-col gap-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg text-white" style={{ background: T.blue }}>
                  {user.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
                <Btn variant="secondary" size="sm">
                  Change Photo
                </Btn>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="Name" defaultValue={user.name} />
                <FormInput label="Email" defaultValue={user.email} />
                <FormInput label="Phone" defaultValue={user.phone} />
                <FormInput label="Role" defaultValue={user.role} disabled />
                <FormInput label="Branch" defaultValue={user.branch} disabled />
              </div>
              <div>
                <Btn onClick={() => toast("Profile updated.")}>Save Changes</Btn>
              </div>
            </div>
          )}
          {tab === "password" && (
            <div className="max-w-sm flex flex-col gap-4">
              <FormInput label="Current Password" type="password" />
              <FormInput label="New Password" type="password" />
              <FormInput label="Confirm New Password" type="password" />
              <div>
                <Btn onClick={() => toast("Password changed successfully.")}>Update Password</Btn>
              </div>
            </div>
          )}
          {tab === "shop" && (
            <div className="max-w-lg grid grid-cols-2 gap-4">
              <FormInput label="Shop Name" defaultValue="MediLink Pharmacy Systems" />
              <FormInput label="Registration No." defaultValue="MED-REG-2024-1103" />
              <FormInput label="Support Email" defaultValue="support@medilink.in" />
              <FormInput label="Support Phone" defaultValue="+91 90031 22110" />
              <div className="col-span-2">
                <Btn onClick={() => toast("Shop information saved.")}>Save</Btn>
              </div>
            </div>
          )}
          {tab === "gst" && (
            <div className="max-w-lg grid grid-cols-2 gap-4">
              <FormInput label="Default GST (%)" type="number" defaultValue={12} />
              <FormInput label="Company GSTIN" defaultValue="33AACML1029F1Z8" />
              <div className="col-span-2">
                <Btn onClick={() => toast("GST settings saved.")}>Save</Btn>
              </div>
            </div>
          )}
          {tab === "branch" && (
            <div className="flex flex-col gap-3 max-w-lg">
              {BRANCHES.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: T.border }}>
                  <span className="text-sm font-medium" style={{ color: T.navy }}>
                    {b.name}
                  </span>
                  <StatusBadge status={b.status} />
                </div>
              ))}
            </div>
          )}
          {tab === "notif" && (
            <div className="flex flex-col gap-3 max-w-md">
              {["Low stock alerts", "Near expiry alerts", "New purchase confirmations", "Reservation updates"].map((n) => (
                <label key={n} className="flex items-center justify-between p-3 rounded-xl border text-sm" style={{ borderColor: T.border, color: T.navy }}>
                  {n}
                  <input type="checkbox" defaultChecked />
                </label>
              ))}
              <div>
                <Btn onClick={() => toast("Notification preferences saved.")}>Save Preferences</Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
