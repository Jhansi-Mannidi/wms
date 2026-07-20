"use client"
import { CheckCircle2, AlertTriangle, FileText } from "lucide-react"

const records = [
  { zone:"Cold Room A", standard:"FSSAI Cold Storage", lastAudit:"2025-06-15", nextAudit:"2025-12-15", score:96, status:"Compliant" },
  { zone:"Cold Room B", standard:"FSSAI Cold Storage", lastAudit:"2025-06-15", nextAudit:"2025-12-15", score:88, status:"Minor Issue" },
  { zone:"Freezer Zone", standard:"FDA 21 CFR 211.68", lastAudit:"2025-05-20", nextAudit:"2025-11-20", score:99, status:"Compliant" },
  { zone:"Chiller Zone", standard:"ISO 22000", lastAudit:"2025-04-10", nextAudit:"2025-10-10", score:92, status:"Compliant" },
  { zone:"Loading Bay", standard:"HACCP", lastAudit:"2025-03-01", nextAudit:"2025-09-01", score:72, status:"Action Required" },
]

export default function ColdChainCompliancePage() {
  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Compliance Records</h1><p className="text-sm text-muted-foreground mt-1">Regulatory compliance scores and audit schedules per zone</p></div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["Zone","Standard","Last Audit","Next Audit","Score","Status"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {records.map(r=>(
              <tr key={r.zone} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{r.zone}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{r.standard}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.lastAudit}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.nextAudit}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-muted rounded-full h-1.5"><div className={`h-1.5 rounded-full ${r.score>=90?"bg-success":r.score>=75?"bg-amber-400":"bg-danger"}`} style={{width:`${r.score}%`}} /></div>
                    <span className="text-xs font-medium">{r.score}%</span>
                  </div>
                </td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.status==="Compliant"?"bg-success/10 text-success":r.status==="Minor Issue"?"bg-amber-50 text-amber-600":"bg-danger/10 text-danger"}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
