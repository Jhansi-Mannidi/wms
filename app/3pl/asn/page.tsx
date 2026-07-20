"use client"

import { useState } from "react"
import { Search, Plus, Filter, LayoutGrid, List, AlertCircle, CheckCircle2, Clock, Truck, Package, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"

const asnData = [
  { id: "ASN-001", client: "Apex Pharma Ltd", clientInit: "AP", clientColor: "bg-blue-500", lines: 12, pieces: 480, eta: "Today 14:00", mode: "Road", status: "At Gate", discrepancy: false },
  { id: "ASN-002", client: "GlobalTex Fabrics", clientInit: "GT", clientColor: "bg-amber-500", lines: 8, pieces: 320, eta: "Today 16:30", mode: "Air", status: "Expected", discrepancy: false },
  { id: "ASN-003", client: "Sunrise Electronics", clientInit: "SE", clientColor: "bg-emerald-500", lines: 5, pieces: 95, eta: "Yesterday", mode: "Road", status: "Receiving", discrepancy: true },
  { id: "ASN-004", client: "MediSupply Corp", clientInit: "MS", clientColor: "bg-rose-500", lines: 20, pieces: 1200, eta: "Tomorrow 09:00", mode: "Sea", status: "Expected", discrepancy: false },
  { id: "ASN-005", client: "AutoParts India", clientInit: "AI", clientColor: "bg-cyan-500", lines: 3, pieces: 60, eta: "Today 11:00", mode: "Road", status: "Put-Away", discrepancy: false },
  { id: "ASN-006", client: "FreshFarm Organics", clientInit: "FF", clientColor: "bg-orange-500", lines: 6, pieces: 240, eta: "Jul 22", mode: "Road", status: "Closed", discrepancy: false },
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

const kpis = [
  { label: "Expected Today", value: "4", color: "text-blue-400", icon: <Clock className="w-4 h-4" /> },
  { label: "In Receiving", value: "1", color: "text-brand", icon: <Package className="w-4 h-4" /> },
  { label: "Discrepancies", value: "1", color: "text-warning", icon: <AlertCircle className="w-4 h-4" /> },
  { label: "Completed", value: "12", color: "text-success", icon: <CheckCircle2 className="w-4 h-4" /> },
]

export default function ASNBoardPage() {
  const [view, setView] = useState<"kanban" | "table">("kanban")
  const [search, setSearch] = useState("")

  const filtered = asnData.filter(a =>
    a.id.toLowerCase().includes(search.toLowerCase()) ||
    a.client.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {kpis.map(k => (
          <div key={k.label} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
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
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-sm text-muted-foreground hover:text-foreground transition-colors"><Filter className="w-4 h-4" /> Filter</button>
        <ExportButton data={filtered.map(a => ({ id: a.id, client: a.client, lines: a.lines, pieces: a.pieces, eta: a.eta, mode: a.mode, status: a.status, discrepancy: a.discrepancy }))} filename="3pl-asn" />
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => setView("kanban")} className={cn("w-8 h-8 flex items-center justify-center rounded-lg border transition-colors", view === "kanban" ? "bg-brand border-brand text-white" : "border-border text-muted-foreground")}><LayoutGrid className="w-4 h-4" /></button>
          <button onClick={() => setView("table")} className={cn("w-8 h-8 flex items-center justify-center rounded-lg border transition-colors", view === "table" ? "bg-brand border-brand text-white" : "border-border text-muted-foreground")}><List className="w-4 h-4" /></button>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F7941D] text-white text-sm font-medium hover:bg-[#F7941D]/90 transition-colors">
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
                    <div key={a.id} className={cn("p-4 rounded-xl border border-border bg-card border-l-4 hover:border-brand/40 transition-all cursor-pointer", statusColors[a.status])}>
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
                      <button className="mt-3 w-full flex items-center justify-center gap-1 text-[11px] text-brand hover:underline font-medium">
                        View ASN <ChevronRight className="w-3 h-3" />
                      </button>
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
              <tr className="border-b border-border bg-muted/30">
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
                      {a.discrepancy && <AlertCircle className="w-3.5 h-3.5 text-warning" />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button className="flex items-center gap-1 text-xs text-brand hover:underline">View <ChevronRight className="w-3 h-3" /></button>
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
