"use client"
import { Truck } from "lucide-react"
import { cn } from "@/lib/utils"

const trucks = [
  { vehicle: "TS 09 AB 1234", supplier: "Acme Foods", driver: "Ramesh K.", eta: "10:30 AM", dock: "Dock 1", items: 5, status: "At Dock", arrived: "10:28 AM" },
  { vehicle: "MH 12 CD 5678", supplier: "Agro Corp", driver: "Vinod M.", eta: "11:00 AM", dock: "Dock 2", items: 8, status: "Unloading", arrived: "10:55 AM" },
  { vehicle: "KA 01 EF 9012", supplier: "Salt Works", driver: "Sunil P.", eta: "12:00 PM", dock: "", items: 3, status: "En Route", arrived: "" },
  { vehicle: "AP 28 GH 3456", supplier: "Sweet Mills", driver: "Naresh B.", eta: "14:00 PM", dock: "", items: 6, status: "Scheduled", arrived: "" },
  { vehicle: "TN 07 IJ 7890", supplier: "Fresh Farms", driver: "Balu S.", eta: "08:00 AM", dock: "Dock 3", items: 4, status: "Completed", arrived: "07:58 AM" },
  { vehicle: "GJ 05 KL 2345", supplier: "Global Oils", driver: "Mahesh J.", eta: "09:15 AM", dock: "Dock 1", items: 7, status: "Completed", arrived: "09:10 AM" },
  { vehicle: "RJ 14 MN 6789", supplier: "Acme Foods", driver: "Dinesh R.", eta: "07:30 AM", dock: "Dock 2", items: 9, status: "Completed", arrived: "07:22 AM" },
  { vehicle: "UP 32 OP 1122", supplier: "Agro Corp", driver: "Kiran S.", eta: "06:45 AM", dock: "Dock 4", items: 5, status: "Completed", arrived: "06:52 AM" },
  { vehicle: "HR 26 QR 3344", supplier: "Sweet Mills", driver: "Anil T.", eta: "08:30 AM", dock: "Dock 1", items: 3, status: "Completed", arrived: "08:26 AM" },
  { vehicle: "WB 06 ST 5566", supplier: "Salt Works", driver: "Gopal N.", eta: "07:00 AM", dock: "Dock 3", items: 6, status: "Completed", arrived: "07:04 AM" },
  { vehicle: "PB 10 UV 7788", supplier: "Tropical Co", driver: "Harish D.", eta: "09:45 AM", dock: "Dock 2", items: 2, status: "Completed", arrived: "09:41 AM" },
  { vehicle: "KL 11 WX 9900", supplier: "Fresh Farms", driver: "Shaji V.", eta: "06:15 AM", dock: "Dock 4", items: 8, status: "Completed", arrived: "06:20 AM" },
  { vehicle: "MP 09 YZ 2233", supplier: "Acme Foods", driver: "Prakash L.", eta: "10:45 AM", dock: "Dock 3", items: 4, status: "At Dock", arrived: "10:42 AM" },
  { vehicle: "TS 08 AB 4455", supplier: "Global Oils", driver: "Srinivas K.", eta: "11:15 AM", dock: "Dock 4", items: 7, status: "At Dock", arrived: "11:12 AM" },
  { vehicle: "MH 14 CD 6677", supplier: "Agro Corp", driver: "Deepak P.", eta: "11:00 AM", dock: "Dock 1", items: 5, status: "Unloading", arrived: "10:58 AM" },
  { vehicle: "KA 05 EF 8899", supplier: "Sweet Mills", driver: "Manjunath G.", eta: "11:30 AM", dock: "Dock 2", items: 6, status: "Unloading", arrived: "11:25 AM" },
  { vehicle: "AP 16 GH 1010", supplier: "Salt Works", driver: "Ramana C.", eta: "12:30 PM", dock: "", items: 4, status: "En Route", arrived: "" },
  { vehicle: "TN 22 IJ 2020", supplier: "Tropical Co", driver: "Murugan A.", eta: "13:00 PM", dock: "", items: 3, status: "En Route", arrived: "" },
  { vehicle: "GJ 18 KL 3030", supplier: "Fresh Farms", driver: "Jayesh B.", eta: "13:30 PM", dock: "", items: 9, status: "En Route", arrived: "" },
  { vehicle: "RJ 27 MN 4040", supplier: "Acme Foods", driver: "Bhavesh M.", eta: "15:00 PM", dock: "", items: 5, status: "Scheduled", arrived: "" },
  { vehicle: "UP 45 OP 5050", supplier: "Global Oils", driver: "Satish W.", eta: "16:00 PM", dock: "", items: 7, status: "Scheduled", arrived: "" },
  { vehicle: "HR 51 QR 6060", supplier: "Agro Corp", driver: "Rajesh H.", eta: "17:00 PM", dock: "", items: 2, status: "Scheduled", arrived: "" },
  { vehicle: "WB 24 ST 7070", supplier: "Sweet Mills", driver: "Tapan D.", eta: "18:00 PM", dock: "", items: 6, status: "Scheduled", arrived: "" },
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
          <div key={s.label} className="bg-card border border-border rounded-xl p-3">
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
