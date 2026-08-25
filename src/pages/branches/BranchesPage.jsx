import React from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Users, Clock } from "lucide-react";
import { T } from "../../utils/theme.js";
import { useApp } from "../../hooks/useApp.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";

export default function BranchesPage() {
  const { db } = useApp();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title="Branch Management" subtitle="Manage all pharmacy branch locations" crumbs={["MediLink", "Branches"]} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {db.branches.map((b) => (
          <div
            key={b.id}
            onClick={() => navigate(`/branches/${b.id}`)}
            className="bg-white rounded-2xl border p-5 cursor-pointer hover:shadow-md transition-shadow"
            style={{ borderColor: T.border }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: T.blueTint }}>
                <Building2 size={20} style={{ color: T.blue }} />
              </div>
              <StatusBadge status={b.status} />
            </div>
            <h3 className="font-bold text-sm mb-1" style={{ color: T.navy }}>
              {b.name}{" "}
              {b.isHQ && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded ml-1" style={{ background: T.blueTint, color: T.blue }}>
                  HQ
                </span>
              )}
            </h3>
            <p className="text-xs mb-4" style={{ color: "#9AA6B2" }}>
              {b.address}, {b.city}
            </p>
            <div className="flex items-center gap-4 text-xs pt-3 border-t" style={{ borderColor: T.borderSoft }}>
              <span className="flex items-center gap-1" style={{ color: T.navySoft }}>
                <Users size={12} /> {b.staff} staff
              </span>
              <span className="flex items-center gap-1" style={{ color: T.navySoft }}>
                <Clock size={12} /> {b.opening}–{b.closing}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
