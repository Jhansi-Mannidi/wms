"use client"
import { Thermometer, AlertTriangle, BarChart2, TrendingDown } from "lucide-react"

const hourlyTemps = [2.1,2.3,2.2,2.4,2.6,3.1,2.8,2.5,2.3,2.4,2.2,2.1,2.3,2.5,2.4,2.2,2.3,2.1,2.0,2.2,2.3,2.4,2.2,2.1]
const maxT = Math.max(...hourlyTemps), minT = Math.min(...hourlyTemps)

export default function ColdChainAnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Cold Chain Analytics</h1><p className="text-sm text-muted-foreground mt-1">Temperature trends, breach frequency and zone performance</p></div>
      <div className="grid grid-cols-4 gap-4">
        {[
          {label:"Avg Temp (Cold A)",value:"2.3°C",icon:<Thermometer className="w-5 h-5 text-brand"/>,sub:"target: 2–4°C"},
          {label:"Breaches This Month",value:"5",icon:<AlertTriangle className="w-5 h-5 text-amber-500"/>,sub:"vs 8 last month"},
          {label:"Compliance Score",value:"93%",icon:<BarChart2 className="w-5 h-5 text-success"/>,sub:"across all zones"},
          {label:"Avg Breach Duration",value:"9.6 min",icon:<TrendingDown className="w-5 h-5 text-success"/>,sub:"↓ from 14.2 min"},
        ].map(s=>(
          <div key={s.label} className="bg-card border border-border rounded-xl p-4"><div className="mb-2">{s.icon}</div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.sub}</p></div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="font-semibold text-sm text-foreground mb-4">Cold Room A — 24h Temperature (°C)</p>
        <div className="flex items-end gap-1 h-32">
          {hourlyTemps.map((t,i)=>(
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div className={`w-full rounded-t-sm ${t>3?"bg-amber-400":t<1.5?"bg-brand/40":"bg-brand/70"}`} style={{height:`${((t-minT+0.5)/(maxT-minT+1))*100}px`}} />
              {i%6===0&&<span className="text-[9px] text-muted-foreground">{i}h</span>}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">Safe range: 2–4°C &bull; Orange = above threshold</p>
      </div>
    </div>
  )
}
