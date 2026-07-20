"use client"

import { useState } from "react"
import { Plus, AlertTriangle, CheckCircle2, Clock, Package, Truck, Plane, RotateCcw, ArrowRight, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const recentPackages = [
  { id: "PKG-0441", shipper: "Apex Pharma", consignee: "PharmaDist Mumbai", kg: 12.4, chargeable: 14.2, route: "Local", status: "Awaiting Routing" },
  { id: "PKG-0442", shipper: "GlobalTex", consignee: "Buyer Dubai", kg: 28.0, chargeable: 28.0, route: "Export", status: "In ULD" },
  { id: "PKG-0443", shipper: "Sunrise Elec.", consignee: "TechStore Pune", kg: 5.6, chargeable: 7.2, route: "Local", status: "Out-for-Delivery" },
  { id: "PKG-0444", shipper: "AutoParts India", consignee: "Workshop Nashik", kg: 18.3, chargeable: 18.3, route: "Local", status: "RTO" },
  { id: "PKG-0445", shipper: "MediSupply", consignee: "Pharma Riyadh", kg: 42.0, chargeable: 45.0, route: "Export", status: "Handed to Airline" },
]

const kpis = [
  { label: "Packages Received", sub: "Today", value: "34", color: "text-brand", icon: <Package className="w-5 h-5" /> },
  { label: "Awaiting Routing", sub: "Pending decision", value: "12", color: "text-warning", icon: <Clock className="w-5 h-5" /> },
  { label: "Out-for-Delivery", sub: "Local branch", value: "18", color: "text-blue-400", icon: <Truck className="w-5 h-5" /> },
  { label: "Awaiting Export", sub: "ULD building", value: "9", color: "text-amber-400", icon: <Plane className="w-5 h-5" /> },
  { label: "Exceptions", sub: "RTO / Reattempt", value: "3", color: "text-danger", icon: <AlertTriangle className="w-5 h-5" /> },
]

const localStats = { outForDelivery: 18, delivered: 42, rto: 3, reattempt: 1 }
const exportStats = { count: 9, uldBuilding: 2, handedOff: 5 }

const routeColors: Record<string, string> = {
  Local: "bg-blue-500/15 text-blue-400",
  Export: "bg-amber-500/15 text-amber-400",
}

const statusColors: Record<string, string> = {
  "Awaiting Routing": "bg-warning/15 text-warning",
  "Out-for-Delivery": "bg-blue-500/15 text-blue-400",
  "In ULD": "bg-amber-500/15 text-amber-400",
  "Handed to Airline": "bg-success/15 text-success",
  "Delivered": "bg-success/15 text-success",
  "RTO": "bg-danger/15 text-danger",
}

export default function AirHandlingDashboardPage() {
  const [, setRefresh] = useState(0)

  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {kpis.map(k => (
          <div key={k.label} className="flex flex-col gap-2 p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{k.label}</span>
              <span className={k.color}>{k.icon}</span>
            </div>
            <p className={cn("text-3xl font-bold", k.color)}>{k.value}</p>
            <p className="text-[10px] text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link href="/air-handling/capture">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F7941D] text-white text-sm font-medium hover:bg-[#F7941D]/90 transition-colors">
            <Plus className="w-4 h-4" /> New Package
          </button>
        </Link>
        <Link href="/air-handling/routing">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors">
            <ArrowRight className="w-4 h-4" /> Route Packages
          </button>
        </Link>
        <button onClick={() => setRefresh(r => r + 1)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Two-branch split strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Local Delivery Panel */}
        <div className="p-5 rounded-xl border border-blue-500/30 bg-blue-500/5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Local Delivery</h3>
              <p className="text-[11px] text-muted-foreground">Courier & last-mile</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Out-for-Delivery", value: localStats.outForDelivery, color: "text-blue-400" },
              { label: "Delivered Today", value: localStats.delivered, color: "text-success" },
              { label: "RTO", value: localStats.rto, color: "text-danger" },
              { label: "Reattempt", value: localStats.reattempt, color: "text-warning" },
            ].map(s => (
              <div key={s.label} className="p-2.5 rounded-lg bg-background/40 border border-blue-500/20">
                <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <Link href="/air-handling/courier">
            <button className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-blue-500/30 text-blue-400 text-xs font-semibold hover:bg-blue-500/10 transition-colors">
              Open Courier Console <ArrowRight className="w-3 h-3" />
            </button>
          </Link>
        </div>

        {/* Export Panel */}
        <div className="p-5 rounded-xl border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Export</h3>
              <p className="text-[11px] text-muted-foreground">ULD & airline handoff</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Packages", value: exportStats.count, color: "text-amber-400" },
              { label: "ULDs Building", value: exportStats.uldBuilding, color: "text-brand" },
              { label: "Handed Off", value: exportStats.handedOff, color: "text-success" },
            ].map(s => (
              <div key={s.label} className="p-2.5 rounded-lg bg-background/40 border border-amber-500/20">
                <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <Link href="/air-handling/uld">
            <button className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-amber-500/30 text-amber-400 text-xs font-semibold hover:bg-amber-500/10 transition-colors">
              Open ULD Builder <ArrowRight className="w-3 h-3" />
            </button>
          </Link>
        </div>
      </div>

      {/* Recent packages feed */}
      <div>
        <h2 className="text-sm font-bold text-foreground mb-3">Recent Packages</h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Package", "Shipper", "Consignee", "Chargeable Wt.", "Route", "Status"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentPackages.map((p, i) => (
                <tr key={p.id} className={cn("border-b border-border/50 hover:bg-muted/20 transition-colors", i % 2 === 0 ? "" : "bg-muted/5")}>
                  <td className="px-4 py-3 text-xs font-mono font-semibold text-brand">{p.id}</td>
                  <td className="px-4 py-3 text-xs text-foreground">{p.shipper}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.consignee}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold text-foreground">{p.chargeable} kg</span>
                    {p.chargeable > p.kg && <span className="ml-1 text-[10px] text-warning">(vol)</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", routeColors[p.route] ?? "bg-muted text-muted-foreground")}>{p.route}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", statusColors[p.status] ?? "bg-muted text-muted-foreground")}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
