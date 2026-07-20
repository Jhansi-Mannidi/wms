"use client"

import { useState } from "react"
import { Search, Plus, Filter, Truck, CheckCircle2, AlertTriangle, Clock, MoreHorizontal, MapPin, Eye, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

type Stage = "Ready" | "Assigned" | "Out-for-Delivery" | "Delivered" | "RTO"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Job = {
  id: string
  consignee: string
  city: string
  weight: string
  service: string
  carrier: string
  tracking: string
  stage: Stage
  sla: string
  pod: boolean
  reattempt?: boolean
}

const initialJobs: Job[] = [
  { id: "AIR-LOC-001", consignee: "Ravi Pharma Stores", city: "Hyderabad", weight: "3.2 kg", service: "Express", carrier: "BlueDart", tracking: "BD291847362", stage: "Ready", sla: "Today 18:00", pod: false },
  { id: "AIR-LOC-002", consignee: "TechZone Retail", city: "Secunderabad", weight: "1.8 kg", service: "Priority", carrier: "Own Fleet", tracking: "VF-D-00245", stage: "Assigned", sla: "Today 16:00", pod: false },
  { id: "AIR-LOC-003", consignee: "MedLine Hospital", city: "Banjara Hills", weight: "5.5 kg", service: "Express", carrier: "Delhivery", tracking: "DL884732910", stage: "Out-for-Delivery", sla: "Today 14:30", pod: false },
  { id: "AIR-LOC-004", consignee: "Sunrise Traders", city: "Jubilee Hills", weight: "2.1 kg", service: "Standard", carrier: "Own Fleet", tracking: "VF-D-00246", stage: "Delivered", sla: "—", pod: true },
  { id: "AIR-LOC-005", consignee: "Galaxy Electronics", city: "Kukatpally", weight: "4.8 kg", service: "Express", carrier: "FedEx", tracking: "FX799203847", stage: "RTO", sla: "—", pod: false, reattempt: true },
  { id: "AIR-LOC-006", consignee: "HealthPlus Clinic", city: "Gachibowli", weight: "0.9 kg", service: "Priority", carrier: "Own Fleet", tracking: "VF-D-00247", stage: "Out-for-Delivery", sla: "Today 15:00", pod: false },
  { id: "AIR-LOC-007", consignee: "Spice Garden", city: "Madhapur", weight: "6.2 kg", service: "Standard", carrier: "Bluedart", tracking: "BD291847363", stage: "Ready", sla: "Today 18:00", pod: false },
  { id: "AIR-LOC-008", consignee: "Nova Constructions", city: "Kondapur", weight: "12.4 kg", service: "Economy", carrier: "Delhivery", tracking: "DL884732911", stage: "Assigned", sla: "Tomorrow", pod: false },
]

const columns: { id: Stage; label: string; color: string }[] = [
  { id: "Ready", label: "Ready", color: "text-muted-foreground" },
  { id: "Assigned", label: "Assigned", color: "text-brand" },
  { id: "Out-for-Delivery", label: "Out-for-Delivery", color: "text-warning" },
  { id: "Delivered", label: "Delivered", color: "text-success" },
  { id: "RTO", label: "RTO / Reattempt", color: "text-danger" },
]

const stageColors: Record<Stage, string> = {
  "Ready": "bg-muted/40 border-border/60",
  "Assigned": "bg-brand/5 border-brand/20",
  "Out-for-Delivery": "bg-warning/5 border-warning/20",
  "Delivered": "bg-success/5 border-success/20",
  "RTO": "bg-danger/5 border-danger/20",
}

const CARRIERS = ["BlueDart", "Delhivery", "FedEx", "Own Fleet"] as const
const SERVICES = ["Priority", "Express", "Standard", "Economy"] as const

const emptyForm = { consignee: "", city: "", weight: "", service: "", carrier: "", tracking: "", sla: "" }

export default function CourierConsolePage() {
  const [jobs, setJobs] = useState<Job[]>(initialJobs)
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"kanban" | "table">("kanban")

  const [showFilters, setShowFilters] = useState(false)
  const [carrierFilter, setCarrierFilter] = useState("All")
  const [serviceFilter, setServiceFilter] = useState("All")

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Job | null>(null)
  const [rtoTarget, setRtoTarget] = useState<Job | null>(null)

  const filtered = jobs.filter(j =>
    (j.consignee.toLowerCase().includes(search.toLowerCase()) ||
      j.tracking.toLowerCase().includes(search.toLowerCase())) &&
    (carrierFilter === "All" || j.carrier.toLowerCase() === carrierFilter.toLowerCase()) &&
    (serviceFilter === "All" || j.service === serviceFilter)
  )

  const byStage = (s: Stage) => filtered.filter(j => j.stage === s)

  const kpis = [
    { label: "Awaiting Dispatch", value: String(jobs.filter(j => j.stage === "Ready" || j.stage === "Assigned").length), color: "text-foreground", bg: "bg-muted/30" },
    { label: "Out-for-Delivery", value: String(jobs.filter(j => j.stage === "Out-for-Delivery").length), color: "text-brand", bg: "bg-brand/10" },
    { label: "Delivered Today", value: String(jobs.filter(j => j.stage === "Delivered").length), color: "text-success", bg: "bg-success/10" },
    { label: "RTO / Reattempt", value: String(jobs.filter(j => j.stage === "RTO").length), color: "text-danger", bg: "bg-danger/10" },
  ]

  const advance = (id: string) => {
    const order: Stage[] = ["Ready", "Assigned", "Out-for-Delivery", "Delivered"]
    const job = jobs.find(j => j.id === id)
    if (!job) return
    const idx = order.indexOf(job.stage)
    if (idx === -1 || idx === order.length - 1) return
    const nextStage = order[idx + 1]
    setJobs(prev => prev.map(j => j.id === id ? { ...j, stage: nextStage, pod: nextStage === "Delivered" } : j))
    notify.success(`Job ${nextStage.toLowerCase()}`, `${job.id} — ${job.consignee} moved to ${nextStage}.`)
  }

  const markRTO = (job: Job) => {
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, stage: "RTO", pod: false, reattempt: true, sla: "—" } : j))
    notify.warning("Marked RTO", `${job.id} returned to origin and flagged for reattempt.`)
  }

  const reattempt = (job: Job) => {
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, stage: "Ready", reattempt: false, sla: "Tomorrow" } : j))
    notify.info("Reattempt scheduled", `${job.id} is back in the Ready queue for tomorrow.`)
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.consignee.trim()) e.consignee = "Consignee is required"
    if (!form.city.trim()) e.city = "City is required"
    if (!form.weight.trim()) e.weight = "Weight is required"
    else if (!/^\d+(\.\d+)?$/.test(form.weight) || Number(form.weight) <= 0) e.weight = "Enter a positive number of kg"
    if (!form.service) e.service = "Select a service level"
    if (!form.carrier) e.carrier = "Select a carrier"
    if (!form.tracking.trim()) e.tracking = "Tracking reference is required"
    else if (jobs.some(j => j.tracking.toLowerCase() === form.tracking.trim().toLowerCase())) e.tracking = "This tracking reference already exists"
    if (!form.sla.trim()) e.sla = "SLA is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createJob() {
    if (!validate()) return
    const seq = String(jobs.length + 1).padStart(3, "0")
    const next: Job = {
      id: `AIR-LOC-${seq}`,
      consignee: form.consignee.trim(),
      city: form.city.trim(),
      weight: `${Number(form.weight)} kg`,
      service: form.service,
      carrier: form.carrier,
      tracking: form.tracking.trim().toUpperCase(),
      stage: "Ready",
      sla: form.sla.trim(),
      pod: false,
    }
    setJobs(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Job created", `${next.id} — ${next.consignee} queued for dispatch via ${next.carrier}.`)
  }

  const activeFilters = (carrierFilter !== "All" ? 1 : 0) + (serviceFilter !== "All" ? 1 : 0)

  return (
    <div className="p-6 h-full flex flex-col">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {kpis.map(k => (
          <div key={k.label} className={cn("p-4 rounded-xl border border-border", k.bg)}>
            <p className="text-xs text-muted-foreground mb-1">{k.label}</p>
            <p className={cn("text-2xl font-bold", k.color)}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[180px] max-w-xs px-3 py-2 rounded-lg border border-border bg-card">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search consignee, tracking..."
            className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground/60" />
        </div>
        <button onClick={() => setShowFilters(f => !f)} title="Toggle filters"
          className={cn("flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors",
            showFilters || activeFilters > 0 ? "border-brand bg-brand/10 text-brand" : "border-border bg-card text-muted-foreground hover:text-foreground")}>
          <Filter className="w-4 h-4" /> Filter{activeFilters > 0 ? ` (${activeFilters})` : ""}
        </button>
        <div className="flex items-center gap-1 ml-auto">
          {(["kanban","table"] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={cn("px-3 py-2 rounded-lg border text-xs font-medium capitalize transition-colors",
                view === v ? "bg-brand border-brand text-white" : "border-border text-muted-foreground hover:text-foreground")}>
              {v}
            </button>
          ))}
        </div>
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F7941D] text-white text-sm font-medium hover:bg-[#F7941D]/90">
          <Plus className="w-4 h-4" /> New Job
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap items-end gap-3 mb-4 p-4 rounded-xl border border-border bg-card">
          <div className="min-w-[180px]">
            <Field label="Carrier">
              <Select value={carrierFilter} onChange={e => setCarrierFilter(e.target.value)} options={["All", ...CARRIERS]} />
            </Field>
          </div>
          <div className="min-w-[180px]">
            <Field label="Service">
              <Select value={serviceFilter} onChange={e => setServiceFilter(e.target.value)} options={["All", ...SERVICES]} />
            </Field>
          </div>
          <button onClick={() => { setCarrierFilter("All"); setServiceFilter("All"); notify.info("Filters cleared", "Showing all courier jobs.") }}
            className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-muted-foreground hover:text-foreground transition-colors">
            Clear
          </button>
          <span className="text-xs text-muted-foreground ml-auto">{filtered.length} of {jobs.length} jobs shown</span>
        </div>
      )}

      {view === "kanban" ? (
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 h-full min-w-max pb-4">
            {columns.map(col => (
              <div key={col.id} className="w-64 shrink-0 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className={cn("text-xs font-bold uppercase tracking-wider", col.color)}>{col.label}</span>
                  <span className="text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">{byStage(col.id).length}</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2">
                  {byStage(col.id).map(job => (
                    <div key={job.id} className={cn("p-3.5 rounded-xl border transition-all hover:shadow-sm", stageColors[job.stage])}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-xs font-bold text-foreground">{job.consignee}</p>
                          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{job.id}</p>
                        </div>
                        <button onClick={() => setDetail(job)} title="View job details" className="text-muted-foreground hover:text-foreground"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="space-y-1.5 text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {job.city}</div>
                        <div className="flex items-center gap-1"><Truck className="w-2.5 h-2.5" /> {job.carrier} · {job.weight}</div>
                        <div className="font-mono text-[9px] text-foreground/60">{job.tracking}</div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
                          job.service === "Priority" ? "bg-brand/15 text-brand" :
                          job.service === "Express" ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground")}>
                          {job.service}
                        </span>
                        <div className="flex items-center gap-1">
                          {job.stage !== "Delivered" && job.stage !== "RTO" && (
                            <>
                              <button onClick={() => advance(job.id)}
                                className="text-[10px] px-2 py-1 rounded-lg bg-[#F7941D] text-white font-semibold hover:bg-[#F7941D]/90 transition-colors">
                                {job.stage === "Ready" ? "Assign" : job.stage === "Assigned" ? "Dispatch" : "Mark Delivered"}
                              </button>
                              <button onClick={() => setRtoTarget(job)} title="Mark as RTO" className="p-1 rounded-md text-danger hover:bg-danger/10 transition-colors">
                                <AlertTriangle className="w-3 h-3" />
                              </button>
                            </>
                          )}
                          {job.stage === "RTO" && (
                            <button onClick={() => reattempt(job)} title="Schedule reattempt"
                              className="text-[10px] px-2 py-1 rounded-lg border border-danger/40 text-danger font-semibold hover:bg-danger/10 transition-colors">
                              Reattempt
                            </button>
                          )}
                          {job.pod && <CheckCircle2 className="w-4 h-4 text-success" />}
                          {job.reattempt && job.stage === "RTO" && <AlertTriangle className="w-4 h-4 text-danger" />}
                        </div>
                      </div>
                    </div>
                  ))}
                  {byStage(col.id).length === 0 && (
                    <p className="text-[11px] text-muted-foreground text-center py-6 rounded-xl border border-dashed border-border/60">No jobs</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                {["Job ID", "Consignee", "City", "Carrier", "Weight", "Service", "SLA", "Status", "POD", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(job => (
                <tr key={job.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-brand font-semibold">{job.id}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-foreground">{job.consignee}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{job.city}</td>
                  <td className="px-4 py-3 text-xs text-foreground">{job.carrier}</td>
                  <td className="px-4 py-3 text-xs text-foreground">{job.weight}</td>
                  <td className="px-4 py-3"><span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold", job.service === "Priority" ? "bg-brand/15 text-brand" : job.service === "Express" ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground")}>{job.service}</span></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{job.sla}</td>
                  <td className="px-4 py-3"><span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold", job.stage === "Delivered" ? "bg-success/15 text-success" : job.stage === "RTO" ? "bg-danger/15 text-danger" : job.stage === "Out-for-Delivery" ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground")}>{job.stage}</span></td>
                  <td className="px-4 py-3">{job.pod ? <CheckCircle2 className="w-4 h-4 text-success" /> : <span className="text-xs text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setDetail(job)} title="View job details" className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {job.stage !== "Delivered" && job.stage !== "RTO" && (
                        <>
                          <button onClick={() => advance(job.id)} className="text-[10px] px-2 py-1 rounded bg-[#F7941D] text-white font-semibold hover:bg-[#F7941D]/90">
                            {job.stage === "Ready" ? "Assign" : job.stage === "Assigned" ? "Dispatch" : "Delivered"}
                          </button>
                          <button onClick={() => setRtoTarget(job)} title="Mark as RTO" className="p-1.5 rounded-md text-danger hover:bg-danger/10 transition-colors">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {job.stage === "RTO" && (
                        <button onClick={() => reattempt(job)} title="Schedule reattempt" className="p-1.5 rounded-md text-brand hover:bg-brand/10 transition-colors">
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-10 text-center text-sm text-muted-foreground">No courier jobs match your search or filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* New job */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="New Courier Job"
        description="Queue a local delivery for dispatch"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createJob} submitLabel="Create Job" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Consignee" required error={errors.consignee}>
            <TextInput value={form.consignee} invalid={!!errors.consignee} onChange={e => setForm({ ...form, consignee: e.target.value })} placeholder="e.g. Ravi Pharma Stores" />
          </Field>
          <Field label="City / Area" required error={errors.city}>
            <TextInput value={form.city} invalid={!!errors.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="e.g. Gachibowli" />
          </Field>
          <Field label="Weight (kg)" required error={errors.weight}>
            <TextInput value={form.weight} invalid={!!errors.weight} onChange={e => setForm({ ...form, weight: e.target.value })} placeholder="e.g. 3.2" inputMode="decimal" />
          </Field>
          <Field label="Service Level" required error={errors.service}>
            <Select value={form.service} invalid={!!errors.service} onChange={e => setForm({ ...form, service: e.target.value })} options={SERVICES} placeholder="Select Service" />
          </Field>
          <Field label="Carrier" required error={errors.carrier}>
            <Select value={form.carrier} invalid={!!errors.carrier} onChange={e => setForm({ ...form, carrier: e.target.value })} options={CARRIERS} placeholder="Select Carrier" />
          </Field>
          <Field label="Tracking Reference" required error={errors.tracking}>
            <TextInput value={form.tracking} invalid={!!errors.tracking} onChange={e => setForm({ ...form, tracking: e.target.value })} placeholder="e.g. BD291847364" />
          </Field>
          <Field label="SLA" required error={errors.sla} hint="When this delivery is promised">
            <TextInput value={form.sla} invalid={!!errors.sla} onChange={e => setForm({ ...form, sla: e.target.value })} placeholder="e.g. Today 18:00" />
          </Field>
        </div>
      </Modal>

      {/* Job detail */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Courier job detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Job ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Consignee" value={detail.consignee} />
            <DetailRow label="City" value={detail.city} />
            <DetailRow label="Carrier" value={detail.carrier} />
            <DetailRow label="Tracking" value={<span className="font-mono">{detail.tracking}</span>} />
            <DetailRow label="Weight" value={detail.weight} />
            <DetailRow label="Service" value={detail.service} />
            <DetailRow label="SLA" value={detail.sla} />
            <DetailRow label="Stage" value={<span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", detail.stage === "Delivered" ? "bg-success/15 text-success" : detail.stage === "RTO" ? "bg-danger/15 text-danger" : detail.stage === "Out-for-Delivery" ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground")}>{detail.stage}</span>} />
            <DetailRow label="POD Captured" value={detail.pod ? "Yes" : "No"} />
            <DetailRow label="Reattempt Flagged" value={detail.reattempt ? "Yes" : "No"} />
          </div>
        )}
      </Drawer>

      {/* RTO confirmation */}
      <ConfirmDialog
        open={!!rtoTarget}
        onOpenChange={(o) => !o && setRtoTarget(null)}
        title="Mark this job as RTO?"
        message={`${rtoTarget?.id} for ${rtoTarget?.consignee} will be returned to origin and flagged for reattempt.`}
        confirmLabel="Mark RTO"
        cancelLabel="Keep In Transit"
        onConfirm={() => rtoTarget && markRTO(rtoTarget)}
      />
    </div>
  )
}
