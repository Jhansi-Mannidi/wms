"use client"
import { AlertTriangle, Thermometer, Clock } from "lucide-react"

const breaches = [
  { id:"BR-001", zone:"Loading Bay", sensor:"SEN-007", type:"High Temp", reading:"14.2°C", threshold:"10°C", duration:"12 min", detected:"2025-07-19 11:32", resolved:false },
  { id:"BR-002", zone:"Cold Room B", sensor:"SEN-003", type:"High Temp", reading:"6.8°C", threshold:"5°C", duration:"5 min", detected:"2025-07-19 09:15", resolved:false },
  { id:"BR-003", zone:"Freezer Zone", sensor:"SEN-005", type:"Temp Rise", reading:"-17.8°C", threshold:"-18°C", duration:"8 min", detected:"2025-07-18 22:42", resolved:true },
  { id:"BR-004", zone:"Cold Room A", sensor:"SEN-001", type:"Door Open", reading:"8.1°C", threshold:"4°C", duration:"3 min", detected:"2025-07-18 14:10", resolved:true },
  { id:"BR-005", zone:"Chiller Zone", sensor:"SEN-006", type:"High Humid", reading:"82%", threshold:"75%", duration:"20 min", detected:"2025-07-17 16:55", resolved:true },
]

export default function ColdChainBreachesPage() {
  const active = breaches.filter(b => !b.resolved)
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
          <thead className="bg-muted/50"><tr>{["Breach ID","Zone","Sensor","Type","Reading","Threshold","Duration","Detected","Status"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
