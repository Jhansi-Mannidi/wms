"use client"
import { useState } from "react"
import { Truck, Clock, BarChart2, TrendingDown, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Drawer } from "@/components/ui/modal"
import { DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type DayStat = { day: string; entries: number; exits: number; avgDwell: number }

const dayData: DayStat[] = [
  { day:"Mon", entries:28, exits:26, avgDwell:52 },
  { day:"Tue", entries:34, exits:33, avgDwell:48 },
  { day:"Wed", entries:41, exits:40, avgDwell:55 },
  { day:"Thu", entries:38, exits:37, avgDwell:51 },
  { day:"Fri", entries:45, exits:43, avgDwell:62 },
  { day:"Sat", entries:22, exits:22, avgDwell:44 },
]

const lastWeekData: DayStat[] = [
  { day:"Mon", entries:24, exits:24, avgDwell:58 },
  { day:"Tue", entries:30, exits:29, avgDwell:61 },
  { day:"Wed", entries:36, exits:35, avgDwell:57 },
  { day:"Thu", entries:33, exits:32, avgDwell:63 },
  { day:"Fri", entries:39, exits:38, avgDwell:70 },
  { day:"Sat", entries:19, exits:19, avgDwell:49 },
]

const RANGES = ["This Week", "Last Week"] as const
const TOTAL_DOCKS = 6

export default function GateAnalyticsPage() {
  const [range, setRange] = useState<(typeof RANGES)[number]>("This Week")
  const [detail, setDetail] = useState<DayStat | null>(null)

  const data = range === "This Week" ? dayData : lastWeekData
  const compare = range === "This Week" ? lastWeekData : dayData
  const max = Math.max(...data.map((d) => d.entries))

  const totalMovements = data.reduce((s, d) => s + d.entries + d.exits, 0)
  const avgDwell = Math.round(data.reduce((s, d) => s + d.avgDwell, 0) / data.length)
  const compareDwell = Math.round(compare.reduce((s, d) => s + d.avgDwell, 0) / compare.length)
  const dwellDelta = avgDwell - compareDwell
  const busiest = data.reduce((a, b) => (b.entries > a.entries ? b : a))
  const activeDocks = Math.min(TOTAL_DOCKS, Math.round(busiest.entries / 10))
  const utilisation = Math.round((activeDocks / TOTAL_DOCKS) * 100)

  const stats = [
    { label:"Vehicle Movements", value:String(totalMovements), icon:<Truck className="w-5 h-5 text-brand"/>, sub:"entries + exits" },
    { label:"Avg Dwell Time", value:`${avgDwell} min`, icon:<Clock className="w-5 h-5 text-brand"/>, sub:"per vehicle" },
    { label:"Dock Utilisation", value:`${utilisation}%`, icon:<BarChart2 className="w-5 h-5 text-brand"/>, sub:`${activeDocks} of ${TOTAL_DOCKS} docks active` },
    { label:"Turnaround", value:`${dwellDelta <= 0 ? "↓" : "↑"} ${Math.abs(dwellDelta)} min`, icon:<TrendingDown className={cn("w-5 h-5", dwellDelta <= 0 ? "text-success" : "text-danger")}/>, sub:`vs ${range === "This Week" ? "last week" : "this week"} avg` },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold text-foreground">Gate Analytics</h1><p className="text-sm text-muted-foreground mt-1">Vehicle movement trends, dwell times and dock utilisation</p></div>
        <div className="flex items-center gap-2">
          <ExportButton data={data} filename={`gate-analytics-${range.toLowerCase().replace(/\s+/g, "-")}`} />
          <button
            onClick={() => notify.info("Analytics refreshed", `${range} gate metrics recalculated from ${data.length} days of movement data.`)}
            title="Recalculate metrics"
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", range === r ? "bg-brand text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground")}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map(s=>(
          <div key={s.label} className="bg-card border border-border rounded-xl p-3"><div className="mb-2">{s.icon}</div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.sub}</p></div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="font-semibold text-sm text-foreground mb-4">Weekly Vehicle Movements — {range}</p>
        <div className="flex items-end gap-4 h-36">
          {data.map(d=>(
            <button key={d.day} onClick={() => setDetail(d)} title={`View ${d.day} breakdown`} className="flex-1 flex flex-col items-center gap-1 rounded-lg hover:bg-muted/40 transition-colors">
              <span className="text-[10px] text-muted-foreground">{d.entries}</span>
              <div className="w-full flex gap-0.5 items-end">
                <div className="flex-1 bg-brand/70 rounded-t-sm" style={{height:`${(d.entries/max)*120}px`}} />
                <div className="flex-1 bg-success/60 rounded-t-sm" style={{height:`${(d.exits/max)*120}px`}} />
              </div>
              <span className="text-[10px] text-muted-foreground">{d.day}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-brand/70" /> Entries</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-success/60" /> Exits</span>
        </div>
      </div>

      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail ? `${detail.day} — ${range}` : ""}
        description="Daily gate movement breakdown"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Close</button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Day" value={detail.day} />
            <DetailRow label="Entries" value={detail.entries} />
            <DetailRow label="Exits" value={detail.exits} />
            <DetailRow label="Still On Site" value={detail.entries - detail.exits} />
            <DetailRow label="Avg Dwell" value={`${detail.avgDwell} min`} />
            <DetailRow label="Total Movements" value={detail.entries + detail.exits} />
            <DetailRow label="Share of Week" value={`${Math.round(((detail.entries + detail.exits) / totalMovements) * 100)}%`} />
          </div>
        )}
      </Drawer>
    </div>
  )
}
