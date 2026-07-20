"use client"
import { Users, Clock, TrendingUp, Award } from "lucide-react"
import { cn } from "@/lib/utils"

const workers = [
  { name: "Ravi Kumar", role: "Picker", tasks: 24, accuracy: 98, hrs: 8.0, efficiency: 94 },
  { name: "Priya Sharma", role: "Packer", tasks: 18, accuracy: 100, hrs: 8.0, efficiency: 100 },
  { name: "Suresh Yadav", role: "Forklift Op", tasks: 12, accuracy: 92, hrs: 6.5, efficiency: 78 },
  { name: "Meena Patel", role: "QC Inspector", tasks: 30, accuracy: 99, hrs: 8.0, efficiency: 96 },
  { name: "Arjun Nair", role: "Picker", tasks: 20, accuracy: 95, hrs: 8.0, efficiency: 88 },
  { name: "Kavitha Rao", role: "Supervisor", tasks: 8, accuracy: 100, hrs: 9.0, efficiency: 92 },
]

export default function AnalyticsWorkforcePage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Workforce Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Productivity, attendance and efficiency metrics</p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Active Workers", value: "45", icon: <Users className="w-5 h-5 text-brand" />, sub: "on floor now" },
          { label: "Avg Efficiency", value: "91%", icon: <TrendingUp className="w-5 h-5 text-success" />, sub: "vs 88% last week" },
          { label: "Avg Hrs Today", value: "7.8 hrs", icon: <Clock className="w-5 h-5 text-brand" />, sub: "per worker" },
          { label: "Top Performer", value: "Priya S.", icon: <Award className="w-5 h-5 text-amber-500" />, sub: "100% accuracy" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">{s.icon}</div>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border"><p className="font-semibold text-sm text-foreground">Worker Performance Today</p></div>
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>{["Name","Role","Tasks","Accuracy","Hours","Efficiency"].map(h => <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {workers.map((w) => (
              <tr key={w.name} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{w.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{w.role}</td>
                <td className="px-4 py-3 text-muted-foreground">{w.tasks}</td>
                <td className="px-4 py-3">
                  <span className={cn("text-xs font-medium", w.accuracy >= 99 ? "text-success" : w.accuracy >= 95 ? "text-brand" : "text-amber-500")}>{w.accuracy}%</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{w.hrs}h</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-muted rounded-full h-1.5"><div className="bg-brand h-1.5 rounded-full" style={{ width: `${w.efficiency}%` }} /></div>
                    <span className="text-xs text-muted-foreground">{w.efficiency}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
