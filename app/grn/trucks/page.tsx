"use client"
import { Truck } from "lucide-react"
import { cn } from "@/lib/utils"

const trucks = [
  { vehicle: "TS 09 AB 1234", supplier: "Acme Foods", driver: "Ramesh K.", eta: "10:30 AM", dock: "Dock 1", items: 5, status: "At Dock", arrived: "10:28 AM" },
  { vehicle: "MH 12 CD 5678", supplier: "Agro Corp", driver: "Vinod M.", eta: "11:00 AM", dock: "Dock 2", items: 8, status: "Unloading", arrived: "10:55 AM" },
  { vehicle: "KA 01 EF 9012", supplier: "Salt Works", driver: "Sunil P.", eta: "12:00 PM", dock: "", items: 3, status: "En Route", arrived: "" },
  { vehicle: "AP 28 GH 3456", supplier: "Sweet Mills", driver: "Naresh B.", eta: "14:00 PM", dock: "", items: 6, status: "Scheduled", arrived: "" },
  { vehicle: "TN 07 IJ 7890", supplier: "Fresh Farms", driver: "Balu S.", eta: "08:00 AM", dock: "Dock 3", items: 4, status: "Completed", arrived: "07:58 AM" },
]

const statusStyle: Record<string, string> = {
  "At Dock": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Unloading: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "En Route": "bg-muted text-muted-foreground",
  Scheduled: "bg-muted text-muted-foreground",
  Completed: "bg-success/10 text-success",
}

export default function TruckArrivalPage() {
  return (
    <div className="w-full p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Truck Arrivals</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Live dock status and expected truck arrivals</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: "Expected Today", value: "8" }, { label: "At Dock", value: "2", cls: "text-blue-600" }, { label: "Unloading", value: "1", cls: "text-amber-600" }, { label: "Completed", value: "3", cls: "text-success" }].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn("text-2xl font-bold mt-1", s.cls || "text-foreground")}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>{["Vehicle No.", "Supplier", "Driver", "ETA", "Dock", "Items", "Arrived", "Status"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {trucks.map(t => (
              <tr key={t.vehicle} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">{t.vehicle}</td>
                <td className="px-4 py-3 text-foreground">{t.supplier}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.driver}</td>
                <td className="px-4 py-3 text-foreground">{t.eta}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.dock || "—"}</td>
                <td className="px-4 py-3 text-foreground">{t.items}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.arrived || "—"}</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusStyle[t.status])}>{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
