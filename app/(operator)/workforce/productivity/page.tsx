"use client"
import { useState } from "react"
import { TrendingUp, Users, CheckCircle2, Award, Search, Eye, FileBarChart, Plus, Flag } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Worker = {
  id: string; name: string; role: string
  tasksToday: number; completed: number; accuracy: number; efficiency: number; rank: number
}

type WorkerRow = {
  id: string; name: string; role: string; period: string
  tasks: number; completed: number; accuracy: number; efficiency: number
  rank: number; baselineRank: number; note: string
}

const initialWorkers: Worker[] = [
  { id: "EMP-001", name: "Ravi Kumar", role: "Picker", tasksToday: 24, completed: 22, accuracy: 98, efficiency: 92, rank: 1 },
  { id: "EMP-002", name: "Priya Sharma", role: "Packer", tasksToday: 18, completed: 18, accuracy: 100, efficiency: 100, rank: 2 },
  { id: "EMP-003", name: "Suresh Yadav", role: "Forklift Operator", tasksToday: 12, completed: 8, accuracy: 95, efficiency: 67, rank: 5 },
  { id: "EMP-004", name: "Meena Patel", role: "QC Inspector", tasksToday: 30, completed: 30, accuracy: 99, efficiency: 100, rank: 3 },
  { id: "EMP-005", name: "Arjun Nair", role: "Picker", tasksToday: 20, completed: 5, accuracy: 90, efficiency: 25, rank: 6 },
  { id: "EMP-006", name: "Kavitha Rao", role: "Supervisor", tasksToday: 8, completed: 6, accuracy: 97, efficiency: 75, rank: 4 },
  { id: "EMP-007", name: "Mohammed Ismail", role: "Picker", tasksToday: 19, completed: 15, accuracy: 93, efficiency: 79, rank: 16 },
  { id: "EMP-008", name: "Deepika Singh", role: "Packer", tasksToday: 16, completed: 14, accuracy: 96, efficiency: 88, rank: 10 },
  { id: "EMP-009", name: "Rahul Mehta", role: "Picker", tasksToday: 26, completed: 24, accuracy: 97, efficiency: 92, rank: 9 },
  { id: "EMP-010", name: "Anita Desai", role: "QC Inspector", tasksToday: 22, completed: 19, accuracy: 98, efficiency: 86, rank: 13 },
  { id: "EMP-011", name: "Vikram Sharma", role: "Forklift Operator", tasksToday: 14, completed: 12, accuracy: 94, efficiency: 86, rank: 14 },
  { id: "EMP-012", name: "Deepa Menon", role: "Packer", tasksToday: 19, completed: 15, accuracy: 95, efficiency: 79, rank: 17 },
  { id: "EMP-013", name: "Sanjay Gupta", role: "Picker", tasksToday: 21, completed: 13, accuracy: 91, efficiency: 62, rank: 22 },
  { id: "EMP-014", name: "Rajan Pillai", role: "Supervisor", tasksToday: 9, completed: 7, accuracy: 96, efficiency: 78, rank: 18 },
  { id: "EMP-015", name: "Sunita Devi", role: "Supervisor", tasksToday: 6, completed: 4, accuracy: 95, efficiency: 67, rank: 21 },
  { id: "EMP-016", name: "Lakshmi Iyer", role: "Packer", tasksToday: 17, completed: 16, accuracy: 99, efficiency: 94, rank: 7 },
  { id: "EMP-017", name: "Manoj Verma", role: "Picker", tasksToday: 23, completed: 20, accuracy: 96, efficiency: 87, rank: 12 },
  { id: "EMP-018", name: "Farhan Qureshi", role: "Forklift Operator", tasksToday: 13, completed: 9, accuracy: 92, efficiency: 69, rank: 19 },
  { id: "EMP-019", name: "Nisha Reddy", role: "QC Inspector", tasksToday: 28, completed: 26, accuracy: 99, efficiency: 93, rank: 8 },
  { id: "EMP-020", name: "Ganesh Pawar", role: "Picker", tasksToday: 16, completed: 11, accuracy: 90, efficiency: 69, rank: 20 },
  { id: "EMP-021", name: "Shweta Joshi", role: "Packer", tasksToday: 15, completed: 12, accuracy: 94, efficiency: 80, rank: 15 },
  { id: "EMP-022", name: "Karthik Subramanian", role: "Picker", tasksToday: 20, completed: 11, accuracy: 89, efficiency: 55, rank: 24 },
  { id: "EMP-023", name: "Pooja Bhatt", role: "QC Inspector", tasksToday: 24, completed: 21, accuracy: 98, efficiency: 88, rank: 11 },
  { id: "EMP-024", name: "Imran Shaikh", role: "Forklift Operator", tasksToday: 13, completed: 8, accuracy: 91, efficiency: 62, rank: 23 },
]

const PERIODS = ["Today", "This Week", "This Month"] as const
type Period = (typeof PERIODS)[number]

/** Shift multiplier + deterministic per-worker drift so each period re-derives real numbers. */
const PERIOD_FACTOR: Record<Period, number> = { Today: 1, "This Week": 6, "This Month": 26 }
const PERIOD_DRIFT: Record<Period, number[]> = {
  Today: [0, 0, 0, 0, 0, 0],
  "This Week": [3, -1, 8, 0, 12, -4],
  "This Month": [5, -2, 14, 0, 20, -7],
}

const noteColor: Record<string, string> = {
  Recognized: "bg-success/10 text-success",
  Coaching: "bg-warning/10 text-warning",
}

const emptyForm = { worker: "", tasks: "", completed: "" }

export default function ProductivityPage() {
  const [workers, setWorkers] = useState<Worker[]>(initialWorkers)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [period, setPeriod] = useState<Period>("Today")
  const [search, setSearch] = useState("")

  const [logOpen, setLogOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [reportOpen, setReportOpen] = useState(false)
  const [detail, setDetail] = useState<WorkerRow | null>(null)
  const [coachTarget, setCoachTarget] = useState<WorkerRow | null>(null)

  const factor = PERIOD_FACTOR[period]
  const drift = PERIOD_DRIFT[period]

  // Re-derive every displayed metric from state + the selected period.
  const scaled = workers.map((w, i) => {
    const tasks = w.tasksToday * factor
    const raw = Math.round(w.completed * factor * (1 + (drift[i % drift.length] ?? 0) / 100))
    const completed = Math.max(0, Math.min(tasks, raw))
    const efficiency = tasks === 0 ? 0 : Math.round((completed / tasks) * 100)
    return { w, tasks, completed, efficiency }
  })

  const ranked: WorkerRow[] = scaled
    .slice()
    .sort((a, b) => b.efficiency - a.efficiency || b.w.accuracy - a.w.accuracy || b.completed - a.completed)
    .map((r, idx) => ({
      id: r.w.id,
      name: r.w.name,
      role: r.w.role,
      period,
      tasks: r.tasks,
      completed: r.completed,
      accuracy: r.w.accuracy,
      efficiency: r.efficiency,
      rank: idx + 1,
      baselineRank: r.w.rank,
      note: notes[r.w.id] ?? "",
    }))

  const filtered = ranked.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase()) ||
    r.role.toLowerCase().includes(search.toLowerCase())
  )

  const avgEfficiency = ranked.length ? Math.round(ranked.reduce((s, r) => s + r.efficiency, 0) / ranked.length) : 0
  const tasksDone = ranked.reduce((s, r) => s + r.completed, 0)
  const topPerformer = ranked[0]
  const shortName = (n?: string) => {
    if (!n) return "—"
    const [first, last] = n.split(" ")
    return last ? `${first} ${last[0]}.` : first
  }

  const kpis = [
    { label: "Avg Efficiency", value: `${avgEfficiency}%`, icon: <TrendingUp className="w-5 h-5 text-brand" /> },
    { label: "Top Performer", value: shortName(topPerformer?.name), icon: <Award className="w-5 h-5 text-brand" /> },
    { label: "Tasks Done", value: String(tasksDone), icon: <CheckCircle2 className="w-5 h-5 text-success" /> },
    { label: "Active Workers", value: String(workers.length), icon: <Users className="w-5 h-5 text-brand" /> },
  ]

  // Per-role rollup used by the report modal.
  const roleRollup = Array.from(new Set(ranked.map(r => r.role))).map(role => {
    const rows = ranked.filter(r => r.role === role)
    return {
      role,
      headcount: rows.length,
      tasks: rows.reduce((s, r) => s + r.tasks, 0),
      completed: rows.reduce((s, r) => s + r.completed, 0),
      efficiency: Math.round(rows.reduce((s, r) => s + r.efficiency, 0) / rows.length),
    }
  }).sort((a, b) => b.efficiency - a.efficiency)

  function validate() {
    const e: Record<string, string> = {}
    if (!form.worker) e.worker = "Select a worker"
    if (!form.tasks.trim()) e.tasks = "Tasks assigned is required"
    else if (!/^\d+$/.test(form.tasks) || Number(form.tasks) < 1) e.tasks = "Enter a positive whole number"
    if (!form.completed.trim()) e.completed = "Tasks completed is required"
    else if (!/^\d+$/.test(form.completed)) e.completed = "Enter a whole number"
    else if (form.tasks.trim() && /^\d+$/.test(form.tasks) && Number(form.completed) > Number(form.tasks)) {
      e.completed = "Completed cannot exceed assigned"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function logOutput() {
    if (!validate()) return
    const addTasks = Number(form.tasks)
    const addCompleted = Number(form.completed)
    const target = workers.find(w => w.name === form.worker)
    setWorkers(prev => prev.map(w => {
      if (w.name !== form.worker) return w
      const tasksToday = w.tasksToday + addTasks
      const completed = w.completed + addCompleted
      return { ...w, tasksToday, completed, efficiency: Math.round((completed / tasksToday) * 100) }
    }))
    setLogOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Output logged", `${target?.id ?? form.worker}: +${addCompleted}/${addTasks} tasks. Leaderboard recalculated.`)
  }

  function recognize(r: WorkerRow) {
    if (notes[r.id] === "Recognized") {
      setNotes(prev => { const next = { ...prev }; delete next[r.id]; return next })
      notify.info("Recognition removed", `${r.name} is no longer flagged as recognized.`)
      return
    }
    setNotes(prev => ({ ...prev, [r.id]: "Recognized" }))
    notify.success("Worker recognized", `${r.name} recognized for ${r.efficiency}% efficiency (${period.toLowerCase()}).`)
  }

  function flagCoaching(r: WorkerRow) {
    setNotes(prev => ({ ...prev, [r.id]: "Coaching" }))
    notify.warning("Flagged for coaching", `${r.name} added to the coaching list at ${r.efficiency}% efficiency.`)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Productivity Analytics</h1>
          <p className="text-sm text-muted-foreground">Worker performance and efficiency metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="workforce-productivity" />
          <button
            onClick={() => setReportOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors"
          >
            <FileBarChart className="w-4 h-4" /> Report
          </button>
          <button
            onClick={() => setLogOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Log Output
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-card border border-border rounded-xl p-3 flex items-start justify-between">
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
            placeholder="Search worker, ID, role..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
        {PERIODS.map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              period === p ? "bg-brand text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {["Rank", "Emp ID", "Name", "Role", `Tasks ${period}`, "Completed", "Accuracy", "Efficiency", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(w => (
              <tr key={w.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    w.rank === 1 ? "bg-yellow-100 text-yellow-700" : w.rank === 2 ? "bg-gray-100 text-gray-600" : w.rank === 3 ? "bg-orange-100 text-orange-700" : "bg-muted text-muted-foreground"
                  )}>{w.rank}</span>
                </td>
                <td className="px-4 py-3 text-brand font-medium">{w.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">
                  <span className="flex items-center gap-2">
                    {w.name}
                    {w.note && <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium", noteColor[w.note])}>{w.note}</span>}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{w.role}</td>
                <td className="px-4 py-3 text-foreground">{w.tasks}</td>
                <td className="px-4 py-3 text-foreground">{w.completed}</td>
                <td className="px-4 py-3 text-foreground">{w.accuracy}%</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", w.efficiency >= 90 ? "bg-success" : w.efficiency >= 60 ? "bg-brand" : "bg-danger")} style={{ width: `${w.efficiency}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-8">{w.efficiency}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: "View scorecard", icon: <Eye />, onSelect: () => setDetail(w) },
                      { label: w.note === "Recognized" ? "Remove recognition" : "Recognize worker", icon: <Award />, onSelect: () => recognize(w), tone: w.note === "Recognized" ? ("default" as const) : ("success" as const) },
                      { label: "Flag for coaching", icon: <Flag />, onSelect: () => setCoachTarget(w) },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">No workers match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Log output */}
      <Modal
        open={logOpen}
        onOpenChange={(o) => { setLogOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="Log Worker Output"
        description="Add completed work to a worker — efficiency, ranks and KPIs recalculate"
        footer={<ModalActions onCancel={() => setLogOpen(false)} onSubmit={logOutput} submitLabel="Log Output" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Worker" required error={errors.worker}>
            <Select
              value={form.worker}
              invalid={!!errors.worker}
              onChange={e => setForm({ ...form, worker: e.target.value })}
              options={workers.map(w => w.name)}
              placeholder="Select Worker"
            />
          </Field>
          <Field label="Tasks Assigned" required error={errors.tasks}>
            <TextInput value={form.tasks} invalid={!!errors.tasks} onChange={e => setForm({ ...form, tasks: e.target.value })} placeholder="e.g. 10" inputMode="numeric" />
          </Field>
          <Field label="Tasks Completed" required error={errors.completed} hint="Cannot exceed tasks assigned">
            <TextInput value={form.completed} invalid={!!errors.completed} onChange={e => setForm({ ...form, completed: e.target.value })} placeholder="e.g. 9" inputMode="numeric" />
          </Field>
        </div>
      </Modal>

      {/* Report */}
      <Modal
        open={reportOpen}
        onOpenChange={setReportOpen}
        title={`Productivity Report — ${period}`}
        description="Role-level rollup derived from the current leaderboard"
        size="lg"
        footer={
          <>
            <button onClick={() => setReportOpen(false)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Close
            </button>
            <button
              onClick={() => notify.info("Report shared", `${period} productivity report sent to the operations supervisor.`)}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90"
            >
              Share Report
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-muted/30 border border-border rounded-xl p-2.5">
              <p className="text-xs text-muted-foreground">Avg Efficiency</p>
              <p className="text-xl font-bold text-foreground mt-1">{avgEfficiency}%</p>
            </div>
            <div className="bg-muted/30 border border-border rounded-xl p-2.5">
              <p className="text-xs text-muted-foreground">Tasks Completed</p>
              <p className="text-xl font-bold text-foreground mt-1">{tasksDone}</p>
            </div>
            <div className="bg-muted/30 border border-border rounded-xl p-2.5">
              <p className="text-xs text-muted-foreground">Top Performer</p>
              <p className="text-xl font-bold text-foreground mt-1">{shortName(topPerformer?.name)}</p>
            </div>
          </div>

          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  {["Role", "Headcount", "Tasks", "Completed", "Efficiency"].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {roleRollup.map(r => (
                  <tr key={r.role}>
                    <td className="px-4 py-2.5 font-medium text-foreground">{r.role}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.headcount}</td>
                    <td className="px-4 py-2.5 text-foreground">{r.tasks}</td>
                    <td className="px-4 py-2.5 text-foreground">{r.completed}</td>
                    <td className={cn("px-4 py-2.5 font-medium", r.efficiency >= 90 ? "text-success" : r.efficiency >= 60 ? "text-brand" : "text-danger")}>{r.efficiency}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* Scorecard drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.name ?? ""}
        description={`Scorecard — ${period.toLowerCase()}`}
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Emp ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Role" value={detail.role} />
            <DetailRow label="Period" value={detail.period} />
            <DetailRow label="Current Rank" value={`#${detail.rank} of ${ranked.length}`} />
            <DetailRow label="Baseline Rank" value={`#${detail.baselineRank}`} />
            <DetailRow label="Tasks Assigned" value={detail.tasks} />
            <DetailRow label="Tasks Completed" value={detail.completed} />
            <DetailRow label="Accuracy" value={`${detail.accuracy}%`} />
            <DetailRow
              label="Efficiency"
              value={<span className={cn("font-medium", detail.efficiency >= 90 ? "text-success" : detail.efficiency >= 60 ? "text-brand" : "text-danger")}>{detail.efficiency}%</span>}
            />
            <DetailRow
              label="Note"
              value={detail.note
                ? <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", noteColor[detail.note])}>{detail.note}</span>
                : <span className="text-muted-foreground">—</span>}
            />
          </div>
        )}
      </Drawer>

      {/* Coaching confirmation */}
      <ConfirmDialog
        open={!!coachTarget}
        onOpenChange={(o) => !o && setCoachTarget(null)}
        title="Flag for coaching?"
        message={`${coachTarget?.name} (${coachTarget?.efficiency}% efficiency) will be added to the coaching list and their supervisor notified.`}
        confirmLabel="Flag for Coaching"
        cancelLabel="Not Now"
        tone="brand"
        onConfirm={() => coachTarget && flagCoaching(coachTarget)}
      />
    </div>
  )
}
