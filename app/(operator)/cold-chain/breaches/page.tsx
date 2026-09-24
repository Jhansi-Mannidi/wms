"use client"
import { useState } from "react"
import { AlertTriangle, Eye, CheckCircle2 } from "lucide-react"
import { Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Breach = {
  id: string; zone: string; sensor: string; type: string; reading: string
  threshold: string; duration: string; detected: string; resolved: boolean
}

const initialBreaches: Breach[] = [
  { id:"BR-001", zone:"Loading Bay", sensor:"SEN-007", type:"High Temp", reading:"14.2°C", threshold:"10°C", duration:"12 min", detected:"2025-07-19 11:32", resolved:false },
  { id:"BR-002", zone:"Cold Room B", sensor:"SEN-003", type:"High Temp", reading:"6.8°C", threshold:"5°C", duration:"5 min", detected:"2025-07-19 09:15", resolved:false },
  { id:"BR-003", zone:"Freezer Zone", sensor:"SEN-005", type:"Temp Rise", reading:"-17.8°C", threshold:"-18°C", duration:"8 min", detected:"2025-07-18 22:42", resolved:true },
  { id:"BR-004", zone:"Cold Room A", sensor:"SEN-001", type:"Door Open", reading:"8.1°C", threshold:"4°C", duration:"3 min", detected:"2025-07-18 14:10", resolved:true },
  { id:"BR-005", zone:"Chiller Zone", sensor:"SEN-006", type:"High Humid", reading:"82%", threshold:"75%", duration:"20 min", detected:"2025-07-17 16:55", resolved:true },
  { id:"BR-006", zone:"Freezer Zone", sensor:"SEN-014", type:"Temp Rise", reading:"-16.9°C", threshold:"-18°C", duration:"18 min", detected:"2025-07-19 13:05", resolved:false },
  { id:"BR-007", zone:"Cold Room A", sensor:"SEN-002", type:"Door Open", reading:"7.6°C", threshold:"4°C", duration:"6 min", detected:"2025-07-19 10:48", resolved:false },
  { id:"BR-008", zone:"Chiller Zone", sensor:"SEN-011", type:"High Temp", reading:"11.4°C", threshold:"9°C", duration:"9 min", detected:"2025-07-19 08:22", resolved:false },
  { id:"BR-009", zone:"Loading Bay", sensor:"SEN-018", type:"High Humid", reading:"79%", threshold:"75%", duration:"25 min", detected:"2025-07-19 07:10", resolved:false },
  { id:"BR-010", zone:"Cold Room B", sensor:"SEN-009", type:"High Temp", reading:"7.4°C", threshold:"5°C", duration:"11 min", detected:"2025-07-18 19:36", resolved:true },
  { id:"BR-011", zone:"Freezer Zone", sensor:"SEN-004", type:"Door Open", reading:"-15.4°C", threshold:"-18°C", duration:"4 min", detected:"2025-07-18 17:02", resolved:true },
  { id:"BR-012", zone:"Cold Room A", sensor:"SEN-001", type:"High Humid", reading:"78%", threshold:"75%", duration:"16 min", detected:"2025-07-18 12:25", resolved:true },
  { id:"BR-013", zone:"Chiller Zone", sensor:"SEN-006", type:"Temp Rise", reading:"9.8°C", threshold:"9°C", duration:"7 min", detected:"2025-07-18 09:41", resolved:true },
  { id:"BR-014", zone:"Loading Bay", sensor:"SEN-007", type:"High Temp", reading:"15.6°C", threshold:"10°C", duration:"22 min", detected:"2025-07-17 20:14", resolved:true },
  { id:"BR-015", zone:"Cold Room B", sensor:"SEN-003", type:"Door Open", reading:"6.2°C", threshold:"5°C", duration:"3 min", detected:"2025-07-17 13:48", resolved:true },
  { id:"BR-016", zone:"Freezer Zone", sensor:"SEN-005", type:"Temp Rise", reading:"-17.2°C", threshold:"-18°C", duration:"14 min", detected:"2025-07-17 09:05", resolved:true },
  { id:"BR-017", zone:"Cold Room A", sensor:"SEN-012", type:"High Temp", reading:"5.9°C", threshold:"4°C", duration:"8 min", detected:"2025-07-16 21:33", resolved:true },
  { id:"BR-018", zone:"Chiller Zone", sensor:"SEN-016", type:"High Humid", reading:"84%", threshold:"75%", duration:"31 min", detected:"2025-07-16 15:19", resolved:true },
  { id:"BR-019", zone:"Loading Bay", sensor:"SEN-018", type:"High Temp", reading:"13.1°C", threshold:"10°C", duration:"10 min", detected:"2025-07-16 11:02", resolved:true },
  { id:"BR-020", zone:"Cold Room B", sensor:"SEN-009", type:"Temp Rise", reading:"5.8°C", threshold:"5°C", duration:"5 min", detected:"2025-07-15 18:47", resolved:true },
  { id:"BR-021", zone:"Freezer Zone", sensor:"SEN-014", type:"High Temp", reading:"-16.4°C", threshold:"-18°C", duration:"19 min", detected:"2025-07-15 14:26", resolved:true },
  { id:"BR-022", zone:"Cold Room A", sensor:"SEN-002", type:"High Humid", reading:"77%", threshold:"75%", duration:"12 min", detected:"2025-07-15 08:51", resolved:true },
  { id:"BR-023", zone:"Chiller Zone", sensor:"SEN-011", type:"Door Open", reading:"10.6°C", threshold:"9°C", duration:"4 min", detected:"2025-07-14 16:38", resolved:true },
  { id:"BR-024", zone:"Loading Bay", sensor:"SEN-007", type:"Temp Rise", reading:"12.3°C", threshold:"10°C", duration:"13 min", detected:"2025-07-14 10:15", resolved:true },
  { id:"BR-025", zone:"Cold Room B", sensor:"SEN-003", type:"High Humid", reading:"81%", threshold:"75%", duration:"27 min", detected:"2025-07-13 19:04", resolved:true },
  { id:"BR-026", zone:"Freezer Zone", sensor:"SEN-004", type:"Temp Rise", reading:"-17.5°C", threshold:"-18°C", duration:"6 min", detected:"2025-07-13 11:29", resolved:true },
]

export default function ColdChainBreachesPage() {
  const [breaches, setBreaches] = useState<Breach[]>(initialBreaches)
  const [detail, setDetail] = useState<Breach | null>(null)
  const [resolveTarget, setResolveTarget] = useState<Breach | null>(null)

  const active = breaches.filter(b => !b.resolved)

  function resolve(b: Breach) {
    setBreaches((prev) => prev.map((x) => (x.id === b.id ? { ...x, resolved: true } : x)))
    setDetail(null)
    notify.success("Breach resolved", `${b.id} in ${b.zone} marked as resolved.`)
  }

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Breach Log</h1><p className="text-sm text-muted-foreground mt-1">Temperature and humidity excursion events with resolution status</p></div>
      {active.length > 0 && (
        <div className="bg-danger/5 border border-danger/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
          <div><p className="font-semibold text-danger text-sm">{active.length} Active Breach{active.length > 1 ? "es" : ""}</p><p className="text-xs text-danger/80 mt-0.5">Immediate action required in: {active.map(b=>b.zone).join(", ")}</p></div>
        </div>
      )}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border"><tr>{["Breach ID","Zone","Sensor","Type","Reading","Threshold","Duration","Detected","Status","Actions"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {breaches.map(b=>(
              <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{b.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{b.zone}</td>
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{b.sensor}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.type}</td>
                <td className="px-4 py-3 font-bold text-danger">{b.reading}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.threshold}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.duration}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{b.detected}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${b.resolved?"bg-success/10 text-success":"bg-danger/10 text-danger"}`}>{b.resolved?"Resolved":"Active"}</span></td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: `View ${b.id} details`, icon: <Eye />, onSelect: () => setDetail(b) },
                      ...(!b.resolved
                        ? [{ label: `Resolve ${b.id}`, icon: <CheckCircle2 />, onSelect: () => setResolveTarget(b), tone: "success" as const }]
                        : []),
                    ]}
                  />
                </td>
              </tr>
            ))}
            {breaches.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-10 text-center text-sm text-muted-foreground">No breach events recorded.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Breach event detail"
        footer={
          <>
            {detail && !detail.resolved && (
              <button onClick={() => setResolveTarget(detail)} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">Resolve</button>
            )}
            <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Close</button>
          </>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Breach ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Zone" value={detail.zone} />
            <DetailRow label="Sensor" value={<span className="font-mono">{detail.sensor}</span>} />
            <DetailRow label="Type" value={detail.type} />
            <DetailRow label="Reading" value={<span className="font-bold text-danger">{detail.reading}</span>} />
            <DetailRow label="Threshold" value={detail.threshold} />
            <DetailRow label="Duration" value={detail.duration} />
            <DetailRow label="Detected" value={detail.detected} />
            <DetailRow label="Status" value={<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${detail.resolved?"bg-success/10 text-success":"bg-danger/10 text-danger"}`}>{detail.resolved?"Resolved":"Active"}</span>} />
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!resolveTarget}
        onOpenChange={(o) => !o && setResolveTarget(null)}
        title="Mark this breach resolved?"
        message={`${resolveTarget?.id} — ${resolveTarget?.type} in ${resolveTarget?.zone} (${resolveTarget?.reading}). Confirm corrective action has been completed.`}
        confirmLabel="Mark Resolved"
        cancelLabel="Not Yet"
        tone="brand"
        onConfirm={() => resolveTarget && resolve(resolveTarget)}
      />
    </div>
  )
}
