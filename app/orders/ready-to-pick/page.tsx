"use client"
import { useState } from "react"
import { Search, Package, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"

const orders = [
  { id: "ORD-8810", client: "Acme Foods", items: 4, qty: 88, zone: "A", picker: "Unassigned", sla: "2024-07-20 16:00", priority: "High" },
  { id: "ORD-8808", client: "Salt Works", items: 2, qty: 200, zone: "A,D", picker: "Ravi Kumar", sla: "2024-07-20 18:00", priority: "Normal" },
  { id: "ORD-8806", client: "Agro Corp", items: 6, qty: 150, zone: "B,C", picker: "Priya Sharma", sla: "2024-07-21 10:00", priority: "Normal" },
  { id: "ORD-8804", client: "Fresh Farms", items: 3, qty: 60, zone: "D", picker: "Unassigned", sla: "2024-07-20 14:00", priority: "Urgent" },
]

export default function ReadyToPickPage() {
  const [search, setSearch] = useState("")
  const filtered = orders.filter(o => o.id.toLowerCase().includes(search.toLowerCase()) || o.client.toLowerCase().includes(search.toLowerCase()))
  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ready to Pick</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Allocated orders ready for picker assignment</p>
        </div>
        <ExportButton data={filtered} filename="ready-to-pick" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: "Ready", value: "0" }, { label: "Unassigned", value: "2", cls: "text-amber-600" }, { label: "Assigned", value: "2" }, { label: "Urgent", value: "1", cls: "text-danger" }].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn("text-2xl font-bold mt-1", s.cls || "text-foreground")}>{filtered.length || s.value}</p>
          </div>
        ))}
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order ID, client..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>{["Order ID", "Client", "Items", "Qty", "Zone(s)", "Picker", "SLA", "Priority", ""].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(o => (
              <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{o.id}</td>
                <td className="px-4 py-3 text-foreground">{o.client}</td>
                <td className="px-4 py-3 text-foreground">{o.items}</td>
                <td className="px-4 py-3 font-semibold text-foreground">{o.qty}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.zone}</td>
                <td className="px-4 py-3"><span className={cn("text-xs", o.picker === "Unassigned" ? "text-amber-600 font-medium" : "text-foreground")}>{o.picker}</span></td>
                <td className="px-4 py-3 text-foreground">{o.sla}</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", o.priority === "Urgent" ? "bg-danger/10 text-danger" : o.priority === "High" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground")}>{o.priority}</span></td>
                <td className="px-4 py-3"><button className="flex items-center gap-1 px-2 py-1 rounded-md bg-brand text-white text-xs hover:bg-brand/90"><Play className="w-3 h-3" /> Start</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
