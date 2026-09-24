"use client"
import { useState } from "react"
import { Search, Plus, Eye, Check, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, TextArea, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type WriteOff = {
  id: string; sku: string; product: string; qty: number; value: string
  reason: string; approvedBy: string; date: string; status: string; notes?: string
}

const initialWriteOffs: WriteOff[] = [
  { id: "WO-2024-0110", sku: "SKU-001236", product: "Refined Sunflower Oil 5L", qty: 4, value: "₹2,400", reason: "Breakage", approvedBy: "Kavitha Rao", date: "2024-07-16", status: "Approved" },
  { id: "WO-2024-0109", sku: "SKU-001235", product: "Organic Wheat Flour 10kg", qty: 2, value: "₹1,800", reason: "Pest damage", approvedBy: "Ravi Kumar", date: "2024-07-14", status: "Approved" },
  { id: "WO-2024-0108", sku: "SKU-001238", product: "Brown Sugar 10kg", qty: 10, value: "₹4,500", reason: "Expiry", approvedBy: "", date: "2024-07-12", status: "Pending" },
  { id: "WO-2024-0107", sku: "SKU-001240", product: "Tomato Puree 400g", qty: 24, value: "₹3,600", reason: "Contamination", approvedBy: "Meena Patel", date: "2024-07-10", status: "Approved" },
  { id: "WO-2024-0106", sku: "SKU-001234", product: "Premium Basmati Rice 5kg", qty: 6, value: "₹4,200", reason: "Pest damage", approvedBy: "Priya Sharma", date: "2024-07-09", status: "Approved", notes: "Rodent activity in A-12 aisle, bags gnawed" },
  { id: "WO-2024-0105", sku: "SKU-001237", product: "Chickpea Lentils 25kg", qty: 3, value: "₹5,250", reason: "Breakage", approvedBy: "", date: "2024-07-08", status: "Pending" },
  { id: "WO-2024-0104", sku: "SKU-001239", product: "Iodized Salt 1kg", qty: 40, value: "₹1,200", reason: "Quality rejection", approvedBy: "Arjun Nair", date: "2024-07-07", status: "Approved" },
  { id: "WO-2024-0103", sku: "SKU-001235", product: "Organic Wheat Flour 10kg", qty: 5, value: "₹4,500", reason: "Expiry", approvedBy: "Kavitha Rao", date: "2024-07-06", status: "Approved" },
  { id: "WO-2024-0102", sku: "SKU-001238", product: "Brown Sugar 10kg", qty: 8, value: "₹3,600", reason: "Theft / Shrinkage", approvedBy: "", date: "2024-07-05", status: "Pending", notes: "Cycle count variance flagged at C-01-07" },
  { id: "WO-2024-0101", sku: "SKU-001236", product: "Refined Sunflower Oil 5L", qty: 6, value: "₹3,600", reason: "Breakage", approvedBy: "Ravi Kumar", date: "2024-07-04", status: "Approved" },
  { id: "WO-2024-0100", sku: "SKU-001240", product: "Tomato Puree 400g", qty: 36, value: "₹5,400", reason: "Expiry", approvedBy: "Meena Patel", date: "2024-07-03", status: "Approved" },
  { id: "WO-2024-0099", sku: "SKU-001234", product: "Premium Basmati Rice 5kg", qty: 4, value: "₹2,800", reason: "Contamination", approvedBy: "", date: "2024-07-02", status: "Pending" },
  { id: "WO-2024-0098", sku: "SKU-001237", product: "Chickpea Lentils 25kg", qty: 2, value: "₹3,500", reason: "Pest damage", approvedBy: "Priya Sharma", date: "2024-07-01", status: "Approved" },
  { id: "WO-2024-0097", sku: "SKU-001239", product: "Iodized Salt 1kg", qty: 60, value: "₹1,800", reason: "Breakage", approvedBy: "Arjun Nair", date: "2024-06-29", status: "Approved" },
  { id: "WO-2024-0096", sku: "SKU-001235", product: "Organic Wheat Flour 10kg", qty: 3, value: "₹2,700", reason: "Quality rejection", approvedBy: "Kavitha Rao", date: "2024-06-28", status: "Approved", notes: "Moisture content above spec on inbound lot" },
  { id: "WO-2024-0095", sku: "SKU-001238", product: "Brown Sugar 10kg", qty: 12, value: "₹5,400", reason: "Expiry", approvedBy: "Ravi Kumar", date: "2024-06-27", status: "Approved" },
  { id: "WO-2024-0094", sku: "SKU-001236", product: "Refined Sunflower Oil 5L", qty: 9, value: "₹5,400", reason: "Theft / Shrinkage", approvedBy: "", date: "2024-06-26", status: "Pending" },
  { id: "WO-2024-0093", sku: "SKU-001240", product: "Tomato Puree 400g", qty: 18, value: "₹2,700", reason: "Breakage", approvedBy: "Meena Patel", date: "2024-06-25", status: "Approved" },
  { id: "WO-2024-0092", sku: "SKU-001234", product: "Premium Basmati Rice 5kg", qty: 7, value: "₹4,900", reason: "Expiry", approvedBy: "Priya Sharma", date: "2024-06-24", status: "Approved" },
  { id: "WO-2024-0091", sku: "SKU-001237", product: "Chickpea Lentils 25kg", qty: 4, value: "₹7,000", reason: "Contamination", approvedBy: "Kavitha Rao", date: "2024-06-22", status: "Approved" },
  { id: "WO-2024-0090", sku: "SKU-001239", product: "Iodized Salt 1kg", qty: 25, value: "₹750", reason: "Pest damage", approvedBy: "", date: "2024-06-21", status: "Pending" },
  { id: "WO-2024-0089", sku: "SKU-001235", product: "Organic Wheat Flour 10kg", qty: 6, value: "₹5,400", reason: "Breakage", approvedBy: "Arjun Nair", date: "2024-06-20", status: "Approved" },
  { id: "WO-2024-0088", sku: "SKU-001238", product: "Brown Sugar 10kg", qty: 15, value: "₹6,750", reason: "Quality rejection", approvedBy: "Ravi Kumar", date: "2024-06-19", status: "Approved" },
  { id: "WO-2024-0087", sku: "SKU-001236", product: "Refined Sunflower Oil 5L", qty: 3, value: "₹1,800", reason: "Expiry", approvedBy: "Meena Patel", date: "2024-06-18", status: "Approved" },
  { id: "WO-2024-0086", sku: "SKU-001240", product: "Tomato Puree 400g", qty: 48, value: "₹7,200", reason: "Contamination", approvedBy: "", date: "2024-06-17", status: "Pending", notes: "Seal failure across two cases, quarantined in QC bay" },
  { id: "WO-2024-0085", sku: "SKU-001234", product: "Premium Basmati Rice 5kg", qty: 5, value: "₹3,500", reason: "Theft / Shrinkage", approvedBy: "Kavitha Rao", date: "2024-06-15", status: "Approved" },
]

const REASONS = ["Breakage", "Pest damage", "Expiry", "Contamination", "Theft / Shrinkage", "Quality rejection"] as const
const APPROVERS = ["Kavitha Rao", "Ravi Kumar", "Meena Patel", "Priya Sharma", "Arjun Nair"] as const

const emptyForm = { sku: "", product: "", qty: "", value: "", reason: "", notes: "" }

/** "₹2,400" -> 2400 so the value stat cards can total real state. */
function parseValue(v: string) {
  const n = Number(v.replace(/[^\d.]/g, ""))
  return Number.isFinite(n) ? n : 0
}

function formatINR(n: number) {
  return `₹${n.toLocaleString("en-IN")}`
}

export default function WriteOffsPage() {
  const [writeOffs, setWriteOffs] = useState<WriteOff[]>(initialWriteOffs)
  const [search, setSearch] = useState("")

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<WriteOff | null>(null)
  const [approveTarget, setApproveTarget] = useState<WriteOff | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<WriteOff | null>(null)

  const filtered = writeOffs.filter(w => w.id.toLowerCase().includes(search.toLowerCase()) || w.product.toLowerCase().includes(search.toLowerCase()))

  const totalValue = writeOffs.reduce((sum, w) => sum + parseValue(w.value), 0)
  const pendingCount = writeOffs.filter(w => w.status === "Pending").length

  const stats = [
    { label: "This Month", value: String(writeOffs.length) },
    { label: "Total Value", value: formatINR(totalValue), cls: "text-danger" },
    { label: "Pending Approval", value: String(pendingCount), cls: "text-amber-600" },
    { label: "YTD Value", value: formatINR(totalValue + 181600) },
  ]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.sku.trim()) e.sku = "SKU is required"
    if (!form.product.trim()) e.product = "Product name is required"
    if (!form.qty.trim()) e.qty = "Quantity is required"
    else if (!/^\d+$/.test(form.qty) || Number(form.qty) < 1) e.qty = "Enter a positive whole number"
    if (!form.value.trim()) e.value = "Loss value is required"
    else if (!/^\d+(\.\d+)?$/.test(form.value) || Number(form.value) <= 0) e.value = "Enter a positive amount in rupees"
    if (!form.reason) e.reason = "Select a reason"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createWriteOff() {
    if (!validate()) return
    const seq = 111 + writeOffs.filter(w => w.id.startsWith("WO-2024-01")).length - 4
    const next: WriteOff = {
      id: `WO-2024-0${seq}`,
      sku: form.sku.trim(),
      product: form.product.trim(),
      qty: Number(form.qty),
      value: formatINR(Number(form.value)),
      reason: form.reason,
      approvedBy: "",
      date: new Date().toISOString().slice(0, 10),
      status: "Pending",
      notes: form.notes.trim() || undefined,
    }
    setWriteOffs(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Write-off raised", `${next.id} — ${next.qty} units of ${next.product} (${next.value}) awaiting approval.`)
  }

  function approve(w: WriteOff) {
    const approver = APPROVERS[0]
    setWriteOffs(prev => prev.map(x => x.id === w.id ? { ...x, status: "Approved", approvedBy: approver } : x))
    notify.success("Write-off approved", `${w.id} approved by ${approver}. ${w.value} written off inventory.`)
  }

  function remove(w: WriteOff) {
    setWriteOffs(prev => prev.filter(x => x.id !== w.id))
    notify.warning("Write-off deleted", `${w.id} has been removed from the register.`)
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Write-offs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Inventory losses due to damage, expiry or contamination</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="write-offs" />
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> New Write-off</button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn("text-2xl font-bold mt-1", s.cls || "text-foreground")}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search write-off ID, product..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>{["WO ID", "SKU / Product", "Qty", "Value", "Reason", "Approved By", "Date", "Status", "Actions"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(w => (
              <tr key={w.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{w.id}</td>
                <td className="px-4 py-3"><p className="text-xs text-brand font-mono">{w.sku}</p><p className="text-xs text-foreground">{w.product}</p></td>
                <td className="px-4 py-3 font-semibold text-danger">{w.qty}</td>
                <td className="px-4 py-3 font-semibold text-foreground">{w.value}</td>
                <td className="px-4 py-3 text-muted-foreground">{w.reason}</td>
                <td className="px-4 py-3 text-foreground">{w.approvedBy || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{w.date}</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", w.status === "Approved" ? "bg-success/10 text-success" : "bg-amber-100 text-amber-700")}>{w.status}</span></td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: "View details", icon: <Eye />, onSelect: () => setDetail(w) },
                      ...(w.status === "Pending"
                        ? [{ label: "Approve write-off", icon: <Check />, onSelect: () => setApproveTarget(w), tone: "success" as const }]
                        : []),
                      { label: "Delete write-off", icon: <Trash2 />, onSelect: () => setDeleteTarget(w), tone: "danger" as const },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">No write-offs match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create write-off */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="New Write-off"
        description="Record an inventory loss for approval"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createWriteOff} submitLabel="Raise Write-off" tone="danger" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="SKU Code" required error={errors.sku}>
            <TextInput value={form.sku} invalid={!!errors.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. SKU-001236" />
          </Field>
          <Field label="Product Name" required error={errors.product}>
            <TextInput value={form.product} invalid={!!errors.product} onChange={e => setForm({ ...form, product: e.target.value })} placeholder="e.g. Refined Sunflower Oil 5L" />
          </Field>
          <Field label="Quantity" required error={errors.qty}>
            <TextInput value={form.qty} invalid={!!errors.qty} onChange={e => setForm({ ...form, qty: e.target.value })} placeholder="e.g. 4" inputMode="numeric" />
          </Field>
          <Field label="Loss Value (₹)" required error={errors.value} hint="Rupees, digits only">
            <TextInput value={form.value} invalid={!!errors.value} onChange={e => setForm({ ...form, value: e.target.value })} placeholder="e.g. 2400" inputMode="numeric" />
          </Field>
          <Field label="Reason" required error={errors.reason}>
            <Select value={form.reason} invalid={!!errors.reason} onChange={e => setForm({ ...form, reason: e.target.value })} options={REASONS} placeholder="Select Reason" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes" hint="Optional context for the approver">
              <TextArea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="e.g. Pallet dropped during putaway, 4 cans burst" />
            </Field>
          </div>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Write-off detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Write-off ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="SKU" value={<span className="font-mono">{detail.sku}</span>} />
            <DetailRow label="Product" value={detail.product} />
            <DetailRow label="Quantity" value={`${detail.qty} units`} />
            <DetailRow label="Loss Value" value={<span className="text-danger font-semibold">{detail.value}</span>} />
            <DetailRow label="Reason" value={detail.reason} />
            <DetailRow label="Approved By" value={detail.approvedBy || "—"} />
            <DetailRow label="Date" value={detail.date} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", detail.status === "Approved" ? "bg-success/10 text-success" : "bg-amber-100 text-amber-700")}>{detail.status}</span>} />
            <DetailRow label="Notes" value={detail.notes || "—"} />
          </div>
        )}
      </Drawer>

      {/* Approve confirmation */}
      <ConfirmDialog
        open={!!approveTarget}
        onOpenChange={(o) => !o && setApproveTarget(null)}
        title="Approve this write-off?"
        message={`${approveTarget?.id} will permanently remove ${approveTarget?.qty} units of ${approveTarget?.product} (${approveTarget?.value}) from inventory.`}
        confirmLabel="Approve"
        cancelLabel="Not Yet"
        tone="brand"
        onConfirm={() => approveTarget && approve(approveTarget)}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this write-off?"
        message={`${deleteTarget?.id} for ${deleteTarget?.product} will be removed from the register. This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Keep It"
        onConfirm={() => deleteTarget && remove(deleteTarget)}
      />
    </div>
  )
}
