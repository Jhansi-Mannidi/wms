"use client"

import { TrendingUp, Package, Target, Building2, Users, Activity } from "lucide-react"

const stats = [
  { label: "Today's GRNs", value: "24", change: "+4", icon: <Package className="w-3.5 h-3.5" />, positive: true },
  { label: "Orders Shipped", value: "156", change: "+12", icon: <TrendingUp className="w-3.5 h-3.5" />, positive: true },
  { label: "Pick Accuracy", value: "99.2%", icon: <Target className="w-3.5 h-3.5" />, positive: true },
  { label: "Space Utilization", value: "87%", icon: <Building2 className="w-3.5 h-3.5" />, positive: true },
  { label: "Active Workers", value: "45", icon: <Users className="w-3.5 h-3.5" />, positive: true },
  { label: "System Status", value: "Online", icon: <Activity className="w-3.5 h-3.5" />, positive: true },
]

export function StatusBar() {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-40 h-10 flex items-center border-t border-sidebar-border overflow-x-auto"
      style={{ background: "var(--sidebar)" }}
    >
      <div className="flex items-center divide-x divide-border/50 min-w-max px-2">
        {stats.map((stat, i) => (
          <div key={i} className="flex items-center gap-1.5 px-4 py-1">
            <span className="text-sidebar-foreground/40">{stat.icon}</span>
            <span className="text-[11px] text-sidebar-foreground/50 hidden md:inline">{stat.label}</span>
            <span className="text-[11px] font-semibold text-sidebar-foreground">{stat.value}</span>
            {stat.change && (
              <span className="text-[10px] font-medium text-success">{stat.change}</span>
            )}
          </div>
        ))}
      </div>
      <div className="ml-auto px-4 flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        <span className="text-[10px] text-sidebar-foreground/40">Live</span>
      </div>
    </footer>
  )
}
