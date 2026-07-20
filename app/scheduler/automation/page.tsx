"use client"
import { Zap, Plus, CheckCircle2 } from "lucide-react"

const rules = [
  { id:"AUTO-001", name:"Auto-assign Morning Shift", trigger:"Daily at 05:45", action:"Assign available workers to morning shift", active:true },
  { id:"AUTO-002", name:"SLA Breach Alert", trigger:"Order SLA < 2 hours remaining", action:"Send SMS to KAM and floor supervisor", active:true },
  { id:"AUTO-003", name:"Low Stock Reorder", trigger:"SKU available qty < reorder point", action:"Create purchase request and notify buyer", active:true },
  { id:"AUTO-004", name:"GRN Completion Notify", trigger:"GRN status = Complete", action:"Send email to client with receipt details", active:false },
  { id:"AUTO-005", name:"Shift Handover Report", trigger:"Shift end (14:00, 22:00, 06:00)", action:"Auto-generate shift summary and email to supervisor", active:true },
]

export default function SchedulerAutomationPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Automation Rules</h1><p className="text-sm text-muted-foreground mt-1">Trigger-based automation for scheduling and notifications</p></div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> New Rule</button>
      </div>
      <div className="space-y-3">
        {rules.map(r=>(
          <div key={r.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-4">
            <Zap className={`w-5 h-5 shrink-0 mt-0.5 ${r.active?"text-brand":"text-muted-foreground"}`} />
            <div className="flex-1">
              <div className="flex items-center gap-2"><p className="font-medium text-foreground">{r.name}</p>{r.active&&<CheckCircle2 className="w-3.5 h-3.5 text-success" />}</div>
              <p className="text-xs text-muted-foreground mt-1"><span className="font-medium text-foreground">Trigger:</span> {r.trigger}</p>
              <p className="text-xs text-muted-foreground mt-0.5"><span className="font-medium text-foreground">Action:</span> {r.action}</p>
            </div>
            <button className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${r.active?"bg-brand":"bg-muted"}`}><span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${r.active?"translate-x-5":"translate-x-0.5"}`} /></button>
          </div>
        ))}
      </div>
    </div>
  )
}
