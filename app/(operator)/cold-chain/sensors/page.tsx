"use client"
import { useState } from "react"
import { Wifi, AlertTriangle, CheckCircle2, Eye, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Drawer } from "@/components/ui/modal"
import { DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Sensor = {
  id: string; zone: string; location: string; temp: number
  humid: number; status: string; lastPing: string
}

const initialSensors: Sensor[] = [
  { id: "SEN-001", zone: "Cold Room A", location: "A-12", temp: 2.4, humid: 68, status: "ok", lastPing: "30s ago" },
  { id: "SEN-002", zone: "Cold Room A", location: "A-08", temp: 3.1, humid: 70, status: "ok", lastPing: "28s ago" },
  { id: "SEN-003", zone: "Cold Room B", location: "B-04", temp: 6.8, humid: 72, status: "warn", lastPing: "35s ago" },
  { id: "SEN-004", zone: "Freezer Zone", location: "F-01", temp: -19.2, humid: 55, status: "ok", lastPing: "31s ago" },
  { id: "SEN-005", zone: "Freezer Zone", location: "F-03", temp: -17.8, humid: 57, status: "warn", lastPing: "1m ago" },
  { id: "SEN-006", zone: "Chiller Zone", location: "C-02", temp: 8.5, humid: 65, status: "ok", lastPing: "29s ago" },
  { id: "SEN-007", zone: "Loading Bay", location: "LB-1", temp: 14.2, humid: 60, status: "alert", lastPing: "5m ago" },
  { id: "SEN-008", zone: "Cold Room A", location: "A-05", temp: 2.9, humid: 69, status: "ok", lastPing: "27s ago" },
  { id: "SEN-009", zone: "Cold Room B", location: "B-07", temp: 7.4, humid: 73, status: "warn", lastPing: "33s ago" },
  { id: "SEN-010", zone: "Cold Room B", location: "B-02", temp: 5.2, humid: 71, status: "ok", lastPing: "30s ago" },
  { id: "SEN-011", zone: "Chiller Zone", location: "C-05", temp: 11.4, humid: 66, status: "alert", lastPing: "2m ago" },
  { id: "SEN-012", zone: "Cold Room A", location: "A-15", temp: 5.9, humid: 70, status: "warn", lastPing: "34s ago" },
  { id: "SEN-013", zone: "Freezer Zone", location: "F-05", temp: -20.1, humid: 54, status: "ok", lastPing: "32s ago" },
  { id: "SEN-014", zone: "Freezer Zone", location: "F-07", temp: -16.9, humid: 58, status: "warn", lastPing: "41s ago" },
  { id: "SEN-015", zone: "Chiller Zone", location: "C-04", temp: 8.1, humid: 64, status: "ok", lastPing: "29s ago" },
  { id: "SEN-016", zone: "Chiller Zone", location: "C-06", temp: 9.6, humid: 84, status: "warn", lastPing: "8m ago" },
  { id: "SEN-017", zone: "Loading Bay", location: "LB-2", temp: 9.4, humid: 61, status: "ok", lastPing: "3m ago" },
  { id: "SEN-018", zone: "Loading Bay", location: "LB-3", temp: 12.6, humid: 78, status: "warn", lastPing: "45s ago" },
  { id: "SEN-019", zone: "Cold Room A", location: "A-03", temp: 3.4, humid: 68, status: "ok", lastPing: "26s ago" },
  { id: "SEN-020", zone: "Cold Room B", location: "B-09", temp: 4.8, humid: 72, status: "ok", lastPing: "31s ago" },
  { id: "SEN-021", zone: "Freezer Zone", location: "F-02", temp: -19.6, humid: 56, status: "ok", lastPing: "12m ago" },
  { id: "SEN-022", zone: "Freezer Zone", location: "F-04", temp: -20.8, humid: 53, status: "ok", lastPing: "28s ago" },
  { id: "SEN-023", zone: "Chiller Zone", location: "C-01", temp: 7.9, humid: 65, status: "ok", lastPing: "30s ago" },
  { id: "SEN-024", zone: "Loading Bay", location: "LB-4", temp: 9.8, humid: 62, status: "ok", lastPing: "34s ago" },
]

function statusLabel(status: string) {
  return status === "ok" ? "Normal" : status === "warn" ? "Warning" : "Alert"
}

export default function ColdChainSensorsPage() {
  const [sensors, setSensors] = useState<Sensor[]>(initialSensors)
  const [detail, setDetail] = useState<Sensor | null>(null)

  // A sensor counts as online while it has pinged within the last 5 minutes.
  const online = sensors.filter((s) => {
    const minutes = /^(\d+)m ago$/.exec(s.lastPing)
    return !minutes || Number(minutes[1]) < 5
  }).length
  const alerting = sensors.filter((s) => s.status !== "ok").length

  function ping(s: Sensor) {
    setSensors((prev) => prev.map((x) => (x.id === s.id ? { ...x, lastPing: "just now" } : x)))
    notify.info("Sensor pinged", `${s.id} in ${s.zone} responded — reading ${s.temp}°C.`)
  }

  const stats = [
    { label: "Total Sensors", value: sensors.length.toString(), sub: "deployed", icon: <Wifi className="w-5 h-5 text-brand" /> },
    { label: "Online", value: online.toString(), sub: online === sensors.length ? "all connected" : "responding", icon: <CheckCircle2 className="w-5 h-5 text-success" /> },
    { label: "Alerts", value: alerting.toString(), sub: "require attention", icon: <AlertTriangle className="w-5 h-5 text-amber-500" /> },
  ]

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Sensor Network</h1><p className="text-sm text-muted-foreground mt-1">Real-time temperature and humidity sensors across all cold zones</p></div>
      <div className="grid grid-cols-3 gap-4">
        {stats.map(s=>(
          <div key={s.label} className="bg-card border border-border rounded-xl p-3"><div className="mb-2">{s.icon}</div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.sub}</p></div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["Sensor ID","Zone","Location","Temp (°C)","Humidity","Status","Last Ping","Actions"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {sensors.map(s=>(
              <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{s.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{s.zone}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.location}</td>
                <td className="px-4 py-3"><span className={cn("font-bold",s.status==="alert"?"text-danger":s.status==="warn"?"text-amber-500":"text-foreground")}>{s.temp}°</span></td>
                <td className="px-4 py-3 text-muted-foreground">{s.humid}%</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium",s.status==="ok"?"bg-success/10 text-success":s.status==="warn"?"bg-amber-50 text-amber-600":"bg-danger/10 text-danger")}>{statusLabel(s.status)}</span></td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{s.lastPing}</td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: `View ${s.id} details`, icon: <Eye />, onSelect: () => setDetail(s) },
                      { label: `Ping ${s.id}`, icon: <RefreshCw />, onSelect: () => ping(s) },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {sensors.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No sensors deployed.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Sensor detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Close</button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Sensor ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Zone" value={detail.zone} />
            <DetailRow label="Location" value={<span className="font-mono">{detail.location}</span>} />
            <DetailRow label="Temperature" value={`${detail.temp}°C`} />
            <DetailRow label="Humidity" value={`${detail.humid}%`} />
            <DetailRow label="Last Ping" value={detail.lastPing} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium",detail.status==="ok"?"bg-success/10 text-success":detail.status==="warn"?"bg-amber-50 text-amber-600":"bg-danger/10 text-danger")}>{statusLabel(detail.status)}</span>} />
          </div>
        )}
      </Drawer>
    </div>
  )
}
