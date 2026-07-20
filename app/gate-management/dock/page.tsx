"use client"
import { cn } from "@/lib/utils"

const docks = [
  { id: "Dock 1", type: "Inbound", status: "occupied", vehicle: "AP-28-BX-1190", since: "09:15", activity: "Unloading" },
  { id: "Dock 2", type: "Inbound", status: "available", vehicle: null, since: null, activity: null },
  { id: "Dock 3", type: "Inbound", status: "occupied", vehicle: "TN-09-AX-4421", since: "08:42", activity: "GRN in progress" },
  { id: "Dock 4", type: "Outbound", status: "available", vehicle: null, since: null, activity: null },
  { id: "Dock 5", type: "Outbound", status: "occupied", vehicle: "MH-02-CX-7734", since: "10:30", activity: "Loading" },
  { id: "Dock 6", type: "Outbound", status: "maintenance", vehicle: null, since: null, activity: "Scheduled maintenance" },
]

export default function DockManagementPage() {
  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Dock Management</h1><p className="text-sm text-muted-foreground mt-1">Live dock bay status and assignment board</p></div>
      <div className="grid grid-cols-3 gap-4">
        {docks.map(d=>(
          <div key={d.id} className={cn("bg-card border rounded-xl p-5 space-y-3", d.status==="occupied"?"border-brand/30":d.status==="maintenance"?"border-amber-300":"border-border")}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">{d.id}</span>
              <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", d.status==="occupied"?"bg-brand/10 text-brand":d.status==="available"?"bg-success/10 text-success":"bg-amber-50 text-amber-600")}>{d.status.charAt(0).toUpperCase()+d.status.slice(1)}</span>
            </div>
            <p className="text-xs text-muted-foreground">{d.type}</p>
            {d.vehicle ? (
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{d.vehicle}</p>
                <p className="text-xs text-muted-foreground">Since {d.since} &bull; {d.activity}</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">{d.activity ?? "Ready for assignment"}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
