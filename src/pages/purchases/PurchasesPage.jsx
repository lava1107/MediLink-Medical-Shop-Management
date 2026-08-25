import React, { useState } from "react";
import { Plus, Trash2, Eye } from "lucide-react";
import { useApp } from "../../hooks/useApp.js";
import { useAuth } from "../../hooks/useAuth.js";
import { BRANCHES, SUPPLIERS, MEDICINES } from "../../data/mockData.js";
import { createPurchase } from "../../services/purchaseService.js";
import { formatCurrency } from "../../utils/format.js";
import { T } from "../../utils/theme.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Btn from "../../components/common/Btn.jsx";
import IconBtn from "../../components/common/IconBtn.jsx";
import Modal from "../../components/common/Modal.jsx";
import { FormInput, FormSelect } from "../../components/common/FormControls.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";

export default function PurchasesPage() {
  const { db, setDb, toast } = useApp();
  const { user } = useAuth();
  const [wizard, setWizard] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ supplier: "", branch: "", items: [] });
  const [itemDraft, setItemDraft] = useState({ medicine: "", batchNo: "", mfgDate: "", expiryDate: "", qty: "", price: "", discount: 0, gst: 12 });

  function resetWizard() {
    setWizard(false);
    setStep(1);
    setForm({ supplier: "", branch: "", items: [] });
    setItemDraft({ medicine: "", batchNo: "", mfgDate: "", expiryDate: "", qty: "", price: "", discount: 0, gst: 12 });
  }

  function addItem() {
    if (!itemDraft.medicine || !itemDraft.qty || !itemDraft.price || !itemDraft.batchNo) {
      toast("Fill in medicine, batch, quantity and price.", "error");
      return;
    }
    if (itemDraft.expiryDate && itemDraft.mfgDate && itemDraft.expiryDate <= itemDraft.mfgDate) {
      toast("Expiry date must be after manufacturing date.", "error");
      return;
    }
    setForm((f) => ({ ...f, items: [...f.items, { ...itemDraft, id: Date.now() }] }));
    setItemDraft({ medicine: "", batchNo: "", mfgDate: "", expiryDate: "", qty: "", price: "", discount: 0, gst: 12 });
  }
  function removeItem(id) {
    setForm((f) => ({ ...f, items: f.items.filter((i) => i.id !== id) }));
  }

  const subtotal = form.items.reduce((a, i) => a + Number(i.qty) * Number(i.price), 0);
  const totalDiscount = form.items.reduce((a, i) => a + (Number(i.qty) * Number(i.price) * (Number(i.discount) || 0)) / 100, 0);
  const totalGst = form.items.reduce(
    (a, i) => a + ((Number(i.qty) * Number(i.price) - (Number(i.qty) * Number(i.price) * (Number(i.discount) || 0)) / 100) * (Number(i.gst) || 0)) / 100,
    0
  );
  const grandTotal = subtotal - totalDiscount + totalGst;

  async function savePurchase(paymentStatus) {
    if (!form.supplier || !form.branch || form.items.length === 0) {
      toast("Select supplier, branch and add at least one medicine.", "error");
      return;
    }
    const result = await createPurchase(db, { ...form, grandTotal, paymentStatus, purchasedBy: user.name });
    setDb((d) => ({ ...d, purchases: result.purchases, batches: result.batches }));
    toast("Purchase saved and batches updated.");
    resetWizard();
  }

  return (
    <div>
      <PageHeader
        title="Purchase Management"
        subtitle="Record and track medicine purchases from suppliers"
        crumbs={["MediLink", "Purchases"]}
        action={
          <Btn icon={Plus} onClick={() => setWizard(true)}>
            New Purchase
          </Btn>
        }
      />
      <DataTable
        columns={[
          { key: "invoice", label: "Invoice No.", sortable: true },
          { key: "supplier", label: "Supplier", sortable: true },
          { key: "branch", label: "Branch" },
          { key: "purchasedBy", label: "Purchased By" },
          { key: "date", label: "Date", sortable: true },
          { key: "amount", label: "Total Amount", sortable: true, render: (r) => formatCurrency(r.amount) },
          { key: "payment", label: "Payment", render: (r) => <StatusBadge status={r.payment} /> },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
        ]}
        data={db.purchases}
        searchKeys={["invoice", "supplier", "branch"]}
        filters={[
          { key: "branch", label: "Branch", options: BRANCHES.map((b) => b.name) },
          { key: "payment", label: "Payment", options: ["Paid", "Pending", "Partially Paid"] },
        ]}
        actions={() => <IconBtn icon={Eye} tone="blue" />}
      />

      <Modal
        open={wizard}
        onClose={resetWizard}
        title={`New Purchase — Step ${step} of 3`}
        width="max-w-3xl"
        footer={
          <>
            {step > 1 && (
              <Btn variant="secondary" onClick={() => setStep((s) => s - 1)}>
                Back
              </Btn>
            )}
            <div className="flex-1" />
            {step < 3 && (
              <Btn
                onClick={() => {
                  if (step === 1 && (!form.supplier || !form.branch)) {
                    toast("Select supplier and branch.", "error");
                    return;
                  }
                  if (step === 2 && form.items.length === 0) {
                    toast("Add at least one medicine.", "error");
                    return;
                  }
                  setStep((s) => s + 1);
                }}
              >
                Next
              </Btn>
            )}
            {step === 3 && (
              <>
                <Btn variant="secondary" onClick={() => savePurchase("Pending")}>
                  Save as Pending
                </Btn>
                <Btn onClick={() => savePurchase("Paid")}>Confirm & Mark Paid</Btn>
              </>
            )}
          </>
        }
      >
        {step === 1 && (
          <div className="grid grid-cols-2 gap-4">
            <FormSelect label="Supplier" required value={form.supplier} onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))}>
              <option value="">Select supplier</option>
              {SUPPLIERS.map((s) => (
                <option key={s.id}>{s.name}</option>
              ))}
            </FormSelect>
            <FormSelect label="Branch" required value={form.branch} onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))}>
              <option value="">Select branch</option>
              {BRANCHES.map((b) => (
                <option key={b.id}>{b.name}</option>
              ))}
            </FormSelect>
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="grid grid-cols-6 gap-2.5 mb-3 items-end">
              <div className="col-span-2">
                <FormSelect label="Medicine" value={itemDraft.medicine} onChange={(e) => setItemDraft((d) => ({ ...d, medicine: e.target.value }))}>
                  <option value="">Select</option>
                  {MEDICINES.map((m) => (
                    <option key={m.id}>{m.name}</option>
                  ))}
                </FormSelect>
              </div>
              <FormInput label="Batch No." value={itemDraft.batchNo} onChange={(e) => setItemDraft((d) => ({ ...d, batchNo: e.target.value }))} />
              <FormInput label="Mfg Date" type="date" value={itemDraft.mfgDate} onChange={(e) => setItemDraft((d) => ({ ...d, mfgDate: e.target.value }))} />
              <FormInput label="Expiry Date" type="date" value={itemDraft.expiryDate} onChange={(e) => setItemDraft((d) => ({ ...d, expiryDate: e.target.value }))} />
              <FormInput label="Qty" type="number" min="1" value={itemDraft.qty} onChange={(e) => setItemDraft((d) => ({ ...d, qty: e.target.value }))} />
            </div>
            <div className="grid grid-cols-6 gap-2.5 mb-4 items-end">
              <FormInput label="Purchase Price (₹)" type="number" min="0" value={itemDraft.price} onChange={(e) => setItemDraft((d) => ({ ...d, price: e.target.value }))} />
              <FormInput label="Discount (%)" type="number" min="0" value={itemDraft.discount} onChange={(e) => setItemDraft((d) => ({ ...d, discount: e.target.value }))} />
              <FormInput label="GST (%)" type="number" min="0" value={itemDraft.gst} onChange={(e) => setItemDraft((d) => ({ ...d, gst: e.target.value }))} />
              <div className="col-span-3 flex justify-end">
                <Btn icon={Plus} onClick={addItem}>
                  Add Item
                </Btn>
              </div>
            </div>
            <div className="border rounded-xl overflow-hidden" style={{ borderColor: T.border }}>
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: T.blueTint2 }}>
                    {["Medicine", "Batch", "Qty", "Price", "Disc%", "GST%", ""].map((h) => (
                      <th key={h} className="text-left px-3 py-2 font-semibold" style={{ color: T.navySoft }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((i) => (
                    <tr key={i.id} className="border-t" style={{ borderColor: T.borderSoft }}>
                      <td className="px-3 py-2" style={{ color: T.navy }}>
                        {i.medicine}
                      </td>
                      <td className="px-3 py-2" style={{ color: T.navySoft }}>
                        {i.batchNo}
                      </td>
                      <td className="px-3 py-2" style={{ color: T.navySoft }}>
                        {i.qty}
                      </td>
                      <td className="px-3 py-2" style={{ color: T.navySoft }}>
                        {formatCurrency(i.price)}
                      </td>
                      <td className="px-3 py-2" style={{ color: T.navySoft }}>
                        {i.discount}%
                      </td>
                      <td className="px-3 py-2" style={{ color: T.navySoft }}>
                        {i.gst}%
                      </td>
                      <td className="px-3 py-2">
                        <IconBtn icon={Trash2} tone="red" onClick={() => removeItem(i.id)} />
                      </td>
                    </tr>
                  ))}
                  {form.items.length === 0 && (
                    <tr>
                      <td colSpan={7}>
                        <EmptyState title="No medicines added yet" />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <div className="rounded-xl border p-4 mb-4" style={{ borderColor: T.border, background: T.blueTint2 }}>
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: T.navySoft }}>Supplier</span>
                <span className="font-semibold" style={{ color: T.navy }}>
                  {form.supplier}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: T.navySoft }}>Branch</span>
                <span className="font-semibold" style={{ color: T.navy }}>
                  {form.branch}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 text-sm mb-3">
              <div className="flex justify-between">
                <span style={{ color: T.navySoft }}>Subtotal</span>
                <span style={{ color: T.navy }}>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: T.navySoft }}>Discount</span>
                <span style={{ color: T.red }}>-{formatCurrency(totalDiscount)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: T.navySoft }}>GST</span>
                <span style={{ color: T.navy }}>+{formatCurrency(totalGst)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t" style={{ borderColor: T.border, color: T.navy }}>
                <span>Grand Total</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
