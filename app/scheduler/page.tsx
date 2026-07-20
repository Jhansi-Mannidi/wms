"use client"

import { useState } from "react"
import {
  Clock, Play, Pause, CheckCircle2, AlertTriangle,
  Plus, RefreshCw, ChevronDown, Eye, MoreHorizontal, Zap, Calendar
} from "lucide-react"
import { cn } from "@/lib/utils"

const jobs = [
  { id: "JOB-001", name: "Daily Stock Reconciliation", type: "Inventory", schedule: "Every day 02:00 AM", lastRun: "Today 02:00 AM", nextRun: "Tomorrow 02:00 AM", duration: "12 min", status: "Success", enabled: true },
  { id: "JOB-002", name: "SLA Breach Check", type: "Orders", schedule: "Every 30 minutes", lastRun: "15 min ago", nextRun: "15 min from now", duration: "45 sec", status: "Running", enabled: true },
  { id: "JOB-003", name: "Low Stock Alert", type: "Inventory", schedule: "Every hour", lastRun: "1 hour ago", nextRun: "In 5 min", duration: "2 min", status: "Success", enabled: true },
  { id: "JOB-004", name: "Invoice Auto-Generation", type: "Billing", schedule: "1st of every month 06:00", lastRun: "Dec 1, 2024", nextRun: "Jan 1, 2025", duration: "8 min", status: "Success", enabled: true },
  { id: "JOB-005", name: "Pallet Age Report", type: "Inventory", schedule: "Every Sunday 06:00 AM", lastRun: "Dec 15, 2024", nextRun: "Dec 22, 2024", duration: "5 min", status: "Success", enabled: true },
  { id: "JOB-006", name: "Workforce Attendance Sync", type: "Workforce", schedule: "Every day 11:59 PM", lastRun: "Yesterday 11:59 PM", nextRun: "Today 11:59 PM", duration: "3 min", status: "Failed", enabled: true },
  { id: "JOB-007", name: "Cold Chain Report Export", type: "Cold Chain", schedule: "Every day 08:00 AM", lastRun: "Today 08:00 AM", nextRun: "Tomorrow 08:00 AM", duration: "6 min", status: "Success", enabled: false },
  { id: "JOB-008", name: "MHE Battery Alert", type: "MHE", schedule: "Every 2 hours", lastRun: "2 hours ago", nextRun: "In 30 min", duration: "1 min", status: "Success", enabled: true },
]

const slaRules = [
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

export default function SchedulerPage() {
  const [tab, setTab] = useState<"jobs" | "sla">("jobs")
  const [typeFilter, setTypeFilter] = useState("All Types")

  const filteredJobs = jobs.filter((j) => typeFilter === "All Types" || j.type === typeFilter)
  const failedCount = jobs.filter((j) => j.status === "Failed").length
  const runningCount = jobs.filter((j) => j.status === "Running").length

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
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors">
              <RefreshCw className="w-4 h-4" /> Run Now
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
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
            { label: "SLA Rules", value: slaRules.length.toString(), sub: "Active rules", icon: <Clock className="w-5 h-5" /> },
          ].map((stat, i) => (
            <div key={i} className="p-5 rounded-2xl border border-border bg-card">
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
              <p className="text-xs text-muted-foreground mt-0.5">Workforce Attendance Sync failed at 11:59 PM. Check error logs.</p>
            </div>
            <button className="px-3 py-1.5 rounded-lg border border-danger/30 text-danger text-xs font-medium hover:bg-danger/10 transition-colors">
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
                      <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-brand" title="Run now">
                        <Play className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title={job.enabled ? "Disable" : "Enable"}>
                        {job.enabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Eye className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "sla" && (
          <>
            <div className="flex justify-end">
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
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
                          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", rule.active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
                            {rule.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
