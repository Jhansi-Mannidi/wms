"use client"

import { useState } from "react"
import { DollarSign, Download, FileText, CheckCircle2, Clock, AlertTriangle, ChevronRight, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = ["All", "Outstanding", "Paid", "Overdue"]

const invoices = [
  { id: "INV-0445", period: "Jul 1–15, 2025", storage: 18400, handling: 6200, vas: 2800, total: 27400, status: "Outstanding", issued: "Jul 16", due: "Jul 30", paid: "-" },
  { id: "INV-0441", period: "Jun 16–30, 2025", storage: 17800, handling: 5900, vas: 0, total: 23700, status: "Overdue", issued: "Jul 1", due: "Jul 15", paid: "-" },
  { id: "INV-0438", period: "Jun 1–15, 2025", storage: 17200, handling: 6100, vas: 1500, total: 24800, status: "Paid", issued: "Jun 16", due: "Jun 30", paid: "Jun 28" },
  { id: "INV-0432", period: "May 16–31, 2025", storage: 16900, handling: 5700, vas: 3200, total: 25800, status: "Paid", issued: "Jun 1", due: "Jun 15", paid: "Jun 13" },
  { id: "INV-0428", period: "May 1–15, 2025", storage: 16500, handling: 5400, vas: 900, total: 22800, status: "Paid", issued: "May 16", due: "May 30", paid: "May 28" },
]

const statusStyle: Record<string, string> = {
  Outstanding: "bg-brand/15 text-brand",
  Overdue: "bg-danger/15 text-danger",
  Paid: "bg-success/15 text-success",
}

const statusIcon: Record<string, React.ReactNode> = {
  Outstanding: <Clock className="w-3 h-3" />,
  Overdue: <AlertTriangle className="w-3 h-3" />,
  Paid: <CheckCircle2 className="w-3 h-3" />,
}

function fmt(n: number) { return `₹${(n / 100).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}` }

export default function PortalBillingPage() {
  const [tab, setTab] = useState("All")

  const filtered = invoices.filter(inv => tab === "All" || inv.status === tab)
  const outstanding = invoices.filter(i => i.status === "Outstanding" || i.status === "Overdue").reduce((a, b) => a + b.total, 0)
  const paid30d = invoices.filter(i => i.status === "Paid").slice(0, 2).reduce((a, b) => a + b.total, 0)

  return (
    <div className="p-4 sm:p-6 space-y-5 w-full">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-[#1E3A5F] dark:text-foreground">Billing &amp; Invoices</h1>
          <p className="text-sm text-muted-foreground">Storage, handling, and VAS charges from VoltusFreight</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E3A5F] dark:bg-brand text-white text-sm font-medium hover:opacity-90 transition-opacity">
          <CreditCard className="w-4 h-4" /> Pay Now
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Outstanding", value: fmt(outstanding), color: "text-danger", bg: "bg-danger/15", icon: <AlertTriangle className="w-4 h-4" /> },
          { label: "Overdue", value: fmt(invoices.find(i => i.status === "Overdue")?.total ?? 0), color: "text-warning", bg: "bg-warning/15", icon: <Clock className="w-4 h-4" /> },
          { label: "Paid (Last 30d)", value: fmt(paid30d), color: "text-success", bg: "bg-success/15", icon: <CheckCircle2 className="w-4 h-4" /> },
          { label: "Avg Monthly Bill", value: fmt(Math.round(invoices.reduce((a, b) => a + b.total, 0) / invoices.length)), color: "text-brand", bg: "bg-brand/15", icon: <DollarSign className="w-4 h-4" /> },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", s.bg, s.color)}>{s.icon}</div>
            <div>
              <p className="text-base font-bold text-[#1E3A5F] dark:text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Overdue alert */}
      {invoices.some(i => i.status === "Overdue") && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-danger/10 border border-danger/30">
          <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
          <p className="text-sm text-danger font-medium">Invoice INV-0441 is overdue by 5 days. Please arrange payment to avoid service interruption.</p>
          <button className="ml-auto flex items-center gap-1 text-xs text-danger font-semibold hover:underline shrink-0">Pay Now <ChevronRight className="w-3 h-3" /></button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-0.5 rounded-lg bg-[#F7F9FC] dark:bg-muted/40 border border-[#E4E9F0] dark:border-border w-fit">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors", tab === t ? "bg-[#1E3A5F] dark:bg-brand text-white" : "text-muted-foreground hover:text-[#1E3A5F] dark:hover:text-foreground")}>
            {t}
          </button>
        ))}
      </div>

      {/* Invoice cards */}
      <div className="space-y-3">
        {filtered.map(inv => (
          <div key={inv.id} className="rounded-2xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E9F0] dark:border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1E3A5F]/10 dark:bg-brand/15 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-[#1E3A5F] dark:text-brand" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#1E3A5F] dark:text-foreground">{inv.id}</p>
                    <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full", statusStyle[inv.status])}>
                      {statusIcon[inv.status]} {inv.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{inv.period}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-lg font-bold text-[#1E3A5F] dark:text-foreground">{fmt(inv.total)}</p>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E4E9F0] dark:border-border hover:bg-[#F7F9FC] dark:hover:bg-muted transition-colors">
                  <Download className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-px bg-[#E4E9F0] dark:bg-border">
              {[
                { label: "Storage", value: fmt(inv.storage) },
                { label: "Handling", value: fmt(inv.handling) },
                { label: "VAS", value: fmt(inv.vas) },
                { label: "Issued", value: inv.issued },
                { label: inv.status === "Paid" ? "Paid On" : "Due", value: inv.status === "Paid" ? inv.paid : inv.due },
              ].map((cell, ci) => (
                <div key={ci} className="bg-white dark:bg-card px-4 py-2.5">
                  <p className="text-[10px] text-muted-foreground">{cell.label}</p>
                  <p className={cn("text-xs font-semibold mt-0.5", ci === 4 && inv.status === "Overdue" ? "text-danger" : "text-[#1E3A5F] dark:text-foreground")}>{cell.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Rate card link */}
      <div className="p-4 rounded-2xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#1E3A5F] dark:text-foreground">Your Rate Card</p>
          <p className="text-xs text-muted-foreground">Storage: ₹4.20/unit/month · Handling in: ₹6.50/carton · Handling out: ₹7.00/carton</p>
        </div>
        <button className="flex items-center gap-1 text-xs text-[#1E3A5F] dark:text-brand hover:underline shrink-0">
          View full rate card <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
