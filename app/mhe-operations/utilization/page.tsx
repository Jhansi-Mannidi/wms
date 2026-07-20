"use client"
import { BarChart2, Activity, Clock, TrendingUp } from "lucide-react"

const equipmentUtil = [
  { id:"MHE-001",type:"Forklift",activeHrs:6.2,idleHrs:1.8,util:78,trips:42},
  { id:"MHE-002",type:"Reach Truck",activeHrs:4.1,idleHrs:3.9,util:51,trips:28},
  { id:"MHE-003",type:"Pallet Jack",activeHrs:2.0,idleHrs:1.0,util:67,trips:15},
  { id:"MHE-004",type:"Forklift",activeHrs:7.1,idleHrs:0.9,util:89,trips:55},
  { id:"MHE-005",type:"Order Picker",activeHrs:5.8,idleHrs:2.2,util:73,trips:38},
]

export default function MHEUtilizationPage() {
  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Utilisation Analysis</h1><p className="text-sm text-muted-foreground mt-1">Active vs idle hours, trip counts and efficiency per unit</p></div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:"Fleet Avg Utilisation",value:"72%",icon:<BarChart2 className="w-5 h-5 text-brand"/>,sub:"across 5 active units"},
          { label:"Total Trips Today",value:"178",icon:<Activity className="w-5 h-5 text-brand"/>,sub:"all equipment"},
          { label:"Avg Active Hours",value:"5.0 hrs",icon:<Clock className="w-5 h-5 text-brand"/>,sub:"per unit today"},
          { label:"Most Used",value:"MHE-004",icon:<TrendingUp className="w-5 h-5 text-success"/>,sub:"89% utilisation"},
        ].map(s=>(
          <div key={s.label} className="bg-card border border-border rounded-xl p-4"><div className="mb-2">{s.icon}</div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.sub}</p></div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["Equipment","Type","Active Hrs","Idle Hrs","Trips","Utilisation"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {equipmentUtil.map(e=>(
              <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{e.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{e.type}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.activeHrs}h</td>
                <td className="px-4 py-3 text-muted-foreground">{e.idleHrs}h</td>
                <td className="px-4 py-3 text-muted-foreground">{e.trips}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-muted rounded-full h-1.5"><div className={`h-1.5 rounded-full ${e.util>=80?"bg-brand":e.util>=60?"bg-amber-400":"bg-danger"}`} style={{width:`${e.util}%`}} /></div>
                    <span className="text-xs text-muted-foreground">{e.util}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
