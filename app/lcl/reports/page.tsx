"use client"
import { FileText, Download, BarChart2 } from "lucide-react"
import { ExportButton } from "@/components/wms/export-button"

const reports = [
  { id:"RPT-001",name:"Monthly Consolidation Summary",period:"Jun 2025",size:"2.4 MB",status:"Ready"},
  { id:"RPT-002",name:"Cargo Receipt Register",period:"Jul 2025",size:"1.1 MB",status:"Ready"},
  { id:"RPT-003",name:"Load Plan Efficiency Report",period:"Jul 2025",size:"0.8 MB",status:"Generating"},
  { id:"RPT-004",name:"De-consolidation Log",period:"Jun 2025",size:"1.6 MB",status:"Ready"},
  { id:"RPT-005",name:"CBM Utilisation Report",period:"Q2 2025",size:"3.2 MB",status:"Ready"},
]

export default function LCLReportsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">LCL Reports</h1><p className="text-sm text-muted-foreground mt-1">Generated reports for consolidation, cargo and load planning</p></div>
        <ExportButton data={reports} filename="lcl-reports" />
      </div>
      <div className="space-y-3">
        {reports.map(r=>(
          <div key={r.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
            <FileText className="w-8 h-8 text-brand shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-foreground">{r.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{r.period} &bull; {r.size}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium mr-4 ${r.status==="Ready"?"bg-success/10 text-success":"bg-amber-50 text-amber-600"}`}>{r.status}</span>
            <button disabled={r.status!=="Ready"} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
