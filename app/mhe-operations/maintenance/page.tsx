"use client"
import { Wrench, Plus } from "lucide-react"

const tasks = [
  { id:"MT-001",equipment:"MHE-006",type:"Scheduled Service",desc:"Annual hydraulic fluid change",assignee:"External Tech",due:"2025-07-25",status:"In Progress"},
  { id:"MT-002",equipment:"MHE-003",type:"Battery Check",desc:"Battery capacity test and replacement if <80%",assignee:"Suresh Yadav",due:"2025-07-22",status:"Pending"},
  { id:"MT-003",equipment:"MHE-001",type:"Tyre Inspection",desc:"Check tyre wear on front drive wheels",assignee:"Arjun Nair",due:"2025-07-30",status:"Scheduled"},
  { id:"MT-004",equipment:"MHE-002",type:"Safety Inspection",desc:"Annual PESO safety certification",assignee:"External Tech",due:"2025-08-10",status:"Scheduled"},
  { id:"MT-005",equipment:"MHE-004",type:"Fork Inspection",desc:"Visual and load test on forks",assignee:"Kavitha Rao",due:"2025-07-28",status:"Pending"},
]

export default function MHEMaintenancePage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Maintenance Schedule</h1><p className="text-sm text-muted-foreground mt-1">Preventive and corrective maintenance tasks for all MHE</p></div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> Add Task</button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["Task ID","Equipment","Type","Description","Assignee","Due Date","Status"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {tasks.map(t=>(
              <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{t.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{t.equipment}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.type}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs max-w-48 truncate">{t.desc}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.assignee}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.due}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.status==="In Progress"?"bg-brand/10 text-brand":t.status==="Pending"?"bg-amber-50 text-amber-600":"bg-muted text-muted-foreground"}`}>{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
