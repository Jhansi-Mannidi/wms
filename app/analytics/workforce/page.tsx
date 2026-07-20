"use client"
import { useState } from "react"
import { Users, Clock, TrendingUp, Award, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { Drawer } from "@/components/ui/modal"
import { DetailRow } from "@/components/ui/form"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Worker = {
  name: string; role: string; tasks: number
  accuracy: number; hrs: number; efficiency: number
}

const workers: Worker[] = [
  { name: "Ravi Kumar", role: "Picker", tasks: 24, accuracy: 98, hrs: 8.0, efficiency: 94 },
  { name: "Priya Sharma", role: "Packer", tasks: 18, accuracy: 100, hrs: 8.0, efficiency: 100 },
  { name: "Suresh Yadav", role: "Forklift Op", tasks: 12, accuracy: 92, hrs: 6.5, efficiency: 78 },
  { name: "Meena Patel", role: "QC Inspector", tasks: 30, accuracy: 99, hrs: 8.0, efficiency: 96 },
  { name: "Arjun Nair", role: "Picker", tasks: 20, accuracy: 95, hrs: 8.0, efficiency: 88 },
  { name: "Kavitha Rao", role: "Supervisor", tasks: 8, accuracy: 100, hrs: 9.0, efficiency: 92 },
]

/** "Priya Sharma" -> "Priya S." */
function shortName(name: string) {
  const [first, last] = name.split(" ")
  return last ? `${first} ${last[0]}.` : first
}

export default function AnalyticsWorkforcePage() {
  const [detail, setDetail] = useState<Worker | null>(null)

  const avgEfficiency = Math.round(workers.reduce((s, w) => s + w.efficiency, 0) / workers.length)
  const avgHrs = workers.reduce((s, w) => s + w.hrs, 0) / workers.length
  const topPerformer = workers.reduce((a, b) => (b.efficiency > a.efficiency ? b : a))
  const totalTasks = workers.reduce((s, w) => s + w.tasks, 0)

  const stats = [
    { label: "Active Workers", value: workers.length.toString(), icon: <Users className="w-5 h-5 text-brand" />, sub: `${totalTasks} tasks today` },
    { label: "Avg Efficiency", value: `${avgEfficiency}%`, icon: <TrendingUp className="w-5 h-5 text-success" />, sub: "vs 88% last week" },
    { label: "Avg Hrs Today", value: `${avgHrs.toFixed(1)} hrs`, icon: <Clock className="w-5 h-5 text-brand" />, sub: "per worker" },
    { label: "Top Performer", value: shortName(topPerformer.name), icon: <Award className="w-5 h-5 text-amber-500" />, sub: `${topPerformer.accuracy}% accuracy` },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Workforce Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Productivity, attendance and efficiency metrics</p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
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
            <tr>{["Name","Role","Tasks","Accuracy","Hours","Efficiency","Actions"].map(h => <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
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
                <td className="px-4 py-3">
                  <button onClick={() => setDetail(w)} title={`View ${w.name} performance`} className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
            {workers.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No workers clocked in today.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.name ?? ""}
        description="Worker performance detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Close</button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Name" value={detail.name} />
            <DetailRow label="Role" value={detail.role} />
            <DetailRow label="Tasks Completed" value={detail.tasks} />
            <DetailRow label="Accuracy" value={`${detail.accuracy}%`} />
            <DetailRow label="Hours Worked" value={`${detail.hrs}h`} />
            <DetailRow label="Efficiency" value={`${detail.efficiency}%`} />
            <DetailRow label="Tasks per Hour" value={(detail.tasks / detail.hrs).toFixed(1)} />
            <DetailRow label="vs Team Average" value={`${detail.efficiency - avgEfficiency >= 0 ? "+" : ""}${detail.efficiency - avgEfficiency} pts`} />
          </div>
        )}
      </Drawer>
    </div>
  )
}
