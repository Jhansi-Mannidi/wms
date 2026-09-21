"use client"
import { useState } from "react"
import { BarChart2, Target, Award, Clock, Package, Truck, DollarSign, Users } from "lucide-react"
import { Drawer } from "@/components/ui/modal"
import { DetailRow } from "@/components/ui/form"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Kpi = {
  name: string; value: string; target: string; trend: string
  status: string; icon: React.ReactNode
}

const kpis: Kpi[] = [
  { name: "Order Fulfilment Rate", value: "98.4%", target: "99%", trend: "+0.3%", status: "good", icon: <Target className="w-5 h-5" /> },
  { name: "Pick Accuracy", value: "99.2%", target: "99.5%", trend: "+0.1%", status: "good", icon: <Award className="w-5 h-5" /> },
  { name: "On-Time Dispatch", value: "94.7%", target: "96%", trend: "-0.5%", status: "warn", icon: <Truck className="w-5 h-5" /> },
  { name: "Inventory Accuracy", value: "99.8%", target: "99.9%", trend: "+0.2%", status: "good", icon: <Package className="w-5 h-5" /> },
  { name: "Avg Processing Time", value: "4.2 hrs", target: "4 hrs", trend: "+0.1 hrs", status: "warn", icon: <Clock className="w-5 h-5" /> },
  { name: "Cost Per Order", value: "₹38.50", target: "₹40", trend: "-₹1.20", status: "good", icon: <DollarSign className="w-5 h-5" /> },
  { name: "Labour Utilisation", value: "82%", target: "85%", trend: "+2%", status: "warn", icon: <Users className="w-5 h-5" /> },
  { name: "Storage Utilisation", value: "87%", target: "90%", trend: "+1%", status: "good", icon: <BarChart2 className="w-5 h-5" /> },
]

export default function KPIsPage() {
  const [detail, setDetail] = useState<Kpi | null>(null)

  const onTrack = kpis.filter((k) => k.status === "good").length

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">KPI Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Key performance indicators vs targets — {onTrack} of {kpis.length} on track
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <button key={k.name} onClick={() => setDetail(k)} title={`View ${k.name} detail`} className="text-left bg-card border border-border rounded-xl p-4 space-y-3 hover:border-brand/40 hover:shadow-sm transition-all">
            <div className="flex items-start justify-between">
              <div className={k.status === "good" ? "text-brand" : "text-amber-500"}>{k.icon}</div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${k.status === "good" ? "bg-success/10 text-success" : "bg-amber-50 text-amber-600"}`}>
                {k.status === "good" ? "On Track" : "Below Target"}
              </span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{k.name}</p>
              <p className="text-2xl font-bold text-foreground mt-0.5">{k.value}</p>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Target: {k.target}</span>
              <span className={`flex items-center gap-0.5 font-medium ${k.trend.startsWith("+") && !k.name.includes("Time") ? "text-success" : k.trend.startsWith("-") && k.name.includes("Cost") ? "text-success" : "text-amber-500"}`}>
                {k.trend}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div className={`h-1.5 rounded-full ${k.status === "good" ? "bg-brand" : "bg-amber-400"}`} style={{ width: k.status === "good" ? "92%" : "78%" }} />
            </div>
          </button>
        ))}
      </div>

      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.name ?? ""}
        description="KPI detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Close</button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Indicator" value={detail.name} />
            <DetailRow label="Current Value" value={<span className="font-bold">{detail.value}</span>} />
            <DetailRow label="Target" value={detail.target} />
            <DetailRow label="Trend vs Last Period" value={detail.trend} />
            <DetailRow label="Progress to Target" value={detail.status === "good" ? "92%" : "78%"} />
            <DetailRow
              label="Status"
              value={
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${detail.status === "good" ? "bg-success/10 text-success" : "bg-amber-50 text-amber-600"}`}>
                  {detail.status === "good" ? "On Track" : "Below Target"}
                </span>
              }
            />
          </div>
        )}
      </Drawer>
    </div>
  )
}
