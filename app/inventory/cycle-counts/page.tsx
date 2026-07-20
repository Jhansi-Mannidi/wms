"use client"
import { useState } from "react"
import { Search, Plus, RefreshCw, CheckCircle2, Clock, AlertTriangle, Eye, Play, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type CycleCount = {
  id: string; zone: string; type: string; assignedTo: string
  scheduled: string; completed: string; variance: number | null; status: string
}

const initialCounts: CycleCount[] = [
  { id: "CC-2024-081", zone: "A", type: "Full Zone", assignedTo: "Ravi Kumar", scheduled: "2024-07-20", completed: "", variance: null, status: "Pending" },
  { id: "CC-2024-080", zone: "B", type: "Spot Check", assignedTo: "Priya Sharma", scheduled: "2024-07-19", completed: "2024-07-19", variance: 0, status: "Completed" },
  { id: "CC-2024-079", zone: "C", type: "ABC Class A", assignedTo: "Suresh Yadav", scheduled: "2024-07-18", completed: "2024-07-18", variance: -3, status: "Variance Found" },
  { id: "CC-2024-078", zone: "D", type: "Full Zone", assignedTo: "Meena Patel", scheduled: "2024-07-17", completed: "2024-07-17", variance: 0, status: "Completed" },
  { id: "CC-2024-077", zone: "A", type: "Spot Check", assignedTo: "Arjun Nair", scheduled: "2024-07-15", completed: "", variance: null, status: "In Progress" },
  { id: "CC-2024-076", zone: "B", type: "ABC Class B", assignedTo: "Kavitha Rao", scheduled: "2024-07-14", completed: "2024-07-14", variance: 2, status: "Variance Found" },
]

const statusStyle: Record<string, string> = {
  Pending: "bg-muted text-muted-foreground",
  "In Progress": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Completed: "bg-success/10 text-success",
  "Variance Found": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
}

const ZONES = ["A", "B", "C", "D"] as const
const COUNT_TYPES = ["Full Zone", "Spot Check", "ABC Class A", "ABC Class B", "ABC Class C"] as const
const OPERATORS = ["Ravi Kumar", "Priya Sharma", "Suresh Yadav", "Meena Patel", "Arjun Nair", "Kavitha Rao"] as const

const emptyForm = { zone: "", type: "", assignedTo: "", scheduled: "" }

export default function CycleCountsPage() {
  const [counts, setCounts] = useState<CycleCount[]>(initialCounts)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<CycleCount | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CycleCount | null>(null)

  const [completeTarget, setCompleteTarget] = useState<CycleCount | null>(null)
  const [varianceInput, setVarianceInput] = useState("")
  const [varianceError, setVarianceError] = useState("")

  const filtered = counts.filter(c =>
    (statusFilter === "All" || c.status === statusFilter) &&
    (c.id.toLowerCase().includes(search.toLowerCase()) || c.zone.toLowerCase().includes(search.toLowerCase()) || c.assignedTo.toLowerCase().includes(search.toLowerCase()))
  )

  const stats = [
    { label: "Scheduled", value: counts.filter(c => c.status === "Pending").length, icon: <Clock className="w-4 h-4 text-brand" /> },
    { label: "In Progress", value: counts.filter(c => c.status === "In Progress").length, icon: <RefreshCw className="w-4 h-4 text-blue-500" /> },
    { label: "Completed This Month", value: counts.filter(c => c.status === "Completed").length, icon: <CheckCircle2 className="w-4 h-4 text-success" /> },
    { label: "Variances Found", value: counts.filter(c => c.status === "Variance Found").length, icon: <AlertTriangle className="w-4 h-4 text-amber-500" /> },
  ]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.zone) e.zone = "Select a zone"
    if (!form.type) e.type = "Select a count type"
    if (!form.assignedTo) e.assignedTo = "Select an assignee"
    if (!form.scheduled.trim()) e.scheduled = "Scheduled date is required"
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.scheduled.trim())) e.scheduled = "Use format YYYY-MM-DD"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createCount() {
    if (!validate()) return
    const seq = 82 + counts.filter(c => c.id.startsWith("CC-2024-0")).length - 6
    const next: CycleCount = {
      id: `CC-2024-0${seq}`,
      zone: form.zone,
      type: form.type,
      assignedTo: form.assignedTo,
      scheduled: form.scheduled.trim(),
      completed: "",
      variance: null,
      status: "Pending",
    }
    setCounts(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Cycle count scheduled", `${next.id} — Zone ${next.zone} (${next.type}) assigned to ${next.assignedTo}.`)
  }

  function startCount(c: CycleCount) {
    setCounts(prev => prev.map(x => x.id === c.id ? { ...x, status: "In Progress" } : x))
    notify.success("Count started", `${c.id} is now in progress.`)
  }

  function openComplete(c: CycleCount) {
    setCompleteTarget(c)
    setVarianceInput("")
    setVarianceError("")
  }

  function completeCount() {
    if (!completeTarget) return
    const raw = varianceInput.trim()
    if (!raw) { setVarianceError("Counted variance is required"); return }
    if (!/^-?\d+$/.test(raw)) { setVarianceError("Enter a whole number (may be negative)"); return }
    const variance = Number(raw)
    const status = variance === 0 ? "Completed" : "Variance Found"
    const today = new Date().toISOString().slice(0, 10)
    setCounts(prev => prev.map(x => x.id === completeTarget.id ? { ...x, variance, completed: today, status } : x))
    notify.success(
      variance === 0 ? "Count completed" : "Variance recorded",
      variance === 0 ? `${completeTarget.id} closed with no variance.` : `${completeTarget.id} closed with a variance of ${variance > 0 ? "+" : ""}${variance}.`,
    )
    setCompleteTarget(null)
    setVarianceInput("")
    setVarianceError("")
  }

  function deleteCount(c: CycleCount) {
    setCounts(prev => prev.filter(x => x.id !== c.id))
    notify.warning("Cycle count deleted", `${c.id} has been removed from the schedule.`)
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cycle Counts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Schedule and track physical inventory counts</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="cycle-counts" />
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Count
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">{s.icon}</div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search count ID, zone, assignee..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
        </div>
        {["All", "Pending", "In Progress", "Completed", "Variance Found"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", statusFilter === s ? "bg-brand text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground")}>{s}</button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              {["Count ID", "Zone", "Type", "Assigned To", "Scheduled", "Completed", "Variance", "Status", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{c.id}</td>
                <td className="px-4 py-3 text-foreground">Zone {c.zone}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.type}</td>
                <td className="px-4 py-3 text-foreground">{c.assignedTo}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.scheduled}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.completed || "—"}</td>
                <td className="px-4 py-3 font-semibold">
                  {c.variance === null ? <span className="text-muted-foreground">—</span> : <span className={c.variance === 0 ? "text-success" : "text-amber-600"}>{c.variance > 0 ? "+" : ""}{c.variance}</span>}
                </td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusStyle[c.status])}>{c.status}</span></td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: "View details", icon: <Eye />, onSelect: () => setDetail(c) },
                      ...(c.status === "Pending"
                        ? [{ label: "Start count", icon: <Play />, onSelect: () => startCount(c) }]
                        : []),
                      ...(c.status === "In Progress"
                        ? [{ label: "Complete count", icon: <CheckCircle2 />, onSelect: () => openComplete(c), tone: "success" as const }]
                        : []),
                      { label: "Delete count", icon: <Trash2 />, onSelect: () => setDeleteTarget(c), tone: "danger" as const },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">No cycle counts match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Schedule a new count */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="New Cycle Count"
        description="Schedule a physical inventory count"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createCount} submitLabel="Schedule Count" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Zone" required error={errors.zone}>
            <Select value={form.zone} invalid={!!errors.zone} onChange={e => setForm({ ...form, zone: e.target.value })} options={ZONES} placeholder="Select Zone" />
          </Field>
          <Field label="Count Type" required error={errors.type}>
            <Select value={form.type} invalid={!!errors.type} onChange={e => setForm({ ...form, type: e.target.value })} options={COUNT_TYPES} placeholder="Select Type" />
          </Field>
          <Field label="Assigned To" required error={errors.assignedTo}>
            <Select value={form.assignedTo} invalid={!!errors.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} options={OPERATORS} placeholder="Select Operator" />
          </Field>
          <Field label="Scheduled Date" required error={errors.scheduled} hint="Format YYYY-MM-DD">
            <TextInput value={form.scheduled} invalid={!!errors.scheduled} onChange={e => setForm({ ...form, scheduled: e.target.value })} placeholder="e.g. 2024-07-25" />
          </Field>
        </div>
      </Modal>

      {/* Complete count — capture variance */}
      <Modal
        open={!!completeTarget}
        onOpenChange={(o) => { if (!o) { setCompleteTarget(null); setVarianceInput(""); setVarianceError("") } }}
        title="Complete Cycle Count"
        description={completeTarget ? `${completeTarget.id} — Zone ${completeTarget.zone}` : ""}
        size="sm"
        footer={<ModalActions onCancel={() => setCompleteTarget(null)} onSubmit={completeCount} submitLabel="Complete Count" />}
      >
        <Field label="Counted Variance" required error={varianceError} hint="0 closes the count clean; any other value flags a variance.">
          <TextInput value={varianceInput} invalid={!!varianceError} onChange={e => setVarianceInput(e.target.value)} placeholder="e.g. -3" inputMode="numeric" />
        </Field>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Cycle count detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Count ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Zone" value={`Zone ${detail.zone}`} />
            <DetailRow label="Count Type" value={detail.type} />
            <DetailRow label="Assigned To" value={detail.assignedTo} />
            <DetailRow label="Scheduled" value={detail.scheduled} />
            <DetailRow label="Completed" value={detail.completed || "—"} />
            <DetailRow
              label="Variance"
              value={detail.variance === null
                ? <span className="text-muted-foreground">—</span>
                : <span className={detail.variance === 0 ? "text-success" : "text-amber-600"}>{detail.variance > 0 ? "+" : ""}{detail.variance}</span>}
            />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusStyle[detail.status])}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this cycle count?"
        message={`Cycle count ${deleteTarget?.id} for Zone ${deleteTarget?.zone} will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete Count"
        cancelLabel="Keep It"
        onConfirm={() => deleteTarget && deleteCount(deleteTarget)}
      />
    </div>
  )
}
