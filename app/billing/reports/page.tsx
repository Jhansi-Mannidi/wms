"use client"
import { BarChart2, TrendingUp, Download } from "lucide-react"
import { ExportButton } from "@/components/wms/export-button"

const reports = [
  { name: "Monthly Revenue Report", desc: "Revenue breakdown by client, service type and period", lastRun: "Today", format: "PDF / CSV" },
  { name: "Outstanding Receivables", desc: "Unpaid and overdue invoices with ageing analysis", lastRun: "Daily", format: "CSV / Email" },
  { name: "Client P&L Summary", desc: "Profitability per client after deducting operational costs", lastRun: "2024-07-15", format: "PDF" },
  { name: "Service Revenue Breakdown", desc: "Revenue split across storage, handling, VAS and others", lastRun: "2024-07-14", format: "CSV" },
]

export default function BillingReportsPage() {
  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold text-foreground">Billing Reports</h1><p className="text-sm text-muted-foreground mt-0.5">Financial reporting and analytics</p></div>
        <ExportButton data={reports.map(r => ({ name: r.name, desc: r.desc, lastRun: r.lastRun, format: r.format }))} filename="billing-reports" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map(r => (
          <div key={r.name} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:border-brand/30 transition-colors">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"><BarChart2 className="w-5 h-5 text-brand" /></div>
              <span className="text-xs text-muted-foreground">{r.format}</span>
            </div>
            <div><p className="font-semibold text-foreground">{r.name}</p><p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p></div>
            <div className="flex items-center justify-between pt-1 border-t border-border">
              <span className="text-xs text-muted-foreground">Last run: {r.lastRun}</span>
              <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand/10 text-brand text-xs font-medium hover:bg-brand/20 transition-colors"><Download className="w-3 h-3" /> Run</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
