"use client"

import { useState } from "react"
import {
  Truck, Plus, Clock, CheckCircle, XCircle, LogIn, LogOut,
  ChevronDown, Eye, MoreHorizontal, Search, Filter
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"

const gateEntries = [
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

const gates = [
  { name: "Gate 1", status: "Active", vehicles: 2, type: "Inbound" },
  { name: "Gate 2", status: "Active", vehicles: 1, type: "Outbound" },
  { name: "Gate 3", status: "Idle", vehicles: 0, type: "Mixed" },
]

export default function GateManagementPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [showForm, setShowForm] = useState(false)

  const filtered = gateEntries.filter((g) => {
    const q = search.toLowerCase()
    return (
      (g.id.toLowerCase().includes(q) || g.vehicle.toLowerCase().includes(q) || g.driver.toLowerCase().includes(q) || g.client.toLowerCase().includes(q)) &&
      (statusFilter === "All Status" || g.status === statusFilter)
    )
  })

  const inside = gateEntries.filter((g) => g.status === "Inside" || g.status === "Loading").length
  const expected = gateEntries.filter((g) => g.status === "Expected").length

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
            { label: "Total Today", value: gateEntries.length.toString(), icon: <LogIn className="w-5 h-5" />, color: "text-success", bg: "bg-success/10" },
            { label: "Exited Today", value: gateEntries.filter((g) => g.status === "Exited").length.toString(), icon: <LogOut className="w-5 h-5" />, color: "text-muted-foreground", bg: "bg-muted/50" },
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
            <div key={gate.name} className="p-4 rounded-2xl border border-border bg-card flex items-center gap-3">
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
            </div>
          ))}
        </div>

        {/* New Entry Form */}
        {showForm && (
          <div className="p-5 rounded-2xl border border-brand/30 bg-brand/5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">New Gate Entry</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Vehicle Number *", placeholder: "e.g. TN-45-AB-1234", type: "text" },
                { label: "Driver Name", placeholder: "Driver name", type: "text" },
                { label: "Driver Mobile", placeholder: "+91 XXXXXXXXXX", type: "tel" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs font-medium text-foreground mb-1.5">{f.label}</label>
                  <input type={f.type} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-brand transition-colors placeholder:text-muted-foreground" placeholder={f.placeholder} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Purpose *</label>
                <div className="relative">
                  <select className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-brand">
                    {["Inbound", "Outbound", "Transfer", "Vendor Visit"].map((p) => <option key={p}>{p}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Client</label>
                <div className="relative">
                  <select className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-brand">
                    {["Select client...", "Acme Foods", "Global Oils", "Agro Corp"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Gate</label>
                <div className="relative">
                  <select className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-brand">
                    {["Gate 1", "Gate 2", "Gate 3"].map((g) => <option key={g}>{g}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors">Cancel</button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
                <CheckCircle className="w-4 h-4" /> Register Entry
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
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
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Filter className="w-4 h-4" /> More Filters
          </button>
          <ExportButton data={filtered} filename="gate-management" />
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
                      <span className="text-brand font-medium hover:underline cursor-pointer">{entry.id}</span>
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
      </div>
    </div>
  )
}
