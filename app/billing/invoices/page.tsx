"use client"
import { useState } from "react"
import { Search, Plus, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"

const invoices = [
  { id: "INV-2024-0441", client: "Acme Foods", period: "Jun 2024", storage: "₹18,400", handling: "₹6,200", vas: "₹1,500", total: "₹26,100", issued: "2024-07-01", due: "2024-07-31", status: "Unpaid" },
  { id: "INV-2024-0440", client: "Global Oils", period: "Jun 2024", storage: "₹12,000", handling: "₹4,100", vas: "₹0", total: "₹16,100", issued: "2024-07-01", due: "2024-07-31", status: "Unpaid" },
  { id: "INV-2024-0430", client: "Acme Foods", period: "May 2024", storage: "₹17,800", handling: "₹5,900", vas: "₹2,100", total: "₹25,800", issued: "2024-06-01", due: "2024-06-30", status: "Paid" },
  { id: "INV-2024-0429", client: "Agro Corp", period: "May 2024", storage: "₹8,400", handling: "₹2,200", vas: "₹0", total: "₹10,600", issued: "2024-06-01", due: "2024-06-30", status: "Overdue" },
  { id: "INV-2024-0420", client: "Sweet Mills", period: "Apr 2024", storage: "₹6,200", handling: "₹1,800", vas: "₹400", total: "₹8,400", issued: "2024-05-01", due: "2024-05-31", status: "Paid" },
]

const statusStyle: Record<string, string> = {
  Paid: "bg-success/10 text-success",
  Unpaid: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Overdue: "bg-danger/10 text-danger",
}

export default function BillingInvoicesPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const filtered = invoices.filter(i =>
    (statusFilter === "All" || i.status === statusFilter) &&
    (i.id.toLowerCase().includes(search.toLowerCase()) || i.client.toLowerCase().includes(search.toLowerCase()))
  )
  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold text-foreground">Invoices</h1><p className="text-sm text-muted-foreground mt-0.5">All client billing invoices</p></div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="invoices" />
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> Generate Invoice</button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: "Total Invoiced (YTD)", value: "₹8.4L" }, { label: "Unpaid", value: "₹42,200", cls: "text-amber-600" }, { label: "Overdue", value: "₹10,600", cls: "text-danger" }, { label: "Collected", value: "₹7.8L", cls: "text-success" }].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn("text-2xl font-bold mt-1", s.cls || "text-foreground")}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoice ID, client..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
        </div>
        {["All", "Unpaid", "Paid", "Overdue"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", statusFilter === s ? "bg-brand text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground")}>{s}</button>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>{["Invoice ID", "Client", "Period", "Storage", "Handling", "VAS", "Total", "Issued", "Due", "Status", ""].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(i => (
              <tr key={i.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{i.id}</td>
                <td className="px-4 py-3 text-foreground">{i.client}</td>
                <td className="px-4 py-3 text-muted-foreground">{i.period}</td>
                <td className="px-4 py-3 text-foreground">{i.storage}</td>
                <td className="px-4 py-3 text-foreground">{i.handling}</td>
                <td className="px-4 py-3 text-foreground">{i.vas}</td>
                <td className="px-4 py-3 font-semibold text-foreground">{i.total}</td>
                <td className="px-4 py-3 text-muted-foreground">{i.issued}</td>
                <td className="px-4 py-3 text-foreground">{i.due}</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusStyle[i.status])}>{i.status}</span></td>
                <td className="px-4 py-3"><button className="text-brand hover:text-brand/70 transition-colors"><Download className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
