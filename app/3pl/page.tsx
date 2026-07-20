"use client"

import { useState } from "react"
import {
  Search, Filter, Plus, MoreHorizontal, Eye, Edit,
  Globe, AlertCircle, ChevronDown, LayoutGrid, List, TrendingUp,
  CheckCircle2, Clock, XCircle, ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"

const clients = [
  { id: "C001", name: "Apex Pharma Ltd", gstin: "29AAPCA1234A1Z5", avatarColor: "bg-blue-500", initials: "AP", agreement: "Active", spaceUsed: 78, skus: 234, openOrders: 12, dues: 0, kam: "Rahul M.", kamInitials: "RM", lastActivity: "2h ago" },
  { id: "C002", name: "Sunrise Electronics", gstin: "27BBBCE5678B2Y4", avatarColor: "bg-emerald-500", initials: "SE", agreement: "Renewal-Due", spaceUsed: 45, skus: 89, openOrders: 6, dues: 142500, kam: "Priya S.", kamInitials: "PS", lastActivity: "4h ago" },
  { id: "C003", name: "GlobalTex Fabrics", gstin: "06CCCGT9012C3X3", avatarColor: "bg-amber-500", initials: "GT", agreement: "Active", spaceUsed: 92, skus: 512, openOrders: 24, dues: 0, kam: "Ankit J.", kamInitials: "AJ", lastActivity: "30m ago" },
  { id: "C004", name: "FreshFarm Organics", gstin: "24DDDFF3456D4W2", avatarColor: "bg-orange-500", initials: "FF", agreement: "Active", spaceUsed: 33, skus: 67, openOrders: 3, dues: 0, kam: "Meera K.", kamInitials: "MK", lastActivity: "1d ago" },
  { id: "C005", name: "TechCore Systems", gstin: "33EEETE7890E5V1", avatarColor: "bg-violet-500", initials: "TC", agreement: "Expired", spaceUsed: 0, skus: 0, openOrders: 0, dues: 89000, kam: "Rahul M.", kamInitials: "RM", lastActivity: "5d ago" },
  { id: "C006", name: "MediSupply Corp", gstin: "07FFFMS2345F6U0", avatarColor: "bg-rose-500", initials: "MS", agreement: "Active", spaceUsed: 61, skus: 178, openOrders: 9, dues: 0, kam: "Priya S.", kamInitials: "PS", lastActivity: "6h ago" },
  { id: "C007", name: "AutoParts India", gstin: "19GGGAP6789G7T9", avatarColor: "bg-cyan-500", initials: "AI", agreement: "Active", spaceUsed: 55, skus: 320, openOrders: 17, dues: 55200, kam: "Ankit J.", kamInitials: "AJ", lastActivity: "3h ago" },
]

const agreementColors: Record<string, string> = {
  "Active": "bg-success/15 text-success",
  "Renewal-Due": "bg-warning/15 text-warning",
  "Expired": "bg-danger/15 text-danger",
}

const kpiCards = [
  { label: "Active Clients", value: "5", sub: "+2 onboarding", icon: <Globe className="w-4 h-4" />, filter: "active", color: "text-brand" },
  { label: "Total Stored Value", value: "₹4.2Cr", sub: "+8% MoM", icon: <TrendingUp className="w-4 h-4" />, filter: "all", color: "text-success" },
  { label: "Space Occupied", value: "68%", sub: "2,840 of 4,200 sqft", icon: <LayoutGrid className="w-4 h-4" />, filter: "all", color: "text-warning" },
  { label: "Open Ship-Outs", value: "71", sub: "Across all clients", icon: <CheckCircle2 className="w-4 h-4" />, filter: "active", color: "text-brand" },
  { label: "Overdue Invoices", value: "₹2.87L", sub: "3 clients affected", icon: <AlertCircle className="w-4 h-4" />, filter: "overdue", color: "text-danger" },
]

export default function ThreePLPage() {
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<"table" | "card">("table")
  const [activeFilter, setActiveFilter] = useState("all")

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.gstin.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* KPI filter cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {kpiCards.map((k) => (
          <button key={k.label}
            onClick={() => setActiveFilter(k.filter)}
            className={cn(
              "flex flex-col gap-2 p-4 rounded-xl border text-left transition-all",
              activeFilter === k.filter
                ? "border-brand bg-brand/10"
                : "border-border bg-card hover:border-brand/40 hover:bg-brand/5"
            )}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">{k.label}</span>
              <span className={k.color}>{k.icon}</span>
            </div>
            <p className={cn("text-xl font-bold", k.color)}>{k.value}</p>
            <p className="text-[10px] text-muted-foreground">{k.sub}</p>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-xs px-3 py-2 rounded-lg border border-border bg-card">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search clients, GSTIN..."
            className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground/60"
          />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Filter className="w-4 h-4" /> Filter
        </button>
        <ExportButton data={filtered.map(c => ({ id: c.id, name: c.name, gstin: c.gstin, agreement: c.agreement, spaceUsed: c.spaceUsed, skus: c.skus, openOrders: c.openOrders, dues: c.dues, kam: c.kam, lastActivity: c.lastActivity }))} filename="3pl-clients" />
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => setViewMode("table")} className={cn("w-8 h-8 flex items-center justify-center rounded-lg border transition-colors", viewMode === "table" ? "bg-brand border-brand text-white" : "border-border text-muted-foreground")}><List className="w-4 h-4" /></button>
          <button onClick={() => setViewMode("card")} className={cn("w-8 h-8 flex items-center justify-center rounded-lg border transition-colors", viewMode === "card" ? "bg-brand border-brand text-white" : "border-border text-muted-foreground")}><LayoutGrid className="w-4 h-4" /></button>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F7941D] text-white text-sm font-medium hover:bg-[#F7941D]/90 transition-colors">
          <Plus className="w-4 h-4" /> New Client
        </button>
      </div>

      {/* Table view */}
      {viewMode === "table" ? (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Client", "GSTIN", "Agreement", "Space Used", "SKUs", "Open Orders", "Dues (₹)", "KAM", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id} className={cn("border-b border-border/50 hover:bg-muted/20 transition-colors", i % 2 === 0 ? "" : "bg-muted/5")}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0", c.avatarColor)}>{c.initials}</div>
                        <div>
                          <p className="font-semibold text-foreground text-xs">{c.name}</p>
                          <p className="text-[10px] text-muted-foreground">{c.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{c.gstin}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", agreementColors[c.agreement])}>{c.agreement}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className={cn("h-full rounded-full transition-all", c.spaceUsed > 85 ? "bg-danger" : c.spaceUsed > 70 ? "bg-warning" : "bg-success")} style={{ width: `${c.spaceUsed}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{c.spaceUsed}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-foreground">{c.skus.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {c.openOrders > 0 ? (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand/15 text-brand">{c.openOrders}</span>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {c.dues > 0 ? (
                        <span className="text-xs font-bold text-danger">₹{c.dues.toLocaleString()}</span>
                      ) : <span className="text-xs text-success">Nil</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center text-brand text-[10px] font-bold">{c.kamInitials}</div>
                        <span className="text-xs text-muted-foreground">{c.kam}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-brand"><Eye className="w-3.5 h-3.5" /></button>
                        <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-brand"><Edit className="w-3.5 h-3.5" /></button>
                        <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-brand"><ExternalLink className="w-3.5 h-3.5" /></button>
                        <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Showing 1–{filtered.length} of {filtered.length} clients</span>
            <div className="flex items-center gap-1">
              {["10","25","50"].map(n => (
                <button key={n} className={cn("px-2 py-1 rounded text-xs", n === "10" ? "bg-brand text-white" : "text-muted-foreground hover:bg-muted")}>{n}</button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Card view */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div key={c.id} className="p-5 rounded-xl border border-border bg-card hover:border-brand/40 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0", c.avatarColor)}>{c.initials}</div>
                  <div>
                    <p className="font-bold text-sm text-foreground">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{c.gstin}</p>
                  </div>
                </div>
                <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", agreementColors[c.agreement])}>{c.agreement}</span>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Space Used</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className={cn("h-full rounded-full", c.spaceUsed > 85 ? "bg-danger" : c.spaceUsed > 70 ? "bg-warning" : "bg-success")} style={{ width: `${c.spaceUsed}%` }} />
                    </div>
                    <span className="font-semibold text-foreground">{c.spaceUsed}%</span>
                  </div>
                </div>
                <div className="flex justify-between"><span>SKUs on Hand</span><span className="font-semibold text-foreground">{c.skus}</span></div>
                <div className="flex justify-between"><span>Open Orders</span><span className="font-semibold text-brand">{c.openOrders}</span></div>
                <div className="flex justify-between"><span>Dues</span><span className={cn("font-semibold", c.dues > 0 ? "text-danger" : "text-success")}>{c.dues > 0 ? `₹${c.dues.toLocaleString()}` : "Nil"}</span></div>
              </div>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-brand/20 flex items-center justify-center text-brand text-[9px] font-bold">{c.kamInitials}</div>
                  <span className="text-[10px] text-muted-foreground">{c.kam} · {c.lastActivity}</span>
                </div>
                <button className="flex items-center gap-1 text-xs text-brand hover:underline">View <ExternalLink className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
