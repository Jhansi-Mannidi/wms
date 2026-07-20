"use client"
import { useState } from "react"
import { AlertTriangle, Plus, Eye, ArrowUpCircle, Check, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, TextArea, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type BreachedOrder = {
  id: string; client: string; items: number; qty: number; sla: string
  breachedBy: string; stage: string; reason: string; escalated: boolean; notes: string
}

const initialOrders: BreachedOrder[] = [
  { id: "ORD-8750", client: "Acme Foods", items: 5, qty: 100, sla: "2024-07-19 16:00", breachedBy: "18h 30m", stage: "Picking", reason: "Staff shortage", escalated: true, notes: "" },
  { id: "ORD-8742", client: "Global Oils", items: 3, qty: 60, sla: "2024-07-18 12:00", breachedBy: "44h 00m", stage: "Pending Allocation", reason: "Stock unavailable", escalated: true, notes: "" },
  { id: "ORD-8735", client: "Sweet Mills", items: 2, qty: 40, sla: "2024-07-19 18:00", breachedBy: "16h 00m", stage: "Packing", reason: "Equipment downtime", escalated: false, notes: "" },
]

const CLIENTS = ["Acme Foods", "Global Oils", "Sweet Mills", "Agro Corp", "Salt Works", "Fresh Farms"] as const
const STAGES = ["Pending Allocation", "Picking", "Packing", "QC Check", "Dispatch"] as const
const REASONS = ["Staff shortage", "Stock unavailable", "Equipment downtime", "Courier delay", "System outage"] as const

const emptyForm = { client: "", items: "", qty: "", sla: "", stage: "", reason: "", notes: "" }

/** Parse "18h 30m" into hours so the avg-breach stat derives from state. */
function breachHours(b: string) {
  const h = Number(/(\d+)\s*h/.exec(b)?.[1] ?? 0)
  const m = Number(/(\d+)\s*m/.exec(b)?.[1] ?? 0)
  return h + m / 60
}

export default function SLABreachedPage() {
  const [orders, setOrders] = useState<BreachedOrder[]>(initialOrders)
  const [search, setSearch] = useState("")

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<BreachedOrder | null>(null)
  const [resolveTarget, setResolveTarget] = useState<BreachedOrder | null>(null)

  const filtered = orders.filter(o => o.id.toLowerCase().includes(search.toLowerCase()) || o.client.toLowerCase().includes(search.toLowerCase()))

  const avgBreach = orders.length ? Math.round(orders.reduce((s, o) => s + breachHours(o.breachedBy), 0) / orders.length) : 0
  const stats = [
    { label: "Total Breached", value: String(orders.length), cls: "text-danger" },
    { label: "Escalated", value: String(orders.filter(o => o.escalated).length), cls: "text-amber-600" },
    { label: "Avg Breach Time", value: `${avgBreach}h` },
    { label: "MTD Breaches", value: String(orders.length + 5) },
  ]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.client) e.client = "Select a client"
    if (!form.items.trim()) e.items = "Line items is required"
    else if (!/^\d+$/.test(form.items) || Number(form.items) < 1) e.items = "Enter a positive whole number"
    if (!form.qty.trim()) e.qty = "Quantity is required"
    else if (!/^\d+$/.test(form.qty) || Number(form.qty) < 1) e.qty = "Enter a positive whole number"
    if (!form.sla.trim()) e.sla = "SLA deadline is required"
    else if (new Date(form.sla) > new Date()) e.sla = "A breach deadline must be in the past"
    if (!form.stage) e.stage = "Select the stuck stage"
    if (!form.reason) e.reason = "Select a root cause"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function logBreach() {
    if (!validate()) {
      notify.error("Check the form", "Some required fields need your attention.")
      return
    }
    const nums = orders.map(o => Number(o.id.split("-")[1])).filter(n => !Number.isNaN(n))
    const hours = Math.max(0, Math.round((Date.now() - new Date(form.sla).getTime()) / 3600000))
    const next: BreachedOrder = {
      id: `ORD-${Math.max(8750, ...nums) + 1}`,
      client: form.client,
      items: Number(form.items),
      qty: Number(form.qty),
      sla: `${form.sla} 18:00`,
      breachedBy: `${hours}h 00m`,
      stage: form.stage,
      reason: form.reason,
      escalated: false,
      notes: form.notes.trim(),
    }
    setOrders(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.warning("Breach logged", `${next.id} recorded as breached by ${next.breachedBy}.`)
  }

  function escalate(o: BreachedOrder) {
    if (o.escalated) {
      notify.info("Already escalated", `${o.id} is already with the escalation desk.`)
      return
    }
    setOrders(prev => prev.map(x => x.id === o.id ? { ...x, escalated: true } : x))
    notify.warning("Escalated", `${o.id} raised to the escalation desk.`)
  }

  function resolve(o: BreachedOrder) {
    setOrders(prev => prev.filter(x => x.id !== o.id))
    setDetail(null)
    notify.success("Breach resolved", `${o.id} cleared from the breach list.`)
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><AlertTriangle className="w-6 h-6 text-danger" />SLA Breached</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Orders that have exceeded their SLA deadline</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="sla-breached" />
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
            <Plus className="w-4 h-4" /> Log Breach
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn("text-2xl font-bold mt-1", s.cls || "text-foreground")}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order ID, client..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>{["Order ID", "Client", "Items", "Qty", "SLA Deadline", "Breached By", "Stage", "Reason", "Escalated", "Actions"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(o => (
              <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{o.id}</td>
                <td className="px-4 py-3 text-foreground">{o.client}</td>
                <td className="px-4 py-3 text-foreground">{o.items}</td>
                <td className="px-4 py-3 font-semibold">{o.qty}</td>
                <td className="px-4 py-3 text-danger font-medium">{o.sla}</td>
                <td className="px-4 py-3 font-semibold text-danger">{o.breachedBy}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.stage}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{o.reason}</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", o.escalated ? "bg-danger/10 text-danger" : "bg-muted text-muted-foreground")}>{o.escalated ? "Yes" : "No"}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setDetail(o)} title="View details" className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                    {!o.escalated && (
                      <button onClick={() => escalate(o)} title="Escalate" className="p-1.5 rounded-md text-warning hover:bg-warning/10 transition-colors"><ArrowUpCircle className="w-3.5 h-3.5" /></button>
                    )}
                    <button onClick={() => setResolveTarget(o)} title="Resolve breach" className="p-1.5 rounded-md text-success hover:bg-success/10 transition-colors"><Check className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-10 text-center text-sm text-muted-foreground">No SLA breaches match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Log breach */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="Log an SLA Breach"
        description="Record an order that has missed its deadline"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={logBreach} submitLabel="Log Breach" tone="danger" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Client" required error={errors.client}>
            <Select value={form.client} invalid={!!errors.client} onChange={e => setForm({ ...form, client: e.target.value })} options={CLIENTS} placeholder="Select Client" />
          </Field>
          <Field label="Stuck Stage" required error={errors.stage}>
            <Select value={form.stage} invalid={!!errors.stage} onChange={e => setForm({ ...form, stage: e.target.value })} options={STAGES} placeholder="Select Stage" />
          </Field>
          <Field label="Line Items" required error={errors.items}>
            <TextInput value={form.items} invalid={!!errors.items} onChange={e => setForm({ ...form, items: e.target.value })} placeholder="e.g. 5" inputMode="numeric" />
          </Field>
          <Field label="Quantity" required error={errors.qty}>
            <TextInput value={form.qty} invalid={!!errors.qty} onChange={e => setForm({ ...form, qty: e.target.value })} placeholder="e.g. 100" inputMode="numeric" />
          </Field>
          <Field label="Missed SLA Date" required error={errors.sla}>
            <TextInput type="date" value={form.sla} invalid={!!errors.sla} onChange={e => setForm({ ...form, sla: e.target.value })} />
          </Field>
          <Field label="Root Cause" required error={errors.reason}>
            <Select value={form.reason} invalid={!!errors.reason} onChange={e => setForm({ ...form, reason: e.target.value })} options={REASONS} placeholder="Select Root Cause" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes" hint="Optional context for the escalation desk">
              <TextArea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="What happened and what was tried..." />
            </Field>
          </div>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="SLA breach detail"
        footer={
          <>
            <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Close</button>
            <button onClick={() => detail && escalate(detail)} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">Escalate</button>
          </>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Order ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Client" value={detail.client} />
            <DetailRow label="Line Items" value={detail.items} />
            <DetailRow label="Quantity" value={`${detail.qty} units`} />
            <DetailRow label="SLA Deadline" value={<span className="text-danger">{detail.sla}</span>} />
            <DetailRow label="Breached By" value={<span className="text-danger font-semibold">{detail.breachedBy}</span>} />
            <DetailRow label="Stuck Stage" value={detail.stage} />
            <DetailRow label="Root Cause" value={detail.reason} />
            <DetailRow label="Escalated" value={detail.escalated ? "Yes" : "No"} />
            <DetailRow label="Notes" value={detail.notes || "—"} />
          </div>
        )}
      </Drawer>

      {/* Resolve confirmation */}
      <ConfirmDialog
        open={!!resolveTarget}
        onOpenChange={(o) => !o && setResolveTarget(null)}
        title="Resolve this breach?"
        message={`${resolveTarget?.id} will be cleared from the SLA breach list. This cannot be undone.`}
        confirmLabel="Resolve"
        cancelLabel="Keep Open"
        tone="brand"
        onConfirm={() => resolveTarget && resolve(resolveTarget)}
      />
    </div>
  )
}
