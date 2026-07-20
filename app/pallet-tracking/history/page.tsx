"use client"
import { useState } from "react"
import { ArrowRight, Plus, Eye, Trash2, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Movement = {
  id: string; pallet: string; from: string; to: string; by: string; at: string; reason: string
}

const initialMovements: Movement[] = [
  { id:"MV-001",pallet:"PLT-0012",from:"Receiving Bay",to:"A-12-L2",by:"Suresh Yadav",at:"2025-07-19 09:14",reason:"Put-away"},
  { id:"MV-002",pallet:"PLT-0013",from:"A-05-L1",to:"Dispatch Bay",by:"Arjun Nair",at:"2025-07-19 10:32",reason:"Order Pick"},
  { id:"MV-003",pallet:"PLT-0014",from:"Receiving Bay",to:"A-08-L3",by:"Suresh Yadav",at:"2025-07-19 11:05",reason:"Put-away"},
  { id:"MV-004",pallet:"PLT-0015",from:"C-02-L1",to:"C-02-L2",by:"Ravi Kumar",at:"2025-07-18 15:20",reason:"Reorganisation"},
  { id:"MV-005",pallet:"PLT-0016",from:"Dispatch Bay",to:"MH-02-CX-7734",by:"Gate System",at:"2025-07-18 16:45",reason:"Outbound"},
]

const REASONS = ["Put-away", "Order Pick", "Reorganisation", "Outbound"] as const
const OPERATORS = ["Suresh Yadav", "Arjun Nair", "Ravi Kumar", "Meena Patel", "Gate System"] as const

const emptyForm = { pallet: "", from: "", to: "", by: "", reason: "" }

export default function PalletHistoryPage() {
  const [movements, setMovements] = useState<Movement[]>(initialMovements)
  const [search, setSearch] = useState("")
  const [reasonFilter, setReasonFilter] = useState("All")

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Movement | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Movement | null>(null)

  const filtered = movements.filter(m => {
    const q = search.toLowerCase()
    return (reasonFilter === "All" || m.reason === reasonFilter) &&
      (m.id.toLowerCase().includes(q) || m.pallet.toLowerCase().includes(q) ||
       m.from.toLowerCase().includes(q) || m.to.toLowerCase().includes(q) || m.by.toLowerCase().includes(q))
  })

  function validate() {
    const e: Record<string, string> = {}
    if (!form.pallet.trim()) e.pallet = "Pallet ID is required"
    else if (!/^PLT-\d{4}$/.test(form.pallet.trim().toUpperCase())) e.pallet = "Use format PLT-0012"
    if (!form.from.trim()) e.from = "Source location is required"
    if (!form.to.trim()) e.to = "Destination is required"
    else if (form.to.trim().toLowerCase() === form.from.trim().toLowerCase()) e.to = "Destination must differ from source"
    if (!form.by) e.by = "Select an operator"
    if (!form.reason) e.reason = "Select a reason"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function logMovement() {
    if (!validate()) return
    const seq = String(movements.length + 1).padStart(3, "0")
    const now = new Date()
    const next: Movement = {
      id: `MV-${seq}`,
      pallet: form.pallet.trim().toUpperCase(),
      from: form.from.trim(),
      to: form.to.trim(),
      by: form.by,
      at: `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`,
      reason: form.reason,
    }
    setMovements(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Movement logged", `${next.id} — ${next.pallet} ${next.from} → ${next.to}`)
  }

  function remove(m: Movement) {
    setMovements(prev => prev.filter(x => x.id !== m.id))
    notify.warning("Movement voided", `${m.id} has been removed from the movement log.`)
  }

  const stats = [
    { label: "Total Moves", value: movements.length },
    { label: "Put-aways", value: movements.filter(m => m.reason === "Put-away").length },
    { label: "Order Picks", value: movements.filter(m => m.reason === "Order Pick").length },
    { label: "Outbound", value: movements.filter(m => m.reason === "Outbound").length },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Movement History</h1><p className="text-sm text-muted-foreground mt-1">Full audit trail of pallet movements and relocations</p></div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="pallet-movement-history" />
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
            <Plus className="w-4 h-4" /> Log Movement
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search move ID, pallet, location..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
        </div>
        {["All", ...REASONS].map(r => (
          <button key={r} onClick={() => setReasonFilter(r)} title={`Filter by ${r}`} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", reasonFilter === r ? "bg-brand text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground")}>{r}</button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["Move ID","Pallet","From","","To","Moved By","Date/Time","Reason","Actions"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(m=>(
              <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <button onClick={() => setDetail(m)} title={`View ${m.id}`} className="font-mono text-xs text-brand hover:underline">{m.id}</button>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{m.pallet}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{m.from}</td>
                <td className="px-1 py-3 text-muted-foreground"><ArrowRight className="w-3.5 h-3.5" /></td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{m.to}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.by}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{m.at}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">{m.reason}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setDetail(m)} title="View details" className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDeleteTarget(m)} title="Void movement" className="p-1.5 rounded-md text-muted-foreground hover:bg-danger/10 hover:text-danger transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">No movements match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Log movement */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="Log Pallet Movement"
        description="Record a manual pallet relocation into the movement history"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={logMovement} submitLabel="Log Movement" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Pallet ID" required error={errors.pallet}>
            <TextInput value={form.pallet} invalid={!!errors.pallet} onChange={e => setForm({ ...form, pallet: e.target.value })} placeholder="e.g. PLT-0012" />
          </Field>
          <Field label="Reason" required error={errors.reason}>
            <Select value={form.reason} invalid={!!errors.reason} onChange={e => setForm({ ...form, reason: e.target.value })} options={REASONS} placeholder="Select Reason" />
          </Field>
          <Field label="From Location" required error={errors.from}>
            <TextInput value={form.from} invalid={!!errors.from} onChange={e => setForm({ ...form, from: e.target.value })} placeholder="e.g. Receiving Bay" />
          </Field>
          <Field label="To Location" required error={errors.to}>
            <TextInput value={form.to} invalid={!!errors.to} onChange={e => setForm({ ...form, to: e.target.value })} placeholder="e.g. A-12-L2" />
          </Field>
          <Field label="Moved By" required error={errors.by}>
            <Select value={form.by} invalid={!!errors.by} onChange={e => setForm({ ...form, by: e.target.value })} options={OPERATORS} placeholder="Select Operator" />
          </Field>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Pallet movement detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Move ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Pallet" value={<span className="font-mono">{detail.pallet}</span>} />
            <DetailRow label="From" value={detail.from} />
            <DetailRow label="To" value={detail.to} />
            <DetailRow label="Moved By" value={detail.by} />
            <DetailRow label="Date/Time" value={detail.at} />
            <DetailRow label="Reason" value={<span className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">{detail.reason}</span>} />
          </div>
        )}
      </Drawer>

      {/* Void confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Void this movement?"
        message={`Movement ${deleteTarget?.id} for pallet ${deleteTarget?.pallet} will be removed from the audit history. This cannot be undone.`}
        confirmLabel="Void Movement"
        cancelLabel="Keep It"
        onConfirm={() => deleteTarget && remove(deleteTarget)}
      />
    </div>
  )
}
