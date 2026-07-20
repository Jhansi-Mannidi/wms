"use client"
import { useState } from "react"
import { Search, Truck } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"

const orders = [
  { id: "ORD-8770", client: "Acme Foods", boxes: 5, weight: "28kg", awb: "BD-20240101", courier: "BlueDart", pickupSlot: "14:00-16:00", shipTo: "Mumbai", sla: "2024-07-21" },
  { id: "ORD-8768", client: "Agro Corp", boxes: 3, weight: "60kg", awb: "DL-20240202", courier: "Delhivery", pickupSlot: "15:00-17:00", shipTo: "Delhi", sla: "2024-07-21" },
  { id: "ORD-8765", client: "Sweet Mills", boxes: 8, weight: "40kg", awb: "FX-88010", courier: "FedEx", pickupSlot: "12:00-14:00", shipTo: "Chennai", sla: "2024-07-20" },
]

export default function ReadyToShipPage() {
  const [search, setSearch] = useState("")
  const filtered = orders.filter(o => o.id.toLowerCase().includes(search.toLowerCase()) || o.client.toLowerCase().includes(search.toLowerCase()))
  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold text-foreground">Ready to Ship</h1><p className="text-sm text-muted-foreground mt-0.5">Orders staged and awaiting carrier pickup</p></div>
        <ExportButton data={filtered} filename="ready-to-ship" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: "Awaiting Pickup", value: "34" }, { label: "Pickup Today", value: "28" }, { label: "Total Boxes", value: "142" }, { label: "Total Weight", value: "1.8T" }].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order ID, client, AWB..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>{["Order ID", "Client", "Boxes", "Weight", "AWB", "Courier", "Pickup Slot", "Ship To", "SLA"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(o => (
              <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{o.id}</td>
                <td className="px-4 py-3 text-foreground">{o.client}</td>
                <td className="px-4 py-3 text-foreground">{o.boxes}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.weight}</td>
                <td className="px-4 py-3 font-mono text-xs text-brand">{o.awb}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.courier}</td>
                <td className="px-4 py-3 text-foreground">{o.pickupSlot}</td>
                <td className="px-4 py-3 text-foreground">{o.shipTo}</td>
                <td className="px-4 py-3 text-foreground">{o.sla}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
