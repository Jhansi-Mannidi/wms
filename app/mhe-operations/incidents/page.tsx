"use client"
import { AlertTriangle, Plus } from "lucide-react"

const incidents = [
  { id:"INC-001",equipment:"MHE-003",type:"Near Miss",desc:"Pallet jack nearly collided with pedestrian in aisle B",reportedBy:"Arjun Nair",date:"2025-07-18",severity:"Medium",status:"Under Review"},
  { id:"INC-002",equipment:"MHE-006",type:"Equipment Failure",desc:"Hydraulic leak detected during operation",reportedBy:"Suresh Yadav",date:"2025-07-15",severity:"High",status:"Resolved"},
  { id:"INC-003",equipment:"MHE-001",type:"Minor Damage",desc:"Scraped racking in Zone A, column A-08",reportedBy:"Kavitha Rao",date:"2025-07-10",severity:"Low",status:"Closed"},
  { id:"INC-004",equipment:"MHE-004",type:"Near Miss",desc:"Unsecured pallet fell from raised fork",reportedBy:"Ravi Kumar",date:"2025-07-08",severity:"High",status:"Resolved"},
]

export default function MHEIncidentsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Incident Log</h1><p className="text-sm text-muted-foreground mt-1">Safety incidents, near misses and equipment failures</p></div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> Report Incident</button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["Incident ID","Equipment","Type","Description","Reported By","Date","Severity","Status"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {incidents.map(i=>(
              <tr key={i.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{i.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{i.equipment}</td>
                <td className="px-4 py-3 text-muted-foreground">{i.type}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs max-w-48 truncate">{i.desc}</td>
                <td className="px-4 py-3 text-muted-foreground">{i.reportedBy}</td>
                <td className="px-4 py-3 text-muted-foreground">{i.date}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${i.severity==="High"?"bg-danger/10 text-danger":i.severity==="Medium"?"bg-amber-50 text-amber-600":"bg-muted text-muted-foreground"}`}>{i.severity}</span></td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${i.status==="Resolved"||i.status==="Closed"?"bg-success/10 text-success":"bg-amber-50 text-amber-600"}`}>{i.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
