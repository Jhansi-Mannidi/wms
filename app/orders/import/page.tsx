"use client"
import { useState } from "react"
import { Upload, FileText, CheckCircle2, AlertTriangle, Download, Eye, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type ImportLog = {
  file: string; rows: number; success: number; errors: number; time: string; status: string
}

const initialLogs: ImportLog[] = [
  { file: "orders_batch_20240720.csv", rows: 48, success: 46, errors: 2, time: "09:14 AM", status: "Completed" },
  { file: "orders_batch_20240719.csv", rows: 32, success: 32, errors: 0, time: "Yesterday 08:55 AM", status: "Completed" },
  { file: "orders_emergency_20240718.csv", rows: 5, success: 5, errors: 0, time: "2024-07-18 14:00", status: "Completed" },
]

/** Files the simulated browser can "select", with the row counts a parse would find. */
const SAMPLE_FILES = [
  { name: "orders_batch_20240721.csv", rows: 62, errors: 3 },
  { name: "marketplace_orders_20240721.csv", rows: 28, errors: 0 },
  { name: "b2b_priority_20240721.csv", rows: 14, errors: 1 },
] as const

const SAMPLE_NAMES: string[] = SAMPLE_FILES.map(f => f.name)

const statusStyle: Record<string, string> = {
  Completed: "bg-success/10 text-success",
  "Completed with errors": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
}

export default function OrderImportPage() {
  const [logs, setLogs] = useState<ImportLog[]>(initialLogs)
  const [dragging, setDragging] = useState(false)

  const [importOpen, setImportOpen] = useState(false)
  const [pickedFile, setPickedFile] = useState("")
  const [parsed, setParsed] = useState<{ name: string; rows: number; success: number; errors: number } | null>(null)
  const [pickError, setPickError] = useState("")

  const [detail, setDetail] = useState<ImportLog | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ImportLog | null>(null)

  const totals = {
    files: logs.length,
    rows: logs.reduce((s, l) => s + l.rows, 0),
    success: logs.reduce((s, l) => s + l.success, 0),
    errors: logs.reduce((s, l) => s + l.errors, 0),
  }

  function openImport(prefill?: string) {
    setImportOpen(true)
    setPickedFile(prefill ?? "")
    setParsed(null)
    setPickError("")
  }

  function browseFile() {
    const f = SAMPLE_FILES[Math.floor(Math.random() * SAMPLE_FILES.length)]
    setPickedFile(f.name)
    setParsed(null)
    setPickError("")
    notify.info("File selected", f.name)
  }

  function parseFile() {
    const f = SAMPLE_FILES.find(x => x.name === pickedFile)
    if (!f) {
      setPickError("Choose a file before parsing")
      return
    }
    setParsed({ name: f.name, rows: f.rows, success: f.rows - f.errors, errors: f.errors })
    setPickError("")
    notify.info("File parsed", `${f.rows} rows read — ${f.errors} need attention.`)
  }

  function commitImport() {
    if (!parsed) {
      setPickError("Parse the file before importing")
      return
    }
    const now = new Date()
    const entry: ImportLog = {
      file: parsed.name,
      rows: parsed.rows,
      success: parsed.success,
      errors: parsed.errors,
      time: `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`,
      status: parsed.errors > 0 ? "Completed with errors" : "Completed",
    }
    setLogs(prev => [entry, ...prev.filter(l => l.file !== entry.file)])
    setImportOpen(false)
    setPickedFile("")
    setParsed(null)
    notify.success("Import complete", `${entry.success} orders imported from ${entry.file}.`)
  }

  function downloadTemplate() {
    const header = "order_id,client,sku,qty,ship_to,sla_date,priority,courier,notes\n"
    const sample = "ORD-9001,Acme Foods,SKU-001234,45,Mumbai,2024-07-25,High,BlueDart,\n"
    const blob = new Blob([header + sample], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "order-import-template.csv"
    a.click()
    URL.revokeObjectURL(url)
    notify.success("Template downloaded", "order-import-template.csv saved to your downloads.")
  }

  function removeLog(l: ImportLog) {
    setLogs(prev => prev.filter(x => x.file !== l.file))
    notify.warning("Log removed", `${l.file} cleared from the import history.`)
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bulk Import</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Import orders in bulk via CSV upload</p>
        </div>
        <ExportButton data={logs} filename="order-import-history" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Files Imported", value: String(totals.files) },
          { label: "Rows Read", value: String(totals.rows) },
          { label: "Rows Succeeded", value: String(totals.success), cls: "text-success" },
          { label: "Rows Failed", value: String(totals.errors), cls: totals.errors > 0 ? "text-danger" : undefined },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn("text-2xl font-bold mt-1", s.cls || "text-foreground")}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragging ? "border-brand bg-brand/5" : "border-border"}`}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault()
            setDragging(false)
            const dropped = e.dataTransfer?.files?.[0]?.name ?? SAMPLE_FILES[0].name
            openImport(SAMPLE_NAMES.includes(dropped) ? dropped : SAMPLE_FILES[0].name)
            notify.info("File dropped", `${dropped} ready to parse.`)
          }}>
          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-foreground">Drag & drop your CSV file here</p>
          <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
          <button onClick={() => openImport()} className="mt-4 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">Browse File</button>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <p className="font-semibold text-foreground">Template & Requirements</p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Required columns: <span className="font-mono text-xs text-foreground">order_id, client, sku, qty, ship_to, sla_date</span></p>
            <p>Optional columns: <span className="font-mono text-xs text-foreground">priority, courier, notes</span></p>
            <p>Max file size: 10 MB</p>
            <p>Max rows per file: 5,000</p>
          </div>
          <button onClick={downloadTemplate} className="flex items-center gap-2 text-brand text-sm font-medium hover:underline">
            <Download className="w-4 h-4" /> Download template CSV
          </button>
        </div>
      </div>

      <div>
        <p className="font-semibold text-foreground mb-3">Recent Imports</p>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>{["File", "Rows", "Success", "Errors", "Time", "Status", "Actions"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map(l => (
                <tr key={l.file} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-foreground"><span className="flex items-center gap-2"><FileText className="w-4 h-4 text-muted-foreground" />{l.file}</span></td>
                  <td className="px-4 py-3 text-foreground">{l.rows}</td>
                  <td className="px-4 py-3 text-success font-semibold">{l.success}</td>
                  <td className="px-4 py-3"><span className={l.errors > 0 ? "text-danger font-semibold" : "text-muted-foreground"}>{l.errors}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{l.time}</td>
                  <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusStyle[l.status] ?? "bg-success/10 text-success")}>{l.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setDetail(l)} title="View import summary" className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => openImport(SAMPLE_NAMES.includes(l.file) ? l.file : "")} title="Re-import this file" className="p-1.5 rounded-md text-brand hover:bg-brand/10 transition-colors"><Upload className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteTarget(l)} title="Remove log entry" className="p-1.5 rounded-md text-danger hover:bg-danger/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No imports recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import wizard */}
      <Modal
        open={importOpen}
        onOpenChange={(o) => { setImportOpen(o); if (!o) { setPickedFile(""); setParsed(null); setPickError("") } }}
        title="Import Orders from CSV"
        description="Select a file, review the parse summary, then import"
        footer={<ModalActions onCancel={() => setImportOpen(false)} onSubmit={parsed ? commitImport : parseFile} submitLabel={parsed ? `Import ${parsed.success} Rows` : "Parse File"} disabled={!pickedFile} />}
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">{pickedFile || "No file selected"}</p>
            <p className="text-xs text-muted-foreground mt-1">CSV up to 10 MB · max 5,000 rows</p>
            <button onClick={browseFile} className="mt-3 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
              {pickedFile ? "Choose Another File" : "Browse File"}
            </button>
          </div>
          <Field label="Or pick from available files" error={pickError}>
            <Select value={pickedFile} invalid={!!pickError} onChange={e => { setPickedFile(e.target.value); setParsed(null); setPickError("") }} options={SAMPLE_NAMES} placeholder="Select a file" />
          </Field>
          {parsed && (
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2"><FileText className="w-4 h-4 text-brand" />{parsed.name}</p>
              <DetailRow label="Rows read" value={parsed.rows} />
              <DetailRow label="Valid rows" value={<span className="text-success font-semibold flex items-center justify-end gap-1"><CheckCircle2 className="w-3.5 h-3.5" />{parsed.success}</span>} />
              <DetailRow label="Rows with errors" value={<span className={cn("font-semibold flex items-center justify-end gap-1", parsed.errors > 0 ? "text-danger" : "text-muted-foreground")}><AlertTriangle className="w-3.5 h-3.5" />{parsed.errors}</span>} />
            </div>
          )}
        </div>
      </Modal>

      {/* Import detail */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.file ?? ""}
        description="Import summary"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Close</button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="File" value={<span className="font-mono text-xs">{detail.file}</span>} />
            <DetailRow label="Rows Read" value={detail.rows} />
            <DetailRow label="Succeeded" value={<span className="text-success font-semibold">{detail.success}</span>} />
            <DetailRow label="Failed" value={<span className={detail.errors > 0 ? "text-danger font-semibold" : ""}>{detail.errors}</span>} />
            <DetailRow label="Success Rate" value={`${detail.rows ? Math.round((detail.success / detail.rows) * 100) : 0}%`} />
            <DetailRow label="Imported" value={detail.time} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusStyle[detail.status] ?? "bg-success/10 text-success")}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Delete log confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Remove this import log?"
        message={`The record for ${deleteTarget?.file} will be removed from the import history. This cannot be undone.`}
        confirmLabel="Remove Log"
        cancelLabel="Keep It"
        onConfirm={() => deleteTarget && removeLog(deleteTarget)}
      />
    </div>
  )
}
