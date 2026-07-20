"use client"
import { Save } from "lucide-react"

const settings = [
  { group:"Warehouse Dimensions", fields:[{label:"Total Floor Area (sq ft)",val:"42,000"},{label:"Usable Storage Area (sq ft)",val:"34,500"},{label:"Dock Area (sq ft)",val:"3,200"},{label:"Office / Common (sq ft)",val:"4,300"}]},
  { group:"Zone Defaults", fields:[{label:"Standard Zone Height (m)",val:"8.5"},{label:"Max Pallet Stack (levels)",val:"3"},{label:"Aisle Width (m)",val:"3.5"},{label:"Racking System",val:"Selective Pallet Racking"}]},
  { group:"Billing Defaults", fields:[{label:"Base Storage Rate (₹/pallet/day)",val:"150"},{label:"Overflow Rate Premium (%)",val:"25"},{label:"Cold Storage Premium (₹/pallet/day)",val:"80"},{label:"Min Billing (pallets/month)",val:"20"}]},
]

export default function SpaceConfigPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Space Configuration</h1><p className="text-sm text-muted-foreground mt-1">Warehouse dimensions, zone defaults and billing rules</p></div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Save className="w-4 h-4" /> Save</button>
      </div>
      <div className="grid grid-cols-3 gap-5">
        {settings.map(g=>(
          <div key={g.group} className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border"><p className="font-semibold text-sm text-foreground">{g.group}</p></div>
            <div className="p-4 space-y-3">
              {g.fields.map(f=>(
                <div key={f.label}>
                  <label className="block text-xs font-medium text-foreground mb-1">{f.label}</label>
                  <input defaultValue={f.val} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
