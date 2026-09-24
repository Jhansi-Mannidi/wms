"use client"
import { useState } from "react"
import { Wrench, Plus, Eye, Check, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, TextArea, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Task = {
  id: string; equipment: string; type: string; desc: string
  assignee: string; due: string; status: string
}

const initialTasks: Task[] = [
  { id:"MT-001",equipment:"MHE-006",type:"Scheduled Service",desc:"Annual hydraulic fluid change",assignee:"External Tech",due:"2025-07-25",status:"In Progress"},
  { id:"MT-002",equipment:"MHE-003",type:"Battery Check",desc:"Battery capacity test and replacement if <80%",assignee:"Suresh Yadav",due:"2025-07-22",status:"Pending"},
  { id:"MT-003",equipment:"MHE-001",type:"Tyre Inspection",desc:"Check tyre wear on front drive wheels",assignee:"Arjun Nair",due:"2025-07-30",status:"Scheduled"},
  { id:"MT-004",equipment:"MHE-002",type:"Safety Inspection",desc:"Annual PESO safety certification",assignee:"External Tech",due:"2025-08-10",status:"Scheduled"},
  { id:"MT-005",equipment:"MHE-004",type:"Fork Inspection",desc:"Visual and load test on forks",assignee:"Kavitha Rao",due:"2025-07-28",status:"Pending"},
  { id:"MT-006",equipment:"MHE-005",type:"Battery Check",desc:"Cell voltage balance test after deep discharge",assignee:"Ravi Kumar",due:"2025-07-21",status:"In Progress"},
  { id:"MT-007",equipment:"MHE-001",type:"Breakdown Repair",desc:"Replace worn mast chain and re-tension",assignee:"External Tech",due:"2025-07-23",status:"In Progress"},
  { id:"MT-008",equipment:"MHE-006",type:"Fork Inspection",desc:"Fork heel wear measurement post-repair",assignee:"Kavitha Rao",due:"2025-07-26",status:"Pending"},
  { id:"MT-009",equipment:"MHE-002",type:"Tyre Inspection",desc:"Rear castor wheel wear check",assignee:"Arjun Nair",due:"2025-07-29",status:"Scheduled"},
  { id:"MT-010",equipment:"MHE-003",type:"Scheduled Service",desc:"Quarterly service and hydraulic top-up",assignee:"External Tech",due:"2025-08-02",status:"Scheduled"},
  { id:"MT-011",equipment:"MHE-004",type:"Battery Check",desc:"Electrolyte level and specific gravity test",assignee:"Priya Sharma",due:"2025-07-24",status:"Pending"},
  { id:"MT-012",equipment:"MHE-005",type:"Safety Inspection",desc:"Seatbelt, horn and overhead guard check",assignee:"Suresh Yadav",due:"2025-08-05",status:"Scheduled"},
  { id:"MT-013",equipment:"MHE-001",type:"Scheduled Service",desc:"500-hour service, filters and lubricants",assignee:"External Tech",due:"2025-08-14",status:"Scheduled"},
  { id:"MT-014",equipment:"MHE-006",type:"Breakdown Repair",desc:"Diagnose intermittent traction motor cutout",assignee:"Ravi Kumar",due:"2025-07-27",status:"In Progress"},
  { id:"MT-015",equipment:"MHE-002",type:"Fork Inspection",desc:"Load backrest weld inspection",assignee:"Kavitha Rao",due:"2025-07-31",status:"Pending"},
  { id:"MT-016",equipment:"MHE-003",type:"Battery Check",desc:"Charger output verification at bay 2",assignee:"Arjun Nair",due:"2025-08-08",status:"Scheduled"},
  { id:"MT-017",equipment:"MHE-004",type:"Tyre Inspection",desc:"Drive tyre replacement if tread below 10mm",assignee:"Priya Sharma",due:"2025-07-26",status:"In Progress"},
  { id:"MT-018",equipment:"MHE-005",type:"Scheduled Service",desc:"Gearbox oil change and leak check",assignee:"External Tech",due:"2025-08-18",status:"Pending"},
  { id:"MT-019",equipment:"MHE-001",type:"Safety Inspection",desc:"Statutory PESO renewal documentation",assignee:"Suresh Yadav",due:"2025-06-30",status:"Completed"},
  { id:"MT-020",equipment:"MHE-002",type:"Battery Check",desc:"Quarterly capacity test, passed at 92%",assignee:"Ravi Kumar",due:"2025-06-27",status:"Completed"},
  { id:"MT-021",equipment:"MHE-003",type:"Tyre Inspection",desc:"Castor wheels replaced, alignment set",assignee:"Kavitha Rao",due:"2025-06-24",status:"Completed"},
  { id:"MT-022",equipment:"MHE-004",type:"Scheduled Service",desc:"Annual service completed by vendor",assignee:"External Tech",due:"2025-06-20",status:"Completed"},
  { id:"MT-023",equipment:"MHE-005",type:"Fork Inspection",desc:"Forks gauged, both within 8% wear limit",assignee:"Arjun Nair",due:"2025-06-17",status:"Completed"},
  { id:"MT-024",equipment:"MHE-006",type:"Breakdown Repair",desc:"Hydraulic pump seal kit replaced",assignee:"External Tech",due:"2025-06-13",status:"Completed"},
  { id:"MT-025",equipment:"MHE-001",type:"Battery Check",desc:"Terminals cleaned, connector housing replaced",assignee:"Priya Sharma",due:"2025-06-10",status:"Completed"},
  { id:"MT-026",equipment:"MHE-002",type:"Safety Inspection",desc:"Warning beacon and reverse alarm verified",assignee:"Suresh Yadav",due:"2025-06-06",status:"Completed"},
  { id:"MT-027",equipment:"MHE-003",type:"Scheduled Service",desc:"Half-yearly service, brakes adjusted",assignee:"External Tech",due:"2025-06-02",status:"Completed"},
]

const EQUIPMENT = ["MHE-001", "MHE-002", "MHE-003", "MHE-004", "MHE-005", "MHE-006"] as const
const TASK_TYPES = ["Scheduled Service", "Battery Check", "Tyre Inspection", "Safety Inspection", "Fork Inspection", "Breakdown Repair"] as const
const ASSIGNEES = ["External Tech", "Suresh Yadav", "Arjun Nair", "Kavitha Rao", "Ravi Kumar", "Priya Sharma"] as const
const STATUSES = ["Scheduled", "Pending", "In Progress", "Completed"] as const

const emptyForm = { equipment: "", type: "", desc: "", assignee: "", due: "", status: "" }

function statusClass(s: string) {
  return s === "In Progress" ? "bg-brand/10 text-brand"
    : s === "Pending" ? "bg-amber-50 text-amber-600"
    : s === "Completed" ? "bg-success/10 text-success"
    : "bg-muted text-muted-foreground"
}

export default function MHEMaintenancePage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [statusFilter, setStatusFilter] = useState("All")

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [editTarget, setEditTarget] = useState<Task | null>(null)
  const [editForm, setEditForm] = useState(emptyForm)
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Task | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)

  const filtered = tasks.filter(t => statusFilter === "All" || t.status === statusFilter)

  const stats = [
    { label: "Total Tasks", value: tasks.length },
    { label: "In Progress", value: tasks.filter(t => t.status === "In Progress").length },
    { label: "Pending", value: tasks.filter(t => t.status === "Pending").length },
    { label: "Completed", value: tasks.filter(t => t.status === "Completed").length },
  ]

  function validate(f: typeof emptyForm, requireStatus: boolean) {
    const e: Record<string, string> = {}
    if (!f.equipment) e.equipment = "Select the equipment"
    if (!f.type) e.type = "Select a task type"
    if (!f.desc.trim()) e.desc = "Description is required"
    if (!f.assignee) e.assignee = "Select an assignee"
    if (!f.due.trim()) e.due = "Due date is required"
    if (requireStatus && !f.status) e.status = "Select a status"
    return e
  }

  function createTask() {
    const e = validate(form, false)
    setErrors(e)
    if (Object.keys(e).length > 0) return
    const seq = String(tasks.length + 1).padStart(3, "0")
    const next: Task = {
      id: `MT-${seq}`,
      equipment: form.equipment,
      type: form.type,
      desc: form.desc.trim(),
      assignee: form.assignee,
      due: form.due,
      status: "Scheduled",
    }
    setTasks(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Task added", `${next.id} — ${next.type} on ${next.equipment}, due ${next.due}.`)
  }

  function openEdit(t: Task) {
    setEditTarget(t)
    setEditForm({ equipment: t.equipment, type: t.type, desc: t.desc, assignee: t.assignee, due: t.due, status: t.status })
    setEditErrors({})
  }

  function saveEdit() {
    if (!editTarget) return
    const e = validate(editForm, true)
    setEditErrors(e)
    if (Object.keys(e).length > 0) return
    setTasks(prev => prev.map(x => x.id === editTarget.id
      ? { ...x, ...editForm, desc: editForm.desc.trim() }
      : x))
    notify.success("Task updated", `${editTarget.id} has been updated.`)
    setEditTarget(null)
  }

  function advance(t: Task) {
    const order = ["Scheduled", "Pending", "In Progress", "Completed"]
    const idx = order.indexOf(t.status)
    const nextStatus = idx === -1 || idx === order.length - 1 ? "Completed" : order[idx + 1]
    setTasks(prev => prev.map(x => x.id === t.id ? { ...x, status: nextStatus } : x))
    notify.success(`Task ${nextStatus.toLowerCase()}`, `${t.id} moved to ${nextStatus}.`)
  }

  function remove(t: Task) {
    setTasks(prev => prev.filter(x => x.id !== t.id))
    notify.warning("Task deleted", `${t.id} has been removed from the schedule.`)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Maintenance Schedule</h1><p className="text-sm text-muted-foreground mt-1">Preventive and corrective maintenance tasks for all MHE</p></div>
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> Add Task</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {["All", "Scheduled", "Pending", "In Progress", "Completed"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", statusFilter === s ? "bg-brand text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground")}>{s}</button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border"><tr>{["Task ID","Equipment","Type","Description","Assignee","Due Date","Status","Actions"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(t=>(
              <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{t.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{t.equipment}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.type}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs max-w-48 truncate">{t.desc}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.assignee}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.due}</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusClass(t.status))}>{t.status}</span></td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: "View details", icon: <Eye />, onSelect: () => setDetail(t) },
                      { label: "Edit task", icon: <Pencil />, onSelect: () => openEdit(t) },
                      ...(t.status !== "Completed"
                        ? [{ label: "Advance status", icon: <Check />, onSelect: () => advance(t), tone: "success" as const }]
                        : []),
                      { label: "Delete task", icon: <Trash2 />, onSelect: () => setDeleteTarget(t), tone: "danger" as const },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No maintenance tasks match this filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 rounded-xl border border-warning/30 bg-warning/5 flex items-start gap-3">
        <Wrench className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">Workload Summary</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {stats[1].value} task(s) in progress · {stats[2].value} pending assignment.
          </p>
        </div>
      </div>

      {/* Add task */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="Add Maintenance Task"
        description="Schedule preventive or corrective work on a unit"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createTask} submitLabel="Add Task" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Equipment" required error={errors.equipment}>
            <Select value={form.equipment} invalid={!!errors.equipment} onChange={e => setForm({ ...form, equipment: e.target.value })} options={EQUIPMENT} placeholder="Select Equipment" />
          </Field>
          <Field label="Task Type" required error={errors.type}>
            <Select value={form.type} invalid={!!errors.type} onChange={e => setForm({ ...form, type: e.target.value })} options={TASK_TYPES} placeholder="Select Type" />
          </Field>
          <Field label="Assignee" required error={errors.assignee}>
            <Select value={form.assignee} invalid={!!errors.assignee} onChange={e => setForm({ ...form, assignee: e.target.value })} options={ASSIGNEES} placeholder="Select Assignee" />
          </Field>
          <Field label="Due Date" required error={errors.due}>
            <TextInput type="date" value={form.due} invalid={!!errors.due} onChange={e => setForm({ ...form, due: e.target.value })} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description" required error={errors.desc}>
              <TextArea value={form.desc} invalid={!!errors.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="e.g. Replace hydraulic filter and top up fluid" />
            </Field>
          </div>
        </div>
      </Modal>

      {/* Edit task */}
      <Modal
        open={!!editTarget}
        onOpenChange={(o) => { if (!o) { setEditTarget(null); setEditErrors({}) } }}
        title={`Edit ${editTarget?.id ?? "Task"}`}
        description="Update scheduling, ownership or status"
        footer={<ModalActions onCancel={() => setEditTarget(null)} onSubmit={saveEdit} submitLabel="Save Changes" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Equipment" required error={editErrors.equipment}>
            <Select value={editForm.equipment} invalid={!!editErrors.equipment} onChange={e => setEditForm({ ...editForm, equipment: e.target.value })} options={EQUIPMENT} placeholder="Select Equipment" />
          </Field>
          <Field label="Task Type" required error={editErrors.type}>
            <Select value={editForm.type} invalid={!!editErrors.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })} options={TASK_TYPES} placeholder="Select Type" />
          </Field>
          <Field label="Assignee" required error={editErrors.assignee}>
            <Select value={editForm.assignee} invalid={!!editErrors.assignee} onChange={e => setEditForm({ ...editForm, assignee: e.target.value })} options={ASSIGNEES} placeholder="Select Assignee" />
          </Field>
          <Field label="Due Date" required error={editErrors.due}>
            <TextInput type="date" value={editForm.due} invalid={!!editErrors.due} onChange={e => setEditForm({ ...editForm, due: e.target.value })} />
          </Field>
          <Field label="Status" required error={editErrors.status}>
            <Select value={editForm.status} invalid={!!editErrors.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} options={STATUSES} placeholder="Select Status" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description" required error={editErrors.desc}>
              <TextArea value={editForm.desc} invalid={!!editErrors.desc} onChange={e => setEditForm({ ...editForm, desc: e.target.value })} />
            </Field>
          </div>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Maintenance task detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Task ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Equipment" value={detail.equipment} />
            <DetailRow label="Type" value={detail.type} />
            <DetailRow label="Description" value={detail.desc} />
            <DetailRow label="Assignee" value={detail.assignee} />
            <DetailRow label="Due Date" value={detail.due} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusClass(detail.status))}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this task?"
        message={`${deleteTarget?.id} (${deleteTarget?.type} on ${deleteTarget?.equipment}) will be removed from the maintenance schedule.`}
        confirmLabel="Delete"
        cancelLabel="Keep It"
        onConfirm={() => deleteTarget && remove(deleteTarget)}
      />
    </div>
  )
}
