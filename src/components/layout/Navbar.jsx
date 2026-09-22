import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, Building, Bell, ChevronDown, ChevronRight, Settings } from "lucide-react";
import { T } from "../../utils/theme.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useApp } from "../../hooks/useApp.js";
import { BRANCHES } from "../../data/mockData.js";

const PAGE_TITLES = {
  dashboard: "Dashboard",
  users: "Users",
  branches: "Branches",
  medicines: "Medicines",
  categories: "Categories",
  batches: "Medicine Batches",
  suppliers: "Suppliers",
  purchases: "Purchases",
  sales: "Sales & Billing",
  prescriptions: "Prescriptions",
  customers: "Customers",
  reservations: "Reservations",
  availability: "Medicine Availability",
  partners: "Partner Medical Shops",
  reports: "Reports",
  notifications: "Notifications",
  settings: "Settings",
};

export default function Navbar({ toggleSidebar }) {
  const { user, currentBranch, setCurrentBranch } = useAuth();
  const { db, notifications, markAllRead } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const segment = location.pathname.split("/").filter(Boolean)[0] || "dashboard";
  const pageTitle = PAGE_TITLES[segment] || "MediLink";
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-16 sticky top-0 z-30 bg-white border-b flex items-center px-5 gap-4" style={{ borderColor: T.border }}>
      <button onClick={toggleSidebar} className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100">
        <Menu size={16} />
      </button>
      <div className="flex items-center gap-1.5 text-xs" style={{ color: "#9AA6B2" }}>
        <span>MediLink</span>
        <ChevronRight size={12} />
        <span className="font-semibold" style={{ color: T.navy }}>
          {pageTitle}
        </span>
      </div>

      <div className="relative flex-1 max-w-sm ml-4 hidden md:block">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9AA6B2" }} />
        <input
          placeholder="Search medicines, customers, bills..."
          className="w-full pl-9 pr-3 py-2 rounded-xl border text-xs outline-none focus:border-blue-400"
          style={{ borderColor: T.border, background: T.bg }}
        />
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        {user.role === "Admin" && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: T.blueTint, color: T.blue }}>
            <Building size={13} />
            <select value={currentBranch} onChange={(e) => setCurrentBranch(e.target.value)} className="bg-transparent outline-none font-semibold" style={{ color: T.blue }}>
              {(db?.branches || BRANCHES).map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {user.role === "Pharmacist" && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: T.blueTint, color: T.blue }}>
            <Building size={13} /> {user.branch}
          </div>
        )}

        <div className="relative">
          <button
            onClick={() => {
              setShowNotif((v) => !v);
              setShowProfile(false);
            }}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100"
          >
            <Bell size={17} style={{ color: T.navySoft }} />
            {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: T.red }} />}
          </button>
          {showNotif && (
            <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl border shadow-xl z-40 overflow-hidden" style={{ borderColor: T.border }}>
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: T.border }}>
                <span className="font-semibold text-sm" style={{ color: T.navy }}>
                  Notifications
                </span>
                <button onClick={markAllRead} className="text-xs font-semibold" style={{ color: T.blue }}>
                  Mark all read
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.slice(0, 6).map((n) => (
                  <div key={n.id} className="px-4 py-3 border-b flex gap-2.5" style={{ borderColor: T.borderSoft, background: n.read ? "#fff" : T.blueTint2 }}>
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: n.read ? "#D1D9E0" : T.blue }} />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate" style={{ color: T.navy }}>
                        {n.title}
                      </div>
                      <div className="text-[11px] mt-0.5" style={{ color: "#9AA6B2" }}>
                        {n.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  navigate("/notifications");
                  setShowNotif(false);
                }}
                className="w-full py-2.5 text-xs font-semibold hover:bg-slate-50"
                style={{ color: T.blue }}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowProfile((v) => !v);
              setShowNotif(false);
            }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] text-white" style={{ background: T.blue }}>
              {user.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </div>
            <ChevronDown size={14} style={{ color: T.navySoft }} />
          </button>
          {showProfile && (
            <div className="absolute right-0 top-11 w-52 bg-white rounded-2xl border shadow-xl z-40 overflow-hidden py-1.5" style={{ borderColor: T.border }}>
              <div className="px-4 py-2.5 border-b" style={{ borderColor: T.border }}>
                <div className="text-xs font-semibold" style={{ color: T.navy }}>
                  {user.name}
                </div>
                <div className="text-[11px]" style={{ color: "#9AA6B2" }}>
                  {user.email}
                </div>
              </div>
              <button
                onClick={() => {
                  navigate("/settings");
                  setShowProfile(false);
                }}
                className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 flex items-center gap-2"
                style={{ color: T.navySoft }}
              >
                <Settings size={13} /> Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
