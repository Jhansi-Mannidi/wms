"use client"

import { useState } from "react"
import { BarChart2, Download, Clock, Package, DollarSign, Users, FileText, Filter } from "lucide-react"
import { ExportButton } from "@/components/wms/export-button"
import { cn } from "@/lib/utils"

const periods = ["Last 7 Days", "Last 30 Days", "This Month", "Last Month", "Custom Range"]

const reports = [
  { id: "RPT-01", name: "Customer Stock Ledger", category: "Inventory", desc: "Full inbound/outbound movements per customer, per SKU with daily closing balances", format: "XLSX", icon: <Package className="w-4 h-4" /> },
  { id: "RPT-02", name: "Storage Occupancy Report", category: "Space", desc: "Rack-level utilisation by customer with average CBM occupied and revenue per bay", format: "XLSX", icon: <BarChart2 className="w-4 h-4" /> },
  { id: "RPT-03", name: "Drop-Off Receipt Log", category: "Inbound", desc: "All drop-off intakes with customer, carton count, CBM, lot numbers, and receiving timestamps", format: "XLSX", icon: <FileText className="w-4 h-4" /> },
  { id: "RPT-04", name: "Customer Release History", category: "Outbound", desc: "Approved and dispatched stock releases by customer with delivery confirmation", format: "XLSX", icon: <FileText className="w-4 h-4" /> },
  { id: "RPT-05", name: "Billing Statement", category: "Billing", desc: "Per-customer invoice summary with storage days, handling events, and VAS charges", format: "PDF", icon: <DollarSign className="w-4 h-4" /> },
  { id: "RPT-06", name: "Revenue Summary", category: "Billing", desc: "Total revenue by customer, billing period, and service type with MoM comparison", format: "XLSX", icon: <DollarSign className="w-4 h-4" /> },
  { id: "RPT-07", name: "Customer Onboarding Log", category: "Customers", desc: "All registered customers with onboarding date, contract tier, and current storage allocation", format: "XLSX", icon: <Users className="w-4 h-4" /> },
  { id: "RPT-08", name: "Ageing & Near-Expiry Report", category: "Inventory", desc: "Items aged over 60/90/120 days and items within 30/60 days of expiry across all customers", format: "XLSX", icon: <Clock className="w-4 h-4" /> },
]

const categories = ["All", "Inventory", "Space", "Inbound", "Outbound", "Billing", "Customers"]

const formatStyle: Record<string, string> = {
  XLSX: "bg-success/15 text-success",
  PDF: "bg-danger/15 text-danger",
}

const categoryColor: Record<string, string> = {
  Inventory: "text-brand",
  Space: "text-purple-400",
  Inbound: "text-orange-400",
  Outbound: "text-warning",
  Billing: "text-success",
  Customers: "text-blue-400",
}

export default function StorageSaaSReportsPage() {
  const [category, setCategory] = useState("All")
  const [period, setPeriod] = useState("Last 30 Days")

  const filtered = reports.filter(r => category === "All" || r.category === category)

  const stats = [
    { label: "Active Customers", value: "18", icon: <Users className="w-4 h-4" />, color: "text-brand", bg: "bg-brand/15" },
    { label: "Total CBM In Use", value: "842", icon: <Package className="w-4 h-4" />, color: "text-warning", bg: "bg-warning/15" },
    { label: "Revenue (MTD)", value: "₹3.8L", icon: <DollarSign className="w-4 h-4" />, color: "text-success", bg: "bg-success/15" },
    { label: "Space Utilisation", value: "74%", icon: <BarChart2 className="w-4 h-4" />, color: "text-purple-400", bg: "bg-purple-400/15" },
  ]

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground">Reports &amp; Analytics</h1>
          <p className="text-sm text-muted-foreground">Storage-as-a-Service operational and financial reports</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-card text-xs text-foreground outline-none cursor-pointer"
          >
            {periods.map(p => <option key={p}>{p}</option>)}
          </select>
          <ExportButton data={filtered.map(r => ({ id: r.id, name: r.name, category: r.category, desc: r.desc, format: r.format }))} filename="storage-saas-reports" label="Export All" />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", s.bg, s.color)}>
              {s.icon}
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1 p-0.5 rounded-xl bg-muted/40 border border-border w-fit">
        {categories.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              category === c ? "bg-brand text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/60"
            )}>
            {c}
          </button>
        ))}
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map(r => (
          <div key={r.id} className="rounded-2xl border border-border bg-card p-4 hover:border-brand/40 hover:bg-brand/5 transition-all group cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand/15 flex items-center justify-center text-brand shrink-0 group-hover:bg-brand/25 transition-colors">
                {r.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-foreground">{r.name}</p>
                  <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded", formatStyle[r.format])}>{r.format}</span>
                </div>
                <span className={cn("text-[10px] font-semibold", categoryColor[r.category] ?? "text-muted-foreground")}>{r.category}</span>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.desc}</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-[10px] text-muted-foreground">Period: {period}</p>
                  <button className="flex items-center gap-1 text-xs text-brand font-medium hover:underline">
                    <Download className="w-3 h-3" /> Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mini chart placeholder */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-foreground">Monthly Revenue Trend</h2>
          <span className="text-xs text-muted-foreground">{period}</span>
        </div>
        <div className="flex items-end gap-2 h-32">
          {[58, 72, 61, 88, 94, 79, 84, 92, 87, 96, 74, 100].map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md bg-brand/70 hover:bg-brand transition-colors cursor-pointer"
                style={{ height: `${v}%` }}
                title={`₹${(v * 4000).toLocaleString()}`}
              />
              <span className="text-[8px] text-muted-foreground hidden sm:block">
                {["J","F","M","A","M","J","J","A","S","O","N","D"][i]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
