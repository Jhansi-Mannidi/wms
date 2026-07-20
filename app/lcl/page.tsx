"use client"

import { useState } from "react"
import { Plus, Clock, Package, AlertTriangle, BarChart2, ArrowRight, TrendingUp, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const consolidations = [
  { id: "CON-001", route: "INBOM → CNSHA", mode: "FCL 20'", cutoff: "8h", cbmUsed: 16.4, cbmMax: 25, kgUsed: 8200, kgMax: 18000, status: "Building" },
  { id: "CON-002", route: "INBOM → SGSIN", mode: "LCL", cutoff: "23h", cbmUsed: 8.1, cbmMax: 15, kgUsed: 3400, kgMax: 10000, status: "Building" },
  { id: "CON-003", route: "INMAA → AEDXB", mode: "LCL", cutoff: "2d", cbmUsed: 5.2, cbmMax: 15, kgUsed: 2100, kgMax: 10000, status: "Building" },
  { id: "CON-004", route: "INBOM → USNYC", mode: "FCL 40'", cutoff: "5d", cbmUsed: 42, cbmMax: 67, kgUsed: 21000, kgMax: 27000, status: "Building" },
]

const recentReceipts = [
  { id: "CR-0891", shipper: "Apex Pharma", cbm: 2.4, pieces: 18, status: "Received", time: "12m ago" },
  { id: "CR-0892", shipper: "GlobalTex", cbm: 5.6, pieces: 40, status: "In-CFS", time: "45m ago" },
  { id: "CR-0893", shipper: "MediSupply", cbm: 1.2, pieces: 8, status: "Received", time: "1h ago" },
  { id: "CR-0894", shipper: "AutoParts India", cbm: 8.3, pieces: 62, status: "Pending ASN", time: "2h ago" },
]

const kpis = [
  { label: "Open Cargo Receipts", value: "9", sub: "Awaiting allocation", color: "text-brand", icon: <Package className="w-4 h-4" /> },
  { label: "Consolidations Building", value: "4", sub: "Active routes", color: "text-blue-400", icon: <BarChart2 className="w-4 h-4" /> },
  { label: "Cutoffs < 24h", value: "2", sub: "Urgent attention", color: "text-warning", icon: <AlertTriangle className="w-4 h-4" /> },
  { label: "Total CBM in CFS", value: "71.9", sub: "CBM", color: "text-success", icon: <TrendingUp className="w-4 h-4" /> },
  { label: "Avg Dwell Days", value: "3.4", sub: "Days in CFS", color: "text-muted-foreground", icon: <Clock className="w-4 h-4" /> },
]

function FillGauge({ used, max, label }: { used: number; max: number; label: string }) {
  const pct = Math.round((used / max) * 100)
  const color = pct > 90 ? "bg-danger" : pct > 75 ? "bg-warning" : "bg-success"
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{label}</span>
        <span className={cn("font-bold", pct > 90 ? "text-danger" : pct > 75 ? "text-warning" : "text-success")}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground">
        <span>{used} used</span>
        <span>{max} max</span>
      </div>
    </div>
  )
}

export default function LCLDashboardPage() {
  const [, setRefresh] = useState(0)

  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {kpis.map(k => (
          <div key={k.label} className="flex flex-col gap-2 p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{k.label}</span>
              <span className={k.color}>{k.icon}</span>
            </div>
            <p className={cn("text-2xl font-bold", k.color)}>{k.value}</p>
            <p className="text-[10px] text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link href="/lcl/cargo-receipts">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F7941D] text-white text-sm font-medium hover:bg-[#F7941D]/90 transition-colors">
            <Plus className="w-4 h-4" /> New Cargo Receipt
          </button>
        </Link>
        <Link href="/lcl/consolidation">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors">
            <Plus className="w-4 h-4" /> New Consolidation
          </button>
        </Link>
        <button onClick={() => setRefresh(r => r + 1)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Consolidations building */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-bold text-foreground">Consolidations Building</h2>
          {consolidations.map(c => {
            const cbmPct = Math.round((c.cbmUsed / c.cbmMax) * 100)
            const urgentCutoff = c.cutoff.includes("h") && parseInt(c.cutoff) < 24
            return (
              <div key={c.id} className={cn("p-5 rounded-xl border bg-card transition-all hover:border-brand/40", urgentCutoff ? "border-warning/40" : "border-border")}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{c.route}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand/15 text-brand">{c.mode}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{c.id}</span>
                    </div>
                  </div>
                  <div className={cn("flex items-center gap-1 text-xs font-semibold", urgentCutoff ? "text-warning" : "text-muted-foreground")}>
                    <Clock className="w-3.5 h-3.5" />
                    Cutoff: {c.cutoff}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FillGauge used={c.cbmUsed} max={c.cbmMax} label="CBM Fill" />
                  <FillGauge used={c.kgUsed} max={c.kgMax} label="Weight (kg) Fill" />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    {cbmPct}% full · {c.cbmMax - c.cbmUsed} CBM remaining
                  </span>
                  <Link href="/lcl/consolidation">
                    <button className="flex items-center gap-1 text-xs text-brand hover:underline font-medium">
                      Open Planner <ArrowRight className="w-3 h-3" />
                    </button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent cargo receipts */}
        <div>
          <h2 className="text-sm font-bold text-foreground mb-3">Recent Cargo Receipts</h2>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {recentReceipts.map((r, i) => (
              <div key={r.id} className={cn("px-4 py-3 flex items-center gap-3 hover:bg-muted/20 transition-colors", i < recentReceipts.length - 1 ? "border-b border-border/50" : "")}>
                <div className="w-8 h-8 rounded-lg bg-brand/15 flex items-center justify-center text-brand shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground font-mono">{r.id}</span>
                    <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                      r.status === "Received" ? "bg-success/15 text-success" :
                      r.status === "In-CFS" ? "bg-brand/15 text-brand" :
                      "bg-warning/15 text-warning"
                    )}>{r.status}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{r.shipper} · {r.cbm} CBM · {r.pieces} pcs</p>
                  <p className="text-[10px] text-muted-foreground/60">{r.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
