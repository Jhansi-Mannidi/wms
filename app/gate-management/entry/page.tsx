"use client"
import { useState } from "react"
import { LogIn, Truck, Plus } from "lucide-react"

const entries = [
  { id:"ENT-001", vehicle:"TN-09-AX-4421", driver:"Suresh Kumar", type:"Inbound Truck", purpose:"GRN Delivery", dock:"Dock 3", time:"08:42", status:"Checked In" },
  { id:"ENT-002", vehicle:"AP-28-BX-1190", driver:"Rajan Pillai", type:"Delivery Van", purpose:"Courier Pickup", dock:"Dock 1", time:"09:15", status:"In Premises" },
  { id:"ENT-003", vehicle:"MH-02-CX-7734", driver:"Anil Verma", type:"Container", purpose:"Export Loading", dock:"Dock 5", time:"10:30", status:"Loading" },
  { id:"ENT-004", vehicle:"KA-51-DX-2200", driver:"Pradeep Nair", type:"Inbound Truck", purpose:"GRN Delivery", dock:"Dock 2", time:"11:00", status:"Pending" },
]

export default function GateEntryPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Gate Entry</h1><p className="text-sm text-muted-foreground mt-1">Record and manage inbound vehicle entries</p></div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> New Entry</button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["Entry ID","Vehicle","Driver","Type","Purpose","Dock","Time","Status"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {entries.map(e=>(
              <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{e.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{e.vehicle}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.driver}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.type}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.purpose}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.dock}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.time}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${e.status==="Checked In"?"bg-success/10 text-success":e.status==="Loading"?"bg-brand/10 text-brand":e.status==="Pending"?"bg-amber-50 text-amber-600":"bg-muted text-muted-foreground"}`}>{e.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
