"use client"

import { useState } from "react"
import {
  DollarSign, FileText, Clock, CheckCircle2, AlertTriangle,
  Plus, Eye, MoreHorizontal, ChevronDown, Search, Send, Download
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"

const invoices = [
  { id: "INV-2024-112", client: "Acme Foods", period: "Dec 1–15, 2024", services: ["Storage", "Handling", "Transport"], amount: "₹1,24,500", due: "2024-12-30", status: "Pending", raised: "2024-12-16" },
  { id: "INV-2024-111", client: "Global Oils", period: "Nov 16–30, 2024", services: ["Storage", "Palletization"], amount: "₹68,200", due: "2024-12-20", status: "Overdue", raised: "2024-12-01" },
  { id: "INV-2024-110", client: "Agro Corp", period: "Nov 1–15, 2024", services: ["Storage", "Handling"], amount: "₹45,000", due: "2024-11-30", status: "Paid", raised: "2024-11-16" },
  { id: "INV-2024-109", client: "Sweet Mills", period: "Oct 16–31, 2024", services: ["Transport", "Handling"], amount: "₹32,800", due: "2024-11-20", status: "Paid", raised: "2024-11-01" },
  { id: "INV-2024-108", client: "Salt Works", period: "Oct 1–15, 2024", services: ["Storage"], amount: "₹18,600", due: "2024-10-30", status: "Paid", raised: "2024-10-16" },
  { id: "INV-2024-107", client: "Fresh Farms", period: "Dec 1–15, 2024", services: ["Cold Storage", "Handling"], amount: "₹89,400", due: "2024-12-28", status: "Draft", raised: "2024-12-15" },
]

const statusConfig: Record<string, { color: string; bg: string }> = {
  Paid: { color: "text-success", bg: "bg-success/15" },
  Pending: { color: "text-warning", bg: "bg-warning/15" },
  Overdue: { color: "text-danger", bg: "bg-danger/15" },
  Draft: { color: "text-muted-foreground", bg: "bg-muted" },
}

const contractRates = [
  { client: "Acme Foods", service: "Storage (per pallet/month)", rate: "₹850", uom: "Per Pallet" },
  { client: "Acme Foods", service: "Inward Handling", rate: "₹12", uom: "Per Unit" },
  { client: "Acme Foods", service: "Outward Handling", rate: "₹15", uom: "Per Unit" },
  { client: "Global Oils", service: "Storage (per pallet/month)", rate: "₹920", uom: "Per Pallet" },
  { client: "Global Oils", service: "Palletization", rate: "₹180", uom: "Per Pallet" },
]

export default function BillingPage() {
  const [tab, setTab] = useState<"invoices" | "rates" | "reports">("invoices")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [clientFilter, setClientFilter] = useState("All Clients")

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase()
    return (
      (inv.id.toLowerCase().includes(q) || inv.client.toLowerCase().includes(q)) &&
      (statusFilter === "All Status" || inv.status === statusFilter) &&
      (clientFilter === "All Clients" || inv.client === clientFilter)
    )
  })

  const totalPending = invoices.filter((i) => i.status === "Pending").reduce(() => 0, 0)
  const overdueCount = invoices.filter((i) => i.status === "Overdue").length

  return (
    <div className="h-full overflow-y-auto">
      <div className="w-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Billing & Invoicing</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage contracts, invoices and payments</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ExportButton data={filtered.map(inv => ({ ...inv, services: inv.services.join(", ") }))} filename="billing-invoices" />
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
              <Plus className="w-4 h-4" /> New Invoice
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Billed (Dec)", value: "₹3,78,500", sub: "+12% vs Nov", icon: <DollarSign className="w-5 h-5" />, subColor: "text-success" },
            { label: "Pending Collection", value: "₹1,92,700", sub: "4 invoices", icon: <Clock className="w-5 h-5" />, subColor: "text-warning" },
            { label: "Overdue Amount", value: "₹68,200", sub: `${overdueCount} invoice overdue`, icon: <AlertTriangle className="w-5 h-5" />, subColor: "text-danger" },
            { label: "Collected (MTD)", value: "₹2,56,300", sub: "On track", icon: <CheckCircle2 className="w-5 h-5" />, subColor: "text-success" },
          ].map((stat, i) => (
            <div key={i} className="p-5 rounded-2xl border border-border bg-card">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className={cn(i === 2 ? "text-danger" : "text-brand")}>{stat.icon}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className={cn("text-xs mt-1", stat.subColor)}>{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-muted/50 w-fit">
          {(["invoices", "rates", "reports"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors",
                tab === t ? "bg-brand text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/60"
              )}
            >
              {t === "rates" ? "Contract Rates" : t === "reports" ? "Reports" : "Invoices"}
            </button>
          ))}
        </div>

        {tab === "invoices" && (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-xl border border-border bg-card">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground text-foreground" placeholder="Search invoice, client..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              {[
                { value: statusFilter, options: ["All Status", "Draft", "Pending", "Overdue", "Paid"], onChange: setStatusFilter },
                { value: clientFilter, options: ["All Clients", "Acme Foods", "Global Oils", "Agro Corp", "Sweet Mills", "Salt Works", "Fresh Farms"], onChange: setClientFilter },
              ].map((f, i) => (
                <div key={i} className="relative">
                  <select className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-border bg-card text-sm text-foreground outline-none cursor-pointer" value={f.value} onChange={(e) => f.onChange(e.target.value)}>
                    {f.options.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {["Invoice ID", "Client", "Period", "Services", "Amount", "Due Date", "Raised On", "Status", ""].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((inv, i) => (
                      <tr key={inv.id} className={cn("border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors", i % 2 === 1 ? "bg-muted/10" : "")}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-brand font-medium hover:underline cursor-pointer flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" /> {inv.id}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{inv.client}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{inv.period}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {inv.services.map((s) => (
                              <span key={s} className="px-1.5 py-0.5 rounded-md bg-brand/10 text-brand text-[10px] font-medium whitespace-nowrap">{s}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-bold text-foreground whitespace-nowrap">{inv.amount}</td>
                        <td className={cn("px-4 py-3 whitespace-nowrap text-xs font-medium", inv.status === "Overdue" ? "text-danger" : "text-muted-foreground")}>{inv.due}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{inv.raised}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusConfig[inv.status]?.bg, statusConfig[inv.status]?.color)}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="View"><Eye className="w-3.5 h-3.5" /></button>
                            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Send"><Send className="w-3.5 h-3.5" /></button>
                            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <FileText className="w-10 h-10 mb-3 opacity-40" />
                    <p className="font-medium">No invoices found</p>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
                <span className="text-xs text-muted-foreground">Showing {filtered.length} of {invoices.length} invoices</span>
                <div className="flex gap-1">
                  {[1, 2, 3].map((p) => (
                    <button key={p} className={cn("w-7 h-7 rounded-lg text-xs transition-colors", p === 1 ? "bg-brand text-white" : "text-muted-foreground hover:bg-muted")}>{p}</button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {tab === "rates" && (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Contract Rate Card</h2>
              <button className="flex items-center gap-1.5 text-xs text-brand hover:underline">
                <Plus className="w-3.5 h-3.5" /> Add Rate
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    {["Client", "Service", "Rate", "UOM", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contractRates.map((r, i) => (
                    <tr key={i} className={cn("border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors", i % 2 === 1 ? "bg-muted/10" : "")}>
                      <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{r.client}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.service}</td>
                      <td className="px-4 py-3 font-bold text-foreground whitespace-nowrap">{r.rate}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{r.uom}</td>
                      <td className="px-4 py-3">
                        <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "reports" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Monthly Revenue Report", desc: "Revenue breakdown by client and service type", icon: <DollarSign className="w-5 h-5" /> },
              { title: "Outstanding Payments", desc: "Overdue and pending invoice summary", icon: <AlertTriangle className="w-5 h-5" /> },
              { title: "Client-wise Billing", desc: "Per-client billing history and trends", icon: <FileText className="w-5 h-5" /> },
              { title: "Service-wise Revenue", desc: "Storage vs handling vs transport breakdown", icon: <CheckCircle2 className="w-5 h-5" /> },
            ].map((r, i) => (
              <div key={i} className="p-5 rounded-2xl border border-border bg-card hover:border-brand/40 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-brand/15 flex items-center justify-center text-brand mb-3 group-hover:bg-brand/25 transition-colors">
                  {r.icon}
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-1">{r.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{r.desc}</p>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-brand">
                  <Download className="w-3.5 h-3.5" /> Generate Report
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
