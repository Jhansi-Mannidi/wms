"use client"
import { useState } from "react"
import { FileText, Download, Plus, Eye, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Report = { id: string; name: string; period: string; size: string; status: string }

const initialReports: Report[] = [
  { id:"RPT-001",name:"Monthly Consolidation Summary",period:"Jun 2025",size:"2.4 MB",status:"Ready"},
  { id:"RPT-002",name:"Cargo Receipt Register",period:"Jul 2025",size:"1.1 MB",status:"Ready"},
  { id:"RPT-003",name:"Load Plan Efficiency Report",period:"Jul 2025",size:"0.8 MB",status:"Generating"},
  { id:"RPT-004",name:"De-consolidation Log",period:"Jun 2025",size:"1.6 MB",status:"Ready"},
  { id:"RPT-005",name:"CBM Utilisation Report",period:"Q2 2025",size:"3.2 MB",status:"Ready"},
]

const REPORT_TYPES = [
  "Monthly Consolidation Summary",
  "Cargo Receipt Register",
  "Load Plan Efficiency Report",
  "De-consolidation Log",
  "CBM Utilisation Report",
] as const

const PERIODS = ["Jul 2025", "Aug 2025", "Q2 2025", "Q3 2025", "FY 2025"] as const

const emptyForm = { name: "", period: "" }

export default function LCLReportsPage() {
  const [reports, setReports] = useState<Report[]>(initialReports)

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Report | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Report | null>(null)

  const stats = [
    { label: "Total Reports", value: String(reports.length) },
    { label: "Ready", value: String(reports.filter(r => r.status === "Ready").length) },
    { label: "Generating", value: String(reports.filter(r => r.status === "Generating").length) },
    { label: "Total Size", value: `${reports.reduce((s, r) => s + (parseFloat(r.size) || 0), 0).toFixed(1)} MB` },
  ]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name) e.name = "Select a report type"
    if (!form.period) e.period = "Select a reporting period"
    else if (reports.some(r => r.name === form.name && r.period === form.period)) e.period = "That report already exists for this period"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createReport() {
    if (!validate()) return
    const nums = reports.map(r => Number(r.id.replace("RPT-", ""))).filter(n => !Number.isNaN(n))
    const next: Report = {
      id: `RPT-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, "0")}`,
      name: form.name,
      period: form.period,
      size: "0.0 MB",
      status: "Generating",
    }
    setReports(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Report queued", `${next.id} — ${next.name} (${next.period}) is generating.`)
  }

  function markReady(r: Report) {
    setReports(prev => prev.map(x => x.id === r.id ? { ...x, status: "Ready", size: `${(Math.round((0.6 + x.name.length / 40) * 10) / 10).toFixed(1)} MB` } : x))
    notify.success("Report ready", `${r.id} — ${r.name} finished generating.`)
  }

  function deleteReport(r: Report) {
    setReports(prev => prev.filter(x => x.id !== r.id))
    notify.warning("Report deleted", `${r.id} — ${r.name} was removed.`)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">LCL Reports</h1><p className="text-sm text-muted-foreground mt-1">Generated reports for consolidation, cargo and load planning</p></div>
        <div className="flex gap-2">
          <ExportButton data={reports} filename="lcl-reports" />
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
            <Plus className="w-4 h-4" /> New Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {reports.map(r=>(
          <div key={r.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
            <FileText className="w-8 h-8 text-brand shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{r.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{r.period} &bull; {r.size} &bull; <span className="font-mono">{r.id}</span></p>
            </div>
            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium mr-2", r.status === "Ready" ? "bg-success/10 text-success" : "bg-amber-50 text-amber-600")}>{r.status}</span>
            {r.status === "Ready" ? (
              <button
                onClick={() => notify.success("Download started", `${r.name} (${r.period}, ${r.size}) is downloading.`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs text-foreground hover:bg-muted transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            ) : (
              <button
                onClick={() => markReady(r)}
                title="Finish generating this report"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-medium hover:bg-brand/90 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" /> Finish Generating
              </button>
            )}
            <RowActions
              items={[
                { label: "View report details", icon: <Eye />, onSelect: () => setDetail(r) },
                { label: "Delete report", icon: <Trash2 />, onSelect: () => setDeleteTarget(r), tone: "danger" as const },
              ]}
            />
          </div>
        ))}
        {reports.length === 0 && (
          <div className="bg-card border border-dashed border-border rounded-xl px-4 py-10 text-center text-sm text-muted-foreground">
            No reports yet — generate one to get started.
          </div>
        )}
      </div>

      {/* New report */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="New Report"
        description="Queue a new LCL report for generation"
        size="sm"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createReport} submitLabel="Generate Report" />}
      >
        <div className="space-y-4">
          <Field label="Report Type" required error={errors.name}>
            <Select value={form.name} invalid={!!errors.name} onChange={e => setForm({ ...form, name: e.target.value })} options={REPORT_TYPES} placeholder="Select Report Type" />
          </Field>
          <Field label="Period" required error={errors.period}>
            <Select value={form.period} invalid={!!errors.period} onChange={e => setForm({ ...form, period: e.target.value })} options={PERIODS} placeholder="Select Period" />
          </Field>
        </div>
      </Modal>

      {/* Report detail */}
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
            {detail?.status === "Ready" && (
              <button
                onClick={() => notify.success("Download started", `${detail.name} (${detail.period}, ${detail.size}) is downloading.`)}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90"
              >
                Download
              </button>
            )}
          </>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Report ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Name" value={detail.name} />
            <DetailRow label="Period" value={detail.period} />
            <DetailRow label="File Size" value={detail.size} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", detail.status === "Ready" ? "bg-success/10 text-success" : "bg-amber-50 text-amber-600")}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this report?"
        message={`${deleteTarget?.id} — ${deleteTarget?.name} (${deleteTarget?.period}) will be permanently removed.`}
        confirmLabel="Delete Report"
        cancelLabel="Keep It"
        onConfirm={() => deleteTarget && deleteReport(deleteTarget)}
      />
    </div>
  )
}
