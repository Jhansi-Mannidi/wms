"use client"

import { useState } from "react"
import {
  Forklift, Wrench, AlertTriangle, CheckCircle2, Clock,
  Plus, Search, ChevronDown, Eye, MoreHorizontal, Battery, MapPin
} from "lucide-react"
import { cn } from "@/lib/utils"

const equipment = [
  { id: "MHE-001", name: "Reach Truck 1", type: "Reach Truck", operator: "Suresh Yadav", zone: "Zone A", battery: 85, status: "In Use", lastService: "2024-11-20", nextService: "2025-01-20" },
  { id: "MHE-002", name: "Forklift 1", type: "Counterbalance Forklift", operator: "Arjun Nair", zone: "Dock", battery: 42, status: "In Use", lastService: "2024-10-15", nextService: "2024-12-15" },
  { id: "MHE-003", name: "Pallet Jack 1", type: "Electric Pallet Jack", operator: "Ravi Kumar", zone: "Zone B", battery: 91, status: "Available", lastService: "2024-12-01", nextService: "2025-02-01" },
  { id: "MHE-004", name: "Forklift 2", type: "Counterbalance Forklift", operator: "—", zone: "Workshop", battery: 10, status: "Under Maintenance", lastService: "2024-12-10", nextService: "2025-01-10" },
  { id: "MHE-005", name: "Order Picker 1", type: "Order Picker", operator: "Priya Sharma", zone: "Zone C", battery: 68, status: "In Use", lastService: "2024-11-05", nextService: "2025-01-05" },
  { id: "MHE-006", name: "Reach Truck 2", type: "Reach Truck", operator: "—", zone: "Charging Bay", battery: 5, status: "Charging", lastService: "2024-11-28", nextService: "2025-01-28" },
]

const maintenanceLogs = [
  { id: "MNT-045", equipment: "Forklift 2", type: "Scheduled Service", date: "2024-12-10", tech: "Ramesh Mechanics", status: "In Progress", notes: "Annual service + battery check" },
  { id: "MNT-044", equipment: "Reach Truck 1", type: "Preventive Maintenance", date: "2024-11-20", tech: "Ramesh Mechanics", status: "Completed", notes: "Oil change, brake inspection" },
  { id: "MNT-043", equipment: "Order Picker 1", type: "Breakdown Repair", date: "2024-11-05", tech: "XYZ Services", status: "Completed", notes: "Hydraulic pump replaced" },
]

const statusConfig: Record<string, { color: string; bg: string; dot: string }> = {
  "In Use": { color: "text-brand", bg: "bg-brand/15", dot: "bg-brand" },
  "Available": { color: "text-success", bg: "bg-success/15", dot: "bg-success" },
  "Under Maintenance": { color: "text-danger", bg: "bg-danger/15", dot: "bg-danger" },
  "Charging": { color: "text-warning", bg: "bg-warning/15", dot: "bg-warning" },
}

const mntStatusConfig: Record<string, { color: string; bg: string }> = {
  "In Progress": { color: "text-brand", bg: "bg-brand/15" },
  "Completed": { color: "text-success", bg: "bg-success/15" },
  "Scheduled": { color: "text-warning", bg: "bg-warning/15" },
}

function BatteryBar({ level }: { level: number }) {
  const color = level <= 20 ? "bg-danger" : level <= 50 ? "bg-warning" : "bg-success"
  return (
    <div className="flex items-center gap-2 min-w-20">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${level}%` }} />
      </div>
      <span className="text-xs text-muted-foreground w-8 text-right">{level}%</span>
    </div>
  )
}

export default function MHEOperationsPage() {
  const [tab, setTab] = useState<"fleet" | "maintenance">("fleet")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")

  const filtered = equipment.filter((e) => {
    const q = search.toLowerCase()
    return (
      (e.id.toLowerCase().includes(q) || e.name.toLowerCase().includes(q) || e.type.toLowerCase().includes(q)) &&
      (statusFilter === "All Status" || e.status === statusFilter)
    )
  })

  const inUse = equipment.filter((e) => e.status === "In Use").length
  const maintenance = equipment.filter((e) => e.status === "Under Maintenance").length
  const lowBattery = equipment.filter((e) => e.battery <= 20).length

  return (
    <div className="h-full overflow-y-auto">
      <div className="w-full p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">MHE Operations</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Material handling equipment tracking & maintenance</p>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
            <Plus className="w-4 h-4" /> Add Equipment
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Equipment", value: equipment.length.toString(), sub: "Across all zones", icon: <Forklift className="w-5 h-5" /> },
            { label: "In Use", value: inUse.toString(), sub: "Currently active", icon: <CheckCircle2 className="w-5 h-5" /> },
            { label: "Under Maintenance", value: maintenance.toString(), sub: "Unavailable", icon: <Wrench className="w-5 h-5" /> },
            { label: "Low Battery", value: lowBattery.toString(), sub: "Below 20%", icon: <Battery className="w-5 h-5" /> },
          ].map((stat, i) => (
            <div key={i} className="p-5 rounded-2xl border border-border bg-card">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className={cn(i === 2 ? "text-danger" : i === 3 ? "text-warning" : "text-brand")}>{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs mt-1 text-muted-foreground">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-1 p-1 rounded-xl bg-muted/50 w-fit">
          {(["fleet", "maintenance"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors", tab === t ? "bg-brand text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/60")}>
              {t === "fleet" ? "Fleet Status" : "Maintenance Log"}
            </button>
          ))}
        </div>

        {tab === "fleet" && (
          <>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-xl border border-border bg-card">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground text-foreground" placeholder="Search equipment..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="relative">
                <select className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-border bg-card text-sm text-foreground outline-none cursor-pointer" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  {["All Status", "In Use", "Available", "Under Maintenance", "Charging"].map((s) => <option key={s}>{s}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {["ID", "Equipment", "Type", "Operator", "Zone", "Battery", "Status", "Next Service", ""].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((eq, i) => (
                      <tr key={eq.id} className={cn("border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors", i % 2 === 1 ? "bg-muted/10" : "")}>
                        <td className="px-4 py-3 text-brand font-medium whitespace-nowrap text-xs">{eq.id}</td>
                        <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{eq.name}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{eq.type}</td>
                        <td className="px-4 py-3 text-foreground whitespace-nowrap">{eq.operator}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="flex items-center gap-1 text-muted-foreground text-xs">
                            <MapPin className="w-3 h-3" /> {eq.zone}
                          </span>
                        </td>
                        <td className="px-4 py-3"><BatteryBar level={eq.battery} /></td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium w-fit", statusConfig[eq.status]?.bg, statusConfig[eq.status]?.color)}>
                            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusConfig[eq.status]?.dot)} />
                            {eq.status}
                          </span>
                        </td>
                        <td className={cn("px-4 py-3 whitespace-nowrap text-xs", new Date(eq.nextService) < new Date() ? "text-danger font-semibold" : "text-muted-foreground")}>
                          {eq.nextService}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Eye className="w-3.5 h-3.5" /></button>
                            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {tab === "maintenance" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
                <Plus className="w-4 h-4" /> Log Maintenance
              </button>
            </div>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {["Log ID", "Equipment", "Type", "Date", "Technician", "Status", "Notes", ""].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceLogs.map((log, i) => (
                      <tr key={log.id} className={cn("border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors", i % 2 === 1 ? "bg-muted/10" : "")}>
                        <td className="px-4 py-3 text-brand font-medium whitespace-nowrap text-xs">{log.id}</td>
                        <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{log.equipment}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{log.type}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{log.date}</td>
                        <td className="px-4 py-3 text-foreground whitespace-nowrap">{log.tech}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", mntStatusConfig[log.status]?.bg, mntStatusConfig[log.status]?.color)}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs max-w-48 truncate">{log.notes}</td>
                        <td className="px-4 py-3">
                          <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Eye className="w-3.5 h-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-4 rounded-2xl border border-warning/30 bg-warning/5 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">Upcoming Maintenance Due</p>
                <p className="text-xs text-muted-foreground mt-0.5">Forklift 2 — Annual service is overdue. Last serviced on 2024-10-15. Schedule immediately.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
