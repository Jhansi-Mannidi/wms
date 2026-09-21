"use client"
import { useState } from "react"
import { Thermometer, AlertTriangle, BarChart2, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

const hourlyTemps = [2.1,2.3,2.2,2.4,2.6,3.1,2.8,2.5,2.3,2.4,2.2,2.1,2.3,2.5,2.4,2.2,2.3,2.1,2.0,2.2,2.3,2.4,2.2,2.1]

// Additional zones charted by the zone selector.
const zoneSeries: Record<string, { temps: number[]; safe: string; high: number; breaches: number }> = {
  "Cold Room A": { temps: hourlyTemps, safe: "2–4°C", high: 3, breaches: 2 },
  "Cold Room B": { temps: [4.8,5.1,5.4,6.2,6.8,6.5,5.9,5.4,5.1,4.9,4.8,5.0,5.2,5.5,5.8,5.6,5.3,5.1,4.9,4.8,5.0,5.2,5.1,4.9], safe: "4–6°C", high: 6, breaches: 2 },
  "Freezer Zone": { temps: [-19.2,-19.4,-19.1,-18.8,-18.5,-17.8,-18.2,-18.9,-19.3,-19.5,-19.4,-19.2,-19.0,-18.7,-18.9,-19.1,-19.3,-19.4,-19.5,-19.3,-19.2,-19.0,-19.1,-19.3], safe: "-18 to -22°C", high: -18, breaches: 1 },
}

const ZONES = Object.keys(zoneSeries)

export default function ColdChainAnalyticsPage() {
  const [zone, setZone] = useState(ZONES[0])
  const series = zoneSeries[zone]
  const temps = series.temps
  const maxT = Math.max(...temps), minT = Math.min(...temps)

  const avgTemp = (temps.reduce((s, t) => s + t, 0) / temps.length).toFixed(1)
  const totalBreaches = Object.values(zoneSeries).reduce((s, z) => s + z.breaches, 0)
  const hoursAboveThreshold = temps.filter((t) => t > series.high).length

  const stats = [
    { label: `Avg Temp (${zone})`, value: `${avgTemp}°C`, icon: <Thermometer className="w-5 h-5 text-brand" />, sub: `target: ${series.safe}` },
    { label: "Breaches This Month", value: totalBreaches.toString(), sub: "vs 8 last month", icon: <AlertTriangle className="w-5 h-5 text-amber-500" /> },
    { label: "Hours Above Threshold", value: `${hoursAboveThreshold}h`, sub: `in ${zone}, last 24h`, icon: <BarChart2 className="w-5 h-5 text-success" /> },
    { label: "Avg Breach Duration", value: "9.6 min", sub: "↓ from 14.2 min", icon: <TrendingDown className="w-5 h-5 text-success" /> },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold text-foreground">Cold Chain Analytics</h1><p className="text-sm text-muted-foreground mt-1">Temperature trends, breach frequency and zone performance</p></div>
        <div className="flex gap-1 p-1 rounded-xl bg-muted/50 w-fit">
          {ZONES.map((z) => (
            <button
              key={z}
              onClick={() => setZone(z)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap", zone === z ? "bg-brand text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/60")}
            >
              {z}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {stats.map(s=>(
          <div key={s.label} className="bg-card border border-border rounded-xl p-4"><div className="mb-2">{s.icon}</div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.sub}</p></div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="font-semibold text-sm text-foreground mb-4">{zone} — 24h Temperature (°C)</p>
        <div className="flex items-end gap-1 h-32">
          {temps.map((t,i)=>(
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5" title={`${i}:00 — ${t}°C`}>
              <div className={`w-full rounded-t-sm ${t>series.high?"bg-amber-400":"bg-brand/70"}`} style={{height:`${((t-minT+0.5)/(maxT-minT+1))*100}px`}} />
              {i%6===0&&<span className="text-[9px] text-muted-foreground">{i}h</span>}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">Safe range: {series.safe} &bull; Orange = above threshold</p>
      </div>
    </div>
  )
}
