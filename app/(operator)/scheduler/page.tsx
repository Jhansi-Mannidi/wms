"use client"

import { useState } from "react"
import {
  Clock, Play, Pause, CheckCircle2, AlertTriangle,
  Plus, RefreshCw, ChevronDown, Eye, MoreHorizontal, Zap, Calendar
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Job = {
  id: string; name: string; type: string; schedule: string
  lastRun: string; nextRun: string; duration: string; status: string; enabled: boolean
}

type SlaRule = {
  id: string; name: string; module: string; target: string
  breachAction: string; priority: string; active: boolean
}

const initialJobs: Job[] = [
  { id: "JOB-001", name: "Daily Stock Reconciliation", type: "Inventory", schedule: "Every day 02:00 AM", lastRun: "Today 02:00 AM", nextRun: "Tomorrow 02:00 AM", duration: "12 min", status: "Success", enabled: true },
  { id: "JOB-002", name: "SLA Breach Check", type: "Orders", schedule: "Every 30 minutes", lastRun: "15 min ago", nextRun: "15 min from now", duration: "45 sec", status: "Running", enabled: true },
  { id: "JOB-003", name: "Low Stock Alert", type: "Inventory", schedule: "Every hour", lastRun: "1 hour ago", nextRun: "In 5 min", duration: "2 min", status: "Success", enabled: true },
  { id: "JOB-004", name: "Invoice Auto-Generation", type: "Billing", schedule: "1st of every month 06:00", lastRun: "Dec 1, 2024", nextRun: "Jan 1, 2025", duration: "8 min", status: "Success", enabled: true },
  { id: "JOB-005", name: "Pallet Age Report", type: "Inventory", schedule: "Every Sunday 06:00 AM", lastRun: "Dec 15, 2024", nextRun: "Dec 22, 2024", duration: "5 min", status: "Success", enabled: true },
  { id: "JOB-006", name: "Workforce Attendance Sync", type: "Workforce", schedule: "Every day 11:59 PM", lastRun: "Yesterday 11:59 PM", nextRun: "Today 11:59 PM", duration: "3 min", status: "Failed", enabled: true },
  { id: "JOB-007", name: "Cold Chain Report Export", type: "Cold Chain", schedule: "Every day 08:00 AM", lastRun: "Today 08:00 AM", nextRun: "Tomorrow 08:00 AM", duration: "6 min", status: "Success", enabled: false },
  { id: "JOB-008", name: "MHE Battery Alert", type: "MHE", schedule: "Every 2 hours", lastRun: "2 hours ago", nextRun: "In 30 min", duration: "1 min", status: "Success", enabled: true },
]

const initialSlaRules: SlaRule[] = [
  { id: "SLA-001", name: "B2B Order Dispatch", module: "Orders", target: "Within 24 hours of order", breachAction: "Alert + Escalate", priority: "High", active: true },
  { id: "SLA-002", name: "B2C Order Dispatch", module: "Orders", target: "Within 12 hours of order", breachAction: "Alert + Escalate", priority: "Urgent", active: true },
  { id: "SLA-003", name: "GRN Completion", module: "Inbound", target: "Within 4 hours of gate entry", breachAction: "Alert Supervisor", priority: "Normal", active: true },
  { id: "SLA-004", name: "Putaway Completion", module: "Inventory", target: "Within 2 hours of GRN", breachAction: "Alert Manager", priority: "Normal", active: true },
  { id: "SLA-005", name: "Cold Chain Alert Response", module: "Cold Chain", target: "Within 15 minutes of alert", breachAction: "Escalate to GM", priority: "Urgent", active: true },
]

const statusConfig: Record<string, { color: string; bg: string }> = {
  Success: { color: "text-success", bg: "bg-success/15" },
  Running: { color: "text-brand", bg: "bg-brand/15" },
  Failed: { color: "text-danger", bg: "bg-danger/15" },
  Disabled: { color: "text-muted-foreground", bg: "bg-muted" },
}

const priorityColors: Record<string, string> = {
  Urgent: "text-danger",
  High: "text-warning",
  Normal: "text-muted-foreground",
}

const JOB_TYPES = ["Inventory", "Orders", "Billing", "Workforce", "Cold Chain", "MHE"] as const
const SCHEDULES = ["Every 30 minutes", "Every hour", "Every 2 hours", "Every day 02:00 AM", "Every day 08:00 AM", "Every Sunday 06:00 AM", "1st of every month 06:00"] as const
const MODULES = ["Orders", "Inbound", "Inventory", "Cold Chain", "Workforce", "Billing"] as const
const BREACH_ACTIONS = ["Alert Supervisor", "Alert Manager", "Alert + Escalate", "Escalate to GM"] as const
const PRIORITIES = ["Normal", "High", "Urgent"] as const

const emptyJobForm = { name: "", type: "", schedule: "", duration: "" }
const emptySlaForm = { name: "", module: "", target: "", breachAction: "", priority: "" }

function stamp() {
  return `Today ${new Date().toTimeString().slice(0, 5)}`
}

export default function SchedulerPage() {
  const [tab, setTab] = useState<"jobs" | "sla">("jobs")
  const [typeFilter, setTypeFilter] = useState("All Types")

  const [jobs, setJobs] = useState<Job[]>(initialJobs)
  const [slaRules, setSlaRules] = useState<SlaRule[]>(initialSlaRules)

  const [jobModalOpen, setJobModalOpen] = useState(false)
  const [editJob, setEditJob] = useState<Job | null>(null)
  const [jobForm, setJobForm] = useState(emptyJobForm)
  const [jobErrors, setJobErrors] = useState<Record<string, string>>({})

  const [slaModalOpen, setSlaModalOpen] = useState(false)
  const [editSla, setEditSla] = useState<SlaRule | null>(null)
  const [slaForm, setSlaForm] = useState(emptySlaForm)
  const [slaErrors, setSlaErrors] = useState<Record<string, string>>({})

  const [jobDetail, setJobDetail] = useState<Job | null>(null)
  const [logsOpen, setLogsOpen] = useState(false)
  const [deleteJob, setDeleteJob] = useState<Job | null>(null)
  const [deleteSla, setDeleteSla] = useState<SlaRule | null>(null)

  const filteredJobs = jobs.filter((j) => typeFilter === "All Types" || j.type === typeFilter)
  const failedCount = jobs.filter((j) => j.status === "Failed").length
  const runningCount = jobs.filter((j) => j.status === "Running").length
  const failedJobs = jobs.filter((j) => j.status === "Failed")

  /* ---------------- jobs ---------------- */

  function runJob(job: Job) {
    const at = stamp()
    setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: "Success", lastRun: at } : j)))
    notify.success("Job executed", `${job.name} finished successfully at ${at.replace("Today ", "")}.`)
  }

  function runAllEnabled() {
    const targets = jobs.filter((j) => j.enabled)
    if (targets.length === 0) {
      notify.warning("Nothing to run", "All jobs are currently disabled.")
      return
    }
    const at = stamp()
    setJobs((prev) => prev.map((j) => (j.enabled ? { ...j, status: "Success", lastRun: at } : j)))
    notify.success("Run triggered", `${targets.length} enabled job${targets.length > 1 ? "s" : ""} executed at ${at.replace("Today ", "")}.`)
  }

  function toggleJob(job: Job) {
    setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, enabled: !j.enabled } : j)))
    notify.info(job.enabled ? "Job disabled" : "Job enabled", `${job.name} is now ${job.enabled ? "paused" : "active"}.`)
  }

  function openNewJob() {
    setEditJob(null)
    setJobForm(emptyJobForm)
    setJobErrors({})
    setJobModalOpen(true)
  }

  function openEditJob(job: Job) {
    setEditJob(job)
    setJobForm({ name: job.name, type: job.type, schedule: job.schedule, duration: job.duration })
    setJobErrors({})
    setJobModalOpen(true)
  }

  function validateJob() {
    const e: Record<string, string> = {}
    if (!jobForm.name.trim()) e.name = "Job name is required"
    if (!jobForm.type) e.type = "Select a module"
    if (!jobForm.schedule) e.schedule = "Select a schedule"
    if (!jobForm.duration.trim()) e.duration = "Expected duration is required"
    setJobErrors(e)
    return Object.keys(e).length === 0
  }

  function submitJob() {
    if (!validateJob()) return
    if (editJob) {
      setJobs((prev) => prev.map((j) => (j.id === editJob.id ? {
        ...j, name: jobForm.name.trim(), type: jobForm.type, schedule: jobForm.schedule, duration: jobForm.duration.trim(),
      } : j)))
      notify.success("Job updated", `${jobForm.name.trim()} has been saved.`)
    } else {
      const next: Job = {
        id: `JOB-${String(jobs.length + 1).padStart(3, "0")}`,
        name: jobForm.name.trim(),
        type: jobForm.type,
        schedule: jobForm.schedule,
        lastRun: "Never",
        nextRun: "Pending first run",
        duration: jobForm.duration.trim(),
        status: "Success",
        enabled: true,
      }
      setJobs((prev) => [next, ...prev])
      notify.success("Job created", `${next.name} scheduled — ${next.schedule}.`)
    }
    setJobModalOpen(false)
    setEditJob(null)
    setJobForm(emptyJobForm)
    setJobErrors({})
  }

  function removeJob(job: Job) {
    setJobs((prev) => prev.filter((j) => j.id !== job.id))
    setJobDetail(null)
    notify.warning("Job deleted", `${job.name} has been removed from the scheduler.`)
  }

  /* ---------------- sla ---------------- */

  function openNewSla() {
    setEditSla(null)
    setSlaForm(emptySlaForm)
    setSlaErrors({})
    setSlaModalOpen(true)
  }

  function openEditSla(rule: SlaRule) {
    setEditSla(rule)
    setSlaForm({ name: rule.name, module: rule.module, target: rule.target, breachAction: rule.breachAction, priority: rule.priority })
    setSlaErrors({})
    setSlaModalOpen(true)
  }

  function validateSla() {
    const e: Record<string, string> = {}
    if (!slaForm.name.trim()) e.name = "Rule name is required"
    if (!slaForm.module) e.module = "Select a module"
    if (!slaForm.target.trim()) e.target = "Target is required"
    if (!slaForm.breachAction) e.breachAction = "Select a breach action"
    if (!slaForm.priority) e.priority = "Select a priority"
    setSlaErrors(e)
    return Object.keys(e).length === 0
  }

  function submitSla() {
    if (!validateSla()) return
    if (editSla) {
      setSlaRules((prev) => prev.map((r) => (r.id === editSla.id ? {
        ...r, name: slaForm.name.trim(), module: slaForm.module, target: slaForm.target.trim(),
        breachAction: slaForm.breachAction, priority: slaForm.priority,
      } : r)))
      notify.success("SLA rule updated", `${slaForm.name.trim()} has been saved.`)
    } else {
      const next: SlaRule = {
        id: `SLA-${String(slaRules.length + 1).padStart(3, "0")}`,
        name: slaForm.name.trim(),
        module: slaForm.module,
        target: slaForm.target.trim(),
        breachAction: slaForm.breachAction,
        priority: slaForm.priority,
        active: true,
      }
      setSlaRules((prev) => [next, ...prev])
      notify.success("SLA rule created", `${next.name} is now tracking ${next.module}.`)
    }
    setSlaModalOpen(false)
    setEditSla(null)
    setSlaForm(emptySlaForm)
    setSlaErrors({})
  }

  function toggleSla(rule: SlaRule) {
    setSlaRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, active: !r.active } : r)))
    notify.info(rule.active ? "Rule deactivated" : "Rule activated", `${rule.name} is now ${rule.active ? "inactive" : "active"}.`)
  }

  function removeSla(rule: SlaRule) {
    setSlaRules((prev) => prev.filter((r) => r.id !== rule.id))
    notify.warning("SLA rule deleted", `${rule.name} has been removed.`)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="w-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Scheduler & Automation</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage scheduled jobs, SLA rules and automated workflows</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={runAllEnabled} title="Run all enabled jobs now" className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors">
              <RefreshCw className="w-4 h-4" /> Run Now
            </button>
            <button onClick={openNewJob} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
              <Plus className="w-4 h-4" /> New Job
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Jobs", value: jobs.length.toString(), sub: "Configured", icon: <Zap className="w-5 h-5" /> },
            { label: "Running Now", value: runningCount.toString(), sub: "Active executions", icon: <Play className="w-5 h-5" /> },
            { label: "Failed (Today)", value: failedCount.toString(), sub: "Needs attention", icon: <AlertTriangle className="w-5 h-5" /> },
            { label: "SLA Rules", value: slaRules.filter((r) => r.active).length.toString(), sub: "Active rules", icon: <Clock className="w-5 h-5" /> },
          ].map((stat, i) => (
            <div key={i} className="p-3.5 rounded-2xl border border-border bg-card">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className={cn(i === 2 && failedCount > 0 ? "text-danger" : "text-brand")}>{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className={cn("text-xs mt-1", i === 2 && failedCount > 0 ? "text-danger" : "text-muted-foreground")}>{stat.sub}</p>
            </div>
          ))}
        </div>

        {failedCount > 0 && (
          <div className="flex items-center gap-3 p-4 rounded-2xl border border-danger/30 bg-danger/5">
            <AlertTriangle className="w-5 h-5 text-danger shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-danger">{failedCount} job{failedCount > 1 ? "s" : ""} failed</p>
              <p className="text-xs text-muted-foreground mt-0.5">{failedJobs[0]?.name} failed on its last run. Check error logs.</p>
            </div>
            <button onClick={() => setLogsOpen(true)} title="View failure logs" className="px-3 py-1.5 rounded-lg border border-danger/30 text-danger text-xs font-medium hover:bg-danger/10 transition-colors">
              View Logs
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-muted/50 w-fit">
          {(["jobs", "sla"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-colors", tab === t ? "bg-brand text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/60")}>
              {t === "jobs" ? "Scheduled Jobs" : "SLA Rules"}
            </button>
          ))}
        </div>

        {tab === "jobs" && (
          <>
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <select className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-border bg-card text-sm text-foreground outline-none cursor-pointer" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  {["All Types", "Inventory", "Orders", "Billing", "Workforce", "Cold Chain", "MHE"].map((t) => <option key={t}>{t}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3">
              {filteredJobs.map((job) => (
                <div key={job.id} className={cn("p-4 rounded-2xl border bg-card hover:border-brand/30 transition-colors", job.status === "Failed" ? "border-danger/30 bg-danger/5" : "border-border")}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                        job.status === "Running" ? "bg-brand/15" : job.status === "Failed" ? "bg-danger/15" : "bg-success/15"
                      )}>
                        {job.status === "Running" ? <RefreshCw className="w-4 h-4 text-brand animate-spin" /> :
                          job.status === "Failed" ? <AlertTriangle className="w-4 h-4 text-danger" /> :
                          <CheckCircle2 className="w-4 h-4 text-success" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-foreground">{job.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand/10 text-brand">{job.type}</span>
                          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium", statusConfig[job.status]?.bg, statusConfig[job.status]?.color)}>
                            {job.status}
                          </span>
                          {!job.enabled && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">Disabled</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> {job.schedule}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Last: {job.lastRun}</span>
                          <span className="text-xs text-muted-foreground">Next: {job.nextRun}</span>
                          <span className="text-xs text-muted-foreground">Duration: {job.duration}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <RowActions
                        items={[
                          { label: "Run now", icon: <Play />, onSelect: () => runJob(job) },
                          {
                            label: job.enabled ? "Disable" : "Enable",
                            icon: job.enabled ? <Pause /> : <Play />,
                            onSelect: () => toggleJob(job),
                          },
                          { label: "View job details", icon: <Eye />, onSelect: () => setJobDetail(job) },
                          { label: "Edit job", icon: <MoreHorizontal />, onSelect: () => openEditJob(job) },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {filteredJobs.length === 0 && (
                <div className="p-10 rounded-2xl border border-border bg-card text-center text-sm text-muted-foreground">
                  No jobs match this type filter.
                </div>
              )}
            </div>
          </>
        )}

        {tab === "sla" && (
          <>
            <div className="flex justify-end">
              <button onClick={openNewSla} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
                <Plus className="w-4 h-4" /> Add SLA Rule
              </button>
            </div>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {["Rule ID", "Name", "Module", "Target", "Breach Action", "Priority", "Active", ""].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {slaRules.map((rule, i) => (
                      <tr key={rule.id} className={cn("border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors", i % 2 === 1 ? "bg-muted/10" : "")}>
                        <td className="px-4 py-3 text-brand font-medium whitespace-nowrap text-xs">{rule.id}</td>
                        <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{rule.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand/10 text-brand">{rule.module}</span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs max-w-48">{rule.target}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{rule.breachAction}</td>
                        <td className={cn("px-4 py-3 whitespace-nowrap text-xs font-semibold", priorityColors[rule.priority])}>{rule.priority}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => toggleSla(rule)}
                            title={rule.active ? "Deactivate rule" : "Activate rule"}
                            className={cn("px-2 py-1 rounded-full text-xs font-medium", rule.active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}
                          >
                            {rule.active ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => openEditSla(rule)} title="Edit SLA rule" className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                    {slaRules.length === 0 && (
                      <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No SLA rules configured.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Job create / edit */}
      <Modal
        open={jobModalOpen}
        onOpenChange={(o) => { setJobModalOpen(o); if (!o) { setEditJob(null); setJobForm(emptyJobForm); setJobErrors({}) } }}
        title={editJob ? "Edit Scheduled Job" : "New Scheduled Job"}
        description={editJob ? `Update ${editJob.id}` : "Create a recurring background job"}
        footer={
          <ModalActions
            onCancel={() => setJobModalOpen(false)}
            onSubmit={submitJob}
            submitLabel={editJob ? "Save Job" : "Create Job"}
          />
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Job Name" required error={jobErrors.name}>
            <TextInput value={jobForm.name} invalid={!!jobErrors.name} onChange={(e) => setJobForm({ ...jobForm, name: e.target.value })} placeholder="e.g. Daily Stock Reconciliation" />
          </Field>
          <Field label="Module" required error={jobErrors.type}>
            <Select value={jobForm.type} invalid={!!jobErrors.type} onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })} options={JOB_TYPES} placeholder="Select Module" />
          </Field>
          <Field label="Schedule" required error={jobErrors.schedule}>
            <Select value={jobForm.schedule} invalid={!!jobErrors.schedule} onChange={(e) => setJobForm({ ...jobForm, schedule: e.target.value })} options={SCHEDULES} placeholder="Select Schedule" />
          </Field>
          <Field label="Expected Duration" required error={jobErrors.duration}>
            <TextInput value={jobForm.duration} invalid={!!jobErrors.duration} onChange={(e) => setJobForm({ ...jobForm, duration: e.target.value })} placeholder="e.g. 5 min" />
          </Field>
        </div>
      </Modal>

      {/* SLA create / edit */}
      <Modal
        open={slaModalOpen}
        onOpenChange={(o) => { setSlaModalOpen(o); if (!o) { setEditSla(null); setSlaForm(emptySlaForm); setSlaErrors({}) } }}
        title={editSla ? "Edit SLA Rule" : "New SLA Rule"}
        description={editSla ? `Update ${editSla.id}` : "Define a service level target and breach action"}
        footer={
          <>
            {editSla && (
              <button
                onClick={() => { const r = editSla; setSlaModalOpen(false); setDeleteSla(r) }}
                className="mr-auto rounded-lg border border-danger/30 px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
              >
                Delete
              </button>
            )}
            <ModalActions
              onCancel={() => setSlaModalOpen(false)}
              onSubmit={submitSla}
              submitLabel={editSla ? "Save Rule" : "Create Rule"}
            />
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Rule Name" required error={slaErrors.name}>
            <TextInput value={slaForm.name} invalid={!!slaErrors.name} onChange={(e) => setSlaForm({ ...slaForm, name: e.target.value })} placeholder="e.g. B2B Order Dispatch" />
          </Field>
          <Field label="Module" required error={slaErrors.module}>
            <Select value={slaForm.module} invalid={!!slaErrors.module} onChange={(e) => setSlaForm({ ...slaForm, module: e.target.value })} options={MODULES} placeholder="Select Module" />
          </Field>
          <Field label="Target" required error={slaErrors.target}>
            <TextInput value={slaForm.target} invalid={!!slaErrors.target} onChange={(e) => setSlaForm({ ...slaForm, target: e.target.value })} placeholder="e.g. Within 24 hours of order" />
          </Field>
          <Field label="Breach Action" required error={slaErrors.breachAction}>
            <Select value={slaForm.breachAction} invalid={!!slaErrors.breachAction} onChange={(e) => setSlaForm({ ...slaForm, breachAction: e.target.value })} options={BREACH_ACTIONS} placeholder="Select Action" />
          </Field>
          <Field label="Priority" required error={slaErrors.priority}>
            <Select value={slaForm.priority} invalid={!!slaErrors.priority} onChange={(e) => setSlaForm({ ...slaForm, priority: e.target.value })} options={PRIORITIES} placeholder="Select Priority" />
          </Field>
        </div>
      </Modal>

      {/* Job detail */}
      <Drawer
        open={!!jobDetail}
        onOpenChange={(o) => !o && setJobDetail(null)}
        title={jobDetail?.name ?? ""}
        description="Scheduled job detail"
        footer={
          <>
            <button
              onClick={() => jobDetail && setDeleteJob(jobDetail)}
              className="rounded-lg border border-danger/30 px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
            >
              Delete Job
            </button>
            <button onClick={() => setJobDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Close
            </button>
          </>
        }
      >
        {jobDetail && (
          <div className="space-y-1">
            <DetailRow label="Job ID" value={<span className="font-mono text-brand">{jobDetail.id}</span>} />
            <DetailRow label="Name" value={jobDetail.name} />
            <DetailRow label="Module" value={jobDetail.type} />
            <DetailRow label="Schedule" value={jobDetail.schedule} />
            <DetailRow label="Last Run" value={jobDetail.lastRun} />
            <DetailRow label="Next Run" value={jobDetail.nextRun} />
            <DetailRow label="Duration" value={jobDetail.duration} />
            <DetailRow label="Enabled" value={jobDetail.enabled ? "Yes" : "No"} />
            <DetailRow
              label="Status"
              value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusConfig[jobDetail.status]?.bg, statusConfig[jobDetail.status]?.color)}>{jobDetail.status}</span>}
            />
          </div>
        )}
      </Drawer>

      {/* Failure logs */}
      <Drawer
        open={logsOpen}
        onOpenChange={setLogsOpen}
        title="Failure Logs"
        description={`${failedCount} job${failedCount === 1 ? "" : "s"} reporting errors`}
        footer={
          <button onClick={() => setLogsOpen(false)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        <div className="space-y-4">
          {failedJobs.map((j) => (
            <div key={j.id} className="rounded-xl border border-danger/30 bg-danger/5 p-3">
              <p className="text-sm font-semibold text-danger">{j.id} — {j.name}</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                [{j.lastRun}] ERROR {j.type} connector timed out after {j.duration}. Retry scheduled for {j.nextRun}.
              </p>
              <button
                onClick={() => { runJob(j); setLogsOpen(false) }}
                title="Retry this job now"
                className="mt-2 px-3 py-1.5 rounded-lg border border-danger/30 text-danger text-xs font-medium hover:bg-danger/10 transition-colors"
              >
                Retry Now
              </button>
            </div>
          ))}
          {failedJobs.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No failures to report.</p>
          )}
        </div>
      </Drawer>

      <ConfirmDialog
        open={!!deleteJob}
        onOpenChange={(o) => !o && setDeleteJob(null)}
        title="Delete this job?"
        message={`${deleteJob?.name} will be removed from the scheduler. This cannot be undone.`}
        confirmLabel="Delete Job"
        onConfirm={() => deleteJob && removeJob(deleteJob)}
      />

      <ConfirmDialog
        open={!!deleteSla}
        onOpenChange={(o) => !o && setDeleteSla(null)}
        title="Delete this SLA rule?"
        message={`${deleteSla?.name} will stop being tracked. This cannot be undone.`}
        confirmLabel="Delete Rule"
        onConfirm={() => deleteSla && removeSla(deleteSla)}
      />
    </div>
  )
}
