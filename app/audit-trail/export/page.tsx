"use client"
import { useState } from "react"
import { Download, FileText, Calendar, CheckCircle2, Plus, Eye, Trash2 } from "lucide-react"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Preset = {
  id: number; name: string; period: string; rows: number; format: string; downloads: number
}

const initialPresets: Preset[] = [
  { id: 1, name: "Full Audit Log — This Month", period: "Jul 2025", rows: 14820, format: "CSV", downloads: 0 },
  { id: 2, name: "User Activity Summary", period: "Jul 2025", rows: 312, format: "CSV", downloads: 0 },
  { id: 3, name: "Security Events", period: "Last 90 days", rows: 88, format: "CSV", downloads: 0 },
  { id: 4, name: "Inventory Changes", period: "Jul 2025", rows: 4210, format: "Excel", downloads: 0 },
  { id: 5, name: "Billing Modifications", period: "Q2 2025", rows: 142, format: "CSV", downloads: 0 },
  { id: 6, name: "Compliance Report", period: "FY 2024-25", rows: 62440, format: "PDF", downloads: 0 },
]

const FORMATS = ["CSV", "Excel", "PDF"] as const

const emptyForm = { name: "", period: "", rows: "", format: "" }

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "audit-export"
}

export default function AuditExportPage() {
  const [presets, setPresets] = useState<Preset[]>(initialPresets)

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Preset | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Preset | null>(null)

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Report name is required"
    else if (presets.some(p => p.name.toLowerCase() === form.name.trim().toLowerCase())) e.name = "A preset with this name already exists"
    if (!form.period.trim()) e.period = "Period is required"
    if (!form.rows.trim()) e.rows = "Estimated row count is required"
    else if (!/^\d+$/.test(form.rows) || Number(form.rows) < 1) e.rows = "Enter a positive whole number"
    if (!form.format) e.format = "Select a format"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createPreset() {
    if (!validate()) return
    const next: Preset = {
      id: Math.max(0, ...presets.map(p => p.id)) + 1,
      name: form.name.trim(),
      period: form.period.trim(),
      rows: Number(form.rows),
      format: form.format,
      downloads: 0,
    }
    setPresets(prev => [...prev, next])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Export preset created", `${next.name} — ${next.rows.toLocaleString()} rows as ${next.format}.`)
  }

  function download(p: Preset) {
    const header = "Report,Period,Rows,Format,Generated At\n"
    const line = `"${p.name}","${p.period}",${p.rows},"${p.format}","${new Date().toISOString()}"\n`
    const blob = new Blob([header, line], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${slugify(p.name)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setPresets(prev => prev.map(x => x.id === p.id ? { ...x, downloads: x.downloads + 1 } : x))
    notify.success("Download started", `${p.name} (${p.rows.toLocaleString()} rows) exported as ${p.format}.`)
  }

  function remove(p: Preset) {
    setPresets(prev => prev.filter(x => x.id !== p.id))
    notify.warning("Preset removed", `${p.name} has been deleted.`)
  }

  const totalDownloads = presets.reduce((sum, p) => sum + p.downloads, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Export Audit Log</h1>
          <p className="text-sm text-muted-foreground mt-1">Download full or filtered audit trail data &bull; {presets.length} presets &bull; {totalDownloads} downloads this session</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton data={presets} filename="audit-log" label="Export All" />
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
            <Plus className="w-4 h-4" /> New Preset
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {presets.map(p => (
          <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
            <FileText className="w-8 h-8 text-brand shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-foreground flex items-center gap-2">
                {p.name}
                {p.downloads > 0 && <CheckCircle2 className="w-4 h-4 text-success" />}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                <Calendar className="w-3 h-3" />{p.period} &bull; {p.rows.toLocaleString()} rows &bull; {p.format}
                {p.downloads > 0 && <span className="text-success">&bull; downloaded {p.downloads}&times;</span>}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => download(p)} title={`Download ${p.name}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs text-foreground hover:bg-muted transition-colors shrink-0">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
              <RowActions
                items={[
                  { label: "View preset details", icon: <Eye />, onSelect: () => setDetail(p) },
                  { label: "Delete preset", icon: <Trash2 />, onSelect: () => setDeleteTarget(p), tone: "danger" as const },
                ]}
              />
            </div>
          </div>
        ))}
        {presets.length === 0 && (
          <div className="bg-card border border-border rounded-xl p-10 text-center text-sm text-muted-foreground">No export presets configured.</div>
        )}
      </div>

      {/* Create preset */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="New Export Preset"
        description="Save a reusable audit log export definition"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createPreset} submitLabel="Create Preset" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Report Name" required error={errors.name}>
            <TextInput value={form.name} invalid={!!errors.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Security Events" />
          </Field>
          <Field label="Period" required error={errors.period}>
            <TextInput value={form.period} invalid={!!errors.period} onChange={e => setForm({ ...form, period: e.target.value })} placeholder="e.g. Jul 2025" />
          </Field>
          <Field label="Estimated Rows" required error={errors.rows}>
            <TextInput value={form.rows} invalid={!!errors.rows} onChange={e => setForm({ ...form, rows: e.target.value })} placeholder="e.g. 1200" inputMode="numeric" />
          </Field>
          <Field label="Format" required error={errors.format}>
            <Select value={form.format} invalid={!!errors.format} onChange={e => setForm({ ...form, format: e.target.value })} options={FORMATS} placeholder="Select Format" />
          </Field>
        </div>
      </Modal>

      {/* Preset detail */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.name ?? ""}
        description="Export preset detail"
        footer={
          <>
            <button onClick={() => detail && download(detail)} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
              Download
            </button>
            <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Close
            </button>
          </>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Report Name" value={detail.name} />
            <DetailRow label="Period" value={detail.period} />
            <DetailRow label="Rows" value={detail.rows.toLocaleString()} />
            <DetailRow label="Format" value={detail.format} />
            <DetailRow label="Downloads (session)" value={String(detail.downloads)} />
          </div>
        )}
      </Drawer>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this export preset?"
        message={`${deleteTarget?.name} will be removed from the saved export presets.`}
        confirmLabel="Delete Preset"
        cancelLabel="Keep It"
        onConfirm={() => deleteTarget && remove(deleteTarget)}
      />
    </div>
  )
}
