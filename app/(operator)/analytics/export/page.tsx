"use client"
import { useState } from "react"
import { FileText, Download, Calendar, Check } from "lucide-react"
import { ExportButton } from "@/components/wms/export-button"
import { exportCSV, exportJSON, fileTimestamp } from "@/lib/export"
import { notify } from "@/components/ui/toast"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Report = {
  id: string; name: string; category: string; schedule: string
  lastRun: string; rows: number; format: string
}

const initialReports: Report[] = [
  { id: "RPT-001", name: "Monthly KPI Summary", category: "KPI", schedule: "Monthly", lastRun: "2025-06-30", rows: 1240, format: "CSV" },
  { id: "RPT-002", name: "Order Fulfilment Report", category: "Orders", schedule: "Weekly", lastRun: "2025-07-14", rows: 4820, format: "CSV" },
  { id: "RPT-003", name: "Inventory Turnover", category: "Inventory", schedule: "Monthly", lastRun: "2025-06-30", rows: 2458, format: "Excel" },
  { id: "RPT-004", name: "Workforce Productivity", category: "Workforce", schedule: "Daily", lastRun: "2025-07-19", rows: 45, format: "CSV" },
  { id: "RPT-005", name: "SLA Compliance Report", category: "SLA", schedule: "Weekly", lastRun: "2025-07-14", rows: 312, format: "PDF" },
  { id: "RPT-006", name: "Billing Summary", category: "Billing", schedule: "Monthly", lastRun: "2025-06-30", rows: 88, format: "Excel" },
]

export default function AnalyticsExportPage() {
  const [reports, setReports] = useState<Report[]>(initialReports)
  const [downloaded, setDownloaded] = useState<string | null>(null)

  function download(r: Report) {
    const name = `${r.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}_${fileTimestamp()}`
    // Excel and PDF exports fall back to the machine-readable formats we can generate client-side.
    if (r.format === "Excel") exportJSON([r], name)
    else exportCSV([r], name)

    const today = new Date().toISOString().slice(0, 10)
    setReports((prev) => prev.map((x) => (x.id === r.id ? { ...x, lastRun: today } : x)))
    setDownloaded(r.id)
    setTimeout(() => setDownloaded((cur) => (cur === r.id ? null : cur)), 2000)
    notify.success("Report downloaded", `${r.name} (${r.rows.toLocaleString()} rows) exported as ${r.format === "Excel" ? "JSON" : "CSV"}.`)
  }

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
          <thead className="bg-muted/50 border-b border-border">
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
                  <button
                    onClick={() => download(r)}
                    title={`Download ${r.name}`}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-card text-xs transition-colors hover:bg-muted ${downloaded === r.id ? "border-success/60 text-success" : "border-border text-foreground"}`}
                  >
                    {downloaded === r.id ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                    {downloaded === r.id ? "Downloaded" : "Download"}
                  </button>
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No reports available.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
