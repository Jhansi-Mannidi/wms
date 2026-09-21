"use client"

import { useState } from "react"
import { Plus, Search, Wrench, Clock, CheckCircle2, AlertTriangle, Play, Pause, ChevronRight, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { AvatarChip } from "@/components/wms/avatar-chip"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, TextArea, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type WorkOrder = {
  id: string; client: string; type: string; desc: string; qty: number
  assignee: string; dueIn: string; status: string; priority: string
}

type Template = {
  id: string; name: string; type: string; defaultQty: number; steps: string
}

const initialWorkOrders: WorkOrder[] = [
  { id: "VAS-1041", client: "Amazon Seller Svc", type: "Kitting", desc: "Assemble gift packs: 200 units (SKU-SE201 + SKU-SE202)", qty: 200, assignee: "Rajan K.", dueIn: "2h", status: "in-progress", priority: "high" },
  { id: "VAS-1042", client: "Hindustan Unilever", type: "Labelling", desc: "Apply MRP stickers to Surf Excel 1kg — 5,000 units", qty: 5000, assignee: "Meena S.", dueIn: "4h", status: "open", priority: "medium" },
  { id: "VAS-1043", client: "Tata Consumer Products", type: "QC Inspection", desc: "Incoming inspection — 12 cartons surgical gloves", qty: 1200, assignee: "Unassigned", dueIn: "1h", status: "open", priority: "high" },
  { id: "VAS-1044", client: "Reliance Retail Ltd", type: "Repackaging", desc: "Repack bulk flour 50kg → 5kg retail bags", qty: 400, assignee: "Vijay P.", dueIn: "8h", status: "in-progress", priority: "low" },
  { id: "VAS-1045", client: "Amazon Seller Svc", type: "Kitting", desc: "Birthday hamper — 50 units", qty: 50, assignee: "Rajan K.", dueIn: "6h", status: "paused", priority: "medium" },
  { id: "VAS-1046", client: "D-Mart Avenue", type: "Shrink-Wrapping", desc: "Shrink-wrap pallet ID W-22 before dispatch", qty: 1, assignee: "Meena S.", dueIn: "30m", status: "open", priority: "high" },
  { id: "VAS-1047", client: "Hindustan Unilever", type: "Labelling", desc: "Shampoo country-of-origin label update", qty: 2400, assignee: "Vijay P.", dueIn: "Tomorrow", status: "done", priority: "low" },
]

const initialTemplates: Template[] = [
  { id: "TPL-01", name: "Standard Gift Pack Kitting", type: "Kitting", defaultQty: 100, steps: "Pick components → assemble → seal → label → stage for QC" },
  { id: "TPL-02", name: "MRP Sticker Application", type: "Labelling", defaultQty: 1000, steps: "Verify MRP sheet → apply sticker → spot-check 5% → stage" },
  { id: "TPL-03", name: "Incoming QC Inspection", type: "QC Inspection", defaultQty: 200, steps: "Sample per AQL → visual check → dimension check → record result" },
  { id: "TPL-04", name: "Pallet Shrink-Wrap", type: "Shrink-Wrapping", defaultQty: 1, steps: "Square pallet → wrap 4 turns base → 3 turns top → tag" },
]

const vasTypes = ["All", "Kitting", "Labelling", "QC Inspection", "Repackaging", "Shrink-Wrapping"]
const VAS_TYPES = ["Kitting", "Labelling", "QC Inspection", "Repackaging", "Shrink-Wrapping"] as const
const CLIENTS = ["Amazon Seller Svc", "Hindustan Unilever", "Tata Consumer Products", "Reliance Retail Ltd", "D-Mart Avenue"] as const
const ASSIGNEES = ["Unassigned", "Rajan K.", "Meena S.", "Vijay P."] as const
const PRIORITIES = ["high", "medium", "low"] as const

const tabs = ["All Work Orders", "Open", "In Progress", "Completed", "Templates"] as const
type Tab = typeof tabs[number]

const statusConfig: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  open:        { bg: "bg-brand/15",    text: "text-brand",   label: "Open",       icon: <Clock className="w-3 h-3" /> },
  "in-progress": { bg: "bg-warning/15", text: "text-warning",  label: "In Progress", icon: <Play className="w-3 h-3" /> },
  paused:      { bg: "bg-muted",       text: "text-muted-foreground", label: "Paused", icon: <Pause className="w-3 h-3" /> },
  done:        { bg: "bg-success/15",  text: "text-success",  label: "Done",       icon: <CheckCircle2 className="w-3 h-3" /> },
}

const vasTypeColors: Record<string, string> = {
  Kitting:        "bg-violet-500/15 text-violet-400",
  Labelling:      "bg-blue-500/15 text-blue-400",
  "QC Inspection": "bg-amber-500/15 text-amber-400",
  Repackaging:    "bg-cyan-500/15 text-cyan-400",
  "Shrink-Wrapping": "bg-emerald-500/15 text-emerald-400",
}

const emptyForm = { client: "", type: "", desc: "", qty: "", assignee: "", dueIn: "", priority: "" }
const emptyTemplateForm = { name: "", type: "", defaultQty: "", steps: "" }

export default function VASWorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialWorkOrders)
  const [templates, setTemplates] = useState<Template[]>(initialTemplates)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")
  const [tab, setTab] = useState<Tab>("All Work Orders")

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [tplOpen, setTplOpen] = useState(false)
  const [tplForm, setTplForm] = useState(emptyTemplateForm)
  const [tplErrors, setTplErrors] = useState<Record<string, string>>({})
  const [tplDeleteTarget, setTplDeleteTarget] = useState<Template | null>(null)

  const [detail, setDetail] = useState<WorkOrder | null>(null)
  const [cancelTarget, setCancelTarget] = useState<WorkOrder | null>(null)

  const tabStatus: Record<string, string | null> = {
    "All Work Orders": null, Open: "open", "In Progress": "in-progress", Completed: "done", Templates: null,
  }

  const filtered = workOrders.filter(w =>
    (typeFilter === "All" || w.type === typeFilter) &&
    (tabStatus[tab] === null || w.status === tabStatus[tab]) &&
    (w.id.toLowerCase().includes(search.toLowerCase()) ||
     w.client.toLowerCase().includes(search.toLowerCase()) ||
     w.desc.toLowerCase().includes(search.toLowerCase()))
  )

  const filteredTemplates = templates.filter(t =>
    (typeFilter === "All" || t.type === typeFilter) &&
    (t.name.toLowerCase().includes(search.toLowerCase()) || t.type.toLowerCase().includes(search.toLowerCase()))
  )

  const kpis = [
    { label: "Open Work Orders", value: String(workOrders.filter(w => w.status === "open").length), color: "text-brand" },
    { label: "In Progress", value: String(workOrders.filter(w => w.status === "in-progress").length), color: "text-warning" },
    { label: "SLA Breach Risk", value: String(workOrders.filter(w => w.priority === "high" && w.status !== "done").length), color: "text-danger" },
    { label: "Completed Today", value: String(workOrders.filter(w => w.status === "done").length), color: "text-success" },
  ]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.client) e.client = "Select a client"
    if (!form.type) e.type = "Select a VAS type"
    if (!form.desc.trim()) e.desc = "Description is required"
    if (!form.qty.trim()) e.qty = "Quantity is required"
    else if (!/^\d+$/.test(form.qty) || Number(form.qty) < 1) e.qty = "Enter a positive whole number"
    if (!form.assignee) e.assignee = "Select an assignee"
    if (!form.dueIn.trim()) e.dueIn = "Due-in is required"
    if (!form.priority) e.priority = "Select a priority"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createWorkOrder() {
    if (!validate()) return
    const next: WorkOrder = {
      id: `VAS-${1041 + workOrders.length}`,
      client: form.client,
      type: form.type,
      desc: form.desc.trim(),
      qty: Number(form.qty),
      assignee: form.assignee,
      dueIn: form.dueIn.trim(),
      status: "open",
      priority: form.priority,
    }
    setWorkOrders(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Work order created", `${next.id} — ${next.type} for ${next.client} (${next.qty.toLocaleString()} units)`)
  }

  function setStatus(w: WorkOrder, status: string, label: string) {
    setWorkOrders(prev => prev.map(x => x.id === w.id ? { ...x, status } : x))
    notify.success(`Work order ${label}`, `${w.id} — ${w.type} for ${w.client}`)
  }

  function cancelWorkOrder(w: WorkOrder) {
    setWorkOrders(prev => prev.filter(x => x.id !== w.id))
    notify.warning("Work order cancelled", `${w.id} removed from the VAS queue.`)
  }

  function useTemplate(t: Template) {
    setForm({ client: "", type: t.type, desc: t.steps, qty: String(t.defaultQty), assignee: "", dueIn: "", priority: "" })
    setErrors({})
    setCreateOpen(true)
    notify.info("Template loaded", `${t.name} pre-filled the new work order form.`)
  }

  function validateTpl() {
    const e: Record<string, string> = {}
    if (!tplForm.name.trim()) e.name = "Template name is required"
    else if (templates.some(t => t.name.toLowerCase() === tplForm.name.trim().toLowerCase())) e.name = "A template with this name already exists"
    if (!tplForm.type) e.type = "Select a VAS type"
    if (!tplForm.defaultQty.trim()) e.defaultQty = "Default quantity is required"
    else if (!/^\d+$/.test(tplForm.defaultQty) || Number(tplForm.defaultQty) < 1) e.defaultQty = "Enter a positive whole number"
    if (!tplForm.steps.trim()) e.steps = "Steps are required"
    setTplErrors(e)
    return Object.keys(e).length === 0
  }

  function createTemplate() {
    if (!validateTpl()) return
    const next: Template = {
      id: `TPL-${String(templates.length + 1).padStart(2, "0")}`,
      name: tplForm.name.trim(),
      type: tplForm.type,
      defaultQty: Number(tplForm.defaultQty),
      steps: tplForm.steps.trim(),
    }
    setTemplates(prev => [next, ...prev])
    setTplOpen(false)
    setTplForm(emptyTemplateForm)
    setTplErrors({})
    notify.success("Template created", `${next.name} added to the VAS template library.`)
  }

  function deleteTemplate(t: Template) {
    setTemplates(prev => prev.filter(x => x.id !== t.id))
    notify.warning("Template deleted", `${t.name} removed from the library.`)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-0 px-5 pt-4 border-b border-border shrink-0">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn(
            "px-4 py-2 text-[12px] font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
            tab === t ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-foreground"
          )}>{t}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map(k => (
            <div key={k.label} className="bg-card border border-border rounded-lg px-3.5 py-2.5">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{k.label}</p>
              <p className={cn("text-2xl font-bold mt-1", k.color)}>{k.value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/40 flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={tab === "Templates" ? "Search templates…" : "Search work orders…"}
              className="bg-transparent text-[12px] outline-none w-full placeholder:text-muted-foreground/60" />
          </div>
          <div className="flex gap-1 flex-wrap">
            {vasTypes.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap",
                typeFilter === t ? "bg-brand text-white" : "border border-border bg-card text-muted-foreground hover:text-foreground"
              )}>{t}</button>
            ))}
          </div>
          {tab === "Templates" ? (
            <button onClick={() => { setTplForm(emptyTemplateForm); setTplErrors({}); setTplOpen(true) }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-brand text-white text-[12px] font-semibold hover:bg-brand/90 transition-colors ml-auto">
              <Plus className="w-3.5 h-3.5" /> New Template
            </button>
          ) : (
            <button onClick={() => { setForm(emptyForm); setErrors({}); setCreateOpen(true) }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-brand text-white text-[12px] font-semibold hover:bg-brand/90 transition-colors ml-auto">
              <Plus className="w-3.5 h-3.5" /> New Work Order
            </button>
          )}
        </div>

        {tab === "Templates" ? (
          <div className="space-y-2">
            {filteredTemplates.map(t => (
              <div key={t.id} className="bg-card border border-border rounded-xl px-4 py-3.5 flex items-start gap-4 hover:border-brand/40 transition-all">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-brand/10 text-brand">
                  <Wrench className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-[11px] text-brand font-semibold">{t.id}</span>
                    <span className="text-[12px] font-semibold text-foreground">{t.name}</span>
                    <span className={cn("text-[11px] font-semibold px-1.5 py-0.5 rounded-full", vasTypeColors[t.type] ?? "bg-muted text-muted-foreground")}>{t.type}</span>
                  </div>
                  <p className="text-[12px] text-foreground">{t.steps}</p>
                  <div className="flex items-center gap-4 mt-1.5 text-[11px] text-muted-foreground">
                    <span>Default Qty: <strong className="text-foreground">{t.defaultQty.toLocaleString()}</strong></span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 mt-1">
                  <button onClick={() => useTemplate(t)} title="Create work order from template" className="text-[11px] text-brand hover:underline flex items-center gap-1">
                    Use <ChevronRight className="w-3 h-3" />
                  </button>
                  <button onClick={() => setTplDeleteTarget(t)} title="Delete template" className="p-1 rounded-md text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {filteredTemplates.length === 0 && (
              <div className="py-10 text-center text-[12px] text-muted-foreground">No templates match your filters.</div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(w => {
              const s = statusConfig[w.status]
              const isUrgent = w.priority === "high" && w.status !== "done"
              return (
                <div key={w.id} className={cn(
                  "bg-card border rounded-xl px-4 py-3.5 flex items-start gap-4 hover:border-brand/40 transition-all",
                  isUrgent ? "border-danger/30" : "border-border"
                )}>
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                    isUrgent ? "bg-danger/10 text-danger" : "bg-brand/10 text-brand"
                  )}>
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-[11px] text-brand font-semibold">{w.id}</span>
                      <span className={cn("text-[11px] font-semibold px-1.5 py-0.5 rounded-full", vasTypeColors[w.type] ?? "bg-muted text-muted-foreground")}>{w.type}</span>
                      <span className={cn("text-[11px] font-semibold px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5", s.bg, s.text)}>{s.icon}{s.label}</span>
                      {isUrgent && <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-danger"><AlertTriangle className="w-3 h-3" />Urgent</span>}
                    </div>
                    <p className="text-[12px] text-foreground">{w.desc}</p>
                    <div className="flex items-center gap-4 mt-1.5 text-[11px] text-muted-foreground">
                      <AvatarChip name={w.client} size="xs" />
                      <span>Qty: <strong className="text-foreground">{w.qty.toLocaleString()}</strong></span>
                      <span>Assignee: <strong className="text-foreground">{w.assignee}</strong></span>
                      <span className={cn("font-semibold", w.dueIn === "30m" ? "text-danger" : "text-muted-foreground")}>Due: {w.dueIn}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 mt-1">
                    <RowActions
                      items={[
                        ...(w.status === "open" || w.status === "paused"
                          ? [{ label: "Start work order", icon: <Play />, onSelect: () => setStatus(w, "in-progress", "started") }]
                          : []),
                        ...(w.status === "in-progress"
                          ? [
                              { label: "Pause work order", icon: <Pause />, onSelect: () => setStatus(w, "paused", "paused") },
                              { label: "Complete work order", icon: <CheckCircle2 />, onSelect: () => setStatus(w, "done", "completed"), tone: "success" as const },
                            ]
                          : []),
                        ...(w.status !== "done"
                          ? [{ label: "Cancel work order", icon: <Trash2 />, onSelect: () => setCancelTarget(w), tone: "danger" as const }]
                          : []),
                      ]}
                    />
                    <button onClick={() => setDetail(w)} title="Open work order detail" className="text-[11px] text-brand hover:underline flex items-center gap-1 ml-1">
                      Open <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div className="py-10 text-center text-[12px] text-muted-foreground">No work orders match your filters.</div>
            )}
          </div>
        )}
      </div>

      {/* Create work order */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="New Work Order"
        description="Raise a value-added service job"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createWorkOrder} submitLabel="Create Work Order" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Client" required error={errors.client}>
            <Select value={form.client} invalid={!!errors.client} onChange={e => setForm({ ...form, client: e.target.value })} options={CLIENTS} placeholder="Select Client" />
          </Field>
          <Field label="VAS Type" required error={errors.type}>
            <Select value={form.type} invalid={!!errors.type} onChange={e => setForm({ ...form, type: e.target.value })} options={VAS_TYPES} placeholder="Select Type" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description" required error={errors.desc}>
              <TextArea value={form.desc} invalid={!!errors.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="e.g. Assemble gift packs: 200 units" />
            </Field>
          </div>
          <Field label="Quantity" required error={errors.qty}>
            <TextInput value={form.qty} invalid={!!errors.qty} onChange={e => setForm({ ...form, qty: e.target.value })} placeholder="e.g. 200" inputMode="numeric" />
          </Field>
          <Field label="Assignee" required error={errors.assignee}>
            <Select value={form.assignee} invalid={!!errors.assignee} onChange={e => setForm({ ...form, assignee: e.target.value })} options={ASSIGNEES} placeholder="Select Assignee" />
          </Field>
          <Field label="Due In" required error={errors.dueIn} hint="e.g. 2h, 30m or Tomorrow">
            <TextInput value={form.dueIn} invalid={!!errors.dueIn} onChange={e => setForm({ ...form, dueIn: e.target.value })} placeholder="e.g. 4h" />
          </Field>
          <Field label="Priority" required error={errors.priority}>
            <Select value={form.priority} invalid={!!errors.priority} onChange={e => setForm({ ...form, priority: e.target.value })} options={PRIORITIES} placeholder="Select Priority" />
          </Field>
        </div>
      </Modal>

      {/* Create template */}
      <Modal
        open={tplOpen}
        onOpenChange={(o) => { setTplOpen(o); if (!o) { setTplForm(emptyTemplateForm); setTplErrors({}) } }}
        title="New VAS Template"
        description="Save a reusable work-order recipe"
        footer={<ModalActions onCancel={() => setTplOpen(false)} onSubmit={createTemplate} submitLabel="Create Template" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Template Name" required error={tplErrors.name}>
            <TextInput value={tplForm.name} invalid={!!tplErrors.name} onChange={e => setTplForm({ ...tplForm, name: e.target.value })} placeholder="e.g. Standard Gift Pack Kitting" />
          </Field>
          <Field label="VAS Type" required error={tplErrors.type}>
            <Select value={tplForm.type} invalid={!!tplErrors.type} onChange={e => setTplForm({ ...tplForm, type: e.target.value })} options={VAS_TYPES} placeholder="Select Type" />
          </Field>
          <Field label="Default Quantity" required error={tplErrors.defaultQty}>
            <TextInput value={tplForm.defaultQty} invalid={!!tplErrors.defaultQty} onChange={e => setTplForm({ ...tplForm, defaultQty: e.target.value })} placeholder="e.g. 100" inputMode="numeric" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Steps" required error={tplErrors.steps}>
              <TextArea value={tplForm.steps} invalid={!!tplErrors.steps} onChange={e => setTplForm({ ...tplForm, steps: e.target.value })} placeholder="Pick components → assemble → seal → label" />
            </Field>
          </div>
        </div>
      </Modal>

      {/* Work order detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="VAS work order detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Work Order" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Client" value={detail.client} />
            <DetailRow label="VAS Type" value={<span className={cn("px-2 py-0.5 rounded-full text-[11px] font-semibold", vasTypeColors[detail.type] ?? "bg-muted text-muted-foreground")}>{detail.type}</span>} />
            <DetailRow label="Description" value={detail.desc} />
            <DetailRow label="Quantity" value={detail.qty.toLocaleString()} />
            <DetailRow label="Assignee" value={detail.assignee} />
            <DetailRow label="Due In" value={detail.dueIn} />
            <DetailRow label="Priority" value={<span className={cn("font-semibold capitalize", detail.priority === "high" ? "text-danger" : detail.priority === "medium" ? "text-warning" : "text-muted-foreground")}>{detail.priority}</span>} />
            <DetailRow label="Status" value={
              <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold", statusConfig[detail.status].bg, statusConfig[detail.status].text)}>
                {statusConfig[detail.status].icon}{statusConfig[detail.status].label}
              </span>} />
          </div>
        )}
      </Drawer>

      {/* Cancel work order confirmation */}
      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(o) => !o && setCancelTarget(null)}
        title="Cancel this work order?"
        message={`${cancelTarget?.id} (${cancelTarget?.type} for ${cancelTarget?.client}) will be removed from the VAS queue. This cannot be undone.`}
        confirmLabel="Cancel Work Order"
        cancelLabel="Keep It"
        onConfirm={() => cancelTarget && cancelWorkOrder(cancelTarget)}
      />

      {/* Delete template confirmation */}
      <ConfirmDialog
        open={!!tplDeleteTarget}
        onOpenChange={(o) => !o && setTplDeleteTarget(null)}
        title="Delete this template?"
        message={`${tplDeleteTarget?.name} will be removed from the VAS template library.`}
        confirmLabel="Delete Template"
        cancelLabel="Keep It"
        onConfirm={() => tplDeleteTarget && deleteTemplate(tplDeleteTarget)}
      />
    </div>
  )
}
