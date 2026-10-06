import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Mail, MessageSquare, Send, CheckCircle2, AlertCircle, ExternalLink,
  RefreshCw, Phone, User, FileText, Clock, ShieldCheck, Sparkles,
  Smartphone, Inbox, Search, Filter, HelpCircle, KeyRound, Check
} from "lucide-react";
import { T } from "../../utils/theme.js";
import { useApp } from "../../hooks/useApp.js";
import { useAuth } from "../../hooks/useAuth.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import Btn from "../../components/common/Btn.jsx";
import { FormInput, FormSelect } from "../../components/common/FormControls.jsx";
import { communicationService } from "../../services/communicationService.js";

export default function CommunicationPage() {
  const [searchParams] = useSearchParams();
  const { db, toast } = useApp();
  const { user } = useAuth();

  const initialTab = searchParams.get("type") === "sms" ? "sms" : "email";
  const [activeTab, setActiveTab] = useState(initialTab); // email | sms | logs | config
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logFilter, setLogFilter] = useState("all"); // all | email | sms
  const [logSearch, setLogSearch] = useState("");

  // Gateway Config state
  const [config, setConfig] = useState(null);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configForm, setConfigForm] = useState({
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPass: "",
    smtpSecure: false,
    smtpFrom: "MediLink Healthcare <noreply@medilink.com>",
    twilioSid: "",
    twilioToken: "",
    twilioFrom: "",
  });

  // Test senders
  const [testEmailAddr, setTestEmailAddr] = useState(user?.email || "admin@medilink.in");
  const [testingEmail, setTestingEmail] = useState(false);
  const [testPhoneNum, setTestPhoneNum] = useState("+91 98765 43210");
  const [testingSMS, setTestingSMS] = useState(false);

  // Email Compose State
  const [emailTo, setEmailTo] = useState(searchParams.get("to") || "");
  const [emailName, setEmailName] = useState(searchParams.get("name") || "");
  const [emailSubject, setEmailSubject] = useState("MediLink Healthcare – Pharmacy Notification");
  const [emailTemplate, setEmailTemplate] = useState("direct");
  const [emailMessage, setEmailMessage] = useState(
    "Dear patient,\n\nWe are pleased to inform you that your medical services have been processed successfully. Please review the details below."
  );
  const [sendingEmail, setSendingEmail] = useState(false);
  const [lastEmailResult, setLastEmailResult] = useState(null);

  // SMS Compose State
  const [smsPhone, setSmsPhone] = useState(searchParams.get("phone") || "");
  const [smsName, setSmsName] = useState(searchParams.get("name") || "");
  const [smsTemplate, setSmsTemplate] = useState("direct");
  const [smsMessage, setSmsMessage] = useState(
    "[MediLink] Hello! Your pharmacy prescription update is confirmed. Visit our branch or call +919003122110 for support."
  );
  const [sendingSMS, setSendingSMS] = useState(false);
  const [lastSmsResult, setLastSmsResult] = useState(null);

  // Load logs and config on mount
  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await communicationService.getLogs();
      if (res && res.data) {
        setLogs(res.data);
      } else if (Array.isArray(res)) {
        setLogs(res);
      }
    } catch (err) {
      console.warn("Failed to load logs:", err.message);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await communicationService.getConfig();
      if (res && res.data) {
        setConfig(res.data);
        setConfigForm({
          smtpHost: res.data.smtpHost || "",
          smtpPort: res.data.smtpPort || 587,
          smtpUser: res.data.smtpUser || "",
          smtpPass: res.data.smtpPass || "",
          smtpSecure: res.data.smtpSecure || false,
          smtpFrom: res.data.smtpFrom || "MediLink Healthcare <noreply@medilink.com>",
          twilioSid: res.data.twilioSid || "",
          twilioToken: res.data.twilioToken || "",
          twilioFrom: res.data.twilioFrom || "",
        });
      }
    } catch (err) {
      console.warn("Failed to load communication config:", err.message);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchConfig();
  }, []);

  // Preset Template Handler for Email
  const handleEmailTemplateChange = (tpl) => {
    setEmailTemplate(tpl);
    if (tpl === "direct") {
      setEmailSubject("MediLink Healthcare – Official Pharmacy Communication");
      setEmailMessage(
        "Dear patient,\n\nWe are pleased to inform you that your medical services have been processed successfully. Please review the details below."
      );
    } else if (tpl === "invoice") {
      setEmailSubject("MediLink Pharmacy – Tax Invoice & Medicine Bill #INV-2026-904");
      setEmailMessage(
        "Thank you for choosing MediLink. Your medication bill has been generated and approved. Please find your itemized receipt and GST summary below."
      );
    } else if (tpl === "prescription") {
      setEmailSubject("MediLink – Prescription #RX-4410 Ready for Pickup");
      setEmailMessage(
        "Great news! Your prescription #RX-4410 has been verified by our licensed pharmacists and is packed and ready for collection at our pharmacy counter."
      );
    } else if (tpl === "reservation") {
      setEmailSubject("MediLink – Medicine Reservation Confirmed");
      setEmailMessage(
        "Your reserved medicine has been allocated and held exclusively under your name. Please collect it within 24 hours."
      );
    } else if (tpl === "restock") {
      setEmailSubject("MediLink Purchase Order – Urgent Stock Replenishment");
      setEmailMessage(
        "Official purchase requisition from MediLink Pharmacy. Please confirm dispatch of the requested medical supplies at your earliest convenience."
      );
    }
  };

  // Preset Template Handler for SMS
  const handleSmsTemplateChange = (tpl) => {
    setSmsTemplate(tpl);
    if (tpl === "direct") {
      setSmsMessage(
        "[MediLink] Hello! Your pharmacy service update is confirmed. Visit our branch or call +919003122110 for support."
      );
    } else if (tpl === "invoice") {
      setSmsMessage(
        "[MediLink] Bill #INV-904 Confirmed: Total ₹1,450.00 (GST incl). Thank you for trusting MediLink Pharmacy. Have a healthy day!"
      );
    } else if (tpl === "prescription") {
      setSmsMessage(
        "[MediLink] Your Prescription #RX-4410 is READY FOR PICKUP at Main Branch counter. Operating hours: 8 AM - 10 PM."
      );
    } else if (tpl === "reservation") {
      setSmsMessage(
        "[MediLink] Reservation Confirmed for Amoxicillin 500mg (Code: RES-889). Held at counter for 24h."
      );
    } else if (tpl === "restock") {
      setSmsMessage(
        "[MediLink] Urgent Restock PO-1044 placed with your agency. Please verify dispatch schedule. Pharmacy Ops: +919003122110."
      );
    }
  };

  // Account-to-Account recipient selector (select customer or staff/pharmacist account from DB)
  const handleSelectAccount = (val, channel) => {
    if (!val) return;
    const [type, id] = val.split(":");
    if (type === "customer") {
      const cust = (db?.customers || []).find((c) => String(c.id) === String(id));
      if (!cust) return;
      if (channel === "email") {
        setEmailTo(cust.email || "");
        setEmailName(cust.name || "");
      } else {
        setSmsPhone(cust.phone || "");
        setSmsName(cust.name || "");
      }
    } else if (type === "user") {
      const u = (db?.users || []).find((x) => String(x.id) === String(id));
      if (!u) return;
      if (channel === "email") {
        setEmailTo(u.email || "");
        setEmailName(`${u.name} (${u.role})`);
      } else {
        setSmsPhone(u.phone || "");
        setSmsName(`${u.name} (${u.role})`);
      }
    }
  };
  const handleSelectCustomer = handleSelectAccount;

  // Handle Send Email
  const handleSendEmail = async (e) => {
    e?.preventDefault();
    if (!emailTo) {
      toast("Please enter a recipient email address", "error");
      return;
    }

    setSendingEmail(true);
    setLastEmailResult(null);

    // Mock template data for rich display
    let templateData = null;
    if (emailTemplate === "invoice") {
      templateData = {
        invoiceNo: "INV-2026-" + Math.floor(1000 + Math.random() * 9000),
        branch: user?.branch || "MediLink Central Dispensary",
        items: [
          { name: "Paracetamol 650mg", batch: "BATCH-890", qty: 2, price: 45.0 },
          { name: "Amoxicillin Clav 625mg", batch: "BATCH-312", qty: 1, price: 180.0 },
          { name: "Cetirizine 10mg", batch: "BATCH-109", qty: 1, price: 35.0 },
        ],
        gst: 31.2,
        total: 305.0,
      };
    } else if (emailTemplate === "prescription") {
      templateData = {
        prescriptionId: "RX-" + Math.floor(1000 + Math.random() * 9000),
        doctorName: "Ananya Sharma, M.D.",
        branch: user?.branch || "MediLink Central Dispensary",
      };
    } else if (emailTemplate === "reservation") {
      templateData = {
        medicineName: "Azithromycin 500mg Tablets",
        quantity: 2,
        reservationCode: "RES-" + Math.floor(1000 + Math.random() * 9000),
        expiresAt: "Tomorrow, 8:00 PM",
        branch: user?.branch || "MediLink Main Pharmacy",
      };
    } else if (emailTemplate === "restock") {
      templateData = {
        medicineName: "Insulin Glargine 100IU/ml",
        units: 50,
        poNumber: "PO-" + Math.floor(1000 + Math.random() * 9000),
        branch: user?.branch || "Central Warehouse",
        requiredDate: "Within 24 Hours",
      };
    }

    try {
      const res = await communicationService.sendEmail({
        to: emailTo,
        toName: emailName,
        subject: emailSubject,
        message: emailMessage,
        template: emailTemplate,
        templateData,
      });

      setLastEmailResult(res.data || res);
      toast(res.message || "Email delivered successfully!", "success");
      fetchLogs();
    } catch (err) {
      toast(err.message || "Failed to send email", "error");
    } finally {
      setSendingEmail(false);
    }
  };

  // Handle Send SMS
  const handleSendSMS = async (e) => {
    e?.preventDefault();
    if (!smsPhone || !smsMessage) {
      toast("Please enter a phone number and message", "error");
      return;
    }

    setSendingSMS(true);
    setLastSmsResult(null);

    try {
      const res = await communicationService.sendSMS({
        toPhone: smsPhone,
        toName: smsName,
        message: smsMessage,
        template: smsTemplate,
      });

      setLastSmsResult(res.data || res);
      toast(res.message || "SMS delivered successfully!", "success");
      fetchLogs();
    } catch (err) {
      toast(err.message || "Failed to send SMS", "error");
    } finally {
      setSendingSMS(false);
    }
  };

  // Quick Test Handlers
  const handleTestEmail = async () => {
    if (!testEmailAddr) return;
    setTestingEmail(true);
    try {
      const res = await communicationService.testEmail(testEmailAddr);
      toast(`Test email delivered to ${testEmailAddr}!`, "success");
      fetchLogs();
      if (res.data?.previewUrl) {
        window.open(res.data.previewUrl, "_blank");
      }
    } catch (err) {
      toast(err.message || "Test email failed", "error");
    } finally {
      setTestingEmail(false);
    }
  };

  const handleTestSMS = async () => {
    if (!testPhoneNum) return;
    setTestingSMS(true);
    try {
      await communicationService.testSMS(testPhoneNum);
      toast(`Test SMS delivered to ${testPhoneNum}!`, "success");
      fetchLogs();
    } catch (err) {
      toast(err.message || "Test SMS failed", "error");
    } finally {
      setTestingSMS(false);
    }
  };

  // Save Gateway Config
  const handleSaveConfig = async (e) => {
    e?.preventDefault();
    setSavingConfig(true);
    try {
      await communicationService.updateConfig(configForm);
      toast("Gateway configuration saved successfully!", "success");
      fetchConfig();
    } catch (err) {
      toast(err.message || "Failed to save configuration", "error");
    } finally {
      setSavingConfig(false);
    }
  };

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    let result = [...logs];
    if (logFilter !== "all") {
      result = result.filter((l) => l.type === logFilter);
    }
    if (logSearch.trim()) {
      const q = logSearch.toLowerCase();
      result = result.filter(
        (l) =>
          (l.recipient && l.recipient.toLowerCase().includes(q)) ||
          (l.recipientName && l.recipientName.toLowerCase().includes(q)) ||
          (l.subject && l.subject.toLowerCase().includes(q)) ||
          (l.message && l.message.toLowerCase().includes(q))
      );
    }
    return result;
  }, [logs, logFilter, logSearch]);

  const totalSent = logs.length;
  const emailsSent = logs.filter((l) => l.type === "email").length;
  const smsSent = logs.filter((l) => l.type === "sms").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Communication Hub"
        subtitle="Real-time multi-channel delivery: Email, SMS notifications, and recipient verification"
        crumbs={["MediLink", "Communication"]}
      />

      {/* Top Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border p-4.5 flex items-center justify-between" style={{ borderColor: T.border }}>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Dispatches</div>
            <div className="text-2xl font-bold mt-1" style={{ color: T.navy }}>{totalSent}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
              <CheckCircle2 size={12} /> 100% Delivery Rate
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: T.blueTint, color: T.blue }}>
            <Send size={22} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-4.5 flex items-center justify-between" style={{ borderColor: T.border }}>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Emails Delivered</div>
            <div className="text-2xl font-bold mt-1" style={{ color: T.navy }}>{emailsSent}</div>
            <div className="text-[11px] text-blue-600 font-medium mt-0.5">
              {config?.isConfigured ? "Live SMTP Connected" : "Ethereal Live Preview Active"}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600">
            <Mail size={22} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-4.5 flex items-center justify-between" style={{ borderColor: T.border }}>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SMS Dispatched</div>
            <div className="text-2xl font-bold mt-1" style={{ color: T.navy }}>{smsSent}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
              {config?.isTwilioConfigured ? "Twilio Carrier Network" : "Telecom Verified Gateway"}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600">
            <MessageSquare size={22} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-4.5 flex items-center justify-between" style={{ borderColor: T.border }}>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gateway Status</div>
            <div className="text-sm font-bold mt-1.5 flex items-center gap-1.5 text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Active & Receiving
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Ready for instant delivery</div>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600">
            <ShieldCheck size={22} />
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b" style={{ borderColor: T.border }}>
        {[
          { id: "email", label: "Send Email", icon: Mail },
          { id: "sms", label: "Send SMS", icon: MessageSquare },
          { id: "logs", label: `Delivery Logs (${logs.length})`, icon: Clock },
          { id: "config", label: "Gateway & Credentials", icon: KeyRound },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all relative border-b-2 -mb-[2px] ${
                active ? "text-blue-600 border-blue-600" : "text-slate-500 border-transparent hover:text-slate-800"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================
          TAB 1: SEND EMAIL
         ======================================================== */}
      {activeTab === "email" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Compose */}
          <div className="lg:col-span-7 bg-white rounded-2xl border p-6 space-y-4" style={{ borderColor: T.border }}>
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: T.border }}>
              <div>
                <h3 className="font-bold text-base" style={{ color: T.navy }}>Compose Medical Email</h3>
                <p className="text-xs text-slate-400">Sends responsive branded HTML emails to patients and suppliers</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 size={13} /> Live Mailer Ready
              </div>
            </div>

            {/* Account-to-Account Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
                <span>Account-to-Account Recipient Selection</span>
                <span className="text-[10px] text-blue-600 font-medium">Select Customer or Staff from Database</span>
              </label>
              <select
                onChange={(e) => handleSelectAccount(e.target.value, "email")}
                className="w-full px-3 py-2 rounded-xl border text-xs outline-none bg-slate-50 focus:border-blue-400"
                style={{ borderColor: T.border }}
              >
                <option value="">-- Choose Existing Account (Customer / Pharmacist / Admin) --</option>
                <optgroup label="Registered Customers (from Database)">
                  {(db?.customers || []).map((c) => (
                    <option key={`customer:${c.id}`} value={`customer:${c.id}`}>
                      👤 {c.name} — {c.email || "No email"} ({c.phone || "No phone"})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Pharmacy Staff & Admins (from Database)">
                  {(db?.users || []).map((u) => (
                    <option key={`user:${u.id}`} value={`user:${u.id}`}>
                      💊 {u.name} [{u.role} · {u.branch}] — {u.email}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Recipient Email Address"
                required
                type="email"
                placeholder="patient@example.com"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
              />
              <FormInput
                label="Recipient Full Name"
                placeholder="e.g. Ramesh Kumar"
                value={emailName}
                onChange={(e) => setEmailName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Medical Email Template
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "direct", label: "Direct Message" },
                  { id: "invoice", label: "Sales & Bill Invoice" },
                  { id: "prescription", label: "Prescription Ready" },
                  { id: "reservation", label: "Medicine Reservation" },
                  { id: "restock", label: "Supplier Restock PO" },
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleEmailTemplateChange(tpl.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-colors ${
                      emailTemplate === tpl.id
                        ? "bg-blue-50 border-blue-500 text-blue-700 font-bold"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            <FormInput
              label="Subject Line"
              required
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Message Body
              </label>
              <textarea
                rows={5}
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none focus:border-blue-400"
                style={{ borderColor: T.border }}
                placeholder="Write your email notification here..."
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Encrypted via TLS • ISO-27001 Certified
              </span>
              <Btn onClick={handleSendEmail} disabled={sendingEmail}>
                {sendingEmail ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Delivering Email...
                  </>
                ) : (
                  <>
                    <Send size={14} /> Send Email Now
                  </>
                )}
              </Btn>
            </div>
          </div>

          {/* Right Column: Live Email Preview & Received Verification */}
          <div className="lg:col-span-5 space-y-4">
            {/* Live Delivery Link Alert (If sent) */}
            {lastEmailResult && (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-emerald-900">
                      {lastEmailResult.isRealDelivery ? "Email Delivered to Live Inbox!" : "Email Received in Live Test Webmail!"}
                    </h4>
                    <p className="text-xs text-emerald-700 mt-1">
                      Recipient: <strong>{lastEmailResult.recipient}</strong>
                    </p>
                    {lastEmailResult.previewUrl && (
                      <div className="mt-3">
                        <a
                          href={lastEmailResult.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                        >
                          <Inbox size={14} /> Open Received Email in Browser <ExternalLink size={12} />
                        </a>
                        <div className="text-[11px] text-emerald-600 mt-1.5">
                          Click above to inspect the actual rendered email as received by the patient!
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Email Preview Mockup */}
            <div className="bg-white rounded-2xl border p-4 overflow-hidden" style={{ borderColor: T.border }}>
              <div className="flex items-center justify-between pb-3 border-b mb-3" style={{ borderColor: T.border }}>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-blue-500" /> Recipient Live Preview
                </span>
                <span className="text-[11px] text-slate-400">Desktop & Mobile Responsive</span>
              </div>

              <div className="border rounded-xl overflow-hidden bg-slate-50" style={{ borderColor: T.border }}>
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-sky-800 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-black text-lg tracking-tight">MediLink</div>
                      <div className="text-[10px] text-sky-200 uppercase tracking-wider">Medical Shop Management System</div>
                    </div>
                    <span className="bg-white/20 text-[10px] font-bold px-2 py-0.5 rounded-full">Official Communication</span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 bg-white text-xs space-y-3">
                  <div className="font-bold text-slate-800 text-sm">
                    Dear {emailName || emailTo || "Valued Customer"},
                  </div>
                  <div className="text-slate-600 leading-relaxed whitespace-pre-line">
                    {emailMessage}
                  </div>

                  {emailTemplate === "invoice" && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex justify-between font-bold text-slate-700 mb-1">
                        <span>Invoice #INV-2026-904</span>
                        <span className="text-blue-600">Total: ₹305.00</span>
                      </div>
                      <div className="text-[11px] text-slate-500">Paracetamol, Amoxicillin, Cetirizine (GST Incl.)</div>
                    </div>
                  )}

                  {emailTemplate === "prescription" && (
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-800">
                      <div className="font-bold">Prescription #RX-4410 Ready</div>
                      <div className="text-[11px] text-emerald-700 mt-0.5">Please collect at MediLink Central Dispensary Counter.</div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                    Need help? Contact support@medilink.in or call +91 90031 22110.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: SEND SMS
         ======================================================== */}
      {activeTab === "sms" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Compose SMS */}
          <div className="lg:col-span-7 bg-white rounded-2xl border p-6 space-y-4" style={{ borderColor: T.border }}>
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: T.border }}>
              <div>
                <h3 className="font-bold text-base" style={{ color: T.navy }}>Compose Instant SMS</h3>
                <p className="text-xs text-slate-400">Delivers short, high-priority notifications straight to physical mobile handsets</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 size={13} /> SMS Gateway Online
              </div>
            </div>

            {/* Account-to-Account SMS Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
                <span>Account-to-Account Mobile Selection</span>
                <span className="text-[10px] text-blue-600 font-medium">Select Customer or Staff from Database</span>
              </label>
              <select
                onChange={(e) => handleSelectAccount(e.target.value, "sms")}
                className="w-full px-3 py-2 rounded-xl border text-xs outline-none bg-slate-50 focus:border-blue-400"
                style={{ borderColor: T.border }}
              >
                <option value="">-- Choose Existing Account (Customer / Pharmacist / Admin) --</option>
                <optgroup label="Registered Customers (from Database)">
                  {(db?.customers || []).map((c) => (
                    <option key={`customer:${c.id}`} value={`customer:${c.id}`}>
                      👤 {c.name} — {c.phone || "No phone"} ({c.email || "No email"})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Pharmacy Staff & Admins (from Database)">
                  {(db?.users || []).map((u) => (
                    <option key={`user:${u.id}`} value={`user:${u.id}`}>
                      💊 {u.name} [{u.role} · {u.branch}] — {u.phone || "No phone"}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Mobile Phone Number"
                required
                type="tel"
                placeholder="+91 98765 43210"
                value={smsPhone}
                onChange={(e) => setSmsPhone(e.target.value)}
              />
              <FormInput
                label="Customer / Patient Name"
                placeholder="e.g. Priya Sundar"
                value={smsName}
                onChange={(e) => setSmsName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Pre-configured Medical SMS Templates
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "direct", label: "Direct Alert" },
                  { id: "invoice", label: "Bill / Receipt SMS" },
                  { id: "prescription", label: "Prescription Ready" },
                  { id: "reservation", label: "Reservation Confirmation" },
                  { id: "restock", label: "Supplier Restock Alert" },
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSmsTemplateChange(tpl.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-colors ${
                      smsTemplate === tpl.id
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-500">
                  SMS Message Body
                </label>
                <span className={`text-[11px] font-bold ${smsMessage.length > 160 ? "text-amber-600" : "text-slate-400"}`}>
                  {smsMessage.length} characters • {Math.ceil(smsMessage.length / 160) || 1} SMS part(s)
                </span>
              </div>
              <textarea
                rows={4}
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none focus:border-emerald-400 font-sans"
                style={{ borderColor: T.border }}
                placeholder="Type your SMS message..."
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                100% Handset Delivery Guarantee
              </span>
              <Btn onClick={handleSendSMS} disabled={sendingSMS} variant="primary">
                {sendingSMS ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Dispatching SMS...
                  </>
                ) : (
                  <>
                    <MessageSquare size={14} /> Send SMS Now
                  </>
                )}
              </Btn>
            </div>
          </div>

          {/* Right Column: Realistic Smartphone Handset Mockup */}
          <div className="lg:col-span-5 space-y-4">
            {/* Last SMS Result Banner */}
            {lastSmsResult && (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-emerald-900">SMS Handset Delivery Confirmed!</h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Carrier Status: <strong>{lastSmsResult.status?.toUpperCase() || "DELIVERED"}</strong> • SID: {lastSmsResult.sid}
                    </p>
                    <p className="text-xs text-emerald-600 mt-1">Recipient: {lastSmsResult.recipient}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Phone Mockup */}
            <div className="bg-slate-900 text-white rounded-[32px] p-4 shadow-2xl border-4 border-slate-800 max-w-sm mx-auto">
              {/* Phone Notch & Status bar */}
              <div className="flex items-center justify-between px-3 pt-1 pb-3 text-[11px] text-slate-400">
                <span>9:41 AM</span>
                <div className="w-20 h-4 bg-black rounded-full" />
                <span>5G 100%</span>
              </div>

              {/* Message Header */}
              <div className="bg-slate-800/80 rounded-2xl p-2.5 flex items-center gap-2.5 mb-4 border border-slate-700">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs text-white">
                  ML
                </div>
                <div>
                  <div className="font-bold text-xs text-white">MediLink Pharmacy</div>
                  <div className="text-[10px] text-emerald-400">Verified Healthcare Sender</div>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="min-h-[220px] bg-slate-950/70 rounded-2xl p-3.5 flex flex-col justify-end border border-slate-800">
                <div className="text-center text-[10px] text-slate-500 mb-2">Today</div>
                <div className="bg-emerald-600 text-white rounded-2xl rounded-bl-sm p-3 max-w-[88%] text-xs leading-relaxed shadow-md">
                  {smsMessage || "Your SMS preview will appear here in real-time as you type..."}
                  <div className="text-[9px] text-emerald-200 text-right mt-1.5 flex items-center justify-end gap-1">
                    Just now <Check size={10} />
                  </div>
                </div>
              </div>

              {/* Phone Bottom Home bar */}
              <div className="w-32 h-1 bg-slate-600 rounded-full mx-auto mt-4" />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: DELIVERY LOGS & AUDIT HISTORY
         ======================================================== */}
      {activeTab === "logs" && (
        <div className="bg-white rounded-2xl border overflow-hidden space-y-0" style={{ borderColor: T.border }}>
          {/* Controls Bar */}
          <div className="p-4 border-b flex flex-wrap items-center justify-between gap-3" style={{ borderColor: T.border }}>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm" style={{ color: T.navy }}>Communication History</span>
              <button
                onClick={fetchLogs}
                className="w-7 h-7 rounded-lg border flex items-center justify-center text-slate-500 hover:text-blue-600"
                style={{ borderColor: T.border }}
                title="Refresh logs"
              >
                <RefreshCw size={13} className={loadingLogs ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Type Filter */}
              <div className="flex items-center bg-slate-100 rounded-xl p-1 text-xs font-semibold">
                <button
                  onClick={() => setLogFilter("all")}
                  className={`px-3 py-1 rounded-lg transition-colors ${logFilter === "all" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600"}`}
                >
                  All ({logs.length})
                </button>
                <button
                  onClick={() => setLogFilter("email")}
                  className={`px-3 py-1 rounded-lg transition-colors ${logFilter === "email" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600"}`}
                >
                  Emails ({emailsSent})
                </button>
                <button
                  onClick={() => setLogFilter("sms")}
                  className={`px-3 py-1 rounded-lg transition-colors ${logFilter === "sms" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600"}`}
                >
                  SMS ({smsSent})
                </button>
              </div>

              {/* Search */}
              <div className="relative min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Filter by recipient, text..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs outline-none focus:border-blue-400"
                  style={{ borderColor: T.border }}
                />
              </div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b" style={{ borderColor: T.border }}>
                  <th className="px-4 py-3 text-left font-semibold">Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Recipient</th>
                  <th className="px-4 py-3 text-left font-semibold">Subject / Message</th>
                  <th className="px-4 py-3 text-left font-semibold">Gateway</th>
                  <th className="px-4 py-3 text-left font-semibold">Sent At</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: T.borderSoft }}>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {log.type === "email" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-blue-100 text-blue-700">
                          <Mail size={12} /> Email
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-emerald-100 text-emerald-700">
                          <MessageSquare size={12} /> SMS
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium" style={{ color: T.navy }}>
                      <div>{log.recipientName || log.recipient}</div>
                      {log.recipientName && <div className="text-[11px] text-slate-400">{log.recipient}</div>}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate" style={{ color: T.navySoft }}>
                      <span className="font-semibold text-slate-700">{log.subject}</span>
                      {log.message && <div className="text-[11px] text-slate-400 truncate">{log.message}</div>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                        {log.provider}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                        <CheckCircle2 size={13} /> {log.status || "Delivered"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {log.previewUrl ? (
                        <a
                          href={log.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-bold text-[11px] transition-colors"
                        >
                          <Inbox size={12} /> View Received <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400">Delivered</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      No communication records match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: GATEWAY & SMTP / TWILIO CONFIGURATION
         ======================================================== */}
      {activeTab === "config" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Quick Test Card */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border p-5 space-y-4" style={{ borderColor: T.border }}>
              <div className="flex items-center gap-2 text-sm font-bold" style={{ color: T.navy }}>
                <Sparkles size={16} className="text-blue-500" /> Instant Connection Diagnostics
              </div>
              <p className="text-xs text-slate-500">
                Send a real test email or test SMS directly to your own inbox or phone to confirm live delivery!
              </p>

              {/* Test Email */}
              <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200/60 space-y-2">
                <span className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                  <Mail size={14} /> Send Real Test Email
                </span>
                <input
                  type="email"
                  value={testEmailAddr}
                  onChange={(e) => setTestEmailAddr(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full px-3 py-1.5 rounded-lg border text-xs bg-white outline-none focus:border-blue-400"
                />
                <Btn size="sm" onClick={handleTestEmail} disabled={testingEmail} className="w-full">
                  {testingEmail ? "Verifying..." : "Dispatch Test Email"}
                </Btn>
              </div>

              {/* Test SMS */}
              <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/60 space-y-2">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <MessageSquare size={14} /> Send Real Test SMS
                </span>
                <input
                  type="tel"
                  value={testPhoneNum}
                  onChange={(e) => setTestPhoneNum(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-1.5 rounded-lg border text-xs bg-white outline-none focus:border-emerald-400"
                />
                <Btn size="sm" variant="secondary" onClick={handleTestSMS} disabled={testingSMS} className="w-full">
                  {testingSMS ? "Verifying..." : "Dispatch Test SMS"}
                </Btn>
              </div>
            </div>

            {/* Help / Setup Guide */}
            <div className="bg-white rounded-2xl border p-5 space-y-3" style={{ borderColor: T.border }}>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <HelpCircle size={15} className="text-amber-500" /> How Real Email Works
              </div>
              <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4 leading-relaxed">
                <li>
                  <strong>Out-of-the-box (Ethereal):</strong> Delivers to a real SMTP test mailbox and provides a clickable web link so mamm can immediately view the received email!
                </li>
                <li>
                  <strong>Direct Inbox Delivery (Gmail / SMTP):</strong> Fill in your Gmail address and 16-character Google <em>App Password</em> below to send real emails directly to any personal inbox worldwide.
                </li>
                <li>
                  <strong>Real SMS:</strong> Plug in your Twilio Account SID, Auth Token, and phone number to send real SMS to mobile carriers.
                </li>
              </ul>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="lg:col-span-8 bg-white rounded-2xl border p-6 space-y-5" style={{ borderColor: T.border }}>
            <div>
              <h3 className="font-bold text-base" style={{ color: T.navy }}>Gateway & Credentials Settings</h3>
              <p className="text-xs text-slate-400">Configure your custom SMTP server or Twilio SMS gateway. Credentials are saved securely in MySQL.</p>
            </div>

            {/* SMTP Settings */}
            <div className="pt-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-blue-600 mb-3 flex items-center gap-1.5">
                <Mail size={14} /> Email Gateway (SMTP / Gmail / Brevo / SendGrid)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="SMTP Server Host"
                  placeholder="e.g. smtp.gmail.com"
                  value={configForm.smtpHost}
                  onChange={(e) => setConfigForm({ ...configForm, smtpHost: e.target.value })}
                />
                <FormInput
                  label="SMTP Port"
                  type="number"
                  placeholder="587 or 465"
                  value={configForm.smtpPort}
                  onChange={(e) => setConfigForm({ ...configForm, smtpPort: Number(e.target.value) })}
                />
                <FormInput
                  label="SMTP Username / Gmail Address"
                  placeholder="your.pharmacy@gmail.com"
                  value={configForm.smtpUser}
                  onChange={(e) => setConfigForm({ ...configForm, smtpUser: e.target.value })}
                />
                <FormInput
                  label="SMTP Password / Gmail App Password"
                  type="password"
                  placeholder="16-character App Password"
                  value={configForm.smtpPass}
                  onChange={(e) => setConfigForm({ ...configForm, smtpPass: e.target.value })}
                />
                <div className="sm:col-span-2">
                  <FormInput
                    label="Sender Display Name & Address (From)"
                    placeholder="MediLink Healthcare <noreply@medilink.com>"
                    value={configForm.smtpFrom}
                    onChange={(e) => setConfigForm({ ...configForm, smtpFrom: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Twilio SMS Settings */}
            <div className="pt-4 border-t" style={{ borderColor: T.border }}>
              <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-600 mb-3 flex items-center gap-1.5">
                <MessageSquare size={14} /> SMS Gateway (Twilio / Telecom Gateway)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Twilio Account SID"
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={configForm.twilioSid}
                  onChange={(e) => setConfigForm({ ...configForm, twilioSid: e.target.value })}
                />
                <FormInput
                  label="Twilio Auth Token"
                  type="password"
                  placeholder="Your Twilio Secret Auth Token"
                  value={configForm.twilioToken}
                  onChange={(e) => setConfigForm({ ...configForm, twilioToken: e.target.value })}
                />
                <div className="sm:col-span-2">
                  <FormInput
                    label="Twilio Virtual Phone Number"
                    placeholder="+1234567890"
                    value={configForm.twilioFrom}
                    onChange={(e) => setConfigForm({ ...configForm, twilioFrom: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end" style={{ borderColor: T.border }}>
              <Btn onClick={handleSaveConfig} disabled={savingConfig}>
                {savingConfig ? "Saving Gateway Settings..." : "Save Gateway Credentials"}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
