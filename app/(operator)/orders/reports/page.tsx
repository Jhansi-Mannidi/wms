"use client"
import { useState } from "react"
import { BarChart2, TrendingUp, AlertTriangle, Clock, Download, Eye, CalendarClock } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"
import { DEMO_ORDER_REPORT_RUNS } from "@/lib/fixtures/demo"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Report = { name: string; desc: string; lastRun: string; format: string; schedule: string }
type Run = { id: string; report: string; format: string; period: string; ranAt: string; rows: number }

const initialReports: Report[] = [
  { name: "Order Fulfilment Rate", desc: "% of orders fulfilled within SLA by day", lastRun: "Today 06:00", format: "CSV / PDF", schedule: "Daily 06:00" },
  { name: "SLA Breach Report", desc: "All orders that breached SLA with root cause", lastRun: "Daily", format: "CSV / Email", schedule: "Daily 07:00" },
  { name: "Throughput by Hour", desc: "Orders processed per hour over selected period", lastRun: "2024-07-19", format: "CSV", schedule: "Manual" },
  { name: "Ageing Orders Report", desc: "Open orders by age bucket", lastRun: "2024-07-18", format: "CSV / PDF", schedule: "Weekly Mon 08:00" },
  { name: "Picker Productivity", desc: "Units picked per picker per shift", lastRun: "Today 07:30", format: "CSV / Excel", schedule: "Daily 07:00" },
  { name: "Courier Performance", desc: "On-time pickup and delivery by courier partner", lastRun: "2024-07-15", format: "CSV / PDF", schedule: "Weekly Mon 08:00" },
  { name: "Order Cancellation Analysis", desc: "Cancelled orders grouped by reason and client", lastRun: "2024-07-01", format: "CSV / Email", schedule: "Monthly 1st 09:00" },
  { name: "Dispatch Punctuality", desc: "Dispatch slot adherence against planned pickup", lastRun: "Today 06:00", format: "CSV", schedule: "Daily 06:00" },
  { name: "Channel Mix Summary", desc: "Order split across B2B, B2C and Marketplace", lastRun: "2024-07-01", format: "CSV / PDF", schedule: "Monthly 1st 09:00" },
  { name: "Pending Allocation Ageing", desc: "Unallocated orders by hours waiting", lastRun: "2024-07-19", format: "CSV", schedule: "Manual" },
  { name: "Pick-to-Pack Cycle Time", desc: "Average minutes from pick start to pack complete", lastRun: "2024-07-15", format: "CSV / Excel", schedule: "Weekly Mon 08:00" },
  { name: "Client Order Volume", desc: "Order and unit volume per client account", lastRun: "2024-07-17", format: "CSV / PDF", schedule: "Manual" },
]

/** Icon per report, kept out of the row type so rows stay export-safe. */
const reportIcon: Record<string, React.ReactNode> = {
  "Order Fulfilment Rate": <TrendingUp className="w-5 h-5 text-success" />,
  "SLA Breach Report": <AlertTriangle className="w-5 h-5 text-danger" />,
  "Throughput by Hour": <BarChart2 className="w-5 h-5 text-brand" />,
  "Ageing Orders Report": <Clock className="w-5 h-5 text-amber-500" />,
  "Picker Productivity": <BarChart2 className="w-5 h-5 text-brand" />,
  "Courier Performance": <TrendingUp className="w-5 h-5 text-success" />,
  "Order Cancellation Analysis": <AlertTriangle className="w-5 h-5 text-danger" />,
  "Dispatch Punctuality": <Clock className="w-5 h-5 text-amber-500" />,
  "Channel Mix Summary": <BarChart2 className="w-5 h-5 text-brand" />,
  "Pending Allocation Ageing": <CalendarClock className="w-5 h-5 text-amber-500" />,
  "Pick-to-Pack Cycle Time": <Clock className="w-5 h-5 text-amber-500" />,
  "Client Order Volume": <TrendingUp className="w-5 h-5 text-success" />,
}

const FORMATS = ["CSV", "PDF", "Excel", "Email"] as const
const PERIODS = ["Today", "Yesterday", "Last 7 days", "Last 30 days", "This month", "Last month"] as const
const SCHEDULES = ["Manual", "Daily 06:00", "Daily 07:00", "Weekly Mon 08:00", "Monthly 1st 09:00"] as const

export default function OrderReportsPage() {
  const [reports, setReports] = useState<Report[]>(initialReports)
  const [runs, setRuns] = useState<Run[]>(DEMO_ORDER_REPORT_RUNS)

  const [runTarget, setRunTarget] = useState<Report | null>(null)
  const [runForm, setRunForm] = useState({ format: "", period: "" })
  const [runErrors, setRunErrors] = useState<Record<string, string>>({})

  const [scheduleTarget, setScheduleTarget] = useState<Report | null>(null)
  const [scheduleValue, setScheduleValue] = useState("")
  const [scheduleError, setScheduleError] = useState("")

  const [detail, setDetail] = useState<Report | null>(null)
  const [clearHistory, setClearHistory] = useState(false)

  function openRun(r: Report) {
    setRunTarget(r)
    setRunForm({ format: r.format.split(" / ")[0], period: "" })
    setRunErrors({})
  }

  function runReport() {
    const e: Record<string, string> = {}
    if (!runForm.format) e.format = "Select an output format"
    if (!runForm.period) e.period = "Select a reporting period"
    setRunErrors(e)
    if (Object.keys(e).length > 0) {
      notify.error("Check the form", "Pick a format and a period before running.")
      return
    }
    const target = runTarget
    if (!target) return
    const now = new Date()
    const ranAt = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`
    const run: Run = {
      id: `RUN-${String(runs.length + 1).padStart(4, "0")}`,
      report: target.name,
      format: runForm.format,
      period: runForm.period,
      ranAt,
      rows: 40 + Math.floor(Math.random() * 400),
    }
    setRuns(prev => [run, ...prev])
    setReports(prev => prev.map(x => x.name === target.name ? { ...x, lastRun: ranAt } : x))
    setRunTarget(null)
    notify.success("Report generated", `${target.name} — ${run.rows} rows as ${run.format}.`)
  }

  function openSchedule(r: Report) {
    setScheduleTarget(r)
    setScheduleValue(r.schedule)
    setScheduleError("")
  }

  function saveSchedule() {
    if (!scheduleValue) {
      setScheduleError("Select a schedule")
      return
    }
    const target = scheduleTarget
    if (!target) return
    setReports(prev => prev.map(x => x.name === target.name ? { ...x, schedule: scheduleValue } : x))
    setScheduleTarget(null)
    notify.success("Schedule updated", `${target.name} now runs ${scheduleValue}.`)
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold text-foreground">Order Reports</h1><p className="text-sm text-muted-foreground mt-0.5">Download and schedule order analytics reports</p></div>
        <ExportButton data={reports} filename="order-reports" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map(r => (
          <div key={r.name} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:border-brand/30 transition-colors">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">{reportIcon[r.name]}</div>
              <span className="text-xs text-muted-foreground">{r.format}</span>
            </div>
            <div><p className="font-semibold text-foreground">{r.name}</p><p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p></div>
            <div className="flex items-center justify-between pt-1 border-t border-border">
              <span className="text-xs text-muted-foreground">Last run: {r.lastRun}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => openRun(r)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand/10 text-brand text-xs font-medium hover:bg-brand/20 transition-colors"><Download className="w-3 h-3" /> Run</button>
                <RowActions
                  items={[
                    { label: "View report details", icon: <Eye />, onSelect: () => setDetail(r) },
                    { label: "Change schedule", icon: <CalendarClock />, onSelect: () => openSchedule(r) },
                  ]}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Run history */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-foreground">Run History</p>
          {runs.length > 0 && (
            <button onClick={() => setClearHistory(true)} className="text-xs text-danger hover:underline">Clear history</button>
          )}
        </div>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>{["Run ID", "Report", "Period", "Format", "Rows", "Generated"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {runs.map(run => (
                <tr key={run.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{run.id}</td>
                  <td className="px-4 py-3 text-foreground">{run.report}</td>
                  <td className="px-4 py-3 text-muted-foreground">{run.period}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-brand/10 text-brand">{run.format}</span></td>
                  <td className="px-4 py-3 font-semibold text-foreground">{run.rows}</td>
                  <td className="px-4 py-3 text-muted-foreground">{run.ranAt}</td>
                </tr>
              ))}
              {runs.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">No reports run yet — hit Run on any card above.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Run report */}
      <Modal
        open={!!runTarget}
        onOpenChange={(o) => !o && setRunTarget(null)}
        title={runTarget ? `Run — ${runTarget.name}` : ""}
        description="Choose the output format and reporting period"
        size="sm"
        footer={<ModalActions onCancel={() => setRunTarget(null)} onSubmit={runReport} submitLabel="Generate" />}
      >
        <div className="space-y-4">
          <Field label="Output Format" required error={runErrors.format}>
            <Select value={runForm.format} invalid={!!runErrors.format} onChange={e => setRunForm({ ...runForm, format: e.target.value })} options={FORMATS} placeholder="Select Format" />
          </Field>
          <Field label="Reporting Period" required error={runErrors.period}>
            <Select value={runForm.period} invalid={!!runErrors.period} onChange={e => setRunForm({ ...runForm, period: e.target.value })} options={PERIODS} placeholder="Select Period" />
          </Field>
        </div>
      </Modal>

      {/* Schedule */}
      <Modal
        open={!!scheduleTarget}
        onOpenChange={(o) => !o && setScheduleTarget(null)}
        title={scheduleTarget ? `Schedule — ${scheduleTarget.name}` : ""}
        description="How often this report runs automatically"
        size="sm"
        footer={<ModalActions onCancel={() => setScheduleTarget(null)} onSubmit={saveSchedule} submitLabel="Save Schedule" />}
      >
        <Field label="Schedule" required error={scheduleError}>
          <Select value={scheduleValue} invalid={!!scheduleError} onChange={e => { setScheduleValue(e.target.value); setScheduleError("") }} options={SCHEDULES} placeholder="Select Schedule" />
        </Field>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.name ?? ""}
        description="Report detail"
        footer={
          <>
            <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Close</button>
            <button onClick={() => { if (detail) { openRun(detail); setDetail(null) } }} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">Run Now</button>
          </>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Report" value={detail.name} />
            <DetailRow label="Description" value={detail.desc} />
            <DetailRow label="Formats" value={detail.format} />
            <DetailRow label="Schedule" value={detail.schedule} />
            <DetailRow label="Last Run" value={detail.lastRun} />
            <DetailRow label="Runs This Session" value={runs.filter(r => r.report === detail.name).length} />
          </div>
        )}
      </Drawer>

      {/* Clear history confirmation */}
      <ConfirmDialog
        open={clearHistory}
        onOpenChange={setClearHistory}
        title="Clear run history?"
        message={`All ${runs.length} recorded report runs will be removed from this view. This cannot be undone.`}
        confirmLabel="Clear History"
        cancelLabel="Keep It"
        onConfirm={() => { setRuns([]); notify.warning("History cleared", "Report run history has been emptied.") }}
      />
    </div>
  )
}
