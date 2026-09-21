"use client"
import { useState } from "react"
import { Users, Clock, CheckCircle2, Plus, Eye, Pencil, ChevronRight, Trash2, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Shift = {
  id: string; name: string; time: string; workers: number; supervisor: string; status: string
}

const initialShifts: Shift[] = [
  { id: "SH-001", name: "Morning Shift", time: "06:00 – 14:00", workers: 22, supervisor: "Kavitha Rao", status: "Active" },
  { id: "SH-002", name: "Afternoon Shift", time: "14:00 – 22:00", workers: 18, supervisor: "Rajan Pillai", status: "Active" },
  { id: "SH-003", name: "Night Shift", time: "22:00 – 06:00", workers: 5, supervisor: "Sunita Devi", status: "Upcoming" },
  { id: "SH-004", name: "Weekend Morning", time: "07:00 – 15:00", workers: 10, supervisor: "Arjun Nair", status: "Scheduled" },
  { id: "SH-005", name: "Weekend Night", time: "23:00 – 07:00", workers: 4, supervisor: "Meena Patel", status: "Scheduled" },
  { id: "SH-006", name: "Early Dock Shift", time: "04:00 – 12:00", workers: 8, supervisor: "Rajan Pillai", status: "Active" },
  { id: "SH-007", name: "Evening Shift", time: "16:00 – 00:00", workers: 14, supervisor: "Sunita Devi", status: "Active" },
  { id: "SH-008", name: "Late Night Dock", time: "00:00 – 08:00", workers: 6, supervisor: "Arjun Nair", status: "Completed" },
  { id: "SH-009", name: "Weekend Afternoon", time: "15:00 – 23:00", workers: 9, supervisor: "Meena Patel", status: "Scheduled" },
  { id: "SH-010", name: "Sunday Morning", time: "08:00 – 16:00", workers: 11, supervisor: "Kavitha Rao", status: "Scheduled" },
  { id: "SH-011", name: "Peak Season Morning", time: "05:00 – 13:00", workers: 26, supervisor: "Kavitha Rao", status: "Upcoming" },
  { id: "SH-012", name: "Peak Season Evening", time: "13:00 – 21:00", workers: 20, supervisor: "Rajan Pillai", status: "Upcoming" },
  { id: "SH-013", name: "Inventory Count Shift", time: "21:00 – 01:00", workers: 7, supervisor: "Sunita Devi", status: "Scheduled" },
  { id: "SH-014", name: "QC Day Shift", time: "09:00 – 17:00", workers: 12, supervisor: "Meena Patel", status: "Active" },
  { id: "SH-015", name: "QC Night Shift", time: "21:00 – 05:00", workers: 5, supervisor: "Sunita Devi", status: "Upcoming" },
  { id: "SH-016", name: "Dispatch Morning", time: "06:30 – 14:30", workers: 16, supervisor: "Arjun Nair", status: "Active" },
  { id: "SH-017", name: "Dispatch Evening", time: "14:30 – 22:30", workers: 13, supervisor: "Rajan Pillai", status: "Upcoming" },
  { id: "SH-018", name: "Holiday Cover Morning", time: "07:00 – 15:00", workers: 9, supervisor: "Kavitha Rao", status: "Scheduled" },
  { id: "SH-019", name: "Holiday Cover Night", time: "22:00 – 06:00", workers: 4, supervisor: "Sunita Devi", status: "Scheduled" },
  { id: "SH-020", name: "Returns Processing", time: "10:00 – 18:00", workers: 8, supervisor: "Meena Patel", status: "Active" },
  { id: "SH-021", name: "Reverse Logistics Night", time: "20:00 – 04:00", workers: 5, supervisor: "Arjun Nair", status: "Completed" },
  { id: "SH-022", name: "Cross Dock Morning", time: "05:30 – 13:30", workers: 15, supervisor: "Rajan Pillai", status: "Completed" },
  { id: "SH-023", name: "Cross Dock Evening", time: "13:30 – 21:30", workers: 12, supervisor: "Arjun Nair", status: "Completed" },
  { id: "SH-024", name: "Overtime Cover", time: "18:00 – 22:00", workers: 6, supervisor: "Kavitha Rao", status: "Scheduled" },
]

const statusColor: Record<string, string> = {
  Active: "bg-success/10 text-success",
  Upcoming: "bg-brand/10 text-brand",
  Scheduled: "bg-muted text-muted-foreground",
  Completed: "bg-muted text-muted-foreground",
}

const SUPERVISORS = ["Kavitha Rao", "Rajan Pillai", "Sunita Devi", "Arjun Nair", "Meena Patel"] as const

const emptyForm = { name: "", start: "", end: "", workers: "", supervisor: "" }

/** Validates a 24-hour "HH:MM" clock string. */
function isClockTime(t: string): boolean {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim())
  return !!m && Number(m[1]) <= 23 && Number(m[2]) <= 59
}

function pad(t: string): string {
  const [h, m] = t.trim().split(":")
  return `${h.padStart(2, "0")}:${m}`
}

/** Scheduled -> Upcoming -> Active -> Completed */
const nextStatus: Record<string, string> = {
  Scheduled: "Upcoming",
  Upcoming: "Active",
  Active: "Completed",
}

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>(initialShifts)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Shift | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Shift | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Shift | null>(null)

  const filtered = shifts.filter(s =>
    (statusFilter === "All" || s.status === statusFilter) &&
    (s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.supervisor.toLowerCase().includes(search.toLowerCase()))
  )

  const kpis = [
    { label: "Active Shifts", value: String(shifts.filter(s => s.status === "Active").length), icon: <Clock className="w-5 h-5 text-brand" />, sub: "Currently running" },
    { label: "Total Workers", value: String(shifts.reduce((sum, s) => sum + s.workers, 0)), icon: <Users className="w-5 h-5 text-brand" />, sub: "Across all shifts" },
    { label: "Attendance Rate", value: "94%", icon: <CheckCircle2 className="w-5 h-5 text-success" />, sub: "This week" },
  ]

  function validate() {
    const e: Record<string, string> = {}
    const name = form.name.trim()
    if (!name) e.name = "Shift name is required"
    else if (shifts.some(s => s.name.toLowerCase() === name.toLowerCase() && s.id !== editing?.id)) e.name = "A shift with this name already exists"
    if (!form.start.trim()) e.start = "Start time is required"
    else if (!isClockTime(form.start)) e.start = "Use 24h HH:MM format"
    if (!form.end.trim()) e.end = "End time is required"
    else if (!isClockTime(form.end)) e.end = "Use 24h HH:MM format"
    else if (isClockTime(form.start) && pad(form.end) === pad(form.start)) e.end = "End time must differ from start"
    if (!form.workers.trim()) e.workers = "Worker count is required"
    else if (!/^\d+$/.test(form.workers.trim()) || Number(form.workers) < 1) e.workers = "Enter a positive whole number"
    if (!form.supervisor) e.supervisor = "Select a supervisor"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function openCreate() {
    setForm(emptyForm)
    setErrors({})
    setCreateOpen(true)
  }

  function openEdit(s: Shift) {
    const [start, end] = s.time.split("–").map(t => t.trim())
    setForm({ name: s.name, start, end, workers: String(s.workers), supervisor: s.supervisor })
    setErrors({})
    setEditing(s)
  }

  function createShift() {
    if (!validate()) return
    const seq = shifts.reduce((max, s) => Math.max(max, Number(s.id.replace("SH-", "")) || 0), 0) + 1
    const next: Shift = {
      id: `SH-${String(seq).padStart(3, "0")}`,
      name: form.name.trim(),
      time: `${pad(form.start)} – ${pad(form.end)}`,
      workers: Number(form.workers),
      supervisor: form.supervisor,
      status: "Scheduled",
    }
    setShifts(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Shift created", `${next.id} — ${next.name} (${next.time}) scheduled.`)
  }

  function saveEdit() {
    if (!editing || !validate()) return
    const updated: Shift = {
      ...editing,
      name: form.name.trim(),
      time: `${pad(form.start)} – ${pad(form.end)}`,
      workers: Number(form.workers),
      supervisor: form.supervisor,
    }
    setShifts(prev => prev.map(s => s.id === editing.id ? updated : s))
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
    notify.success("Shift updated", `${updated.id} — ${updated.name} saved.`)
  }

  function advance(s: Shift) {
    const status = nextStatus[s.status]
    if (!status) return
    setShifts(prev => prev.map(x => x.id === s.id ? { ...x, status } : x))
    notify.success(`Shift ${status.toLowerCase()}`, `${s.name} moved to ${status}.`)
  }

  function deleteShift(s: Shift) {
    setShifts(prev => prev.filter(x => x.id !== s.id))
    notify.warning("Shift deleted", `${s.id} — ${s.name} has been removed.`)
  }

  const formFields = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Shift Name" required error={errors.name}>
        <TextInput value={form.name} invalid={!!errors.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Weekend Evening" />
      </Field>
      <Field label="Supervisor" required error={errors.supervisor}>
        <Select value={form.supervisor} invalid={!!errors.supervisor} onChange={e => setForm({ ...form, supervisor: e.target.value })} options={SUPERVISORS} placeholder="Select Supervisor" />
      </Field>
      <Field label="Start Time" required error={errors.start} hint="24-hour format">
        <TextInput value={form.start} invalid={!!errors.start} onChange={e => setForm({ ...form, start: e.target.value })} placeholder="e.g. 06:00" />
      </Field>
      <Field label="End Time" required error={errors.end} hint="24-hour format">
        <TextInput value={form.end} invalid={!!errors.end} onChange={e => setForm({ ...form, end: e.target.value })} placeholder="e.g. 14:00" />
      </Field>
      <Field label="Workers" required error={errors.workers}>
        <TextInput value={form.workers} invalid={!!errors.workers} onChange={e => setForm({ ...form, workers: e.target.value })} placeholder="e.g. 20" inputMode="numeric" />
      </Field>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground">Shift Management</h1>
          <p className="text-sm text-muted-foreground">Configure and monitor all warehouse shifts</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="shifts" />
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Shift
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-card border border-border rounded-xl p-3 flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{kpi.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
            </div>
            {kpi.icon}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search shift ID, name, supervisor..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
        </div>
        {["All", "Active", "Upcoming", "Scheduled", "Completed"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", statusFilter === s ? "bg-brand text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground")}>{s}</button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {["Shift ID", "Name", "Time", "Workers", "Supervisor", "Status", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(s => (
              <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-brand font-medium">{s.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.time}</td>
                <td className="px-4 py-3 text-foreground">{s.workers}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.supervisor}</td>
                <td className="px-4 py-3">
                  <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusColor[s.status])}>{s.status}</span>
                </td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: "View details", icon: <Eye />, onSelect: () => setDetail(s) },
                      { label: "Edit shift", icon: <Pencil />, onSelect: () => openEdit(s) },
                      ...(nextStatus[s.status]
                        ? [{ label: `Move to ${nextStatus[s.status]}`, icon: <ChevronRight />, onSelect: () => advance(s), tone: "success" as const }]
                        : []),
                      { label: "Delete shift", icon: <Trash2 />, onSelect: () => setDeleteTarget(s), tone: "danger" as const },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No shifts match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create shift */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="New Shift"
        description="Define a new warehouse shift window"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createShift} submitLabel="Create Shift" />}
      >
        {formFields}
      </Modal>

      {/* Edit shift */}
      <Modal
        open={!!editing}
        onOpenChange={(o) => { if (!o) { setEditing(null); setForm(emptyForm); setErrors({}) } }}
        title={`Edit ${editing?.name ?? "Shift"}`}
        description="Update shift timing, staffing and supervisor"
        footer={<ModalActions onCancel={() => setEditing(null)} onSubmit={saveEdit} submitLabel="Save Changes" />}
      >
        {formFields}
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.name ?? ""}
        description="Shift detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Shift ID" value={<span className="text-brand font-medium">{detail.id}</span>} />
            <DetailRow label="Name" value={detail.name} />
            <DetailRow label="Time Window" value={detail.time} />
            <DetailRow label="Workers Assigned" value={`${detail.workers} workers`} />
            <DetailRow label="Supervisor" value={detail.supervisor} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusColor[detail.status])}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this shift?"
        message={`${deleteTarget?.name} (${deleteTarget?.id}) with ${deleteTarget?.workers} assigned workers will be removed. This cannot be undone.`}
        confirmLabel="Delete Shift"
        cancelLabel="Keep It"
        onConfirm={() => deleteTarget && deleteShift(deleteTarget)}
      />
    </div>
  )
}
