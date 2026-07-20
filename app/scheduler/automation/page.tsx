"use client"
import { useState } from "react"
import { Zap, Plus, CheckCircle2 } from "lucide-react"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, TextArea, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Rule = { id: string; name: string; trigger: string; action: string; active: boolean }

const initialRules: Rule[] = [
  { id:"AUTO-001", name:"Auto-assign Morning Shift", trigger:"Daily at 05:45", action:"Assign available workers to morning shift", active:true },
  { id:"AUTO-002", name:"SLA Breach Alert", trigger:"Order SLA < 2 hours remaining", action:"Send SMS to KAM and floor supervisor", active:true },
  { id:"AUTO-003", name:"Low Stock Reorder", trigger:"SKU available qty < reorder point", action:"Create purchase request and notify buyer", active:true },
  { id:"AUTO-004", name:"GRN Completion Notify", trigger:"GRN status = Complete", action:"Send email to client with receipt details", active:false },
  { id:"AUTO-005", name:"Shift Handover Report", trigger:"Shift end (14:00, 22:00, 06:00)", action:"Auto-generate shift summary and email to supervisor", active:true },
]

const emptyForm = { name: "", trigger: "", action: "" }

export default function SchedulerAutomationPage() {
  const [rules, setRules] = useState<Rule[]>(initialRules)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Rule | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [detail, setDetail] = useState<Rule | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Rule | null>(null)

  function openNew() {
    setEditing(null); setForm(emptyForm); setErrors({}); setModalOpen(true)
  }

  function openEdit(r: Rule) {
    setEditing(r)
    setForm({ name: r.name, trigger: r.trigger, action: r.action })
    setErrors({})
    setDetail(null)
    setModalOpen(true)
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Rule name is required"
    if (!form.trigger.trim()) e.trigger = "Trigger condition is required"
    if (!form.action.trim()) e.action = "Action is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function submit() {
    if (!validate()) return
    if (editing) {
      setRules(prev => prev.map(r => r.id === editing.id
        ? { ...r, name: form.name.trim(), trigger: form.trigger.trim(), action: form.action.trim() }
        : r))
      notify.success("Rule updated", `${form.name.trim()} has been saved.`)
    } else {
      const next: Rule = {
        id: `AUTO-${String(rules.length + 1).padStart(3, "0")}`,
        name: form.name.trim(),
        trigger: form.trigger.trim(),
        action: form.action.trim(),
        active: true,
      }
      setRules(prev => [next, ...prev])
      notify.success("Rule created", `${next.name} is now active.`)
    }
    setModalOpen(false); setEditing(null); setForm(emptyForm); setErrors({})
  }

  function toggle(r: Rule) {
    setRules(prev => prev.map(x => x.id === r.id ? { ...x, active: !x.active } : x))
    notify.info(r.active ? "Rule paused" : "Rule activated", `${r.name} is now ${r.active ? "inactive" : "active"}.`)
  }

  function remove(r: Rule) {
    setRules(prev => prev.filter(x => x.id !== r.id))
    setDetail(null)
    notify.warning("Rule deleted", `${r.name} has been removed.`)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Automation Rules</h1><p className="text-sm text-muted-foreground mt-1">{rules.filter(r => r.active).length} of {rules.length} rules active — trigger-based automation for scheduling and notifications</p></div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> New Rule</button>
      </div>
      <div className="space-y-3">
        {rules.map(r=>(
          <div key={r.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-4">
            <Zap className={`w-5 h-5 shrink-0 mt-0.5 ${r.active?"text-brand":"text-muted-foreground"}`} />
            <button onClick={() => setDetail(r)} title="View rule details" className="flex-1 text-left">
              <div className="flex items-center gap-2"><p className="font-medium text-foreground">{r.name}</p>{r.active&&<CheckCircle2 className="w-3.5 h-3.5 text-success" />}</div>
              <p className="text-xs text-muted-foreground mt-1"><span className="font-medium text-foreground">Trigger:</span> {r.trigger}</p>
              <p className="text-xs text-muted-foreground mt-0.5"><span className="font-medium text-foreground">Action:</span> {r.action}</p>
            </button>
            <button onClick={() => toggle(r)} title={r.active ? "Pause rule" : "Activate rule"} className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${r.active?"bg-brand":"bg-muted"}`}><span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${r.active?"translate-x-5":"translate-x-0.5"}`} /></button>
          </div>
        ))}
        {rules.length === 0 && (
          <div className="bg-card border border-border rounded-xl p-10 text-center text-sm text-muted-foreground">
            No automation rules configured yet.
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onOpenChange={(o) => { setModalOpen(o); if (!o) { setEditing(null); setForm(emptyForm); setErrors({}) } }}
        title={editing ? "Edit Automation Rule" : "New Automation Rule"}
        description={editing ? `Update ${editing.id}` : "Define a trigger and the action it fires"}
        footer={<ModalActions onCancel={() => setModalOpen(false)} onSubmit={submit} submitLabel={editing ? "Save Rule" : "Create Rule"} />}
      >
        <div className="space-y-4">
          <Field label="Rule Name" required error={errors.name}>
            <TextInput value={form.name} invalid={!!errors.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Low Stock Reorder" />
          </Field>
          <Field label="Trigger" required error={errors.trigger} hint="When should this rule fire?">
            <TextInput value={form.trigger} invalid={!!errors.trigger} onChange={e => setForm({ ...form, trigger: e.target.value })} placeholder="e.g. SKU available qty < reorder point" />
          </Field>
          <Field label="Action" required error={errors.action}>
            <TextArea value={form.action} invalid={!!errors.action} onChange={e => setForm({ ...form, action: e.target.value })} placeholder="e.g. Create purchase request and notify buyer" />
          </Field>
        </div>
      </Modal>

      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.name ?? ""}
        description="Automation rule detail"
        footer={
          <>
            <button onClick={() => detail && setDeleteTarget(detail)} className="rounded-lg border border-danger/30 px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10">
              Delete
            </button>
            <button onClick={() => detail && openEdit(detail)} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
              Edit Rule
            </button>
            <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Close
            </button>
          </>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Rule ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Name" value={detail.name} />
            <DetailRow label="Trigger" value={detail.trigger} />
            <DetailRow label="Action" value={detail.action} />
            <DetailRow
              label="Status"
              value={<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${detail.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>{detail.active ? "Active" : "Inactive"}</span>}
            />
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this automation rule?"
        message={`${deleteTarget?.name} will stop firing. This cannot be undone.`}
        confirmLabel="Delete Rule"
        onConfirm={() => deleteTarget && remove(deleteTarget)}
      />
    </div>
  )
}
