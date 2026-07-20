"use client"
import { ExportButton } from "@/components/wms/export-button"

const history = [
  { id:"SCH-001",type:"Shift Assignment",detail:"Morning Shift — 22 workers assigned",by:"Auto",date:"2025-07-19",status:"Completed"},
  { id:"SCH-002",type:"Task Creation",detail:"Stock Count — Zone A (18 tasks)",by:"Vijay Kumar",date:"2025-07-19",status:"Completed"},
  { id:"SCH-003",type:"Shift Change",detail:"Afternoon Shift — Suresh Yadav moved to Zone B",by:"Kavitha Rao",date:"2025-07-18",status:"Completed"},
  { id:"SCH-004",type:"Automation Fired",detail:"SLA breach alert sent for ORD-4421",by:"Auto",date:"2025-07-18",status:"Completed"},
  { id:"SCH-005",type:"Schedule Published",detail:"Week 29 schedule published to all workers",by:"Vijay Kumar",date:"2025-07-14",status:"Completed"},
]

export default function SchedulerHistoryPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Schedule History</h1><p className="text-sm text-muted-foreground mt-1">Audit log of all scheduling actions and automations</p></div>
        <ExportButton data={history} filename="scheduler-history" />
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["ID","Type","Detail","By","Date","Status"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {history.map(h=>(
              <tr key={h.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{h.id}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">{h.type}</span></td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{h.detail}</td>
                <td className="px-4 py-3 text-muted-foreground">{h.by}</td>
                <td className="px-4 py-3 text-muted-foreground">{h.date}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">{h.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
