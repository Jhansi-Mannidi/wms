"use client"
import { useState } from "react"
import { LogOut, Plus, Search, Eye, Check, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"
import { nextRecordId } from "@/lib/next-id"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Exit = {
  id: string; vehicle: string; driver: string; purpose: string
  exitTime: string; dwell: string; clearance: string
}

const initialExits: Exit[] = [
  { id:"EXT-001", vehicle:"TN-09-AX-4411", driver:"Ramesh Pillai", purpose:"Delivery Complete", exitTime:"07:45", dwell:"1h 12m", clearance:"Cleared" },
  { id:"EXT-002", vehicle:"AP-10-BX-8823", driver:"Venkat Rao", purpose:"Pickup Done", exitTime:"09:30", dwell:"45m", clearance:"Cleared" },
  { id:"EXT-003", vehicle:"MH-14-CX-3310", driver:"Santosh Kumar", purpose:"Export Loaded", exitTime:"11:20", dwell:"2h 05m", clearance:"Pending Docs" },
  { id:"EXT-004", vehicle:"KA-51-DX-1198", driver:"Girish Nair", purpose:"GRN Complete", exitTime:"12:00", dwell:"55m", clearance:"Cleared" },
  { id:"EXT-005", vehicle:"TS-07-ST-4545", driver:"Ravi Kumar", purpose:"GRN Complete", exitTime:"06:15", dwell:"38m", clearance:"Cleared" },
  { id:"EXT-006", vehicle:"KL-11-WX-6767", driver:"Arjun Nair", purpose:"Pickup Done", exitTime:"06:50", dwell:"1h 25m", clearance:"Cleared" },
  { id:"EXT-007", vehicle:"GJ-18-OP-4455", driver:"Vikram Sharma", purpose:"Export Loaded", exitTime:"07:10", dwell:"2h 40m", clearance:"Pending Docs" },
  { id:"EXT-008", vehicle:"RJ-14-QR-6677", driver:"Rahul Mehta", purpose:"Vendor Visit Complete", exitTime:"07:35", dwell:"25m", clearance:"Cleared" },
  { id:"EXT-009", vehicle:"MP-09-ST-8899", driver:"Sanjay Gupta", purpose:"Delivery Complete", exitTime:"08:05", dwell:"1h 50m", clearance:"Cleared" },
  { id:"EXT-010", vehicle:"UP-32-UV-1010", driver:"Meena Patel", purpose:"Pickup Done", exitTime:"08:20", dwell:"40m", clearance:"Held" },
  { id:"EXT-011", vehicle:"WB-06-WX-2020", driver:"Deepa Menon", purpose:"GRN Complete", exitTime:"08:55", dwell:"1h 05m", clearance:"Cleared" },
  { id:"EXT-012", vehicle:"HR-26-YZ-3030", driver:"Kavitha Rao", purpose:"Export Loaded", exitTime:"09:40", dwell:"3h 10m", clearance:"Pending Docs" },
  { id:"EXT-013", vehicle:"PB-11-AB-4040", driver:"Anita Desai", purpose:"Delivery Complete", exitTime:"10:05", dwell:"50m", clearance:"Cleared" },
  { id:"EXT-014", vehicle:"OD-02-CD-5050", driver:"Suresh Yadav", purpose:"Vendor Visit Complete", exitTime:"10:25", dwell:"1h 35m", clearance:"Cleared" },
  { id:"EXT-015", vehicle:"CG-04-EF-6060", driver:"Deepa Menon", purpose:"GRN Complete", exitTime:"10:50", dwell:"2h 15m", clearance:"Held" },
  { id:"EXT-016", vehicle:"JH-05-GH-7070", driver:"Mohan Das", purpose:"Pickup Done", exitTime:"11:15", dwell:"35m", clearance:"Cleared" },
  { id:"EXT-017", vehicle:"BR-01-IJ-8080", driver:"Amrit Singh", purpose:"Export Loaded", exitTime:"11:45", dwell:"2h 55m", clearance:"Cleared" },
  { id:"EXT-018", vehicle:"TN-22-KL-9090", driver:"Venkat Rao", purpose:"Delivery Complete", exitTime:"12:10", dwell:"1h 20m", clearance:"Cleared" },
  { id:"EXT-019", vehicle:"MH-43-MN-1212", driver:"Kiran Babu", purpose:"GRN Complete", exitTime:"12:35", dwell:"48m", clearance:"Pending Docs" },
  { id:"EXT-020", vehicle:"KA-19-OP-2323", driver:"Priya Sharma", purpose:"Export Loaded", exitTime:"13:00", dwell:"2h 25m", clearance:"Cleared" },
  { id:"EXT-021", vehicle:"AP-16-QR-3434", driver:"Naveen Reddy", purpose:"Vendor Visit Complete", exitTime:"13:20", dwell:"30m", clearance:"Cleared" },
  { id:"EXT-022", vehicle:"DL-08-UV-5656", driver:"Rohit Malhotra", purpose:"Pickup Done", exitTime:"13:45", dwell:"1h 10m", clearance:"Cleared" },
  { id:"EXT-023", vehicle:"KL-07-MN-2233", driver:"Lakshmi Iyer", purpose:"Delivery Complete", exitTime:"14:05", dwell:"55m", clearance:"Held" },
  { id:"EXT-024", vehicle:"GJ-27-YZ-7878", driver:"Manoj Bhat", purpose:"GRN Complete", exitTime:"14:30", dwell:"1h 45m", clearance:"Cleared" },
  { id:"EXT-025", vehicle:"RJ-19-AB-8989", driver:"Sunita Joshi", purpose:"Export Loaded", exitTime:"15:00", dwell:"3h 20m", clearance:"Pending Docs" },
  { id:"EXT-026", vehicle:"MH-31-CD-9191", driver:"Arun Prasad", purpose:"Delivery Complete", exitTime:"15:25", dwell:"42m", clearance:"Cleared" },
]

const PURPOSES = ["Delivery Complete", "Pickup Done", "Export Loaded", "GRN Complete", "Vendor Visit Complete"] as const
const CLEARANCES = ["Cleared", "Pending Docs", "Held"] as const

const clearanceClass = (c: string) =>
  c === "Cleared" ? "bg-success/10 text-success"
  : c === "Held" ? "bg-danger/10 text-danger"
  : "bg-amber-50 text-amber-600"

const emptyForm = { vehicle: "", driver: "", purpose: "", dwell: "", clearance: "Cleared" }

export default function GateExitPage() {
  const [exits, setExits] = useState<Exit[]>(initialExits)
  const [search, setSearch] = useState("")
  const [clearanceFilter, setClearanceFilter] = useState("All")

  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const [purposeFilter, setPurposeFilter] = useState("All Purposes")
  const [dwellFilter, setDwellFilter] = useState("Any Dwell")

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Exit | null>(null)
  const [clearTarget, setClearTarget] = useState<Exit | null>(null)

  const extraFilterCount = (purposeFilter !== "All Purposes" ? 1 : 0) + (dwellFilter !== "Any Dwell" ? 1 : 0)

  // Parse "2h 05m" / "45m" into minutes so the dwell filter genuinely narrows the table.
  function dwellMinutes(d: string) {
    const h = /(\d+)\s*h/.exec(d)
    const m = /(\d+)\s*m/.exec(d)
    return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0)
  }

  const filtered = exits.filter((e) => {
    const q = search.toLowerCase()
    const mins = dwellMinutes(e.dwell)
    return (
      (e.id.toLowerCase().includes(q) || e.vehicle.toLowerCase().includes(q) || e.driver.toLowerCase().includes(q)) &&
      (clearanceFilter === "All" || e.clearance === clearanceFilter) &&
      (purposeFilter === "All Purposes" || e.purpose === purposeFilter) &&
      (dwellFilter === "Any Dwell"
        || (dwellFilter === "Under 1 hour" && mins < 60)
        || (dwellFilter === "1 – 2 hours" && mins >= 60 && mins < 120)
        || (dwellFilter === "Over 2 hours" && mins >= 120))
    )
  })

  const stats = [
    { label: "Total Exits", value: exits.length },
    { label: "Cleared", value: exits.filter((e) => e.clearance === "Cleared").length },
    { label: "Awaiting Clearance", value: exits.filter((e) => e.clearance !== "Cleared").length },
    { label: "Avg Dwell", value: exits.length ? `${Math.round(exits.reduce((s, e) => s + dwellMinutes(e.dwell), 0) / exits.length)} min` : "—" },
  ]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.vehicle.trim()) e.vehicle = "Vehicle number is required"
    if (!form.driver.trim()) e.driver = "Driver name is required"
    if (!form.purpose) e.purpose = "Select an exit purpose"
    if (!form.dwell.trim()) e.dwell = "Dwell time is required"
    else if (!/^\d+$/.test(form.dwell.trim()) || Number(form.dwell) < 1) e.dwell = "Enter dwell in whole minutes"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function recordExit() {
    if (!validate()) return
    const mins = Number(form.dwell)
    const dwell = mins >= 60 ? `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m` : `${mins}m`
    const next: Exit = {
      id: nextRecordId(exits.map(e => e.id), /^EXT-(\d+)$/, "EXT-", 3),
      vehicle: form.vehicle.trim().toUpperCase(),
      driver: form.driver.trim(),
      purpose: form.purpose,
      exitTime: new Date().toTimeString().slice(0, 5),
      dwell,
      clearance: form.clearance,
    }
    setExits((prev) => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Exit recorded", `${next.id} — ${next.vehicle} departed at ${next.exitTime}.`)
  }

  function clearVehicle(e: Exit) {
    setExits((prev) => prev.map((x) => (x.id === e.id ? { ...x, clearance: "Cleared" } : x)))
    notify.success("Clearance granted", `${e.id} — ${e.vehicle} is now cleared to leave.`)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Gate Exit</h1><p className="text-sm text-muted-foreground mt-1">Outbound vehicle departures and clearance records</p></div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="gate-exits" />
          <button type="button" onClick={() => { setForm(emptyForm); setErrors({}); setCreateOpen(true) }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> Record Exit</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3">
            <div className="mb-2"><LogOut className="w-5 h-5 text-brand" /></div>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search exit ID, vehicle, driver..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
          </div>
          {["All", ...CLEARANCES].map((c) => (
            <button key={c} onClick={() => setClearanceFilter(c)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", clearanceFilter === c ? "bg-brand text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground")}>{c}</button>
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
            <Field label="Exit Purpose">
              <Select value={purposeFilter} onChange={(e) => setPurposeFilter(e.target.value)} options={["All Purposes", ...PURPOSES]} />
            </Field>
            <Field label="Dwell Time">
              <Select value={dwellFilter} onChange={(e) => setDwellFilter(e.target.value)} options={["Any Dwell", "Under 1 hour", "1 – 2 hours", "Over 2 hours"]} />
            </Field>
            <button
              onClick={() => { setPurposeFilter("All Purposes"); setDwellFilter("Any Dwell"); notify.info("Filters cleared", "Showing all purposes and dwell times.") }}
              className="px-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors"
            >
              Clear Filters
            </button>
            <p className="sm:col-span-3 text-xs text-muted-foreground">Showing {filtered.length} of {exits.length} exit records.</p>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["Exit ID","Vehicle","Driver","Purpose","Exit Time","Dwell Time","Clearance","Actions"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(e=>(
              <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{e.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{e.vehicle}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.driver}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.purpose}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.exitTime}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.dwell}</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", clearanceClass(e.clearance))}>{e.clearance}</span></td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: "View details", icon: <Eye />, onSelect: () => setDetail(e) },
                      ...(e.clearance !== "Cleared"
                        ? [{ label: "Grant clearance", icon: <Check />, onSelect: () => setClearTarget(e), tone: "success" as const }]
                        : []),
                    ]}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No exit records match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Record exit */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="Record Vehicle Exit"
        description="Log an outbound departure and its clearance state"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={recordExit} submitLabel="Record Exit" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Vehicle Number" required error={errors.vehicle}>
            <TextInput value={form.vehicle} invalid={!!errors.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} placeholder="e.g. TN-09-AX-4411" />
          </Field>
          <Field label="Driver Name" required error={errors.driver}>
            <TextInput value={form.driver} invalid={!!errors.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })} placeholder="e.g. Ramesh Pillai" />
          </Field>
          <Field label="Exit Purpose" required error={errors.purpose}>
            <Select value={form.purpose} invalid={!!errors.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} options={PURPOSES} placeholder="Select Purpose" />
          </Field>
          <Field label="Dwell Time (minutes)" required error={errors.dwell} hint="Total time the vehicle spent on site">
            <TextInput value={form.dwell} invalid={!!errors.dwell} onChange={(e) => setForm({ ...form, dwell: e.target.value })} placeholder="e.g. 75" inputMode="numeric" />
          </Field>
          <Field label="Clearance" required>
            <Select value={form.clearance} onChange={(e) => setForm({ ...form, clearance: e.target.value })} options={CLEARANCES} />
          </Field>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Gate exit detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Close</button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Exit ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Vehicle" value={<span className="font-mono">{detail.vehicle}</span>} />
            <DetailRow label="Driver" value={detail.driver} />
            <DetailRow label="Purpose" value={detail.purpose} />
            <DetailRow label="Exit Time" value={detail.exitTime} />
            <DetailRow label="Dwell Time" value={detail.dwell} />
            <DetailRow label="Clearance" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", clearanceClass(detail.clearance))}>{detail.clearance}</span>} />
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!clearTarget}
        onOpenChange={(o) => !o && setClearTarget(null)}
        title="Grant gate clearance?"
        message={`${clearTarget?.vehicle} (${clearTarget?.id}) will be marked Cleared and permitted to leave the premises.`}
        confirmLabel="Grant Clearance"
        cancelLabel="Not Yet"
        tone="brand"
        onConfirm={() => clearTarget && clearVehicle(clearTarget)}
      />
    </div>
  )
}
