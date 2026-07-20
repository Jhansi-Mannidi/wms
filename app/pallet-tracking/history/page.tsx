"use client"
import { ArrowRight } from "lucide-react"
import { ExportButton } from "@/components/wms/export-button"

const movements = [
  { id:"MV-001",pallet:"PLT-0012",from:"Receiving Bay",to:"A-12-L2",by:"Suresh Yadav",at:"2025-07-19 09:14",reason:"Put-away"},
  { id:"MV-002",pallet:"PLT-0013",from:"A-05-L1",to:"Dispatch Bay",by:"Arjun Nair",at:"2025-07-19 10:32",reason:"Order Pick"},
  { id:"MV-003",pallet:"PLT-0014",from:"Receiving Bay",to:"A-08-L3",by:"Suresh Yadav",at:"2025-07-19 11:05",reason:"Put-away"},
  { id:"MV-004",pallet:"PLT-0015",from:"C-02-L1",to:"C-02-L2",by:"Ravi Kumar",at:"2025-07-18 15:20",reason:"Reorganisation"},
  { id:"MV-005",pallet:"PLT-0016",from:"Dispatch Bay",to:"MH-02-CX-7734",by:"Gate System",at:"2025-07-18 16:45",reason:"Outbound"},
]

export default function PalletHistoryPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Movement History</h1><p className="text-sm text-muted-foreground mt-1">Full audit trail of pallet movements and relocations</p></div>
        <ExportButton data={movements} filename="pallet-movement-history" />
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["Move ID","Pallet","From","","To","Moved By","Date/Time","Reason"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {movements.map(m=>(
              <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{m.id}</td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{m.pallet}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{m.from}</td>
                <td className="px-1 py-3 text-muted-foreground"><ArrowRight className="w-3.5 h-3.5" /></td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{m.to}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.by}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{m.at}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">{m.reason}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
