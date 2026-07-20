"use client"
import { AlertTriangle } from "lucide-react"
import { ExportButton } from "@/components/wms/export-button"

const orders = [
  { id: "ORD-8750", client: "Acme Foods", items: 5, qty: 100, sla: "2024-07-19 16:00", breachedBy: "18h 30m", stage: "Picking", reason: "Staff shortage", escalated: true },
  { id: "ORD-8742", client: "Global Oils", items: 3, qty: 60, sla: "2024-07-18 12:00", breachedBy: "44h 00m", stage: "Pending Allocation", reason: "Stock unavailable", escalated: true },
  { id: "ORD-8735", client: "Sweet Mills", items: 2, qty: 40, sla: "2024-07-19 18:00", breachedBy: "16h 00m", stage: "Packing", reason: "Equipment downtime", escalated: false },
]

export default function SLABreachedPage() {
  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><AlertTriangle className="w-6 h-6 text-danger" />SLA Breached</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Orders that have exceeded their SLA deadline</p>
        </div>
        <ExportButton data={orders} filename="sla-breached" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: "Total Breached", value: "3", cls: "text-danger" }, { label: "Escalated", value: "2", cls: "text-amber-600" }, { label: "Avg Breach Time", value: "26h" }, { label: "MTD Breaches", value: "8" }].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.cls || "text-foreground"}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>{["Order ID", "Client", "Items", "Qty", "SLA Deadline", "Breached By", "Stage", "Reason", "Escalated"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map(o => (
              <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{o.id}</td>
                <td className="px-4 py-3 text-foreground">{o.client}</td>
                <td className="px-4 py-3 text-foreground">{o.items}</td>
                <td className="px-4 py-3 font-semibold">{o.qty}</td>
                <td className="px-4 py-3 text-danger font-medium">{o.sla}</td>
                <td className="px-4 py-3 font-semibold text-danger">{o.breachedBy}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.stage}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{o.reason}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${o.escalated ? "bg-danger/10 text-danger" : "bg-muted text-muted-foreground"}`}>{o.escalated ? "Yes" : "No"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
