"use client"

import { useState } from "react"
import { Plus, Package, Users, TrendingUp, ArrowUp, ArrowDown, Building2, Clock, IndianRupee } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const recentActivity = [
  { type: "drop-off", customer: "Ravi Textiles", pieces: 24, time: "12m ago", space: "Own", customerInit: "RT", customerColor: "bg-blue-500" },
  { type: "release", customer: "Priya Exports", pieces: 6, time: "45m ago", space: "Leased-In", customerInit: "PE", customerColor: "bg-emerald-500" },
  { type: "drop-off", customer: "Sharma & Co.", pieces: 12, time: "1.5h ago", space: "Own", customerInit: "SC", customerColor: "bg-amber-500" },
  { type: "drop-off", customer: "Buildmart Pvt.", pieces: 40, time: "3h ago", space: "Leased-In", customerInit: "BM", customerColor: "bg-violet-500" },
  { type: "release", customer: "Ravi Textiles", pieces: 8, time: "4h ago", space: "Own", customerInit: "RT", customerColor: "bg-blue-500" },
]

const kpis = [
  { label: "Occupancy — Own", value: "74%", sub: "370 / 500 sqft", color: "text-brand", bar: 74, barColor: "bg-brand" },
  { label: "Occupancy — Leased-In", value: "61%", sub: "305 / 500 sqft · ₹4,200/mo cost", color: "text-orange-400", bar: 61, barColor: "bg-orange-400" },
  { label: "Active Customers", value: "18", sub: "3 new this month", color: "text-success", bar: null, barColor: "" },
  { label: "Pieces In Today", value: "76", sub: "+12 vs yesterday", color: "text-blue-400", bar: null, barColor: "" },
  { label: "Pieces Out Today", value: "32", sub: "-5 vs yesterday", color: "text-amber-400", bar: null, barColor: "" },
  { label: "Revenue MTD", value: "₹1.24L", sub: "Margin: ₹28,500", color: "text-success", bar: null, barColor: "" },
]

export default function StorageSaaSPage() {
  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {kpis.map(k => (
          <div key={k.label} className="flex flex-col gap-2 p-4 rounded-xl border border-border bg-card">
            <span className="text-[11px] text-muted-foreground leading-tight">{k.label}</span>
            <p className={cn("text-xl font-bold", k.color)}>{k.value}</p>
            {k.bar !== null && (
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className={cn("h-full rounded-full", k.barColor)} style={{ width: `${k.bar}%` }} />
              </div>
            )}
            <p className="text-[10px] text-muted-foreground leading-tight">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Space health strip */}
      <div className="mb-6 p-5 rounded-xl border border-border bg-card">
        <h2 className="text-sm font-bold text-foreground mb-4">Space Health</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { label: "Own Space", used: 370, free: 130, total: 500, color: "bg-brand", textColor: "text-brand", border: "border-brand/30", bg: "bg-brand/5" },
            { label: "Leased-In Space", used: 305, free: 195, total: 500, color: "bg-orange-400", textColor: "text-orange-400", border: "border-orange-400/30", bg: "bg-orange-400/5", margin: "₹4,200/mo" },
          ].map(s => (
            <div key={s.label} className={cn("p-4 rounded-xl border", s.border, s.bg)}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-foreground">{s.label}</span>
                {s.margin && <span className="text-[11px] text-orange-400 font-semibold">Cost: {s.margin}</span>}
              </div>
              <div className="h-4 rounded-full bg-muted/40 overflow-hidden mb-2">
                <div className={cn("h-full rounded-full", s.color)} style={{ width: `${(s.used / s.total) * 100}%` }} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span><span className={cn("font-bold", s.textColor)}>{s.used} sqft</span> used</span>
                <span><span className="font-semibold text-foreground">{s.free} sqft</span> free</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quick actions */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-foreground">Quick Actions</h2>
          <Link href="/storage-saas/drop-off">
            <button className="w-full flex items-center gap-3 px-4 py-4 rounded-xl bg-[#F7941D] text-white font-semibold text-sm hover:bg-[#F7941D]/90 transition-colors">
              <Plus className="w-5 h-5" />
              <div className="text-left">
                <p>New Drop-Off</p>
                <p className="text-[11px] font-normal opacity-80">Record customer goods intake</p>
              </div>
            </button>
          </Link>
          <Link href="/storage-saas/stock">
            <button className="w-full flex items-center gap-3 px-4 py-4 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-muted transition-colors">
              <ArrowUp className="w-5 h-5 text-success" />
              <div className="text-left">
                <p>New Release</p>
                <p className="text-[11px] font-normal text-muted-foreground">Dispatch customer goods</p>
              </div>
            </button>
          </Link>
          <Link href="/storage-saas/space">
            <button className="w-full flex items-center gap-3 px-4 py-4 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-muted transition-colors">
              <Building2 className="w-5 h-5 text-brand" />
              <div className="text-left">
                <p>Manage Spaces</p>
                <p className="text-[11px] font-normal text-muted-foreground">Sub-lease & allocation</p>
              </div>
            </button>
          </Link>
        </div>

        {/* Recent activity feed */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-bold text-foreground mb-3">Recent Activity</h2>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {recentActivity.map((a, i) => (
              <div key={i} className={cn("px-4 py-3 flex items-center gap-3 hover:bg-muted/20 transition-colors", i < recentActivity.length - 1 ? "border-b border-border/50" : "")}>
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0", a.customerColor)}>{a.customerInit}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">{a.customer}</span>
                    <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                      a.type === "drop-off" ? "bg-brand/15 text-brand" : "bg-success/15 text-success"
                    )}>
                      {a.type === "drop-off" ? "Drop-Off" : "Release"}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-auto">{a.space}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{a.pieces} pieces · {a.time}</p>
                </div>
                {a.type === "drop-off"
                  ? <ArrowDown className="w-4 h-4 text-brand shrink-0" />
                  : <ArrowUp className="w-4 h-4 text-success shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
