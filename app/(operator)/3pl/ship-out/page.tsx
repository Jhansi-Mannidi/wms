"use client"

import { useState } from "react"
import { Search, Plus, Filter, LayoutGrid, List, AlertTriangle, Clock, Package, ChevronRight, Truck } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type ShipOut = {
  id: string; client: string; clientInit: string; clientColor: string
  lines: number; pieces: number; dispatchMode: string; shipTo: string
  sla: string; slaRisk: boolean; status: string
}

const initialOrders: ShipOut[] = [
  { id: "SO-2401", client: "Apex Pharma Ltd", clientInit: "AP", clientColor: "bg-blue-500", lines: 4, pieces: 120, dispatchMode: "Courier", shipTo: "Mumbai", sla: "4h", slaRisk: false, status: "New" },
  { id: "SO-2402", client: "GlobalTex Fabrics", clientInit: "GT", clientColor: "bg-amber-500", lines: 8, pieces: 450, dispatchMode: "Export", shipTo: "Port Nhava Sheva", sla: "12h", slaRisk: false, status: "Allocated" },
  { id: "SO-2403", client: "Sunrise Electronics", clientInit: "SE", clientColor: "bg-emerald-500", lines: 2, pieces: 24, dispatchMode: "Local Delivery", shipTo: "Pune", sla: "1h", slaRisk: true, status: "Picking" },
  { id: "SO-2404", client: "AutoParts India", clientInit: "AI", clientColor: "bg-cyan-500", lines: 6, pieces: 200, dispatchMode: "Courier", shipTo: "Delhi", sla: "6h", slaRisk: false, status: "Packed" },
  { id: "SO-2405", client: "MediSupply Corp", clientInit: "MS", clientColor: "bg-rose-500", lines: 10, pieces: 600, dispatchMode: "Pickup", shipTo: "—", sla: "3h", slaRisk: false, status: "Dispatched" },
  { id: "SO-2406", client: "FreshFarm Organics", clientInit: "FF", clientColor: "bg-orange-500", lines: 3, pieces: 90, dispatchMode: "Local Delivery", shipTo: "Nashik", sla: "2h", slaRisk: true, status: "New" },
  { id: "SO-2407", client: "Apex Pharma Ltd", clientInit: "AP", clientColor: "bg-blue-500", lines: 5, pieces: 150, dispatchMode: "Export", shipTo: "Chennai Port", sla: "8h", slaRisk: false, status: "Allocated" },
]

const modeColors: Record<string, string> = {
  Courier: "bg-brand/15 text-brand",
  "Local Delivery": "bg-emerald-500/15 text-emerald-400",
  Export: "bg-amber-500/15 text-amber-400",
  Pickup: "bg-violet-500/15 text-violet-400",
}

const columns = ["New", "Allocated", "Picking", "Packed", "Dispatched"]
const columnBorderColors: Record<string, string> = {
  New: "border-l-slate-400",
  Allocated: "border-l-blue-400",
  Picking: "border-l-amber-400",
  Packed: "border-l-violet-400",
  Dispatched: "border-l-success",
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
const MODES = ["Courier", "Local Delivery", "Export", "Pickup"] as const

const emptyForm = { client: "", lines: "", pieces: "", dispatchMode: "", shipTo: "", sla: "" }

export default function ShipOutQueuePage() {
  const [orders, setOrders] = useState<ShipOut[]>(initialOrders)
  const [view, setView] = useState<"kanban" | "table">("kanban")
  const [search, setSearch] = useState("")

  const [filterOpen, setFilterOpen] = useState(false)
  const [modeFilter, setModeFilter] = useState("All")
  const [riskFilter, setRiskFilter] = useState("All")
  const [draftFilter, setDraftFilter] = useState({ mode: "All", risk: "All" })

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<ShipOut | null>(null)
  const [dispatchTarget, setDispatchTarget] = useState<ShipOut | null>(null)

  const filtered = orders.filter(o =>
    (modeFilter === "All" || o.dispatchMode === modeFilter) &&
    (riskFilter === "All" || (riskFilter === "At Risk" ? o.slaRisk : !o.slaRisk)) &&
    (o.id.toLowerCase().includes(search.toLowerCase()) || o.client.toLowerCase().includes(search.toLowerCase()))
  )

  const kpis = [
    { label: "New", value: String(orders.filter(o => o.status === "New").length), color: "text-slate-400" },
    { label: "Allocated", value: String(orders.filter(o => o.status === "Allocated").length), color: "text-blue-400" },
    { label: "Picking", value: String(orders.filter(o => o.status === "Picking").length), color: "text-amber-400" },
    { label: "Packed", value: String(orders.filter(o => o.status === "Packed").length), color: "text-violet-400" },
    { label: "Dispatched Today", value: String(orders.filter(o => o.status === "Dispatched").length), color: "text-success" },
    { label: "SLA at Risk", value: String(orders.filter(o => o.slaRisk && o.status !== "Dispatched").length), color: "text-danger" },
  ]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.client) e.client = "Select a client"
    if (!form.lines.trim()) e.lines = "Line count is required"
    else if (!/^\d+$/.test(form.lines) || Number(form.lines) < 1) e.lines = "Enter a positive whole number"
    if (!form.pieces.trim()) e.pieces = "Piece count is required"
    else if (!/^\d+$/.test(form.pieces) || Number(form.pieces) < 1) e.pieces = "Enter a positive whole number"
    if (!form.dispatchMode) e.dispatchMode = "Select a dispatch mode"
    if (!form.shipTo.trim()) e.shipTo = "Destination is required"
    if (!form.sla.trim()) e.sla = "SLA is required"
    else if (!/^\d+[hm]$/.test(form.sla.trim())) e.sla = "Use a format like 4h or 30m"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createOrder() {
    if (!validate()) return
    const meta = CLIENT_META[form.client]
    const sla = form.sla.trim()
    const hours = sla.endsWith("h") ? Number(sla.slice(0, -1)) : Number(sla.slice(0, -1)) / 60
    const next: ShipOut = {
      id: `SO-${2401 + orders.length}`,
      client: form.client,
      clientInit: meta.init,
      clientColor: meta.color,
      lines: Number(form.lines),
      pieces: Number(form.pieces),
      dispatchMode: form.dispatchMode,
      shipTo: form.shipTo.trim(),
      sla,
      slaRisk: hours <= 2,
      status: "New",
    }
    setOrders(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Ship-out created", `${next.id} — ${next.pieces} pcs to ${next.shipTo} (${next.dispatchMode})`)
  }

  function advance(o: ShipOut) {
    const idx = columns.indexOf(o.status)
    if (idx < 0 || idx >= columns.length - 1) return
    const nextStatus = columns[idx + 1]
    if (nextStatus === "Dispatched") { setDispatchTarget(o); return }
    setOrders(prev => prev.map(x => x.id === o.id ? { ...x, status: nextStatus } : x))
    notify.success(`Order moved to ${nextStatus}`, `${o.id} — ${o.client}`)
  }

  function dispatchOrder(o: ShipOut) {
    setOrders(prev => prev.map(x => x.id === o.id ? { ...x, status: "Dispatched", slaRisk: false } : x))
    notify.success("Order dispatched", `${o.id} left the dock for ${o.shipTo}.`)
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
        {kpis.map(k => (
          <div key={k.label} className="p-2.5 rounded-xl border border-border bg-card text-center">
            <p className={cn("text-2xl font-bold", k.color)}>{k.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[180px] max-w-xs px-3 py-2 rounded-lg border border-border bg-card">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders, clients..." className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground/60" />
        </div>
        <button
          onClick={() => { setDraftFilter({ mode: modeFilter, risk: riskFilter }); setFilterOpen(true) }}
          title="Filter ship-outs"
          className={cn("flex items-center gap-1.5 px-3 py-2 rounded-lg border bg-card text-sm transition-colors",
            modeFilter !== "All" || riskFilter !== "All" ? "border-brand text-brand" : "border-border text-muted-foreground hover:text-foreground")}>
          <Filter className="w-4 h-4" /> Filter
          {(modeFilter !== "All" || riskFilter !== "All") && (
            <span className="ml-0.5 text-[10px] font-bold bg-brand text-white rounded-full px-1.5">
              {[modeFilter !== "All", riskFilter !== "All"].filter(Boolean).length}
            </span>
          )}
        </button>
        <ExportButton data={filtered.map(o => ({ id: o.id, client: o.client, lines: o.lines, pieces: o.pieces, dispatchMode: o.dispatchMode, shipTo: o.shipTo, sla: o.sla, slaRisk: o.slaRisk, status: o.status }))} filename="3pl-ship-out" />
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => setView("kanban")} title="Kanban view" className={cn("w-8 h-8 flex items-center justify-center rounded-lg border transition-colors", view === "kanban" ? "bg-brand border-brand text-white" : "border-border text-muted-foreground")}><LayoutGrid className="w-4 h-4" /></button>
          <button onClick={() => setView("table")} title="Table view" className={cn("w-8 h-8 flex items-center justify-center rounded-lg border transition-colors", view === "table" ? "bg-brand border-brand text-white" : "border-border text-muted-foreground")}><List className="w-4 h-4" /></button>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setErrors({}); setCreateOpen(true) }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F7941D] text-white text-sm font-medium hover:bg-[#F7941D]/90 transition-colors">
          <Plus className="w-4 h-4" /> New Ship-Out
        </button>
      </div>

      {view === "kanban" ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map(col => {
            const items = filtered.filter(o => o.status === col)
            return (
              <div key={col} className="shrink-0 w-64">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{col}</span>
                  <span className="text-xs font-bold bg-muted px-2 py-0.5 rounded-full text-foreground">{items.length}</span>
                </div>
                <div className="space-y-3">
                  {items.map(o => (
                    <div key={o.id} onClick={() => setDetail(o)} className={cn("p-4 rounded-xl border border-border bg-card border-l-4 hover:border-brand/40 transition-all cursor-pointer", columnBorderColors[o.status])}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0", o.clientColor)}>{o.clientInit}</div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">{o.id}</p>
                            <p className="text-xs font-semibold text-foreground leading-tight truncate max-w-[120px]">{o.client}</p>
                          </div>
                        </div>
                        {o.slaRisk && <AlertTriangle className="w-4 h-4 text-danger shrink-0" />}
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", modeColors[o.dispatchMode])}>{o.dispatchMode}</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{o.lines}L · {o.pieces}pcs</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Truck className="w-3 h-3" />
                        <span className="truncate">{o.shipTo}</span>
                        <span className="ml-auto flex items-center gap-0.5"><Clock className="w-3 h-3" />{o.sla}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <button onClick={e => { e.stopPropagation(); setDetail(o) }} title="View order detail" className="flex-1 flex items-center justify-center gap-1 text-[11px] text-brand hover:underline font-medium">
                          View Order <ChevronRight className="w-3 h-3" />
                        </button>
                        {o.status !== "Dispatched" && (
                          <button onClick={e => { e.stopPropagation(); advance(o) }} title={`Advance to ${columns[columns.indexOf(o.status) + 1]}`} className="text-[11px] font-medium text-success hover:underline">
                            Advance
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 rounded-xl border border-dashed border-border text-muted-foreground">
                      <Package className="w-5 h-5 mb-1 opacity-40" />
                      <span className="text-xs">Empty</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Order Ref", "Client", "Lines/Pcs", "Mode", "Ship To", "SLA", "Status", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => (
                <tr key={o.id} className={cn("border-b border-border/50 hover:bg-muted/20 transition-colors", i % 2 === 0 ? "" : "bg-muted/5")}>
                  <td className="px-4 py-3 text-xs font-mono font-semibold text-brand">{o.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold", o.clientColor)}>{o.clientInit}</div>
                      <span className="text-xs font-medium">{o.client}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{o.lines}L · {o.pieces}pcs</td>
                  <td className="px-4 py-3"><span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", modeColors[o.dispatchMode])}>{o.dispatchMode}</span></td>
                  <td className="px-4 py-3 text-xs text-foreground">{o.shipTo}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {o.slaRisk && <AlertTriangle className="w-3 h-3 text-danger" />}
                      <span className={cn("text-xs font-semibold", o.slaRisk ? "text-danger" : "text-muted-foreground")}>{o.sla}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{o.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setDetail(o)} title="View order detail" className="flex items-center gap-1 text-xs text-brand hover:underline">View <ChevronRight className="w-3 h-3" /></button>
                      {o.status !== "Dispatched" && (
                        <button onClick={() => advance(o)} title={`Advance to ${columns[columns.indexOf(o.status) + 1]}`} className="text-xs text-success hover:underline">Advance</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No ship-out orders match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Filter modal */}
      <Modal
        open={filterOpen}
        onOpenChange={setFilterOpen}
        title="Filter Ship-Outs"
        description="Narrow the queue by dispatch mode and SLA risk"
        size="sm"
        footer={
          <ModalActions
            onCancel={() => { setModeFilter("All"); setRiskFilter("All"); setFilterOpen(false); notify.info("Filters cleared", "Showing all ship-out orders.") }}
            cancelLabel="Clear All"
            onSubmit={() => {
              setModeFilter(draftFilter.mode); setRiskFilter(draftFilter.risk); setFilterOpen(false)
              notify.success("Filters applied", `Mode: ${draftFilter.mode} · SLA: ${draftFilter.risk}`)
            }}
            submitLabel="Apply Filters"
          />
        }
      >
        <div className="space-y-4">
          <Field label="Dispatch Mode">
            <Select value={draftFilter.mode} onChange={e => setDraftFilter({ ...draftFilter, mode: e.target.value })} options={["All", ...MODES]} />
          </Field>
          <Field label="SLA Risk">
            <Select value={draftFilter.risk} onChange={e => setDraftFilter({ ...draftFilter, risk: e.target.value })} options={["All", "At Risk", "On Track"]} />
          </Field>
        </div>
      </Modal>

      {/* Create ship-out */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="New Ship-Out Order"
        description="Raise an outbound order for a 3PL client"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createOrder} submitLabel="Create Ship-Out" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Client" required error={errors.client}>
            <Select value={form.client} invalid={!!errors.client} onChange={e => setForm({ ...form, client: e.target.value })} options={CLIENTS} placeholder="Select Client" />
          </Field>
          <Field label="Dispatch Mode" required error={errors.dispatchMode}>
            <Select value={form.dispatchMode} invalid={!!errors.dispatchMode} onChange={e => setForm({ ...form, dispatchMode: e.target.value })} options={MODES} placeholder="Select Mode" />
          </Field>
          <Field label="Line Count" required error={errors.lines}>
            <TextInput value={form.lines} invalid={!!errors.lines} onChange={e => setForm({ ...form, lines: e.target.value })} placeholder="e.g. 4" inputMode="numeric" />
          </Field>
          <Field label="Piece Count" required error={errors.pieces}>
            <TextInput value={form.pieces} invalid={!!errors.pieces} onChange={e => setForm({ ...form, pieces: e.target.value })} placeholder="e.g. 120" inputMode="numeric" />
          </Field>
          <Field label="Ship To" required error={errors.shipTo}>
            <TextInput value={form.shipTo} invalid={!!errors.shipTo} onChange={e => setForm({ ...form, shipTo: e.target.value })} placeholder="e.g. Mumbai" />
          </Field>
          <Field label="SLA" required error={errors.sla} hint="Orders due within 2h are flagged at risk">
            <TextInput value={form.sla} invalid={!!errors.sla} onChange={e => setForm({ ...form, sla: e.target.value })} placeholder="e.g. 4h" />
          </Field>
        </div>
      </Modal>

      {/* Ship-out detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Ship-out order detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Order Ref" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Client" value={detail.client} />
            <DetailRow label="Lines" value={String(detail.lines)} />
            <DetailRow label="Pieces" value={detail.pieces.toLocaleString()} />
            <DetailRow label="Dispatch Mode" value={<span className={cn("px-2 py-0.5 rounded-full text-[11px] font-semibold", modeColors[detail.dispatchMode])}>{detail.dispatchMode}</span>} />
            <DetailRow label="Ship To" value={detail.shipTo} />
            <DetailRow label="SLA" value={detail.sla} />
            <DetailRow label="SLA Risk" value={detail.slaRisk ? <span className="text-danger font-semibold">At risk</span> : <span className="text-success">On track</span>} />
            <DetailRow label="Stage" value={<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Dispatch confirmation */}
      <ConfirmDialog
        open={!!dispatchTarget}
        onOpenChange={(o) => !o && setDispatchTarget(null)}
        title="Dispatch this order?"
        message={`${dispatchTarget?.id} (${dispatchTarget?.pieces} pcs to ${dispatchTarget?.shipTo}) will be marked dispatched. This cannot be undone.`}
        confirmLabel="Dispatch"
        cancelLabel="Not Yet"
        tone="brand"
        onConfirm={() => dispatchTarget && dispatchOrder(dispatchTarget)}
      />
    </div>
  )
}
