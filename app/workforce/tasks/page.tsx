"use client"
import { useState } from "react"
import { CheckCircle2, Clock, AlertTriangle, Plus, Search, Eye, Pencil, Play, Check, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Task = {
  id: string; title: string; assignee: string; zone: string
  priority: string; due: string; status: string
}

const initialTasks: Task[] = [
  { id: "TSK-001", title: "Pick Order #ORD-2045", assignee: "Ravi Kumar", zone: "Zone A", priority: "High", due: "12:00", status: "In Progress" },
  { id: "TSK-002", title: "Putaway GRN-1198 items", assignee: "Priya Sharma", zone: "Zone B", priority: "Medium", due: "13:00", status: "Pending" },
  { id: "TSK-003", title: "Cycle count Row C-03", assignee: "Suresh Yadav", zone: "Dock", priority: "Low", due: "15:00", status: "Pending" },
  { id: "TSK-004", title: "Pack Order #ORD-2044", assignee: "Meena Patel", zone: "QC Bay", priority: "High", due: "11:30", status: "Completed" },
  { id: "TSK-005", title: "Verify shipment SHP-0891", assignee: "Arjun Nair", zone: "Zone C", priority: "High", due: "10:00", status: "Overdue" },
  { id: "TSK-006", title: "Update stock adjustments", assignee: "Kavitha Rao", zone: "All Zones", priority: "Medium", due: "16:00", status: "In Progress" },
]

const statusColor: Record<string, string> = {
  "In Progress": "bg-brand/10 text-brand",
  Pending: "bg-muted text-muted-foreground",
  Completed: "bg-success/10 text-success",
  Overdue: "bg-danger/10 text-danger",
}
const priorityColor: Record<string, string> = {
  High: "text-danger",
  Medium: "text-warning",
  Low: "text-muted-foreground",
}

const ASSIGNEES = ["Ravi Kumar", "Priya Sharma", "Suresh Yadav", "Meena Patel", "Arjun Nair", "Kavitha Rao"] as const
const ZONES = ["Zone A", "Zone B", "Zone C", "Dock", "QC Bay", "All Zones"] as const
const PRIORITIES = ["High", "Medium", "Low"] as const
const STATUS_TABS = ["All", "Pending", "In Progress", "Completed", "Overdue"] as const

const emptyForm = { title: "", assignee: "", zone: "", priority: "", due: "" }

export default function WorkforceTasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("All")

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [editTarget, setEditTarget] = useState<Task | null>(null)
  const [editForm, setEditForm] = useState(emptyForm)
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Task | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)

  const filtered = tasks.filter(t =>
    (statusFilter === "All" || t.status === statusFilter) &&
    (t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.assignee.toLowerCase().includes(search.toLowerCase()))
  )

  const kpis = [
    { label: "Total Tasks", value: tasks.length, icon: <CheckCircle2 className="w-5 h-5 text-brand" /> },
    { label: "In Progress", value: tasks.filter(t => t.status === "In Progress").length, icon: <Clock className="w-5 h-5 text-brand" /> },
    { label: "Completed", value: tasks.filter(t => t.status === "Completed").length, icon: <CheckCircle2 className="w-5 h-5 text-success" /> },
    { label: "Overdue", value: tasks.filter(t => t.status === "Overdue").length, icon: <AlertTriangle className="w-5 h-5 text-danger" /> },
  ]

  function validate(f: typeof emptyForm, set: (e: Record<string, string>) => void) {
    const e: Record<string, string> = {}
    if (!f.title.trim()) e.title = "Task title is required"
    if (!f.assignee) e.assignee = "Select an assignee"
    if (!f.zone) e.zone = "Select a zone"
    if (!f.priority) e.priority = "Select a priority"
    if (!f.due.trim()) e.due = "Due time is required"
    else if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(f.due.trim())) e.due = "Use 24h HH:MM format, e.g. 14:30"
    set(e)
    return Object.keys(e).length === 0
  }

  function createTask() {
    if (!validate(form, setErrors)) return
    const seq = tasks.length + 1
    const next: Task = {
      id: `TSK-${String(seq).padStart(3, "0")}`,
      title: form.title.trim(),
      assignee: form.assignee,
      zone: form.zone,
      priority: form.priority,
      due: form.due.trim(),
      status: "Pending",
    }
    setTasks(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Task assigned", `${next.id} assigned to ${next.assignee} (${next.zone}).`)
  }

  function openEdit(t: Task) {
    setEditTarget(t)
    setEditForm({ title: t.title, assignee: t.assignee, zone: t.zone, priority: t.priority, due: t.due })
    setEditErrors({})
  }

  function saveEdit() {
    if (!editTarget) return
    if (!validate(editForm, setEditErrors)) return
    setTasks(prev => prev.map(x => x.id === editTarget.id ? {
      ...x,
      title: editForm.title.trim(),
      assignee: editForm.assignee,
      zone: editForm.zone,
      priority: editForm.priority,
      due: editForm.due.trim(),
    } : x))
    notify.success("Task updated", `${editTarget.id} has been updated.`)
    setEditTarget(null)
    setEditErrors({})
  }

  function advance(t: Task) {
    const nextStatus = t.status === "Pending" ? "In Progress" : "Completed"
    setTasks(prev => prev.map(x => x.id === t.id ? { ...x, status: nextStatus } : x))
    notify.success(`Task ${nextStatus.toLowerCase()}`, `${t.id} moved to ${nextStatus}.`)
  }

  function deleteTask(t: Task) {
    setTasks(prev => prev.filter(x => x.id !== t.id))
    notify.warning("Task removed", `${t.id} was removed from the board.`)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Task Assignment</h1>
          <p className="text-sm text-muted-foreground">Manage and assign warehouse floor tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="workforce-tasks" />
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Assign Task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-card border border-border rounded-xl p-4 flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{kpi.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
            </div>
            {kpi.icon}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search task ID, title, assignee..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
        {STATUS_TABS.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              statusFilter === s ? "bg-brand text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {["Task ID", "Title", "Assignee", "Zone", "Priority", "Due", "Status", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(t => (
              <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-brand font-medium">{t.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{t.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.assignee}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.zone}</td>
                <td className={cn("px-4 py-3 font-medium text-xs", priorityColor[t.priority])}>{t.priority}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.due}</td>
                <td className="px-4 py-3">
                  <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusColor[t.status])}>{t.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setDetail(t)} title="View details" className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => openEdit(t)} title="Edit task" className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {t.status !== "Completed" && (
                      <button
                        onClick={() => advance(t)}
                        title={t.status === "Pending" ? "Start task" : "Complete task"}
                        className="p-1.5 rounded-md text-success hover:bg-success/10 transition-colors"
                      >
                        {t.status === "Pending" ? <Play className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    <button onClick={() => setDeleteTarget(t)} title="Delete task" className="p-1.5 rounded-md text-danger hover:bg-danger/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No tasks match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Assign task */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="Assign Task"
        description="Create and assign a new warehouse floor task"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createTask} submitLabel="Assign Task" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Task Title" required error={errors.title}>
            <TextInput value={form.title} invalid={!!errors.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Pick Order #ORD-2046" />
          </Field>
          <Field label="Assignee" required error={errors.assignee}>
            <Select value={form.assignee} invalid={!!errors.assignee} onChange={e => setForm({ ...form, assignee: e.target.value })} options={ASSIGNEES} placeholder="Select Assignee" />
          </Field>
          <Field label="Zone" required error={errors.zone}>
            <Select value={form.zone} invalid={!!errors.zone} onChange={e => setForm({ ...form, zone: e.target.value })} options={ZONES} placeholder="Select Zone" />
          </Field>
          <Field label="Priority" required error={errors.priority}>
            <Select value={form.priority} invalid={!!errors.priority} onChange={e => setForm({ ...form, priority: e.target.value })} options={PRIORITIES} placeholder="Select Priority" />
          </Field>
          <Field label="Due Time" required error={errors.due} hint="24-hour clock, e.g. 14:30">
            <TextInput value={form.due} invalid={!!errors.due} onChange={e => setForm({ ...form, due: e.target.value })} placeholder="e.g. 14:30" />
          </Field>
        </div>
      </Modal>

      {/* Edit task */}
      <Modal
        open={!!editTarget}
        onOpenChange={(o) => { if (!o) { setEditTarget(null); setEditErrors({}) } }}
        title={`Edit ${editTarget?.id ?? ""}`}
        description="Update task details or reassign to another operator"
        footer={<ModalActions onCancel={() => setEditTarget(null)} onSubmit={saveEdit} submitLabel="Save Changes" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Task Title" required error={editErrors.title}>
            <TextInput value={editForm.title} invalid={!!editErrors.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
          </Field>
          <Field label="Assignee" required error={editErrors.assignee}>
            <Select value={editForm.assignee} invalid={!!editErrors.assignee} onChange={e => setEditForm({ ...editForm, assignee: e.target.value })} options={ASSIGNEES} placeholder="Select Assignee" />
          </Field>
          <Field label="Zone" required error={editErrors.zone}>
            <Select value={editForm.zone} invalid={!!editErrors.zone} onChange={e => setEditForm({ ...editForm, zone: e.target.value })} options={ZONES} placeholder="Select Zone" />
          </Field>
          <Field label="Priority" required error={editErrors.priority}>
            <Select value={editForm.priority} invalid={!!editErrors.priority} onChange={e => setEditForm({ ...editForm, priority: e.target.value })} options={PRIORITIES} placeholder="Select Priority" />
          </Field>
          <Field label="Due Time" required error={editErrors.due} hint="24-hour clock, e.g. 14:30">
            <TextInput value={editForm.due} invalid={!!editErrors.due} onChange={e => setEditForm({ ...editForm, due: e.target.value })} />
          </Field>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Task detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Task ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Title" value={detail.title} />
            <DetailRow label="Assignee" value={detail.assignee} />
            <DetailRow label="Zone" value={detail.zone} />
            <DetailRow label="Priority" value={<span className={cn("font-medium", priorityColor[detail.priority])}>{detail.priority}</span>} />
            <DetailRow label="Due" value={detail.due} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusColor[detail.status])}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this task?"
        message={`Task ${deleteTarget?.id} (${deleteTarget?.title}) will be removed from the board. This cannot be undone.`}
        confirmLabel="Delete Task"
        cancelLabel="Keep It"
        onConfirm={() => deleteTarget && deleteTask(deleteTarget)}
      />
    </div>
  )
}
