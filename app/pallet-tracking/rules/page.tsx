"use client"
import { useState } from "react"
import { Settings, Plus, CheckCircle2, Eye, Pencil, Trash2 } from "lucide-react"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, TextArea, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Rule = { id: string; name: string; desc: string; scope: string; active: boolean }

const initialRules: Rule[] = [
  { id:"RULE-001",name:"FEFO Rotation",desc:"First Expiry First Out — route picks to oldest batch first",scope:"All zones",active:true},
  { id:"RULE-002",name:"Heavy Base Stacking",desc:"Place heaviest pallets on L1 racks, light on L3+",scope:"All zones",active:true},
  { id:"RULE-003",name:"Client Segregation",desc:"Do not mix pallets from different 3PL clients in same rack",scope:"3PL zones",active:true},
  { id:"RULE-004",name:"Cold Chain Priority Lane",desc:"Route cold chain pallets via dedicated cold aisle only",scope:"Cold Room A,B",active:true},
  { id:"RULE-005",name:"Hazmat Isolation",desc:"Hazardous materials must be stored in HZ-designated zones",scope:"Zone D",active:false},
  { id:"RULE-006",name:"Max Stack Height",desc:"Limit pallet stacking to 3 units high in open bulk storage",scope:"Bulk Yard",active:true},
  { id:"RULE-007",name:"FIFO Dry Goods",desc:"Rotate non-perishable dry goods on a first-in-first-out basis",scope:"Zone A,B",active:true},
  { id:"RULE-008",name:"Aisle Clearance",desc:"Maintain 1.5m clear aisle in front of every fire exit and hydrant",scope:"All zones",active:true},
  { id:"RULE-009",name:"Damaged Pallet Quarantine",desc:"Move damaged pallets to the quarantine bay within 2 hours of detection",scope:"All zones",active:true},
  { id:"RULE-010",name:"Cross-Dock Window",desc:"Cross-dock pallets must clear staging within 12 hours of arrival",scope:"Staging Area",active:false},
  { id:"RULE-011",name:"Rack Load Limit",desc:"No single rack bay may exceed 1200 kg of combined pallet load",scope:"All zones",active:true},
  { id:"RULE-012",name:"Temperature Log Check",desc:"Verify cold chain temperature log before accepting put-away",scope:"Cold Room A,B and Freezer",active:true},
  { id:"RULE-013",name:"Mixed SKU Restriction",desc:"One SKU per pallet unless explicitly flagged for consolidation",scope:"3PL zones",active:false},
]

const emptyForm = { name: "", desc: "", scope: "" }

export default function PalletRulesPage() {
  const [rules, setRules] = useState<Rule[]>(initialRules)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Rule | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [detail, setDetail] = useState<Rule | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Rule | null>(null)

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
    setFormOpen(true)
  }

  function openEdit(r: Rule) {
    setEditing(r)
    setForm({ name: r.name, desc: r.desc, scope: r.scope })
    setErrors({})
    setFormOpen(true)
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Rule name is required"
    else if (rules.some(r => r.name.toLowerCase() === form.name.trim().toLowerCase() && r.id !== editing?.id)) e.name = "A rule with this name already exists"
    if (!form.desc.trim()) e.desc = "Description is required"
    if (!form.scope.trim()) e.scope = "Scope is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function submit() {
    if (!validate()) return
    if (editing) {
      setRules(prev => prev.map(r => r.id === editing.id ? { ...r, name: form.name.trim(), desc: form.desc.trim(), scope: form.scope.trim() } : r))
      notify.success("Rule updated", `${form.name.trim()} has been saved.`)
    } else {
      const seq = String(rules.length + 1).padStart(3, "0")
      const next: Rule = { id: `RULE-${seq}`, name: form.name.trim(), desc: form.desc.trim(), scope: form.scope.trim(), active: true }
      setRules(prev => [...prev, next])
      notify.success("Rule created", `${next.id} — ${next.name} is now active.`)
    }
    setFormOpen(false)
    setForm(emptyForm)
    setErrors({})
    setEditing(null)
  }

  function toggle(r: Rule) {
    setRules(prev => prev.map(x => x.id === r.id ? { ...x, active: !x.active } : x))
    notify.info(r.active ? "Rule disabled" : "Rule enabled", `${r.name} is now ${r.active ? "inactive" : "active"}.`)
  }

  function remove(r: Rule) {
    setRules(prev => prev.filter(x => x.id !== r.id))
    notify.warning("Rule deleted", `${r.name} has been removed.`)
  }

  const activeCount = rules.filter(r => r.active).length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Pallet Rules</h1><p className="text-sm text-muted-foreground mt-1">Storage logic, rotation rules and zone restrictions &bull; {activeCount} of {rules.length} active</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> Add Rule</button>
      </div>
      <div className="space-y-3">
        {rules.map(r=>(
          <div key={r.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-4">
            <Settings className="w-5 h-5 text-brand shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2"><p className="font-medium text-foreground">{r.name}</p>{r.active&&<CheckCircle2 className="w-4 h-4 text-success" />}</div>
              <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
              <p className="text-xs text-muted-foreground mt-1">Scope: <span className="text-foreground">{r.scope}</span></p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <RowActions
                items={[
                  { label: "View rule details", icon: <Eye />, onSelect: () => setDetail(r) },
                  { label: "Edit rule", icon: <Pencil />, onSelect: () => openEdit(r) },
                  { label: "Delete rule", icon: <Trash2 />, onSelect: () => setDeleteTarget(r), tone: "danger" as const },
                ]}
              />
              <button onClick={() => toggle(r)} title={r.active ? "Disable rule" : "Enable rule"} className={`relative w-10 h-5 rounded-full transition-colors ml-1 ${r.active?"bg-brand":"bg-muted"}`}><span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${r.active?"translate-x-5":"translate-x-0.5"}`} /></button>
            </div>
          </div>
        ))}
        {rules.length === 0 && (
          <div className="bg-card border border-border rounded-xl p-10 text-center text-sm text-muted-foreground">No stacking rules configured yet.</div>
        )}
      </div>

      {/* Create / edit rule */}
      <Modal
        open={formOpen}
        onOpenChange={(o) => { setFormOpen(o); if (!o) { setForm(emptyForm); setErrors({}); setEditing(null) } }}
        title={editing ? `Edit ${editing.id}` : "Add Pallet Rule"}
        description={editing ? "Update this storage rule" : "Define a new storage or rotation rule"}
        footer={<ModalActions onCancel={() => setFormOpen(false)} onSubmit={submit} submitLabel={editing ? "Save Rule" : "Create Rule"} />}
      >
        <div className="grid grid-cols-1 gap-4">
          <Field label="Rule Name" required error={errors.name}>
            <TextInput value={form.name} invalid={!!errors.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. FEFO Rotation" />
          </Field>
          <Field label="Description" required error={errors.desc}>
            <TextArea value={form.desc} invalid={!!errors.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Describe what this rule enforces" />
          </Field>
          <Field label="Scope" required error={errors.scope} hint="Zones or areas this rule applies to">
            <TextInput value={form.scope} invalid={!!errors.scope} onChange={e => setForm({ ...form, scope: e.target.value })} placeholder="e.g. All zones" />
          </Field>
        </div>
      </Modal>

      {/* Rule detail */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.name ?? ""}
        description="Pallet rule detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Rule ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Name" value={detail.name} />
            <DetailRow label="Description" value={detail.desc} />
            <DetailRow label="Scope" value={detail.scope} />
            <DetailRow label="State" value={<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${detail.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>{detail.active ? "Active" : "Inactive"}</span>} />
          </div>
        )}
      </Drawer>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this rule?"
        message={`${deleteTarget?.name} (${deleteTarget?.id}) will be permanently removed from the stacking rule set.`}
        confirmLabel="Delete Rule"
        cancelLabel="Keep It"
        onConfirm={() => deleteTarget && remove(deleteTarget)}
      />
    </div>
  )
}
