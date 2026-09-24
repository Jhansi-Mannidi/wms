"use client"
import { useState } from "react"
import { ClipboardList, Search, Eye, Filter, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { nextRecordId } from "@/lib/next-id"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type LogRow = {
  id: string; vehicle: string; type: string; time: string
  dock: string; driver: string; purpose: string; status: string
}

const initialLogs: LogRow[] = [
  { id:"GL-001",vehicle:"TN-09-AX-4421",type:"Entry",time:"08:42",dock:"Dock 3",driver:"Suresh Kumar",purpose:"GRN Delivery",status:"Checked In"},
  { id:"GL-002",vehicle:"AP-28-BX-1190",type:"Entry",time:"09:15",dock:"Dock 1",driver:"Rajan Pillai",purpose:"Courier Pickup",status:"In Premises"},
  { id:"GL-003",vehicle:"TN-09-AX-4411",type:"Exit",time:"07:45",dock:"Dock 2",driver:"Ramesh Pillai",purpose:"Delivery Complete",status:"Cleared"},
  { id:"GL-004",vehicle:"MH-02-CX-7734",type:"Entry",time:"10:30",dock:"Dock 5",driver:"Anil Verma",purpose:"Export Loading",status:"Loading"},
  { id:"GL-005",vehicle:"AP-10-BX-8823",type:"Exit",time:"09:30",dock:"Dock 4",driver:"Venkat Rao",purpose:"Pickup Done",status:"Cleared"},
  { id:"GL-006",vehicle:"MH-14-CX-3310",type:"Exit",time:"11:20",dock:"Dock 5",driver:"Santosh Kumar",purpose:"Export Loaded",status:"Pending Docs"},
  { id:"GL-007",vehicle:"TS-07-ST-4545",type:"Entry",time:"07:20",dock:"Dock 4",driver:"Ravi Kumar",purpose:"GRN Delivery",status:"Checked In"},
  { id:"GL-008",vehicle:"KL-11-WX-6767",type:"Entry",time:"07:55",dock:"Dock 6",driver:"Girish Nair",purpose:"Courier Pickup",status:"In Premises"},
  { id:"GL-009",vehicle:"GJ-18-OP-4455",type:"Exit",time:"08:05",dock:"Dock 5",driver:"Vikram Sharma",purpose:"Export Loaded",status:"Pending Docs"},
  { id:"GL-010",vehicle:"RJ-14-QR-6677",type:"Entry",time:"08:25",dock:"Dock 2",driver:"Rahul Mehta",purpose:"Transfer",status:"Checked In"},
  { id:"GL-011",vehicle:"MP-09-ST-8899",type:"Entry",time:"08:50",dock:"Dock 3",driver:"Sanjay Gupta",purpose:"Export Loading",status:"Loading"},
  { id:"GL-012",vehicle:"UP-32-UV-1010",type:"Exit",time:"09:05",dock:"Dock 1",driver:"Meena Patel",purpose:"Pickup Done",status:"Cleared"},
  { id:"GL-013",vehicle:"WB-06-WX-2020",type:"Entry",time:"09:20",dock:"Dock 4",driver:"Deepa Menon",purpose:"GRN Delivery",status:"Checked In"},
  { id:"GL-014",vehicle:"HR-26-YZ-3030",type:"Entry",time:"09:45",dock:"Dock 6",driver:"Kavitha Rao",purpose:"Transfer",status:"Loading"},
  { id:"GL-015",vehicle:"PB-11-AB-4040",type:"Exit",time:"10:00",dock:"Dock 2",driver:"Anita Desai",purpose:"Delivery Complete",status:"Cleared"},
  { id:"GL-016",vehicle:"OD-02-CD-5050",type:"Entry",time:"10:15",dock:"Dock 5",driver:"Suresh Yadav",purpose:"Export Loading",status:"In Premises"},
  { id:"GL-017",vehicle:"CG-04-EF-6060",type:"Exit",time:"10:40",dock:"Dock 3",driver:"Arjun Nair",purpose:"GRN Complete",status:"Pending Docs"},
  { id:"GL-018",vehicle:"JH-05-GH-7070",type:"Entry",time:"10:55",dock:"Dock 1",driver:"Mohan Das",purpose:"Vendor Visit",status:"Checked In"},
  { id:"GL-019",vehicle:"BR-01-IJ-8080",type:"Entry",time:"11:10",dock:"Dock 6",driver:"Amrit Singh",purpose:"Export Loading",status:"Loading"},
  { id:"GL-020",vehicle:"TN-22-KL-9090",type:"Exit",time:"11:25",dock:"Dock 2",driver:"Venkat Rao",purpose:"Pickup Done",status:"Cleared"},
  { id:"GL-021",vehicle:"MH-43-MN-1212",type:"Entry",time:"11:40",dock:"Dock 4",driver:"Kiran Babu",purpose:"GRN Delivery",status:"In Premises"},
  { id:"GL-022",vehicle:"KA-19-OP-2323",type:"Exit",time:"12:05",dock:"Dock 5",driver:"Priya Sharma",purpose:"Export Loaded",status:"Cleared"},
  { id:"GL-023",vehicle:"AP-16-QR-3434",type:"Entry",time:"12:20",dock:"Dock 1",driver:"Naveen Reddy",purpose:"Courier Pickup",status:"Checked In"},
  { id:"GL-024",vehicle:"DL-08-UV-5656",type:"Exit",time:"12:45",dock:"Dock 3",driver:"Rohit Malhotra",purpose:"Delivery Complete",status:"Pending Docs"},
  { id:"GL-025",vehicle:"KL-07-MN-2233",type:"Entry",time:"13:00",dock:"Dock 6",driver:"Lakshmi Iyer",purpose:"GRN Delivery",status:"In Premises"},
  { id:"GL-026",vehicle:"GJ-27-YZ-7878",type:"Exit",time:"13:15",dock:"Dock 2",driver:"Manoj Bhat",purpose:"Vendor Visit Complete",status:"Cleared"},
  { id:"GL-027",vehicle:"RJ-19-AB-8989",type:"Entry",time:"13:40",dock:"Dock 5",driver:"Sunita Joshi",purpose:"Export Loading",status:"Loading"},
  { id:"GL-028",vehicle:"MH-31-CD-9191",type:"Exit",time:"14:00",dock:"Dock 4",driver:"Arun Prasad",purpose:"GRN Complete",status:"Cleared"},
]

const DOCKS = ["Dock 1", "Dock 2", "Dock 3", "Dock 4", "Dock 5", "Dock 6"] as const
const STATUSES = ["Checked In", "In Premises", "Loading", "Cleared", "Pending Docs"] as const
const TYPES = ["Entry", "Exit"] as const

const statusClass = (s: string) =>
  s === "Cleared" ? "bg-success/10 text-success"
  : s === "Pending Docs" ? "bg-amber-50 text-amber-600"
  : "bg-muted text-muted-foreground"

const emptyForm = { vehicle: "", driver: "", type: "Entry", dock: "", purpose: "", status: "Checked In" }

export default function GateLogPage() {
  const [logs, setLogs] = useState<LogRow[]>(initialLogs)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")

  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const [dockFilter, setDockFilter] = useState("All Docks")
  const [statusFilter, setStatusFilter] = useState("All Statuses")
  const [fromTime, setFromTime] = useState("")
  const [toTime, setToTime] = useState("")

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [detail, setDetail] = useState<LogRow | null>(null)

  const extraFilterCount =
    (dockFilter !== "All Docks" ? 1 : 0) +
    (statusFilter !== "All Statuses" ? 1 : 0) +
    (fromTime ? 1 : 0) + (toTime ? 1 : 0)

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase()
    return (
      (l.id.toLowerCase().includes(q) || l.vehicle.toLowerCase().includes(q) || l.driver.toLowerCase().includes(q)) &&
      (typeFilter === "All" || l.type === typeFilter) &&
      (dockFilter === "All Docks" || l.dock === dockFilter) &&
      (statusFilter === "All Statuses" || l.status === statusFilter) &&
      (!fromTime || l.time >= fromTime) &&
      (!toTime || l.time <= toTime)
    )
  })

  const stats = [
    { label: "Total Movements", value: logs.length },
    { label: "Entries", value: logs.filter((l) => l.type === "Entry").length },
    { label: "Exits", value: logs.filter((l) => l.type === "Exit").length },
    { label: "Pending Docs", value: logs.filter((l) => l.status === "Pending Docs").length },
  ]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.vehicle.trim()) e.vehicle = "Vehicle number is required"
    if (!form.driver.trim()) e.driver = "Driver name is required"
    if (!form.dock) e.dock = "Select a dock"
    if (!form.purpose.trim()) e.purpose = "Purpose is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createLog() {
    if (!validate()) return
    const next: LogRow = {
      id: nextRecordId(logs.map(l => l.id), /^GL-(\d+)$/, "GL-", 3),
      vehicle: form.vehicle.trim().toUpperCase(),
      type: form.type,
      time: new Date().toTimeString().slice(0, 5),
      dock: form.dock,
      driver: form.driver.trim(),
      purpose: form.purpose.trim(),
      status: form.status,
    }
    setLogs((prev) => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Movement logged", `${next.id} — ${next.type} for ${next.vehicle} at ${next.time}.`)
  }

  function clearExtraFilters() {
    setDockFilter("All Docks")
    setStatusFilter("All Statuses")
    setFromTime("")
    setToTime("")
    notify.info("Filters cleared", "Showing all docks, statuses and times.")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Gate Log</h1><p className="text-sm text-muted-foreground mt-1">Complete record of all gate entry and exit movements</p></div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="gate-log" />
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> Log Movement</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3">
            <div className="mb-2"><ClipboardList className="w-5 h-5 text-brand" /></div>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search log ID, vehicle, driver..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
          </div>
          {["All", ...TYPES].map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", typeFilter === t ? "bg-brand text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground")}>{t}</button>
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
          <div className="p-4 rounded-xl border border-border bg-card grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
            <Field label="Dock">
              <Select value={dockFilter} onChange={(e) => setDockFilter(e.target.value)} options={["All Docks", ...DOCKS]} />
            </Field>
            <Field label="Status">
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={["All Statuses", ...STATUSES]} />
            </Field>
            <Field label="From Time">
              <TextInput type="time" value={fromTime} onChange={(e) => setFromTime(e.target.value)} />
            </Field>
            <Field label="To Time">
              <TextInput type="time" value={toTime} onChange={(e) => setToTime(e.target.value)} />
            </Field>
            <button onClick={clearExtraFilters} className="px-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors">Clear Filters</button>
            <p className="sm:col-span-3 lg:col-span-5 text-xs text-muted-foreground">Showing {filtered.length} of {logs.length} movements.</p>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border"><tr>{["Log ID","Vehicle","Type","Time","Dock","Driver","Purpose","Status","Actions"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(l=>(
              <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{l.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{l.vehicle}</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", l.type==="Entry"?"bg-brand/10 text-brand":"bg-muted text-muted-foreground")}>{l.type}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{l.time}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.dock}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.driver}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.purpose}</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusClass(l.status))}>{l.status}</span></td>
                <td className="px-4 py-3">
                  <button onClick={() => setDetail(l)} title="View details" className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">No gate movements match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Log movement */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="Log Gate Movement"
        description="Add a manual entry or exit record to the gate log"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createLog} submitLabel="Add to Log" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Vehicle Number" required error={errors.vehicle}>
            <TextInput value={form.vehicle} invalid={!!errors.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} placeholder="e.g. TN-09-AX-4421" />
          </Field>
          <Field label="Driver Name" required error={errors.driver}>
            <TextInput value={form.driver} invalid={!!errors.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })} placeholder="e.g. Suresh Kumar" />
          </Field>
          <Field label="Movement Type" required>
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={TYPES} />
          </Field>
          <Field label="Dock" required error={errors.dock}>
            <Select value={form.dock} invalid={!!errors.dock} onChange={(e) => setForm({ ...form, dock: e.target.value })} options={DOCKS} placeholder="Select Dock" />
          </Field>
          <Field label="Purpose" required error={errors.purpose}>
            <TextInput value={form.purpose} invalid={!!errors.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="e.g. GRN Delivery" />
          </Field>
          <Field label="Status" required>
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUSES} />
          </Field>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Gate log movement detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Close</button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Log ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Vehicle" value={<span className="font-mono">{detail.vehicle}</span>} />
            <DetailRow label="Movement Type" value={detail.type} />
            <DetailRow label="Time" value={detail.time} />
            <DetailRow label="Dock" value={detail.dock} />
            <DetailRow label="Driver" value={detail.driver} />
            <DetailRow label="Purpose" value={detail.purpose} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusClass(detail.status))}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>
    </div>
  )
}
