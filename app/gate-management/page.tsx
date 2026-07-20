"use client"

import { useState } from "react"
import {
  Truck, Plus, Clock, CheckCircle, XCircle, LogIn, LogOut,
  ChevronDown, Eye, Settings2, Search, Filter, Trash2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type GateEntry = {
  id: string; vehicle: string; driver: string; client: string; purpose: string
  gate: string; inTime: string; outTime: string; status: string; type: string
}

const initialGateEntries: GateEntry[] = [
  { id: "GE-2024-089", vehicle: "TN-45-AB-1234", driver: "Ravi Kumar", client: "Acme Foods", purpose: "Inbound", gate: "Gate 1", inTime: "08:15 AM", outTime: "—", status: "Inside", type: "Truck" },
  { id: "GE-2024-088", vehicle: "MH-12-CD-5678", driver: "Suresh Yadav", client: "Global Oils", purpose: "Outbound", gate: "Gate 2", inTime: "07:45 AM", outTime: "09:30 AM", status: "Exited", type: "Container" },
  { id: "GE-2024-087", vehicle: "DL-01-EF-9012", driver: "Amrit Singh", client: "Agro Corp", purpose: "Inbound", gate: "Gate 1", inTime: "06:30 AM", outTime: "08:45 AM", status: "Exited", type: "Truck" },
  { id: "GE-2024-086", vehicle: "KA-05-GH-3456", driver: "Mohan Das", client: "Sweet Mills", purpose: "Inbound", gate: "Gate 3", inTime: "—", outTime: "—", status: "Expected", type: "Mini Truck" },
  { id: "GE-2024-085", vehicle: "AP-29-IJ-7890", driver: "Venkat Rao", client: "Salt Works", purpose: "Outbound", gate: "Gate 2", inTime: "04:00 AM", outTime: "05:45 AM", status: "Exited", type: "Truck" },
  { id: "GE-2024-084", vehicle: "TS-09-KL-1122", driver: "Kiran Babu", client: "Fresh Farms", purpose: "Inbound", gate: "Gate 1", inTime: "09:00 AM", outTime: "—", status: "Loading", type: "Container" },
]

const statusConfig: Record<string, { color: string; bg: string; dot: string }> = {
  Inside: { color: "text-brand", bg: "bg-brand/15", dot: "bg-brand" },
  Exited: { color: "text-success", bg: "bg-success/15", dot: "bg-success" },
  Expected: { color: "text-warning", bg: "bg-warning/15", dot: "bg-warning" },
  Loading: { color: "text-purple-400", bg: "bg-purple-400/15", dot: "bg-purple-400" },
}

const purposeConfig: Record<string, { color: string; bg: string }> = {
  Inbound: { color: "text-success", bg: "bg-success/15" },
  Outbound: { color: "text-warning", bg: "bg-warning/15" },
}

const gateMeta = [
  { name: "Gate 1", type: "Inbound" },
  { name: "Gate 2", type: "Outbound" },
  { name: "Gate 3", type: "Mixed" },
]

const PURPOSES = ["Inbound", "Outbound", "Transfer", "Vendor Visit"] as const
const CLIENTS = ["Acme Foods", "Global Oils", "Agro Corp", "Sweet Mills", "Salt Works", "Fresh Farms"] as const
const GATES = ["Gate 1", "Gate 2", "Gate 3"] as const
const VEHICLE_TYPES = ["Truck", "Container", "Mini Truck", "Trailer", "Van"] as const
const STATUSES = ["Expected", "Inside", "Loading", "Exited"] as const

const emptyForm = { vehicle: "", driver: "", mobile: "", purpose: "Inbound", client: "", gate: "Gate 1", type: "Truck" }

function nowTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
}

export default function GateManagementPage() {
  const [entries, setEntries] = useState<GateEntry[]>(initialGateEntries)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [showForm, setShowForm] = useState(false)

  // "More Filters" expanding panel
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const [gateFilter, setGateFilter] = useState("All Gates")
  const [purposeFilter, setPurposeFilter] = useState("All Purposes")
  const [typeFilter, setTypeFilter] = useState("All Types")

  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<GateEntry | null>(null)
  const [manage, setManage] = useState<GateEntry | null>(null)
  const [manageStatus, setManageStatus] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<GateEntry | null>(null)

  const extraFilterCount =
    (gateFilter !== "All Gates" ? 1 : 0) +
    (purposeFilter !== "All Purposes" ? 1 : 0) +
    (typeFilter !== "All Types" ? 1 : 0)

  const filtered = entries.filter((g) => {
    const q = search.toLowerCase()
    return (
      (g.id.toLowerCase().includes(q) || g.vehicle.toLowerCase().includes(q) || g.driver.toLowerCase().includes(q) || g.client.toLowerCase().includes(q)) &&
      (statusFilter === "All Status" || g.status === statusFilter) &&
      (gateFilter === "All Gates" || g.gate === gateFilter) &&
      (purposeFilter === "All Purposes" || g.purpose === purposeFilter) &&
      (typeFilter === "All Types" || g.type === typeFilter)
    )
  })

  const inside = entries.filter((g) => g.status === "Inside" || g.status === "Loading").length
  const expected = entries.filter((g) => g.status === "Expected").length

  const gates = gateMeta.map((g) => ({
    ...g,
    vehicles: entries.filter((e) => e.gate === g.name && (e.status === "Inside" || e.status === "Loading")).length,
  })).map((g) => ({ ...g, status: g.vehicles > 0 ? "Active" : "Idle" }))

  function validate() {
    const e: Record<string, string> = {}
    if (!form.vehicle.trim()) e.vehicle = "Vehicle number is required"
    else if (entries.some((x) => x.vehicle.toLowerCase() === form.vehicle.trim().toLowerCase() && x.status !== "Exited"))
      e.vehicle = "This vehicle is already inside the premises"
    if (!form.driver.trim()) e.driver = "Driver name is required"
    if (form.mobile.trim() && !/^[+\d][\d\s-]{7,}$/.test(form.mobile.trim())) e.mobile = "Enter a valid mobile number"
    if (!form.purpose) e.purpose = "Select a purpose"
    if (!form.client) e.client = "Select a client"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function registerEntry() {
    if (!validate()) return
    const seq = 90 + entries.filter((x) => x.id.startsWith("GE-2024-0")).length - initialGateEntries.length
    const next: GateEntry = {
      id: `GE-2024-0${seq}`,
      vehicle: form.vehicle.trim().toUpperCase(),
      driver: form.driver.trim(),
      client: form.client,
      purpose: form.purpose,
      gate: form.gate,
      inTime: nowTime(),
      outTime: "—",
      status: "Inside",
      type: form.type,
    }
    setEntries((prev) => [next, ...prev])
    setShowForm(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Gate entry registered", `${next.id} — ${next.vehicle} checked in at ${next.gate}.`)
  }

  function openManage(entry: GateEntry) {
    setManage(entry)
    setManageStatus(entry.status)
  }

  function saveManage() {
    if (!manage) return
    const exiting = manageStatus === "Exited" && manage.status !== "Exited"
    setEntries((prev) => prev.map((x) => x.id === manage.id
      ? { ...x, status: manageStatus, outTime: exiting ? nowTime() : (manageStatus === "Exited" ? x.outTime : "—") }
      : x))
    notify.success("Status updated", `${manage.id} is now ${manageStatus}.`)
    setManage(null)
  }

  function deleteEntry(entry: GateEntry) {
    setEntries((prev) => prev.filter((x) => x.id !== entry.id))
    notify.warning("Entry removed", `${entry.id} has been deleted from the register.`)
  }

  function clearExtraFilters() {
    setGateFilter("All Gates")
    setPurposeFilter("All Purposes")
    setTypeFilter("All Types")
    notify.info("Filters cleared", "Showing all gates, purposes and vehicle types.")
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="w-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gate Management</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Vehicle entry & exit management</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Gate Entry
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Vehicles Inside", value: inside.toString(), icon: <Truck className="w-5 h-5" />, color: "text-brand", bg: "bg-brand/10" },
            { label: "Expected Today", value: expected.toString(), icon: <Clock className="w-5 h-5" />, color: "text-warning", bg: "bg-warning/10" },
            { label: "Total Today", value: entries.length.toString(), icon: <LogIn className="w-5 h-5" />, color: "text-success", bg: "bg-success/10" },
            { label: "Exited Today", value: entries.filter((g) => g.status === "Exited").length.toString(), icon: <LogOut className="w-5 h-5" />, color: "text-muted-foreground", bg: "bg-muted/50" },
          ].map((s, i) => (
            <div key={i} className="p-5 rounded-2xl border border-border bg-card">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", s.bg)}>
                  <span className={s.color}>{s.icon}</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Gate Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {gates.map((gate) => (
            <button
              key={gate.name}
              onClick={() => setGateFilter(gateFilter === gate.name ? "All Gates" : gate.name)}
              title={`Filter table by ${gate.name}`}
              className={cn(
                "p-4 rounded-2xl border bg-card flex items-center gap-3 text-left transition-colors hover:border-brand/50",
                gateFilter === gate.name ? "border-brand" : "border-border",
              )}
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", gate.status === "Active" ? "bg-success/15" : "bg-muted")}>
                <Truck className={cn("w-5 h-5", gate.status === "Active" ? "text-success" : "text-muted-foreground")} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-foreground">{gate.name}</span>
                  <span className={cn("w-2 h-2 rounded-full", gate.status === "Active" ? "bg-success" : "bg-muted-foreground")} />
                </div>
                <p className="text-xs text-muted-foreground">{gate.type} • {gate.vehicles} vehicle{gate.vehicles !== 1 ? "s" : ""}</p>
              </div>
            </button>
          ))}
        </div>

        {/* New Entry Form */}
        {showForm && (
          <div className="p-5 rounded-2xl border border-brand/30 bg-brand/5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">New Gate Entry</h2>
              <button onClick={() => { setShowForm(false); setForm(emptyForm); setErrors({}) }} title="Close form" className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Vehicle Number *</label>
                <input
                  value={form.vehicle}
                  onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
                  className={cn("w-full px-3 py-2 rounded-xl border bg-background text-sm text-foreground outline-none focus:border-brand transition-colors placeholder:text-muted-foreground", errors.vehicle ? "border-danger" : "border-border")}
                  placeholder="e.g. TN-45-AB-1234"
                />
                {errors.vehicle && <p className="mt-1 text-xs text-danger">{errors.vehicle}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Driver Name *</label>
                <input
                  value={form.driver}
                  onChange={(e) => setForm({ ...form, driver: e.target.value })}
                  className={cn("w-full px-3 py-2 rounded-xl border bg-background text-sm text-foreground outline-none focus:border-brand transition-colors placeholder:text-muted-foreground", errors.driver ? "border-danger" : "border-border")}
                  placeholder="Driver name"
                />
                {errors.driver && <p className="mt-1 text-xs text-danger">{errors.driver}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Driver Mobile</label>
                <input
                  type="tel"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  className={cn("w-full px-3 py-2 rounded-xl border bg-background text-sm text-foreground outline-none focus:border-brand transition-colors placeholder:text-muted-foreground", errors.mobile ? "border-danger" : "border-border")}
                  placeholder="+91 XXXXXXXXXX"
                />
                {errors.mobile && <p className="mt-1 text-xs text-danger">{errors.mobile}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Purpose *</label>
                <div className="relative">
                  <select value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-brand">
                    {PURPOSES.map((p) => <option key={p}>{p}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Client *</label>
                <div className="relative">
                  <select
                    value={form.client}
                    onChange={(e) => setForm({ ...form, client: e.target.value })}
                    className={cn("w-full appearance-none pl-3 pr-8 py-2 rounded-xl border bg-background text-sm text-foreground outline-none focus:border-brand", errors.client ? "border-danger" : "border-border")}
                  >
                    <option value="">Select client...</option>
                    {CLIENTS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.client && <p className="mt-1 text-xs text-danger">{errors.client}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Gate</label>
                <div className="relative">
                  <select value={form.gate} onChange={(e) => setForm({ ...form, gate: e.target.value })} className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-brand">
                    {GATES.map((g) => <option key={g}>{g}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Vehicle Type</label>
                <div className="relative">
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-brand">
                    {VEHICLE_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => { setShowForm(false); setForm(emptyForm); setErrors({}) }} className="px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors">Cancel</button>
              <button onClick={registerEntry} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
                <CheckCircle className="w-4 h-4" /> Register Entry
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-xl border border-border bg-card">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground text-foreground" placeholder="Search vehicle, driver, client..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="relative">
              <select className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-border bg-card text-sm text-foreground outline-none cursor-pointer" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {["All Status", "Inside", "Expected", "Loading", "Exited"].map((s) => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <button
              onClick={() => setShowMoreFilters((v) => !v)}
              title="Toggle additional filters"
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl border bg-card text-sm transition-colors",
                showMoreFilters || extraFilterCount > 0 ? "border-brand text-brand" : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <Filter className="w-4 h-4" /> More Filters
              {extraFilterCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-brand text-white text-[10px] font-semibold">{extraFilterCount}</span>
              )}
            </button>
            <ExportButton data={filtered} filename="gate-management" />
          </div>

          {showMoreFilters && (
            <div className="p-4 rounded-2xl border border-border bg-card grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Gate</label>
                <div className="relative">
                  <select value={gateFilter} onChange={(e) => setGateFilter(e.target.value)} className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-brand">
                    {["All Gates", ...GATES].map((g) => <option key={g}>{g}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Purpose</label>
                <div className="relative">
                  <select value={purposeFilter} onChange={(e) => setPurposeFilter(e.target.value)} className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-brand">
                    {["All Purposes", ...PURPOSES].map((p) => <option key={p}>{p}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Vehicle Type</label>
                <div className="relative">
                  <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-brand">
                    {["All Types", ...VEHICLE_TYPES].map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <button
                onClick={clearExtraFilters}
                className="px-4 py-2 rounded-xl border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors"
              >
                Clear Filters
              </button>
              <p className="sm:col-span-3 lg:col-span-4 text-xs text-muted-foreground">
                Showing {filtered.length} of {entries.length} gate entries.
              </p>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Entry ID", "Vehicle No.", "Driver", "Client", "Purpose", "Gate", "In Time", "Out Time", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry, i) => (
                  <tr key={entry.id} className={cn("border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors", i % 2 === 1 ? "bg-muted/10" : "")}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button onClick={() => setDetail(entry)} title="View entry detail" className="text-brand font-medium hover:underline cursor-pointer">{entry.id}</button>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground font-semibold whitespace-nowrap">{entry.vehicle}</td>
                    <td className="px-4 py-3 text-foreground whitespace-nowrap">{entry.driver}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{entry.client}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", purposeConfig[entry.purpose]?.bg, purposeConfig[entry.purpose]?.color)}>
                        {entry.purpose}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{entry.gate}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{entry.inTime}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{entry.outTime}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium w-fit", statusConfig[entry.status]?.bg, statusConfig[entry.status]?.color)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", statusConfig[entry.status]?.dot)} />
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <RowActions
                        items={[
                          { label: "View details", icon: <Eye />, onSelect: () => setDetail(entry) },
                          { label: "Manage entry", icon: <Settings2 />, onSelect: () => openManage(entry) },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={10} className="px-4 py-10 text-center text-sm text-muted-foreground">No gate entries match your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Entry detail */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Gate entry detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Entry ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Vehicle No." value={<span className="font-mono">{detail.vehicle}</span>} />
            <DetailRow label="Vehicle Type" value={detail.type} />
            <DetailRow label="Driver" value={detail.driver} />
            <DetailRow label="Client" value={detail.client} />
            <DetailRow label="Purpose" value={detail.purpose} />
            <DetailRow label="Gate" value={detail.gate} />
            <DetailRow label="In Time" value={detail.inTime} />
            <DetailRow label="Out Time" value={detail.outTime} />
            <DetailRow
              label="Status"
              value={
                <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusConfig[detail.status]?.bg, statusConfig[detail.status]?.color)}>
                  {detail.status}
                </span>
              }
            />
          </div>
        )}
      </Drawer>

      {/* Manage entry */}
      <Modal
        open={!!manage}
        onOpenChange={(o) => !o && setManage(null)}
        title="Manage Gate Entry"
        description={manage ? `${manage.id} — ${manage.vehicle}` : ""}
        size="sm"
        footer={<ModalActions onCancel={() => setManage(null)} onSubmit={saveManage} submitLabel="Save Status" />}
      >
        <div className="space-y-4">
          <Field label="Status" required hint="Setting status to Exited stamps the out time.">
            <Select value={manageStatus} onChange={(e) => setManageStatus(e.target.value)} options={STATUSES} />
          </Field>
          <button
            onClick={() => { setDeleteTarget(manage); setManage(null) }}
            className="flex items-center gap-2 text-sm font-medium text-danger hover:underline"
          >
            <Trash2 className="w-4 h-4" /> Delete this entry
          </button>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this gate entry?"
        message={`Entry ${deleteTarget?.id} for ${deleteTarget?.vehicle} will be permanently removed from the register.`}
        confirmLabel="Delete Entry"
        cancelLabel="Keep It"
        onConfirm={() => deleteTarget && deleteEntry(deleteTarget)}
      />
    </div>
  )
}
