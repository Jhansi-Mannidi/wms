"use client"

import { useState } from "react"
import {
  Thermometer, AlertTriangle, CheckCircle2, Clock,
  Plus, Eye, MoreHorizontal, TrendingDown, TrendingUp, Droplets
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type ColdZone = {
  id: string; name: string; type: string; targetTemp: string; currentTemp: number
  humidity: number; status: string; items: number; capacity: string; lastAlert: string
}

type ColdAlert = {
  id: string; zone: string; type: string; value: string; threshold: string
  time: string; severity: string; resolved: boolean
}

type TempLog = { zone: string; time: string; temp: number; humidity: number }

const initialZones: ColdZone[] = [
  { id: "CCZ-01", name: "Cold Room 1", type: "Chilled", targetTemp: "2–8°C", currentTemp: 4.2, humidity: 72, status: "Normal", items: 145, capacity: "80%", lastAlert: "None" },
  { id: "CCZ-02", name: "Cold Room 2", type: "Chilled", targetTemp: "2–8°C", currentTemp: 8.9, humidity: 75, status: "High Temp Alert", items: 89, capacity: "55%", lastAlert: "30 min ago" },
  { id: "CCZ-03", name: "Frozen Chamber", type: "Frozen", targetTemp: "-18 to -22°C", currentTemp: -19.5, humidity: 40, status: "Normal", items: 62, capacity: "45%", lastAlert: "None" },
  { id: "CCZ-04", name: "Ambient Cool Zone", type: "Ambient", targetTemp: "15–25°C", currentTemp: 22.1, humidity: 58, status: "Normal", items: 210, capacity: "90%", lastAlert: "None" },
  { id: "CCZ-05", name: "Cold Room 3", type: "Chilled", targetTemp: "2–8°C", currentTemp: 5.4, humidity: 70, status: "Normal", items: 132, capacity: "68%", lastAlert: "None" },
  { id: "CCZ-06", name: "Dairy Chiller", type: "Chilled", targetTemp: "0–4°C", currentTemp: 3.2, humidity: 74, status: "Normal", items: 98, capacity: "62%", lastAlert: "3 days ago" },
  { id: "CCZ-07", name: "Frozen Chamber 2", type: "Frozen", targetTemp: "-18 to -22°C", currentTemp: -20.4, humidity: 38, status: "Normal", items: 74, capacity: "52%", lastAlert: "None" },
  { id: "CCZ-08", name: "Ice Cream Vault", type: "Frozen", targetTemp: "-18 to -22°C", currentTemp: -17.4, humidity: 42, status: "High Temp Alert", items: 41, capacity: "35%", lastAlert: "15 min ago" },
  { id: "CCZ-09", name: "Pharma Cold Store", type: "Chilled", targetTemp: "2–8°C", currentTemp: 6.9, humidity: 68, status: "Warning", items: 156, capacity: "72%", lastAlert: "1 hour ago" },
  { id: "CCZ-10", name: "Produce Holding", type: "Ambient", targetTemp: "15–25°C", currentTemp: 19.6, humidity: 62, status: "Normal", items: 188, capacity: "76%", lastAlert: "None" },
  { id: "CCZ-11", name: "Dock Staging Cool", type: "Ambient", targetTemp: "15–25°C", currentTemp: 25.8, humidity: 54, status: "High Temp Alert", items: 63, capacity: "40%", lastAlert: "45 min ago" },
  { id: "CCZ-12", name: "Vaccine Reserve", type: "Chilled", targetTemp: "2–8°C", currentTemp: 2.8, humidity: 71, status: "Normal", items: 52, capacity: "30%", lastAlert: "None" },
  { id: "CCZ-13", name: "Blast Freezer", type: "Frozen", targetTemp: "-18 to -22°C", currentTemp: -21.6, humidity: 36, status: "Normal", items: 57, capacity: "48%", lastAlert: "None" },
  { id: "CCZ-14", name: "Seafood Freezer", type: "Frozen", targetTemp: "-18 to -22°C", currentTemp: -18.4, humidity: 44, status: "Warning", items: 83, capacity: "64%", lastAlert: "4 hours ago" },
]

const initialAlerts: ColdAlert[] = [
  { id: "ALT-089", zone: "Cold Room 2", type: "High Temperature", value: "8.9°C", threshold: "8°C", time: "30 min ago", severity: "Warning", resolved: false },
  { id: "ALT-088", zone: "Cold Room 1", type: "Power Fluctuation", value: "—", threshold: "—", time: "2 hours ago", severity: "Info", resolved: true },
  { id: "ALT-087", zone: "Frozen Chamber", type: "High Temperature", value: "-16.2°C", threshold: "-18°C", time: "Yesterday 11:30 PM", severity: "Critical", resolved: true },
  { id: "ALT-086", zone: "Cold Room 1", type: "High Humidity", value: "85%", threshold: "80%", time: "2 days ago", severity: "Warning", resolved: true },
  { id: "ALT-085", zone: "Ice Cream Vault", type: "High Temperature", value: "-17.4°C", threshold: "-18°C", time: "15 min ago", severity: "Critical", resolved: false },
  { id: "ALT-084", zone: "Dock Staging Cool", type: "High Temperature", value: "25.8°C", threshold: "25°C", time: "45 min ago", severity: "Warning", resolved: false },
  { id: "ALT-083", zone: "Pharma Cold Store", type: "Door Left Open", value: "6.9°C", threshold: "8°C", time: "1 hour ago", severity: "Warning", resolved: false },
  { id: "ALT-082", zone: "Seafood Freezer", type: "Temperature Drift", value: "-18.4°C", threshold: "-19°C", time: "4 hours ago", severity: "Info", resolved: false },
  { id: "ALT-081", zone: "Cold Room 3", type: "Sensor Calibration Due", value: "—", threshold: "—", time: "5 hours ago", severity: "Info", resolved: true },
  { id: "ALT-080", zone: "Frozen Chamber 2", type: "Defrost Cycle Extended", value: "-18.1°C", threshold: "-18°C", time: "Yesterday 08:15 AM", severity: "Warning", resolved: true },
  { id: "ALT-079", zone: "Dairy Chiller", type: "High Humidity", value: "83%", threshold: "80%", time: "Yesterday 06:40 AM", severity: "Warning", resolved: true },
  { id: "ALT-078", zone: "Produce Holding", type: "High Temperature", value: "26.4°C", threshold: "25°C", time: "2 days ago", severity: "Critical", resolved: true },
  { id: "ALT-077", zone: "Vaccine Reserve", type: "Power Fluctuation", value: "—", threshold: "—", time: "2 days ago", severity: "Info", resolved: true },
  { id: "ALT-076", zone: "Blast Freezer", type: "Compressor Restart", value: "—", threshold: "—", time: "3 days ago", severity: "Info", resolved: true },
  { id: "ALT-075", zone: "Cold Room 2", type: "High Temperature", value: "9.4°C", threshold: "8°C", time: "3 days ago", severity: "Critical", resolved: true },
  { id: "ALT-074", zone: "Ice Cream Vault", type: "Door Left Open", value: "-16.8°C", threshold: "-18°C", time: "4 days ago", severity: "Critical", resolved: true },
  { id: "ALT-073", zone: "Pharma Cold Store", type: "High Humidity", value: "81%", threshold: "80%", time: "4 days ago", severity: "Warning", resolved: true },
  { id: "ALT-072", zone: "Ambient Cool Zone", type: "Sensor Calibration Due", value: "—", threshold: "—", time: "5 days ago", severity: "Info", resolved: true },
  { id: "ALT-071", zone: "Frozen Chamber", type: "Temperature Drift", value: "-18.3°C", threshold: "-19°C", time: "6 days ago", severity: "Warning", resolved: true },
  { id: "ALT-070", zone: "Cold Room 3", type: "Power Fluctuation", value: "—", threshold: "—", time: "1 week ago", severity: "Info", resolved: true },
]

const logs: TempLog[] = [
  { zone: "Cold Room 1", time: "16:00", temp: 4.2, humidity: 72 },
  { zone: "Cold Room 1", time: "15:00", temp: 4.0, humidity: 71 },
  { zone: "Cold Room 1", time: "14:00", temp: 4.5, humidity: 73 },
  { zone: "Cold Room 1", time: "13:00", temp: 3.8, humidity: 70 },
  { zone: "Cold Room 1", time: "12:00", temp: 4.1, humidity: 72 },
  { zone: "Cold Room 2", time: "16:00", temp: 8.9, humidity: 75 },
  { zone: "Cold Room 2", time: "15:00", temp: 7.8, humidity: 74 },
  { zone: "Cold Room 2", time: "14:00", temp: 6.5, humidity: 73 },
  { zone: "Cold Room 2", time: "13:00", temp: 5.9, humidity: 72 },
  { zone: "Cold Room 2", time: "12:00", temp: 5.4, humidity: 71 },
  { zone: "Cold Room 3", time: "16:00", temp: 5.4, humidity: 70 },
  { zone: "Cold Room 3", time: "15:00", temp: 5.1, humidity: 69 },
  { zone: "Cold Room 3", time: "14:00", temp: 4.8, humidity: 70 },
  { zone: "Dairy Chiller", time: "16:00", temp: 3.2, humidity: 74 },
  { zone: "Dairy Chiller", time: "14:00", temp: 3.6, humidity: 75 },
  { zone: "Dairy Chiller", time: "12:00", temp: 3.1, humidity: 73 },
  { zone: "Frozen Chamber", time: "16:00", temp: -19.5, humidity: 40 },
  { zone: "Frozen Chamber", time: "14:00", temp: -19.8, humidity: 39 },
  { zone: "Frozen Chamber", time: "12:00", temp: -19.2, humidity: 41 },
  { zone: "Frozen Chamber 2", time: "16:00", temp: -20.4, humidity: 38 },
  { zone: "Frozen Chamber 2", time: "13:00", temp: -20.1, humidity: 39 },
  { zone: "Blast Freezer", time: "16:00", temp: -21.6, humidity: 36 },
  { zone: "Blast Freezer", time: "13:00", temp: -21.2, humidity: 37 },
  { zone: "Seafood Freezer", time: "16:00", temp: -18.4, humidity: 44 },
  { zone: "Seafood Freezer", time: "13:00", temp: -18.9, humidity: 43 },
  { zone: "Ice Cream Vault", time: "16:00", temp: -17.4, humidity: 42 },
  { zone: "Ice Cream Vault", time: "14:00", temp: -19.3, humidity: 41 },
  { zone: "Pharma Cold Store", time: "16:00", temp: 6.9, humidity: 68 },
  { zone: "Pharma Cold Store", time: "14:00", temp: 6.2, humidity: 67 },
  { zone: "Vaccine Reserve", time: "16:00", temp: 2.8, humidity: 71 },
  { zone: "Ambient Cool Zone", time: "16:00", temp: 22.1, humidity: 58 },
  { zone: "Ambient Cool Zone", time: "13:00", temp: 21.4, humidity: 57 },
  { zone: "Produce Holding", time: "16:00", temp: 19.6, humidity: 62 },
  { zone: "Produce Holding", time: "13:00", temp: 20.3, humidity: 61 },
  { zone: "Dock Staging Cool", time: "16:00", temp: 25.8, humidity: 54 },
  { zone: "Dock Staging Cool", time: "13:00", temp: 23.9, humidity: 53 },
]

/** Older readings surfaced by the "View Full History" drill-down. */
const archivedLogs: TempLog[] = [
  { zone: "Frozen Chamber", time: "Yesterday 23:00", temp: -16.2, humidity: 41 },
  { zone: "Frozen Chamber", time: "Yesterday 22:00", temp: -19.1, humidity: 40 },
  { zone: "Cold Room 1", time: "Yesterday 18:00", temp: 4.4, humidity: 74 },
  { zone: "Cold Room 1", time: "Yesterday 12:00", temp: 3.9, humidity: 70 },
  { zone: "Cold Room 2", time: "Yesterday 18:00", temp: 6.1, humidity: 73 },
  { zone: "Ambient Cool Zone", time: "Yesterday 18:00", temp: 21.8, humidity: 57 },
  { zone: "Ambient Cool Zone", time: "Yesterday 09:00", temp: 20.4, humidity: 55 },
  { zone: "Ice Cream Vault", time: "Yesterday 21:00", temp: -19.4, humidity: 41 },
  { zone: "Ice Cream Vault", time: "Yesterday 15:00", temp: -19.0, humidity: 42 },
  { zone: "Frozen Chamber 2", time: "Yesterday 20:00", temp: -20.2, humidity: 38 },
  { zone: "Frozen Chamber 2", time: "Yesterday 10:00", temp: -18.1, humidity: 40 },
  { zone: "Blast Freezer", time: "Yesterday 19:00", temp: -21.4, humidity: 36 },
  { zone: "Seafood Freezer", time: "Yesterday 17:00", temp: -18.7, humidity: 44 },
  { zone: "Cold Room 3", time: "Yesterday 18:00", temp: 5.2, humidity: 69 },
  { zone: "Cold Room 3", time: "Yesterday 08:00", temp: 4.6, humidity: 68 },
  { zone: "Dairy Chiller", time: "Yesterday 16:00", temp: 3.4, humidity: 75 },
  { zone: "Dairy Chiller", time: "Yesterday 06:00", temp: 3.9, humidity: 83 },
  { zone: "Pharma Cold Store", time: "Yesterday 14:00", temp: 7.2, humidity: 69 },
  { zone: "Vaccine Reserve", time: "Yesterday 14:00", temp: 3.0, humidity: 70 },
  { zone: "Produce Holding", time: "Yesterday 15:00", temp: 20.8, humidity: 62 },
  { zone: "Dock Staging Cool", time: "Yesterday 15:00", temp: 24.2, humidity: 53 },
  { zone: "Cold Room 2", time: "Yesterday 08:00", temp: 5.5, humidity: 71 },
]

const ZONE_TYPES = ["Chilled", "Frozen", "Ambient"] as const
const TARGET_RANGES = ["2–8°C", "-18 to -22°C", "15–25°C", "0–4°C"] as const

const emptyZoneForm = { name: "", type: "", targetTemp: "", currentTemp: "", humidity: "", items: "", capacity: "" }

const statusConfig: Record<string, { color: string; bg: string; border: string }> = {
  Normal: { color: "text-success", bg: "bg-success/15", border: "border-success/30" },
  "High Temp Alert": { color: "text-danger", bg: "bg-danger/15", border: "border-danger/40" },
  Warning: { color: "text-warning", bg: "bg-warning/15", border: "border-warning/30" },
}

const severityConfig: Record<string, { color: string; bg: string }> = {
  Critical: { color: "text-danger", bg: "bg-danger/15" },
  Warning: { color: "text-warning", bg: "bg-warning/15" },
  Info: { color: "text-brand", bg: "bg-brand/15" },
}

function TempGauge({ current, min, max }: { current: number; min: number; max: number }) {
  const range = max - min
  const pct = Math.min(100, Math.max(0, ((current - min) / range) * 100))
  const isHigh = current > max
  const isLow = current < min
  const color = isHigh || isLow ? "bg-danger" : "bg-success"

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden relative">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn("text-sm font-bold tabular-nums min-w-14 text-right", isHigh || isLow ? "text-danger" : "text-success")}>
        {current > 0 ? "+" : ""}{current}°C
      </span>
    </div>
  )
}

export default function ColdChainPage() {
  const [tab, setTab] = useState<"zones" | "alerts" | "logs">("zones")

  const [zones, setZones] = useState<ColdZone[]>(initialZones)
  const [alerts, setAlerts] = useState<ColdAlert[]>(initialAlerts)

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyZoneForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [zoneDetail, setZoneDetail] = useState<ColdZone | null>(null)
  const [zoneDeleteTarget, setZoneDeleteTarget] = useState<ColdZone | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)

  const activeAlerts = alerts.filter((a) => !a.resolved).length
  const fullHistory = [...logs, ...archivedLogs]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Zone name is required"
    else if (zones.some((z) => z.name.toLowerCase() === form.name.trim().toLowerCase())) e.name = "A zone with this name already exists"
    if (!form.type) e.type = "Select a zone type"
    if (!form.targetTemp) e.targetTemp = "Select a target range"
    if (!form.currentTemp.trim()) e.currentTemp = "Current temperature is required"
    else if (!/^-?\d+(\.\d+)?$/.test(form.currentTemp.trim())) e.currentTemp = "Enter a number, e.g. 4.2"
    if (!form.humidity.trim()) e.humidity = "Humidity is required"
    else if (!/^\d+$/.test(form.humidity) || Number(form.humidity) > 100) e.humidity = "Enter a whole number 0–100"
    if (!form.items.trim()) e.items = "Item count is required"
    else if (!/^\d+$/.test(form.items)) e.items = "Enter a whole number"
    if (!form.capacity.trim()) e.capacity = "Capacity is required"
    else if (!/^\d+$/.test(form.capacity) || Number(form.capacity) > 100) e.capacity = "Enter a whole number 0–100"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createZone() {
    if (!validate()) return
    const temp = Number(form.currentTemp)
    const inRange =
      form.type === "Frozen" ? temp <= -18 :
      form.type === "Ambient" ? temp >= 15 && temp <= 25 :
      temp >= 2 && temp <= 8
    const next: ColdZone = {
      id: `CCZ-${String(zones.length + 1).padStart(2, "0")}`,
      name: form.name.trim(),
      type: form.type,
      targetTemp: form.targetTemp,
      currentTemp: temp,
      humidity: Number(form.humidity),
      status: inRange ? "Normal" : "High Temp Alert",
      items: Number(form.items),
      capacity: `${form.capacity}%`,
      lastAlert: "None",
    }
    setZones((prev) => [...prev, next])
    setCreateOpen(false)
    setForm(emptyZoneForm)
    setErrors({})
    notify.success("Zone added", `${next.name} is now monitored at ${next.currentTemp}°C.`)
  }

  function acknowledge(a: ColdAlert) {
    setAlerts((prev) => prev.map((x) => (x.id === a.id ? { ...x, resolved: true } : x)))
    setZones((prev) => prev.map((z) => (z.name === a.zone ? { ...z, status: "Normal", lastAlert: a.time } : z)))
    notify.success("Alert acknowledged", `${a.id} — ${a.type} in ${a.zone} marked resolved.`)
  }

  function deleteZone(z: ColdZone) {
    setZones((prev) => prev.filter((x) => x.id !== z.id))
    setZoneDetail(null)
    notify.warning("Zone removed", `${z.name} is no longer monitored.`)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="w-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cold Chain Monitoring</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Real-time temperature and humidity tracking</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {activeAlerts > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-danger/15 border border-danger/30 text-danger text-sm font-medium">
                <AlertTriangle className="w-4 h-4" />
                {activeAlerts} Active Alert{activeAlerts > 1 ? "s" : ""}
              </div>
            )}
            <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
              <Plus className="w-4 h-4" /> Add Zone
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Monitored Zones", value: zones.length.toString(), sub: "All zones online", icon: <Thermometer className="w-5 h-5" />, color: "text-brand" },
            { label: "Normal Zones", value: zones.filter((z) => z.status === "Normal").length.toString(), sub: "Within range", icon: <CheckCircle2 className="w-5 h-5" />, color: "text-success" },
            { label: "Active Alerts", value: activeAlerts.toString(), sub: "Needs attention", icon: <AlertTriangle className="w-5 h-5" />, color: "text-danger" },
            { label: "Total SKUs", value: zones.reduce((s, z) => s + z.items, 0).toString(), sub: "Across cold zones", icon: <TrendingDown className="w-5 h-5" />, color: "text-brand" },
          ].map((stat, i) => (
            <div key={i} className="p-3.5 rounded-2xl border border-border bg-card">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className={stat.color}>{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className={cn("text-xs mt-1", i === 2 ? "text-danger" : "text-muted-foreground")}>{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-muted/50 w-fit">
          {(["zones", "alerts", "logs"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors relative", tab === t ? "bg-brand text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/60")}>
              {t === "alerts" ? "Alerts" : t === "logs" ? "Temp Logs" : "Zones"}
              {t === "alerts" && activeAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center">{activeAlerts}</span>
              )}
            </button>
          ))}
        </div>

        {tab === "zones" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {zones.map((zone) => (
              <div key={zone.id} className={cn("p-5 rounded-2xl border bg-card", statusConfig[zone.status]?.border ?? "border-border")}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Thermometer className={cn("w-4 h-4", zone.status === "Normal" ? "text-success" : "text-danger")} />
                      <h3 className="font-semibold text-foreground">{zone.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{zone.type} • Target: {zone.targetTemp}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusConfig[zone.status]?.bg, statusConfig[zone.status]?.color)}>
                      {zone.status}
                    </span>
                    <button onClick={() => setZoneDetail(zone)} title={`View ${zone.name} details`} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Thermometer className="w-3 h-3" /> Temperature</span>
                      {zone.status !== "Normal" && <TrendingUp className="w-3.5 h-3.5 text-danger" />}
                    </div>
                    <TempGauge
                      current={zone.currentTemp}
                      min={zone.type === "Frozen" ? -22 : zone.type === "Ambient" ? 15 : 2}
                      max={zone.type === "Frozen" ? -18 : zone.type === "Ambient" ? 25 : 8}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Droplets className="w-3 h-3" /> Humidity</span>
                      <span className="text-xs font-semibold text-foreground">{zone.humidity}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${zone.humidity}%` }} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Items</p>
                    <p className="text-sm font-bold text-foreground">{zone.items}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Capacity</p>
                    <p className="text-sm font-bold text-foreground">{zone.capacity}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Last Alert</p>
                    <p className={cn("text-xs font-medium", zone.lastAlert === "None" ? "text-success" : "text-warning")}>{zone.lastAlert}</p>
                  </div>
                </div>
              </div>
            ))}
            {zones.length === 0 && (
              <div className="col-span-full p-10 text-center text-sm text-muted-foreground rounded-2xl border border-border bg-card">
                No zones are being monitored. Use “Add Zone” to start.
              </div>
            )}
          </div>
        )}

        {tab === "alerts" && (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className={cn("p-4 rounded-2xl border flex items-start gap-4", alert.resolved ? "border-border bg-card opacity-60" : cn("bg-card", severityConfig[alert.severity]?.bg.replace("/15", "/5"), "border-" + (alert.severity === "Critical" ? "danger" : alert.severity === "Warning" ? "warning" : "brand") + "/30"))}>
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", severityConfig[alert.severity]?.bg)}>
                  <AlertTriangle className={cn("w-4 h-4", severityConfig[alert.severity]?.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-foreground">{alert.type}</span>
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", severityConfig[alert.severity]?.bg, severityConfig[alert.severity]?.color)}>
                      {alert.severity}
                    </span>
                    {alert.resolved && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-success/15 text-success">Resolved</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Zone: <span className="text-foreground font-medium">{alert.zone}</span>
                    {alert.value !== "—" && <> • Measured: <span className="text-foreground font-medium">{alert.value}</span> (Threshold: {alert.threshold})</>}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {alert.time}</p>
                </div>
                {!alert.resolved && (
                  <button onClick={() => acknowledge(alert)} title={`Acknowledge ${alert.id}`} className="px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-medium hover:bg-brand/90 transition-colors shrink-0">
                    Acknowledge
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "logs" && (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Temperature Logs — Today</h2>
              <button onClick={() => setHistoryOpen(true)} title="View full temperature history" className="flex items-center gap-1.5 text-xs text-brand hover:underline">
                <Eye className="w-3.5 h-3.5" /> View Full History
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    {["Zone", "Time", "Temperature", "Humidity", "Status"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => {
                    const zone = zones.find((z) => z.name === log.zone)
                    const isHighTemp = zone && (log.temp > (zone.type === "Frozen" ? -18 : zone.type === "Ambient" ? 25 : 8))
                    return (
                      <tr key={i} className={cn("border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors", i % 2 === 1 ? "bg-muted/10" : "")}>
                        <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{log.zone}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{log.time}</td>
                        <td className={cn("px-4 py-3 font-bold whitespace-nowrap tabular-nums", isHighTemp ? "text-danger" : "text-success")}>
                          {log.temp > 0 ? "+" : ""}{log.temp}°C
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{log.humidity}%</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {isHighTemp ? (
                            <span className="flex items-center gap-1 text-xs text-danger font-medium"><TrendingUp className="w-3 h-3" /> High Temp</span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-success font-medium"><CheckCircle2 className="w-3 h-3" /> Normal</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add zone */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyZoneForm); setErrors({}) } }}
        title="Add Cold Chain Zone"
        description="Register a temperature-controlled zone for monitoring"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createZone} submitLabel="Add Zone" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Zone Name" required error={errors.name}>
            <TextInput value={form.name} invalid={!!errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Cold Room 3" />
          </Field>
          <Field label="Zone Type" required error={errors.type}>
            <Select value={form.type} invalid={!!errors.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={ZONE_TYPES} placeholder="Select Type" />
          </Field>
          <Field label="Target Range" required error={errors.targetTemp}>
            <Select value={form.targetTemp} invalid={!!errors.targetTemp} onChange={(e) => setForm({ ...form, targetTemp: e.target.value })} options={TARGET_RANGES} placeholder="Select Range" />
          </Field>
          <Field label="Current Temp (°C)" required error={errors.currentTemp}>
            <TextInput value={form.currentTemp} invalid={!!errors.currentTemp} onChange={(e) => setForm({ ...form, currentTemp: e.target.value })} placeholder="e.g. 4.2" />
          </Field>
          <Field label="Humidity (%)" required error={errors.humidity}>
            <TextInput value={form.humidity} invalid={!!errors.humidity} onChange={(e) => setForm({ ...form, humidity: e.target.value })} placeholder="e.g. 70" inputMode="numeric" />
          </Field>
          <Field label="Items Stored" required error={errors.items}>
            <TextInput value={form.items} invalid={!!errors.items} onChange={(e) => setForm({ ...form, items: e.target.value })} placeholder="e.g. 120" inputMode="numeric" />
          </Field>
          <Field label="Capacity Used (%)" required error={errors.capacity}>
            <TextInput value={form.capacity} invalid={!!errors.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="e.g. 60" inputMode="numeric" />
          </Field>
        </div>
      </Modal>

      {/* Zone detail */}
      <Drawer
        open={!!zoneDetail}
        onOpenChange={(o) => !o && setZoneDetail(null)}
        title={zoneDetail?.name ?? ""}
        description="Cold chain zone detail"
        footer={
          <>
            <button onClick={() => zoneDetail && setZoneDeleteTarget(zoneDetail)} className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger/90">
              Remove Zone
            </button>
            <button onClick={() => setZoneDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Close
            </button>
          </>
        }
      >
        {zoneDetail && (
          <div className="space-y-1">
            <DetailRow label="Zone ID" value={<span className="font-mono text-brand">{zoneDetail.id}</span>} />
            <DetailRow label="Name" value={zoneDetail.name} />
            <DetailRow label="Type" value={zoneDetail.type} />
            <DetailRow label="Target Range" value={zoneDetail.targetTemp} />
            <DetailRow label="Current Temp" value={`${zoneDetail.currentTemp > 0 ? "+" : ""}${zoneDetail.currentTemp}°C`} />
            <DetailRow label="Humidity" value={`${zoneDetail.humidity}%`} />
            <DetailRow label="Items" value={zoneDetail.items} />
            <DetailRow label="Capacity Used" value={zoneDetail.capacity} />
            <DetailRow label="Last Alert" value={zoneDetail.lastAlert} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusConfig[zoneDetail.status]?.bg, statusConfig[zoneDetail.status]?.color)}>{zoneDetail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Full temperature history */}
      <Modal
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        title="Full Temperature History"
        description={`${fullHistory.length} readings across all monitored zones`}
        size="lg"
        footer={
          <button onClick={() => setHistoryOpen(false)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Close</button>
        }
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Zone", "Time", "Temperature", "Humidity"].map((h) => (
                <th key={h} className="pb-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {fullHistory.map((log, i) => {
              const zone = zones.find((z) => z.name === log.zone)
              const isHighTemp = !!zone && log.temp > (zone.type === "Frozen" ? -18 : zone.type === "Ambient" ? 25 : 8)
              return (
                <tr key={i}>
                  <td className="py-2.5 text-foreground">{log.zone}</td>
                  <td className="py-2.5 text-muted-foreground text-xs">{log.time}</td>
                  <td className={cn("py-2.5 font-bold tabular-nums", isHighTemp ? "text-danger" : "text-success")}>{log.temp > 0 ? "+" : ""}{log.temp}°C</td>
                  <td className="py-2.5 text-muted-foreground">{log.humidity}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Modal>

      {/* Remove zone confirmation */}
      <ConfirmDialog
        open={!!zoneDeleteTarget}
        onOpenChange={(o) => !o && setZoneDeleteTarget(null)}
        title="Remove this zone from monitoring?"
        message={`${zoneDeleteTarget?.name} currently holds ${zoneDeleteTarget?.items ?? 0} items. Temperature alerts for this zone will stop immediately.`}
        confirmLabel="Remove Zone"
        cancelLabel="Keep Monitoring"
        onConfirm={() => zoneDeleteTarget && deleteZone(zoneDeleteTarget)}
      />
    </div>
  )
}
