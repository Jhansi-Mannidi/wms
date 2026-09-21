"use client"
import { useState } from "react"
import { Search, Layers, AlertTriangle, Plus, Eye, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Batch = {
  id: string; sku: string; product: string; client: string; mfgDate: string
  expiry: string; qty: number; reserved: number; location: string; status: string
}

const initialBatches: Batch[] = [
  { id: "BAT-2024-1201", sku: "SKU-001234", product: "Premium Basmati Rice 5kg", client: "Acme Foods", mfgDate: "2024-01-10", expiry: "2025-06-15", qty: 1250, reserved: 50, location: "A-12-03", status: "Active" },
  { id: "BAT-2024-1198", sku: "SKU-001235", product: "Organic Wheat Flour 10kg", client: "Acme Foods", mfgDate: "2024-01-05", expiry: "2025-03-20", qty: 45, reserved: 10, location: "A-12-04", status: "Expiring Soon" },
  { id: "BAT-2024-1150", sku: "SKU-001236", product: "Refined Sunflower Oil 5L", client: "Global Oils", mfgDate: "2023-12-01", expiry: "2025-01-10", qty: 8, reserved: 5, location: "B-05-01", status: "Expired" },
  { id: "BAT-2024-1180", sku: "SKU-001237", product: "Chickpea Lentils 25kg", client: "Agro Corp", mfgDate: "2024-02-15", expiry: "2026-08-01", qty: 320, reserved: 0, location: "C-03-07", status: "Active" },
  { id: "BAT-2024-1100", sku: "SKU-001238", product: "Brown Sugar 10kg", client: "Sweet Mills", mfgDate: "2023-11-20", expiry: "2025-12-31", qty: 0, reserved: 0, location: "B-08-02", status: "Depleted" },
  { id: "BAT-2024-1265", sku: "SKU-001239", product: "Iodized Salt 1kg", client: "Salt Works", mfgDate: "2024-03-01", expiry: "2027-01-01", qty: 2800, reserved: 200, location: "A-04-11", status: "Active" },
  { id: "BAT-2024-1190", sku: "SKU-001240", product: "Tomato Puree 400g", client: "Fresh Farms", mfgDate: "2024-01-20", expiry: "2025-05-10", qty: 156, reserved: 30, location: "D-01-05", status: "Expiring Soon" },
  { id: "BAT-2024-1210", sku: "SKU-001235", product: "Organic Wheat Flour 10kg", client: "Acme Foods", mfgDate: "2024-02-01", expiry: "2026-02-01", qty: 640, reserved: 60, location: "A-13-02", status: "Active" },
  { id: "BAT-2024-1215", sku: "SKU-001234", product: "Premium Basmati Rice 5kg", client: "Acme Foods", mfgDate: "2024-02-10", expiry: "2026-04-12", qty: 980, reserved: 120, location: "A-12-05", status: "Active" },
  { id: "BAT-2024-1222", sku: "SKU-001236", product: "Refined Sunflower Oil 5L", client: "Global Oils", mfgDate: "2024-02-18", expiry: "2025-04-30", qty: 210, reserved: 40, location: "B-05-02", status: "Expiring Soon" },
  { id: "BAT-2024-1228", sku: "SKU-001238", product: "Brown Sugar 10kg", client: "Sweet Mills", mfgDate: "2024-03-05", expiry: "2026-09-15", qty: 540, reserved: 0, location: "B-08-04", status: "Active" },
  { id: "BAT-2024-1233", sku: "SKU-001240", product: "Tomato Puree 400g", client: "Fresh Farms", mfgDate: "2024-03-12", expiry: "2025-02-28", qty: 0, reserved: 0, location: "D-01-07", status: "Depleted" },
  { id: "BAT-2024-1240", sku: "SKU-001237", product: "Chickpea Lentils 25kg", client: "Agro Corp", mfgDate: "2024-03-20", expiry: "2026-10-05", qty: 415, reserved: 25, location: "C-03-09", status: "Active" },
  { id: "BAT-2024-1244", sku: "SKU-001239", product: "Iodized Salt 1kg", client: "Salt Works", mfgDate: "2024-04-02", expiry: "2027-03-15", qty: 3400, reserved: 250, location: "A-04-12", status: "Active" },
  { id: "BAT-2024-1250", sku: "SKU-001236", product: "Refined Sunflower Oil 5L", client: "Global Oils", mfgDate: "2023-10-15", expiry: "2024-12-20", qty: 14, reserved: 0, location: "B-05-06", status: "Expired" },
  { id: "BAT-2024-1256", sku: "SKU-001235", product: "Organic Wheat Flour 10kg", client: "Acme Foods", mfgDate: "2024-04-11", expiry: "2025-05-25", qty: 72, reserved: 12, location: "A-13-06", status: "Expiring Soon" },
  { id: "BAT-2024-1260", sku: "SKU-001234", product: "Premium Basmati Rice 5kg", client: "Acme Foods", mfgDate: "2024-04-25", expiry: "2026-06-30", qty: 1480, reserved: 180, location: "A-12-08", status: "Active" },
  { id: "BAT-2024-1272", sku: "SKU-001238", product: "Brown Sugar 10kg", client: "Sweet Mills", mfgDate: "2024-05-06", expiry: "2026-11-10", qty: 690, reserved: 45, location: "B-08-07", status: "Active" },
  { id: "BAT-2024-1278", sku: "SKU-001240", product: "Tomato Puree 400g", client: "Fresh Farms", mfgDate: "2024-05-14", expiry: "2025-06-05", qty: 240, reserved: 60, location: "D-01-09", status: "Expiring Soon" },
  { id: "BAT-2024-1284", sku: "SKU-001237", product: "Chickpea Lentils 25kg", client: "Agro Corp", mfgDate: "2023-09-08", expiry: "2024-11-30", qty: 26, reserved: 0, location: "C-03-12", status: "Expired" },
  { id: "BAT-2024-1290", sku: "SKU-001239", product: "Iodized Salt 1kg", client: "Salt Works", mfgDate: "2024-05-28", expiry: "2027-05-01", qty: 4200, reserved: 300, location: "A-04-15", status: "Active" },
  { id: "BAT-2024-1295", sku: "SKU-001236", product: "Refined Sunflower Oil 5L", client: "Global Oils", mfgDate: "2024-06-03", expiry: "2026-01-20", qty: 320, reserved: 35, location: "B-05-09", status: "Active" },
  { id: "BAT-2024-1302", sku: "SKU-001234", product: "Premium Basmati Rice 5kg", client: "Acme Foods", mfgDate: "2023-08-12", expiry: "2025-01-15", qty: 0, reserved: 0, location: "A-12-11", status: "Depleted" },
  { id: "BAT-2024-1308", sku: "SKU-001235", product: "Organic Wheat Flour 10kg", client: "Acme Foods", mfgDate: "2024-06-15", expiry: "2026-07-22", qty: 860, reserved: 90, location: "A-13-09", status: "Active" },
  { id: "BAT-2024-1315", sku: "SKU-001238", product: "Brown Sugar 10kg", client: "Sweet Mills", mfgDate: "2024-06-24", expiry: "2025-04-18", qty: 118, reserved: 20, location: "B-08-11", status: "Expiring Soon" },
  { id: "BAT-2024-1320", sku: "SKU-001237", product: "Chickpea Lentils 25kg", client: "Agro Corp", mfgDate: "2024-07-02", expiry: "2026-12-01", qty: 725, reserved: 55, location: "C-03-14", status: "Active" },
]

const statusColor: Record<string, string> = {
  Active: "bg-success/10 text-success",
  "Expiring Soon": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Expired: "bg-danger/10 text-danger",
  Depleted: "bg-muted text-muted-foreground",
}

const CLIENTS = ["Acme Foods", "Global Oils", "Agro Corp", "Sweet Mills", "Salt Works", "Fresh Farms"] as const

const emptyForm = { sku: "", product: "", client: "", mfgDate: "", expiry: "", qty: "", reserved: "", location: "" }
type BatchForm = typeof emptyForm

/** Batch status follows from remaining quantity and shelf life. */
function deriveStatus(qty: number, expiry: string) {
  if (qty <= 0) return "Depleted"
  const days = Math.floor((new Date(expiry).getTime() - Date.now()) / 86_400_000)
  if (days < 0) return "Expired"
  if (days <= 90) return "Expiring Soon"
  return "Active"
}

export default function BatchManagementPage() {
  const [batches, setBatches] = useState<Batch[]>(initialBatches)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Batch | null>(null)
  const [form, setForm] = useState<BatchForm>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Batch | null>(null)
  const [disposeTarget, setDisposeTarget] = useState<Batch | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Batch | null>(null)

  const filtered = batches.filter(b =>
    (statusFilter === "All" || b.status === statusFilter) &&
    (b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.product.toLowerCase().includes(search.toLowerCase()) ||
      b.sku.toLowerCase().includes(search.toLowerCase()))
  )

  const stats = [
    { label: "Total Batches", value: batches.length, sub: "across all SKUs" },
    { label: "Active", value: batches.filter(b => b.status === "Active").length, sub: "in good standing" },
    { label: "Expiring Soon", value: batches.filter(b => b.status === "Expiring Soon").length, sub: "within 90 days", warn: true },
    { label: "Expired", value: batches.filter(b => b.status === "Expired").length, sub: "require disposal", alert: true },
  ]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.sku.trim()) e.sku = "SKU is required"
    if (!form.product.trim()) e.product = "Product name is required"
    if (!form.client) e.client = "Select a client"
    if (!form.mfgDate) e.mfgDate = "Manufacture date is required"
    if (!form.expiry) e.expiry = "Expiry date is required"
    else if (form.mfgDate && form.expiry <= form.mfgDate) e.expiry = "Expiry must be after manufacture date"
    if (!form.qty.trim()) e.qty = "Quantity is required"
    else if (!/^\d+$/.test(form.qty)) e.qty = "Enter a whole number"
    if (!form.reserved.trim()) e.reserved = "Reserved is required"
    else if (!/^\d+$/.test(form.reserved)) e.reserved = "Enter a whole number"
    else if (/^\d+$/.test(form.qty) && Number(form.reserved) > Number(form.qty)) e.reserved = "Reserved cannot exceed quantity"
    if (!form.location.trim()) e.location = "Location is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function closeForms() {
    setCreateOpen(false)
    setEditTarget(null)
    setForm(emptyForm)
    setErrors({})
  }

  function createBatch() {
    if (!validate()) return
    const maxSeq = batches.reduce((m, b) => Math.max(m, Number(b.id.split("-")[2]) || 0), 0)
    const qty = Number(form.qty)
    const next: Batch = {
      id: `BAT-2024-${maxSeq + 1}`,
      sku: form.sku.trim(),
      product: form.product.trim(),
      client: form.client,
      mfgDate: form.mfgDate,
      expiry: form.expiry,
      qty,
      reserved: Number(form.reserved),
      location: form.location.trim().toUpperCase(),
      status: deriveStatus(qty, form.expiry),
    }
    setBatches(prev => [next, ...prev])
    closeForms()
    notify.success("Batch created", `${next.id} — ${next.qty.toLocaleString()} units at ${next.location}`)
  }

  function openEdit(b: Batch) {
    setEditTarget(b)
    setErrors({})
    setForm({
      sku: b.sku, product: b.product, client: b.client, mfgDate: b.mfgDate,
      expiry: b.expiry, qty: String(b.qty), reserved: String(b.reserved), location: b.location,
    })
  }

  function saveEdit() {
    if (!editTarget || !validate()) return
    const qty = Number(form.qty)
    const updated: Batch = {
      ...editTarget,
      sku: form.sku.trim(),
      product: form.product.trim(),
      client: form.client,
      mfgDate: form.mfgDate,
      expiry: form.expiry,
      qty,
      reserved: Number(form.reserved),
      location: form.location.trim().toUpperCase(),
      status: deriveStatus(qty, form.expiry),
    }
    setBatches(prev => prev.map(b => b.id === editTarget.id ? updated : b))
    closeForms()
    notify.success("Batch updated", `${updated.id} is now ${updated.status}.`)
  }

  function disposeBatch(b: Batch) {
    setBatches(prev => prev.map(x => x.id === b.id ? { ...x, qty: 0, reserved: 0, status: "Depleted" } : x))
    notify.warning("Batch disposed", `${b.id} written off — ${b.qty.toLocaleString()} units removed from stock.`)
  }

  function deleteBatch(b: Batch) {
    setBatches(prev => prev.filter(x => x.id !== b.id))
    notify.success("Batch deleted", `${b.id} has been removed.`)
  }

  const formFields = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="SKU Code" required error={errors.sku}>
        <TextInput value={form.sku} invalid={!!errors.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. SKU-001234" />
      </Field>
      <Field label="Product Name" required error={errors.product}>
        <TextInput value={form.product} invalid={!!errors.product} onChange={e => setForm({ ...form, product: e.target.value })} placeholder="e.g. Premium Basmati Rice 5kg" />
      </Field>
      <Field label="Client" required error={errors.client}>
        <Select value={form.client} invalid={!!errors.client} onChange={e => setForm({ ...form, client: e.target.value })} options={CLIENTS} placeholder="Select Client" />
      </Field>
      <Field label="Storage Location" required error={errors.location}>
        <TextInput value={form.location} invalid={!!errors.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. A-12-03" />
      </Field>
      <Field label="Manufacture Date" required error={errors.mfgDate}>
        <TextInput type="date" value={form.mfgDate} invalid={!!errors.mfgDate} onChange={e => setForm({ ...form, mfgDate: e.target.value })} />
      </Field>
      <Field label="Expiry Date" required error={errors.expiry}>
        <TextInput type="date" value={form.expiry} invalid={!!errors.expiry} onChange={e => setForm({ ...form, expiry: e.target.value })} />
      </Field>
      <Field label="Quantity" required error={errors.qty} hint="Status is derived from quantity and expiry">
        <TextInput value={form.qty} invalid={!!errors.qty} onChange={e => setForm({ ...form, qty: e.target.value })} placeholder="e.g. 1250" inputMode="numeric" />
      </Field>
      <Field label="Reserved" required error={errors.reserved}>
        <TextInput value={form.reserved} invalid={!!errors.reserved} onChange={e => setForm({ ...form, reserved: e.target.value })} placeholder="e.g. 50" inputMode="numeric" />
      </Field>
    </div>
  )

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Batch Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track inventory by batch and lot numbers</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="batches" />
          <button
            onClick={() => { setForm(emptyForm); setErrors({}); setCreateOpen(true) }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Batch
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn("text-2xl font-bold mt-1", s.alert ? "text-danger" : s.warn ? "text-amber-600" : "text-foreground")}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search batch ID, SKU, product..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
        </div>
        {["All", "Active", "Expiring Soon", "Expired", "Depleted"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", statusFilter === s ? "bg-brand text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground")}>{s}</button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              {["Batch ID", "SKU / Product", "Client", "Mfg Date", "Expiry", "Qty", "Reserved", "Location", "Status", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{b.id}</td>
                <td className="px-4 py-3"><p className="text-xs text-brand font-mono">{b.sku}</p><p className="text-foreground text-xs">{b.product}</p></td>
                <td className="px-4 py-3 text-muted-foreground">{b.client}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.mfgDate}</td>
                <td className="px-4 py-3 text-foreground">{b.expiry}</td>
                <td className="px-4 py-3 font-semibold text-foreground">{b.qty.toLocaleString()}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.reserved}</td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{b.location}</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusColor[b.status])}>{b.status}</span></td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: "View details", icon: <Eye />, onSelect: () => setDetail(b) },
                      { label: "Edit batch", icon: <Pencil />, onSelect: () => openEdit(b) },
                      ...(b.qty > 0 && (b.status === "Expired" || b.status === "Expiring Soon")
                        ? [{ label: "Dispose batch", icon: <AlertTriangle />, onSelect: () => setDisposeTarget(b), tone: "danger" as const }]
                        : []),
                      { label: "Delete batch", icon: <Trash2 />, onSelect: () => setDeleteTarget(b), tone: "danger" as const },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  <Layers className="w-5 h-5 mx-auto mb-2 opacity-50" />
                  No batches match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create batch */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { if (!o) closeForms(); else setCreateOpen(true) }}
        title="New Batch"
        description="Register a new batch or lot into inventory"
        footer={<ModalActions onCancel={closeForms} onSubmit={createBatch} submitLabel="Create Batch" />}
      >
        {formFields}
      </Modal>

      {/* Edit batch */}
      <Modal
        open={!!editTarget}
        onOpenChange={(o) => { if (!o) closeForms() }}
        title={`Edit ${editTarget?.id ?? ""}`}
        description="Update batch quantities, dates and location"
        footer={<ModalActions onCancel={closeForms} onSubmit={saveEdit} submitLabel="Save Changes" />}
      >
        {formFields}
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Batch detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Batch ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="SKU" value={<span className="font-mono">{detail.sku}</span>} />
            <DetailRow label="Product" value={detail.product} />
            <DetailRow label="Client" value={detail.client} />
            <DetailRow label="Manufactured" value={detail.mfgDate} />
            <DetailRow label="Expiry" value={detail.expiry} />
            <DetailRow label="Quantity" value={`${detail.qty.toLocaleString()} units`} />
            <DetailRow label="Reserved" value={`${detail.reserved.toLocaleString()} units`} />
            <DetailRow label="Available" value={`${(detail.qty - detail.reserved).toLocaleString()} units`} />
            <DetailRow label="Location" value={<span className="font-mono">{detail.location}</span>} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusColor[detail.status])}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Dispose confirmation */}
      <ConfirmDialog
        open={!!disposeTarget}
        onOpenChange={(o) => !o && setDisposeTarget(null)}
        title="Dispose this batch?"
        message={`All ${disposeTarget?.qty.toLocaleString()} units of ${disposeTarget?.id} will be written off and the batch marked Depleted. This cannot be undone.`}
        confirmLabel="Dispose Batch"
        cancelLabel="Keep It"
        onConfirm={() => disposeTarget && disposeBatch(disposeTarget)}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this batch?"
        message={`Batch ${deleteTarget?.id} (${deleteTarget?.product}) will be permanently removed from the register. This cannot be undone.`}
        confirmLabel="Delete Batch"
        onConfirm={() => deleteTarget && deleteBatch(deleteTarget)}
      />
    </div>
  )
}
