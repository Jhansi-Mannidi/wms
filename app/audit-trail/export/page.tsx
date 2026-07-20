"use client"
import { Download, FileText, Calendar, CheckCircle2 } from "lucide-react"
import { ExportButton } from "@/components/wms/export-button"

const presets = [
  { id: 1, name: "Full Audit Log — This Month", period: "Jul 2025", rows: 14820, format: "CSV" },
  { id: 2, name: "User Activity Summary", period: "Jul 2025", rows: 312, format: "CSV" },
  { id: 3, name: "Security Events", period: "Last 90 days", rows: 88, format: "CSV" },
  { id: 4, name: "Inventory Changes", period: "Jul 2025", rows: 4210, format: "Excel" },
  { id: 5, name: "Billing Modifications", period: "Q2 2025", rows: 142, format: "CSV" },
  { id: 6, name: "Compliance Report", period: "FY 2024-25", rows: 62440, format: "PDF" },
]

export default function AuditExportPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Export Audit Log</h1><p className="text-sm text-muted-foreground mt-1">Download full or filtered audit trail data</p></div>
        <ExportButton data={presets} filename="audit-log" label="Export All" />
      </div>
      <div className="grid grid-cols-1 gap-3">
        {presets.map(p => (
          <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
            <FileText className="w-8 h-8 text-brand shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-foreground">{p.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                <Calendar className="w-3 h-3" />{p.period} &bull; {p.rows.toLocaleString()} rows &bull; {p.format}
              </p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs text-foreground hover:bg-muted transition-colors shrink-0">
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
