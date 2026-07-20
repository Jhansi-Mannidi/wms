"use client"
import { Package, BarChart2, TrendingUp, Clock } from "lucide-react"

const zoneData = [
  { zone:"Zone A", pallets:142, capacity:180, util:79 },
  { zone:"Zone B", pallets:88, capacity:120, util:73 },
  { zone:"Zone C", pallets:105, capacity:150, util:70 },
  { zone:"Cold Room A", pallets:32, capacity:40, util:80 },
  { zone:"Freezer", pallets:18, capacity:20, util:90 },
]

export default function PalletAnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Pallet Analytics</h1><p className="text-sm text-muted-foreground mt-1">Zone utilisation, movement frequency and dwell time analysis</p></div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:"Total Pallets",value:"385",icon:<Package className="w-5 h-5 text-brand"/>,sub:"in warehouse" },
          { label:"Zone Utilisation",value:"78%",icon:<BarChart2 className="w-5 h-5 text-brand"/>,sub:"avg across all zones" },
          { label:"Moves Today",value:"47",icon:<TrendingUp className="w-5 h-5 text-success"/>,sub:"put-away + picks" },
          { label:"Avg Dwell Time",value:"6.2 days",icon:<Clock className="w-5 h-5 text-brand"/>,sub:"per pallet" },
        ].map(s=>(
          <div key={s.label} className="bg-card border border-border rounded-xl p-4"><div className="mb-2">{s.icon}</div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.sub}</p></div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border"><p className="font-semibold text-sm text-foreground">Zone Utilisation</p></div>
        <div className="p-4 space-y-4">
          {zoneData.map(z=>(
            <div key={z.zone} className="space-y-1">
              <div className="flex justify-between text-sm"><span className="font-medium text-foreground">{z.zone}</span><span className="text-muted-foreground">{z.pallets} / {z.capacity} pallets &bull; {z.util}%</span></div>
              <div className="w-full bg-muted rounded-full h-2"><div className={`h-2 rounded-full ${z.util>=85?"bg-amber-400":z.util>=70?"bg-brand":"bg-success"}`} style={{width:`${z.util}%`}} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
