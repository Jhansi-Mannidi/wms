"use client"
import { useState } from "react"
import { BarChart2, Download } from "lucide-react"
import { ExportButton } from "@/components/wms/export-button"
import { Drawer } from "@/components/ui/modal"
import { DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Report = { name: string; desc: string; lastRun: string; format: string }

const initialReports: Report[] = [
  { name: "Monthly Revenue Report", desc: "Revenue breakdown by client, service type and period", lastRun: "Today", format: "PDF / CSV" },
  { name: "Outstanding Receivables", desc: "Unpaid and overdue invoices with ageing analysis", lastRun: "Daily", format: "CSV / Email" },
  { name: "Client P&L Summary", desc: "Profitability per client after deducting operational costs", lastRun: "2024-07-15", format: "PDF" },
  { name: "Service Revenue Breakdown", desc: "Revenue split across storage, handling, VAS and others", lastRun: "2024-07-14", format: "CSV" },
]

function stamp() {
  const now = new Date()
  return `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`
}

export default function BillingReportsPage() {
  const [reports, setReports] = useState<Report[]>(initialReports)
  const [detail, setDetail] = useState<Report | null>(null)

  function run(r: Report) {
    const at = stamp()
    setReports(prev => prev.map(x => x.name === r.name ? { ...x, lastRun: at } : x))
    setDetail(prev => prev && prev.name === r.name ? { ...prev, lastRun: at } : prev)
    notify.success("Report generated", `${r.name} produced as ${r.format} at ${at.slice(11)}.`)
  }

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
            <button onClick={() => setDetail(r)} title={`View ${r.name}`} className="text-left">
              <p className="font-semibold text-foreground hover:text-brand transition-colors">{r.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
            </button>
            <div className="flex items-center justify-between pt-1 border-t border-border">
              <span className="text-xs text-muted-foreground">Last run: {r.lastRun}</span>
              <button onClick={() => run(r)} title={`Run ${r.name}`} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand/10 text-brand text-xs font-medium hover:bg-brand/20 transition-colors"><Download className="w-3 h-3" /> Run</button>
            </div>
          </div>
        ))}
      </div>

      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.name ?? ""}
        description="Report definition"
        footer={
          <>
            <button onClick={() => detail && run(detail)} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
              Run Report
            </button>
            <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Close
            </button>
          </>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Report" value={detail.name} />
            <DetailRow label="Description" value={detail.desc} />
            <DetailRow label="Output Format" value={detail.format} />
            <DetailRow label="Last Run" value={detail.lastRun} />
          </div>
        )}
      </Drawer>
    </div>
  )
}
