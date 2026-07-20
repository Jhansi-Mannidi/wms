"use client"
import { useState } from "react"
import { Upload, Download, FileText, CheckCircle2, AlertTriangle, Eye, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type ImportRun = {
  file: string; rows: number; imported: number; skipped: number; duplicates: number
  importedAt: string; status: string
}

const initialRuns: ImportRun[] = [
  { file: "sku_master_jul14.csv", rows: 495, imported: 480, skipped: 12, duplicates: 3, importedAt: "2025-07-14 10:20", status: "Completed with errors" },
]

/** Files the simulated browser can select, with the counts a parse would find. */
const SAMPLE_FILES = [
  { name: "sku_master_batch_b.csv", rows: 240, skipped: 6, duplicates: 2 },
  { name: "client_catalogue.xlsx", rows: 88, skipped: 0, duplicates: 0 },
  { name: "seasonal_skus.csv", rows: 31, skipped: 2, duplicates: 1 },
] as const

const SAMPLE_NAMES: string[] = SAMPLE_FILES.map(f => f.name)

const statusStyle: Record<string, string> = {
  Completed: "bg-success/10 text-success",
  "Completed with errors": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
}

const REQUIRED_COLUMNS = ["SKU Code", "Product Name", "Category", "UOM", "Weight (kg)"]

export default function SKUImportPage() {
  const [runs, setRuns] = useState<ImportRun[]>(initialRuns)
  const [dragging, setDragging] = useState(false)

  const [importOpen, setImportOpen] = useState(false)
  const [pickedFile, setPickedFile] = useState("")
  const [parsed, setParsed] = useState<{ name: string; rows: number; imported: number; skipped: number; duplicates: number } | null>(null)
  const [pickError, setPickError] = useState("")

  const [detail, setDetail] = useState<ImportRun | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ImportRun | null>(null)

  const last = runs[0] ?? null

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
    setParsed({ name: f.name, rows: f.rows, imported: f.rows - f.skipped - f.duplicates, skipped: f.skipped, duplicates: f.duplicates })
    setPickError("")
    notify.info("File parsed", `${f.rows} rows read from ${f.name}.`)
  }

  function commitImport() {
    if (!parsed) {
      setPickError("Parse the file before importing")
      return
    }
    const now = new Date()
    const run: ImportRun = {
      file: parsed.name,
      rows: parsed.rows,
      imported: parsed.imported,
      skipped: parsed.skipped,
      duplicates: parsed.duplicates,
      importedAt: `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`,
      status: parsed.skipped + parsed.duplicates > 0 ? "Completed with errors" : "Completed",
    }
    setRuns(prev => [run, ...prev.filter(r => r.file !== run.file)])
    setImportOpen(false)
    setPickedFile("")
    setParsed(null)
    notify.success("Import complete", `${run.imported} SKUs imported from ${run.file}.`)
  }

  function downloadTemplate(kind: string) {
    const header = "sku_code,product_name,category,uom,weight_kg,barcode,hsn_code,client\n"
    const sample = "SKU-001242,Toor Dal 5kg,Pulses,Bags,5,8901234567900,0713.60,Agro Corp\n"
    const blob = new Blob([header + sample], { type: kind === "Excel Template" ? "application/vnd.ms-excel" : "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = kind === "Excel Template" ? "sku-import-template.xls" : "sku-import-template.csv"
    a.click()
    URL.revokeObjectURL(url)
    notify.success("Template downloaded", `${a.download} saved to your downloads.`)
  }

  function removeRun(r: ImportRun) {
    setRuns(prev => prev.filter(x => x.file !== r.file))
    notify.warning("Log removed", `${r.file} cleared from the import history.`)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold text-foreground">Import SKUs</h1><p className="text-sm text-muted-foreground mt-1">Bulk upload products via CSV or Excel template</p></div>
        <ExportButton data={runs} filename="sku-import-history" />
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="font-semibold text-sm text-foreground mb-4">Upload File</p>
            <div
              className={cn("border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer", dragging ? "border-brand bg-brand/5" : "border-border hover:border-brand/50")}
              onClick={() => openImport()}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => {
                e.preventDefault()
                setDragging(false)
                const dropped = e.dataTransfer?.files?.[0]?.name ?? SAMPLE_FILES[0].name
                openImport(SAMPLE_NAMES.includes(dropped) ? dropped : SAMPLE_FILES[0].name)
                notify.info("File dropped", `${dropped} ready to parse.`)
              }}
            >
              <Upload className="w-10 h-10 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Drop CSV or Excel file here</p>
              <p className="text-xs text-muted-foreground">Supports .csv, .xlsx — max 10 MB</p>
              <button onClick={e => { e.stopPropagation(); openImport() }} className="px-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors">Browse File</button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <p className="font-semibold text-sm text-foreground mb-3">
              {last ? `Last Import — ${last.file}` : "No imports yet"}
            </p>
            {last ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-success" /><span className="text-muted-foreground">{last.imported} SKUs imported successfully</span></div>
                <div className="flex items-center gap-2 text-sm"><AlertTriangle className="w-4 h-4 text-amber-500" /><span className="text-muted-foreground">{last.skipped} rows skipped — missing required fields</span></div>
                <div className="flex items-center gap-2 text-sm"><AlertTriangle className="w-4 h-4 text-danger" /><span className="text-muted-foreground">{last.duplicates} duplicate SKU codes rejected</span></div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Run your first import to see a summary here.</p>
            )}
          </div>

          <div>
            <p className="font-semibold text-sm text-foreground mb-3">Import History</p>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr>{["File", "Rows", "Imported", "Skipped", "Duplicates", "When", "Status", ""].map(h => <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-border">
                  {runs.map(r => (
                    <tr key={r.file} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-foreground"><span className="flex items-center gap-2"><FileText className="w-4 h-4 text-muted-foreground" />{r.file}</span></td>
                      <td className="px-4 py-3 text-foreground">{r.rows}</td>
                      <td className="px-4 py-3 text-success font-semibold">{r.imported}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.skipped}</td>
                      <td className="px-4 py-3"><span className={r.duplicates > 0 ? "text-danger font-semibold" : "text-muted-foreground"}>{r.duplicates}</span></td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{r.importedAt}</td>
                      <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusStyle[r.status] ?? "bg-success/10 text-success")}>{r.status}</span></td>
                      <td className="px-4 py-3">
                        <RowActions
                          items={[
                            { label: "View import summary", icon: <Eye />, onSelect: () => setDetail(r) },
                            { label: "Re-import this file", icon: <Upload />, onSelect: () => openImport(SAMPLE_NAMES.includes(r.file) ? r.file : "") },
                            { label: "Remove log entry", icon: <Trash2 />, onSelect: () => setDeleteTarget(r), tone: "danger" as const },
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                  {runs.length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No imports recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="font-semibold text-sm text-foreground mb-3">Download Template</p>
            <p className="text-xs text-muted-foreground mb-4">Use our official template to ensure correct column mapping</p>
            {["CSV Template", "Excel Template"].map(t => (
              <button key={t} onClick={() => downloadTemplate(t)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors mb-2">
                <Download className="w-4 h-4 text-brand" />{t}
              </button>
            ))}
          </div>
          <div className="bg-muted/40 border border-border rounded-xl p-4">
            <p className="font-semibold text-xs text-foreground mb-2">Required Columns</p>
            {REQUIRED_COLUMNS.map(c => (
              <p key={c} className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1"><span className="w-1 h-1 rounded-full bg-brand inline-block" />{c}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Import wizard */}
      <Modal
        open={importOpen}
        onOpenChange={(o) => { setImportOpen(o); if (!o) { setPickedFile(""); setParsed(null); setPickError("") } }}
        title="Import SKUs from File"
        description="Select a file, review the parse summary, then import"
        footer={<ModalActions onCancel={() => setImportOpen(false)} onSubmit={parsed ? commitImport : parseFile} submitLabel={parsed ? `Import ${parsed.imported} SKUs` : "Parse File"} disabled={!pickedFile} />}
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">{pickedFile || "No file selected"}</p>
            <p className="text-xs text-muted-foreground mt-1">.csv or .xlsx up to 10 MB</p>
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
              <DetailRow label="Will import" value={<span className="text-success font-semibold">{parsed.imported}</span>} />
              <DetailRow label="Skipped (missing fields)" value={<span className={parsed.skipped > 0 ? "text-amber-600 font-semibold" : ""}>{parsed.skipped}</span>} />
              <DetailRow label="Duplicate SKU codes" value={<span className={parsed.duplicates > 0 ? "text-danger font-semibold" : ""}>{parsed.duplicates}</span>} />
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
            <DetailRow label="Imported" value={<span className="text-success font-semibold">{detail.imported}</span>} />
            <DetailRow label="Skipped" value={detail.skipped} />
            <DetailRow label="Duplicates Rejected" value={<span className={detail.duplicates > 0 ? "text-danger font-semibold" : ""}>{detail.duplicates}</span>} />
            <DetailRow label="Success Rate" value={`${detail.rows ? Math.round((detail.imported / detail.rows) * 100) : 0}%`} />
            <DetailRow label="Imported At" value={detail.importedAt} />
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
        onConfirm={() => deleteTarget && removeRun(deleteTarget)}
      />
    </div>
  )
}
