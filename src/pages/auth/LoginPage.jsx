import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Pill } from "lucide-react";
import { T } from "../../utils/theme.js";
import { FormInput } from "../../components/common/FormControls.jsx";
import Btn from "../../components/common/Btn.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { USERS, MEDICINES, PARTNER_SHOPS } from "../../data/mockData.js";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  const redirectTo = location.state?.from?.pathname || "/dashboard";

  function doLogin(u) {
    login(u);
    navigate(redirectTo, { replace: true });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }
    const found = USERS.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (!found) {
      setError("No account found with that username. Try a quick-login below.");
      return;
    }
    if (found.status !== "Active") {
      setError("This account has been deactivated. Contact your administrator.");
      return;
    }
    doLogin(found);
  }

  return (
    <div className="min-h-screen flex" style={{ background: T.bg }}>
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 text-white" style={{ background: `linear-gradient(160deg, ${T.blueDark}, ${T.navy})` }}>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
            <Pill size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight">MediLink</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold leading-tight mb-4">
            Multi-branch pharmacy
            <br />
            operations, unified.
          </h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-sm">
            Manage medicines, batches, purchases, billing and cross-branch availability across Kovilpatti, Tirunelveli and Madurai — all from one
            professional console.
          </p>
          <div className="flex gap-6 mt-8">
            <div>
              <div className="text-2xl font-bold">3</div>
              <div className="text-white/60 text-xs">Branches</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{MEDICINES.length}+</div>
              <div className="text-white/60 text-xs">Medicines tracked</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{PARTNER_SHOPS.length}</div>
              <div className="text-white/60 text-xs">Partner shops</div>
            </div>
          </div>
        </div>
        <div className="text-white/40 text-xs">© 2026 MediLink Pharmacy Systems · Modern Web Technologies EL Project</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: T.blueTint }}>
              <Pill size={20} style={{ color: T.blue }} />
            </div>
            <span className="font-bold text-lg" style={{ color: T.navy }}>
              MediLink
            </span>
          </div>
          <h1 className="text-xl font-bold mb-1" style={{ color: T.navy }}>
            Sign in to your workspace
          </h1>
          <p className="text-sm mb-6" style={{ color: T.navySoft }}>
            Enter your credentials to access the dashboard.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormInput label="Username or Email" required placeholder="e.g. lavanya.admin" value={username} onChange={(e) => setUsername(e.target.value)} />
            <FormInput label="Password" required type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && (
              <div className="text-xs px-3 py-2 rounded-lg" style={{ background: T.redTint, color: T.red }}>
                {error}
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2" style={{ color: T.navySoft }}>
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me
              </label>
              <button type="button" className="font-semibold" style={{ color: T.blue }}>
                Forgot Password?
              </button>
            </div>
            <Btn type="submit" size="lg">
              Login
            </Btn>
          </form>

          <div className="mt-6 pt-5 border-t" style={{ borderColor: T.border }}>
            <p className="text-xs font-semibold mb-2.5" style={{ color: "#9AA6B2" }}>
              QUICK DEMO LOGIN
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => doLogin(USERS[0])} className="px-3 py-2.5 rounded-xl border text-xs font-semibold text-left hover:bg-slate-50" style={{ borderColor: T.border }}>
                <div style={{ color: T.navy }}>Admin</div>
                <div className="font-normal mt-0.5" style={{ color: "#9AA6B2" }}>
                  Lavanya M
                </div>
              </button>
              <button onClick={() => doLogin(USERS[1])} className="px-3 py-2.5 rounded-xl border text-xs font-semibold text-left hover:bg-slate-50" style={{ borderColor: T.border }}>
                <div style={{ color: T.navy }}>Pharmacist</div>
                <div className="font-normal mt-0.5" style={{ color: "#9AA6B2" }}>
                  R. Saravanan · Kovilpatti
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
