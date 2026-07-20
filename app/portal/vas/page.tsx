"use client"

import { useState } from "react"
import { Wrench, Plus, Search, Clock, CheckCircle2, AlertCircle, ChevronRight, Tag, Package } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = ["All", "Pending", "In Progress", "Completed"]

const vasOrders = [
  { id: "VAS-1041", type: "Relabelling", sku: "APX-7712", desc: "Paracetamol 500mg — reprint 200 units", units: 200, status: "Completed", raised: "Jul 16", completed: "Jul 18", notes: "New batch label with barcode" },
  { id: "VAS-1040", type: "Kitting", sku: "APX-KIT-01", desc: "First Aid Kit assembly — 50 kits", units: 50, status: "In Progress", raised: "Jul 18", completed: "-", notes: "Include bandage + antiseptic + gloves" },
  { id: "VAS-1039", type: "Repacking", sku: "APX-4421", desc: "Syringes 5ml — repack from bulk to retail packs of 10", units: 500, status: "In Progress", raised: "Jul 19", completed: "-", notes: "Retail blister pack format" },
  { id: "VAS-1038", type: "Quality Check", sku: "APX-3301", desc: "Insulin Glargine — 3rd-party QC inspection", units: 240, status: "Pending", raised: "Jul 19", completed: "-", notes: "Requires cold-chain compliance check" },
  { id: "VAS-1035", type: "Relabelling", sku: "APX-2209", desc: "IV Drip Set — update expiry sticker", units: 100, status: "Completed", raised: "Jul 14", completed: "Jul 15", notes: "" },
]

const serviceTypes = ["All Types", "Relabelling", "Kitting", "Repacking", "Quality Check", "Co-packing", "Palletisation"]

const statusStyle: Record<string, string> = {
  Completed: "bg-success/15 text-success",
  "In Progress": "bg-warning/15 text-warning",
  Pending: "bg-muted text-muted-foreground",
}

const typeStyle: Record<string, string> = {
  Relabelling: "bg-brand/15 text-brand",
  Kitting: "bg-purple-400/15 text-purple-400",
  Repacking: "bg-orange-400/15 text-orange-400",
  "Quality Check": "bg-blue-400/15 text-blue-400",
  "Co-packing": "bg-pink-400/15 text-pink-400",
  Palletisation: "bg-emerald-400/15 text-emerald-400",
}

export default function PortalVASPage() {
  const [tab, setTab] = useState("All")
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("All Types")
  const [showForm, setShowForm] = useState(false)

  const filtered = vasOrders.filter(v => {
    const matchTab = tab === "All" || v.status === tab
    const matchType = typeFilter === "All Types" || v.type === typeFilter
    const matchSearch = !search || v.id.toLowerCase().includes(search.toLowerCase()) || v.desc.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchType && matchSearch
  })

  return (
    <div className="p-4 sm:p-6 space-y-5 w-full">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-[#1E3A5F] dark:text-foreground">VAS Requests</h1>
          <p className="text-sm text-muted-foreground">Value-Added Services — relabelling, kitting, repacking, QC</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E3A5F] dark:bg-brand text-white text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New VAS Request
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Open Requests", value: vasOrders.filter(v => v.status !== "Completed").length, color: "text-warning", bg: "bg-warning/15", icon: <Clock className="w-4 h-4" /> },
          { label: "In Progress", value: vasOrders.filter(v => v.status === "In Progress").length, color: "text-brand", bg: "bg-brand/15", icon: <Wrench className="w-4 h-4" /> },
          { label: "Completed", value: vasOrders.filter(v => v.status === "Completed").length, color: "text-success", bg: "bg-success/15", icon: <CheckCircle2 className="w-4 h-4" /> },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", s.bg, s.color)}>{s.icon}</div>
            <div>
              <p className="text-lg font-bold text-[#1E3A5F] dark:text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* New VAS Form */}
      {showForm && (
        <div className="rounded-2xl border border-[#1E3A5F]/30 dark:border-brand/30 bg-white dark:bg-card p-5">
          <h2 className="text-sm font-bold text-[#1E3A5F] dark:text-foreground mb-4">New VAS Request</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Service Type", placeholder: "Relabelling / Kitting / Repacking..." },
              { label: "SKU Reference", placeholder: "e.g. APX-7712" },
              { label: "Quantity (units)", placeholder: "e.g. 500" },
              { label: "Required By Date", placeholder: "YYYY-MM-DD" },
              { label: "Priority", placeholder: "Normal / Urgent" },
              { label: "Reference Order / PO", placeholder: "Optional" },
            ].map((f, i) => (
              <div key={i}>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">{f.label}</label>
                <input placeholder={f.placeholder} className="w-full px-3 py-2 rounded-lg border border-[#E4E9F0] dark:border-border bg-[#F7F9FC] dark:bg-muted/40 text-xs text-[#1E3A5F] dark:text-foreground outline-none focus:border-[#1E3A5F] dark:focus:border-brand transition-colors" />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Instructions / Notes</label>
            <textarea rows={2} className="w-full px-3 py-2 rounded-lg border border-[#E4E9F0] dark:border-border bg-[#F7F9FC] dark:bg-muted/40 text-xs text-[#1E3A5F] dark:text-foreground outline-none resize-none focus:border-[#1E3A5F] dark:focus:border-brand transition-colors" placeholder="Detailed instructions for the warehouse team..." />
          </div>
          <div className="mt-4 flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-[#E4E9F0] dark:border-border text-xs font-medium text-muted-foreground hover:bg-[#F7F9FC] dark:hover:bg-muted transition-colors">Cancel</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl bg-[#1E3A5F] dark:bg-brand text-white text-xs font-medium hover:opacity-90 transition-opacity">Submit Request</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1 p-0.5 rounded-lg bg-[#F7F9FC] dark:bg-muted/40 border border-[#E4E9F0] dark:border-border">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors", tab === t ? "bg-[#1E3A5F] dark:bg-brand text-white" : "text-muted-foreground hover:text-[#1E3A5F] dark:hover:text-foreground")}>
              {t}
            </button>
          ))}
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-[#E4E9F0] dark:border-border bg-white dark:bg-card text-xs text-[#1E3A5F] dark:text-foreground outline-none cursor-pointer">
          {serviceTypes.map(s => <option key={s}>{s}</option>)}
        </select>
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E4E9F0] dark:border-border bg-white dark:bg-card">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="bg-transparent outline-none text-xs w-36 placeholder:text-muted-foreground text-[#1E3A5F] dark:text-foreground" />
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.map(v => (
          <div key={v.id} className="rounded-2xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card p-4 hover:border-[#1E3A5F]/30 dark:hover:border-brand/30 transition-colors cursor-pointer">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1E3A5F]/10 dark:bg-brand/15 flex items-center justify-center shrink-0">
                  <Wrench className="w-4 h-4 text-[#1E3A5F] dark:text-brand" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-[#1E3A5F] dark:text-foreground">{v.id}</p>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", typeStyle[v.type] ?? "bg-muted text-muted-foreground")}>{v.type}</span>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", statusStyle[v.status])}>{v.status}</span>
                  </div>
                  <p className="text-xs text-[#1E3A5F] dark:text-foreground/80 mt-0.5">{v.desc}</p>
                  {v.notes && <p className="text-[11px] text-muted-foreground mt-0.5 italic">{v.notes}</p>}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Package className="w-3 h-3" />{v.units} units
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                  <Tag className="w-3 h-3" />{v.sku}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">Raised: {v.raised}</p>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">No VAS requests found.</div>
        )}
      </div>
    </div>
  )
}
