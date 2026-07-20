"use client"

import { useState } from "react"
import {
  Thermometer, AlertTriangle, CheckCircle2, Clock,
  Plus, Eye, MoreHorizontal, TrendingDown, TrendingUp, Droplets
} from "lucide-react"
import { cn } from "@/lib/utils"

const zones = [
  { id: "CCZ-01", name: "Cold Room 1", type: "Chilled", targetTemp: "2–8°C", currentTemp: 4.2, humidity: 72, status: "Normal", items: 145, capacity: "80%", lastAlert: "None" },
  { id: "CCZ-02", name: "Cold Room 2", type: "Chilled", targetTemp: "2–8°C", currentTemp: 8.9, humidity: 75, status: "High Temp Alert", items: 89, capacity: "55%", lastAlert: "30 min ago" },
  { id: "CCZ-03", name: "Frozen Chamber", type: "Frozen", targetTemp: "-18 to -22°C", currentTemp: -19.5, humidity: 40, status: "Normal", items: 62, capacity: "45%", lastAlert: "None" },
  { id: "CCZ-04", name: "Ambient Cool Zone", type: "Ambient", targetTemp: "15–25°C", currentTemp: 22.1, humidity: 58, status: "Normal", items: 210, capacity: "90%", lastAlert: "None" },
]

const alerts = [
  { id: "ALT-089", zone: "Cold Room 2", type: "High Temperature", value: "8.9°C", threshold: "8°C", time: "30 min ago", severity: "Warning", resolved: false },
  { id: "ALT-088", zone: "Cold Room 1", type: "Power Fluctuation", value: "—", threshold: "—", time: "2 hours ago", severity: "Info", resolved: true },
  { id: "ALT-087", zone: "Frozen Chamber", type: "High Temperature", value: "-16.2°C", threshold: "-18°C", time: "Yesterday 11:30 PM", severity: "Critical", resolved: true },
  { id: "ALT-086", zone: "Cold Room 1", type: "High Humidity", value: "85%", threshold: "80%", time: "2 days ago", severity: "Warning", resolved: true },
]

const logs = [
  { zone: "Cold Room 1", time: "16:00", temp: 4.2, humidity: 72 },
  { zone: "Cold Room 1", time: "15:00", temp: 4.0, humidity: 71 },
  { zone: "Cold Room 1", time: "14:00", temp: 4.5, humidity: 73 },
  { zone: "Cold Room 1", time: "13:00", temp: 3.8, humidity: 70 },
  { zone: "Cold Room 1", time: "12:00", temp: 4.1, humidity: 72 },
  { zone: "Cold Room 2", time: "16:00", temp: 8.9, humidity: 75 },
  { zone: "Cold Room 2", time: "15:00", temp: 7.8, humidity: 74 },
  { zone: "Cold Room 2", time: "14:00", temp: 6.5, humidity: 73 },
  { zone: "Cold Room 2", time: "13:00", temp: 5.9, humidity: 72 },
]

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

  const activeAlerts = alerts.filter((a) => !a.resolved).length

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
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
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
            <div key={i} className="p-5 rounded-2xl border border-border bg-card">
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
                    <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
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
                  <button className="px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-medium hover:bg-brand/90 transition-colors shrink-0">
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
              <button className="flex items-center gap-1.5 text-xs text-brand hover:underline">
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
    </div>
  )
}
