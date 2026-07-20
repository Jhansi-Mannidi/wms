"use client"
import { Package } from "lucide-react"
import { ExportButton } from "@/components/wms/export-button"

const pallets = [
  { id:"PLT-0012",type:"Euro",sku:"SKU-001234",qty:48,zone:"A",rack:"A-12",level:"L2",owner:"Acme Foods",status:"In Storage"},
  { id:"PLT-0013",type:"Standard",sku:"SKU-001236",qty:24,zone:"B",rack:"B-05",level:"L1",owner:"Global Oils",status:"In Storage"},
  { id:"PLT-0014",type:"Euro",sku:"SKU-001238",qty:60,zone:"A",rack:"A-08",level:"L3",owner:"Sweet Mills",status:"Reserved"},
  { id:"PLT-0015",type:"Half",sku:"SKU-001240",qty:30,zone:"C",rack:"C-02",level:"L1",owner:"Fresh Farms",status:"In Storage"},
  { id:"PLT-0016",type:"Standard",sku:"SKU-001237",qty:80,zone:"C",rack:"C-07",level:"L2",owner:"Agro Corp",status:"In Transit"},
]

export default function PalletLocationsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Pallet Locations</h1><p className="text-sm text-muted-foreground mt-1">Current storage locations for all tracked pallets</p></div>
        <ExportButton data={pallets} filename="pallet-locations" />
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["Pallet ID","Type","SKU","Qty","Zone","Rack","Level","Owner","Status"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {pallets.map(p=>(
              <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{p.id}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.type}</td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{p.sku}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.qty}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.zone}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.rack}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.level}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.owner}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status==="In Storage"?"bg-success/10 text-success":p.status==="Reserved"?"bg-brand/10 text-brand":"bg-amber-50 text-amber-600"}`}>{p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
