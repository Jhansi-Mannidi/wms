"use client"
import { useState } from "react"
import { BarChart2, FileText, Package, RefreshCw, TrendingDown, AlertTriangle, Download, Eye, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type ReportDef = {
  id: number; name: string; desc: string; icon: React.ReactNode; lastRun: string; format: string
}

type GeneratedReport = {
  id: string; report: string; range: string; format: string; scope: string; generatedAt: string; rows: number
}

const initialReports: ReportDef[] = [
  { id: 1, name: "Stock Valuation Report", desc: "Total inventory value by SKU and category", icon: <BarChart2 className="w-5 h-5 text-brand" />, lastRun: "Today 09:00", format: "CSV / PDF" },
  { id: 2, name: "Ageing Report", desc: "Inventory ageing by lot and batch", icon: <RefreshCw className="w-5 h-5 text-amber-500" />, lastRun: "Yesterday", format: "CSV" },
  { id: 3, name: "Low Stock Alert Report", desc: "SKUs below reorder level", icon: <AlertTriangle className="w-5 h-5 text-danger" />, lastRun: "Today 06:00", format: "CSV / Email" },
  { id: 4, name: "Movement Summary", desc: "Inbound / outbound movements by period", icon: <Package className="w-5 h-5 text-blue-500" />, lastRun: "2024-07-19", format: "CSV" },
  { id: 5, name: "Write-off Summary", desc: "Losses by reason code and category", icon: <TrendingDown className="w-5 h-5 text-danger" />, lastRun: "2024-07-15", format: "CSV / PDF" },
  { id: 6, name: "Cycle Count Accuracy", desc: "Count accuracy percentage by zone", icon: <FileText className="w-5 h-5 text-success" />, lastRun: "2024-07-14", format: "PDF" },
  { id: 7, name: "Expiry & Shelf Life Report", desc: "SKUs approaching expiry by batch and lot", icon: <AlertTriangle className="w-5 h-5 text-amber-500" />, lastRun: "2024-07-18", format: "CSV / PDF" },
  { id: 8, name: "Stock Transfer Log", desc: "Inter-warehouse transfers by period", icon: <Package className="w-5 h-5 text-blue-500" />, lastRun: "Today 07:30", format: "CSV" },
  { id: 9, name: "Slow Moving Stock", desc: "SKUs with no movement in 90 days", icon: <TrendingDown className="w-5 h-5 text-amber-500" />, lastRun: "2024-07-12", format: "CSV / PDF" },
  { id: 10, name: "Bin Utilisation Report", desc: "Fill percentage by zone and aisle", icon: <BarChart2 className="w-5 h-5 text-brand" />, lastRun: "Yesterday", format: "PDF" },
  { id: 11, name: "Putaway Compliance", desc: "Putaway accuracy by operator and shift", icon: <FileText className="w-5 h-5 text-success" />, lastRun: "2024-07-17", format: "CSV / Email" },
  { id: 12, name: "Reorder Recommendation", desc: "Suggested purchase quantities by SKU", icon: <RefreshCw className="w-5 h-5 text-brand" />, lastRun: "Today 05:30", format: "CSV / PDF" },
]

const initialGenerated: GeneratedReport[] = [
  { id: "RPT-2024-0042", report: "Stock Valuation Report", range: "2024-07-01 → 2024-07-20", format: "PDF", scope: "All Warehouses", generatedAt: "2024-07-20 09:00", rows: 1284 },
  { id: "RPT-2024-0041", report: "Low Stock Alert Report", range: "2024-07-01 → 2024-07-20", format: "CSV", scope: "WH-Chennai", generatedAt: "2024-07-20 06:00", rows: 37 },
  { id: "RPT-2024-0040", report: "Movement Summary", range: "2024-07-01 → 2024-07-19", format: "CSV", scope: "WH-Bengaluru", generatedAt: "2024-07-19 18:30", rows: 842 },
  { id: "RPT-2024-0039", report: "Ageing Report", range: "2024-06-01 → 2024-07-19", format: "CSV", scope: "All Warehouses", generatedAt: "2024-07-19 08:15", rows: 613 },
  { id: "RPT-2024-0038", report: "Expiry & Shelf Life Report", range: "2024-07-01 → 2024-07-18", format: "PDF", scope: "WH-Hyderabad", generatedAt: "2024-07-18 17:45", rows: 209 },
  { id: "RPT-2024-0037", report: "Putaway Compliance", range: "2024-07-08 → 2024-07-18", format: "CSV", scope: "WH-Chennai", generatedAt: "2024-07-18 09:20", rows: 476 },
  { id: "RPT-2024-0036", report: "Stock Transfer Log", range: "2024-07-01 → 2024-07-17", format: "CSV", scope: "All Warehouses", generatedAt: "2024-07-17 16:05", rows: 1058 },
  { id: "RPT-2024-0035", report: "Reorder Recommendation", range: "2024-07-01 → 2024-07-17", format: "PDF", scope: "WH-Pune", generatedAt: "2024-07-17 06:00", rows: 154 },
  { id: "RPT-2024-0034", report: "Low Stock Alert Report", range: "2024-07-10 → 2024-07-16", format: "Email", scope: "WH-Bengaluru", generatedAt: "2024-07-16 06:00", rows: 41 },
  { id: "RPT-2024-0033", report: "Write-off Summary", range: "2024-06-15 → 2024-07-15", format: "PDF", scope: "All Warehouses", generatedAt: "2024-07-15 14:10", rows: 88 },
  { id: "RPT-2024-0032", report: "Cycle Count Accuracy", range: "2024-07-01 → 2024-07-15", format: "PDF", scope: "WH-Chennai", generatedAt: "2024-07-15 11:30", rows: 126 },
  { id: "RPT-2024-0031", report: "Slow Moving Stock", range: "2024-04-15 → 2024-07-14", format: "CSV", scope: "WH-Hyderabad", generatedAt: "2024-07-14 10:00", rows: 317 },
  { id: "RPT-2024-0030", report: "Bin Utilisation Report", range: "2024-07-01 → 2024-07-14", format: "PDF", scope: "WH-Pune", generatedAt: "2024-07-14 07:45", rows: 984 },
  { id: "RPT-2024-0029", report: "Stock Valuation Report", range: "2024-06-01 → 2024-06-30", format: "PDF", scope: "All Warehouses", generatedAt: "2024-07-12 09:00", rows: 1272 },
  { id: "RPT-2024-0028", report: "Movement Summary", range: "2024-06-01 → 2024-06-30", format: "CSV", scope: "WH-Chennai", generatedAt: "2024-07-11 15:20", rows: 796 },
  { id: "RPT-2024-0027", report: "Ageing Report", range: "2024-05-01 → 2024-06-30", format: "CSV", scope: "WH-Bengaluru", generatedAt: "2024-07-10 08:00", rows: 588 },
  { id: "RPT-2024-0026", report: "Expiry & Shelf Life Report", range: "2024-06-01 → 2024-06-30", format: "CSV", scope: "WH-Pune", generatedAt: "2024-07-09 13:40", rows: 193 },
  { id: "RPT-2024-0025", report: "Putaway Compliance", range: "2024-06-01 → 2024-06-30", format: "Email", scope: "WH-Hyderabad", generatedAt: "2024-07-08 09:10", rows: 452 },
  { id: "RPT-2024-0024", report: "Reorder Recommendation", range: "2024-06-01 → 2024-06-30", format: "CSV", scope: "All Warehouses", generatedAt: "2024-07-05 06:00", rows: 168 },
  { id: "RPT-2024-0023", report: "Write-off Summary", range: "2024-05-01 → 2024-05-31", format: "CSV", scope: "WH-Chennai", generatedAt: "2024-07-03 12:00", rows: 74 },
  { id: "RPT-2024-0022", report: "Cycle Count Accuracy", range: "2024-06-01 → 2024-06-30", format: "PDF", scope: "WH-Bengaluru", generatedAt: "2024-07-02 11:00", rows: 118 },
  { id: "RPT-2024-0021", report: "Bin Utilisation Report", range: "2024-06-01 → 2024-06-30", format: "PDF", scope: "WH-Hyderabad", generatedAt: "2024-07-01 07:30", rows: 951 },
  { id: "RPT-2024-0020", report: "Slow Moving Stock", range: "2024-04-01 → 2024-06-30", format: "PDF", scope: "WH-Pune", generatedAt: "2024-06-28 16:45", rows: 288 },
  { id: "RPT-2024-0019", report: "Stock Transfer Log", range: "2024-06-01 → 2024-06-27", format: "CSV", scope: "All Warehouses", generatedAt: "2024-06-27 17:15", rows: 1024 },
]

const SCOPES = ["All Warehouses", "WH-Chennai", "WH-Bengaluru", "WH-Hyderabad", "WH-Pune"] as const

/** "CSV / PDF" -> ["CSV", "PDF"] so the format picker only offers what the report supports. */
function formatOptions(format: string) {
  return format.split("/").map(f => f.trim()).filter(Boolean)
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function monthStart() {
  const d = new Date()
  return `${d.toISOString().slice(0, 7)}-01`
}

const emptyForm = { from: monthStart(), to: today(), format: "", scope: "All Warehouses" }

export default function InventoryReportsPage() {
  const [reports, setReports] = useState<ReportDef[]>(initialReports)
  const [generated, setGenerated] = useState<GeneratedReport[]>(initialGenerated)

  const [runTarget, setRunTarget] = useState<ReportDef | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<GeneratedReport | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<GeneratedReport | null>(null)

  function openRun(r: ReportDef) {
    const opts = formatOptions(r.format)
    setForm({ ...emptyForm, format: opts.length === 1 ? opts[0] : "" })
    setErrors({})
    setRunTarget(r)
  }

  function closeRun() {
    setRunTarget(null)
    setForm(emptyForm)
    setErrors({})
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.from) e.from = "Start date is required"
    if (!form.to) e.to = "End date is required"
    else if (form.from && form.to < form.from) e.to = "End date must be on or after the start date"
    if (!form.format) e.format = "Select an output format"
    if (!form.scope) e.scope = "Select a scope"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function runReport() {
    if (!runTarget || !validate()) return
    const now = new Date()
    const seq = 43 + generated.length - initialGenerated.length
    const next: GeneratedReport = {
      id: `RPT-2024-00${seq}`,
      report: runTarget.name,
      range: `${form.from} → ${form.to}`,
      format: form.format,
      scope: form.scope,
      generatedAt: `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`,
      rows: 40 + runTarget.id * 137,
    }
    setGenerated(prev => [next, ...prev])
    setReports(prev => prev.map(r => r.id === runTarget.id ? { ...r, lastRun: next.generatedAt } : r))
    closeRun()
    notify.success(
      `${next.report} generated`,
      `${next.id} — ${next.format} for ${next.scope}, ${next.range} (${next.rows.toLocaleString("en-IN")} rows).`,
    )
  }

  function download(g: GeneratedReport) {
    notify.info("Download started", `${g.id} — ${g.report} (${g.format}) is downloading.`)
  }

  function remove(g: GeneratedReport) {
    setGenerated(prev => prev.filter(x => x.id !== g.id))
    notify.warning("Report deleted", `${g.id} has been removed from the generated reports list.`)
  }

  const runOptions = runTarget ? formatOptions(runTarget.format) : []

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Generate and schedule inventory analytics reports</p>
        </div>
        <ExportButton data={reports.map(r => ({ name: r.name, desc: r.desc, lastRun: r.lastRun, format: r.format }))} filename="inventory-reports" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map(r => (
          <div key={r.id} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:border-brand/30 transition-colors">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">{r.icon}</div>
              <span className="text-xs text-muted-foreground">{r.format}</span>
            </div>
            <div>
              <p className="font-semibold text-foreground">{r.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border">
              <span className="text-xs text-muted-foreground">Last run: {r.lastRun}</span>
              <button onClick={() => openRun(r)} title={`Run ${r.name}`} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand/10 text-brand text-xs font-medium hover:bg-brand/20 transition-colors">
                <Download className="w-3 h-3" /> Run
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-base font-bold text-foreground">Generated Reports</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Reports produced from the templates above</p>
          </div>
          <ExportButton data={generated} filename="generated-reports" />
        </div>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>{["Report ID", "Report", "Period", "Format", "Scope", "Generated", "Rows", "Actions"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {generated.map(g => (
                <tr key={g.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{g.id}</td>
                  <td className="px-4 py-3 text-foreground">{g.report}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{g.range}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">{g.format}</span></td>
                  <td className="px-4 py-3 text-foreground">{g.scope}</td>
                  <td className="px-4 py-3 text-muted-foreground">{g.generatedAt}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{g.rows.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <RowActions
                      items={[
                        { label: "View details", icon: <Eye />, onSelect: () => setDetail(g) },
                        { label: "Download report", icon: <Download />, onSelect: () => download(g) },
                        { label: "Delete report", icon: <Trash2 />, onSelect: () => setDeleteTarget(g), tone: "danger" as const },
                      ]}
                    />
                  </td>
                </tr>
              ))}
              {generated.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No reports generated yet — run one of the templates above.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Run report */}
      <Modal
        open={!!runTarget}
        onOpenChange={(o) => { if (!o) closeRun() }}
        title={runTarget ? `Run ${runTarget.name}` : "Run Report"}
        description={runTarget?.desc}
        footer={<ModalActions onCancel={closeRun} onSubmit={runReport} submitLabel="Generate Report" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="From Date" required error={errors.from}>
            <TextInput type="date" value={form.from} invalid={!!errors.from} onChange={e => setForm({ ...form, from: e.target.value })} />
          </Field>
          <Field label="To Date" required error={errors.to}>
            <TextInput type="date" value={form.to} invalid={!!errors.to} onChange={e => setForm({ ...form, to: e.target.value })} />
          </Field>
          <Field label="Output Format" required error={errors.format}>
            <Select value={form.format} invalid={!!errors.format} onChange={e => setForm({ ...form, format: e.target.value })} options={runOptions} placeholder="Select Format" />
          </Field>
          <Field label="Scope" required error={errors.scope}>
            <Select value={form.scope} invalid={!!errors.scope} onChange={e => setForm({ ...form, scope: e.target.value })} options={SCOPES} placeholder="Select Scope" />
          </Field>
        </div>
      </Modal>

      {/* Generated report detail */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Generated report detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Report ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Report" value={detail.report} />
            <DetailRow label="Period" value={detail.range} />
            <DetailRow label="Format" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground")}>{detail.format}</span>} />
            <DetailRow label="Scope" value={detail.scope} />
            <DetailRow label="Generated" value={detail.generatedAt} />
            <DetailRow label="Rows" value={detail.rows.toLocaleString("en-IN")} />
          </div>
        )}
      </Drawer>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this report?"
        message={`${deleteTarget?.id} (${deleteTarget?.report}) will be removed from the generated reports list. This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Keep It"
        onConfirm={() => deleteTarget && remove(deleteTarget)}
      />
    </div>
  )
}
