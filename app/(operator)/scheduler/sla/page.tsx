"use client"
import { useState } from "react"
import { Target, AlertTriangle, CheckCircle2, Eye, Pencil } from "lucide-react"
import { Modal, Drawer } from "@/components/ui/modal"
import { Field, TextInput, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Sla = { id: string; type: string; target: string; actual: string; compliance: number; status: string }

const initialSlas: Sla[] = [
  { id:"SLA-001",type:"Order Processing",target:"2 hrs",actual:"1.8 hrs",compliance:96,status:"Met"},
  { id:"SLA-002",type:"GRN to Putaway",target:"4 hrs",actual:"4.5 hrs",compliance:82,status:"Breached"},
  { id:"SLA-003",type:"Pick & Pack",target:"3 hrs",actual:"2.6 hrs",compliance:98,status:"Met"},
  { id:"SLA-004",type:"Same-Day Dispatch",target:"17:00 cutoff",actual:"16:40 avg",compliance:95,status:"Met"},
  { id:"SLA-005",type:"Cycle Count",target:"Monthly",actual:"Monthly",compliance:100,status:"Met"},
  { id:"SLA-006",type:"Returns Processing",target:"24 hrs",actual:"28 hrs",compliance:71,status:"Breached"},
]

const emptyForm = { target: "", actual: "", compliance: "" }

export default function SchedulerSLAPage() {
  const [slas, setSlas] = useState<Sla[]>(initialSlas)
  const [detail, setDetail] = useState<Sla | null>(null)
  const [editing, setEditing] = useState<Sla | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const metCount = slas.filter(s => s.status === "Met").length
  const breachCount = slas.filter(s => s.status === "Breached").length
  const avgCompliance = slas.length
    ? (slas.reduce((sum, s) => sum + s.compliance, 0) / slas.length).toFixed(1)
    : "0.0"

  function openEdit(s: Sla) {
    setEditing(s)
    setForm({ target: s.target, actual: s.actual, compliance: String(s.compliance) })
    setErrors({})
    setDetail(null)
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.target.trim()) e.target = "Target is required"
    if (!form.actual.trim()) e.actual = "Actual is required"
    if (!form.compliance.trim()) e.compliance = "Compliance is required"
    else if (!/^\d{1,3}$/.test(form.compliance) || Number(form.compliance) > 100) e.compliance = "Enter a whole number 0–100"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function submit() {
    if (!editing || !validate()) return
    const compliance = Number(form.compliance)
    const status = compliance >= 90 ? "Met" : "Breached"
    setSlas(prev => prev.map(s => s.id === editing.id
      ? { ...s, target: form.target.trim(), actual: form.actual.trim(), compliance, status }
      : s))
    notify.success("SLA updated", `${editing.type} now at ${compliance}% — ${status}.`)
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
  }

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">SLA Tracking</h1><p className="text-sm text-muted-foreground mt-1">Service level agreement performance against defined targets</p></div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:"SLAs Met",value:`${metCount} / ${slas.length}`,icon:<CheckCircle2 className="w-5 h-5 text-success"/> },
          { label:"Avg Compliance",value:`${avgCompliance}%`,icon:<Target className="w-5 h-5 text-brand"/> },
          { label:"Breaches This Month",value:String(breachCount),icon:<AlertTriangle className="w-5 h-5 text-danger"/> },
        ].map(s=>(
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4"><div>{s.icon}</div><div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-2xl font-bold text-foreground">{s.value}</p></div></div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["SLA","Type","Target","Actual","Compliance","Status",""].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {slas.map(s=>(
              <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{s.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{s.type}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.target}</td>
                <td className="px-4 py-3 font-medium text-foreground">{s.actual}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2"><div className="w-16 bg-muted rounded-full h-1.5"><div className={`h-1.5 rounded-full ${s.compliance>=95?"bg-success":s.compliance>=80?"bg-amber-400":"bg-danger"}`} style={{width:`${s.compliance}%`}} /></div><span className="text-xs">{s.compliance}%</span></div>
                </td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.status==="Met"?"bg-success/10 text-success":"bg-danger/10 text-danger"}`}>{s.status}</span></td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: "View SLA details", icon: <Eye />, onSelect: () => setDetail(s) },
                      { label: "Update SLA measurement", icon: <Pencil />, onSelect: () => openEdit(s) },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {slas.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No SLAs are being tracked.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!editing}
        onOpenChange={(o) => { if (!o) { setEditing(null); setForm(emptyForm); setErrors({}) } }}
        title="Update SLA Measurement"
        description={editing ? `${editing.id} — ${editing.type}` : ""}
        footer={<ModalActions onCancel={() => setEditing(null)} onSubmit={submit} submitLabel="Save SLA" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Target" required error={errors.target}>
            <TextInput value={form.target} invalid={!!errors.target} onChange={e => setForm({ ...form, target: e.target.value })} placeholder="e.g. 4 hrs" />
          </Field>
          <Field label="Actual" required error={errors.actual}>
            <TextInput value={form.actual} invalid={!!errors.actual} onChange={e => setForm({ ...form, actual: e.target.value })} placeholder="e.g. 4.5 hrs" />
          </Field>
          <Field label="Compliance %" required error={errors.compliance} hint="90% or above counts as Met">
            <TextInput value={form.compliance} invalid={!!errors.compliance} onChange={e => setForm({ ...form, compliance: e.target.value })} placeholder="e.g. 95" inputMode="numeric" />
          </Field>
        </div>
      </Modal>

      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.type ?? ""}
        description="SLA performance detail"
        footer={
          <>
            <button onClick={() => detail && openEdit(detail)} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
              Update Measurement
            </button>
            <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Close
            </button>
          </>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="SLA ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Type" value={detail.type} />
            <DetailRow label="Target" value={detail.target} />
            <DetailRow label="Actual" value={detail.actual} />
            <DetailRow label="Compliance" value={`${detail.compliance}%`} />
            <DetailRow label="Status" value={<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${detail.status==="Met"?"bg-success/10 text-success":"bg-danger/10 text-danger"}`}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>
    </div>
  )
}
