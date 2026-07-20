"use client"

import { useState } from "react"
import { Plus, Search, Filter, FileText, Edit2, Eye, AlertTriangle, CheckCircle2, Clock, CalendarDays, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { AvatarChip } from "@/components/wms/avatar-chip"
import { ExportButton } from "@/components/wms/export-button"

const agreements = [
  { id: "AGR-001", client: "Reliance Retail Ltd", type: "Standard 3PL", startDate: "2024-01-01", endDate: "2025-12-31", status: "active", billingFreq: "Monthly", value: "₹4.2L/mo", autoRenew: true, daysLeft: 165 },
  { id: "AGR-002", client: "Tata Consumer Products", type: "Standard 3PL", startDate: "2024-03-15", endDate: "2025-09-14", status: "renewal", billingFreq: "Monthly", value: "₹2.8L/mo", autoRenew: false, daysLeft: 56 },
  { id: "AGR-003", client: "Hindustan Unilever", type: "Premium 3PL + VAS", startDate: "2023-07-01", endDate: "2026-06-30", status: "active", billingFreq: "Monthly", value: "₹11.5L/mo", autoRenew: true, daysLeft: 345 },
  { id: "AGR-004", client: "Myntra Designs Pvt", type: "Standard 3PL", startDate: "2023-01-01", endDate: "2025-01-31", status: "expired", billingFreq: "Monthly", value: "₹3.1L/mo", autoRenew: false, daysLeft: -170 },
  { id: "AGR-005", client: "Amazon Seller Svc", type: "Enterprise 3PL", startDate: "2024-06-01", endDate: "2027-05-31", status: "active", billingFreq: "Monthly", value: "₹28.4L/mo", autoRenew: true, daysLeft: 680 },
  { id: "AGR-006", client: "D-Mart Avenue", type: "Standard 3PL", startDate: "2024-09-01", endDate: "2025-08-31", status: "active", billingFreq: "Quarterly", value: "₹1.6L/mo", autoRenew: false, daysLeft: 42 },
]

const agreementTypes = ["All", "Standard 3PL", "Premium 3PL + VAS", "Enterprise 3PL"]

const statusConfig: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  active:  { label: "Active",       bg: "bg-success/15", text: "text-success",  icon: <CheckCircle2 className="w-3 h-3" /> },
  renewal: { label: "Renewal Due",  bg: "bg-warning/15", text: "text-warning",  icon: <AlertTriangle className="w-3 h-3" /> },
  expired: { label: "Expired",      bg: "bg-danger/15",  text: "text-danger",   icon: <Clock className="w-3 h-3" /> },
}

const kpis = [
  { label: "Active Agreements", value: "4", color: "text-success" },
  { label: "Renewal Due (< 60d)", value: "2", color: "text-warning" },
  { label: "Expired", value: "1", color: "text-danger" },
  { label: "Auto-Renew Enabled", value: "3", color: "text-brand" },
]

export default function AgreementsPage() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")

  const filtered = agreements.filter(a =>
    (typeFilter === "All" || a.type === typeFilter) &&
    a.client.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-0 px-5 pt-4 border-b border-border shrink-0">
        {["All Agreements", "Active", "Renewal Due", "Expired", "Rate Cards"].map((t, i) => (
          <button key={t} className={cn(
            "px-4 py-2 text-[12px] font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
            i === 0 ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-foreground"
          )}>{t}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map(k => (
            <div key={k.label} className="bg-card border border-border rounded-lg px-4 py-3">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{k.label}</p>
              <p className={cn("text-2xl font-bold mt-1", k.color)}>{k.value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/40 flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search agreements…"
              className="bg-transparent text-[12px] outline-none w-full placeholder:text-muted-foreground/60" />
          </div>
          <div className="flex gap-1">
            {agreementTypes.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} className={cn(
                "px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap",
                typeFilter === t ? "bg-brand text-white" : "border border-border bg-card text-muted-foreground hover:text-foreground"
              )}>{t}</button>
            ))}
          </div>
          <ExportButton data={filtered.map(a => ({ id: a.id, client: a.client, type: a.type, startDate: a.startDate, endDate: a.endDate, status: a.status, billingFreq: a.billingFreq, value: a.value, autoRenew: a.autoRenew, daysLeft: a.daysLeft }))} filename="3pl-agreements" className="ml-auto" />
          <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-brand text-white text-[12px] font-semibold hover:bg-brand/90 transition-colors">
            <Plus className="w-3.5 h-3.5" /> New Agreement
          </button>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Client", "Type", "Period", "Status", "Days Left", "Billing", "Value", "Auto-Renew", ""].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => {
                const s = statusConfig[a.status]
                return (
                  <tr key={a.id} className={cn("border-b border-border/50 hover:bg-muted/20 transition-colors", i % 2 !== 0 && "bg-muted/5")}>
                    <td className="px-4 py-3"><AvatarChip name={a.client} sub={a.id} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{a.type}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <CalendarDays className="w-3 h-3" />
                        <span>{a.startDate.slice(0,7)} → {a.endDate.slice(0,7)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold", s.bg, s.text)}>
                        {s.icon}{s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("font-semibold", a.daysLeft < 0 ? "text-danger" : a.daysLeft < 60 ? "text-warning" : "text-foreground")}>
                        {a.daysLeft < 0 ? `${Math.abs(a.daysLeft)}d ago` : `${a.daysLeft}d`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{a.billingFreq}</td>
                    <td className="px-4 py-3 font-semibold text-foreground">{a.value}</td>
                    <td className="px-4 py-3">
                      {a.autoRenew
                        ? <span className="text-[11px] font-semibold text-success bg-success/15 px-2 py-0.5 rounded-full">Yes</span>
                        : <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">No</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-brand hover:bg-brand/10 transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                        <button className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><FileText className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="px-4 py-2.5 border-t border-border bg-muted/20 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Showing {filtered.length} agreements</span>
          </div>
        </div>
      </div>
    </div>
  )
}
