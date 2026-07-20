"use client"
import { Truck, Clock, BarChart2, TrendingDown } from "lucide-react"

const dayData = [
  { day:"Mon", entries:28, exits:26, avgDwell:52 },
  { day:"Tue", entries:34, exits:33, avgDwell:48 },
  { day:"Wed", entries:41, exits:40, avgDwell:55 },
  { day:"Thu", entries:38, exits:37, avgDwell:51 },
  { day:"Fri", entries:45, exits:43, avgDwell:62 },
  { day:"Sat", entries:22, exits:22, avgDwell:44 },
]
const max = Math.max(...dayData.map(d => d.entries))

export default function GateAnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Gate Analytics</h1><p className="text-sm text-muted-foreground mt-1">Vehicle movement trends, dwell times and dock utilisation</p></div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:"Vehicles Today",value:"18",icon:<Truck className="w-5 h-5 text-brand"/>,sub:"entries + exits"},
          { label:"Avg Dwell Time",value:"52 min",icon:<Clock className="w-5 h-5 text-brand"/>,sub:"per vehicle"},
          { label:"Dock Utilisation",value:"67%",icon:<BarChart2 className="w-5 h-5 text-brand"/>,sub:"4 of 6 docks active"},
          { label:"Turnaround",value:"↓ 8 min",icon:<TrendingDown className="w-5 h-5 text-success"/>,sub:"vs last week avg"},
        ].map(s=>(
          <div key={s.label} className="bg-card border border-border rounded-xl p-4"><div className="mb-2">{s.icon}</div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.sub}</p></div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="font-semibold text-sm text-foreground mb-4">Weekly Vehicle Movements</p>
        <div className="flex items-end gap-4 h-36">
          {dayData.map(d=>(
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground">{d.entries}</span>
              <div className="w-full flex gap-0.5 items-end">
                <div className="flex-1 bg-brand/70 rounded-t-sm" style={{height:`${(d.entries/max)*120}px`}} />
                <div className="flex-1 bg-success/60 rounded-t-sm" style={{height:`${(d.exits/max)*120}px`}} />
              </div>
              <span className="text-[10px] text-muted-foreground">{d.day}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-brand/70" /> Entries</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-success/60" /> Exits</span>
        </div>
      </div>
    </div>
  )
}
