"use client"

import { useState } from "react"
import { Search, Plus, Filter, LayoutGrid, List, AlertCircle, CheckCircle2, Clock, Truck, Package, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { PageHeader } from "@/components/wms/page-header"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type ASN = {
  id: string; client: string; clientInit: string; clientColor: string
  lines: number; pieces: number; eta: string; mode: string; status: string; discrepancy: boolean
}

const initialAsnData: ASN[] = [
  { id: "ASN-001", client: "Apex Pharma Ltd", clientInit: "AP", clientColor: "bg-blue-500", lines: 12, pieces: 480, eta: "Today 14:00", mode: "Road", status: "At Gate", discrepancy: false },
  { id: "ASN-002", client: "GlobalTex Fabrics", clientInit: "GT", clientColor: "bg-amber-500", lines: 8, pieces: 320, eta: "Today 16:30", mode: "Air", status: "Expected", discrepancy: false },
  { id: "ASN-003", client: "Sunrise Electronics", clientInit: "SE", clientColor: "bg-emerald-500", lines: 5, pieces: 95, eta: "Yesterday", mode: "Road", status: "Receiving", discrepancy: true },
  { id: "ASN-004", client: "MediSupply Corp", clientInit: "MS", clientColor: "bg-rose-500", lines: 20, pieces: 1200, eta: "Tomorrow 09:00", mode: "Sea", status: "Expected", discrepancy: false },
  { id: "ASN-005", client: "AutoParts India", clientInit: "AI", clientColor: "bg-cyan-500", lines: 3, pieces: 60, eta: "Today 11:00", mode: "Road", status: "Put-Away", discrepancy: false },
  { id: "ASN-006", client: "FreshFarm Organics", clientInit: "FF", clientColor: "bg-orange-500", lines: 6, pieces: 240, eta: "Jul 22", mode: "Road", status: "Closed", discrepancy: false },
  { id: "ASN-007", client: "Apex Pharma Ltd", clientInit: "AP", clientColor: "bg-blue-500", lines: 15, pieces: 620, eta: "Tomorrow 11:30", mode: "Air", status: "Expected", discrepancy: false },
  { id: "ASN-008", client: "MediSupply Corp", clientInit: "MS", clientColor: "bg-rose-500", lines: 9, pieces: 410, eta: "Jul 23", mode: "Road", status: "Expected", discrepancy: false },
  { id: "ASN-009", client: "GlobalTex Fabrics", clientInit: "GT", clientColor: "bg-amber-500", lines: 22, pieces: 1440, eta: "Jul 24", mode: "Sea", status: "Expected", discrepancy: false },
  { id: "ASN-010", client: "AutoParts India", clientInit: "AI", clientColor: "bg-cyan-500", lines: 7, pieces: 185, eta: "Tomorrow 15:00", mode: "Road", status: "Expected", discrepancy: false },
  { id: "ASN-011", client: "Sunrise Electronics", clientInit: "SE", clientColor: "bg-emerald-500", lines: 11, pieces: 268, eta: "Jul 25", mode: "Air", status: "Expected", discrepancy: false },
  { id: "ASN-012", client: "FreshFarm Organics", clientInit: "FF", clientColor: "bg-orange-500", lines: 4, pieces: 96, eta: "Today 09:45", mode: "Road", status: "At Gate", discrepancy: false },
  { id: "ASN-013", client: "MediSupply Corp", clientInit: "MS", clientColor: "bg-rose-500", lines: 18, pieces: 940, eta: "Today 10:15", mode: "Sea", status: "At Gate", discrepancy: true },
  { id: "ASN-014", client: "GlobalTex Fabrics", clientInit: "GT", clientColor: "bg-amber-500", lines: 13, pieces: 555, eta: "Today 12:30", mode: "Road", status: "At Gate", discrepancy: false },
  { id: "ASN-015", client: "Apex Pharma Ltd", clientInit: "AP", clientColor: "bg-blue-500", lines: 6, pieces: 144, eta: "Today 13:20", mode: "Air", status: "At Gate", discrepancy: false },
  { id: "ASN-016", client: "AutoParts India", clientInit: "AI", clientColor: "bg-cyan-500", lines: 10, pieces: 372, eta: "Today 15:45", mode: "Road", status: "At Gate", discrepancy: false },
  { id: "ASN-017", client: "Sunrise Electronics", clientInit: "SE", clientColor: "bg-emerald-500", lines: 14, pieces: 690, eta: "Today 08:00", mode: "Road", status: "Receiving", discrepancy: false },
  { id: "ASN-018", client: "Apex Pharma Ltd", clientInit: "AP", clientColor: "bg-blue-500", lines: 8, pieces: 228, eta: "Today 08:30", mode: "Air", status: "Receiving", discrepancy: true },
  { id: "ASN-019", client: "FreshFarm Organics", clientInit: "FF", clientColor: "bg-orange-500", lines: 5, pieces: 130, eta: "Yesterday", mode: "Road", status: "Receiving", discrepancy: false },
  { id: "ASN-020", client: "MediSupply Corp", clientInit: "MS", clientColor: "bg-rose-500", lines: 17, pieces: 815, eta: "Yesterday", mode: "Sea", status: "Receiving", discrepancy: true },
  { id: "ASN-021", client: "GlobalTex Fabrics", clientInit: "GT", clientColor: "bg-amber-500", lines: 12, pieces: 476, eta: "Today 07:15", mode: "Road", status: "Receiving", discrepancy: false },
  { id: "ASN-022", client: "AutoParts India", clientInit: "AI", clientColor: "bg-cyan-500", lines: 9, pieces: 260, eta: "Yesterday", mode: "Road", status: "Put-Away", discrepancy: false },
  { id: "ASN-023", client: "Sunrise Electronics", clientInit: "SE", clientColor: "bg-emerald-500", lines: 6, pieces: 158, eta: "Yesterday", mode: "Air", status: "Put-Away", discrepancy: false },
  { id: "ASN-024", client: "Apex Pharma Ltd", clientInit: "AP", clientColor: "bg-blue-500", lines: 21, pieces: 1105, eta: "Jul 18", mode: "Sea", status: "Put-Away", discrepancy: true },
  { id: "ASN-025", client: "FreshFarm Organics", clientInit: "FF", clientColor: "bg-orange-500", lines: 7, pieces: 294, eta: "Jul 18", mode: "Road", status: "Put-Away", discrepancy: false },
  { id: "ASN-026", client: "MediSupply Corp", clientInit: "MS", clientColor: "bg-rose-500", lines: 4, pieces: 88, eta: "Yesterday", mode: "Road", status: "Put-Away", discrepancy: false },
  { id: "ASN-027", client: "GlobalTex Fabrics", clientInit: "GT", clientColor: "bg-amber-500", lines: 16, pieces: 720, eta: "Jul 17", mode: "Sea", status: "Closed", discrepancy: false },
  { id: "ASN-028", client: "AutoParts India", clientInit: "AI", clientColor: "bg-cyan-500", lines: 11, pieces: 435, eta: "Jul 17", mode: "Road", status: "Closed", discrepancy: false },
  { id: "ASN-029", client: "Sunrise Electronics", clientInit: "SE", clientColor: "bg-emerald-500", lines: 3, pieces: 72, eta: "Jul 16", mode: "Air", status: "Closed", discrepancy: false },
  { id: "ASN-030", client: "Apex Pharma Ltd", clientInit: "AP", clientColor: "bg-blue-500", lines: 19, pieces: 980, eta: "Jul 16", mode: "Road", status: "Closed", discrepancy: true },
  { id: "ASN-031", client: "MediSupply Corp", clientInit: "MS", clientColor: "bg-rose-500", lines: 8, pieces: 340, eta: "Jul 15", mode: "Sea", status: "Closed", discrepancy: false },
  { id: "ASN-032", client: "FreshFarm Organics", clientInit: "FF", clientColor: "bg-orange-500", lines: 5, pieces: 165, eta: "Jul 15", mode: "Road", status: "Closed", discrepancy: false },
]

const columns = ["Expected", "At Gate", "Receiving", "Put-Away", "Closed"]

const statusColors: Record<string, string> = {
  Expected: "border-l-blue-400",
  "At Gate": "border-l-amber-400",
  Receiving: "border-l-brand",
  "Put-Away": "border-l-violet-400",
  Closed: "border-l-success",
}

const statusBgColors: Record<string, string> = {
  Expected: "bg-blue-500/10 text-blue-400",
  "At Gate": "bg-amber-500/10 text-amber-400",
  Receiving: "bg-brand/10 text-brand",
  "Put-Away": "bg-violet-500/10 text-violet-400",
  Closed: "bg-success/10 text-success",
}

const modeIcon: Record<string, string> = { Road: "🚛", Air: "✈️", Sea: "🚢" }

const CLIENTS = ["Apex Pharma Ltd", "GlobalTex Fabrics", "Sunrise Electronics", "MediSupply Corp", "AutoParts India", "FreshFarm Organics"] as const
const CLIENT_META: Record<string, { init: string; color: string }> = {
  "Apex Pharma Ltd": { init: "AP", color: "bg-blue-500" },
  "GlobalTex Fabrics": { init: "GT", color: "bg-amber-500" },
  "Sunrise Electronics": { init: "SE", color: "bg-emerald-500" },
  "MediSupply Corp": { init: "MS", color: "bg-rose-500" },
  "AutoParts India": { init: "AI", color: "bg-cyan-500" },
  "FreshFarm Organics": { init: "FF", color: "bg-orange-500" },
}
const MODES = ["Road", "Air", "Sea"] as const

const emptyForm = { client: "", lines: "", pieces: "", eta: "", mode: "" }

export default function ASNBoardPage() {
  const [asnData, setAsnData] = useState<ASN[]>(initialAsnData)
  const [view, setView] = useState<"kanban" | "table">("kanban")
  const [search, setSearch] = useState("")

  const [filterOpen, setFilterOpen] = useState(false)
  const [modeFilter, setModeFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [draftFilter, setDraftFilter] = useState({ mode: "All", status: "All" })

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<ASN | null>(null)
  const [closeTarget, setCloseTarget] = useState<ASN | null>(null)

  const filtered = asnData.filter(a =>
    (modeFilter === "All" || a.mode === modeFilter) &&
    (statusFilter === "All" || a.status === statusFilter) &&
    (a.id.toLowerCase().includes(search.toLowerCase()) || a.client.toLowerCase().includes(search.toLowerCase()))
  )

  const kpis = [
    { label: "Expected Today", value: String(asnData.filter(a => a.status === "Expected").length), color: "text-blue-400", icon: <Clock className="w-4 h-4" /> },
    { label: "In Receiving", value: String(asnData.filter(a => a.status === "Receiving").length), color: "text-brand", icon: <Package className="w-4 h-4" /> },
    { label: "Discrepancies", value: String(asnData.filter(a => a.discrepancy).length), color: "text-warning", icon: <AlertCircle className="w-4 h-4" /> },
    { label: "Completed", value: String(asnData.filter(a => a.status === "Closed" || a.status === "Put-Away").length), color: "text-success", icon: <CheckCircle2 className="w-4 h-4" /> },
  ]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.client) e.client = "Select a client"
    if (!form.lines.trim()) e.lines = "Line count is required"
    else if (!/^\d+$/.test(form.lines) || Number(form.lines) < 1) e.lines = "Enter a positive whole number"
    if (!form.pieces.trim()) e.pieces = "Piece count is required"
    else if (!/^\d+$/.test(form.pieces) || Number(form.pieces) < 1) e.pieces = "Enter a positive whole number"
    if (!form.eta.trim()) e.eta = "ETA is required"
    if (!form.mode) e.mode = "Select a transport mode"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createASN() {
    if (!validate()) return
    const meta = CLIENT_META[form.client]
    const next: ASN = {
      id: `ASN-${String(asnData.length + 1).padStart(3, "0")}`,
      client: form.client,
      clientInit: meta.init,
      clientColor: meta.color,
      lines: Number(form.lines),
      pieces: Number(form.pieces),
      eta: form.eta.trim(),
      mode: form.mode,
      status: "Expected",
      discrepancy: false,
    }
    setAsnData(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("ASN created", `${next.id} — ${next.pieces} pcs from ${next.client}, ETA ${next.eta}`)
  }

  function advance(a: ASN) {
    const idx = columns.indexOf(a.status)
    if (idx < 0 || idx >= columns.length - 1) return
    const nextStatus = columns[idx + 1]
    if (nextStatus === "Closed") { setCloseTarget(a); return }
    setAsnData(prev => prev.map(x => x.id === a.id ? { ...x, status: nextStatus } : x))
    notify.success(`ASN moved to ${nextStatus}`, `${a.id} — ${a.client}`)
  }

  function closeASN(a: ASN) {
    setAsnData(prev => prev.map(x => x.id === a.id ? { ...x, status: "Closed" } : x))
    notify.success("ASN closed", `${a.id} receipt has been closed out.`)
  }

  function toggleDiscrepancy(a: ASN) {
    setAsnData(prev => prev.map(x => x.id === a.id ? { ...x, discrepancy: !x.discrepancy } : x))
    if (a.discrepancy) notify.success("Discrepancy cleared", `${a.id} reconciled.`)
    else notify.warning("Discrepancy flagged", `${a.id} marked for reconciliation.`)
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <PageHeader title="ASN / Inbound Board" description="Advance shipping notices and incoming client deliveries" className="mb-6" />
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {kpis.map(k => (
          <div key={k.label} className="flex items-center gap-2 p-3 rounded-xl border border-border bg-card">
            <div className={cn("w-9 h-9 rounded-lg bg-card flex items-center justify-center border border-border", k.color)}>{k.icon}</div>
            <div>
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <p className={cn("text-2xl font-bold", k.color)}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[180px] max-w-xs px-3 py-2 rounded-lg border border-border bg-card">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ASNs, clients..." className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground/60" />
        </div>
        <button
          onClick={() => { setDraftFilter({ mode: modeFilter, status: statusFilter }); setFilterOpen(true) }}
          title="Filter ASNs"
          className={cn("flex items-center gap-1.5 px-3 py-2 rounded-lg border bg-card text-sm transition-colors",
            modeFilter !== "All" || statusFilter !== "All" ? "border-brand text-brand" : "border-border text-muted-foreground hover:text-foreground")}>
          <Filter className="w-4 h-4" /> Filter
          {(modeFilter !== "All" || statusFilter !== "All") && (
            <span className="ml-0.5 text-[10px] font-bold bg-brand text-white rounded-full px-1.5">
              {[modeFilter !== "All", statusFilter !== "All"].filter(Boolean).length}
            </span>
          )}
        </button>
        <ExportButton data={filtered.map(a => ({ id: a.id, client: a.client, lines: a.lines, pieces: a.pieces, eta: a.eta, mode: a.mode, status: a.status, discrepancy: a.discrepancy }))} filename="3pl-asn" />
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => setView("kanban")} title="Kanban view" className={cn("w-8 h-8 flex items-center justify-center rounded-lg border transition-colors", view === "kanban" ? "bg-brand border-brand text-white" : "border-border text-muted-foreground")}><LayoutGrid className="w-4 h-4" /></button>
          <button onClick={() => setView("table")} title="Table view" className={cn("w-8 h-8 flex items-center justify-center rounded-lg border transition-colors", view === "table" ? "bg-brand border-brand text-white" : "border-border text-muted-foreground")}><List className="w-4 h-4" /></button>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setErrors({}); setCreateOpen(true) }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
          <Plus className="w-4 h-4" /> New ASN
        </button>
      </div>

      {view === "kanban" ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map(col => {
            const colItems = filtered.filter(a => a.status === col)
            return (
              <div key={col} className="shrink-0 w-64">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{col}</span>
                  <span className="text-xs font-bold bg-muted px-2 py-0.5 rounded-full text-foreground">{colItems.length}</span>
                </div>
                <div className="space-y-3">
                  {colItems.map(a => (
                    <div key={a.id} onClick={() => setDetail(a)} className={cn("p-4 rounded-xl border border-border bg-card border-l-4 hover:border-brand/40 transition-all cursor-pointer", statusColors[a.status])}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0", a.clientColor)}>{a.clientInit}</div>
                          <div>
                            <p className="text-xs font-semibold text-foreground leading-tight">{a.client}</p>
                            <p className="text-[10px] text-muted-foreground">{a.id}</p>
                          </div>
                        </div>
                        {a.discrepancy && <AlertCircle className="w-4 h-4 text-warning shrink-0" />}
                      </div>
                      <div className="space-y-1 text-[11px] text-muted-foreground">
                        <div className="flex justify-between"><span>{a.lines} lines · {a.pieces} pcs</span><span>{modeIcon[a.mode]}</span></div>
                        <div className="flex items-center gap-1"><Truck className="w-3 h-3" /><span>{a.eta}</span></div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <button onClick={e => { e.stopPropagation(); setDetail(a) }} title="View ASN detail" className="flex-1 flex items-center justify-center gap-1 text-[11px] text-brand hover:underline font-medium">
                          View ASN <ChevronRight className="w-3 h-3" />
                        </button>
                        {a.status !== "Closed" && (
                          <button onClick={e => { e.stopPropagation(); advance(a) }} title={`Advance to ${columns[columns.indexOf(a.status) + 1]}`} className="text-[11px] font-medium text-success hover:underline">
                            Advance
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {colItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 rounded-xl border border-dashed border-border text-muted-foreground">
                      <Package className="w-6 h-6 mb-1 opacity-40" />
                      <span className="text-xs">No ASNs</span>
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
              <tr className="border-b border-border bg-muted/50">
                {["ASN Ref", "Client", "Lines / Pieces", "ETA", "Mode", "Status", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={a.id} className={cn("border-b border-border/50 hover:bg-muted/20 transition-colors", i % 2 === 0 ? "" : "bg-muted/5")}>
                  <td className="px-4 py-3 text-xs font-mono font-semibold text-brand">{a.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold", a.clientColor)}>{a.clientInit}</div>
                      <span className="text-xs font-medium text-foreground">{a.client}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{a.lines} lines · {a.pieces} pcs</td>
                  <td className="px-4 py-3 text-xs text-foreground">{a.eta}</td>
                  <td className="px-4 py-3 text-xs">{modeIcon[a.mode]} {a.mode}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", statusBgColors[a.status])}>{a.status}</span>
                      <button onClick={() => toggleDiscrepancy(a)} title={a.discrepancy ? "Clear discrepancy" : "Flag discrepancy"}>
                        <AlertCircle className={cn("w-3.5 h-3.5 transition-colors", a.discrepancy ? "text-warning" : "text-muted-foreground/40 hover:text-warning")} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setDetail(a)} title="View ASN detail" className="flex items-center gap-1 text-xs text-brand hover:underline">View <ChevronRight className="w-3 h-3" /></button>
                      {a.status !== "Closed" && (
                        <button onClick={() => advance(a)} title={`Advance to ${columns[columns.indexOf(a.status) + 1]}`} className="text-xs text-success hover:underline">Advance</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No ASNs match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Filter modal */}
      <Modal
        open={filterOpen}
        onOpenChange={setFilterOpen}
        title="Filter ASNs"
        description="Narrow the board by transport mode and stage"
        size="sm"
        footer={
          <ModalActions
            onCancel={() => { setModeFilter("All"); setStatusFilter("All"); setFilterOpen(false); notify.info("Filters cleared", "Showing all ASNs.") }}
            cancelLabel="Clear All"
            onSubmit={() => {
              setModeFilter(draftFilter.mode); setStatusFilter(draftFilter.status); setFilterOpen(false)
              notify.success("Filters applied", `Mode: ${draftFilter.mode} · Stage: ${draftFilter.status}`)
            }}
            submitLabel="Apply Filters"
          />
        }
      >
        <div className="space-y-4">
          <Field label="Transport Mode">
            <Select value={draftFilter.mode} onChange={e => setDraftFilter({ ...draftFilter, mode: e.target.value })} options={["All", ...MODES]} />
          </Field>
          <Field label="Stage">
            <Select value={draftFilter.status} onChange={e => setDraftFilter({ ...draftFilter, status: e.target.value })} options={["All", ...columns]} />
          </Field>
        </div>
      </Modal>

      {/* Create ASN */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="New ASN"
        description="Record an advance shipping notice for an inbound receipt"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createASN} submitLabel="Create ASN" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Client" required error={errors.client}>
            <Select value={form.client} invalid={!!errors.client} onChange={e => setForm({ ...form, client: e.target.value })} options={CLIENTS} placeholder="Select Client" />
          </Field>
          <Field label="Transport Mode" required error={errors.mode}>
            <Select value={form.mode} invalid={!!errors.mode} onChange={e => setForm({ ...form, mode: e.target.value })} options={MODES} placeholder="Select Mode" />
          </Field>
          <Field label="Line Count" required error={errors.lines}>
            <TextInput value={form.lines} invalid={!!errors.lines} onChange={e => setForm({ ...form, lines: e.target.value })} placeholder="e.g. 12" inputMode="numeric" />
          </Field>
          <Field label="Piece Count" required error={errors.pieces}>
            <TextInput value={form.pieces} invalid={!!errors.pieces} onChange={e => setForm({ ...form, pieces: e.target.value })} placeholder="e.g. 480" inputMode="numeric" />
          </Field>
          <Field label="ETA" required error={errors.eta} hint="e.g. Today 14:00 or Jul 22">
            <TextInput value={form.eta} invalid={!!errors.eta} onChange={e => setForm({ ...form, eta: e.target.value })} placeholder="Today 14:00" />
          </Field>
        </div>
      </Modal>

      {/* ASN detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Advance shipping notice detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="ASN Ref" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Client" value={detail.client} />
            <DetailRow label="Lines" value={String(detail.lines)} />
            <DetailRow label="Pieces" value={detail.pieces.toLocaleString()} />
            <DetailRow label="ETA" value={detail.eta} />
            <DetailRow label="Transport Mode" value={`${modeIcon[detail.mode]} ${detail.mode}`} />
            <DetailRow label="Stage" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusBgColors[detail.status])}>{detail.status}</span>} />
            <DetailRow label="Discrepancy" value={detail.discrepancy ? <span className="text-warning font-semibold">Flagged</span> : <span className="text-success">None</span>} />
          </div>
        )}
      </Drawer>

      {/* Close confirmation */}
      <ConfirmDialog
        open={!!closeTarget}
        onOpenChange={(o) => !o && setCloseTarget(null)}
        title="Close this ASN?"
        message={`${closeTarget?.id} for ${closeTarget?.client} will be closed out. No further receiving is possible.`}
        confirmLabel="Close ASN"
        cancelLabel="Keep Open"
        tone="brand"
        onConfirm={() => closeTarget && closeASN(closeTarget)}
      />
    </div>
  )
}
