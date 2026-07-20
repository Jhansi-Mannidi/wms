"use client"

import { useState } from "react"
import {
  Users, Clock, CheckCircle2, AlertTriangle, Plus, Search,
  ChevronDown, Eye, MoreHorizontal, Calendar, UserCheck, Briefcase
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Worker = {
  id: string; name: string; role: string; shift: string; zone: string
  tasksToday: number; tasksCompleted: number; status: string; attendance: string
}

type Task = {
  id: string; type: string; order: string; assignedTo: string; zone: string
  priority: string; status: string; eta: string
}

type Shift = { name: string; time: string; workers: number; supervisor: string; status: string }

const initialWorkers: Worker[] = [
  { id: "EMP-001", name: "Ravi Kumar", role: "Picker", shift: "Morning", zone: "Zone A", tasksToday: 24, tasksCompleted: 22, status: "Active", attendance: "Present" },
  { id: "EMP-002", name: "Priya Sharma", role: "Packer", shift: "Morning", zone: "Zone B", tasksToday: 18, tasksCompleted: 18, status: "Active", attendance: "Present" },
  { id: "EMP-003", name: "Suresh Yadav", role: "Forklift Operator", shift: "Afternoon", zone: "Dock", tasksToday: 12, tasksCompleted: 8, status: "On Break", attendance: "Present" },
  { id: "EMP-004", name: "Meena Patel", role: "QC Inspector", shift: "Morning", zone: "QC Bay", tasksToday: 30, tasksCompleted: 30, status: "Active", attendance: "Present" },
  { id: "EMP-005", name: "Arjun Nair", role: "Picker", shift: "Afternoon", zone: "Zone C", tasksToday: 20, tasksCompleted: 5, status: "Active", attendance: "Present" },
  { id: "EMP-006", name: "Kavitha Rao", role: "Supervisor", shift: "Morning", zone: "All Zones", tasksToday: 8, tasksCompleted: 6, status: "Active", attendance: "Present" },
  { id: "EMP-007", name: "Mohammed Ismail", role: "Picker", shift: "Night", zone: "Zone A", tasksToday: 0, tasksCompleted: 0, status: "Off Shift", attendance: "Absent" },
  { id: "EMP-008", name: "Deepika Singh", role: "Packer", shift: "Morning", zone: "Zone B", tasksToday: 16, tasksCompleted: 14, status: "Active", attendance: "Present" },
]

const initialShifts: Shift[] = [
  { name: "Morning Shift", time: "06:00 – 14:00", workers: 22, supervisor: "Kavitha Rao", status: "Active" },
  { name: "Afternoon Shift", time: "14:00 – 22:00", workers: 18, supervisor: "Rajan Pillai", status: "Active" },
  { name: "Night Shift", time: "22:00 – 06:00", workers: 5, supervisor: "Sunita Devi", status: "Upcoming" },
]

const initialTasks: Task[] = [
  { id: "TASK-101", type: "Picking", order: "ORD-2024-156", assignedTo: "Ravi Kumar", zone: "Zone A", priority: "High", status: "In Progress", eta: "10 min" },
  { id: "TASK-102", type: "Packing", order: "ORD-2024-155", assignedTo: "Priya Sharma", zone: "Zone B", priority: "Normal", status: "Completed", eta: "Done" },
  { id: "TASK-103", type: "Putaway", order: "GRN-2024-089", assignedTo: "Suresh Yadav", zone: "Dock", priority: "High", status: "Pending", eta: "30 min" },
  { id: "TASK-104", type: "QC Check", order: "GRN-2024-088", assignedTo: "Meena Patel", zone: "QC Bay", priority: "Urgent", status: "In Progress", eta: "15 min" },
  { id: "TASK-105", type: "Picking", order: "ORD-2024-154", assignedTo: "Arjun Nair", zone: "Zone C", priority: "Urgent", status: "In Progress", eta: "20 min" },
]

const statusConfig: Record<string, { color: string; bg: string }> = {
  Active: { color: "text-success", bg: "bg-success/15" },
  "On Break": { color: "text-warning", bg: "bg-warning/15" },
  "Off Shift": { color: "text-muted-foreground", bg: "bg-muted" },
}

const taskStatusConfig: Record<string, { color: string; bg: string }> = {
  "In Progress": { color: "text-brand", bg: "bg-brand/15" },
  Completed: { color: "text-success", bg: "bg-success/15" },
  Pending: { color: "text-warning", bg: "bg-warning/15" },
}

const priorityColors: Record<string, string> = {
  Urgent: "text-danger",
  High: "text-warning",
  Normal: "text-muted-foreground",
}

const ROLES = ["Picker", "Packer", "Forklift Operator", "QC Inspector", "Supervisor"] as const
const SHIFT_NAMES = ["Morning", "Afternoon", "Night"] as const
const ZONES = ["Zone A", "Zone B", "Zone C", "Dock", "QC Bay", "All Zones"] as const
const WORKER_STATUSES = ["Active", "On Break", "Off Shift"] as const
const ATTENDANCE = ["Present", "Absent"] as const
const TASK_TYPES = ["Picking", "Packing", "Putaway", "QC Check", "Cycle Count"] as const
const PRIORITIES = ["Urgent", "High", "Normal"] as const
const TASK_STATUSES = ["Pending", "In Progress", "Completed"] as const

const emptyTaskForm = { type: "", order: "", assignedTo: "", zone: "", priority: "", eta: "" }

export default function WorkforcePage() {
  const [tab, setTab] = useState<"workers" | "tasks" | "shifts">("workers")
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("All Roles")
  const [shiftFilter, setShiftFilter] = useState("All Shifts")

  const [workers, setWorkers] = useState<Worker[]>(initialWorkers)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [shifts] = useState<Shift[]>(initialShifts)

  // Assign-task modal
  const [assignOpen, setAssignOpen] = useState(false)
  const [taskForm, setTaskForm] = useState(emptyTaskForm)
  const [taskErrors, setTaskErrors] = useState<Record<string, string>>({})

  // Worker detail + manage
  const [workerDetail, setWorkerDetail] = useState<Worker | null>(null)
  const [manageWorker, setManageWorker] = useState<Worker | null>(null)
  const [workerForm, setWorkerForm] = useState({ role: "", shift: "", zone: "", status: "", attendance: "" })
  const [removeWorker, setRemoveWorker] = useState<Worker | null>(null)

  // Task manage
  const [manageTask, setManageTask] = useState<Task | null>(null)
  const [manageTaskForm, setManageTaskForm] = useState({ assignedTo: "", priority: "", status: "", eta: "" })
  const [removeTask, setRemoveTask] = useState<Task | null>(null)

  const filteredWorkers = workers.filter((w) => {
    const q = search.toLowerCase()
    return (
      (w.name.toLowerCase().includes(q) || w.id.toLowerCase().includes(q)) &&
      (roleFilter === "All Roles" || w.role === roleFilter) &&
      (shiftFilter === "All Shifts" || w.shift === shiftFilter)
    )
  })

  const presentCount = workers.filter((w) => w.attendance === "Present").length
  const activeCount = workers.filter((w) => w.status === "Active").length

  const workerNames = workers.map((w) => w.name)

  function validateTask() {
    const e: Record<string, string> = {}
    if (!taskForm.type) e.type = "Select a task type"
    if (!taskForm.order.trim()) e.order = "Reference is required"
    if (!taskForm.assignedTo) e.assignedTo = "Select a worker"
    if (!taskForm.zone) e.zone = "Select a zone"
    if (!taskForm.priority) e.priority = "Select a priority"
    if (!taskForm.eta.trim()) e.eta = "ETA is required"
    setTaskErrors(e)
    return Object.keys(e).length === 0
  }

  function createTask() {
    if (!validateTask()) return
    const maxSeq = tasks.reduce((m, t) => Math.max(m, Number(t.id.replace("TASK-", "")) || 0), 100)
    const next: Task = {
      id: `TASK-${maxSeq + 1}`,
      type: taskForm.type,
      order: taskForm.order.trim().toUpperCase(),
      assignedTo: taskForm.assignedTo,
      zone: taskForm.zone,
      priority: taskForm.priority,
      status: "Pending",
      eta: taskForm.eta.trim(),
    }
    setTasks((prev) => [next, ...prev])
    setWorkers((prev) => prev.map((w) => w.name === next.assignedTo ? { ...w, tasksToday: w.tasksToday + 1 } : w))
    setAssignOpen(false)
    setTaskForm(emptyTaskForm)
    setTaskErrors({})
    setTab("tasks")
    notify.success("Task assigned", `${next.id} — ${next.type} assigned to ${next.assignedTo}.`)
  }

  function openManageWorker(w: Worker) {
    setWorkerForm({ role: w.role, shift: w.shift, zone: w.zone, status: w.status, attendance: w.attendance })
    setManageWorker(w)
  }

  function saveWorker() {
    if (!manageWorker) return
    const target = manageWorker
    setWorkers((prev) => prev.map((w) => w.id === target.id ? { ...w, ...workerForm } : w))
    setManageWorker(null)
    notify.success("Worker updated", `${target.name} is now ${workerForm.status} on ${workerForm.shift} shift.`)
  }

  function deleteWorker(w: Worker) {
    setWorkers((prev) => prev.filter((x) => x.id !== w.id))
    setManageWorker(null)
    notify.warning("Worker removed", `${w.name} (${w.id}) was removed from the roster.`)
  }

  function openManageTask(t: Task) {
    setManageTaskForm({ assignedTo: t.assignedTo, priority: t.priority, status: t.status, eta: t.eta })
    setManageTask(t)
  }

  function saveTask() {
    if (!manageTask) return
    const target = manageTask
    const nowDone = manageTaskForm.status === "Completed" && target.status !== "Completed"
    setTasks((prev) => prev.map((t) => t.id === target.id
      ? { ...t, ...manageTaskForm, eta: manageTaskForm.status === "Completed" ? "Done" : manageTaskForm.eta }
      : t))
    if (nowDone) {
      setWorkers((prev) => prev.map((w) => w.name === manageTaskForm.assignedTo
        ? { ...w, tasksCompleted: Math.min(w.tasksCompleted + 1, w.tasksToday) }
        : w))
    }
    setManageTask(null)
    notify.success("Task updated", `${target.id} is now ${manageTaskForm.status}.`)
  }

  function deleteTask(t: Task) {
    setTasks((prev) => prev.filter((x) => x.id !== t.id))
    setManageTask(null)
    notify.warning("Task cancelled", `${t.id} was removed from the task list.`)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="w-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Workforce Management</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Shift scheduling, task assignment and attendance</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ExportButton data={tab === "workers" ? filteredWorkers : tab === "tasks" ? tasks : shifts} filename="workforce" />
            <button
              onClick={() => { setTab("shifts"); notify.info("Shift schedule", `${shifts.length} shifts configured — showing the shift log.`) }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors"
            >
              <Calendar className="w-4 h-4" /> Schedule
            </button>
            <button
              onClick={() => setAssignOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> Assign Task
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Workers", value: workers.length.toString(), sub: "Across all shifts", icon: <Users className="w-5 h-5" />, subColor: "text-muted-foreground" },
            { label: "Present Today", value: presentCount.toString(), sub: `${workers.length - presentCount} absent`, icon: <UserCheck className="w-5 h-5" />, subColor: "text-success" },
            { label: "Active On Floor", value: activeCount.toString(), sub: "Currently working", icon: <CheckCircle2 className="w-5 h-5" />, subColor: "text-brand" },
            { label: "Pending Tasks", value: tasks.filter((t) => t.status !== "Completed").length.toString(), sub: "Need attention", icon: <AlertTriangle className="w-5 h-5" />, subColor: "text-warning" },
          ].map((stat, i) => (
            <div key={i} className="p-5 rounded-2xl border border-border bg-card">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className="text-brand">{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className={cn("text-xs mt-1", stat.subColor)}>{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Shift overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {shifts.map((shift) => (
            <div key={shift.name} className={cn("p-4 rounded-2xl border bg-card", shift.status === "Active" ? "border-brand/30" : "border-border")}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-foreground">{shift.name}</span>
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", shift.status === "Active" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
                  {shift.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{shift.time}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {shift.workers} workers</span>
                <span className="text-muted-foreground">Sup: {shift.supervisor}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-muted/50 w-fit">
          {(["workers", "tasks", "shifts"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors", tab === t ? "bg-brand text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/60")}>
              {t === "workers" ? "Workers" : t === "tasks" ? "Tasks" : "Shift Log"}
            </button>
          ))}
        </div>

        {tab === "workers" && (
          <>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-xl border border-border bg-card">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground text-foreground" placeholder="Search worker name or ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              {[
                { value: roleFilter, options: ["All Roles", "Picker", "Packer", "Forklift Operator", "QC Inspector", "Supervisor"], onChange: setRoleFilter },
                { value: shiftFilter, options: ["All Shifts", "Morning", "Afternoon", "Night"], onChange: setShiftFilter },
              ].map((f, i) => (
                <div key={i} className="relative">
                  <select className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-border bg-card text-sm text-foreground outline-none cursor-pointer" value={f.value} onChange={(e) => f.onChange(e.target.value)}>
                    {f.options.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {["Emp ID", "Name", "Role", "Shift", "Zone", "Tasks Today", "Completed", "Progress", "Status", ""].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWorkers.map((w, i) => {
                      const pct = w.tasksToday > 0 ? Math.round((w.tasksCompleted / w.tasksToday) * 100) : 0
                      return (
                        <tr key={w.id} className={cn("border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors", i % 2 === 1 ? "bg-muted/10" : "")}>
                          <td className="px-4 py-3 text-brand font-medium whitespace-nowrap text-xs">{w.id}</td>
                          <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{w.name}</td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{w.role}</td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{w.shift}</td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs font-mono">{w.zone}</td>
                          <td className="px-4 py-3 text-foreground font-semibold whitespace-nowrap">{w.tasksToday}</td>
                          <td className="px-4 py-3 text-foreground whitespace-nowrap">{w.tasksCompleted}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2 min-w-24">
                              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div className={cn("h-full rounded-full transition-all", pct === 100 ? "bg-success" : pct >= 60 ? "bg-brand" : "bg-warning")} style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusConfig[w.status]?.bg, statusConfig[w.status]?.color)}>
                              {w.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <RowActions
                              items={[
                                { label: "View worker details", icon: <Eye />, onSelect: () => setWorkerDetail(w) },
                                { label: "Manage worker", icon: <MoreHorizontal />, onSelect: () => openManageWorker(w) },
                              ]}
                            />
                          </td>
                        </tr>
                      )
                    })}
                    {filteredWorkers.length === 0 && (
                      <tr><td colSpan={10} className="px-4 py-10 text-center text-sm text-muted-foreground">No workers match your filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {tab === "tasks" && (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {["Task ID", "Type", "Reference", "Assigned To", "Zone", "Priority", "Status", "ETA", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, i) => (
                    <tr key={task.id} className={cn("border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors", i % 2 === 1 ? "bg-muted/10" : "")}>
                      <td className="px-4 py-3 text-brand font-medium whitespace-nowrap text-xs">{task.id}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 text-sm text-foreground font-medium">
                          <Briefcase className="w-3.5 h-3.5 text-muted-foreground" /> {task.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-brand text-xs whitespace-nowrap hover:underline cursor-pointer">{task.order}</td>
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">{task.assignedTo}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs font-mono">{task.zone}</td>
                      <td className={cn("px-4 py-3 whitespace-nowrap text-xs font-semibold", priorityColors[task.priority])}>{task.priority}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", taskStatusConfig[task.status]?.bg, taskStatusConfig[task.status]?.color)}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {task.eta}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => openManageTask(task)} title="Manage task" className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                  {tasks.length === 0 && (
                    <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">No tasks assigned yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "shifts" && (
          <div className="space-y-4">
            {shifts.map((shift) => {
              const shiftKey = shift.name.replace(" Shift", "")
              const shiftWorkers = workers.filter((w) => w.shift === shiftKey)
              const assigned = shiftWorkers.reduce((s, w) => s + w.tasksToday, 0)
              const done = shiftWorkers.reduce((s, w) => s + w.tasksCompleted, 0)
              return (
                <div key={shift.name} className="p-5 rounded-2xl border border-border bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{shift.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{shift.time} • Supervisor: {shift.supervisor}</p>
                    </div>
                    <span className={cn("text-xs font-medium px-2 py-1 rounded-full", shift.status === "Active" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
                      {shift.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Workers", value: shiftWorkers.length.toString() },
                      { label: "Tasks Assigned", value: assigned.toString() },
                      { label: "Tasks Done", value: done.toString() },
                      { label: "Efficiency", value: assigned > 0 ? `${Math.round((done / assigned) * 100)}%` : "—" },
                    ].map((m, j) => (
                      <div key={j} className="p-3 rounded-xl bg-muted/30 border border-border/50">
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                        <p className="text-lg font-bold text-foreground mt-0.5">{m.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Assign task */}
      <Modal
        open={assignOpen}
        onOpenChange={(o) => { setAssignOpen(o); if (!o) { setTaskForm(emptyTaskForm); setTaskErrors({}) } }}
        title="Assign Task"
        description="Create a floor task and assign it to a worker"
        footer={<ModalActions onCancel={() => setAssignOpen(false)} onSubmit={createTask} submitLabel="Assign Task" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Task Type" required error={taskErrors.type}>
            <Select value={taskForm.type} invalid={!!taskErrors.type} onChange={(e) => setTaskForm({ ...taskForm, type: e.target.value })} options={TASK_TYPES} placeholder="Select Type" />
          </Field>
          <Field label="Reference" required error={taskErrors.order} hint="Order or GRN number">
            <TextInput value={taskForm.order} invalid={!!taskErrors.order} onChange={(e) => setTaskForm({ ...taskForm, order: e.target.value })} placeholder="e.g. ORD-2024-157" />
          </Field>
          <Field label="Assign To" required error={taskErrors.assignedTo}>
            <Select value={taskForm.assignedTo} invalid={!!taskErrors.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })} options={workerNames} placeholder="Select Worker" />
          </Field>
          <Field label="Zone" required error={taskErrors.zone}>
            <Select value={taskForm.zone} invalid={!!taskErrors.zone} onChange={(e) => setTaskForm({ ...taskForm, zone: e.target.value })} options={ZONES} placeholder="Select Zone" />
          </Field>
          <Field label="Priority" required error={taskErrors.priority}>
            <Select value={taskForm.priority} invalid={!!taskErrors.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })} options={PRIORITIES} placeholder="Select Priority" />
          </Field>
          <Field label="ETA" required error={taskErrors.eta}>
            <TextInput value={taskForm.eta} invalid={!!taskErrors.eta} onChange={(e) => setTaskForm({ ...taskForm, eta: e.target.value })} placeholder="e.g. 20 min" />
          </Field>
        </div>
      </Modal>

      {/* Worker detail drawer */}
      <Drawer
        open={!!workerDetail}
        onOpenChange={(o) => !o && setWorkerDetail(null)}
        title={workerDetail?.name ?? ""}
        description="Worker detail"
        footer={
          <button onClick={() => setWorkerDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {workerDetail && (
          <div className="space-y-1">
            <DetailRow label="Employee ID" value={<span className="font-mono text-brand">{workerDetail.id}</span>} />
            <DetailRow label="Name" value={workerDetail.name} />
            <DetailRow label="Role" value={workerDetail.role} />
            <DetailRow label="Shift" value={workerDetail.shift} />
            <DetailRow label="Zone" value={<span className="font-mono">{workerDetail.zone}</span>} />
            <DetailRow label="Tasks Today" value={workerDetail.tasksToday} />
            <DetailRow label="Tasks Completed" value={workerDetail.tasksCompleted} />
            <DetailRow
              label="Progress"
              value={`${workerDetail.tasksToday > 0 ? Math.round((workerDetail.tasksCompleted / workerDetail.tasksToday) * 100) : 0}%`}
            />
            <DetailRow label="Attendance" value={workerDetail.attendance} />
            <DetailRow
              label="Status"
              value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusConfig[workerDetail.status]?.bg, statusConfig[workerDetail.status]?.color)}>{workerDetail.status}</span>}
            />
            <DetailRow label="Open Tasks" value={tasks.filter((t) => t.assignedTo === workerDetail.name && t.status !== "Completed").length} />
          </div>
        )}
      </Drawer>

      {/* Manage worker */}
      <Modal
        open={!!manageWorker}
        onOpenChange={(o) => !o && setManageWorker(null)}
        title={manageWorker ? `Manage ${manageWorker.name}` : ""}
        description="Update assignment, status and attendance"
        footer={
          <>
            <button
              onClick={() => { setRemoveWorker(manageWorker); setManageWorker(null) }}
              className="mr-auto rounded-lg border border-danger/30 bg-card px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
            >
              Remove Worker
            </button>
            <ModalActions onCancel={() => setManageWorker(null)} onSubmit={saveWorker} submitLabel="Save Changes" />
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Role" required>
            <Select value={workerForm.role} onChange={(e) => setWorkerForm({ ...workerForm, role: e.target.value })} options={ROLES} />
          </Field>
          <Field label="Shift" required>
            <Select value={workerForm.shift} onChange={(e) => setWorkerForm({ ...workerForm, shift: e.target.value })} options={SHIFT_NAMES} />
          </Field>
          <Field label="Zone" required>
            <Select value={workerForm.zone} onChange={(e) => setWorkerForm({ ...workerForm, zone: e.target.value })} options={ZONES} />
          </Field>
          <Field label="Status" required>
            <Select value={workerForm.status} onChange={(e) => setWorkerForm({ ...workerForm, status: e.target.value })} options={WORKER_STATUSES} />
          </Field>
          <Field label="Attendance" required>
            <Select value={workerForm.attendance} onChange={(e) => setWorkerForm({ ...workerForm, attendance: e.target.value })} options={ATTENDANCE} />
          </Field>
        </div>
      </Modal>

      {/* Manage task */}
      <Modal
        open={!!manageTask}
        onOpenChange={(o) => !o && setManageTask(null)}
        title={manageTask ? `Manage ${manageTask.id}` : ""}
        description="Reassign, reprioritise or advance this task"
        footer={
          <>
            <button
              onClick={() => { setRemoveTask(manageTask); setManageTask(null) }}
              className="mr-auto rounded-lg border border-danger/30 bg-card px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
            >
              Cancel Task
            </button>
            <ModalActions onCancel={() => setManageTask(null)} onSubmit={saveTask} submitLabel="Save Changes" />
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Assigned To" required>
            <Select value={manageTaskForm.assignedTo} onChange={(e) => setManageTaskForm({ ...manageTaskForm, assignedTo: e.target.value })} options={workerNames} placeholder="Select Worker" />
          </Field>
          <Field label="Priority" required>
            <Select value={manageTaskForm.priority} onChange={(e) => setManageTaskForm({ ...manageTaskForm, priority: e.target.value })} options={PRIORITIES} />
          </Field>
          <Field label="Status" required>
            <Select value={manageTaskForm.status} onChange={(e) => setManageTaskForm({ ...manageTaskForm, status: e.target.value })} options={TASK_STATUSES} />
          </Field>
          <Field label="ETA">
            <TextInput value={manageTaskForm.eta} onChange={(e) => setManageTaskForm({ ...manageTaskForm, eta: e.target.value })} placeholder="e.g. 15 min" />
          </Field>
        </div>
      </Modal>

      {/* Remove worker confirmation */}
      <ConfirmDialog
        open={!!removeWorker}
        onOpenChange={(o) => !o && setRemoveWorker(null)}
        title="Remove this worker?"
        message={`${removeWorker?.name} (${removeWorker?.id}) will be removed from the roster. This cannot be undone.`}
        confirmLabel="Remove Worker"
        cancelLabel="Keep Worker"
        onConfirm={() => removeWorker && deleteWorker(removeWorker)}
      />

      {/* Cancel task confirmation */}
      <ConfirmDialog
        open={!!removeTask}
        onOpenChange={(o) => !o && setRemoveTask(null)}
        title="Cancel this task?"
        message={`${removeTask?.id} (${removeTask?.type} — ${removeTask?.order}) will be removed from the task list. This cannot be undone.`}
        confirmLabel="Cancel Task"
        cancelLabel="Keep Task"
        onConfirm={() => removeTask && deleteTask(removeTask)}
      />
    </div>
  )
}
