"use client"
import { Thermometer, Wifi, AlertTriangle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

const sensors = [
  { id: "SEN-001", zone: "Cold Room A", location: "A-12", temp: 2.4, humid: 68, status: "ok", lastPing: "30s ago" },
  { id: "SEN-002", zone: "Cold Room A", location: "A-08", temp: 3.1, humid: 70, status: "ok", lastPing: "28s ago" },
  { id: "SEN-003", zone: "Cold Room B", location: "B-04", temp: 6.8, humid: 72, status: "warn", lastPing: "35s ago" },
  { id: "SEN-004", zone: "Freezer Zone", location: "F-01", temp: -19.2, humid: 55, status: "ok", lastPing: "31s ago" },
  { id: "SEN-005", zone: "Freezer Zone", location: "F-03", temp: -17.8, humid: 57, status: "warn", lastPing: "1m ago" },
  { id: "SEN-006", zone: "Chiller Zone", location: "C-02", temp: 8.5, humid: 65, status: "ok", lastPing: "29s ago" },
  { id: "SEN-007", zone: "Loading Bay", location: "LB-1", temp: 14.2, humid: 60, status: "alert", lastPing: "5m ago" },
]

export default function ColdChainSensorsPage() {
  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Sensor Network</h1><p className="text-sm text-muted-foreground mt-1">Real-time temperature and humidity sensors across all cold zones</p></div>
      <div className="grid grid-cols-3 gap-4">
        {[{ label:"Total Sensors",value:"7",sub:"deployed",icon:<Wifi className="w-5 h-5 text-brand"/>},{label:"Online",value:"7",sub:"all connected",icon:<CheckCircle2 className="w-5 h-5 text-success"/>},{label:"Alerts",value:"2",sub:"require attention",icon:<AlertTriangle className="w-5 h-5 text-amber-500"/>}].map(s=>(
          <div key={s.label} className="bg-card border border-border rounded-xl p-4"><div className="mb-2">{s.icon}</div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.sub}</p></div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["Sensor ID","Zone","Location","Temp (°C)","Humidity","Status","Last Ping"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {sensors.map(s=>(
              <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{s.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{s.zone}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.location}</td>
                <td className="px-4 py-3"><span className={cn("font-bold",s.status==="alert"?"text-danger":s.status==="warn"?"text-amber-500":"text-foreground")}>{s.temp}°</span></td>
                <td className="px-4 py-3 text-muted-foreground">{s.humid}%</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium",s.status==="ok"?"bg-success/10 text-success":s.status==="warn"?"bg-amber-50 text-amber-600":"bg-danger/10 text-danger")}>{s.status==="ok"?"Normal":s.status==="warn"?"Warning":"Alert"}</span></td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{s.lastPing}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
