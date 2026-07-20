"use client"

import { useState } from "react"
import { Search, Filter, DollarSign, Package, Wrench, Truck, CheckCircle2, AlertCircle, ChevronDown, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"

const events = [
  { id: "BE-0421", client: "Apex Pharma Ltd", clientInit: "AP", clientColor: "bg-blue-500", type: "Storage", desc: "Pallet storage — Jul 2025", qty: 24, uom: "pallet-days", rate: 45, amount: 1080, period: "Jul 2025", status: "Pending" },
  { id: "BE-0422", client: "GlobalTex Fabrics", clientInit: "GT", clientColor: "bg-amber-500", type: "Handling", desc: "Inbound receipt handling — ASN-002", qty: 320, uom: "pieces", rate: 2.5, amount: 800, period: "Jul 2025", status: "Pending" },
  { id: "BE-0423", client: "Sunrise Electronics", clientInit: "SE", clientColor: "bg-emerald-500", type: "VAS", desc: "Kitting — KIT-089", qty: 50, uom: "units", rate: 35, amount: 1750, period: "Jul 2025", status: "Invoiced" },
  { id: "BE-0424", client: "AutoParts India", clientInit: "AI", clientColor: "bg-cyan-500", type: "Storage", desc: "Rack storage — Jul 2025", qty: 180, uom: "pallet-days", rate: 38, amount: 6840, period: "Jul 2025", status: "Pending" },
  { id: "BE-0425", client: "MediSupply Corp", clientInit: "MS", clientColor: "bg-rose-500", type: "Ancillary", desc: "Temperature monitoring surcharge", qty: 1, uom: "month", rate: 5000, amount: 5000, period: "Jul 2025", status: "Pending" },
  { id: "BE-0426", client: "FreshFarm Organics", clientInit: "FF", clientColor: "bg-orange-500", type: "Handling", desc: "Outbound dispatch — SO-2406", qty: 90, uom: "pieces", rate: 3, amount: 270, period: "Jul 2025", status: "Invoiced" },
  { id: "BE-0427", client: "GlobalTex Fabrics", clientInit: "GT", clientColor: "bg-amber-500", type: "VAS", desc: "Labelling — LBL-112", qty: 200, uom: "units", rate: 8, amount: 1600, period: "Jul 2025", status: "Pending" },
]

const typeColors: Record<string, string> = {
  Storage: "bg-blue-500/15 text-blue-400",
  Handling: "bg-amber-500/15 text-amber-400",
  VAS: "bg-violet-500/15 text-violet-400",
  Ancillary: "bg-rose-500/15 text-rose-400",
}
const typeIcons: Record<string, React.ReactNode> = {
  Storage: <Package className="w-3.5 h-3.5" />,
  Handling: <Truck className="w-3.5 h-3.5" />,
  VAS: <Wrench className="w-3.5 h-3.5" />,
  Ancillary: <DollarSign className="w-3.5 h-3.5" />,
}

const kpis = [
  { label: "Un-invoiced Value", value: "₹15,490", sub: "7 events", color: "text-warning", icon: <AlertCircle className="w-4 h-4" /> },
  { label: "Storage Accrued", value: "₹7,920", sub: "Jul 2025", color: "text-blue-400", icon: <Package className="w-4 h-4" /> },
  { label: "Handling Events", value: "₹1,070", sub: "2 events", color: "text-amber-400", icon: <Truck className="w-4 h-4" /> },
  { label: "VAS Events", value: "₹3,350", sub: "2 events", color: "text-violet-400", icon: <Wrench className="w-4 h-4" /> },
  { label: "Clients with Dues", value: "4", sub: "Pending invoice", color: "text-danger", icon: <AlertCircle className="w-4 h-4" /> },
]

export default function BillableEventsPage() {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [typeFilter, setTypeFilter] = useState("All")

  const types = ["All", "Storage", "Handling", "VAS", "Ancillary"]

  const filtered = events.filter(e =>
    (typeFilter === "All" || e.type === typeFilter) &&
    (e.client.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase()))
  )

  const toggleSelect = (id: string) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

  const totalSelected = events.filter(e => selected.includes(e.id)).reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {kpis.map(k => (
          <div key={k.label} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
            <div className={cn("w-9 h-9 rounded-lg border border-border flex items-center justify-center", k.color)}>{k.icon}</div>
            <div>
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <p className={cn("text-lg font-bold leading-tight", k.color)}>{k.value}</p>
              <p className="text-[10px] text-muted-foreground">{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[180px] max-w-xs px-3 py-2 rounded-lg border border-border bg-card">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events, clients..." className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground/60" />
        </div>
        <ExportButton data={filtered.map(e => ({ id: e.id, client: e.client, type: e.type, desc: e.desc, qty: e.qty, uom: e.uom, rate: e.rate, amount: e.amount, period: e.period, status: e.status }))} filename="3pl-billable-events" />
        <div className="flex gap-1">
          {types.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors", typeFilter === t ? "bg-brand text-white" : "border border-border bg-card text-muted-foreground hover:text-foreground")}>
              {t}
            </button>
          ))}
        </div>
        {selected.length > 0 && (
          <button className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F7941D] text-white text-sm font-medium hover:bg-[#F7941D]/90 transition-colors">
            <Play className="w-4 h-4" /> Run Invoice (₹{totalSelected.toLocaleString()})
          </button>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="w-10 px-4 py-3"><input type="checkbox" className="rounded" onChange={e => setSelected(e.target.checked ? events.map(ev => ev.id) : [])} /></th>
              {["Event", "Client", "Type", "Description", "Qty / UOM", "Rate (₹)", "Amount (₹)", "Period", "Status"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr key={e.id} className={cn("border-b border-border/50 hover:bg-muted/20 transition-colors", selected.includes(e.id) ? "bg-brand/5" : i % 2 === 0 ? "" : "bg-muted/5")}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.includes(e.id)} onChange={() => toggleSelect(e.id)} className="rounded" />
                </td>
                <td className="px-4 py-3 text-xs font-mono text-brand font-semibold">{e.id}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold", e.clientColor)}>{e.clientInit}</div>
                    <span className="text-xs font-medium text-foreground">{e.client}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full w-fit", typeColors[e.type])}>
                    {typeIcons[e.type]}{e.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[180px] truncate">{e.desc}</td>
                <td className="px-4 py-3 text-xs text-foreground">{e.qty.toLocaleString()} {e.uom}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">₹{e.rate}</td>
                <td className="px-4 py-3 text-xs font-bold text-foreground">₹{e.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{e.period}</td>
                <td className="px-4 py-3">
                  <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full",
                    e.status === "Invoiced" ? "bg-success/15 text-success" : "bg-warning/15 text-warning")}>
                    {e.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-muted/10">
          <span className="text-xs text-muted-foreground">Showing {filtered.length} of {events.length} events</span>
          <span className="text-xs font-semibold text-foreground">Total: ₹{filtered.reduce((s, e) => s + e.amount, 0).toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
