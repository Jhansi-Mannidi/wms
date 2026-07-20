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
type Report = {
  id: string; name: string; period: string; size: string; status: string
}

const initialReports: Report[] = [
  { id:"RPT-001",name:"Monthly Occupancy Report",period:"Jun 2025",size:"1.2 MB",status:"Ready"},
  { id:"RPT-002",name:"Customer Billing Summary",period:"Jun 2025",size:"0.8 MB",status:"Ready"},
  { id:"RPT-003",name:"Space Utilisation Trend",period:"Q2 2025",size:"2.1 MB",status:"Ready"},
  { id:"RPT-004",name:"Stock Movement Log",period:"Jul 2025",size:"0.5 MB",status:"Generating"},
  { id:"RPT-005",name:"Revenue by Customer",period:"FY 2024-25",size:"1.8 MB",status:"Ready"},
]

const PERIODS = ["Jun 2025", "Jul 2025", "Q2 2025", "Q3 2025", "FY 2024-25"] as const
const TYPES = ["Occupancy", "Billing", "Utilisation", "Stock Movement", "Revenue"] as const

const emptyForm = { name: "", period: "", type: "" }

export default function StorageSaasReportPage() {
  const [reports, setReports] = useState<Report[]>(initialReports)

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Report | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Report | null>(null)

  const ready = reports.filter(r => r.status === "Ready").length
  const generating = reports.filter(r => r.status === "Generating").length

  const kpis = [
    { label: "Total Reports", value: reports.length, sub: "In library", color: "text-foreground" },
    { label: "Ready", value: ready, sub: "Available to download", color: "text-success" },
    { label: "Generating", value: generating, sub: "Being prepared", color: "text-amber-600" },
  ]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Report name is required"
    if (!form.period) e.period = "Select a reporting period"
    if (!form.type) e.type = "Select a report type"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function generateReport() {
    if (!validate()) return
    const seq = reports.reduce((max, r) => Math.max(max, Number(r.id.replace(/\D/g, "")) || 0), 0) + 1
    const next: Report = {
      id: `RPT-${String(seq).padStart(3, "0")}`,
      name: form.name.trim(),
      period: form.period,
      size: `${(Math.round((0.4 + Math.random() * 1.8) * 10) / 10).toFixed(1)} MB`,
      status: "Generating",
    }
    setReports(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.info("Report queued", `${next.id} — ${next.name} is being generated.`)
    setTimeout(() => {
      setReports(prev => prev.map(r => r.id === next.id ? { ...r, status: "Ready" } : r))
      notify.success("Report ready", `${next.id} — ${next.name} is available to download.`)
    }, 2000)
  }

  function download(r: Report) {
    notify.success("Download started", `${r.name} (${r.size}) is downloading.`)
  }

  function deleteReport(r: Report) {
    setReports(prev => prev.filter(x => x.id !== r.id))
    notify.warning("Report deleted", `${r.id} — ${r.name} has been removed.`)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold text-foreground">Reports</h1><p className="text-sm text-muted-foreground mt-1">Occupancy, billing and movement reports for storage services</p></div>
        <div className="flex items-center gap-2">
          <ExportButton data={reports} filename="storage-reports" />
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F7941D] text-white text-sm font-medium hover:bg-[#F7941D]/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Generate Report
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="p-4 rounded-xl border border-border bg-card">
            <p className="text-xs text-muted-foreground mb-1">{k.label}</p>
            <p className={cn("text-2xl font-bold", k.color)}>{k.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {reports.map(r=>(
          <div key={r.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
            <FileText className="w-8 h-8 text-brand shrink-0" />
            <div className="flex-1"><p className="font-medium text-foreground">{r.name}</p><p className="text-xs text-muted-foreground mt-0.5">{r.period} &bull; {r.size}</p></div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium mr-4 ${r.status==="Ready"?"bg-success/10 text-success":"bg-amber-50 text-amber-600"}`}>{r.status}</span>
            <button onClick={() => download(r)} disabled={r.status!=="Ready"} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"><Download className="w-3.5 h-3.5" /> Download</button>
            <RowActions
              items={[
                { label: "View report details", icon: <Eye />, onSelect: () => setDetail(r) },
                { label: "Delete report", icon: <Trash2 />, onSelect: () => setDeleteTarget(r), tone: "danger" as const },
              ]}
            />
          </div>
        ))}
        {reports.length === 0 && (
          <div className="bg-card border border-border rounded-xl px-4 py-10 text-center text-sm text-muted-foreground">No reports yet. Generate one to get started.</div>
        )}
      </div>

      {/* Generate report */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="Generate Report"
        description="Queue a new storage report for generation"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={generateReport} submitLabel="Generate" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Report Name" required error={errors.name}>
            <TextInput value={form.name} invalid={!!errors.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Monthly Occupancy Report" />
          </Field>
          <Field label="Period" required error={errors.period}>
            <Select value={form.period} invalid={!!errors.period} onChange={e => setForm({ ...form, period: e.target.value })} options={PERIODS} placeholder="Select Period" />
          </Field>
          <Field label="Report Type" required error={errors.type} hint="The report becomes downloadable once generated.">
            <Select value={form.type} invalid={!!errors.type} onChange={e => setForm({ ...form, type: e.target.value })} options={TYPES} placeholder="Select Type" />
          </Field>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.name ?? ""}
        description="Report detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Report ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Name" value={detail.name} />
            <DetailRow label="Period" value={detail.period} />
            <DetailRow label="File Size" value={detail.size} />
            <DetailRow label="Status" value={<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${detail.status==="Ready"?"bg-success/10 text-success":"bg-amber-50 text-amber-600"}`}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this report?"
        message={`${deleteTarget?.id} — ${deleteTarget?.name} will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete Report"
        cancelLabel="Keep It"
        onConfirm={() => deleteTarget && deleteReport(deleteTarget)}
      />
    </div>
  )
}
