"use client"
import { useState } from "react"
import { AlertTriangle, Plus, Eye, ArrowUpCircle, Check, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, TextArea, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type BreachedOrder = {
  id: string; client: string; items: number; qty: number; sla: string
  breachedBy: string; stage: string; reason: string; escalated: boolean; notes: string
}

const initialOrders: BreachedOrder[] = [
  { id: "ORD-8750", client: "Acme Foods", items: 5, qty: 100, sla: "2024-07-19 16:00", breachedBy: "18h 30m", stage: "Picking", reason: "Staff shortage", escalated: true, notes: "" },
  { id: "ORD-8742", client: "Global Oils", items: 3, qty: 60, sla: "2024-07-18 12:00", breachedBy: "44h 00m", stage: "Pending Allocation", reason: "Stock unavailable", escalated: true, notes: "" },
  { id: "ORD-8735", client: "Sweet Mills", items: 2, qty: 40, sla: "2024-07-19 18:00", breachedBy: "16h 00m", stage: "Packing", reason: "Equipment downtime", escalated: false, notes: "" },
  { id: "ORD-8733", client: "Agro Corp", items: 7, qty: 180, sla: "2024-07-19 14:00", breachedBy: "20h 15m", stage: "QC Check", reason: "Courier delay", escalated: true, notes: "Courier rescheduled pickup to next slot." },
  { id: "ORD-8731", client: "Salt Works", items: 4, qty: 250, sla: "2024-07-19 12:30", breachedBy: "21h 45m", stage: "Dispatch", reason: "System outage", escalated: false, notes: "" },
  { id: "ORD-8728", client: "Fresh Farms", items: 3, qty: 72, sla: "2024-07-19 10:00", breachedBy: "24h 30m", stage: "Picking", reason: "Staff shortage", escalated: true, notes: "" },
  { id: "ORD-8726", client: "Acme Foods", items: 6, qty: 145, sla: "2024-07-19 08:00", breachedBy: "26h 00m", stage: "Pending Allocation", reason: "Stock unavailable", escalated: false, notes: "" },
  { id: "ORD-8724", client: "Global Oils", items: 2, qty: 48, sla: "2024-07-18 22:00", breachedBy: "28h 20m", stage: "Packing", reason: "Equipment downtime", escalated: false, notes: "Sealing machine down since morning shift." },
  { id: "ORD-8721", client: "Sweet Mills", items: 9, qty: 220, sla: "2024-07-18 20:00", breachedBy: "30h 10m", stage: "QC Check", reason: "Courier delay", escalated: true, notes: "" },
  { id: "ORD-8719", client: "Agro Corp", items: 5, qty: 130, sla: "2024-07-18 18:00", breachedBy: "32h 00m", stage: "Dispatch", reason: "System outage", escalated: false, notes: "" },
  { id: "ORD-8717", client: "Salt Works", items: 1, qty: 300, sla: "2024-07-18 16:00", breachedBy: "34h 25m", stage: "Picking", reason: "Staff shortage", escalated: true, notes: "" },
  { id: "ORD-8714", client: "Fresh Farms", items: 8, qty: 195, sla: "2024-07-18 14:00", breachedBy: "36h 15m", stage: "Pending Allocation", reason: "Stock unavailable", escalated: false, notes: "Replenishment PO raised with supplier." },
  { id: "ORD-8712", client: "Acme Foods", items: 3, qty: 66, sla: "2024-07-18 12:00", breachedBy: "38h 40m", stage: "Packing", reason: "Equipment downtime", escalated: false, notes: "" },
  { id: "ORD-8710", client: "Global Oils", items: 6, qty: 155, sla: "2024-07-18 10:00", breachedBy: "40h 05m", stage: "QC Check", reason: "Courier delay", escalated: true, notes: "" },
  { id: "ORD-8707", client: "Sweet Mills", items: 4, qty: 88, sla: "2024-07-18 08:00", breachedBy: "42h 30m", stage: "Dispatch", reason: "System outage", escalated: false, notes: "" },
  { id: "ORD-8705", client: "Agro Corp", items: 2, qty: 52, sla: "2024-07-17 22:00", breachedBy: "46h 20m", stage: "Picking", reason: "Staff shortage", escalated: true, notes: "" },
  { id: "ORD-8703", client: "Salt Works", items: 7, qty: 275, sla: "2024-07-17 20:00", breachedBy: "48h 00m", stage: "Pending Allocation", reason: "Stock unavailable", escalated: true, notes: "Client informed of revised dispatch date." },
  { id: "ORD-8700", client: "Fresh Farms", items: 5, qty: 118, sla: "2024-07-17 18:00", breachedBy: "50h 45m", stage: "Packing", reason: "Equipment downtime", escalated: false, notes: "" },
  { id: "ORD-8698", client: "Acme Foods", items: 3, qty: 74, sla: "2024-07-17 16:00", breachedBy: "52h 15m", stage: "QC Check", reason: "Courier delay", escalated: false, notes: "" },
  { id: "ORD-8696", client: "Global Oils", items: 8, qty: 205, sla: "2024-07-17 14:00", breachedBy: "54h 30m", stage: "Dispatch", reason: "System outage", escalated: true, notes: "" },
  { id: "ORD-8693", client: "Sweet Mills", items: 1, qty: 26, sla: "2024-07-17 12:00", breachedBy: "56h 00m", stage: "Picking", reason: "Staff shortage", escalated: false, notes: "" },
  { id: "ORD-8691", client: "Agro Corp", items: 6, qty: 168, sla: "2024-07-17 10:00", breachedBy: "58h 20m", stage: "Pending Allocation", reason: "Stock unavailable", escalated: false, notes: "" },
  { id: "ORD-8689", client: "Salt Works", items: 4, qty: 240, sla: "2024-07-17 08:00", breachedBy: "60h 10m", stage: "Packing", reason: "Equipment downtime", escalated: true, notes: "" },
  { id: "ORD-8686", client: "Fresh Farms", items: 2, qty: 44, sla: "2024-07-16 22:00", breachedBy: "62h 45m", stage: "QC Check", reason: "Courier delay", escalated: false, notes: "" },
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
                  <RowActions
                    items={[
                      { label: "View details", icon: <Eye />, onSelect: () => setDetail(o) },
                      ...(!o.escalated
                        ? [{ label: "Escalate", icon: <ArrowUpCircle />, onSelect: () => escalate(o) }]
                        : []),
                      { label: "Resolve breach", icon: <Check />, onSelect: () => setResolveTarget(o), tone: "success" as const },
                    ]}
                  />
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
