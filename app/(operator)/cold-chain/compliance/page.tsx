"use client"
import { useState } from "react"
import { CheckCircle2, AlertTriangle, BarChart2, Eye } from "lucide-react"
import { Drawer } from "@/components/ui/modal"
import { DetailRow } from "@/components/ui/form"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type ComplianceRecord = {
  zone: string; standard: string; lastAudit: string; nextAudit: string
  score: number; status: string
}

const records: ComplianceRecord[] = [
  { zone:"Cold Room A", standard:"FSSAI Cold Storage", lastAudit:"2025-06-15", nextAudit:"2025-12-15", score:96, status:"Compliant" },
  { zone:"Cold Room B", standard:"FSSAI Cold Storage", lastAudit:"2025-06-15", nextAudit:"2025-12-15", score:88, status:"Minor Issue" },
  { zone:"Freezer Zone", standard:"FDA 21 CFR 211.68", lastAudit:"2025-05-20", nextAudit:"2025-11-20", score:99, status:"Compliant" },
  { zone:"Chiller Zone", standard:"ISO 22000", lastAudit:"2025-04-10", nextAudit:"2025-10-10", score:92, status:"Compliant" },
  { zone:"Loading Bay", standard:"HACCP", lastAudit:"2025-03-01", nextAudit:"2025-09-01", score:72, status:"Action Required" },
  { zone:"Cold Room C", standard:"FSSAI Cold Storage", lastAudit:"2025-06-28", nextAudit:"2025-12-28", score:94, status:"Compliant" },
  { zone:"Cold Room D", standard:"ISO 22000", lastAudit:"2025-06-22", nextAudit:"2025-12-22", score:91, status:"Compliant" },
  { zone:"Dairy Chiller", standard:"FSSAI Cold Storage", lastAudit:"2025-06-10", nextAudit:"2025-12-10", score:97, status:"Compliant" },
  { zone:"Ice Cream Vault", standard:"FDA 21 CFR 211.68", lastAudit:"2025-06-05", nextAudit:"2025-12-05", score:85, status:"Minor Issue" },
  { zone:"Blast Freezer", standard:"HACCP", lastAudit:"2025-05-30", nextAudit:"2025-11-30", score:93, status:"Compliant" },
  { zone:"Seafood Freezer", standard:"FSSAI Cold Storage", lastAudit:"2025-05-26", nextAudit:"2025-11-26", score:86, status:"Minor Issue" },
  { zone:"Pharma Cold Store", standard:"WHO GDP Annex 9", lastAudit:"2025-05-18", nextAudit:"2025-11-18", score:98, status:"Compliant" },
  { zone:"Vaccine Reserve", standard:"WHO GDP Annex 9", lastAudit:"2025-05-12", nextAudit:"2025-11-12", score:95, status:"Compliant" },
  { zone:"Produce Holding", standard:"ISO 22000", lastAudit:"2025-05-04", nextAudit:"2025-11-04", score:89, status:"Minor Issue" },
  { zone:"Dock Staging Cool", standard:"HACCP", lastAudit:"2025-04-28", nextAudit:"2025-10-28", score:68, status:"Action Required" },
  { zone:"Frozen Chamber 2", standard:"FDA 21 CFR 211.68", lastAudit:"2025-04-21", nextAudit:"2025-10-21", score:96, status:"Compliant" },
  { zone:"Meat Chiller", standard:"FSSAI Cold Storage", lastAudit:"2025-04-15", nextAudit:"2025-10-15", score:90, status:"Compliant" },
  { zone:"Bakery Cold Hold", standard:"ISO 22000", lastAudit:"2025-04-02", nextAudit:"2025-10-02", score:83, status:"Minor Issue" },
  { zone:"Beverage Chiller", standard:"HACCP", lastAudit:"2025-03-25", nextAudit:"2025-09-25", score:92, status:"Compliant" },
  { zone:"Reefer Dock 1", standard:"FSSAI Cold Storage", lastAudit:"2025-03-18", nextAudit:"2025-09-18", score:74, status:"Action Required" },
  { zone:"Reefer Dock 2", standard:"FSSAI Cold Storage", lastAudit:"2025-03-12", nextAudit:"2025-09-12", score:88, status:"Minor Issue" },
  { zone:"Quarantine Cold Cell", standard:"WHO GDP Annex 9", lastAudit:"2025-02-27", nextAudit:"2025-08-27", score:94, status:"Compliant" },
  { zone:"Sample Retention Room", standard:"FDA 21 CFR 211.68", lastAudit:"2025-02-19", nextAudit:"2025-08-19", score:91, status:"Compliant" },
  { zone:"Ambient Cool Zone", standard:"ISO 22000", lastAudit:"2025-02-08", nextAudit:"2025-08-08", score:87, status:"Minor Issue" },
]

function statusClass(status: string) {
  return status === "Compliant" ? "bg-success/10 text-success"
    : status === "Minor Issue" ? "bg-amber-50 text-amber-600"
    : "bg-danger/10 text-danger"
}

export default function ColdChainCompliancePage() {
  const [detail, setDetail] = useState<ComplianceRecord | null>(null)

  const avgScore = Math.round(records.reduce((s, r) => s + r.score, 0) / records.length)
  const compliant = records.filter((r) => r.status === "Compliant").length
  const actionNeeded = records.filter((r) => r.status === "Action Required").length

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Compliance Records</h1><p className="text-sm text-muted-foreground mt-1">Regulatory compliance scores and audit schedules per zone</p></div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Average Score", value: `${avgScore}%`, sub: "across all zones", icon: <BarChart2 className="w-5 h-5 text-brand" /> },
          { label: "Fully Compliant", value: `${compliant} / ${records.length}`, sub: "zones passing", icon: <CheckCircle2 className="w-5 h-5 text-success" /> },
          { label: "Action Required", value: actionNeeded.toString(), sub: "needs remediation", icon: <AlertTriangle className="w-5 h-5 text-amber-500" /> },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3"><div className="mb-2">{s.icon}</div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.sub}</p></div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border"><tr>{["Zone","Standard","Last Audit","Next Audit","Score","Status","Actions"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
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
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass(r.status)}`}>{r.status}</span></td>
                <td className="px-4 py-3">
                  <button onClick={() => setDetail(r)} title={`View ${r.zone} audit record`} className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No compliance records on file.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.zone ?? ""}
        description="Compliance audit record"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Close</button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Zone" value={detail.zone} />
            <DetailRow label="Standard" value={detail.standard} />
            <DetailRow label="Last Audit" value={detail.lastAudit} />
            <DetailRow label="Next Audit" value={detail.nextAudit} />
            <DetailRow label="Score" value={`${detail.score}%`} />
            <DetailRow label="Gap to Full Marks" value={`${100 - detail.score} points`} />
            <DetailRow label="Status" value={<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass(detail.status)}`}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>
    </div>
  )
}
