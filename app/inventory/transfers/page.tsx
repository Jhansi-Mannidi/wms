"use client"
import { useState } from "react"
import { Search, Plus, ArrowLeftRight, Eye, Check, X as XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Transfer = {
  id: string; sku: string; product: string; from: string; to: string
  qty: number; reason: string; by: string; date: string; status: string
}

const initialTransfers: Transfer[] = [
  { id: "TO-2024-0501", sku: "SKU-001234", product: "Premium Basmati Rice 5kg", from: "A-12-03", to: "B-04-01", qty: 100, reason: "Rebalance", by: "Ravi Kumar", date: "2024-07-20 10:00", status: "Pending" },
  { id: "TO-2024-0500", sku: "SKU-001239", product: "Iodized Salt 1kg", from: "A-04-11", to: "A-04-12", qty: 500, reason: "Zone consolidation", by: "Priya Sharma", date: "2024-07-19 14:30", status: "Completed" },
  { id: "TO-2024-0499", sku: "SKU-001237", product: "Chickpea Lentils 25kg", from: "C-03-07", to: "C-03-08", qty: 50, reason: "Pick face replenishment", by: "Suresh Yadav", date: "2024-07-19 09:00", status: "Completed" },
  { id: "TO-2024-0498", sku: "SKU-001240", product: "Tomato Puree 400g", from: "D-01-05", to: "D-01-06", qty: 30, reason: "FEFO rotation", by: "Meena Patel", date: "2024-07-18 16:15", status: "In Progress" },
  { id: "TO-2024-0497", sku: "SKU-001236", product: "Refined Sunflower Oil 5L", from: "B-05-01", to: "B-05-02", qty: 8, reason: "Damage segregation", by: "Arjun Nair", date: "2024-07-17 11:45", status: "Completed" },
  { id: "TO-2024-0496", sku: "SKU-001234", product: "Premium Basmati Rice 5kg", from: "A-12-04", to: "A-11-02", qty: 120, reason: "Pick face replenishment", by: "Ravi Kumar", date: "2024-07-17 08:20", status: "Completed" },
  { id: "TO-2024-0495", sku: "SKU-001238", product: "Brown Sugar 10kg", from: "C-01-02", to: "C-02-09", qty: 60, reason: "Rebalance", by: "Priya Sharma", date: "2024-07-16 15:10", status: "Pending" },
  { id: "TO-2024-0494", sku: "SKU-001235", product: "Organic Wheat Flour 10kg", from: "B-02-06", to: "B-02-07", qty: 75, reason: "Zone consolidation", by: "Suresh Yadav", date: "2024-07-16 12:40", status: "Completed" },
  { id: "TO-2024-0493", sku: "SKU-001240", product: "Tomato Puree 400g", from: "D-01-08", to: "D-02-01", qty: 144, reason: "FEFO rotation", by: "Meena Patel", date: "2024-07-16 09:25", status: "In Progress" },
  { id: "TO-2024-0492", sku: "SKU-001239", product: "Iodized Salt 1kg", from: "A-04-09", to: "A-05-03", qty: 320, reason: "Rebalance", by: "Arjun Nair", date: "2024-07-15 16:50", status: "Completed" },
  { id: "TO-2024-0491", sku: "SKU-001237", product: "Chickpea Lentils 25kg", from: "C-03-05", to: "C-04-01", qty: 40, reason: "Zone consolidation", by: "Ravi Kumar", date: "2024-07-15 11:05", status: "Cancelled" },
  { id: "TO-2024-0490", sku: "SKU-001236", product: "Refined Sunflower Oil 5L", from: "B-05-04", to: "B-06-02", qty: 24, reason: "Pick face replenishment", by: "Priya Sharma", date: "2024-07-15 07:55", status: "Completed" },
  { id: "TO-2024-0489", sku: "SKU-001234", product: "Premium Basmati Rice 5kg", from: "A-12-01", to: "B-01-04", qty: 90, reason: "Rebalance", by: "Suresh Yadav", date: "2024-07-14 14:15", status: "Completed" },
  { id: "TO-2024-0488", sku: "SKU-001238", product: "Brown Sugar 10kg", from: "C-02-03", to: "C-02-04", qty: 35, reason: "Damage segregation", by: "Meena Patel", date: "2024-07-14 10:30", status: "Pending" },
  { id: "TO-2024-0487", sku: "SKU-001240", product: "Tomato Puree 400g", from: "D-02-05", to: "D-03-02", qty: 96, reason: "FEFO rotation", by: "Arjun Nair", date: "2024-07-13 17:20", status: "Completed" },
  { id: "TO-2024-0486", sku: "SKU-001235", product: "Organic Wheat Flour 10kg", from: "B-03-01", to: "B-03-05", qty: 50, reason: "Pick face replenishment", by: "Ravi Kumar", date: "2024-07-13 09:45", status: "In Progress" },
  { id: "TO-2024-0485", sku: "SKU-001239", product: "Iodized Salt 1kg", from: "A-04-06", to: "A-04-07", qty: 400, reason: "Zone consolidation", by: "Priya Sharma", date: "2024-07-12 15:35", status: "Completed" },
  { id: "TO-2024-0484", sku: "SKU-001237", product: "Chickpea Lentils 25kg", from: "C-03-02", to: "C-03-09", qty: 28, reason: "Rebalance", by: "Suresh Yadav", date: "2024-07-12 11:00", status: "Cancelled" },
  { id: "TO-2024-0483", sku: "SKU-001236", product: "Refined Sunflower Oil 5L", from: "B-05-06", to: "B-05-07", qty: 12, reason: "Damage segregation", by: "Meena Patel", date: "2024-07-11 16:05", status: "Completed" },
  { id: "TO-2024-0482", sku: "SKU-001234", product: "Premium Basmati Rice 5kg", from: "A-11-05", to: "A-12-06", qty: 150, reason: "Pick face replenishment", by: "Arjun Nair", date: "2024-07-11 08:10", status: "Completed" },
  { id: "TO-2024-0481", sku: "SKU-001238", product: "Brown Sugar 10kg", from: "C-01-07", to: "C-01-08", qty: 45, reason: "FEFO rotation", by: "Ravi Kumar", date: "2024-07-10 14:50", status: "Pending" },
  { id: "TO-2024-0480", sku: "SKU-001240", product: "Tomato Puree 400g", from: "D-01-02", to: "D-01-09", qty: 72, reason: "Zone consolidation", by: "Priya Sharma", date: "2024-07-10 10:15", status: "Completed" },
  { id: "TO-2024-0479", sku: "SKU-001235", product: "Organic Wheat Flour 10kg", from: "B-02-02", to: "B-04-03", qty: 65, reason: "Rebalance", by: "Suresh Yadav", date: "2024-07-09 15:25", status: "Cancelled" },
  { id: "TO-2024-0478", sku: "SKU-001239", product: "Iodized Salt 1kg", from: "A-05-01", to: "A-05-02", qty: 250, reason: "Pick face replenishment", by: "Meena Patel", date: "2024-07-09 09:40", status: "Completed" },
  { id: "TO-2024-0477", sku: "SKU-001237", product: "Chickpea Lentils 25kg", from: "C-04-04", to: "C-04-05", qty: 32, reason: "FEFO rotation", by: "Arjun Nair", date: "2024-07-08 13:30", status: "In Progress" },
  { id: "TO-2024-0476", sku: "SKU-001236", product: "Refined Sunflower Oil 5L", from: "B-06-01", to: "B-06-05", qty: 18, reason: "Rebalance", by: "Ravi Kumar", date: "2024-07-08 07:50", status: "Completed" },
  { id: "TO-2024-0475", sku: "SKU-001234", product: "Premium Basmati Rice 5kg", from: "A-12-08", to: "B-01-01", qty: 110, reason: "Zone consolidation", by: "Priya Sharma", date: "2024-07-05 16:40", status: "Pending" },
  { id: "TO-2024-0474", sku: "SKU-001238", product: "Brown Sugar 10kg", from: "C-02-06", to: "C-03-01", qty: 55, reason: "Damage segregation", by: "Suresh Yadav", date: "2024-07-05 11:20", status: "Cancelled" },
]

const statusStyle: Record<string, string> = {
  Pending: "bg-muted text-muted-foreground",
  "In Progress": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Completed: "bg-success/10 text-success",
  Cancelled: "bg-danger/10 text-danger",
}

const REASONS = ["Rebalance", "Zone consolidation", "Pick face replenishment", "FEFO rotation", "Damage segregation"] as const
const OPERATORS = ["Ravi Kumar", "Priya Sharma", "Suresh Yadav", "Meena Patel", "Arjun Nair"] as const

const emptyForm = { sku: "", product: "", from: "", to: "", qty: "", reason: "", by: "" }

export default function TransferOrdersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>(initialTransfers)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Transfer | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Transfer | null>(null)

  const filtered = transfers.filter(t =>
    (statusFilter === "All" || t.status === statusFilter) &&
    (t.id.toLowerCase().includes(search.toLowerCase()) || t.product.toLowerCase().includes(search.toLowerCase()))
  )

  const stats = [
    { label: "Open Transfers", value: transfers.filter(t => t.status === "Pending").length },
    { label: "In Progress", value: transfers.filter(t => t.status === "In Progress").length },
    { label: "Completed Today", value: transfers.filter(t => t.status === "Completed").length },
    { label: "Total This Month", value: transfers.length },
  ]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.sku.trim()) e.sku = "SKU is required"
    if (!form.product.trim()) e.product = "Product name is required"
    if (!form.from.trim()) e.from = "Source location is required"
    if (!form.to.trim()) e.to = "Destination is required"
    else if (form.to.trim() === form.from.trim()) e.to = "Destination must differ from source"
    if (!form.qty.trim()) e.qty = "Quantity is required"
    else if (!/^\d+$/.test(form.qty) || Number(form.qty) < 1) e.qty = "Enter a positive whole number"
    if (!form.reason) e.reason = "Select a reason"
    if (!form.by) e.by = "Select an operator"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createTransfer() {
    if (!validate()) return
    const seq = 502 + transfers.filter(t => t.id.startsWith("TO-2024-05")).length - 1
    const now = new Date()
    const next: Transfer = {
      id: `TO-2024-0${seq}`,
      sku: form.sku.trim(),
      product: form.product.trim(),
      from: form.from.trim().toUpperCase(),
      to: form.to.trim().toUpperCase(),
      qty: Number(form.qty),
      reason: form.reason,
      by: form.by,
      date: `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`,
      status: "Pending",
    }
    setTransfers(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Transfer created", `${next.id} — ${next.qty} units ${next.from} → ${next.to}`)
  }

  function advance(t: Transfer) {
    const nextStatus = t.status === "Pending" ? "In Progress" : "Completed"
    setTransfers(prev => prev.map(x => x.id === t.id ? { ...x, status: nextStatus } : x))
    notify.success(`Transfer ${nextStatus.toLowerCase()}`, `${t.id} moved to ${nextStatus}.`)
  }

  function cancelTransfer(t: Transfer) {
    setTransfers(prev => prev.map(x => x.id === t.id ? { ...x, status: "Cancelled" } : x))
    notify.warning("Transfer cancelled", `${t.id} has been cancelled.`)
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transfer Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Internal bin-to-bin and zone-to-zone transfers</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="transfer-orders" />
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Transfer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transfer ID, product..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
        </div>
        {["All", "Pending", "In Progress", "Completed", "Cancelled"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", statusFilter === s ? "bg-brand text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground")}>{s}</button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>{["Transfer ID", "Product", "From", "", "To", "Qty", "Reason", "By", "Date", "Status", "Actions"].map((h, i) => <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(t => (
              <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{t.id}</td>
                <td className="px-4 py-3"><p className="text-xs text-brand font-mono">{t.sku}</p><p className="text-xs text-foreground">{t.product}</p></td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{t.from}</td>
                <td className="px-4 py-3 text-muted-foreground"><ArrowLeftRight className="w-3.5 h-3.5" /></td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{t.to}</td>
                <td className="px-4 py-3 font-semibold text-foreground">{t.qty}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{t.reason}</td>
                <td className="px-4 py-3 text-foreground">{t.by}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.date}</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusStyle[t.status])}>{t.status}</span></td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: "View details", icon: <Eye />, onSelect: () => setDetail(t) },
                      ...(t.status === "Pending" || t.status === "In Progress"
                        ? [
                            { label: t.status === "Pending" ? "Start transfer" : "Complete transfer", icon: <Check />, onSelect: () => advance(t), tone: "success" as const },
                            { label: "Cancel transfer", icon: <XIcon />, onSelect: () => setCancelTarget(t), tone: "danger" as const },
                          ]
                        : []),
                    ]}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={11} className="px-4 py-10 text-center text-sm text-muted-foreground">No transfer orders match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create transfer */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="New Transfer Order"
        description="Move stock between bins or zones"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createTransfer} submitLabel="Create Transfer" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="SKU Code" required error={errors.sku}>
            <TextInput value={form.sku} invalid={!!errors.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. SKU-001234" />
          </Field>
          <Field label="Product Name" required error={errors.product}>
            <TextInput value={form.product} invalid={!!errors.product} onChange={e => setForm({ ...form, product: e.target.value })} placeholder="e.g. Premium Basmati Rice 5kg" />
          </Field>
          <Field label="From Location" required error={errors.from}>
            <TextInput value={form.from} invalid={!!errors.from} onChange={e => setForm({ ...form, from: e.target.value })} placeholder="e.g. A-12-03" />
          </Field>
          <Field label="To Location" required error={errors.to}>
            <TextInput value={form.to} invalid={!!errors.to} onChange={e => setForm({ ...form, to: e.target.value })} placeholder="e.g. B-04-01" />
          </Field>
          <Field label="Quantity" required error={errors.qty}>
            <TextInput value={form.qty} invalid={!!errors.qty} onChange={e => setForm({ ...form, qty: e.target.value })} placeholder="e.g. 100" inputMode="numeric" />
          </Field>
          <Field label="Reason" required error={errors.reason}>
            <Select value={form.reason} invalid={!!errors.reason} onChange={e => setForm({ ...form, reason: e.target.value })} options={REASONS} placeholder="Select Reason" />
          </Field>
          <Field label="Assigned To" required error={errors.by}>
            <Select value={form.by} invalid={!!errors.by} onChange={e => setForm({ ...form, by: e.target.value })} options={OPERATORS} placeholder="Select Operator" />
          </Field>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Transfer order detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Transfer ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="SKU" value={<span className="font-mono">{detail.sku}</span>} />
            <DetailRow label="Product" value={detail.product} />
            <DetailRow label="From" value={<span className="font-mono">{detail.from}</span>} />
            <DetailRow label="To" value={<span className="font-mono">{detail.to}</span>} />
            <DetailRow label="Quantity" value={`${detail.qty} units`} />
            <DetailRow label="Reason" value={detail.reason} />
            <DetailRow label="Assigned To" value={detail.by} />
            <DetailRow label="Created" value={detail.date} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusStyle[detail.status])}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Cancel confirmation */}
      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(o) => !o && setCancelTarget(null)}
        title="Cancel this transfer?"
        message={`Transfer ${cancelTarget?.id} for ${cancelTarget?.qty} units will be cancelled. This cannot be undone.`}
        confirmLabel="Cancel Transfer"
        cancelLabel="Keep It"
        onConfirm={() => cancelTarget && cancelTransfer(cancelTarget)}
      />
    </div>
  )
}
