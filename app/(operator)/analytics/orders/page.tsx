"use client"
import { useState } from "react"
import { ShoppingCart, Clock, CheckCircle2, AlertTriangle } from "lucide-react"
import { Drawer } from "@/components/ui/modal"
import { DetailRow } from "@/components/ui/form"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type OrderDay = { day: string; received: number; dispatched: number; slaBreached: number }

const orderStats: OrderDay[] = [
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
  const [detail, setDetail] = useState<OrderDay | null>(null)

  const totalReceived = orderStats.reduce((s, d) => s + d.received, 0)
  const totalDispatched = orderStats.reduce((s, d) => s + d.dispatched, 0)
  const totalBreaches = orderStats.reduce((s, d) => s + d.slaBreached, 0)
  const busiest = orderStats.reduce((a, b) => (b.received > a.received ? b : a))
  const fulfilmentRate = ((totalDispatched / totalReceived) * 100).toFixed(1)

  const stats = [
    { label: "Peak Day Orders", value: busiest.received.toString(), icon: <ShoppingCart className="w-5 h-5 text-brand" />, sub: `${busiest.day} was busiest` },
    { label: "Avg Cycle Time", value: "4.2 hrs", icon: <Clock className="w-5 h-5 text-brand" />, sub: "from receipt to dispatch" },
    { label: "Fulfilment Rate", value: `${fulfilmentRate}%`, icon: <CheckCircle2 className="w-5 h-5 text-success" />, sub: `${totalDispatched.toLocaleString()} of ${totalReceived.toLocaleString()} orders` },
    { label: "SLA Breaches", value: totalBreaches.toString(), icon: <AlertTriangle className="w-5 h-5 text-danger" />, sub: "this week" },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Order Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Order volume, cycle times and fulfilment trends</p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3">
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
            <button
              key={d.day}
              onClick={() => setDetail(d)}
              title={`View ${d.day} order breakdown`}
              className="flex-1 flex flex-col items-center gap-1 rounded-lg hover:bg-muted/40 transition-colors"
            >
              <span className="text-[10px] text-muted-foreground">{d.received}</span>
              <div className="w-full flex gap-0.5 items-end">
                <div className="flex-1 bg-brand/80 rounded-t-sm" style={{ height: `${(d.received / max) * 120}px` }} />
                <div className="flex-1 bg-success/70 rounded-t-sm" style={{ height: `${(d.dispatched / max) * 120}px` }} />
              </div>
              <span className="text-[10px] text-muted-foreground">{d.day}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-brand/80 block" /> Received</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-success/70 block" /> Dispatched</span>
        </div>
      </div>

      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail ? `${detail.day} — Order Breakdown` : ""}
        description="Daily order detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Close</button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Day" value={detail.day} />
            <DetailRow label="Orders Received" value={detail.received.toLocaleString()} />
            <DetailRow label="Orders Dispatched" value={detail.dispatched.toLocaleString()} />
            <DetailRow label="Backlog" value={`${detail.received - detail.dispatched} orders`} />
            <DetailRow label="SLA Breaches" value={<span className={detail.slaBreached > 4 ? "text-danger font-semibold" : "text-foreground"}>{detail.slaBreached}</span>} />
            <DetailRow label="Fulfilment Rate" value={`${((detail.dispatched / detail.received) * 100).toFixed(1)}%`} />
            <DetailRow label="Share of Week" value={`${Math.round((detail.received / totalReceived) * 100)}%`} />
          </div>
        )}
      </Drawer>
    </div>
  )
}
