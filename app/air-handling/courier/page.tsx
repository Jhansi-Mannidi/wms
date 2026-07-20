"use client"

import { useState } from "react"
import { Search, Plus, Filter, Truck, CheckCircle2, AlertTriangle, Clock, MoreHorizontal, Phone, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

const kpis = [
  { label: "Awaiting Dispatch", value: "18", color: "text-foreground", bg: "bg-muted/30" },
  { label: "Out-for-Delivery", value: "34", color: "text-brand", bg: "bg-brand/10" },
  { label: "Delivered Today", value: "62", color: "text-success", bg: "bg-success/10" },
  { label: "RTO / Reattempt", value: "7", color: "text-danger", bg: "bg-danger/10" },
]

type Stage = "Ready" | "Assigned" | "Out-for-Delivery" | "Delivered" | "RTO"

interface Job {
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

export default function CourierConsolePage() {
  const [jobs, setJobs] = useState<Job[]>(initialJobs)
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"kanban" | "table">("kanban")

  const filtered = jobs.filter(j =>
    j.consignee.toLowerCase().includes(search.toLowerCase()) ||
    j.tracking.toLowerCase().includes(search.toLowerCase())
  )

  const byStage = (s: Stage) => filtered.filter(j => j.stage === s)

  const advance = (id: string) => {
    const order: Stage[] = ["Ready", "Assigned", "Out-for-Delivery", "Delivered"]
    setJobs(prev => prev.map(j => {
      if (j.id !== id) return j
      const idx = order.indexOf(j.stage)
      if (idx === -1 || idx === order.length - 1) return j
      return { ...j, stage: order[idx + 1], pod: order[idx + 1] === "Delivered" }
    }))
  }

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
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-sm text-muted-foreground hover:text-foreground">
          <Filter className="w-4 h-4" /> Filter
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
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F7941D] text-white text-sm font-medium hover:bg-[#F7941D]/90">
          <Plus className="w-4 h-4" /> New Job
        </button>
      </div>

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
                        <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal className="w-3.5 h-3.5" /></button>
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
                        {job.stage !== "Delivered" && job.stage !== "RTO" && (
                          <button onClick={() => advance(job.id)}
                            className="text-[10px] px-2 py-1 rounded-lg bg-[#F7941D] text-white font-semibold hover:bg-[#F7941D]/90 transition-colors">
                            {job.stage === "Ready" ? "Assign" : job.stage === "Assigned" ? "Dispatch" : "Mark Delivered"}
                          </button>
                        )}
                        {job.pod && <CheckCircle2 className="w-4 h-4 text-success" />}
                        {job.reattempt && <AlertTriangle className="w-4 h-4 text-danger" />}
                      </div>
                    </div>
                  ))}
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
                    {job.stage !== "Delivered" && job.stage !== "RTO" && (
                      <button onClick={() => advance(job.id)} className="text-[10px] px-2 py-1 rounded bg-[#F7941D] text-white font-semibold hover:bg-[#F7941D]/90">
                        {job.stage === "Ready" ? "Assign" : job.stage === "Assigned" ? "Dispatch" : "Delivered"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
