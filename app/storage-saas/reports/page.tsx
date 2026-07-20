"use client"

import { useState, type ReactNode } from "react"
import { BarChart2, Download, Clock, Package, DollarSign, Users, FileText, Plus, Trash2, Check } from "lucide-react"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, TextArea, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Report = {
  id: string; name: string; category: string; desc: string; format: string; icon: ReactNode
}

const periods = ["Last 7 Days", "Last 30 Days", "This Month", "Last Month", "Custom Range"]

const initialReports: Report[] = [
  { id: "RPT-01", name: "Customer Stock Ledger", category: "Inventory", desc: "Full inbound/outbound movements per customer, per SKU with daily closing balances", format: "XLSX", icon: <Package className="w-4 h-4" /> },
  { id: "RPT-02", name: "Storage Occupancy Report", category: "Space", desc: "Rack-level utilisation by customer with average CBM occupied and revenue per bay", format: "XLSX", icon: <BarChart2 className="w-4 h-4" /> },
  { id: "RPT-03", name: "Drop-Off Receipt Log", category: "Inbound", desc: "All drop-off intakes with customer, carton count, CBM, lot numbers, and receiving timestamps", format: "XLSX", icon: <FileText className="w-4 h-4" /> },
  { id: "RPT-04", name: "Customer Release History", category: "Outbound", desc: "Approved and dispatched stock releases by customer with delivery confirmation", format: "XLSX", icon: <FileText className="w-4 h-4" /> },
  { id: "RPT-05", name: "Billing Statement", category: "Billing", desc: "Per-customer invoice summary with storage days, handling events, and VAS charges", format: "PDF", icon: <DollarSign className="w-4 h-4" /> },
  { id: "RPT-06", name: "Revenue Summary", category: "Billing", desc: "Total revenue by customer, billing period, and service type with MoM comparison", format: "XLSX", icon: <DollarSign className="w-4 h-4" /> },
  { id: "RPT-07", name: "Customer Onboarding Log", category: "Customers", desc: "All registered customers with onboarding date, contract tier, and current storage allocation", format: "XLSX", icon: <Users className="w-4 h-4" /> },
  { id: "RPT-08", name: "Ageing & Near-Expiry Report", category: "Inventory", desc: "Items aged over 60/90/120 days and items within 30/60 days of expiry across all customers", format: "XLSX", icon: <Clock className="w-4 h-4" /> },
]

const categories = ["All", "Inventory", "Space", "Inbound", "Outbound", "Billing", "Customers"]

const formatStyle: Record<string, string> = {
  XLSX: "bg-success/15 text-success",
  PDF: "bg-danger/15 text-danger",
}

const categoryColor: Record<string, string> = {
  Inventory: "text-brand",
  Space: "text-purple-400",
  Inbound: "text-orange-400",
  Outbound: "text-warning",
  Billing: "text-success",
  Customers: "text-blue-400",
}

const CATEGORY_OPTIONS = categories.filter(c => c !== "All")
const FORMATS = ["XLSX", "PDF"] as const
const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const REVENUE_BARS = [58, 72, 61, 88, 94, 79, 84, 92, 87, 96, 74, 100]

function iconFor(category: string): ReactNode {
  switch (category) {
    case "Inventory": return <Package className="w-4 h-4" />
    case "Space": return <BarChart2 className="w-4 h-4" />
    case "Billing": return <DollarSign className="w-4 h-4" />
    case "Customers": return <Users className="w-4 h-4" />
    default: return <FileText className="w-4 h-4" />
  }
}

const emptyForm = { name: "", category: "", desc: "", format: "" }

export default function StorageSaaSReportsPage() {
  const [reports, setReports] = useState<Report[]>(initialReports)
  const [category, setCategory] = useState("All")
  const [period, setPeriod] = useState("Last 30 Days")

  const [downloaded, setDownloaded] = useState<string[]>([])
  const [selectedMonth, setSelectedMonth] = useState(11)

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Report | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Report | null>(null)

  const filtered = reports.filter(r => category === "All" || r.category === category)

  const monthRevenue = REVENUE_BARS[selectedMonth] * 4000

  const stats = [
    { label: "Reports Available", value: String(reports.length), icon: <FileText className="w-4 h-4" />, color: "text-brand", bg: "bg-brand/15" },
    { label: "Total CBM In Use", value: "842", icon: <Package className="w-4 h-4" />, color: "text-warning", bg: "bg-warning/15" },
    { label: `Revenue (${MONTH_NAMES[selectedMonth].slice(0, 3)})`, value: `₹${(monthRevenue / 100000).toFixed(1)}L`, icon: <DollarSign className="w-4 h-4" />, color: "text-success", bg: "bg-success/15" },
    { label: "Space Utilisation", value: "74%", icon: <BarChart2 className="w-4 h-4" />, color: "text-purple-400", bg: "bg-purple-400/15" },
  ]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Report name is required"
    else if (reports.some(r => r.name.toLowerCase() === form.name.trim().toLowerCase())) e.name = "A report with this name already exists"
    if (!form.category) e.category = "Select a category"
    if (!form.desc.trim()) e.desc = "Description is required"
    if (!form.format) e.format = "Select an output format"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createReport() {
    if (!validate()) return
    const seq = String(reports.length + 1).padStart(2, "0")
    const next: Report = {
      id: `RPT-${seq}`,
      name: form.name.trim(),
      category: form.category,
      desc: form.desc.trim(),
      format: form.format,
      icon: iconFor(form.category),
    }
    setReports(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Report created", `${next.id} — ${next.name} (${next.format})`)
  }

  function downloadReport(r: Report) {
    setDownloaded(prev => (prev.includes(r.id) ? prev : [...prev, r.id]))
    notify.success("Download started", `${r.name} — ${r.format} for ${period}`)
  }

  function deleteReport(r: Report) {
    setReports(prev => prev.filter(x => x.id !== r.id))
    setDownloaded(prev => prev.filter(id => id !== r.id))
    if (detail?.id === r.id) setDetail(null)
    notify.warning("Report deleted", `${r.name} has been removed from this workspace.`)
  }

  function selectMonth(i: number) {
    setSelectedMonth(i)
    notify.info(MONTH_NAMES[i], `Revenue ₹${(REVENUE_BARS[i] * 4000).toLocaleString()}`)
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground">Reports &amp; Analytics</h1>
          <p className="text-sm text-muted-foreground">Storage-as-a-Service operational and financial reports</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-card text-xs text-foreground outline-none cursor-pointer"
          >
            {periods.map(p => <option key={p}>{p}</option>)}
          </select>
          <ExportButton data={filtered.map(r => ({ id: r.id, name: r.name, category: r.category, desc: r.desc, format: r.format }))} filename="storage-saas-reports" label="Export All" />
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F7941D] text-white text-xs font-semibold hover:bg-[#F7941D]/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Report
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", s.bg, s.color)}>
              {s.icon}
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1 p-0.5 rounded-xl bg-muted/40 border border-border w-fit">
        {categories.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              category === c ? "bg-brand text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/60"
            )}>
            {c}
          </button>
        ))}
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map(r => (
          <div
            key={r.id}
            onClick={() => setDetail(r)}
            className="rounded-2xl border border-border bg-card p-4 hover:border-brand/40 hover:bg-brand/5 transition-all group cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand/15 flex items-center justify-center text-brand shrink-0 group-hover:bg-brand/25 transition-colors">
                {r.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-foreground">{r.name}</p>
                  <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded", formatStyle[r.format])}>{r.format}</span>
                  {downloaded.includes(r.id) && (
                    <span className="flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-success/15 text-success">
                      <Check className="w-2.5 h-2.5" /> Downloaded
                    </span>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); setDeleteTarget(r) }}
                    title="Delete report"
                    className="ml-auto p-1 rounded-md text-muted-foreground hover:bg-danger/10 hover:text-danger transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className={cn("text-[10px] font-semibold", categoryColor[r.category] ?? "text-muted-foreground")}>{r.category}</span>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.desc}</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-[10px] text-muted-foreground">Period: {period}</p>
                  <button
                    onClick={e => { e.stopPropagation(); downloadReport(r) }}
                    title={`Download ${r.name}`}
                    className="flex items-center gap-1 text-xs text-brand font-medium hover:underline"
                  >
                    <Download className="w-3 h-3" /> {downloaded.includes(r.id) ? "Download again" : "Download"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="sm:col-span-2 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <FileText className="w-6 h-6 mx-auto text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground mt-2">No reports in this category</p>
            <p className="text-xs text-muted-foreground mt-1">Pick another category or create a new report.</p>
          </div>
        )}
      </div>

      {/* Mini chart placeholder */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-foreground">Monthly Revenue Trend</h2>
          <span className="text-xs text-muted-foreground">{MONTH_NAMES[selectedMonth]} · {period}</span>
        </div>
        <div className="flex items-end gap-2 h-32">
          {REVENUE_BARS.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => selectMonth(i)}
                className={cn(
                  "w-full rounded-t-md transition-colors cursor-pointer",
                  selectedMonth === i ? "bg-brand" : "bg-brand/70 hover:bg-brand"
                )}
                style={{ height: `${v}%` }}
                title={`₹${(v * 4000).toLocaleString()}`}
                aria-label={`${MONTH_NAMES[i]} revenue ₹${(v * 4000).toLocaleString()}`}
              />
              <span className={cn("text-[8px] hidden sm:block", selectedMonth === i ? "text-brand font-bold" : "text-muted-foreground")}>
                {MONTHS[i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Create report */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="New Report"
        description="Define a new Storage-as-a-Service report"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createReport} submitLabel="Create Report" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Report Name" required error={errors.name}>
            <TextInput value={form.name} invalid={!!errors.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Weekly Throughput Summary" />
          </Field>
          <Field label="Category" required error={errors.category}>
            <Select value={form.category} invalid={!!errors.category} onChange={e => setForm({ ...form, category: e.target.value })} options={CATEGORY_OPTIONS} placeholder="Select Category" />
          </Field>
          <Field label="Output Format" required error={errors.format}>
            <Select value={form.format} invalid={!!errors.format} onChange={e => setForm({ ...form, format: e.target.value })} options={FORMATS} placeholder="Select Format" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description" required error={errors.desc}>
              <TextArea value={form.desc} invalid={!!errors.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="What does this report contain?" />
            </Field>
          </div>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.name ?? ""}
        description="Report detail"
        footer={
          <>
            <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Close
            </button>
            <button
              onClick={() => detail && downloadReport(detail)}
              className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          </>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Report ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Name" value={detail.name} />
            <DetailRow label="Category" value={<span className={cn("font-semibold", categoryColor[detail.category] ?? "text-muted-foreground")}>{detail.category}</span>} />
            <DetailRow label="Description" value={detail.desc} />
            <DetailRow label="Format" value={<span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded", formatStyle[detail.format])}>{detail.format}</span>} />
            <DetailRow label="Period" value={period} />
            <DetailRow label="Last Download" value={downloaded.includes(detail.id) ? "Downloaded this session" : "Not downloaded yet"} />
          </div>
        )}
      </Drawer>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this report?"
        message={`${deleteTarget?.name} (${deleteTarget?.id}) will be removed from the report catalogue. This cannot be undone.`}
        confirmLabel="Delete Report"
        cancelLabel="Keep It"
        onConfirm={() => deleteTarget && deleteReport(deleteTarget)}
      />
    </div>
  )
}
