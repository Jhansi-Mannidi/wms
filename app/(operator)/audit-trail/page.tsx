"use client"

import { useState } from "react"
import {
  Shield, User, Package, ShoppingCart, Truck, DollarSign,
  Search, ChevronDown, Eye, Filter, Clock, X as XIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { Field, TextInput, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type AuditLog = {
  id: string; time: string; user: string; role: string; module: string
  action: string; entity: string; details: string; ip: string
}

const auditLogs: AuditLog[] = [
  { id: "AUD-20241", time: "2024-12-16 16:42:03", user: "Vijay Kumar", role: "Manager", module: "Inventory", action: "Stock Adjustment", entity: "SKU-001235", details: "Adjusted qty from 55 to 45 — Damage write-off", ip: "192.168.1.12" },
  { id: "AUD-20240", time: "2024-12-16 15:30:11", user: "Priya Sharma", role: "Packer", module: "Orders", action: "Order Packed", entity: "ORD-2024-155", details: "Order packed and ready for dispatch", ip: "192.168.1.18" },
  { id: "AUD-20239", time: "2024-12-16 14:55:47", user: "Ravi Kumar", role: "Picker", module: "Orders", action: "Pick Completed", entity: "ORD-2024-156", details: "All 3 line items picked successfully", ip: "192.168.1.21" },
  { id: "AUD-20238", time: "2024-12-16 13:20:00", user: "Kavitha Rao", role: "Supervisor", module: "Gate", action: "Gate Entry Created", entity: "GE-2024-089", details: "Vehicle TN-45-AB-1234 registered at Gate 1", ip: "192.168.1.10" },
  { id: "AUD-20237", time: "2024-12-16 12:08:33", user: "System", role: "Automation", module: "Billing", action: "Invoice Generated", entity: "INV-2024-112", details: "Auto-generated invoice for Acme Foods — Dec 1–15", ip: "System" },
  { id: "AUD-20236", time: "2024-12-16 11:45:00", user: "Vijay Kumar", role: "Manager", module: "SKU Master", action: "SKU Updated", entity: "SKU-001238", details: "Status changed from Active to Inactive", ip: "192.168.1.12" },
  { id: "AUD-20235", time: "2024-12-16 10:30:20", user: "Meena Patel", role: "QC Inspector", module: "GRN", action: "QC Completed", entity: "GRN-2024-089", details: "Quality check passed — All items approved", ip: "192.168.1.25" },
  { id: "AUD-20234", time: "2024-12-16 09:15:10", user: "System", role: "Automation", module: "Scheduler", action: "Job Executed", entity: "JOB-001", details: "Daily stock reconciliation completed — 12 min", ip: "System" },
  { id: "AUD-20233", time: "2024-12-16 08:42:05", user: "Arjun Nair", role: "Picker", module: "GRN", action: "GRN Created", entity: "GRN-2024-089", details: "GRN created for PO-2024-0089 — Acme Foods", ip: "192.168.1.30" },
  { id: "AUD-20232", time: "2024-12-15 23:59:15", user: "System", role: "Automation", module: "Workforce", action: "Attendance Sync Failed", entity: "JOB-006", details: "Error: DB timeout during attendance sync", ip: "System" },
  { id: "AUD-20231", time: "2024-12-15 22:15:40", user: "System", role: "Automation", module: "Scheduler", action: "Job Executed", entity: "JOB-004", details: "Nightly cycle count plan generated — 18 bins queued", ip: "System" },
  { id: "AUD-20230", time: "2024-12-15 19:32:08", user: "Kavitha Rao", role: "Supervisor", module: "Gate", action: "Gate Exit Approved", entity: "GE-2024-088", details: "Vehicle KA-09-CD-5521 released after weighbridge check", ip: "192.168.1.10" },
  { id: "AUD-20229", time: "2024-12-15 18:04:55", user: "Priya Sharma", role: "Packer", module: "Orders", action: "Order Packed", entity: "ORD-2024-154", details: "Order packed into 4 cartons — Global Oils", ip: "192.168.1.18" },
  { id: "AUD-20228", time: "2024-12-15 17:21:19", user: "Rahul Mehta", role: "Supervisor", module: "Inventory", action: "Bin Transfer", entity: "SKU-001240", details: "Moved 120 units from A-12-03 to B-04-11", ip: "192.168.1.34" },
  { id: "AUD-20227", time: "2024-12-15 16:10:02", user: "Vijay Kumar", role: "Manager", module: "Billing", action: "Rate Card Updated", entity: "RATE-007", details: "Storage rate revised to ₹18/pallet/day — Agro Corp", ip: "192.168.1.12" },
  { id: "AUD-20226", time: "2024-12-15 15:44:31", user: "Arjun Nair", role: "Picker", module: "Orders", action: "Pick Completed", entity: "ORD-2024-153", details: "All 7 line items picked from zone B", ip: "192.168.1.30" },
  { id: "AUD-20225", time: "2024-12-15 14:12:47", user: "Meena Patel", role: "QC Inspector", module: "GRN", action: "QC Rejected", entity: "GRN-2024-088", details: "12 cartons rejected — seal tampering observed", ip: "192.168.1.25" },
  { id: "AUD-20224", time: "2024-12-15 12:50:23", user: "Deepa Menon", role: "Billing Executive", module: "Billing", action: "Invoice Approved", entity: "INV-2024-111", details: "Invoice approved for Sweet Mills — ₹2,48,600", ip: "192.168.1.41" },
  { id: "AUD-20223", time: "2024-12-15 11:07:16", user: "System", role: "Automation", module: "Inventory", action: "Reorder Alert Raised", entity: "SKU-001229", details: "Stock below reorder level — 40 units remaining", ip: "System" },
  { id: "AUD-20222", time: "2024-12-15 09:38:44", user: "Ravi Kumar", role: "Picker", module: "Orders", action: "Pick Started", entity: "ORD-2024-153", details: "Wave 12 assigned — 7 lines across 3 aisles", ip: "192.168.1.21" },
  { id: "AUD-20221", time: "2024-12-14 21:05:00", user: "System", role: "Automation", module: "Billing", action: "Invoice Generation Failed", entity: "JOB-009", details: "Error: missing rate card for client Tropical Co", ip: "System" },
  { id: "AUD-20220", time: "2024-12-14 18:47:12", user: "Sanjay Gupta", role: "Admin", module: "SKU Master", action: "SKU Created", entity: "SKU-001241", details: "New SKU added — Refined Sunflower Oil 5L, Apex Pharma", ip: "192.168.1.05" },
  { id: "AUD-20219", time: "2024-12-14 17:15:33", user: "Kavitha Rao", role: "Supervisor", module: "Workforce", action: "Shift Assigned", entity: "SHIFT-2024-221", details: "Night shift roster published — 14 associates", ip: "192.168.1.10" },
  { id: "AUD-20218", time: "2024-12-14 16:02:58", user: "Priya Sharma", role: "Packer", module: "Orders", action: "Order Shipped", entity: "ORD-2024-152", details: "Handed to carrier BlueDart — AWB 7729145530", ip: "192.168.1.18" },
  { id: "AUD-20217", time: "2024-12-14 14:33:20", user: "Anita Desai", role: "QC Inspector", module: "GRN", action: "QC Completed", entity: "GRN-2024-087", details: "Quality check passed — 340 of 340 units approved", ip: "192.168.1.27" },
  { id: "AUD-20216", time: "2024-12-14 13:11:05", user: "Vijay Kumar", role: "Manager", module: "Inventory", action: "Stock Adjustment", entity: "SKU-001232", details: "Adjusted qty from 210 to 198 — cycle count variance", ip: "192.168.1.12" },
  { id: "AUD-20215", time: "2024-12-14 11:29:41", user: "Suresh Yadav", role: "Loader", module: "Gate", action: "Gate Entry Created", entity: "GE-2024-087", details: "Vehicle MH-12-EF-8890 registered at Gate 2 — Fresh Farms", ip: "192.168.1.36" },
  { id: "AUD-20214", time: "2024-12-14 10:04:17", user: "System", role: "Automation", module: "Scheduler", action: "Job Executed", entity: "JOB-002", details: "Client billing snapshot completed — 9 min 40 s", ip: "System" },
  { id: "AUD-20213", time: "2024-12-14 08:55:36", user: "Arjun Nair", role: "Picker", module: "GRN", action: "GRN Created", entity: "GRN-2024-087", details: "GRN created for PO-2024-0087 — Salt Works", ip: "192.168.1.30" },
  { id: "AUD-20212", time: "2024-12-13 20:18:52", user: "System", role: "Automation", module: "Inventory", action: "Expiry Sweep Failed", entity: "JOB-011", details: "Error: batch table locked, sweep aborted at 62%", ip: "System" },
  { id: "AUD-20211", time: "2024-12-13 18:40:09", user: "Sanjay Gupta", role: "Admin", module: "Workforce", action: "User Role Changed", entity: "USR-0044", details: "Ravi Kumar granted Supervisor access to zone C", ip: "192.168.1.05" },
  { id: "AUD-20210", time: "2024-12-13 16:57:24", user: "Meena Patel", role: "QC Inspector", module: "Inventory", action: "Hold Released", entity: "SKU-001236", details: "Quarantine hold released on 88 units after retest", ip: "192.168.1.25" },
  { id: "AUD-20209", time: "2024-12-13 15:22:11", user: "Deepa Menon", role: "Billing Executive", module: "Billing", action: "Payment Recorded", entity: "PAY-2024-0311", details: "NEFT received from Acme Foods — ₹4,12,300", ip: "192.168.1.41" },
  { id: "AUD-20208", time: "2024-12-13 13:48:03", user: "Kavitha Rao", role: "Supervisor", module: "Gate", action: "Gate Exit Approved", entity: "GE-2024-086", details: "Vehicle TN-45-AB-1234 released — dispatch complete", ip: "192.168.1.10" },
  { id: "AUD-20207", time: "2024-12-13 11:36:47", user: "Vijay Kumar", role: "Manager", module: "SKU Master", action: "SKU Updated", entity: "SKU-001231", details: "Shelf life changed from 180 to 240 days", ip: "192.168.1.12" },
  { id: "AUD-20206", time: "2024-12-13 09:14:30", user: "Ravi Kumar", role: "Picker", module: "Orders", action: "Order Cancelled", entity: "ORD-2024-151", details: "Cancelled at client request — Global Oils", ip: "192.168.1.21" },
  { id: "AUD-20205", time: "2024-12-12 22:30:00", user: "System", role: "Automation", module: "Scheduler", action: "Job Executed", entity: "JOB-001", details: "Daily stock reconciliation completed — 11 min", ip: "System" },
  { id: "AUD-20204", time: "2024-12-12 19:52:18", user: "Rahul Mehta", role: "Supervisor", module: "Workforce", action: "Attendance Approved", entity: "SHIFT-2024-219", details: "Evening shift attendance signed off — 11 present, 2 absent", ip: "192.168.1.34" },
  { id: "AUD-20203", time: "2024-12-12 17:26:44", user: "Priya Sharma", role: "Packer", module: "Orders", action: "Order Packed", entity: "ORD-2024-150", details: "Order packed — 2 cartons, 18.4 kg, Tropical Co", ip: "192.168.1.18" },
  { id: "AUD-20202", time: "2024-12-12 15:03:29", user: "Anita Desai", role: "QC Inspector", module: "GRN", action: "QC Completed", entity: "GRN-2024-086", details: "Sample check passed — moisture within tolerance", ip: "192.168.1.27" },
  { id: "AUD-20201", time: "2024-12-12 12:41:56", user: "Suresh Yadav", role: "Loader", module: "Inventory", action: "Putaway Completed", entity: "SKU-001237", details: "410 units put away to C-08-02 from staging", ip: "192.168.1.36" },
]

const moduleIcons: Record<string, React.ReactNode> = {
  Inventory: <Package className="w-3.5 h-3.5" />,
  Orders: <ShoppingCart className="w-3.5 h-3.5" />,
  Gate: <Truck className="w-3.5 h-3.5" />,
  Billing: <DollarSign className="w-3.5 h-3.5" />,
  GRN: <Package className="w-3.5 h-3.5" />,
  Scheduler: <Shield className="w-3.5 h-3.5" />,
  "SKU Master": <Package className="w-3.5 h-3.5" />,
  Workforce: <User className="w-3.5 h-3.5" />,
}

const moduleColors: Record<string, string> = {
  Inventory: "text-brand bg-brand/15",
  Orders: "text-success bg-success/15",
  Gate: "text-warning bg-warning/15",
  Billing: "text-purple-400 bg-purple-400/15",
  GRN: "text-brand bg-brand/15",
  Scheduler: "text-muted-foreground bg-muted",
  "SKU Master": "text-brand bg-brand/15",
  Workforce: "text-success bg-success/15",
}

const PAGE_SIZE = 5

function isFailure(log: AuditLog) {
  return log.action.toLowerCase().includes("failed") || log.action.toLowerCase().includes("error")
}

export default function AuditTrailPage() {
  const [search, setSearch] = useState("")
  const [moduleFilter, setModuleFilter] = useState("All Modules")
  const [userFilter, setUserFilter] = useState("All Users")
  const [page, setPage] = useState(1)

  // Applied date range (drives the table); draft lives in the modal until submitted.
  const [range, setRange] = useState({ from: "", to: "" })
  const [rangeOpen, setRangeOpen] = useState(false)
  const [draftRange, setDraftRange] = useState({ from: "", to: "" })
  const [rangeErrors, setRangeErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<AuditLog | null>(null)

  const filtered = auditLogs.filter((log) => {
    const q = search.toLowerCase()
    const day = log.time.slice(0, 10)
    return (
      (log.id.toLowerCase().includes(q) ||
        log.user.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.entity.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)) &&
      (moduleFilter === "All Modules" || log.module === moduleFilter) &&
      (userFilter === "All Users" || log.user === userFilter) &&
      (!range.from || day >= range.from) &&
      (!range.to || day <= range.to)
    )
  })

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const rangeActive = !!(range.from || range.to)

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
    setPage(1)
    notify.success("Date range applied", `Showing events ${draftRange.from || "the beginning"} → ${draftRange.to || "now"}.`)
  }

  function clearRange() {
    setRange({ from: "", to: "" })
    setDraftRange({ from: "", to: "" })
    setPage(1)
    notify.info("Date range cleared", "Showing all audit events.")
  }

  const stats = [
    { label: "Total Events (Today)", value: filtered.length.toString(), sub: rangeActive ? "In selected range" : "All modules" },
    { label: "User Actions", value: filtered.filter((l) => l.role !== "Automation").length.toString(), sub: "Manual operations" },
    { label: "System Events", value: filtered.filter((l) => l.role === "Automation").length.toString(), sub: "Automated" },
    { label: "Critical Events", value: filtered.filter(isFailure).length.toString(), sub: "Failures & errors" },
  ]

  return (
    <div className="h-full overflow-y-auto">
      <div className="w-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Audit Trail</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Complete activity log for compliance and traceability
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ExportButton data={filtered} filename="audit-trail" label="Export Log" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="p-3.5 rounded-xl border border-border bg-card">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <Shield className={cn("w-5 h-5", i === 3 ? "text-danger" : "text-brand")} />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className={cn("text-xs mt-1", i === 3 ? "text-danger" : "text-muted-foreground")}>{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-lg border border-border bg-card">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground text-foreground"
              placeholder="Search by user, action, entity..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          {[
            { value: moduleFilter, options: ["All Modules", "Inventory", "Orders", "Gate", "Billing", "GRN", "Scheduler", "SKU Master", "Workforce"], onChange: setModuleFilter },
            { value: userFilter, options: ["All Users", "Vijay Kumar", "Priya Sharma", "Ravi Kumar", "Kavitha Rao", "Meena Patel", "Arjun Nair", "System"], onChange: setUserFilter },
          ].map((f, i) => (
            <div key={i} className="relative">
              <select
                className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-border bg-card text-sm text-foreground outline-none cursor-pointer"
                value={f.value}
                onChange={(e) => { f.onChange(e.target.value); setPage(1) }}
              >
                {f.options.map((o) => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          ))}
          <button
            onClick={openRange}
            title="Filter by date range"
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm transition-colors",
              rangeActive ? "bg-brand text-white border-brand" : "bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            <Filter className="w-4 h-4" />
            {rangeActive ? `${range.from || "Any"} → ${range.to || "Any"}` : "Date Range"}
          </button>
          {rangeActive && (
            <button
              onClick={clearRange}
              title="Clear date range"
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border bg-card text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <XIcon className="w-4 h-4" /> Clear
            </button>
          )}
        </div>

        {/* Log table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["Log ID", "Timestamp", "User", "Module", "Action", "Entity", "Details", "IP", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((log, i) => {
                  const isFailed = isFailure(log)
                  return (
                    <tr
                      key={log.id}
                      className={cn(
                        "border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors",
                        i % 2 === 1 ? "bg-muted/10" : "",
                        isFailed ? "bg-danger/5" : ""
                      )}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button onClick={() => setDetail(log)} title={`View ${log.id}`} className="text-brand font-medium text-xs font-mono hover:underline">{log.id}</button>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 shrink-0" />
                          {log.time}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center shrink-0">
                            <User className="w-3 h-3 text-brand" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-foreground">{log.user}</p>
                            <p className="text-[10px] text-muted-foreground">{log.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium w-fit", moduleColors[log.module] ?? "text-muted-foreground bg-muted")}>
                          {moduleIcons[log.module]}
                          {log.module}
                        </span>
                      </td>
                      <td className={cn("px-4 py-3 font-medium whitespace-nowrap text-xs", isFailed ? "text-danger" : "text-foreground")}>
                        {log.action}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button onClick={() => setDetail(log)} title={`View entity ${log.entity}`} className="text-xs font-mono text-brand hover:underline">{log.entity}</button>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs max-w-64">
                        <span className="line-clamp-1">{log.details}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-[10px] font-mono">
                        {log.ip}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setDetail(log)} title="View details" className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Shield className="w-10 h-10 mb-3 opacity-40" />
                <p className="font-medium">No audit records found</p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
            <span className="text-xs text-muted-foreground">
              Showing {paged.length} of {filtered.length} records
            </span>
            <div className="flex gap-1">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  title={`Page ${p}`}
                  className={cn("w-7 h-7 rounded-lg text-xs transition-colors", p === safePage ? "bg-brand text-white" : "text-muted-foreground hover:bg-muted")}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Date range filter */}
      <Modal
        open={rangeOpen}
        onOpenChange={(o) => { setRangeOpen(o); if (!o) setRangeErrors({}) }}
        title="Filter by Date Range"
        description="Narrow the audit log to events within a period"
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
            <TextInput type="date" value={draftRange.from} invalid={!!rangeErrors.from} onChange={(e) => setDraftRange({ ...draftRange, from: e.target.value })} />
          </Field>
          <Field label="To Date" error={rangeErrors.to} hint="Leave a field empty for an open-ended range">
            <TextInput type="date" value={draftRange.to} invalid={!!rangeErrors.to} onChange={(e) => setDraftRange({ ...draftRange, to: e.target.value })} />
          </Field>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Audit event detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Log ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Timestamp" value={detail.time} />
            <DetailRow label="User" value={detail.user} />
            <DetailRow label="Role" value={detail.role} />
            <DetailRow label="Module" value={
              <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium", moduleColors[detail.module] ?? "text-muted-foreground bg-muted")}>
                {moduleIcons[detail.module]}{detail.module}
              </span>
            } />
            <DetailRow label="Action" value={<span className={isFailure(detail) ? "text-danger font-medium" : "font-medium"}>{detail.action}</span>} />
            <DetailRow label="Entity" value={<span className="font-mono">{detail.entity}</span>} />
            <DetailRow label="Details" value={detail.details} />
            <DetailRow label="Source IP" value={<span className="font-mono">{detail.ip}</span>} />
          </div>
        )}
      </Drawer>
    </div>
  )
}
