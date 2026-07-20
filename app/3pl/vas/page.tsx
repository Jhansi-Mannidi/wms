"use client"

import { useState } from "react"
import { Plus, Search, Filter, Wrench, Clock, CheckCircle2, AlertTriangle, Play, Pause, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { AvatarChip } from "@/components/wms/avatar-chip"

const kpis = [
  { label: "Open Work Orders", value: "12", color: "text-brand" },
  { label: "In Progress", value: "5", color: "text-warning" },
  { label: "SLA Breach Risk", value: "2", color: "text-danger" },
  { label: "Completed Today", value: "8", color: "text-success" },
]

const workOrders = [
  { id: "VAS-1041", client: "Amazon Seller Svc", type: "Kitting", desc: "Assemble gift packs: 200 units (SKU-SE201 + SKU-SE202)", qty: 200, assignee: "Rajan K.", dueIn: "2h", status: "in-progress", priority: "high" },
  { id: "VAS-1042", client: "Hindustan Unilever", type: "Labelling", desc: "Apply MRP stickers to Surf Excel 1kg — 5,000 units", qty: 5000, assignee: "Meena S.", dueIn: "4h", status: "open", priority: "medium" },
  { id: "VAS-1043", client: "Tata Consumer Products", type: "QC Inspection", desc: "Incoming inspection — 12 cartons surgical gloves", qty: 1200, assignee: "Unassigned", dueIn: "1h", status: "open", priority: "high" },
  { id: "VAS-1044", client: "Reliance Retail Ltd", type: "Repackaging", desc: "Repack bulk flour 50kg → 5kg retail bags", qty: 400, assignee: "Vijay P.", dueIn: "8h", status: "in-progress", priority: "low" },
  { id: "VAS-1045", client: "Amazon Seller Svc", type: "Kitting", desc: "Birthday hamper — 50 units", qty: 50, assignee: "Rajan K.", dueIn: "6h", status: "paused", priority: "medium" },
  { id: "VAS-1046", client: "D-Mart Avenue", type: "Shrink-Wrapping", desc: "Shrink-wrap pallet ID W-22 before dispatch", qty: 1, assignee: "Meena S.", dueIn: "30m", status: "open", priority: "high" },
  { id: "VAS-1047", client: "Hindustan Unilever", type: "Labelling", desc: "Shampoo country-of-origin label update", qty: 2400, assignee: "Vijay P.", dueIn: "Tomorrow", status: "done", priority: "low" },
]

const vasTypes = ["All", "Kitting", "Labelling", "QC Inspection", "Repackaging", "Shrink-Wrapping"]

const statusConfig: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  open:        { bg: "bg-brand/15",    text: "text-brand",   label: "Open",       icon: <Clock className="w-3 h-3" /> },
  "in-progress": { bg: "bg-warning/15", text: "text-warning",  label: "In Progress", icon: <Play className="w-3 h-3" /> },
  paused:      { bg: "bg-muted",       text: "text-muted-foreground", label: "Paused", icon: <Pause className="w-3 h-3" /> },
  done:        { bg: "bg-success/15",  text: "text-success",  label: "Done",       icon: <CheckCircle2 className="w-3 h-3" /> },
}

const priorityConfig: Record<string, string> = {
  high:   "text-danger",
  medium: "text-warning",
  low:    "text-muted-foreground",
}

const vasTypeColors: Record<string, string> = {
  Kitting:        "bg-violet-500/15 text-violet-400",
  Labelling:      "bg-blue-500/15 text-blue-400",
  "QC Inspection": "bg-amber-500/15 text-amber-400",
  Repackaging:    "bg-cyan-500/15 text-cyan-400",
  "Shrink-Wrapping": "bg-emerald-500/15 text-emerald-400",
}

export default function VASWorkOrdersPage() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")

  const filtered = workOrders.filter(w =>
    (typeFilter === "All" || w.type === typeFilter) &&
    (w.id.toLowerCase().includes(search.toLowerCase()) ||
     w.client.toLowerCase().includes(search.toLowerCase()) ||
     w.desc.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-0 px-5 pt-4 border-b border-border shrink-0">
        {["All Work Orders", "Open", "In Progress", "Completed", "Templates"].map((t, i) => (
          <button key={t} className={cn(
            "px-4 py-2 text-[12px] font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
            i === 0 ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-foreground"
          )}>{t}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map(k => (
            <div key={k.label} className="bg-card border border-border rounded-lg px-4 py-3">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{k.label}</p>
              <p className={cn("text-2xl font-bold mt-1", k.color)}>{k.value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/40 flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search work orders…"
              className="bg-transparent text-[12px] outline-none w-full placeholder:text-muted-foreground/60" />
          </div>
          <div className="flex gap-1 flex-wrap">
            {vasTypes.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap",
                typeFilter === t ? "bg-brand text-white" : "border border-border bg-card text-muted-foreground hover:text-foreground"
              )}>{t}</button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-brand text-white text-[12px] font-semibold hover:bg-brand/90 transition-colors ml-auto">
            <Plus className="w-3.5 h-3.5" /> New Work Order
          </button>
        </div>

        <div className="space-y-2">
          {filtered.map(w => {
            const s = statusConfig[w.status]
            const isUrgent = w.priority === "high" && w.status !== "done"
            return (
              <div key={w.id} className={cn(
                "bg-card border rounded-xl px-4 py-3.5 flex items-start gap-4 hover:border-brand/40 transition-all",
                isUrgent ? "border-danger/30" : "border-border"
              )}>
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                  isUrgent ? "bg-danger/10 text-danger" : "bg-brand/10 text-brand"
                )}>
                  <Wrench className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-[11px] text-brand font-semibold">{w.id}</span>
                    <span className={cn("text-[11px] font-semibold px-1.5 py-0.5 rounded-full", vasTypeColors[w.type] ?? "bg-muted text-muted-foreground")}>{w.type}</span>
                    <span className={cn("text-[11px] font-semibold px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5", s.bg, s.text)}>{s.icon}{s.label}</span>
                    {isUrgent && <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-danger"><AlertTriangle className="w-3 h-3" />Urgent</span>}
                  </div>
                  <p className="text-[12px] text-foreground">{w.desc}</p>
                  <div className="flex items-center gap-4 mt-1.5 text-[11px] text-muted-foreground">
                    <AvatarChip name={w.client} size="xs" />
                    <span>Qty: <strong className="text-foreground">{w.qty.toLocaleString()}</strong></span>
                    <span>Assignee: <strong className="text-foreground">{w.assignee}</strong></span>
                    <span className={cn("font-semibold", w.dueIn === "30m" ? "text-danger" : "text-muted-foreground")}>Due: {w.dueIn}</span>
                  </div>
                </div>
                <button className="text-[11px] text-brand hover:underline flex items-center gap-1 shrink-0 mt-1">
                  Open <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
