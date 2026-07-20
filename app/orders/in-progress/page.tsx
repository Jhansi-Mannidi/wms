"use client"
import { useState } from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"

const orders = [
  { id: "ORD-8800", client: "Acme Foods", items: 5, picked: 3, packed: 0, picker: "Ravi Kumar", started: "2024-07-20 09:00", sla: "2024-07-20 16:00", progress: 60, stage: "Picking" },
  { id: "ORD-8795", client: "Global Oils", items: 4, picked: 4, packed: 2, picker: "Priya Sharma", started: "2024-07-20 08:30", sla: "2024-07-20 15:00", progress: 80, stage: "Packing" },
  { id: "ORD-8790", client: "Agro Corp", items: 8, picked: 8, packed: 6, picker: "Suresh Yadav", started: "2024-07-20 07:00", sla: "2024-07-20 13:00", progress: 90, stage: "QC Check" },
  { id: "ORD-8785", client: "Salt Works", items: 3, picked: 1, packed: 0, picker: "Arjun Nair", started: "2024-07-20 09:30", sla: "2024-07-21 09:00", progress: 33, stage: "Picking" },
]

export default function InProgressOrdersPage() {
  const [search, setSearch] = useState("")
  const filtered = orders.filter(o => o.id.toLowerCase().includes(search.toLowerCase()) || o.client.toLowerCase().includes(search.toLowerCase()))
  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">In Progress</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Orders currently being picked or packed</p>
        </div>
        <ExportButton data={filtered} filename="orders-in-progress" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: "Active Orders", value: "45" }, { label: "Picking Stage", value: "28" }, { label: "Packing Stage", value: "12" }, { label: "QC / Staging", value: "5" }].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
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
            <tr>{["Order ID", "Client", "Progress", "Stage", "Picker", "Started", "SLA"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(o => (
              <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{o.id}</td>
                <td className="px-4 py-3 text-foreground">{o.client}</td>
                <td className="px-4 py-3 w-48">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-1.5"><div className="h-1.5 rounded-full bg-brand transition-all" style={{ width: `${o.progress}%` }} /></div>
                    <span className="text-xs text-muted-foreground w-8">{o.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{o.stage}</span></td>
                <td className="px-4 py-3 text-foreground">{o.picker}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.started}</td>
                <td className="px-4 py-3 text-foreground">{o.sla}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
