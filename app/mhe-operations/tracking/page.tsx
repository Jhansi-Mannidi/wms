"use client"
import { cn } from "@/lib/utils"

const equipment = [
  { id:"MHE-001",type:"Forklift",model:"Toyota 8FBN25",operator:"Suresh Yadav",zone:"Zone A",status:"Active",battery:85,lastMove:"5m ago"},
  { id:"MHE-002",type:"Reach Truck",model:"Crown RR5225",operator:"Arjun Nair",zone:"Zone B",status:"Idle",battery:62,lastMove:"22m ago"},
  { id:"MHE-003",type:"Pallet Jack",model:"Crown PE 4500",operator:"Unassigned",zone:"Dock Area",status:"Charging",battery:35,lastMove:"1h ago"},
  { id:"MHE-004",type:"Forklift",model:"Hyster H50FT",operator:"Kavitha Rao",zone:"Zone C",status:"Active",battery:91,lastMove:"2m ago"},
  { id:"MHE-005",type:"Order Picker",model:"Crown SP 3040",operator:"Ravi Kumar",zone:"Zone A",status:"Active",battery:78,lastMove:"8m ago"},
  { id:"MHE-006",type:"Reach Truck",model:"Toyota 8FBMT",operator:"Unassigned",zone:"Workshop",status:"Maintenance",battery:0,lastMove:"2d ago"},
]

export default function MHETrackingPage() {
  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Equipment Tracking</h1><p className="text-sm text-muted-foreground mt-1">Live location, operator assignment and battery status</p></div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["Equipment ID","Type","Model","Operator","Zone","Battery","Status","Last Move"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {equipment.map(e=>(
              <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{e.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{e.type}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{e.model}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.operator}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.zone}</td>
                <td className="px-4 py-3">
                  {e.battery > 0 ? <div className="flex items-center gap-2"><div className="w-16 bg-muted rounded-full h-1.5"><div className={`h-1.5 rounded-full ${e.battery>50?"bg-success":e.battery>20?"bg-amber-400":"bg-danger"}`} style={{width:`${e.battery}%`}} /></div><span className="text-xs">{e.battery}%</span></div> : <span className="text-xs text-muted-foreground">—</span>}
                </td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium",e.status==="Active"?"bg-success/10 text-success":e.status==="Idle"?"bg-muted text-muted-foreground":e.status==="Charging"?"bg-brand/10 text-brand":"bg-amber-50 text-amber-600")}>{e.status}</span></td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{e.lastMove}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
