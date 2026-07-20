"use client"

import { useState } from "react"
import { Plus, Building2, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

const leasedSpaces = [
  { id: "LS001", name: "ColdStar Warehousing", area: "500 sqft", slots: 50, cost: 18000, term: "Jul–Dec 2026", used: 38, free: 12 },
  { id: "LS002", name: "EcoStore Logistics", area: "800 sqft", slots: 80, cost: 24000, term: "Jun–Nov 2026", used: 71, free: 9 },
]

const allocations = [
  { id: "A001", customer: "Priya Fashion Store", initials: "PF", color: "bg-emerald-500", source: "Own", area: "120 sqft", slots: 12, sellRate: 450, costRate: 280, margin: 38 },
  { id: "A002", customer: "TechGadgets Ltd", initials: "TG", color: "bg-violet-500", source: "ColdStar", area: "80 sqft", slots: 8, sellRate: 380, costRate: 300, margin: 21 },
  { id: "A003", customer: "Spice & Grain Co.", initials: "SG", color: "bg-amber-500", source: "Own", area: "200 sqft", slots: 20, sellRate: 420, costRate: 260, margin: 38 },
  { id: "A004", customer: "MedEquip Traders", initials: "ME", color: "bg-orange-500", source: "EcoStore", area: "100 sqft", slots: 10, sellRate: 360, costRate: 290, margin: 19 },
  { id: "A005", customer: "Rajesh Kumar", initials: "RK", color: "bg-blue-500", source: "Own", area: "60 sqft", slots: 6, sellRate: 400, costRate: 260, margin: 35 },
]

export default function SpaceManagerPage() {
  const [activeTab, setActiveTab] = useState<"own" | "leased" | "allocations">("allocations")

  const totalSell = allocations.reduce((s, a) => s + a.sellRate * a.slots, 0)
  const totalCost = leasedSpaces.reduce((s, l) => s + l.cost, 0)
  const netMargin = totalSell - totalCost

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Space & Sub-Lease Manager</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Own vs leased-in space · allocation · margin arbitrage</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-sm text-muted-foreground hover:text-foreground">
            <Plus className="w-4 h-4" /> Add Leased-In Space
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F7941D] text-white text-sm font-medium hover:bg-[#F7941D]/90">
            <Plus className="w-4 h-4" /> Allocate Space
          </button>
        </div>
      </div>

      {/* Portfolio summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-xs text-muted-foreground mb-1">Total Sell Revenue</p>
          <p className="text-2xl font-bold text-foreground">₹{(totalSell / 1000).toFixed(1)}K</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Monthly, from all allocations</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-xs text-muted-foreground mb-1">Leased-In Cost</p>
          <p className="text-2xl font-bold text-danger">₹{(totalCost / 1000).toFixed(1)}K</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Monthly payments</p>
        </div>
        <div className={cn("p-4 rounded-xl border", netMargin > 0 ? "border-success/30 bg-success/10" : "border-danger/30 bg-danger/10")}>
          <p className="text-xs text-muted-foreground mb-1">Net Margin</p>
          <p className={cn("text-2xl font-bold", netMargin > 0 ? "text-success" : "text-danger")}>
            ₹{Math.abs(netMargin / 1000).toFixed(1)}K
          </p>
          <div className="flex items-center gap-1 text-[10px] mt-0.5">
            {netMargin > 0 ? <TrendingUp className="w-3 h-3 text-success" /> : <TrendingDown className="w-3 h-3 text-danger" />}
            <span className={netMargin > 0 ? "text-success" : "text-danger"}>
              {((netMargin / (totalSell || 1)) * 100).toFixed(0)}% margin
            </span>
            <span className="text-muted-foreground ml-1">(read-only computed)</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5">
        {([
          { id: "allocations", label: "Customer Allocations" },
          { id: "own", label: "Own Space" },
          { id: "leased", label: "Leased-In Space" },
        ] as const).map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === tab.id ? "bg-brand text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted/50")}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "allocations" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  {["Customer", "Space Source", "Area / Slots", "Sell Rate (₹/slot)", "Cost Rate (₹/slot)", "Markup %", "Margin ₹/mo", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allocations.map((a, i) => {
                  const marginAmt = (a.sellRate - a.costRate) * a.slots
                  return (
                    <tr key={a.id} className={cn("border-b border-border/40 hover:bg-muted/20 transition-colors", i % 2 === 1 && "bg-muted/5")}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0", a.color)}>{a.initials}</div>
                          <span className="text-xs font-semibold text-foreground">{a.customer}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full",
                          a.source === "Own" ? "bg-navy/20 text-foreground" : "bg-warning/15 text-warning")}>
                          {a.source === "Own" ? "Own Space" : a.source}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground">{a.area} · {a.slots} slots</td>
                      <td className="px-4 py-3 text-xs font-semibold text-foreground">₹{a.sellRate}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">₹{a.costRate}</td>
                      <td className="px-4 py-3">
                        <span className={cn("text-xs font-bold", a.margin > 25 ? "text-success" : a.margin > 10 ? "text-warning" : "text-danger")}>
                          {a.margin}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-success">₹{marginAmt.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-brand transition-colors">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "own" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Zone A – Ground Floor", total: 2000, used: 1450, rate: "₹260/slot" },
            { label: "Zone B – Mezzanine", total: 1200, used: 780, rate: "₹240/slot" },
          ].map(zone => {
            const pct = (zone.used / zone.total) * 100
            return (
              <div key={zone.label} className="p-5 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-navy/20 flex items-center justify-center"><Building2 className="w-4 h-4 text-foreground" /></div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{zone.label}</p>
                    <p className="text-[10px] text-muted-foreground">Own Space · {zone.rate}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="text-foreground font-semibold">{zone.total} sqft</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", pct > 85 ? "bg-danger" : pct > 70 ? "bg-warning" : "bg-brand")}
                      style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Used: {zone.used} sqft ({pct.toFixed(0)}%)</span>
                    <span>Free: {zone.total - zone.used} sqft</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {activeTab === "leased" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {leasedSpaces.map(ls => {
            const pct = (ls.used / ls.slots) * 100
            return (
              <div key={ls.id} className="p-5 rounded-xl border border-warning/30 bg-warning/5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-foreground">{ls.name}</p>
                    <p className="text-[10px] text-muted-foreground">{ls.id} · {ls.term}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-warning/20 text-warning font-semibold">Leased-In</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-muted/30">
                    <p className="text-muted-foreground">Area Leased</p>
                    <p className="font-bold text-foreground">{ls.area}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/30">
                    <p className="text-muted-foreground">Monthly Cost</p>
                    <p className="font-bold text-danger">₹{ls.cost.toLocaleString()}</p>
                  </div>
                </div>
                <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden mb-1">
                  <div className={cn("h-full rounded-full", pct > 85 ? "bg-danger" : pct > 60 ? "bg-warning" : "bg-success")}
                    style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{ls.used}/{ls.slots} slots used</span>
                  <span>{ls.free} slots free</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
