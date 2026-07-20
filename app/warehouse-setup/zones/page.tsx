"use client"
import { Plus } from "lucide-react"

const zones = [
  { id:"Z-001",name:"Zone A",type:"Ambient",sqft:12000,racks:48,levels:3,temp:"18-25°C",active:true},
  { id:"Z-002",name:"Zone B",type:"Ambient",sqft:9800,racks:36,levels:3,temp:"18-25°C",active:true},
  { id:"Z-003",name:"Zone C",type:"Ambient",sqft:8200,racks:30,levels:3,temp:"18-25°C",active:true},
  { id:"Z-004",name:"Cold Room A",type:"Cold",sqft:2400,racks:12,levels:2,temp:"2-4°C",active:true},
  { id:"Z-005",name:"Cold Room B",type:"Cold",sqft:2400,racks:12,levels:2,temp:"2-8°C",active:true},
  { id:"Z-006",name:"Freezer",type:"Frozen",sqft:1200,racks:6,levels:2,temp:"-20°C",active:true},
  { id:"Z-007",name:"Hazmat Zone",type:"Restricted",sqft:800,racks:6,levels:1,temp:"Ambient",active:false},
]

export default function WarehouseZonesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Zones</h1><p className="text-sm text-muted-foreground mt-1">Define and configure warehouse storage zones</p></div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> Add Zone</button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["Zone ID","Name","Type","Sq Ft","Racks","Levels","Temp Range","Status"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {zones.map(z=>(
              <tr key={z.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{z.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{z.name}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">{z.type}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{z.sqft.toLocaleString()}</td>
                <td className="px-4 py-3 text-muted-foreground">{z.racks}</td>
                <td className="px-4 py-3 text-muted-foreground">{z.levels}</td>
                <td className="px-4 py-3 text-muted-foreground">{z.temp}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${z.active?"bg-success/10 text-success":"bg-muted text-muted-foreground"}`}>{z.active?"Active":"Inactive"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
