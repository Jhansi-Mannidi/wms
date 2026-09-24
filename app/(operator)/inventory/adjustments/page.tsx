"use client"
import { useState } from "react"
import { Search, Plus, Eye, Check, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, TextArea, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Adjustment = {
  id: string; sku: string; product: string; type: string
  before: number; after: number; change: number
  reason: string; by: string; date: string; status: string
}

const initialAdjustments: Adjustment[] = [
  { id: "ADJ-2024-441", sku: "SKU-001234", product: "Premium Basmati Rice 5kg", type: "Damage", before: 1260, after: 1250, change: -10, reason: "Packaging damage on receipt", by: "Ravi Kumar", date: "2024-07-19", status: "Approved" },
  { id: "ADJ-2024-440", sku: "SKU-001237", product: "Chickpea Lentils 25kg", type: "Found", before: 318, after: 320, change: +2, reason: "Mismatch resolved after recount", by: "Priya Sharma", date: "2024-07-18", status: "Approved" },
  { id: "ADJ-2024-439", sku: "SKU-001239", product: "Iodized Salt 1kg", type: "Cycle Count", before: 2810, after: 2800, change: -10, reason: "Cycle count variance", by: "Meena Patel", date: "2024-07-17", status: "Approved" },
  { id: "ADJ-2024-438", sku: "SKU-001236", product: "Refined Sunflower Oil 5L", type: "Write-off", before: 12, after: 8, change: -4, reason: "Breakage during putaway", by: "Suresh Yadav", date: "2024-07-16", status: "Pending" },
  { id: "ADJ-2024-437", sku: "SKU-001240", product: "Tomato Puree 400g", type: "Return", before: 150, after: 156, change: +6, reason: "Customer return processed", by: "Arjun Nair", date: "2024-07-15", status: "Approved" },
  { id: "ADJ-2024-436", sku: "SKU-001235", product: "Organic Wheat Flour 10kg", type: "Damage", before: 470, after: 462, change: -8, reason: "Torn sacks found in aisle", by: "Ravi Kumar", date: "2024-07-14", status: "Approved" },
  { id: "ADJ-2024-435", sku: "SKU-001234", product: "Premium Basmati Rice 5kg", type: "Cycle Count", before: 1268, after: 1260, change: -8, reason: "Cycle count variance in A-12-03", by: "Meena Patel", date: "2024-07-14", status: "Approved" },
  { id: "ADJ-2024-434", sku: "SKU-001238", product: "Brown Sugar 10kg", type: "Found", before: 84, after: 89, change: +5, reason: "Stock located behind pallet rack", by: "Priya Sharma", date: "2024-07-13", status: "Approved" },
  { id: "ADJ-2024-433", sku: "SKU-001236", product: "Refined Sunflower Oil 5L", type: "Return", before: 40, after: 43, change: +3, reason: "Customer return restocked", by: "Arjun Nair", date: "2024-07-13", status: "Approved" },
  { id: "ADJ-2024-432", sku: "SKU-001240", product: "Tomato Puree 400g", type: "Write-off", before: 168, after: 160, change: -8, reason: "Seal failure on retail packs", by: "Suresh Yadav", date: "2024-07-12", status: "Pending" },
  { id: "ADJ-2024-431", sku: "SKU-001237", product: "Chickpea Lentils 25kg", type: "Damage", before: 340, after: 331, change: -9, reason: "Forklift puncture during transfer", by: "Ravi Kumar", date: "2024-07-12", status: "Approved" },
  { id: "ADJ-2024-430", sku: "SKU-001239", product: "Iodized Salt 1kg", type: "Cycle Count", before: 2830, after: 2810, change: -20, reason: "Cycle count variance in A-04-11", by: "Meena Patel", date: "2024-07-11", status: "Approved" },
  { id: "ADJ-2024-429", sku: "SKU-001235", product: "Organic Wheat Flour 10kg", type: "Found", before: 455, after: 470, change: +15, reason: "Unscanned pallet added to system", by: "Priya Sharma", date: "2024-07-11", status: "Approved" },
  { id: "ADJ-2024-428", sku: "SKU-001234", product: "Premium Basmati Rice 5kg", type: "Return", before: 1240, after: 1252, change: +12, reason: "Short-shipped order returned", by: "Arjun Nair", date: "2024-07-10", status: "Approved" },
  { id: "ADJ-2024-427", sku: "SKU-001238", product: "Brown Sugar 10kg", type: "Write-off", before: 96, after: 84, change: -12, reason: "Moisture damage in B-08-02", by: "Suresh Yadav", date: "2024-07-10", status: "Approved" },
  { id: "ADJ-2024-426", sku: "SKU-001236", product: "Refined Sunflower Oil 5L", type: "Damage", before: 52, after: 46, change: -6, reason: "Leaking cans on inbound dock", by: "Ravi Kumar", date: "2024-07-09", status: "Pending" },
  { id: "ADJ-2024-425", sku: "SKU-001240", product: "Tomato Puree 400g", type: "Cycle Count", before: 176, after: 168, change: -8, reason: "Cycle count variance in D-01-05", by: "Meena Patel", date: "2024-07-09", status: "Approved" },
  { id: "ADJ-2024-424", sku: "SKU-001239", product: "Iodized Salt 1kg", type: "Found", before: 2795, after: 2830, change: +35, reason: "Overflow bin reconciled to master", by: "Suresh Yadav", date: "2024-07-08", status: "Approved" },
  { id: "ADJ-2024-423", sku: "SKU-001237", product: "Chickpea Lentils 25kg", type: "Return", before: 328, after: 340, change: +12, reason: "Bulk return accepted from client", by: "Priya Sharma", date: "2024-07-08", status: "Approved" },
  { id: "ADJ-2024-422", sku: "SKU-001234", product: "Premium Basmati Rice 5kg", type: "Damage", before: 1256, after: 1240, change: -16, reason: "Rodent damage in reserve stock", by: "Arjun Nair", date: "2024-07-07", status: "Approved" },
  { id: "ADJ-2024-421", sku: "SKU-001240", product: "Tomato Puree 400g", type: "Write-off", before: 182, after: 176, change: -6, reason: "Expired stock removed from pick face", by: "Meena Patel", date: "2024-07-06", status: "Pending" },
  { id: "ADJ-2024-420", sku: "SKU-001238", product: "Brown Sugar 10kg", type: "Cycle Count", before: 100, after: 96, change: -4, reason: "Cycle count variance in B-08-02", by: "Ravi Kumar", date: "2024-07-05", status: "Approved" },
  { id: "ADJ-2024-419", sku: "SKU-001236", product: "Refined Sunflower Oil 5L", type: "Found", before: 48, after: 52, change: +4, reason: "Misplaced cartons recovered", by: "Arjun Nair", date: "2024-07-04", status: "Approved" },
  { id: "ADJ-2024-418", sku: "SKU-001239", product: "Iodized Salt 1kg", type: "Return", before: 2780, after: 2795, change: +15, reason: "Retail return processed", by: "Priya Sharma", date: "2024-07-03", status: "Approved" },
  { id: "ADJ-2024-417", sku: "SKU-001237", product: "Chickpea Lentils 25kg", type: "Damage", before: 336, after: 328, change: -8, reason: "Split bags during palletisation", by: "Suresh Yadav", date: "2024-07-02", status: "Approved" },
]

const typeColor: Record<string, string> = {
  Damage: "bg-danger/10 text-danger",
  Found: "bg-success/10 text-success",
  "Cycle Count": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Write-off": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Return: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
}

const statusStyle: Record<string, string> = {
  Approved: "bg-success/10 text-success",
  Pending: "bg-amber-100 text-amber-700",
}

const ADJ_TYPES = ["Damage", "Found", "Cycle Count", "Write-off", "Return"] as const
const OPERATORS = ["Ravi Kumar", "Priya Sharma", "Suresh Yadav", "Meena Patel", "Arjun Nair"] as const

const emptyForm = { sku: "", product: "", type: "", before: "", after: "", reason: "", by: "" }

export default function StockAdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>(initialAdjustments)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [editTarget, setEditTarget] = useState<Adjustment | null>(null)
  const [editForm, setEditForm] = useState(emptyForm)
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Adjustment | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Adjustment | null>(null)

  const filtered = adjustments.filter(a =>
    (typeFilter === "All" || a.type === typeFilter) &&
    (a.id.toLowerCase().includes(search.toLowerCase()) || a.product.toLowerCase().includes(search.toLowerCase()) || a.sku.toLowerCase().includes(search.toLowerCase()))
  )

  const stats = [
    { label: "This Month", value: adjustments.length },
    { label: "Positive Adj.", value: adjustments.filter(a => a.change > 0).length, pos: true },
    { label: "Negative Adj.", value: adjustments.filter(a => a.change < 0).length, neg: true },
    { label: "Pending Approval", value: adjustments.filter(a => a.status === "Pending").length, warn: true },
  ]

  function validateForm(f: typeof emptyForm) {
    const e: Record<string, string> = {}
    if (!f.sku.trim()) e.sku = "SKU is required"
    if (!f.product.trim()) e.product = "Product name is required"
    if (!f.type) e.type = "Select an adjustment type"
    if (!f.before.trim()) e.before = "Before quantity is required"
    else if (!/^\d+$/.test(f.before)) e.before = "Enter a whole number of 0 or more"
    if (!f.after.trim()) e.after = "After quantity is required"
    else if (!/^\d+$/.test(f.after)) e.after = "Enter a whole number of 0 or more"
    else if (/^\d+$/.test(f.before) && Number(f.after) === Number(f.before)) e.after = "After must differ from before"
    if (!f.reason.trim()) e.reason = "Reason is required"
    if (!f.by) e.by = "Select an operator"
    return e
  }

  function createAdjustment() {
    const e = validateForm(form)
    setErrors(e)
    if (Object.keys(e).length) return
    const seq = 442 + adjustments.filter(a => a.id.startsWith("ADJ-2024-4")).length - 5
    const before = Number(form.before)
    const after = Number(form.after)
    const next: Adjustment = {
      id: `ADJ-2024-${seq}`,
      sku: form.sku.trim(),
      product: form.product.trim(),
      type: form.type,
      before,
      after,
      change: after - before,
      reason: form.reason.trim(),
      by: form.by,
      date: new Date().toISOString().slice(0, 10),
      status: "Pending",
    }
    setAdjustments(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Adjustment created", `${next.id} — ${next.change > 0 ? "+" : ""}${next.change} on ${next.sku}, pending approval.`)
  }

  function openEdit(a: Adjustment) {
    setEditTarget(a)
    setEditForm({
      sku: a.sku, product: a.product, type: a.type,
      before: String(a.before), after: String(a.after),
      reason: a.reason, by: a.by,
    })
    setEditErrors({})
  }

  function saveEdit() {
    if (!editTarget) return
    const e = validateForm(editForm)
    setEditErrors(e)
    if (Object.keys(e).length) return
    const before = Number(editForm.before)
    const after = Number(editForm.after)
    setAdjustments(prev => prev.map(x => x.id === editTarget.id ? {
      ...x,
      sku: editForm.sku.trim(),
      product: editForm.product.trim(),
      type: editForm.type,
      before,
      after,
      change: after - before,
      reason: editForm.reason.trim(),
      by: editForm.by,
    } : x))
    notify.success("Adjustment updated", `${editTarget.id} now records ${after - before > 0 ? "+" : ""}${after - before} units.`)
    setEditTarget(null)
    setEditErrors({})
  }

  function approveAdjustment(a: Adjustment) {
    setAdjustments(prev => prev.map(x => x.id === a.id ? { ...x, status: "Approved" } : x))
    notify.success("Adjustment approved", `${a.id} has been approved and posted.`)
  }

  function deleteAdjustment(a: Adjustment) {
    setAdjustments(prev => prev.filter(x => x.id !== a.id))
    notify.warning("Adjustment deleted", `${a.id} has been removed from the ledger.`)
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Stock Adjustments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manual quantity corrections and variance resolutions</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="stock-adjustments" />
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> New Adjustment</button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn("text-2xl font-bold mt-1", s.neg ? "text-danger" : s.pos ? "text-success" : s.warn ? "text-amber-600" : "text-foreground")}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search adjustment ID, SKU..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
        </div>
        {["All", "Damage", "Found", "Cycle Count", "Write-off", "Return"].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", typeFilter === t ? "bg-brand text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground")}>{t}</button>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>{["Adj. ID", "SKU / Product", "Type", "Before", "After", "Change", "Reason", "By", "Date", "Status", "Actions"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(a => (
              <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{a.id}</td>
                <td className="px-4 py-3"><p className="text-xs text-brand font-mono">{a.sku}</p><p className="text-xs text-foreground">{a.product}</p></td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", typeColor[a.type])}>{a.type}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{a.before}</td>
                <td className="px-4 py-3 text-foreground font-semibold">{a.after}</td>
                <td className="px-4 py-3 font-semibold"><span className={a.change > 0 ? "text-success" : "text-danger"}>{a.change > 0 ? "+" : ""}{a.change}</span></td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{a.reason}</td>
                <td className="px-4 py-3 text-foreground">{a.by}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.date}</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusStyle[a.status])}>{a.status}</span></td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: "View details", icon: <Eye />, onSelect: () => setDetail(a) },
                      ...(a.status === "Pending"
                        ? [
                            { label: "Approve adjustment", icon: <Check />, onSelect: () => approveAdjustment(a), tone: "success" as const },
                            { label: "Edit adjustment", icon: <Pencil />, onSelect: () => openEdit(a) },
                          ]
                        : []),
                      { label: "Delete adjustment", icon: <Trash2 />, onSelect: () => setDeleteTarget(a), tone: "danger" as const },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={11} className="px-4 py-10 text-center text-sm text-muted-foreground">No stock adjustments match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create adjustment */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="New Stock Adjustment"
        description="Record a manual quantity correction"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createAdjustment} submitLabel="Create Adjustment" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="SKU Code" required error={errors.sku}>
            <TextInput value={form.sku} invalid={!!errors.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. SKU-001234" />
          </Field>
          <Field label="Product Name" required error={errors.product}>
            <TextInput value={form.product} invalid={!!errors.product} onChange={e => setForm({ ...form, product: e.target.value })} placeholder="e.g. Premium Basmati Rice 5kg" />
          </Field>
          <Field label="Adjustment Type" required error={errors.type}>
            <Select value={form.type} invalid={!!errors.type} onChange={e => setForm({ ...form, type: e.target.value })} options={ADJ_TYPES} placeholder="Select Type" />
          </Field>
          <Field label="Recorded By" required error={errors.by}>
            <Select value={form.by} invalid={!!errors.by} onChange={e => setForm({ ...form, by: e.target.value })} options={OPERATORS} placeholder="Select Operator" />
          </Field>
          <Field label="Quantity Before" required error={errors.before}>
            <TextInput value={form.before} invalid={!!errors.before} onChange={e => setForm({ ...form, before: e.target.value })} placeholder="e.g. 1260" inputMode="numeric" />
          </Field>
          <Field label="Quantity After" required error={errors.after}>
            <TextInput value={form.after} invalid={!!errors.after} onChange={e => setForm({ ...form, after: e.target.value })} placeholder="e.g. 1250" inputMode="numeric" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Reason" required error={errors.reason}>
              <TextArea value={form.reason} invalid={!!errors.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="e.g. Packaging damage on receipt" />
            </Field>
          </div>
        </div>
      </Modal>

      {/* Edit adjustment */}
      <Modal
        open={!!editTarget}
        onOpenChange={(o) => { if (!o) { setEditTarget(null); setEditErrors({}) } }}
        title="Edit Stock Adjustment"
        description={editTarget?.id ?? ""}
        footer={<ModalActions onCancel={() => setEditTarget(null)} onSubmit={saveEdit} submitLabel="Save Changes" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="SKU Code" required error={editErrors.sku}>
            <TextInput value={editForm.sku} invalid={!!editErrors.sku} onChange={e => setEditForm({ ...editForm, sku: e.target.value })} placeholder="e.g. SKU-001234" />
          </Field>
          <Field label="Product Name" required error={editErrors.product}>
            <TextInput value={editForm.product} invalid={!!editErrors.product} onChange={e => setEditForm({ ...editForm, product: e.target.value })} placeholder="e.g. Premium Basmati Rice 5kg" />
          </Field>
          <Field label="Adjustment Type" required error={editErrors.type}>
            <Select value={editForm.type} invalid={!!editErrors.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })} options={ADJ_TYPES} placeholder="Select Type" />
          </Field>
          <Field label="Recorded By" required error={editErrors.by}>
            <Select value={editForm.by} invalid={!!editErrors.by} onChange={e => setEditForm({ ...editForm, by: e.target.value })} options={OPERATORS} placeholder="Select Operator" />
          </Field>
          <Field label="Quantity Before" required error={editErrors.before}>
            <TextInput value={editForm.before} invalid={!!editErrors.before} onChange={e => setEditForm({ ...editForm, before: e.target.value })} inputMode="numeric" />
          </Field>
          <Field label="Quantity After" required error={editErrors.after}>
            <TextInput value={editForm.after} invalid={!!editErrors.after} onChange={e => setEditForm({ ...editForm, after: e.target.value })} inputMode="numeric" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Reason" required error={editErrors.reason}>
              <TextArea value={editForm.reason} invalid={!!editErrors.reason} onChange={e => setEditForm({ ...editForm, reason: e.target.value })} />
            </Field>
          </div>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Stock adjustment detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Adjustment ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="SKU" value={<span className="font-mono">{detail.sku}</span>} />
            <DetailRow label="Product" value={detail.product} />
            <DetailRow label="Type" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", typeColor[detail.type])}>{detail.type}</span>} />
            <DetailRow label="Quantity Before" value={detail.before} />
            <DetailRow label="Quantity After" value={detail.after} />
            <DetailRow label="Change" value={<span className={detail.change > 0 ? "text-success" : "text-danger"}>{detail.change > 0 ? "+" : ""}{detail.change}</span>} />
            <DetailRow label="Reason" value={detail.reason} />
            <DetailRow label="Recorded By" value={detail.by} />
            <DetailRow label="Date" value={detail.date} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusStyle[detail.status])}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this adjustment?"
        message={`Adjustment ${deleteTarget?.id} (${(deleteTarget?.change ?? 0) > 0 ? "+" : ""}${deleteTarget?.change} on ${deleteTarget?.sku}) will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete Adjustment"
        cancelLabel="Keep It"
        onConfirm={() => deleteTarget && deleteAdjustment(deleteTarget)}
      />
    </div>
  )
}
