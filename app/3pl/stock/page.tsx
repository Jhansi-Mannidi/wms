"use client"

import { useState } from "react"
import { Search, Filter, AlertTriangle, RefreshCw, ChevronDown, Package, Layers, BarChart3, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { AvatarChip } from "@/components/wms/avatar-chip"
import { StatusBadge } from "@/components/wms/status-badge"

const kpis = [
  { label: "Total SKUs on Hand", value: "2,410", sub: "Across 6 clients", color: "brand" },
  { label: "Total QoH (Units)", value: "84,320", sub: "+2.1% vs last week", color: "success" },
  { label: "SKUs Below Reorder", value: "18", sub: "Action required", color: "warning" },
  { label: "Expired / Near Expiry", value: "4", sub: "Lot-level alert", color: "danger" },
]

const stocks = [
  { sku: "APH-001", name: "Amoxicillin 500mg Strip x10", client: "Apex Pharma Ltd", category: "Pharma", qoh: 12000, reserved: 2400, available: 9600, location: "R-A3-12", expiry: "2026-03-15", status: "ok", belowReorder: false },
  { sku: "APH-002", name: "Paracetamol 650mg Strip x10", client: "Apex Pharma Ltd", category: "Pharma", qoh: 450, reserved: 450, available: 0, location: "R-A3-14", expiry: "2025-12-01", status: "out", belowReorder: false },
  { sku: "GTF-101", name: "Cotton Fabric Roll 1.2m", client: "Hindustan Unilever", category: "FMCG", qoh: 380, reserved: 40, available: 340, location: "B-B2-05", expiry: null, status: "ok", belowReorder: false },
  { sku: "GTF-102", name: "Synthetic Blend Roll 0.9m", client: "Hindustan Unilever", category: "FMCG", qoh: 28, reserved: 0, available: 28, location: "B-B2-06", expiry: null, status: "low", belowReorder: true },
  { sku: "SE-201", name: "USB-C Hub 7-Port", client: "Amazon Seller Svc", category: "Electronics", qoh: 800, reserved: 320, available: 480, location: "E-C1-01", expiry: null, status: "ok", belowReorder: false },
  { sku: "SE-202", name: "HDMI Cable 2m Braided", client: "Amazon Seller Svc", category: "Electronics", qoh: 1240, reserved: 600, available: 640, location: "E-C1-02", expiry: null, status: "ok", belowReorder: false },
  { sku: "MS-301", name: "Surgical Gloves (M) Box/100", client: "Tata Consumer Products", category: "Medical", qoh: 5200, reserved: 1200, available: 4000, location: "R-D4-08", expiry: "2025-09-30", status: "expiry", belowReorder: false },
  { sku: "AI-401", name: "Brake Pad Set Front", client: "D-Mart Avenue", category: "Auto", qoh: 60, reserved: 12, available: 48, location: "M-E1-03", expiry: null, status: "ok", belowReorder: false },
]

const categories = ["All", "Pharma", "FMCG", "Electronics", "Medical", "Auto"]

const statusInfo: Record<string, { bg: string; text: string; label: string }> = {
  ok:     { bg: "bg-success/15", text: "text-success",  label: "In Stock" },
  low:    { bg: "bg-warning/15", text: "text-warning",  label: "Low Stock" },
  out:    { bg: "bg-danger/15",  text: "text-danger",   label: "Out of Stock" },
  expiry: { bg: "bg-amber-500/15", text: "text-amber-400", label: "Near Expiry" },
}

function StockBar({ qoh, reserved }: { qoh: number; reserved: number }) {
  const pct = qoh > 0 ? (reserved / qoh) * 100 : 0
  return (
    <div className="flex items-center gap-1.5 min-w-[70px]">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-brand/50 rounded-full" style={{ width: "100%" }}>
          <div className="h-full bg-brand rounded-full" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground">{Math.round(pct)}%</span>
    </div>
  )
}

export default function OwnedStockExplorerPage() {
  const [search, setSearch] = useState("")
  const [cat, setCat] = useState("All")
  const [clientFilter, setClientFilter] = useState("All Clients")

  const filtered = stocks.filter(s =>
    (cat === "All" || s.category === cat) &&
    (s.sku.toLowerCase().includes(search.toLowerCase()) ||
     s.name.toLowerCase().includes(search.toLowerCase()) ||
     s.client.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-0 px-5 pt-4 border-b border-border shrink-0">
        {["All SKUs", "Below Reorder", "Near Expiry", "Out of Stock", "Lot Tracking"].map((t, i) => (
          <button key={t} className={cn(
            "px-4 py-2 text-[12px] font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
            i === 0 ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-foreground"
          )}>{t}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map(k => (
            <div key={k.label} className={cn("bg-card border rounded-lg px-4 py-3",
              k.color === "danger" ? "border-danger/25" : k.color === "warning" ? "border-warning/25" : "border-border"
            )}>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{k.label}</p>
              <p className={cn("text-2xl font-bold mt-1", `text-${k.color}`)}>{k.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{k.sub}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/40 flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="SKU, name, client…"
              className="bg-transparent text-[12px] outline-none w-full placeholder:text-muted-foreground/60" />
          </div>
          <div className="flex gap-1 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setCat(c)} className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap",
                cat === c ? "bg-brand text-white" : "border border-border bg-card text-muted-foreground hover:text-foreground"
              )}>{c}</button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-[12px] text-muted-foreground hover:text-foreground cursor-pointer ml-auto">
            <span>Client</span><ChevronDown className="w-3 h-3" />
          </div>
          <ExportButton data={filtered.map(s => ({ sku: s.sku, name: s.name, client: s.client, category: s.category, qoh: s.qoh, reserved: s.reserved, available: s.available, location: s.location, expiry: s.expiry ?? "", status: s.status, belowReorder: s.belowReorder }))} filename="3pl-stock" />
          <button className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["SKU / Name", "Client", "Cat.", "QoH", "Reserved", "Available", "Reserve %", "Location", "Expiry", "Status", ""].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const info = statusInfo[s.status]
                return (
                  <tr key={s.sku} className={cn("border-b border-border/50 hover:bg-muted/20 transition-colors", i % 2 !== 0 && "bg-muted/5")}>
                    <td className="px-4 py-3">
                      <p className="font-mono text-[11px] text-brand font-semibold">{s.sku}</p>
                      <p className="text-[11px] text-foreground leading-tight mt-0.5 max-w-[140px] truncate">{s.name}</p>
                    </td>
                    <td className="px-4 py-3"><AvatarChip name={s.client} size="xs" /></td>
                    <td className="px-4 py-3 text-muted-foreground">{s.category}</td>
                    <td className="px-4 py-3 font-semibold">{s.qoh.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.reserved.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={cn("font-bold", s.available === 0 ? "text-danger" : s.available < 50 ? "text-warning" : "text-success")}>{s.available.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3"><StockBar qoh={s.qoh} reserved={s.reserved} /></td>
                    <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{s.location}</td>
                    <td className="px-4 py-3">
                      {s.expiry
                        ? <span className="text-[11px] text-warning">{s.expiry}</span>
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold", info.bg, info.text)}>
                        {s.belowReorder && <AlertTriangle className="w-2.5 h-2.5" />}
                        {info.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-brand hover:bg-brand/10 transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="px-4 py-2.5 border-t border-border bg-muted/20 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Showing {filtered.length} of {stocks.length} SKUs</span>
            <span className="text-[11px] font-semibold text-foreground">Total QoH: {filtered.reduce((s, x) => s + x.qoh, 0).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
