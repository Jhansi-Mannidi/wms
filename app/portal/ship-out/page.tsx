"use client"

import { useState } from "react"
import { Truck, Plus, Search, Package, Clock, CheckCircle2, AlertTriangle, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = ["All Orders", "Pending", "Processing", "Dispatched", "Delivered"]

const orders = [
  { id: "SO-3841", channel: "B2B", dest: "Apollo Hospitals, Hyderabad", lines: 3, cartons: 18, kg: 42, priority: "Express", status: "Dispatched", created: "Jul 19", sla: "Jul 21", awb: "AWB-7712441" },
  { id: "SO-3840", channel: "B2B", dest: "KIMS Hospital, Secunderabad", lines: 2, cartons: 12, kg: 28, priority: "Standard", status: "Packing", created: "Jul 19", sla: "Jul 21", awb: "-" },
  { id: "SO-3839", channel: "B2C", dest: "MedPlus, Banjara Hills", lines: 5, cartons: 8, kg: 14, priority: "Standard", status: "Picking", created: "Jul 18", sla: "Jul 21", awb: "-" },
  { id: "SO-3835", channel: "B2B", dest: "Care Hospitals, Madhapur", lines: 4, cartons: 24, kg: 58, priority: "Standard", status: "Pending", created: "Jul 18", sla: "Jul 22", awb: "-" },
  { id: "SO-3830", channel: "B2B", dest: "Rainbow Children's Hospital", lines: 6, cartons: 36, kg: 71, priority: "Express", status: "Delivered", created: "Jul 17", sla: "Jul 18", awb: "AWB-7712398" },
  { id: "SO-3825", channel: "B2C", dest: "Wellness Forever, Jubilee Hills", lines: 2, cartons: 4, kg: 6, priority: "Standard", status: "Delivered", created: "Jul 16", sla: "Jul 18", awb: "AWB-7712351" },
]

const statusStyle: Record<string, string> = {
  Dispatched: "bg-brand/15 text-brand",
  Packing: "bg-warning/15 text-warning",
  Picking: "bg-orange-400/15 text-orange-400",
  Pending: "bg-muted text-muted-foreground",
  Delivered: "bg-success/15 text-success",
}

const priorityStyle: Record<string, string> = {
  Express: "bg-danger/15 text-danger",
  Standard: "bg-muted text-muted-foreground",
}

export default function PortalShipOutPage() {
  const [tab, setTab] = useState("All Orders")
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)

  const filtered = orders.filter(o => {
    const matchTab = tab === "All Orders" || o.status === tab || (tab === "Processing" && (o.status === "Picking" || o.status === "Packing"))
    const matchSearch = !search || o.id.toLowerCase().includes(search.toLowerCase()) || o.dest.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  return (
    <div className="p-4 sm:p-6 space-y-5 w-full">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-[#1E3A5F] dark:text-foreground">Ship-Out Orders</h1>
          <p className="text-sm text-muted-foreground">Place and track outbound dispatch requests</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E3A5F] dark:bg-brand text-white text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New Ship-Out Order
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Orders", value: orders.length, icon: <Package className="w-4 h-4" />, color: "text-[#1E3A5F] dark:text-brand", bg: "bg-[#1E3A5F]/10 dark:bg-brand/15" },
          { label: "In Progress", value: orders.filter(o => ["Picking","Packing"].includes(o.status)).length, icon: <Clock className="w-4 h-4" />, color: "text-warning", bg: "bg-warning/15" },
          { label: "Dispatched", value: orders.filter(o => o.status === "Dispatched").length, icon: <Truck className="w-4 h-4" />, color: "text-brand", bg: "bg-brand/15" },
          { label: "Delivered", value: orders.filter(o => o.status === "Delivered").length, icon: <CheckCircle2 className="w-4 h-4" />, color: "text-success", bg: "bg-success/15" },
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

      {/* New Order Form */}
      {showForm && (
        <div className="rounded-2xl border border-[#1E3A5F]/30 dark:border-brand/30 bg-white dark:bg-card p-5">
          <h2 className="text-sm font-bold text-[#1E3A5F] dark:text-foreground mb-4">New Ship-Out Request</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Delivery Address", placeholder: "Hospital / store name & city" },
              { label: "Contact Person", placeholder: "Receiving contact" },
              { label: "Contact Phone", placeholder: "+91 XXXXX XXXXX" },
              { label: "Requested Delivery Date", placeholder: "YYYY-MM-DD" },
              { label: "Priority", placeholder: "Standard / Express" },
              { label: "Reference / PO No.", placeholder: "e.g. PO-8822" },
            ].map((f, i) => (
              <div key={i}>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">{f.label}</label>
                <input placeholder={f.placeholder} className="w-full px-3 py-2 rounded-lg border border-[#E4E9F0] dark:border-border bg-[#F7F9FC] dark:bg-muted/40 text-xs text-[#1E3A5F] dark:text-foreground outline-none focus:border-[#1E3A5F] dark:focus:border-brand transition-colors" />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Items to dispatch (SKU — Qty)</label>
            <textarea rows={3} className="w-full px-3 py-2 rounded-lg border border-[#E4E9F0] dark:border-border bg-[#F7F9FC] dark:bg-muted/40 text-xs text-[#1E3A5F] dark:text-foreground outline-none focus:border-[#1E3A5F] dark:focus:border-brand transition-colors resize-none" placeholder="APX-7712 — 200 units&#10;APX-4421 — 50 units" />
          </div>
          <div className="mt-4 flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-[#E4E9F0] dark:border-border text-xs font-medium text-muted-foreground hover:bg-[#F7F9FC] dark:hover:bg-muted transition-colors">Cancel</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl bg-[#1E3A5F] dark:bg-brand text-white text-xs font-medium hover:opacity-90 transition-opacity">Submit Order</button>
          </div>
        </div>
      )}

      {/* Tabs + search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 p-0.5 rounded-lg bg-[#F7F9FC] dark:bg-muted/40 border border-[#E4E9F0] dark:border-border flex-wrap">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors", tab === t ? "bg-[#1E3A5F] dark:bg-brand text-white" : "text-muted-foreground hover:text-[#1E3A5F] dark:hover:text-foreground")}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E4E9F0] dark:border-border bg-white dark:bg-card">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order or destination..." className="bg-transparent outline-none text-xs w-44 placeholder:text-muted-foreground text-[#1E3A5F] dark:text-foreground" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#E4E9F0] dark:border-border bg-[#F7F9FC] dark:bg-muted/30">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Order ID</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Destination</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground hidden md:table-cell">Cartons</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden lg:table-cell">Priority</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden lg:table-cell">SLA</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden xl:table-cell">AWB</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E9F0] dark:divide-border">
              {filtered.map(o => (
                <tr key={o.id} className="hover:bg-[#F7F9FC] dark:hover:bg-muted/20 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-mono font-bold text-[#1E3A5F] dark:text-brand">{o.id}</td>
                  <td className="px-4 py-3 text-[#1E3A5F] dark:text-foreground max-w-[160px] truncate">{o.dest}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground hidden md:table-cell">{o.cartons}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", priorityStyle[o.priority])}>{o.priority}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{o.sla}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground text-[10px] hidden xl:table-cell">{o.awb}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", statusStyle[o.status])}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3"><ChevronRight className="w-3.5 h-3.5 text-muted-foreground" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-[#E4E9F0] dark:border-border text-xs text-muted-foreground">Showing {filtered.length} of {orders.length} orders</div>
      </div>
    </div>
  )
}
