"use client"
import { cn } from "@/lib/utils"
import { PackageCheck } from "lucide-react"

const tasks = [
  { id: "PUT-2024-0441", grn: "GRN-2024-1050", sku: "SKU-001234", product: "Premium Basmati Rice 5kg", qty: 500, suggestedLoc: "A-12-03", assignedTo: "Ravi Kumar", started: "10:15 AM", status: "In Progress" },
  { id: "PUT-2024-0440", grn: "GRN-2024-1050", sku: "SKU-001239", product: "Iodized Salt 1kg", qty: 2000, suggestedLoc: "A-04-11", assignedTo: "Priya Sharma", started: "10:30 AM", status: "Pending" },
  { id: "PUT-2024-0439", grn: "GRN-2024-1049", sku: "SKU-001235", product: "Organic Wheat Flour 10kg", qty: 200, suggestedLoc: "A-12-04", assignedTo: "Suresh Yadav", started: "09:00 AM", status: "Completed" },
  { id: "PUT-2024-0438", grn: "GRN-2024-1049", sku: "SKU-001237", product: "Chickpea Lentils 25kg", qty: 100, suggestedLoc: "C-03-07", assignedTo: "Meena Patel", started: "09:00 AM", status: "Completed" },
]

const statusStyle: Record<string, string> = {
  Pending: "bg-muted text-muted-foreground",
  "In Progress": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Completed: "bg-success/10 text-success",
}

export default function PutawayPage() {
  return (
    <div className="w-full p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Putaway</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Assign and track putaway tasks from received GRNs</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: "Open Tasks", value: "2" }, { label: "In Progress", value: "1", cls: "text-blue-600" }, { label: "Completed Today", value: "14", cls: "text-success" }, { label: "Avg Putaway Time", value: "12m" }].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn("text-2xl font-bold mt-1", s.cls || "text-foreground")}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>{["Task ID", "GRN", "Product", "Qty", "Suggested Location", "Assigned To", "Started", "Status"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tasks.map(t => (
              <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{t.id}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.grn}</td>
                <td className="px-4 py-3"><p className="text-xs text-brand font-mono">{t.sku}</p><p className="text-xs text-foreground">{t.product}</p></td>
                <td className="px-4 py-3 font-semibold text-foreground">{t.qty}</td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{t.suggestedLoc}</td>
                <td className="px-4 py-3 text-foreground">{t.assignedTo}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.started}</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusStyle[t.status])}>{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
