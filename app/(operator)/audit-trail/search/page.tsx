"use client"
import { useState } from "react"
import { Search, Filter, Shield, Eye, X as XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { Field, TextInput, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { DEMO_AUDIT_RECENT_SEARCHES } from "@/lib/fixtures/demo"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Log = {
  id: string; user: string; action: string; module: string
  entity: string; timestamp: string; ip: string
}

const logs: Log[] = [
  { id: "LOG-001", user: "Vijay Kumar", action: "Updated SKU", module: "Inventory", entity: "SKU-001234", timestamp: "2025-07-19 14:32:01", ip: "192.168.1.10" },
  { id: "LOG-002", user: "Priya Sharma", action: "Created GRN", module: "GRN", entity: "GRN-2025-0892", timestamp: "2025-07-19 13:18:44", ip: "192.168.1.22" },
  { id: "LOG-003", user: "Ravi Kumar", action: "Picked Order", module: "Orders", entity: "ORD-2025-4421", timestamp: "2025-07-19 12:55:10", ip: "192.168.1.15" },
  { id: "LOG-004", user: "Admin", action: "Changed Rate Card", module: "Billing", entity: "RATE-003", timestamp: "2025-07-19 11:40:00", ip: "192.168.1.1" },
  { id: "LOG-005", user: "Meena Patel", action: "Approved Adjustment", module: "Inventory", entity: "ADJ-0021", timestamp: "2025-07-19 10:28:35", ip: "192.168.1.18" },
  { id: "LOG-006", user: "Arjun Nair", action: "Picked Order", module: "Orders", entity: "ORD-2025-4420", timestamp: "2025-07-19 09:47:22", ip: "192.168.1.30" },
  { id: "LOG-007", user: "Kavitha Rao", action: "Posted GRN", module: "GRN", entity: "GRN-2025-0891", timestamp: "2025-07-19 09:05:58", ip: "192.168.1.11" },
  { id: "LOG-008", user: "Deepa Menon", action: "Generated Invoice", module: "Billing", entity: "INV-2025-0774", timestamp: "2025-07-18 18:12:40", ip: "192.168.1.41" },
  { id: "LOG-009", user: "Rahul Mehta", action: "Bin Transfer", module: "Inventory", entity: "SKU-001240", timestamp: "2025-07-18 17:33:05", ip: "192.168.1.34" },
  { id: "LOG-010", user: "Priya Sharma", action: "Packed Order", module: "Orders", entity: "ORD-2025-4419", timestamp: "2025-07-18 16:20:14", ip: "192.168.1.22" },
  { id: "LOG-011", user: "Anita Desai", action: "QC Rejected", module: "GRN", entity: "GRN-2025-0890", timestamp: "2025-07-18 15:02:31", ip: "192.168.1.27" },
  { id: "LOG-012", user: "Admin", action: "Updated Rate Card", module: "Billing", entity: "RATE-007", timestamp: "2025-07-18 13:41:09", ip: "192.168.1.1" },
  { id: "LOG-013", user: "Vijay Kumar", action: "Approved Adjustment", module: "Inventory", entity: "ADJ-0020", timestamp: "2025-07-18 11:19:47", ip: "192.168.1.10" },
  { id: "LOG-014", user: "Ravi Kumar", action: "Shipped Order", module: "Orders", entity: "ORD-2025-4418", timestamp: "2025-07-18 10:06:52", ip: "192.168.1.15" },
  { id: "LOG-015", user: "Suresh Yadav", action: "Putaway Completed", module: "Inventory", entity: "SKU-001237", timestamp: "2025-07-17 19:28:33", ip: "192.168.1.36" },
  { id: "LOG-016", user: "Meena Patel", action: "Created GRN", module: "GRN", entity: "GRN-2025-0889", timestamp: "2025-07-17 17:55:16", ip: "192.168.1.18" },
  { id: "LOG-017", user: "Deepa Menon", action: "Recorded Payment", module: "Billing", entity: "PAY-2025-0310", timestamp: "2025-07-17 16:11:04", ip: "192.168.1.41" },
  { id: "LOG-018", user: "Arjun Nair", action: "Cancelled Order", module: "Orders", entity: "ORD-2025-4417", timestamp: "2025-07-17 14:37:29", ip: "192.168.1.30" },
  { id: "LOG-019", user: "Sanjay Gupta", action: "Updated SKU", module: "Inventory", entity: "SKU-001241", timestamp: "2025-07-17 12:50:41", ip: "192.168.1.5" },
  { id: "LOG-020", user: "Kavitha Rao", action: "QC Completed", module: "GRN", entity: "GRN-2025-0888", timestamp: "2025-07-17 10:24:18", ip: "192.168.1.11" },
  { id: "LOG-021", user: "Priya Sharma", action: "Picked Order", module: "Orders", entity: "ORD-2025-4416", timestamp: "2025-07-16 18:44:55", ip: "192.168.1.22" },
  { id: "LOG-022", user: "Admin", action: "Approved Invoice", module: "Billing", entity: "INV-2025-0773", timestamp: "2025-07-16 16:30:07", ip: "192.168.1.1" },
  { id: "LOG-023", user: "Rahul Mehta", action: "Stock Adjustment", module: "Inventory", entity: "SKU-001232", timestamp: "2025-07-16 15:08:22", ip: "192.168.1.34" },
  { id: "LOG-024", user: "Ravi Kumar", action: "Packed Order", module: "Orders", entity: "ORD-2025-4415", timestamp: "2025-07-16 13:19:36", ip: "192.168.1.15" },
  { id: "LOG-025", user: "Anita Desai", action: "Posted GRN", module: "GRN", entity: "GRN-2025-0887", timestamp: "2025-07-16 11:02:50", ip: "192.168.1.27" },
  { id: "LOG-026", user: "Vijay Kumar", action: "Hold Released", module: "Inventory", entity: "SKU-001236", timestamp: "2025-07-15 17:46:13", ip: "192.168.1.10" },
  { id: "LOG-027", user: "Deepa Menon", action: "Credit Note Issued", module: "Billing", entity: "CN-2025-0044", timestamp: "2025-07-15 15:27:39", ip: "192.168.1.41" },
  { id: "LOG-028", user: "Suresh Yadav", action: "Shipped Order", module: "Orders", entity: "ORD-2025-4414", timestamp: "2025-07-15 12:58:04", ip: "192.168.1.36" },
  { id: "LOG-029", user: "Meena Patel", action: "QC Completed", module: "GRN", entity: "GRN-2025-0886", timestamp: "2025-07-15 10:15:27", ip: "192.168.1.18" },
  { id: "LOG-030", user: "Sanjay Gupta", action: "Cycle Count Posted", module: "Inventory", entity: "CC-2025-0118", timestamp: "2025-07-14 16:39:48", ip: "192.168.1.5" },
]

const SCOPES = ["All", "Inventory", "GRN", "Orders", "Billing"] as const

export default function AuditSearchPage() {
  const [q, setQ] = useState("")
  const [scope, setScope] = useState<string>("All")
  const [recent, setRecent] = useState<string[]>(DEMO_AUDIT_RECENT_SEARCHES)

  // Applied date range; the modal edits a draft until Apply is pressed.
  const [range, setRange] = useState({ from: "", to: "" })
  const [rangeOpen, setRangeOpen] = useState(false)
  const [draftRange, setDraftRange] = useState({ from: "", to: "" })
  const [rangeErrors, setRangeErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Log | null>(null)

  const rangeActive = !!(range.from || range.to)

  const filtered = logs.filter(l => {
    const day = l.timestamp.slice(0, 10)
    return JSON.stringify(l).toLowerCase().includes(q.toLowerCase())
      && (scope === "All" || l.module === scope)
      && (!range.from || day >= range.from)
      && (!range.to || day <= range.to)
  })

  function rememberSearch() {
    const term = q.trim()
    if (!term) { notify.warning("Nothing to search", "Type a term before running a search."); return }
    setRecent(prev => prev.includes(term) ? prev : [term, ...prev].slice(0, 6))
    notify.success("Search run", `${filtered.length} entr${filtered.length === 1 ? "y" : "ies"} matched “${term}”.`)
  }

  function openRange() {
    setDraftRange(range)
    setRangeErrors({})
    setRangeOpen(true)
  }

  function applyRange() {
    const e: Record<string, string> = {}
    if (!draftRange.from && !draftRange.to) e.from = "Enter at least a From or To date"
    if (draftRange.from && draftRange.to && draftRange.from > draftRange.to) e.to = "To date must be on or after the From date"
    setRangeErrors(e)
    if (Object.keys(e).length) return
    setRange(draftRange)
    setRangeOpen(false)
    notify.success("Date range applied", `${draftRange.from || "Any"} → ${draftRange.to || "Any"}`)
  }

  function clearRange() {
    setRange({ from: "", to: "" })
    setDraftRange({ from: "", to: "" })
  }

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold text-foreground">Audit Search</h1><p className="text-sm text-muted-foreground mt-1">Full-text search across all audit log entries</p></div>
        <ExportButton data={filtered} filename="audit-search-results" />
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") rememberSearch() }}
            placeholder="Search by user, action, entity, module..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <button onClick={rememberSearch} title="Run search" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
          <Search className="w-4 h-4" /> Search
        </button>
        <button
          onClick={openRange}
          title="Filter by date range"
          className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors", rangeActive ? "bg-brand text-white border-brand" : "border-border bg-card text-muted-foreground hover:text-foreground")}
        >
          <Filter className="w-4 h-4" /> {rangeActive ? `${range.from || "Any"} → ${range.to || "Any"}` : "Date Range"}
        </button>
        {(q || rangeActive || scope !== "All") && (
          <button
            onClick={() => { setQ(""); setScope("All"); clearRange(); notify.info("Search cleared", "Showing all audit entries.") }}
            title="Clear search and filters"
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border bg-card text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <XIcon className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {SCOPES.map(s => (
          <button
            key={s}
            onClick={() => setScope(s)}
            title={s === "All" ? "Search all modules" : `Search only ${s}`}
            className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", scope === s ? "bg-brand text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground")}
          >
            {s === "All" ? "All Modules" : s}
          </button>
        ))}
        <span className="ml-auto text-sm text-muted-foreground">{filtered.length} results</span>
      </div>

      {recent.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Recent:</span>
          {recent.map(term => (
            <button key={term} onClick={() => setQ(term)} title={`Search again for ${term}`} className="px-3 py-1 rounded-full border border-border bg-card text-xs text-foreground hover:text-brand transition-colors">
              {term}
            </button>
          ))}
          <button onClick={() => { setRecent([]); notify.info("History cleared", "Recent searches removed.") }} title="Clear recent searches" className="px-2 py-1 rounded-full text-xs text-muted-foreground hover:text-danger transition-colors">
            Clear history
          </button>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border"><tr>{["Log ID","User","Action","Module","Entity","Timestamp","IP","Actions"].map(h => <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map((l) => (
              <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <button onClick={() => setDetail(l)} title={`View ${l.id}`} className="font-mono text-xs text-brand hover:underline">{l.id}</button>
                </td>
                <td className="px-4 py-3 font-medium text-foreground">{l.user}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.action}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">{l.module}</span></td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{l.entity}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{l.timestamp}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{l.ip}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setDetail(l)} title="View details" className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-16 text-center text-sm text-muted-foreground">
                <Shield className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No audit entries match your search
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Date range */}
      <Modal
        open={rangeOpen}
        onOpenChange={(o) => { setRangeOpen(o); if (!o) setRangeErrors({}) }}
        title="Filter by Date Range"
        description="Restrict search results to a period"
        size="sm"
        footer={
          <>
            <button onClick={() => { clearRange(); setRangeOpen(false) }} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Clear
            </button>
            <ModalActions onCancel={() => setRangeOpen(false)} onSubmit={applyRange} submitLabel="Apply Range" />
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="From Date" error={rangeErrors.from}>
            <TextInput type="date" value={draftRange.from} invalid={!!rangeErrors.from} onChange={e => setDraftRange({ ...draftRange, from: e.target.value })} />
          </Field>
          <Field label="To Date" error={rangeErrors.to} hint="Leave a field empty for an open-ended range">
            <TextInput type="date" value={draftRange.to} invalid={!!rangeErrors.to} onChange={e => setDraftRange({ ...draftRange, to: e.target.value })} />
          </Field>
        </div>
      </Modal>

      {/* Log detail */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Audit entry detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Log ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="User" value={detail.user} />
            <DetailRow label="Action" value={detail.action} />
            <DetailRow label="Module" value={detail.module} />
            <DetailRow label="Entity" value={<span className="font-mono">{detail.entity}</span>} />
            <DetailRow label="Timestamp" value={detail.timestamp} />
            <DetailRow label="Source IP" value={<span className="font-mono">{detail.ip}</span>} />
          </div>
        )}
      </Drawer>
    </div>
  )
}
