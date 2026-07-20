"use client"
import { Package, Plus } from "lucide-react"
import { ExportButton } from "@/components/wms/export-button"

const receipts = [
  { id:"CR-001",shipper:"Global Exports Ltd",pieces:48,weight:"1,240 kg",cbm:"8.4",eta:"2025-07-20",status:"Received",lot:"LOT-2025-0441"},
  { id:"CR-002",shipper:"Acme Trade Co",pieces:120,weight:"3,100 kg",cbm:"22.1",eta:"2025-07-20",status:"Partially Received",lot:"LOT-2025-0442"},
  { id:"CR-003",shipper:"Pacific Goods",pieces:30,weight:"820 kg",cbm:"5.2",eta:"2025-07-21",status:"Expected",lot:"LOT-2025-0443"},
  { id:"CR-004",shipper:"Delta Shippers",pieces:200,weight:"4,800 kg",cbm:"34.0",eta:"2025-07-21",status:"Expected",lot:"LOT-2025-0444"},
  { id:"CR-005",shipper:"Prime Logistics",pieces:60,weight:"1,580 kg",cbm:"11.2",eta:"2025-07-19",status:"Received",lot:"LOT-2025-0440"},
]

export default function LCLCargoReceiptsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Cargo Receipts</h1><p className="text-sm text-muted-foreground mt-1">Inbound cargo receipts and lot assignments</p></div>
        <div className="flex gap-2">
          <ExportButton data={receipts} filename="lcl-cargo-receipts" />
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> New Receipt</button>
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["Receipt ID","Shipper","Pieces","Weight","CBM","ETA","Lot","Status"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {receipts.map(r=>(
              <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{r.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{r.shipper}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.pieces}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.weight}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.cbm}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.eta}</td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{r.lot}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.status==="Received"?"bg-success/10 text-success":r.status==="Partially Received"?"bg-amber-50 text-amber-600":"bg-muted text-muted-foreground"}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
