"use client"
import { useState } from "react"
import { LogIn, Truck, Plus, Search, Eye, Check, X as XIcon, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"
import { nextRecordId } from "@/lib/next-id"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Entry = {
  id: string; vehicle: string; driver: string; type: string
  purpose: string; dock: string; time: string; status: string
}

const initialEntries: Entry[] = [
  { id:"ENT-001", vehicle:"TN-09-AX-4421", driver:"Suresh Kumar", type:"Inbound Truck", purpose:"GRN Delivery", dock:"Dock 3", time:"08:42", status:"Checked In" },
  { id:"ENT-002", vehicle:"AP-28-BX-1190", driver:"Rajan Pillai", type:"Delivery Van", purpose:"Courier Pickup", dock:"Dock 1", time:"09:15", status:"In Premises" },
  { id:"ENT-003", vehicle:"MH-02-CX-7734", driver:"Anil Verma", type:"Container", purpose:"Export Loading", dock:"Dock 5", time:"10:30", status:"Loading" },
  { id:"ENT-004", vehicle:"KA-51-DX-2200", driver:"Pradeep Nair", type:"Inbound Truck", purpose:"GRN Delivery", dock:"Dock 2", time:"11:00", status:"Pending" },
  { id:"ENT-005", vehicle:"TS-07-ST-4545", driver:"Ravi Kumar", type:"Inbound Truck", purpose:"GRN Delivery", dock:"Dock 4", time:"07:20", status:"Checked In" },
  { id:"ENT-006", vehicle:"KL-11-WX-6767", driver:"Girish Nair", type:"Delivery Van", purpose:"Courier Pickup", dock:"Dock 6", time:"07:55", status:"In Premises" },
  { id:"ENT-007", vehicle:"GJ-18-OP-4455", driver:"Vikram Sharma", type:"Trailer", purpose:"Export Loading", dock:"Dock 5", time:"08:10", status:"Loading" },
  { id:"ENT-008", vehicle:"RJ-14-QR-6677", driver:"Rahul Mehta", type:"Mini Truck", purpose:"Transfer", dock:"Dock 2", time:"08:25", status:"Checked In" },
  { id:"ENT-009", vehicle:"MP-09-ST-8899", driver:"Sanjay Gupta", type:"Container", purpose:"Export Loading", dock:"Dock 3", time:"08:50", status:"In Premises" },
  { id:"ENT-010", vehicle:"UP-32-UV-1010", driver:"Meena Patel", type:"Delivery Van", purpose:"Vendor Visit", dock:"Dock 1", time:"09:05", status:"Pending" },
  { id:"ENT-011", vehicle:"WB-06-WX-2020", driver:"Deepa Menon", type:"Inbound Truck", purpose:"GRN Delivery", dock:"Dock 4", time:"09:20", status:"Checked In" },
  { id:"ENT-012", vehicle:"HR-26-YZ-3030", driver:"Kavitha Rao", type:"Container", purpose:"Transfer", dock:"Dock 6", time:"09:45", status:"Loading" },
  { id:"ENT-013", vehicle:"PB-11-AB-4040", driver:"Anita Desai", type:"Mini Truck", purpose:"Courier Pickup", dock:"Dock 2", time:"10:00", status:"Cancelled" },
  { id:"ENT-014", vehicle:"OD-02-CD-5050", driver:"Suresh Yadav", type:"Trailer", purpose:"Export Loading", dock:"Dock 5", time:"10:15", status:"In Premises" },
  { id:"ENT-015", vehicle:"CG-04-EF-6060", driver:"Arjun Nair", type:"Inbound Truck", purpose:"GRN Delivery", dock:"Dock 3", time:"10:40", status:"Checked In" },
  { id:"ENT-016", vehicle:"JH-05-GH-7070", driver:"Mohan Das", type:"Delivery Van", purpose:"Vendor Visit", dock:"Dock 1", time:"10:55", status:"Pending" },
  { id:"ENT-017", vehicle:"BR-01-IJ-8080", driver:"Amrit Singh", type:"Container", purpose:"Export Loading", dock:"Dock 6", time:"11:10", status:"Loading" },
  { id:"ENT-018", vehicle:"TN-22-KL-9090", driver:"Venkat Rao", type:"Mini Truck", purpose:"Transfer", dock:"Dock 2", time:"11:25", status:"Checked In" },
  { id:"ENT-019", vehicle:"MH-43-MN-1212", driver:"Kiran Babu", type:"Inbound Truck", purpose:"GRN Delivery", dock:"Dock 4", time:"11:40", status:"In Premises" },
  { id:"ENT-020", vehicle:"KA-19-OP-2323", driver:"Priya Sharma", type:"Trailer", purpose:"Export Loading", dock:"Dock 5", time:"12:05", status:"Loading" },
  { id:"ENT-021", vehicle:"AP-16-QR-3434", driver:"Naveen Reddy", type:"Delivery Van", purpose:"Courier Pickup", dock:"Dock 1", time:"12:20", status:"Pending" },
  { id:"ENT-022", vehicle:"DL-08-UV-5656", driver:"Rohit Malhotra", type:"Container", purpose:"Transfer", dock:"Dock 3", time:"12:45", status:"Checked In" },
  { id:"ENT-023", vehicle:"KL-07-MN-2233", driver:"Lakshmi Iyer", type:"Inbound Truck", purpose:"GRN Delivery", dock:"Dock 6", time:"13:00", status:"In Premises" },
  { id:"ENT-024", vehicle:"GJ-27-YZ-7878", driver:"Manoj Bhat", type:"Mini Truck", purpose:"Vendor Visit", dock:"Dock 2", time:"13:15", status:"Cancelled" },
  { id:"ENT-025", vehicle:"RJ-19-AB-8989", driver:"Sunita Joshi", type:"Trailer", purpose:"Export Loading", dock:"Dock 5", time:"13:40", status:"Loading" },
  { id:"ENT-026", vehicle:"MH-31-CD-9191", driver:"Arun Prasad", type:"Inbound Truck", purpose:"GRN Delivery", dock:"Dock 4", time:"14:00", status:"Pending" },
]

const VEHICLE_TYPES = ["Inbound Truck", "Delivery Van", "Container", "Mini Truck", "Trailer"] as const
const PURPOSES = ["GRN Delivery", "Courier Pickup", "Export Loading", "Transfer", "Vendor Visit"] as const
const DOCKS = ["Dock 1", "Dock 2", "Dock 3", "Dock 4", "Dock 5", "Dock 6"] as const
const STATUSES = ["Pending", "Checked In", "In Premises", "Loading"] as const

const statusClass = (s: string) =>
  s === "Checked In" ? "bg-success/10 text-success"
  : s === "Loading" ? "bg-brand/10 text-brand"
  : s === "Pending" ? "bg-amber-50 text-amber-600"
  : s === "Cancelled" ? "bg-danger/10 text-danger"
  : "bg-muted text-muted-foreground"

const emptyForm = { vehicle: "", driver: "", type: "", purpose: "", dock: "" }

export default function GateEntryPage() {
  const [entries, setEntries] = useState<Entry[]>(initialEntries)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const [dockFilter, setDockFilter] = useState("All Docks")
  const [typeFilter, setTypeFilter] = useState("All Types")

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Entry | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Entry | null>(null)

  const extraFilterCount = (dockFilter !== "All Docks" ? 1 : 0) + (typeFilter !== "All Types" ? 1 : 0)

  const filtered = entries.filter((e) => {
    const q = search.toLowerCase()
    return (
      (e.id.toLowerCase().includes(q) || e.vehicle.toLowerCase().includes(q) || e.driver.toLowerCase().includes(q)) &&
      (statusFilter === "All" || e.status === statusFilter) &&
      (dockFilter === "All Docks" || e.dock === dockFilter) &&
      (typeFilter === "All Types" || e.type === typeFilter)
    )
  })

  const stats = [
    { label: "Total Entries", value: entries.length },
    { label: "In Premises", value: entries.filter((e) => e.status === "In Premises" || e.status === "Loading").length },
    { label: "Checked In", value: entries.filter((e) => e.status === "Checked In").length },
    { label: "Pending", value: entries.filter((e) => e.status === "Pending").length },
  ]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.vehicle.trim()) e.vehicle = "Vehicle number is required"
    else if (entries.some((x) => x.vehicle.toLowerCase() === form.vehicle.trim().toLowerCase() && x.status !== "Cancelled"))
      e.vehicle = "This vehicle already has an open entry"
    if (!form.driver.trim()) e.driver = "Driver name is required"
    if (!form.type) e.type = "Select a vehicle type"
    if (!form.purpose) e.purpose = "Select a purpose"
    if (!form.dock) e.dock = "Assign a dock"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createEntry() {
    if (!validate()) return
    const next: Entry = {
      id: nextRecordId(entries.map(e => e.id), /^ENT-(\d+)$/, "ENT-", 3),
      vehicle: form.vehicle.trim().toUpperCase(),
      driver: form.driver.trim(),
      type: form.type,
      purpose: form.purpose,
      dock: form.dock,
      time: new Date().toTimeString().slice(0, 5),
      status: "Pending",
    }
    setEntries((prev) => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Entry recorded", `${next.id} — ${next.vehicle} assigned to ${next.dock}.`)
  }

  function advance(e: Entry) {
    const order = ["Pending", "Checked In", "In Premises", "Loading"]
    const idx = order.indexOf(e.status)
    const nextStatus = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : "Loading"
    setEntries((prev) => prev.map((x) => (x.id === e.id ? { ...x, status: nextStatus } : x)))
    notify.success("Status advanced", `${e.id} moved to ${nextStatus}.`)
  }

  function cancelEntry(e: Entry) {
    setEntries((prev) => prev.map((x) => (x.id === e.id ? { ...x, status: "Cancelled" } : x)))
    notify.warning("Entry cancelled", `${e.id} has been cancelled.`)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Gate Entry</h1><p className="text-sm text-muted-foreground mt-1">Record and manage inbound vehicle entries</p></div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="gate-entries" />
          <button type="button" onClick={() => { setForm(emptyForm); setErrors({}); setCreateOpen(true) }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> New Entry</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="mb-2">{s.label === "Total Entries" ? <LogIn className="w-5 h-5 text-brand" /> : <Truck className="w-5 h-5 text-brand" />}</div>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search entry ID, vehicle, driver..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
          </div>
          {["All", ...STATUSES].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", statusFilter === s ? "bg-brand text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground")}>{s}</button>
          ))}
          <button
            onClick={() => setShowMoreFilters((v) => !v)}
            title="Toggle additional filters"
            className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border bg-card text-sm transition-colors", showMoreFilters || extraFilterCount > 0 ? "border-brand text-brand" : "border-border text-muted-foreground hover:text-foreground")}
          >
            <Filter className="w-4 h-4" /> More Filters
            {extraFilterCount > 0 && <span className="px-1.5 py-0.5 rounded-full bg-brand text-white text-[10px] font-semibold">{extraFilterCount}</span>}
          </button>
        </div>

        {showMoreFilters && (
          <div className="p-4 rounded-xl border border-border bg-card grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <Field label="Dock">
              <Select value={dockFilter} onChange={(e) => setDockFilter(e.target.value)} options={["All Docks", ...DOCKS]} />
            </Field>
            <Field label="Vehicle Type">
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} options={["All Types", ...VEHICLE_TYPES]} />
            </Field>
            <button
              onClick={() => { setDockFilter("All Docks"); setTypeFilter("All Types"); notify.info("Filters cleared", "Showing all docks and vehicle types.") }}
              className="px-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors"
            >
              Clear Filters
            </button>
            <p className="sm:col-span-3 text-xs text-muted-foreground">Showing {filtered.length} of {entries.length} entries.</p>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["Entry ID","Vehicle","Driver","Type","Purpose","Dock","Time","Status","Actions"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(e=>(
              <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{e.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{e.vehicle}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.driver}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.type}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.purpose}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.dock}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.time}</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusClass(e.status))}>{e.status}</span></td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: "View details", icon: <Eye />, onSelect: () => setDetail(e) },
                      ...(e.status !== "Cancelled" && e.status !== "Loading"
                        ? [{ label: "Advance status", icon: <Check />, onSelect: () => advance(e), tone: "success" as const }]
                        : []),
                      ...(e.status !== "Cancelled"
                        ? [{ label: "Cancel entry", icon: <XIcon />, onSelect: () => setCancelTarget(e), tone: "danger" as const }]
                        : []),
                    ]}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">No gate entries match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create entry */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="New Gate Entry"
        description="Register an inbound vehicle at the gate"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createEntry} submitLabel="Record Entry" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Vehicle Number" required error={errors.vehicle}>
            <TextInput value={form.vehicle} invalid={!!errors.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} placeholder="e.g. TN-09-AX-4421" />
          </Field>
          <Field label="Driver Name" required error={errors.driver}>
            <TextInput value={form.driver} invalid={!!errors.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })} placeholder="e.g. Suresh Kumar" />
          </Field>
          <Field label="Vehicle Type" required error={errors.type}>
            <Select value={form.type} invalid={!!errors.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={VEHICLE_TYPES} placeholder="Select Type" />
          </Field>
          <Field label="Purpose" required error={errors.purpose}>
            <Select value={form.purpose} invalid={!!errors.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} options={PURPOSES} placeholder="Select Purpose" />
          </Field>
          <Field label="Dock" required error={errors.dock}>
            <Select value={form.dock} invalid={!!errors.dock} onChange={(e) => setForm({ ...form, dock: e.target.value })} options={DOCKS} placeholder="Assign Dock" />
          </Field>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Gate entry detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Close</button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Entry ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Vehicle" value={<span className="font-mono">{detail.vehicle}</span>} />
            <DetailRow label="Driver" value={detail.driver} />
            <DetailRow label="Vehicle Type" value={detail.type} />
            <DetailRow label="Purpose" value={detail.purpose} />
            <DetailRow label="Dock" value={detail.dock} />
            <DetailRow label="Entry Time" value={detail.time} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusClass(detail.status))}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(o) => !o && setCancelTarget(null)}
        title="Cancel this gate entry?"
        message={`Entry ${cancelTarget?.id} for ${cancelTarget?.vehicle} will be marked cancelled.`}
        confirmLabel="Cancel Entry"
        cancelLabel="Keep It"
        onConfirm={() => cancelTarget && cancelEntry(cancelTarget)}
      />
    </div>
  )
}
