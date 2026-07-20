"use client"
import { Settings, Plus, CheckCircle2 } from "lucide-react"

const rules = [
  { id:"RULE-001",name:"FEFO Rotation",desc:"First Expiry First Out — route picks to oldest batch first",scope:"All zones",active:true},
  { id:"RULE-002",name:"Heavy Base Stacking",desc:"Place heaviest pallets on L1 racks, light on L3+",scope:"All zones",active:true},
  { id:"RULE-003",name:"Client Segregation",desc:"Do not mix pallets from different 3PL clients in same rack",scope:"3PL zones",active:true},
  { id:"RULE-004",name:"Cold Chain Priority Lane",desc:"Route cold chain pallets via dedicated cold aisle only",scope:"Cold Room A,B",active:true},
  { id:"RULE-005",name:"Hazmat Isolation",desc:"Hazardous materials must be stored in HZ-designated zones",scope:"Zone D",active:false},
]

export default function PalletRulesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Pallet Rules</h1><p className="text-sm text-muted-foreground mt-1">Storage logic, rotation rules and zone restrictions</p></div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> Add Rule</button>
      </div>
      <div className="space-y-3">
        {rules.map(r=>(
          <div key={r.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-4">
            <Settings className="w-5 h-5 text-brand shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2"><p className="font-medium text-foreground">{r.name}</p>{r.active&&<CheckCircle2 className="w-4 h-4 text-success" />}</div>
              <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
              <p className="text-xs text-muted-foreground mt-1">Scope: <span className="text-foreground">{r.scope}</span></p>
            </div>
            <button className={`relative w-10 h-5 rounded-full transition-colors ${r.active?"bg-brand":"bg-muted"}`}><span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${r.active?"translate-x-5":"translate-x-0.5"}`} /></button>
          </div>
        ))}
      </div>
    </div>
  )
}
