"use client"

import { useState } from "react"
import { Inbox, Plus, Search, Download, ChevronDown, FileText, Clock, CheckCircle2, AlertTriangle, Truck } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = ["All ASNs", "Draft", "Submitted", "Received", "Exception"]

const asns = [
  { id: "ASN-2245", po: "PO-8812", supplier: "Cipla Ltd", lines: 6, cartons: 240, cbm: 4.8, status: "Received", submitted: "Jul 18", expected: "Jul 19", received: "Jul 19" },
  { id: "ASN-2244", po: "PO-8809", supplier: "Sun Pharma", lines: 4, cartons: 180, cbm: 3.2, status: "In Transit", submitted: "Jul 19", expected: "Jul 20", received: "-" },
  { id: "ASN-2243", po: "PO-8801", supplier: "Dr Reddy's", lines: 8, cartons: 320, cbm: 6.4, status: "Submitted", submitted: "Jul 19", expected: "Jul 21", received: "-" },
  { id: "ASN-2240", po: "PO-8790", supplier: "Cipla Ltd", lines: 3, cartons: 96, cbm: 1.9, status: "Exception", submitted: "Jul 17", expected: "Jul 18", received: "Jul 19" },
  { id: "ASN-2238", po: "PO-8785", supplier: "Mankind Pharma", lines: 5, cartons: 200, cbm: 4.0, status: "Received", submitted: "Jul 16", expected: "Jul 17", received: "Jul 17" },
  { id: "ASN-2231", po: "PO-8770", supplier: "Abbott India", lines: 7, cartons: 280, cbm: 5.6, status: "Received", submitted: "Jul 14", expected: "Jul 15", received: "Jul 15" },
]

const statusStyle: Record<string, string> = {
  Received: "bg-success/15 text-success",
  "In Transit": "bg-brand/15 text-brand",
  Submitted: "bg-blue-400/15 text-blue-400",
  Exception: "bg-danger/15 text-danger",
  Draft: "bg-muted text-muted-foreground",
}

const statusIcon: Record<string, React.ReactNode> = {
  Received: <CheckCircle2 className="w-3 h-3" />,
  "In Transit": <Truck className="w-3 h-3" />,
  Submitted: <Clock className="w-3 h-3" />,
  Exception: <AlertTriangle className="w-3 h-3" />,
}

export default function PortalASNPage() {
  const [tab, setTab] = useState("All ASNs")
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)

  const filtered = asns.filter(a => {
    const matchTab = tab === "All ASNs" || a.status === tab || (tab === "Submitted" && a.status === "Submitted")
    const matchSearch = !search || a.id.toLowerCase().includes(search.toLowerCase()) || a.supplier.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  return (
    <div className="p-4 sm:p-6 space-y-5 w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-[#1E3A5F] dark:text-foreground">Inbound ASNs</h1>
          <p className="text-sm text-muted-foreground">Submit and track your Advance Shipment Notices</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E3A5F] dark:bg-brand text-white text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New ASN
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total ASNs", value: asns.length, color: "text-[#1E3A5F] dark:text-brand", bg: "bg-[#1E3A5F]/10 dark:bg-brand/15" },
          { label: "In Transit", value: asns.filter(a => a.status === "In Transit").length, color: "text-brand", bg: "bg-brand/15" },
          { label: "Received", value: asns.filter(a => a.status === "Received").length, color: "text-success", bg: "bg-success/15" },
          { label: "Exceptions", value: asns.filter(a => a.status === "Exception").length, color: "text-danger", bg: "bg-danger/15" },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", s.bg)}>
              <Inbox className={cn("w-4 h-4", s.color)} />
            </div>
            <div>
              <p className="text-lg font-bold text-[#1E3A5F] dark:text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* New ASN Form */}
      {showForm && (
        <div className="rounded-2xl border border-[#1E3A5F]/30 dark:border-brand/30 bg-white dark:bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#1E3A5F] dark:text-foreground flex items-center gap-2"><FileText className="w-4 h-4" /> Submit New ASN</h2>
            <button onClick={() => setShowForm(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Purchase Order #", placeholder: "e.g. PO-8820" },
              { label: "Supplier Name", placeholder: "e.g. Cipla Ltd" },
              { label: "Expected Arrival Date", placeholder: "YYYY-MM-DD" },
              { label: "No. of Cartons", placeholder: "e.g. 120" },
              { label: "Total CBM", placeholder: "e.g. 2.4" },
              { label: "No. of Line Items", placeholder: "e.g. 5" },
            ].map((f, i) => (
              <div key={i}>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">{f.label}</label>
                <input placeholder={f.placeholder} className="w-full px-3 py-2 rounded-lg border border-[#E4E9F0] dark:border-border bg-[#F7F9FC] dark:bg-muted/40 text-xs text-[#1E3A5F] dark:text-foreground outline-none focus:border-[#1E3A5F] dark:focus:border-brand transition-colors" />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Remarks / Special Instructions</label>
            <textarea rows={2} className="w-full px-3 py-2 rounded-lg border border-[#E4E9F0] dark:border-border bg-[#F7F9FC] dark:bg-muted/40 text-xs text-[#1E3A5F] dark:text-foreground outline-none focus:border-[#1E3A5F] dark:focus:border-brand transition-colors resize-none" placeholder="Any special handling, cold chain requirements, etc." />
          </div>
          <div className="mt-4 flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-[#E4E9F0] dark:border-border text-xs font-medium text-muted-foreground hover:bg-[#F7F9FC] dark:hover:bg-muted transition-colors">Save Draft</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl bg-[#1E3A5F] dark:bg-brand text-white text-xs font-medium hover:opacity-90 transition-opacity">Submit ASN</button>
          </div>
        </div>
      )}

      {/* Tabs + search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 p-0.5 rounded-lg bg-[#F7F9FC] dark:bg-muted/40 border border-[#E4E9F0] dark:border-border">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                tab === t ? "bg-[#1E3A5F] dark:bg-brand text-white" : "text-muted-foreground hover:text-[#1E3A5F] dark:hover:text-foreground"
              )}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E4E9F0] dark:border-border bg-white dark:bg-card">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ASN or supplier..." className="bg-transparent outline-none text-xs w-40 placeholder:text-muted-foreground text-[#1E3A5F] dark:text-foreground" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#E4E9F0] dark:border-border bg-[#F7F9FC] dark:bg-muted/30">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">ASN ID</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden sm:table-cell">PO Reference</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Supplier</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground hidden md:table-cell">Lines</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground hidden md:table-cell">Cartons</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden lg:table-cell">Expected</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden lg:table-cell">Received</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E9F0] dark:divide-border">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-[#F7F9FC] dark:hover:bg-muted/20 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-mono font-bold text-[#1E3A5F] dark:text-brand">{a.id}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{a.po}</td>
                  <td className="px-4 py-3 font-medium text-[#1E3A5F] dark:text-foreground">{a.supplier}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground hidden md:table-cell">{a.lines}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground hidden md:table-cell">{a.cartons}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{a.expected}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{a.received}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full", statusStyle[a.status])}>
                      {statusIcon[a.status]} {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-[#E4E9F0] dark:border-border text-xs text-muted-foreground">
          Showing {filtered.length} of {asns.length} ASNs
        </div>
      </div>
    </div>
  )
}
