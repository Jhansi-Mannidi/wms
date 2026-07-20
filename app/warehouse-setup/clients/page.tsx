"use client"
import { Users, Plus } from "lucide-react"

const clients = [
  { id:"CLT-001",name:"Acme Foods Pvt Ltd",type:"FMCG",contact:"Sunita Rao",email:"sunita@acmefoods.in",zones:"Zone A",skus:412,status:"Active"},
  { id:"CLT-002",name:"Global Oils Ltd",type:"FMCG",contact:"Ramesh Pillai",email:"ramesh@globaloils.com",zones:"Zone B",skus:88,status:"Active"},
  { id:"CLT-003",name:"Agro Corp India",type:"Agriculture",contact:"Meena Patel",email:"meena@agrocorp.in",zones:"Zone C",skus:145,status:"Active"},
  { id:"CLT-004",name:"Sweet Mills",type:"Food",contact:"Vijay Kumar",email:"vijay@sweetmills.in",zones:"Zone A (partial)",skus:64,status:"Provisional"},
]

export default function WarehouseClientsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Clients</h1><p className="text-sm text-muted-foreground mt-1">Client onboarding and account management</p></div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> Add Client</button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["ID","Client","Type","Contact","Email","Zones","SKUs","Status"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {clients.map(c=>(
              <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{c.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.type}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.contact}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{c.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.zones}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.skus}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.status==="Active"?"bg-success/10 text-success":"bg-amber-50 text-amber-600"}`}>{c.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
