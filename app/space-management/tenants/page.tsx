"use client"
import { Users, Plus } from "lucide-react"

const tenants = [
  { id:"TEN-001",name:"Acme Foods",zones:"Zone A (rows 1-6)",pallets:82,sqft:4200,rate:"₹150/pallet/day",lease:"2025-01-01",status:"Active"},
  { id:"TEN-002",name:"Global Oils",zones:"Zone B (all)",pallets:88,sqft:3800,rate:"₹140/pallet/day",lease:"2024-06-01",status:"Active"},
  { id:"TEN-003",name:"Agro Corp",zones:"Zone C (rows 1-4)",pallets:60,sqft:2800,rate:"₹145/pallet/day",lease:"2025-03-15",status:"Active"},
  { id:"TEN-004",name:"Sweet Mills",zones:"Zone A (rows 7-10)",pallets:40,sqft:2000,rate:"₹155/pallet/day",lease:"2025-07-01",status:"Provisional"},
]

export default function SpaceTenantsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Tenants</h1><p className="text-sm text-muted-foreground mt-1">Space allocation and tenant details for all clients</p></div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> Add Tenant</button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["ID","Tenant","Zones Allocated","Pallets","Sq Ft","Rate","Lease Start","Status"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {tenants.map(t=>(
              <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{t.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{t.name}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{t.zones}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.pallets}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.sqft.toLocaleString()}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.rate}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.lease}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.status==="Active"?"bg-success/10 text-success":"bg-amber-50 text-amber-600"}`}>{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
