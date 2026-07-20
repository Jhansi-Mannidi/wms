"use client"
import { Save } from "lucide-react"

const settings = [
  { group:"Warehouse Details", fields:[{l:"Warehouse Name",v:"Main Warehouse — CFS Zone A"},{l:"Location",v:"Hyderabad, IN"},{l:"Total Area (sq ft)",v:"42,000"},{l:"Operating Hours",v:"06:00 – 22:00"}]},
  { group:"GRN Settings", fields:[{l:"Default Putaway Strategy",v:"FEFO"},{l:"Auto-create bin location",v:"Enabled"},{l:"GRN Approval Required",v:"Yes"},{l:"Photo Capture on GRN",v:"Mandatory"}]},
  { group:"System Preferences", fields:[{l:"Default Currency",v:"INR"},{l:"Date Format",v:"DD-MM-YYYY"},{l:"Time Zone",v:"Asia/Kolkata (IST)"},{l:"Low Stock Alert Threshold (%)",v:"15"}]},
]

export default function WarehouseConfigPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Warehouse Configuration</h1><p className="text-sm text-muted-foreground mt-1">Core settings, preferences and operational parameters</p></div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Save className="w-4 h-4" /> Save</button>
      </div>
      <div className="grid grid-cols-3 gap-5">
        {settings.map(g=>(
          <div key={g.group} className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border"><p className="font-semibold text-sm text-foreground">{g.group}</p></div>
            <div className="p-4 space-y-3">
              {g.fields.map(f=>(
                <div key={f.l}><label className="block text-xs font-medium text-foreground mb-1">{f.l}</label><input defaultValue={f.v} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" /></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
