"use client"

import { useState } from "react"
import { Search, FileText, TrendingUp, Filter, Download } from "lucide-react"
import { ExportButton } from "@/components/wms/export-button"
import { cn } from "@/lib/utils"

const billingRows = [
  { id: "B001", customer: "Priya Fashion Store", initials: "PF", color: "bg-emerald-500", storage: 12600, handling: 2400, delivery: 1800, total: 16800, cost: 8000, margin: 8800 },
  { id: "B002", customer: "Spice & Grain Co.", initials: "SG", color: "bg-amber-500", storage: 8400, handling: 1500, delivery: 900, total: 10800, cost: 5400, margin: 5400 },
  { id: "B003", customer: "MedEquip Traders", initials: "ME", color: "bg-orange-500", storage: 6300, handling: 1200, delivery: 600, total: 8100, cost: 4200, margin: 3900 },
  { id: "B004", customer: "TechGadgets Ltd", initials: "TG", color: "bg-violet-500", storage: 2100, handling: 600, delivery: 300, total: 3000, cost: 1500, margin: 1500 },
  { id: "B005", customer: "Rajesh Kumar", initials: "RK", color: "bg-blue-500", storage: 1800, handling: 300, delivery: 0, total: 2100, cost: 900, margin: 1200 },
]

export default function StorageBillingPage() {
  const [search, setSearch] = useState("")
  const [period, setPeriod] = useState("Jul 2026")
  const [generatingFor, setGeneratingFor] = useState<string | null>(null)
  const [generated, setGenerated] = useState<string[]>([])

  const filtered = billingRows.filter(r =>
    r.customer.toLowerCase().includes(search.toLowerCase())
  )

  const totalRevenue = filtered.reduce((s, r) => s + r.total, 0)
  const totalCost = filtered.reduce((s, r) => s + r.cost, 0)
  const netMargin = totalRevenue - totalCost

  const handleGenerate = (id: string) => {
    setGeneratingFor(id)
    setTimeout(() => { setGenerated(p => [...p, id]); setGeneratingFor(null) }, 1000)
  }

  return (
    <div className="p-6">
      {/* Portfolio summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <p className="text-2xl font-bold text-foreground">₹{(totalRevenue / 1000).toFixed(1)}K</p>
          <p className="text-[10px] text-muted-foreground mt-1">{period}</p>
        </div>
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">Leased-In Cost</p>
            <TrendingUp className="w-4 h-4 text-danger rotate-180" />
          </div>
          <p className="text-2xl font-bold text-danger">₹{(totalCost / 1000).toFixed(1)}K</p>
          <p className="text-[10px] text-muted-foreground mt-1">Allocated cost</p>
        </div>
        <div className="p-5 rounded-xl border border-success/30 bg-success/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">Net Margin</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/20 text-success font-semibold">
              {((netMargin / (totalRevenue || 1)) * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-success">₹{(netMargin / 1000).toFixed(1)}K</p>
          <p className="text-[10px] text-muted-foreground mt-1">Sell − Cost</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[180px] max-w-xs px-3 py-2 rounded-lg border border-border bg-card">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customer..."
            className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground/60" />
        </div>
        <select value={period} onChange={e => setPeriod(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-brand text-foreground">
          {["Jul 2026", "Jun 2026", "May 2026"].map(p => <option key={p}>{p}</option>)}
        </select>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-sm text-muted-foreground hover:text-foreground">
          <Filter className="w-4 h-4" /> Filter
        </button>
        <ExportButton data={filtered.map(r => ({ id: r.id, customer: r.customer, storage: r.storage, handling: r.handling, delivery: r.delivery, total: r.total, cost: r.cost, margin: r.margin }))} filename="storage-billing" label="Export All" className="ml-auto" />
      </div>

      {/* Billing table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                {["Customer", "Storage Rent (₹)", "Handling (₹)", "Delivery (₹)", "Total (₹)", "Margin (₹)", "Action"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={row.id} className={cn("border-b border-border/40 hover:bg-muted/20 transition-colors", i % 2 === 1 && "bg-muted/5")}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0", row.color)}>{row.initials}</div>
                      <span className="text-xs font-semibold text-foreground">{row.customer}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground">₹{row.storage.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-foreground">₹{row.handling.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-foreground">{row.delivery > 0 ? `₹${row.delivery.toLocaleString()}` : "—"}</td>
                  <td className="px-4 py-3 text-sm font-bold text-foreground">₹{row.total.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold text-success">₹{row.margin.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    {generated.includes(row.id) ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-success/15 text-success font-semibold">Invoice Ready</span>
                        <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleGenerate(row.id)}
                        disabled={generatingFor === row.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7941D] text-white text-xs font-semibold hover:bg-[#F7941D]/90 transition-colors disabled:opacity-60">
                        <FileText className="w-3.5 h-3.5" />
                        {generatingFor === row.id ? "Generating..." : "Generate Invoice"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/30">
                <td className="px-4 py-3 text-xs font-bold text-foreground">TOTALS</td>
                <td className="px-4 py-3 text-xs font-bold text-foreground">₹{filtered.reduce((s, r) => s + r.storage, 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-xs font-bold text-foreground">₹{filtered.reduce((s, r) => s + r.handling, 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-xs font-bold text-foreground">₹{filtered.reduce((s, r) => s + r.delivery, 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm font-bold text-foreground">₹{totalRevenue.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm font-bold text-success">₹{netMargin.toLocaleString()}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
