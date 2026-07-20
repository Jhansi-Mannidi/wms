"use client"
import { FileText, Download, Calendar, CheckCircle2 } from "lucide-react"
import { ExportButton } from "@/components/wms/export-button"

const reports = [
  { id: "RPT-001", name: "Monthly KPI Summary", category: "KPI", schedule: "Monthly", lastRun: "2025-06-30", rows: 1240, format: "CSV" },
  { id: "RPT-002", name: "Order Fulfilment Report", category: "Orders", schedule: "Weekly", lastRun: "2025-07-14", rows: 4820, format: "CSV" },
  { id: "RPT-003", name: "Inventory Turnover", category: "Inventory", schedule: "Monthly", lastRun: "2025-06-30", rows: 2458, format: "Excel" },
  { id: "RPT-004", name: "Workforce Productivity", category: "Workforce", schedule: "Daily", lastRun: "2025-07-19", rows: 45, format: "CSV" },
  { id: "RPT-005", name: "SLA Compliance Report", category: "SLA", schedule: "Weekly", lastRun: "2025-07-14", rows: 312, format: "PDF" },
  { id: "RPT-006", name: "Billing Summary", category: "Billing", schedule: "Monthly", lastRun: "2025-06-30", rows: 88, format: "Excel" },
]

export default function AnalyticsExportPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Export Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Download analytics data and scheduled reports</p>
        </div>
        <ExportButton data={reports} filename="analytics-reports-index" />
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>{["Report","Category","Schedule","Last Run","Rows","Format","Action"].map(h => <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reports.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-brand shrink-0" /><span className="font-medium text-foreground">{r.name}</span></div>
                </td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">{r.category}</span></td>
                <td className="px-4 py-3 text-muted-foreground"><div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{r.schedule}</div></td>
                <td className="px-4 py-3 text-muted-foreground">{r.lastRun}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.rows.toLocaleString()}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-muted text-xs font-mono text-muted-foreground">{r.format}</span></td>
                <td className="px-4 py-3">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs text-foreground hover:bg-muted transition-colors">
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
