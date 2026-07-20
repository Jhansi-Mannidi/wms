"use client"
import { Target, AlertTriangle, CheckCircle2, Clock } from "lucide-react"

const slas = [
  { id:"SLA-001",type:"Order Processing",target:"2 hrs",actual:"1.8 hrs",compliance:96,status:"Met"},
  { id:"SLA-002",type:"GRN to Putaway",target:"4 hrs",actual:"4.5 hrs",compliance:82,status:"Breached"},
  { id:"SLA-003",type:"Pick & Pack",target:"3 hrs",actual:"2.6 hrs",compliance:98,status:"Met"},
  { id:"SLA-004",type:"Same-Day Dispatch",target:"17:00 cutoff",actual:"16:40 avg",compliance:95,status:"Met"},
  { id:"SLA-005",type:"Cycle Count",target:"Monthly",actual:"Monthly",compliance:100,status:"Met"},
  { id:"SLA-006",type:"Returns Processing",target:"24 hrs",actual:"28 hrs",compliance:71,status:"Breached"},
]

export default function SchedulerSLAPage() {
  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">SLA Tracking</h1><p className="text-sm text-muted-foreground mt-1">Service level agreement performance against defined targets</p></div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:"SLAs Met",value:"4 / 6",icon:<CheckCircle2 className="w-5 h-5 text-success"/> },
          { label:"Avg Compliance",value:"90.3%",icon:<Target className="w-5 h-5 text-brand"/> },
          { label:"Breaches This Month",value:"2",icon:<AlertTriangle className="w-5 h-5 text-danger"/> },
        ].map(s=>(
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4"><div>{s.icon}</div><div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-2xl font-bold text-foreground">{s.value}</p></div></div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["SLA","Type","Target","Actual","Compliance","Status"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {slas.map(s=>(
              <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{s.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{s.type}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.target}</td>
                <td className="px-4 py-3 font-medium text-foreground">{s.actual}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2"><div className="w-16 bg-muted rounded-full h-1.5"><div className={`h-1.5 rounded-full ${s.compliance>=95?"bg-success":s.compliance>=80?"bg-amber-400":"bg-danger"}`} style={{width:`${s.compliance}%`}} /></div><span className="text-xs">{s.compliance}%</span></div>
                </td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.status==="Met"?"bg-success/10 text-success":"bg-danger/10 text-danger"}`}>{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
