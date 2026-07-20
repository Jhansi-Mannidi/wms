"use client"
import { useState } from "react"
import { Users, CheckCircle2, XCircle, Clock, Plus, Eye, LogOut, UserX, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type AttendanceRecord = {
  id: string; name: string; shift: string; checkIn: string; checkOut: string; hours: string; status: string
}

const initialRecords: AttendanceRecord[] = [
  { id: "EMP-001", name: "Ravi Kumar", shift: "Morning", checkIn: "05:58", checkOut: "14:02", hours: "8h 04m", status: "Present" },
  { id: "EMP-002", name: "Priya Sharma", shift: "Morning", checkIn: "06:01", checkOut: "14:00", hours: "7h 59m", status: "Present" },
  { id: "EMP-003", name: "Suresh Yadav", shift: "Afternoon", checkIn: "14:05", checkOut: "—", hours: "In Progress", status: "Active" },
  { id: "EMP-004", name: "Meena Patel", shift: "Morning", checkIn: "—", checkOut: "—", hours: "—", status: "Absent" },
  { id: "EMP-005", name: "Arjun Nair", shift: "Afternoon", checkIn: "14:12", checkOut: "—", hours: "In Progress", status: "Late" },
  { id: "EMP-006", name: "Kavitha Rao", shift: "Morning", checkIn: "06:00", checkOut: "14:00", hours: "8h 00m", status: "Present" },
]

const statusColor: Record<string, string> = {
  Present: "bg-success/10 text-success",
  Active: "bg-brand/10 text-brand",
  Absent: "bg-danger/10 text-danger",
  Late: "bg-warning/10 text-warning",
}

const SHIFTS = ["Morning", "Afternoon", "Night"] as const
const STATUSES = ["Present", "Active", "Absent", "Late"] as const

const emptyForm = { id: "", name: "", shift: "", checkIn: "", status: "" }

/** "HH:MM" -> minutes since midnight, or null when not a valid clock time. */
function toMinutes(t: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim())
  if (!m) return null
  const h = Number(m[1]), min = Number(m[2])
  if (h > 23 || min > 59) return null
  return h * 60 + min
}

function formatDuration(from: string, to: string): string {
  const a = toMinutes(from), b = toMinutes(to)
  if (a === null || b === null) return "—"
  const diff = (b - a + 24 * 60) % (24 * 60)
  return `${Math.floor(diff / 60)}h ${String(diff % 60).padStart(2, "0")}m`
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>(initialRecords)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<AttendanceRecord | null>(null)
  const [absentTarget, setAbsentTarget] = useState<AttendanceRecord | null>(null)

  const filtered = records.filter(r =>
    (statusFilter === "All" || r.status === statusFilter) &&
    (r.id.toLowerCase().includes(search.toLowerCase()) || r.name.toLowerCase().includes(search.toLowerCase()))
  )

  const kpis = [
    { label: "Present", value: records.filter(r => r.status === "Present").length, icon: <CheckCircle2 className="w-5 h-5 text-success" />, color: "text-success" },
    { label: "Absent", value: records.filter(r => r.status === "Absent").length, icon: <XCircle className="w-5 h-5 text-danger" />, color: "text-danger" },
    { label: "Late", value: records.filter(r => r.status === "Late").length, icon: <Clock className="w-5 h-5 text-warning" />, color: "text-warning" },
    { label: "Total", value: records.length, icon: <Users className="w-5 h-5 text-brand" />, color: "text-foreground" },
  ]

  function validate() {
    const e: Record<string, string> = {}
    const id = form.id.trim().toUpperCase()
    if (!id) e.id = "Employee ID is required"
    else if (records.some(r => r.id.toUpperCase() === id)) e.id = "This employee already has a record today"
    if (!form.name.trim()) e.name = "Name is required"
    if (!form.shift) e.shift = "Select a shift"
    if (!form.status) e.status = "Select a status"
    if (form.status && form.status !== "Absent") {
      if (!form.checkIn.trim()) e.checkIn = "Check-in time is required"
      else if (toMinutes(form.checkIn) === null) e.checkIn = "Use 24h HH:MM format"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createRecord() {
    if (!validate()) return
    const absent = form.status === "Absent"
    const next: AttendanceRecord = {
      id: form.id.trim().toUpperCase(),
      name: form.name.trim(),
      shift: form.shift,
      checkIn: absent ? "—" : form.checkIn.trim(),
      checkOut: "—",
      hours: absent ? "—" : "In Progress",
      status: form.status,
    }
    setRecords(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Attendance recorded", `${next.id} — ${next.name} marked ${next.status}.`)
  }

  function checkOut(r: AttendanceRecord) {
    const now = new Date()
    const time = now.toTimeString().slice(0, 5)
    const hours = formatDuration(r.checkIn, time)
    setRecords(prev => prev.map(x => x.id === r.id ? { ...x, checkOut: time, hours, status: "Present" } : x))
    notify.success("Checked out", `${r.name} checked out at ${time} (${hours}).`)
  }

  function markAbsent(r: AttendanceRecord) {
    setRecords(prev => prev.map(x => x.id === r.id ? { ...x, checkIn: "—", checkOut: "—", hours: "—", status: "Absent" } : x))
    notify.warning("Marked absent", `${r.id} — ${r.name} has been marked absent.`)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground">Attendance</h1>
          <p className="text-sm text-muted-foreground">Daily attendance tracking across all shifts</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="attendance" />
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Record
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-card border border-border rounded-xl p-4 flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{kpi.label}</p>
              <p className={cn("text-2xl font-bold mt-1", kpi.color)}>{kpi.value}</p>
            </div>
            {kpi.icon}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employee ID, name..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
        </div>
        {["All", "Present", "Active", "Late", "Absent"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", statusFilter === s ? "bg-brand text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground")}>{s}</button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {["Emp ID", "Name", "Shift", "Check In", "Check Out", "Hours", "Status", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-brand font-medium">{r.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{r.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.shift}</td>
                <td className="px-4 py-3 text-foreground">{r.checkIn}</td>
                <td className="px-4 py-3 text-foreground">{r.checkOut}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.hours}</td>
                <td className="px-4 py-3">
                  <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusColor[r.status])}>{r.status}</span>
                </td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: "View details", icon: <Eye />, onSelect: () => setDetail(r) },
                      ...(r.status === "Active" || r.status === "Late"
                        ? [{ label: "Check out", icon: <LogOut />, onSelect: () => checkOut(r), tone: "success" as const }]
                        : []),
                      ...(r.status !== "Absent"
                        ? [{ label: "Mark absent", icon: <UserX />, onSelect: () => setAbsentTarget(r), tone: "danger" as const }]
                        : []),
                    ]}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No attendance records match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add attendance record */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="Add Attendance Record"
        description="Log an employee's attendance for today"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createRecord} submitLabel="Add Record" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Employee ID" required error={errors.id}>
            <TextInput value={form.id} invalid={!!errors.id} onChange={e => setForm({ ...form, id: e.target.value })} placeholder="e.g. EMP-007" />
          </Field>
          <Field label="Name" required error={errors.name}>
            <TextInput value={form.name} invalid={!!errors.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Anita Desai" />
          </Field>
          <Field label="Shift" required error={errors.shift}>
            <Select value={form.shift} invalid={!!errors.shift} onChange={e => setForm({ ...form, shift: e.target.value })} options={SHIFTS} placeholder="Select Shift" />
          </Field>
          <Field label="Status" required error={errors.status}>
            <Select value={form.status} invalid={!!errors.status} onChange={e => setForm({ ...form, status: e.target.value })} options={STATUSES} placeholder="Select Status" />
          </Field>
          <Field label="Check In" required={form.status !== "Absent"} error={errors.checkIn} hint="24-hour format, e.g. 06:00">
            <TextInput value={form.checkIn} invalid={!!errors.checkIn} onChange={e => setForm({ ...form, checkIn: e.target.value })} placeholder="e.g. 06:00" disabled={form.status === "Absent"} />
          </Field>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.name ?? ""}
        description="Attendance record detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Employee ID" value={<span className="text-brand font-medium">{detail.id}</span>} />
            <DetailRow label="Name" value={detail.name} />
            <DetailRow label="Shift" value={detail.shift} />
            <DetailRow label="Check In" value={detail.checkIn} />
            <DetailRow label="Check Out" value={detail.checkOut} />
            <DetailRow label="Hours Worked" value={detail.hours} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusColor[detail.status])}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Mark absent confirmation */}
      <ConfirmDialog
        open={!!absentTarget}
        onOpenChange={(o) => !o && setAbsentTarget(null)}
        title="Mark this employee absent?"
        message={`${absentTarget?.name} (${absentTarget?.id}) will be marked absent and their check-in and hours for today will be cleared.`}
        confirmLabel="Mark Absent"
        cancelLabel="Keep It"
        onConfirm={() => absentTarget && markAbsent(absentTarget)}
      />
    </div>
  )
}
