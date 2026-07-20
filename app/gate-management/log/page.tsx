"use client"
import { ClipboardList } from "lucide-react"
import { ExportButton } from "@/components/wms/export-button"

const logs = [
  { id:"GL-001",vehicle:"TN-09-AX-4421",type:"Entry",time:"08:42",dock:"Dock 3",driver:"Suresh Kumar",purpose:"GRN Delivery",status:"Checked In"},
  { id:"GL-002",vehicle:"AP-28-BX-1190",type:"Entry",time:"09:15",dock:"Dock 1",driver:"Rajan Pillai",purpose:"Courier Pickup",status:"In Premises"},
  { id:"GL-003",vehicle:"TN-09-AX-4411",type:"Exit",time:"07:45",dock:"Dock 2",driver:"Ramesh Pillai",purpose:"Delivery Complete",status:"Cleared"},
  { id:"GL-004",vehicle:"MH-02-CX-7734",type:"Entry",time:"10:30",dock:"Dock 5",driver:"Anil Verma",purpose:"Export Loading",status:"Loading"},
  { id:"GL-005",vehicle:"AP-10-BX-8823",type:"Exit",time:"09:30",dock:"Dock 4",driver:"Venkat Rao",purpose:"Pickup Done",status:"Cleared"},
  { id:"GL-006",vehicle:"MH-14-CX-3310",type:"Exit",time:"11:20",dock:"Dock 5",driver:"Santosh Kumar",purpose:"Export Loaded",status:"Pending Docs"},
]

export default function GateLogPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Gate Log</h1><p className="text-sm text-muted-foreground mt-1">Complete record of all gate entry and exit movements</p></div>
        <ExportButton data={logs} filename="gate-log" />
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["Log ID","Vehicle","Type","Time","Dock","Driver","Purpose","Status"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {logs.map(l=>(
              <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{l.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{l.vehicle}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${l.type==="Entry"?"bg-brand/10 text-brand":"bg-muted text-muted-foreground"}`}>{l.type}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{l.time}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.dock}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.driver}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.purpose}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${l.status==="Cleared"?"bg-success/10 text-success":l.status==="Pending Docs"?"bg-amber-50 text-amber-600":"bg-muted text-muted-foreground"}`}>{l.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
