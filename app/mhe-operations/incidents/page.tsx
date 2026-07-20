"use client"
import { useState } from "react"
import { AlertTriangle, Plus, Eye, Check, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, TextArea, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Incident = {
  id: string; equipment: string; type: string; desc: string
  reportedBy: string; date: string; severity: string; status: string
}

const initialIncidents: Incident[] = [
  { id:"INC-001",equipment:"MHE-003",type:"Near Miss",desc:"Pallet jack nearly collided with pedestrian in aisle B",reportedBy:"Arjun Nair",date:"2025-07-18",severity:"Medium",status:"Under Review"},
  { id:"INC-002",equipment:"MHE-006",type:"Equipment Failure",desc:"Hydraulic leak detected during operation",reportedBy:"Suresh Yadav",date:"2025-07-15",severity:"High",status:"Resolved"},
  { id:"INC-003",equipment:"MHE-001",type:"Minor Damage",desc:"Scraped racking in Zone A, column A-08",reportedBy:"Kavitha Rao",date:"2025-07-10",severity:"Low",status:"Closed"},
  { id:"INC-004",equipment:"MHE-004",type:"Near Miss",desc:"Unsecured pallet fell from raised fork",reportedBy:"Ravi Kumar",date:"2025-07-08",severity:"High",status:"Resolved"},
]

const EQUIPMENT = ["MHE-001", "MHE-002", "MHE-003", "MHE-004", "MHE-005", "MHE-006"] as const
const TYPES = ["Near Miss", "Equipment Failure", "Minor Damage", "Major Damage", "Personal Injury"] as const
const SEVERITIES = ["Low", "Medium", "High"] as const
const REPORTERS = ["Arjun Nair", "Suresh Yadav", "Kavitha Rao", "Ravi Kumar", "Priya Sharma"] as const

const emptyForm = { equipment: "", type: "", desc: "", reportedBy: "", date: "", severity: "" }

function severityClass(s: string) {
  return s === "High" ? "bg-danger/10 text-danger"
    : s === "Medium" ? "bg-amber-50 text-amber-600"
    : "bg-muted text-muted-foreground"
}
function statusClass(s: string) {
  return s === "Resolved" || s === "Closed" ? "bg-success/10 text-success" : "bg-amber-50 text-amber-600"
}

export default function MHEIncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents)
  const [severityFilter, setSeverityFilter] = useState("All")

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Incident | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Incident | null>(null)

  const filtered = incidents.filter(i => severityFilter === "All" || i.severity === severityFilter)

  const stats = [
    { label: "Total Incidents", value: incidents.length },
    { label: "Open", value: incidents.filter(i => i.status !== "Resolved" && i.status !== "Closed").length },
    { label: "High Severity", value: incidents.filter(i => i.severity === "High").length },
    { label: "Resolved / Closed", value: incidents.filter(i => i.status === "Resolved" || i.status === "Closed").length },
  ]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.equipment) e.equipment = "Select the equipment involved"
    if (!form.type) e.type = "Select an incident type"
    if (!form.desc.trim()) e.desc = "Description is required"
    else if (form.desc.trim().length < 10) e.desc = "Give at least 10 characters of detail"
    if (!form.reportedBy) e.reportedBy = "Select who reported it"
    if (!form.date.trim()) e.date = "Date is required"
    if (!form.severity) e.severity = "Select a severity"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createIncident() {
    if (!validate()) return
    const seq = String(incidents.length + 1).padStart(3, "0")
    const next: Incident = {
      id: `INC-${seq}`,
      equipment: form.equipment,
      type: form.type,
      desc: form.desc.trim(),
      reportedBy: form.reportedBy,
      date: form.date,
      severity: form.severity,
      status: "Under Review",
    }
    setIncidents(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Incident reported", `${next.id} — ${next.type} on ${next.equipment}.`)
  }

  function advance(i: Incident) {
    const nextStatus = i.status === "Under Review" ? "Resolved" : "Closed"
    setIncidents(prev => prev.map(x => x.id === i.id ? { ...x, status: nextStatus } : x))
    notify.success(`Incident ${nextStatus.toLowerCase()}`, `${i.id} moved to ${nextStatus}.`)
  }

  function remove(i: Incident) {
    setIncidents(prev => prev.filter(x => x.id !== i.id))
    notify.warning("Incident deleted", `${i.id} has been removed from the log.`)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Incident Log</h1><p className="text-sm text-muted-foreground mt-1">Safety incidents, near misses and equipment failures</p></div>
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> Report Incident</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {["All", "High", "Medium", "Low"].map(s => (
          <button key={s} onClick={() => setSeverityFilter(s)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", severityFilter === s ? "bg-brand text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground")}>{s}</button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["Incident ID","Equipment","Type","Description","Reported By","Date","Severity","Status","Actions"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(i=>(
              <tr key={i.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{i.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{i.equipment}</td>
                <td className="px-4 py-3 text-muted-foreground">{i.type}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs max-w-48 truncate">{i.desc}</td>
                <td className="px-4 py-3 text-muted-foreground">{i.reportedBy}</td>
                <td className="px-4 py-3 text-muted-foreground">{i.date}</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", severityClass(i.severity))}>{i.severity}</span></td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusClass(i.status))}>{i.status}</span></td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: "View details", icon: <Eye />, onSelect: () => setDetail(i) },
                      ...(i.status !== "Closed"
                        ? [{ label: i.status === "Under Review" ? "Mark resolved" : "Close incident", icon: <Check />, onSelect: () => advance(i), tone: "success" as const }]
                        : []),
                      { label: "Delete incident", icon: <Trash2 />, onSelect: () => setDeleteTarget(i), tone: "danger" as const },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">No incidents match this severity filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 rounded-xl border border-warning/30 bg-warning/5 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">Open Safety Items</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {stats[1].value} incident(s) still under review · {stats[2].value} logged at high severity.
          </p>
        </div>
      </div>

      {/* Report incident */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="Report Incident"
        description="Log a safety incident, near miss or equipment failure"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createIncident} submitLabel="Report Incident" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Equipment" required error={errors.equipment}>
            <Select value={form.equipment} invalid={!!errors.equipment} onChange={e => setForm({ ...form, equipment: e.target.value })} options={EQUIPMENT} placeholder="Select Equipment" />
          </Field>
          <Field label="Incident Type" required error={errors.type}>
            <Select value={form.type} invalid={!!errors.type} onChange={e => setForm({ ...form, type: e.target.value })} options={TYPES} placeholder="Select Type" />
          </Field>
          <Field label="Reported By" required error={errors.reportedBy}>
            <Select value={form.reportedBy} invalid={!!errors.reportedBy} onChange={e => setForm({ ...form, reportedBy: e.target.value })} options={REPORTERS} placeholder="Select Reporter" />
          </Field>
          <Field label="Date" required error={errors.date}>
            <TextInput type="date" value={form.date} invalid={!!errors.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Severity" required error={errors.severity}>
            <Select value={form.severity} invalid={!!errors.severity} onChange={e => setForm({ ...form, severity: e.target.value })} options={SEVERITIES} placeholder="Select Severity" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description" required error={errors.desc} hint="What happened, where, and who was involved">
              <TextArea value={form.desc} invalid={!!errors.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="e.g. Reach truck clipped racking upright in aisle C..." />
            </Field>
          </div>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Incident detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Incident ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Equipment" value={detail.equipment} />
            <DetailRow label="Type" value={detail.type} />
            <DetailRow label="Description" value={detail.desc} />
            <DetailRow label="Reported By" value={detail.reportedBy} />
            <DetailRow label="Date" value={detail.date} />
            <DetailRow label="Severity" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", severityClass(detail.severity))}>{detail.severity}</span>} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusClass(detail.status))}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this incident?"
        message={`${deleteTarget?.id} (${deleteTarget?.type} on ${deleteTarget?.equipment}) will be permanently removed from the safety log.`}
        confirmLabel="Delete"
        cancelLabel="Keep It"
        onConfirm={() => deleteTarget && remove(deleteTarget)}
      />
    </div>
  )
}
