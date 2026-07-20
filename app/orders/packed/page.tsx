"use client"
import { useState } from "react"
import { Search, PackageCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"

const orders = [
  { id: "ORD-8780", client: "Acme Foods", boxes: 4, weight: "22kg", packedBy: "Priya Sharma", packedAt: "2024-07-20 10:30", sla: "2024-07-20 18:00", courier: "BlueDart", awb: "" },
  { id: "ORD-8778", client: "Global Oils", boxes: 2, weight: "18kg", packedBy: "Meena Patel", packedAt: "2024-07-20 09:45", sla: "2024-07-20 16:00", courier: "DTDC", awb: "" },
  { id: "ORD-8775", client: "Salt Works", boxes: 6, weight: "35kg", packedBy: "Ravi Kumar", packedAt: "2024-07-20 09:00", sla: "2024-07-21 10:00", courier: "FedEx", awb: "FX-88001" },
]

export default function PackedOrdersPage() {
  const [search, setSearch] = useState("")
  const filtered = orders.filter(o => o.id.toLowerCase().includes(search.toLowerCase()) || o.client.toLowerCase().includes(search.toLowerCase()))
  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold text-foreground">Packed Orders</h1><p className="text-sm text-muted-foreground mt-0.5">Orders packed and awaiting courier pickup</p></div>
        <ExportButton data={filtered} filename="packed-orders" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: "Packed Today", value: "34" }, { label: "Awaiting AWB", value: "18", cls: "text-amber-600" }, { label: "AWB Generated", value: "16" }, { label: "Total Boxes", value: "128" }].map(s => (
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
            <tr>{["Order ID", "Client", "Boxes", "Weight", "Packed By", "Packed At", "SLA", "Courier", "AWB"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(o => (
              <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{o.id}</td>
                <td className="px-4 py-3 text-foreground">{o.client}</td>
                <td className="px-4 py-3 text-foreground">{o.boxes}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.weight}</td>
                <td className="px-4 py-3 text-foreground">{o.packedBy}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.packedAt}</td>
                <td className="px-4 py-3 text-foreground">{o.sla}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.courier}</td>
                <td className="px-4 py-3 font-mono text-xs text-brand">{o.awb || <span className="text-amber-600">Pending</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
