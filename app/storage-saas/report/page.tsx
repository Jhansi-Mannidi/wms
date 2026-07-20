"use client"
import { FileText, Download } from "lucide-react"
import { ExportButton } from "@/components/wms/export-button"

const reports = [
  { id:"RPT-001",name:"Monthly Occupancy Report",period:"Jun 2025",size:"1.2 MB",status:"Ready"},
  { id:"RPT-002",name:"Customer Billing Summary",period:"Jun 2025",size:"0.8 MB",status:"Ready"},
  { id:"RPT-003",name:"Space Utilisation Trend",period:"Q2 2025",size:"2.1 MB",status:"Ready"},
  { id:"RPT-004",name:"Stock Movement Log",period:"Jul 2025",size:"0.5 MB",status:"Generating"},
  { id:"RPT-005",name:"Revenue by Customer",period:"FY 2024-25",size:"1.8 MB",status:"Ready"},
]

export default function StorageSaasReportPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Reports</h1><p className="text-sm text-muted-foreground mt-1">Occupancy, billing and movement reports for storage services</p></div>
        <ExportButton data={reports} filename="storage-reports" />
      </div>
      <div className="space-y-3">
        {reports.map(r=>(
          <div key={r.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
            <FileText className="w-8 h-8 text-brand shrink-0" />
            <div className="flex-1"><p className="font-medium text-foreground">{r.name}</p><p className="text-xs text-muted-foreground mt-0.5">{r.period} &bull; {r.size}</p></div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium mr-4 ${r.status==="Ready"?"bg-success/10 text-success":"bg-amber-50 text-amber-600"}`}>{r.status}</span>
            <button disabled={r.status!=="Ready"} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"><Download className="w-3.5 h-3.5" /> Download</button>
          </div>
        ))}
      </div>
    </div>
  )
}
