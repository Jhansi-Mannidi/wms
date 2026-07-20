"use client"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Drawer } from "@/components/ui/modal"
import { DetailRow } from "@/components/ui/form"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type FloorZone = {
  id: string; label: string; type: string; pallets: number
  capacity: number; util: number; color: string
}

const zones: FloorZone[] = [
  { id:"A", label:"Zone A", type:"Ambient", pallets:142, capacity:180, util:79, color:"bg-brand/20 border-brand/40" },
  { id:"B", label:"Zone B", type:"Ambient", pallets:88, capacity:120, util:73, color:"bg-success/20 border-success/40" },
  { id:"C", label:"Zone C", type:"Ambient", pallets:105, capacity:150, util:70, color:"bg-success/20 border-success/40" },
  { id:"CRA", label:"Cold Room A", type:"Cold", pallets:32, capacity:40, util:80, color:"bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700" },
  { id:"CRB", label:"Cold Room B", type:"Cold", pallets:28, capacity:40, util:70, color:"bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700" },
  { id:"FRZ", label:"Freezer", type:"Frozen", pallets:18, capacity:20, util:90, color:"bg-amber-100 border-amber-300 dark:bg-amber-900/30 dark:border-amber-700" },
  { id:"HZ", label:"Hazmat", type:"Restricted", pallets:5, capacity:12, util:42, color:"bg-danger/10 border-danger/30" },
  { id:"DOCK", label:"Dock Area", type:"Transit", pallets:12, capacity:20, util:60, color:"bg-muted border-border" },
]

/**
 * Deterministic rack-level split of a zone's occupancy — four racks that always
 * sum back to the zone totals, so the drill-down agrees with the card.
 */
function rackBreakdown(z: FloorZone) {
  const rackCount = 4
  const baseCap = Math.floor(z.capacity / rackCount)
  const baseUsed = Math.floor(z.pallets / rackCount)
  return Array.from({ length: rackCount }, (_, i) => {
    const capacity = i === rackCount - 1 ? z.capacity - baseCap * (rackCount - 1) : baseCap
    const used = i === rackCount - 1 ? z.pallets - baseUsed * (rackCount - 1) : baseUsed
    return {
      rack: `${z.id}-R${i + 1}`,
      used,
      capacity,
      util: capacity === 0 ? 0 : Math.round((used / capacity) * 100),
    }
  })
}

export default function FloorPlanPage() {
  const [detail, setDetail] = useState<FloorZone | null>(null)

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Floor Plan</h1><p className="text-sm text-muted-foreground mt-1">Visual zone layout with live pallet occupancy</p></div>
      <div className="grid grid-cols-4 gap-4">
        {zones.map(z=>(
          <button
            key={z.id}
            onClick={() => setDetail(z)}
            title={`Drill into ${z.label} rack detail`}
            className={cn("text-left w-full border-2 rounded-xl p-4 space-y-2 cursor-pointer hover:shadow-md transition-shadow", z.color)}
          >
            <div className="flex justify-between items-start">
              <p className="font-bold text-foreground text-sm">{z.label}</p>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/60 dark:bg-black/20 text-foreground">{z.type}</span>
            </div>
            <div className="w-full bg-white/40 dark:bg-black/20 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-foreground/40" style={{width:`${z.util}%`}} />
            </div>
            <p className="text-xs text-foreground/70">{z.pallets} / {z.capacity} pallets &bull; {z.util}%</p>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Click any zone to drill down into rack-level detail.</p>

      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.label ?? ""}
        description="Rack-level occupancy"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Close</button>
        }
      >
        {detail && (
          <div className="space-y-5">
            <div className="space-y-1">
              <DetailRow label="Zone ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
              <DetailRow label="Type" value={detail.type} />
              <DetailRow label="Occupancy" value={`${detail.pallets} / ${detail.capacity} pallets`} />
              <DetailRow label="Utilization" value={`${detail.util}%`} />
              <DetailRow label="Free Positions" value={`${detail.capacity - detail.pallets} pallets`} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Racks</p>
              <div className="space-y-2">
                {rackBreakdown(detail).map((r) => (
                  <div key={r.rack} className="rounded-lg border border-border bg-muted/20 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs text-foreground">{r.rack}</span>
                      <span className="text-xs text-muted-foreground">{r.used} / {r.capacity} pallets</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className={cn("h-1.5 rounded-full", r.util >= 90 ? "bg-danger" : r.util >= 75 ? "bg-warning" : "bg-success")} style={{ width: `${r.util}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
