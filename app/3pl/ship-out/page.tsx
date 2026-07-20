"use client"

import { useState } from "react"
import { Search, Plus, Filter, LayoutGrid, List, AlertTriangle, CheckCircle2, Clock, Package, ChevronRight, Truck } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"

const orders = [
  { id: "SO-2401", client: "Apex Pharma Ltd", clientInit: "AP", clientColor: "bg-blue-500", lines: 4, pieces: 120, dispatchMode: "Courier", shipTo: "Mumbai", sla: "4h", slaRisk: false, status: "New" },
  { id: "SO-2402", client: "GlobalTex Fabrics", clientInit: "GT", clientColor: "bg-amber-500", lines: 8, pieces: 450, dispatchMode: "Export", shipTo: "Port Nhava Sheva", sla: "12h", slaRisk: false, status: "Allocated" },
  { id: "SO-2403", client: "Sunrise Electronics", clientInit: "SE", clientColor: "bg-emerald-500", lines: 2, pieces: 24, dispatchMode: "Local Delivery", shipTo: "Pune", sla: "1h", slaRisk: true, status: "Picking" },
  { id: "SO-2404", client: "AutoParts India", clientInit: "AI", clientColor: "bg-cyan-500", lines: 6, pieces: 200, dispatchMode: "Courier", shipTo: "Delhi", sla: "6h", slaRisk: false, status: "Packed" },
  { id: "SO-2405", client: "MediSupply Corp", clientInit: "MS", clientColor: "bg-rose-500", lines: 10, pieces: 600, dispatchMode: "Pickup", shipTo: "—", sla: "3h", slaRisk: false, status: "Dispatched" },
  { id: "SO-2406", client: "FreshFarm Organics", clientInit: "FF", clientColor: "bg-orange-500", lines: 3, pieces: 90, dispatchMode: "Local Delivery", shipTo: "Nashik", sla: "2h", slaRisk: true, status: "New" },
  { id: "SO-2407", client: "Apex Pharma Ltd", clientInit: "AP", clientColor: "bg-blue-500", lines: 5, pieces: 150, dispatchMode: "Export", shipTo: "Chennai Port", sla: "8h", slaRisk: false, status: "Allocated" },
]

const modeColors: Record<string, string> = {
  Courier: "bg-brand/15 text-brand",
  "Local Delivery": "bg-emerald-500/15 text-emerald-400",
  Export: "bg-amber-500/15 text-amber-400",
  Pickup: "bg-violet-500/15 text-violet-400",
}

const columns = ["New", "Allocated", "Picking", "Packed", "Dispatched"]
const columnBorderColors: Record<string, string> = {
  New: "border-l-slate-400",
  Allocated: "border-l-blue-400",
  Picking: "border-l-amber-400",
  Packed: "border-l-violet-400",
  Dispatched: "border-l-success",
}

const kpis = [
  { label: "New", value: "2", color: "text-slate-400" },
  { label: "Allocated", value: "2", color: "text-blue-400" },
  { label: "Picking", value: "1", color: "text-amber-400" },
  { label: "Packed", value: "1", color: "text-violet-400" },
  { label: "Dispatched Today", value: "18", color: "text-success" },
  { label: "SLA at Risk", value: "2", color: "text-danger" },
]

export default function ShipOutQueuePage() {
  const [view, setView] = useState<"kanban" | "table">("kanban")
  const [search, setSearch] = useState("")

  const filtered = orders.filter(o =>
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.client.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
        {kpis.map(k => (
          <div key={k.label} className="p-3 rounded-xl border border-border bg-card text-center">
            <p className={cn("text-2xl font-bold", k.color)}>{k.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[180px] max-w-xs px-3 py-2 rounded-lg border border-border bg-card">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders, clients..." className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground/60" />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-sm text-muted-foreground hover:text-foreground transition-colors"><Filter className="w-4 h-4" /> Filter</button>
        <ExportButton data={filtered.map(o => ({ id: o.id, client: o.client, lines: o.lines, pieces: o.pieces, dispatchMode: o.dispatchMode, shipTo: o.shipTo, sla: o.sla, slaRisk: o.slaRisk, status: o.status }))} filename="3pl-ship-out" />
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => setView("kanban")} className={cn("w-8 h-8 flex items-center justify-center rounded-lg border transition-colors", view === "kanban" ? "bg-brand border-brand text-white" : "border-border text-muted-foreground")}><LayoutGrid className="w-4 h-4" /></button>
          <button onClick={() => setView("table")} className={cn("w-8 h-8 flex items-center justify-center rounded-lg border transition-colors", view === "table" ? "bg-brand border-brand text-white" : "border-border text-muted-foreground")}><List className="w-4 h-4" /></button>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F7941D] text-white text-sm font-medium hover:bg-[#F7941D]/90 transition-colors">
          <Plus className="w-4 h-4" /> New Ship-Out
        </button>
      </div>

      {view === "kanban" ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map(col => {
            const items = filtered.filter(o => o.status === col)
            return (
              <div key={col} className="shrink-0 w-64">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{col}</span>
                  <span className="text-xs font-bold bg-muted px-2 py-0.5 rounded-full text-foreground">{items.length}</span>
                </div>
                <div className="space-y-3">
                  {items.map(o => (
                    <div key={o.id} className={cn("p-4 rounded-xl border border-border bg-card border-l-4 hover:border-brand/40 transition-all cursor-pointer", columnBorderColors[o.status])}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0", o.clientColor)}>{o.clientInit}</div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">{o.id}</p>
                            <p className="text-xs font-semibold text-foreground leading-tight truncate max-w-[120px]">{o.client}</p>
                          </div>
                        </div>
                        {o.slaRisk && <AlertTriangle className="w-4 h-4 text-danger shrink-0" />}
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", modeColors[o.dispatchMode])}>{o.dispatchMode}</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{o.lines}L · {o.pieces}pcs</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Truck className="w-3 h-3" />
                        <span className="truncate">{o.shipTo}</span>
                        <span className="ml-auto flex items-center gap-0.5"><Clock className="w-3 h-3" />{o.sla}</span>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 rounded-xl border border-dashed border-border text-muted-foreground">
                      <Package className="w-5 h-5 mb-1 opacity-40" />
                      <span className="text-xs">Empty</span>
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
                {["Order Ref", "Client", "Lines/Pcs", "Mode", "Ship To", "SLA", "Status", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => (
                <tr key={o.id} className={cn("border-b border-border/50 hover:bg-muted/20 transition-colors", i % 2 === 0 ? "" : "bg-muted/5")}>
                  <td className="px-4 py-3 text-xs font-mono font-semibold text-brand">{o.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold", o.clientColor)}>{o.clientInit}</div>
                      <span className="text-xs font-medium">{o.client}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{o.lines}L · {o.pieces}pcs</td>
                  <td className="px-4 py-3"><span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", modeColors[o.dispatchMode])}>{o.dispatchMode}</span></td>
                  <td className="px-4 py-3 text-xs text-foreground">{o.shipTo}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {o.slaRisk && <AlertTriangle className="w-3 h-3 text-danger" />}
                      <span className={cn("text-xs font-semibold", o.slaRisk ? "text-danger" : "text-muted-foreground")}>{o.sla}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{o.status}</span></td>
                  <td className="px-4 py-3"><button className="flex items-center gap-1 text-xs text-brand hover:underline">View <ChevronRight className="w-3 h-3" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
