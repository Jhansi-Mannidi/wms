"use client"
import { LogOut } from "lucide-react"

const exits = [
  { id:"EXT-001", vehicle:"TN-09-AX-4411", driver:"Ramesh Pillai", purpose:"Delivery Complete", exitTime:"07:45", dwell:"1h 12m", clearance:"Cleared" },
  { id:"EXT-002", vehicle:"AP-10-BX-8823", driver:"Venkat Rao", purpose:"Pickup Done", exitTime:"09:30", dwell:"45m", clearance:"Cleared" },
  { id:"EXT-003", vehicle:"MH-14-CX-3310", driver:"Santosh Kumar", purpose:"Export Loaded", exitTime:"11:20", dwell:"2h 05m", clearance:"Pending Docs" },
  { id:"EXT-004", vehicle:"KA-51-DX-1198", driver:"Girish Nair", purpose:"GRN Complete", exitTime:"12:00", dwell:"55m", clearance:"Cleared" },
]

export default function GateExitPage() {
  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Gate Exit</h1><p className="text-sm text-muted-foreground mt-1">Outbound vehicle departures and clearance records</p></div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["Exit ID","Vehicle","Driver","Purpose","Exit Time","Dwell Time","Clearance"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {exits.map(e=>(
              <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{e.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{e.vehicle}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.driver}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.purpose}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.exitTime}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.dwell}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${e.clearance==="Cleared"?"bg-success/10 text-success":"bg-amber-50 text-amber-600"}`}>{e.clearance}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
