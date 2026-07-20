"use client"
import { cn } from "@/lib/utils"

const zones = [
  { id:"A", label:"Zone A", type:"Ambient", pallets:142, capacity:180, util:79, color:"bg-brand/20 border-brand/40" },
  { id:"B", label:"Zone B", type:"Ambient", pallets:88, capacity:120, util:73, color:"bg-success/20 border-success/40" },
  { id:"C", label:"Zone C", type:"Ambient", pallets:105, capacity:150, util:70, color:"bg-success/20 border-success/40" },
  { id:"CRA", label:"Cold Room A", type:"Cold", pallets:32, capacity:40, util:80, color:"bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700" },
  { id:"CRB", label:"Cold Room B", type:"Cold", pallets:28, capacity:40, util:70, color:"bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700" },
  { id:"FRZ", label:"Freezer", type:"Frozen", pallets:18, capacity:20, util:90, color:"bg-amber-100 border-amber-300 dark:bg-amber-900/30 dark:border-amber-700" },
  { id:"HZ", label:"Hazmat", type:"Restricted", pallets:5, capacity:12, util:42, color:"bg-danger/10 border-danger/30" },
  { id:"DOCK", label:"Dock Area", type:"Transit", pallets:12, capacity:20, util:60, color:"bg-muted border-border" },
]

export default function FloorPlanPage() {
  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Floor Plan</h1><p className="text-sm text-muted-foreground mt-1">Visual zone layout with live pallet occupancy</p></div>
      <div className="grid grid-cols-4 gap-4">
        {zones.map(z=>(
          <div key={z.id} className={cn("border-2 rounded-xl p-4 space-y-2 cursor-pointer hover:shadow-md transition-shadow", z.color)}>
            <div className="flex justify-between items-start">
              <p className="font-bold text-foreground text-sm">{z.label}</p>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/60 dark:bg-black/20 text-foreground">{z.type}</span>
            </div>
            <div className="w-full bg-white/40 dark:bg-black/20 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-foreground/40" style={{width:`${z.util}%`}} />
            </div>
            <p className="text-xs text-foreground/70">{z.pallets} / {z.capacity} pallets &bull; {z.util}%</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Click any zone to drill down into rack-level detail.</p>
    </div>
  )
}
