"use client"
import { useState } from "react"
import { Search, Clock, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"

const orders = [
  { id: "ORD-8820", client: "Acme Foods", items: 5, qty: 120, priority: "High", orderDate: "2024-07-20 08:15", sla: "2024-07-20 18:00", waitTime: "2h 14m", reason: "Awaiting stock" },
  { id: "ORD-8819", client: "Global Oils", items: 3, qty: 60, priority: "Normal", orderDate: "2024-07-20 07:30", sla: "2024-07-21 12:00", waitTime: "3h 01m", reason: "Awaiting allocation" },
  { id: "ORD-8817", client: "Agro Corp", items: 8, qty: 200, priority: "Urgent", orderDate: "2024-07-19 22:00", sla: "2024-07-20 10:00", waitTime: "10h", reason: "Partial stock" },
  { id: "ORD-8815", client: "Sweet Mills", items: 2, qty: 40, priority: "Normal", orderDate: "2024-07-19 18:00", sla: "2024-07-21 18:00", waitTime: "14h", reason: "Awaiting confirmation" },
]

const priorityColor: Record<string, string> = {
  Urgent: "bg-danger/10 text-danger",
  High: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Normal: "bg-muted text-muted-foreground",
}

export default function PendingOrdersPage() {
  const [search, setSearch] = useState("")
  const filtered = orders.filter(o => o.id.toLowerCase().includes(search.toLowerCase()) || o.client.toLowerCase().includes(search.toLowerCase()))
  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pending Allocation</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Orders awaiting inventory allocation</p>
        </div>
        <ExportButton data={filtered} filename="pending-orders" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: "Total Pending", value: "28", cls: "text-amber-600" }, { label: "Urgent", value: "3", cls: "text-danger" }, { label: "Awaiting Stock", value: "12" }, { label: "Avg Wait Time", value: "4.2h" }].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn("text-2xl font-bold mt-1", s.cls || "text-foreground")}>{s.value}</p>
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
            <tr>{["Order ID", "Client", "Items", "Qty", "Priority", "Order Date", "SLA", "Wait Time", "Reason"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(o => (
              <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{o.id}</td>
                <td className="px-4 py-3 text-foreground">{o.client}</td>
                <td className="px-4 py-3 text-foreground">{o.items}</td>
                <td className="px-4 py-3 font-semibold text-foreground">{o.qty}</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", priorityColor[o.priority])}>{o.priority}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{o.orderDate}</td>
                <td className="px-4 py-3 text-foreground">{o.sla}</td>
                <td className="px-4 py-3 flex items-center gap-1 text-amber-600"><Clock className="w-3.5 h-3.5" />{o.waitTime}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{o.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
