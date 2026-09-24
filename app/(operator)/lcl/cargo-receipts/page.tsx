"use client"
import { useState } from "react"
import { Plus, Search, Eye, Check, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"
import { EmptyState } from "@/components/wms/empty-state"
import { LCL_CARGO_RECEIPTS } from "@/lib/fixtures/lcl"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Receipt = {
  id: string; shipper: string; pieces: number; weight: string; cbm: string
  eta: string; status: string; lot: string
}

const initialReceipts: Receipt[] = LCL_CARGO_RECEIPTS

const STATUSES = ["Expected", "Partially Received", "Received"] as const
const FILTERS = ["All", "Expected", "Partially Received", "Received"] as const

const emptyForm = { shipper: "", pieces: "", weight: "", cbm: "", eta: "", status: "" }

function statusClass(status: string) {
  return status === "Received" ? "bg-success/10 text-success"
    : status === "Partially Received" ? "bg-amber-50 text-amber-600"
    : "bg-muted text-muted-foreground"
}

export default function LCLCargoReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>(initialReceipts)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<string>("All")

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Receipt | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Receipt | null>(null)

  const filtered = receipts.filter(r =>
    (filter === "All" || r.status === filter) &&
    (r.id.toLowerCase().includes(search.toLowerCase()) ||
     r.shipper.toLowerCase().includes(search.toLowerCase()) ||
     r.lot.toLowerCase().includes(search.toLowerCase()))
  )

  const stats = [
    { label: "Total Receipts", value: String(receipts.length) },
    { label: "Expected", value: String(receipts.filter(r => r.status === "Expected").length) },
    { label: "Received", value: String(receipts.filter(r => r.status === "Received").length) },
    { label: "Total CBM", value: receipts.reduce((s, r) => s + (parseFloat(r.cbm) || 0), 0).toFixed(1) },
  ]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.shipper.trim()) e.shipper = "Shipper is required"
    if (!form.pieces.trim()) e.pieces = "Pieces are required"
    else if (!/^\d+$/.test(form.pieces) || Number(form.pieces) < 1) e.pieces = "Enter a positive whole number"
    if (!form.weight.trim()) e.weight = "Weight is required"
    else if (!/^\d+(\.\d+)?$/.test(form.weight) || Number(form.weight) <= 0) e.weight = "Enter a positive number in kg"
    if (!form.cbm.trim()) e.cbm = "CBM is required"
    else if (!/^\d+(\.\d+)?$/.test(form.cbm) || Number(form.cbm) <= 0) e.cbm = "Enter a positive number"
    if (!form.eta.trim()) e.eta = "ETA is required"
    if (!form.status) e.status = "Select a status"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createReceipt() {
    if (!validate()) return
    const idNums = receipts.map(r => Number(r.id.replace("CR-", ""))).filter(n => !Number.isNaN(n))
    const lotNums = receipts.map(r => Number(r.lot.split("-").pop())).filter(n => !Number.isNaN(n))
    const next: Receipt = {
      id: `CR-${String((idNums.length ? Math.max(...idNums) : 0) + 1).padStart(3, "0")}`,
      shipper: form.shipper.trim(),
      pieces: Number(form.pieces),
      weight: `${Number(form.weight).toLocaleString()} kg`,
      cbm: Number(form.cbm).toFixed(1),
      eta: form.eta,
      status: form.status,
      lot: `LOT-2025-${String((lotNums.length ? Math.max(...lotNums) : 440) + 1).padStart(4, "0")}`,
    }
    setReceipts(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Cargo receipt created", `${next.id} — ${next.shipper}, ${next.cbm} CBM into ${next.lot}.`)
  }

  function markReceived(r: Receipt) {
    setReceipts(prev => prev.map(x => x.id === r.id ? { ...x, status: x.status === "Expected" ? "Partially Received" : "Received" } : x))
    notify.success("Receipt updated", `${r.id} moved to ${r.status === "Expected" ? "Partially Received" : "Received"}.`)
  }

  function deleteReceipt(r: Receipt) {
    setReceipts(prev => prev.filter(x => x.id !== r.id))
    notify.warning("Receipt deleted", `${r.id} (${r.lot}) was removed from the register.`)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Cargo Receipts</h1><p className="text-sm text-muted-foreground mt-1">Inbound cargo receipts and lot assignments</p></div>
        <div className="flex gap-2">
          <ExportButton data={filtered} filename="lcl-cargo-receipts" />
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> New Receipt</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search receipt, shipper, lot..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
        </div>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", filter === f ? "bg-brand text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground")}>{f}</button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border"><tr>{["Receipt ID","Shipper","Pieces","Weight","CBM","ETA","Lot","Status","Actions"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(r=>(
              <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{r.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{r.shipper}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.pieces}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.weight}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.cbm}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.eta}</td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{r.lot}</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusClass(r.status))}>{r.status}</span></td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: "View receipt details", icon: <Eye />, onSelect: () => setDetail(r) },
                      ...(r.status !== "Received"
                        ? [{ label: r.status === "Expected" ? "Mark partially received" : "Mark fully received", icon: <Check />, onSelect: () => markReceived(r), tone: "success" as const }]
                        : []),
                      { label: "Delete receipt", icon: <Trash2 />, onSelect: () => setDeleteTarget(r), tone: "danger" as const },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9}>
                <EmptyState
                  icon={Search}
                  title="No cargo receipts match your filters"
                  description="Try a different search term or clear the active filter."
                  action={{ label: "Clear Filters", onClick: () => { setSearch(""); setFilter("All") } }}
                />
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create receipt */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="New Cargo Receipt"
        description="Register an inbound cargo receipt and assign a lot"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createReceipt} submitLabel="Create Receipt" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Shipper" required error={errors.shipper}>
            <TextInput value={form.shipper} invalid={!!errors.shipper} onChange={e => setForm({ ...form, shipper: e.target.value })} placeholder="e.g. Global Exports Ltd" />
          </Field>
          <Field label="Pieces" required error={errors.pieces}>
            <TextInput value={form.pieces} invalid={!!errors.pieces} onChange={e => setForm({ ...form, pieces: e.target.value })} placeholder="e.g. 48" inputMode="numeric" />
          </Field>
          <Field label="Weight (kg)" required error={errors.weight}>
            <TextInput value={form.weight} invalid={!!errors.weight} onChange={e => setForm({ ...form, weight: e.target.value })} placeholder="e.g. 1240" inputMode="decimal" />
          </Field>
          <Field label="CBM" required error={errors.cbm}>
            <TextInput value={form.cbm} invalid={!!errors.cbm} onChange={e => setForm({ ...form, cbm: e.target.value })} placeholder="e.g. 8.4" inputMode="decimal" />
          </Field>
          <Field label="ETA" required error={errors.eta}>
            <TextInput type="date" value={form.eta} invalid={!!errors.eta} onChange={e => setForm({ ...form, eta: e.target.value })} />
          </Field>
          <Field label="Status" required error={errors.status}>
            <Select value={form.status} invalid={!!errors.status} onChange={e => setForm({ ...form, status: e.target.value })} options={STATUSES} placeholder="Select Status" />
          </Field>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Cargo receipt detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Receipt ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Shipper" value={detail.shipper} />
            <DetailRow label="Pieces" value={`${detail.pieces}`} />
            <DetailRow label="Weight" value={detail.weight} />
            <DetailRow label="Volume" value={`${detail.cbm} CBM`} />
            <DetailRow label="ETA" value={detail.eta} />
            <DetailRow label="Lot" value={<span className="font-mono">{detail.lot}</span>} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusClass(detail.status))}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this cargo receipt?"
        message={`${deleteTarget?.id} for ${deleteTarget?.shipper} (${deleteTarget?.pieces} pcs) will be removed from the register. This cannot be undone.`}
        confirmLabel="Delete Receipt"
        cancelLabel="Keep It"
        onConfirm={() => deleteTarget && deleteReceipt(deleteTarget)}
      />
    </div>
  )
}
