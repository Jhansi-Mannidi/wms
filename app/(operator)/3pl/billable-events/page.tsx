"use client"

import { useState } from "react"
import { Search, DollarSign, Package, Wrench, Truck, AlertCircle, Play, Plus, Eye, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"
import { PageHeader } from "@/components/wms/page-header"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type BillableEvent = {
  id: string; client: string; clientInit: string; clientColor: string; type: string
  desc: string; qty: number; uom: string; rate: number; amount: number; period: string; status: string
}

const initialEvents: BillableEvent[] = [
  { id: "BE-0421", client: "Apex Pharma Ltd", clientInit: "AP", clientColor: "bg-blue-500", type: "Storage", desc: "Pallet storage — Jul 2025", qty: 24, uom: "pallet-days", rate: 45, amount: 1080, period: "Jul 2025", status: "Pending" },
  { id: "BE-0422", client: "GlobalTex Fabrics", clientInit: "GT", clientColor: "bg-amber-500", type: "Handling", desc: "Inbound receipt handling — ASN-002", qty: 320, uom: "pieces", rate: 2.5, amount: 800, period: "Jul 2025", status: "Pending" },
  { id: "BE-0423", client: "Sunrise Electronics", clientInit: "SE", clientColor: "bg-emerald-500", type: "VAS", desc: "Kitting — KIT-089", qty: 50, uom: "units", rate: 35, amount: 1750, period: "Jul 2025", status: "Invoiced" },
  { id: "BE-0424", client: "AutoParts India", clientInit: "AI", clientColor: "bg-cyan-500", type: "Storage", desc: "Rack storage — Jul 2025", qty: 180, uom: "pallet-days", rate: 38, amount: 6840, period: "Jul 2025", status: "Pending" },
  { id: "BE-0425", client: "MediSupply Corp", clientInit: "MS", clientColor: "bg-rose-500", type: "Ancillary", desc: "Temperature monitoring surcharge", qty: 1, uom: "month", rate: 5000, amount: 5000, period: "Jul 2025", status: "Pending" },
  { id: "BE-0426", client: "FreshFarm Organics", clientInit: "FF", clientColor: "bg-orange-500", type: "Handling", desc: "Outbound dispatch — SO-2406", qty: 90, uom: "pieces", rate: 3, amount: 270, period: "Jul 2025", status: "Invoiced" },
  { id: "BE-0427", client: "GlobalTex Fabrics", clientInit: "GT", clientColor: "bg-amber-500", type: "VAS", desc: "Labelling — LBL-112", qty: 200, uom: "units", rate: 8, amount: 1600, period: "Jul 2025", status: "Pending" },
  { id: "BE-0428", client: "Apex Pharma Ltd", clientInit: "AP", clientColor: "bg-blue-500", type: "Handling", desc: "Inbound receipt handling — ASN-007", qty: 620, uom: "pieces", rate: 2.5, amount: 1550, period: "Jul 2025", status: "Pending" },
  { id: "BE-0429", client: "MediSupply Corp", clientInit: "MS", clientColor: "bg-rose-500", type: "Storage", desc: "Cold room storage — Jul 2025", qty: 96, uom: "pallet-days", rate: 96, amount: 9216, period: "Jul 2025", status: "Pending" },
  { id: "BE-0430", client: "Sunrise Electronics", clientInit: "SE", clientColor: "bg-emerald-500", type: "Handling", desc: "Outbound dispatch — SO-2411", qty: 268, uom: "pieces", rate: 3, amount: 804, period: "Jul 2025", status: "Invoiced" },
  { id: "BE-0431", client: "AutoParts India", clientInit: "AI", clientColor: "bg-cyan-500", type: "VAS", desc: "Shrink wrapping — SW-034", qty: 45, uom: "units", rate: 18, amount: 810, period: "Jul 2025", status: "Pending" },
  { id: "BE-0432", client: "GlobalTex Fabrics", clientInit: "GT", clientColor: "bg-amber-500", type: "Storage", desc: "Bulk floor storage — Jul 2025", qty: 1200, uom: "sqft-month", rate: 28, amount: 33600, period: "Jul 2025", status: "Pending" },
  { id: "BE-0433", client: "FreshFarm Organics", clientInit: "FF", clientColor: "bg-orange-500", type: "Ancillary", desc: "Fumigation treatment — FUM-018", qty: 12, uom: "pallet-days", rate: 210, amount: 2520, period: "Jul 2025", status: "Invoiced" },
  { id: "BE-0434", client: "Apex Pharma Ltd", clientInit: "AP", clientColor: "bg-blue-500", type: "VAS", desc: "Batch coding & MRP sticker — BC-201", qty: 400, uom: "units", rate: 2.75, amount: 1100, period: "Jul 2025", status: "Pending" },
  { id: "BE-0435", client: "MediSupply Corp", clientInit: "MS", clientColor: "bg-rose-500", type: "Handling", desc: "Container destuffing — ASN-020", qty: 2, uom: "units", rate: 4200, amount: 8400, period: "Jul 2025", status: "Pending" },
  { id: "BE-0436", client: "AutoParts India", clientInit: "AI", clientColor: "bg-cyan-500", type: "Handling", desc: "Pallet in / pallet out — Jul 2025", qty: 34, uom: "pallet-days", rate: 65, amount: 2210, period: "Jul 2025", status: "Invoiced" },
  { id: "BE-0437", client: "Sunrise Electronics", clientInit: "SE", clientColor: "bg-emerald-500", type: "Storage", desc: "Rack storage — Jul 2025", qty: 210, uom: "pallet-days", rate: 38, amount: 7980, period: "Jul 2025", status: "Pending" },
  { id: "BE-0438", client: "GlobalTex Fabrics", clientInit: "GT", clientColor: "bg-amber-500", type: "VAS", desc: "Re-palletisation — RP-077", qty: 18, uom: "pallet-days", rate: 130, amount: 2340, period: "Jul 2025", status: "Pending" },
  { id: "BE-0439", client: "FreshFarm Organics", clientInit: "FF", clientColor: "bg-orange-500", type: "Storage", desc: "Pallet storage — Jul 2025", qty: 64, uom: "pallet-days", rate: 45, amount: 2880, period: "Jul 2025", status: "Pending" },
  { id: "BE-0440", client: "Apex Pharma Ltd", clientInit: "AP", clientColor: "bg-blue-500", type: "Ancillary", desc: "Insurance surcharge — Jul 2025", qty: 1, uom: "month", rate: 3200, amount: 3200, period: "Jul 2025", status: "Invoiced" },
  { id: "BE-0441", client: "MediSupply Corp", clientInit: "MS", clientColor: "bg-rose-500", type: "VAS", desc: "Serial number capture — SN-140", qty: 310, uom: "pieces", rate: 5.5, amount: 1705, period: "Jul 2025", status: "Pending" },
  { id: "BE-0442", client: "GlobalTex Fabrics", clientInit: "GT", clientColor: "bg-amber-500", type: "Handling", desc: "Cross-dock transfer — XD-058", qty: 476, uom: "pieces", rate: 1.8, amount: 856.8, period: "Jul 2025", status: "Pending" },
  { id: "BE-0443", client: "AutoParts India", clientInit: "AI", clientColor: "bg-cyan-500", type: "Ancillary", desc: "Dedicated supervisor — Jul 2025", qty: 1, uom: "month", rate: 42000, amount: 42000, period: "Jul 2025", status: "Pending" },
  { id: "BE-0444", client: "Sunrise Electronics", clientInit: "SE", clientColor: "bg-emerald-500", type: "VAS", desc: "Gift wrapping — GW-025", qty: 120, uom: "units", rate: 22, amount: 2640, period: "Jul 2025", status: "Invoiced" },
  { id: "BE-0445", client: "FreshFarm Organics", clientInit: "FF", clientColor: "bg-orange-500", type: "Handling", desc: "Returns inspection — RTN-091", qty: 88, uom: "pieces", rate: 6.5, amount: 572, period: "Jul 2025", status: "Pending" },
  { id: "BE-0446", client: "Apex Pharma Ltd", clientInit: "AP", clientColor: "bg-blue-500", type: "Storage", desc: "Bonded warehouse storage — Jul 2025", qty: 55, uom: "pallet-days", rate: 74, amount: 4070, period: "Jul 2025", status: "Pending" },
  { id: "BE-0447", client: "MediSupply Corp", clientInit: "MS", clientColor: "bg-rose-500", type: "Ancillary", desc: "Cycle count audit — Jul 2025", qty: 1, uom: "month", rate: 8500, amount: 8500, period: "Jul 2025", status: "Invoiced" },
  { id: "BE-0448", client: "GlobalTex Fabrics", clientInit: "GT", clientColor: "bg-amber-500", type: "Storage", desc: "Mezzanine bin storage — Jul 2025", qty: 900, uom: "sqft-month", rate: 42, amount: 37800, period: "Jul 2025", status: "Pending" },
  { id: "BE-0449", client: "AutoParts India", clientInit: "AI", clientColor: "bg-cyan-500", type: "VAS", desc: "Labelling — LBL-118", qty: 260, uom: "units", rate: 8, amount: 2080, period: "Jul 2025", status: "Pending" },
  { id: "BE-0450", client: "Sunrise Electronics", clientInit: "SE", clientColor: "bg-emerald-500", type: "Ancillary", desc: "Security & CCTV access — Jul 2025", qty: 1, uom: "month", rate: 2400, amount: 2400, period: "Jul 2025", status: "Invoiced" },
]

const typeColors: Record<string, string> = {
  Storage: "bg-blue-500/15 text-blue-400",
  Handling: "bg-amber-500/15 text-amber-400",
  VAS: "bg-violet-500/15 text-violet-400",
  Ancillary: "bg-rose-500/15 text-rose-400",
}
const typeIcons: Record<string, React.ReactNode> = {
  Storage: <Package className="w-3.5 h-3.5" />,
  Handling: <Truck className="w-3.5 h-3.5" />,
  VAS: <Wrench className="w-3.5 h-3.5" />,
  Ancillary: <DollarSign className="w-3.5 h-3.5" />,
}

const CLIENTS = ["Apex Pharma Ltd", "GlobalTex Fabrics", "Sunrise Electronics", "AutoParts India", "MediSupply Corp", "FreshFarm Organics"] as const
const CLIENT_META: Record<string, { init: string; color: string }> = {
  "Apex Pharma Ltd": { init: "AP", color: "bg-blue-500" },
  "GlobalTex Fabrics": { init: "GT", color: "bg-amber-500" },
  "Sunrise Electronics": { init: "SE", color: "bg-emerald-500" },
  "AutoParts India": { init: "AI", color: "bg-cyan-500" },
  "MediSupply Corp": { init: "MS", color: "bg-rose-500" },
  "FreshFarm Organics": { init: "FF", color: "bg-orange-500" },
}
const EVENT_TYPES = ["Storage", "Handling", "VAS", "Ancillary"] as const
const UOMS = ["pallet-days", "pieces", "units", "month", "sqft-month"] as const

const emptyForm = { client: "", type: "", desc: "", qty: "", uom: "", rate: "", period: "Jul 2025" }

export default function BillableEventsPage() {
  const [events, setEvents] = useState<BillableEvent[]>(initialEvents)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [typeFilter, setTypeFilter] = useState("All")

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<BillableEvent | null>(null)
  const [voidTarget, setVoidTarget] = useState<BillableEvent | null>(null)
  const [runOpen, setRunOpen] = useState(false)

  const types = ["All", "Storage", "Handling", "VAS", "Ancillary"]

  const filtered = events.filter(e =>
    (typeFilter === "All" || e.type === typeFilter) &&
    (e.client.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase()))
  )

  const toggleSelect = (id: string) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

  const totalSelected = events.filter(e => selected.includes(e.id)).reduce((sum, e) => sum + e.amount, 0)

  const pending = events.filter(e => e.status === "Pending")
  const sumOf = (pred: (e: BillableEvent) => boolean) => pending.filter(pred).reduce((s, e) => s + e.amount, 0)
  const kpis = [
    { label: "Un-invoiced Value", value: `₹${sumOf(() => true).toLocaleString()}`, sub: `${pending.length} events`, color: "text-warning", icon: <AlertCircle className="w-4 h-4" /> },
    { label: "Storage Accrued", value: `₹${sumOf(e => e.type === "Storage").toLocaleString()}`, sub: "Jul 2025", color: "text-blue-400", icon: <Package className="w-4 h-4" /> },
    { label: "Handling Events", value: `₹${sumOf(e => e.type === "Handling").toLocaleString()}`, sub: `${pending.filter(e => e.type === "Handling").length} events`, color: "text-amber-400", icon: <Truck className="w-4 h-4" /> },
    { label: "VAS Events", value: `₹${sumOf(e => e.type === "VAS").toLocaleString()}`, sub: `${pending.filter(e => e.type === "VAS").length} events`, color: "text-violet-400", icon: <Wrench className="w-4 h-4" /> },
    { label: "Clients with Dues", value: String(new Set(pending.map(e => e.client)).size), sub: "Pending invoice", color: "text-danger", icon: <AlertCircle className="w-4 h-4" /> },
  ]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.client) e.client = "Select a client"
    if (!form.type) e.type = "Select an event type"
    if (!form.desc.trim()) e.desc = "Description is required"
    if (!form.qty.trim()) e.qty = "Quantity is required"
    else if (!/^\d+(\.\d+)?$/.test(form.qty) || Number(form.qty) <= 0) e.qty = "Enter a positive number"
    if (!form.uom) e.uom = "Select a unit of measure"
    if (!form.rate.trim()) e.rate = "Rate is required"
    else if (!/^\d+(\.\d+)?$/.test(form.rate) || Number(form.rate) <= 0) e.rate = "Enter a positive amount"
    if (!form.period.trim()) e.period = "Billing period is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createEvent() {
    if (!validate()) return
    const meta = CLIENT_META[form.client]
    const qty = Number(form.qty)
    const rate = Number(form.rate)
    const next: BillableEvent = {
      id: `BE-${String(421 + events.length).padStart(4, "0")}`,
      client: form.client,
      clientInit: meta.init,
      clientColor: meta.color,
      type: form.type,
      desc: form.desc.trim(),
      qty,
      uom: form.uom,
      rate,
      amount: Math.round(qty * rate * 100) / 100,
      period: form.period.trim(),
      status: "Pending",
    }
    setEvents(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Billable event captured", `${next.id} — ₹${next.amount.toLocaleString()} for ${next.client}`)
  }

  function runInvoice() {
    const ids = [...selected]
    const count = ids.length
    setEvents(prev => prev.map(e => ids.includes(e.id) ? { ...e, status: "Invoiced" } : e))
    setSelected([])
    notify.success("Invoice run complete", `${count} event${count === 1 ? "" : "s"} invoiced for ₹${totalSelected.toLocaleString()}.`)
  }

  function voidEvent(e: BillableEvent) {
    setEvents(prev => prev.filter(x => x.id !== e.id))
    setSelected(s => s.filter(x => x !== e.id))
    notify.warning("Event voided", `${e.id} removed from the billing ledger.`)
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <PageHeader title="Billable Events" description="Chargeable activities captured across 3PL operations" className="mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {kpis.map(k => (
          <div key={k.label} className="flex items-center gap-2 p-3 rounded-xl border border-border bg-card">
            <div className={cn("w-9 h-9 rounded-lg border border-border flex items-center justify-center", k.color)}>{k.icon}</div>
            <div>
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <p className={cn("text-lg font-bold leading-tight", k.color)}>{k.value}</p>
              <p className="text-[10px] text-muted-foreground">{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[180px] max-w-xs px-3 py-2 rounded-lg border border-border bg-card">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events, clients..." className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground/60" />
        </div>
        <ExportButton data={filtered.map(e => ({ id: e.id, client: e.client, type: e.type, desc: e.desc, qty: e.qty, uom: e.uom, rate: e.rate, amount: e.amount, period: e.period, status: e.status }))} filename="3pl-billable-events" />
        <div className="flex gap-1">
          {types.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors", typeFilter === t ? "bg-brand text-white" : "border border-border bg-card text-muted-foreground hover:text-foreground")}>
              {t}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setForm(emptyForm); setErrors({}); setCreateOpen(true) }}
          className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors">
          <Plus className="w-4 h-4" /> New Event
        </button>
        {selected.length > 0 && (
          <button onClick={() => setRunOpen(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
            <Play className="w-4 h-4" /> Run Invoice (₹{totalSelected.toLocaleString()})
          </button>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-10 px-4 py-3"><input type="checkbox" title="Select all events" className="rounded" checked={selected.length > 0 && selected.length === filtered.length} onChange={e => setSelected(e.target.checked ? filtered.map(ev => ev.id) : [])} /></th>
              {["Event", "Client", "Type", "Description", "Qty / UOM", "Rate (₹)", "Amount (₹)", "Period", "Status", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr key={e.id} className={cn("border-b border-border/50 hover:bg-muted/20 transition-colors", selected.includes(e.id) ? "bg-brand/5" : i % 2 === 0 ? "" : "bg-muted/5")}>
                <td className="px-4 py-3">
                  <input type="checkbox" title={`Select ${e.id}`} checked={selected.includes(e.id)} onChange={() => toggleSelect(e.id)} className="rounded" />
                </td>
                <td className="px-4 py-3 text-xs font-mono text-brand font-semibold">{e.id}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold", e.clientColor)}>{e.clientInit}</div>
                    <span className="text-xs font-medium text-foreground">{e.client}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full w-fit", typeColors[e.type])}>
                    {typeIcons[e.type]}{e.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[180px] truncate">{e.desc}</td>
                <td className="px-4 py-3 text-xs text-foreground">{e.qty.toLocaleString()} {e.uom}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">₹{e.rate}</td>
                <td className="px-4 py-3 text-xs font-bold text-foreground">₹{e.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{e.period}</td>
                <td className="px-4 py-3">
                  <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full",
                    e.status === "Invoiced" ? "bg-success/15 text-success" : "bg-warning/15 text-warning")}>
                    {e.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: "View event detail", icon: <Eye />, onSelect: () => setDetail(e) },
                      ...(e.status === "Pending"
                        ? [{ label: "Void event", icon: <Trash2 />, onSelect: () => setVoidTarget(e), tone: "danger" as const }]
                        : []),
                    ]}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={11} className="px-4 py-10 text-center text-sm text-muted-foreground">No billable events match your filters.</td></tr>
            )}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-muted/10">
          <span className="text-xs text-muted-foreground">Showing {filtered.length} of {events.length} events</span>
          <span className="text-xs font-semibold text-foreground">Total: ₹{filtered.reduce((s, e) => s + e.amount, 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Create billable event */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="New Billable Event"
        description="Capture a chargeable activity against a client"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createEvent} submitLabel="Create Event" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Client" required error={errors.client}>
            <Select value={form.client} invalid={!!errors.client} onChange={e => setForm({ ...form, client: e.target.value })} options={CLIENTS} placeholder="Select Client" />
          </Field>
          <Field label="Event Type" required error={errors.type}>
            <Select value={form.type} invalid={!!errors.type} onChange={e => setForm({ ...form, type: e.target.value })} options={EVENT_TYPES} placeholder="Select Type" />
          </Field>
          <Field label="Description" required error={errors.desc}>
            <TextInput value={form.desc} invalid={!!errors.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="e.g. Pallet storage — Jul 2025" />
          </Field>
          <Field label="Billing Period" required error={errors.period}>
            <TextInput value={form.period} invalid={!!errors.period} onChange={e => setForm({ ...form, period: e.target.value })} placeholder="e.g. Jul 2025" />
          </Field>
          <Field label="Quantity" required error={errors.qty}>
            <TextInput value={form.qty} invalid={!!errors.qty} onChange={e => setForm({ ...form, qty: e.target.value })} placeholder="e.g. 24" inputMode="decimal" />
          </Field>
          <Field label="Unit of Measure" required error={errors.uom}>
            <Select value={form.uom} invalid={!!errors.uom} onChange={e => setForm({ ...form, uom: e.target.value })} options={UOMS} placeholder="Select UOM" />
          </Field>
          <Field label="Rate (₹)" required error={errors.rate} hint={form.qty && form.rate && /^\d+(\.\d+)?$/.test(form.qty) && /^\d+(\.\d+)?$/.test(form.rate) ? `Amount: ₹${(Number(form.qty) * Number(form.rate)).toLocaleString()}` : undefined}>
            <TextInput value={form.rate} invalid={!!errors.rate} onChange={e => setForm({ ...form, rate: e.target.value })} placeholder="e.g. 45" inputMode="decimal" />
          </Field>
        </div>
      </Modal>

      {/* Event detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Billable event detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Event ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Client" value={detail.client} />
            <DetailRow label="Type" value={<span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold", typeColors[detail.type])}>{typeIcons[detail.type]}{detail.type}</span>} />
            <DetailRow label="Description" value={detail.desc} />
            <DetailRow label="Quantity" value={`${detail.qty.toLocaleString()} ${detail.uom}`} />
            <DetailRow label="Rate" value={`₹${detail.rate}`} />
            <DetailRow label="Amount" value={<span className="font-bold">₹{detail.amount.toLocaleString()}</span>} />
            <DetailRow label="Billing Period" value={detail.period} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", detail.status === "Invoiced" ? "bg-success/15 text-success" : "bg-warning/15 text-warning")}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Run invoice confirmation */}
      <ConfirmDialog
        open={runOpen}
        onOpenChange={setRunOpen}
        title="Run invoice for selected events?"
        message={`${selected.length} event(s) totalling ₹${totalSelected.toLocaleString()} will be marked Invoiced and locked from further edits.`}
        confirmLabel="Run Invoice"
        cancelLabel="Not Yet"
        tone="brand"
        onConfirm={runInvoice}
      />

      {/* Void confirmation */}
      <ConfirmDialog
        open={!!voidTarget}
        onOpenChange={(o) => !o && setVoidTarget(null)}
        title="Void this billable event?"
        message={`${voidTarget?.id} (₹${voidTarget?.amount.toLocaleString()}) will be removed from the billing ledger. This cannot be undone.`}
        confirmLabel="Void Event"
        cancelLabel="Keep It"
        onConfirm={() => voidTarget && voidEvent(voidTarget)}
      />
    </div>
  )
}
