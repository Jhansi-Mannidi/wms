"use client"
import { ShoppingCart, Clock, CheckCircle2, AlertTriangle } from "lucide-react"

const orderStats = [
  { day: "Mon", received: 142, dispatched: 138, slaBreached: 4 },
  { day: "Tue", received: 168, dispatched: 162, slaBreached: 6 },
  { day: "Wed", received: 195, dispatched: 191, slaBreached: 4 },
  { day: "Thu", received: 178, dispatched: 172, slaBreached: 6 },
  { day: "Fri", received: 221, dispatched: 215, slaBreached: 6 },
  { day: "Sat", received: 134, dispatched: 130, slaBreached: 4 },
  { day: "Sun", received: 89, dispatched: 88, slaBreached: 1 },
]
const max = Math.max(...orderStats.map(d => d.received))

export default function AnalyticsOrdersPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Order Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Order volume, cycle times and fulfilment trends</p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Orders Today", value: "221", icon: <ShoppingCart className="w-5 h-5 text-brand" />, sub: "+15% vs yesterday" },
          { label: "Avg Cycle Time", value: "4.2 hrs", icon: <Clock className="w-5 h-5 text-brand" />, sub: "from receipt to dispatch" },
          { label: "Fulfilment Rate", value: "98.4%", icon: <CheckCircle2 className="w-5 h-5 text-success" />, sub: "last 30 days" },
          { label: "SLA Breaches", value: "31", icon: <AlertTriangle className="w-5 h-5 text-danger" />, sub: "this week" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">{s.icon}</div>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="font-semibold text-sm text-foreground mb-4">7-Day Order Volume</p>
        <div className="flex items-end gap-3 h-40">
          {orderStats.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground">{d.received}</span>
              <div className="w-full flex gap-0.5 items-end">
                <div className="flex-1 bg-brand/80 rounded-t-sm" style={{ height: `${(d.received / max) * 120}px` }} />
                <div className="flex-1 bg-success/70 rounded-t-sm" style={{ height: `${(d.dispatched / max) * 120}px` }} />
              </div>
              <span className="text-[10px] text-muted-foreground">{d.day}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-brand/80 block" /> Received</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-success/70 block" /> Dispatched</span>
        </div>
      </div>
    </div>
  )
}
