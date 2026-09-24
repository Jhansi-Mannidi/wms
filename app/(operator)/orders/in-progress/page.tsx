"use client"
import { useState } from "react"
import { Search, Plus, Eye, ChevronRight, UserPlus, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type ActiveOrder = {
  id: string; client: string; items: number; picked: number; packed: number
  picker: string; started: string; sla: string; progress: number; stage: string
}

const initialOrders: ActiveOrder[] = [
  { id: "ORD-8800", client: "Acme Foods", items: 5, picked: 3, packed: 0, picker: "Ravi Kumar", started: "2024-07-20 09:00", sla: "2024-07-20 16:00", progress: 60, stage: "Picking" },
  { id: "ORD-8795", client: "Global Oils", items: 4, picked: 4, packed: 2, picker: "Priya Sharma", started: "2024-07-20 08:30", sla: "2024-07-20 15:00", progress: 80, stage: "Packing" },
  { id: "ORD-8790", client: "Agro Corp", items: 8, picked: 8, packed: 6, picker: "Suresh Yadav", started: "2024-07-20 07:00", sla: "2024-07-20 13:00", progress: 90, stage: "QC Check" },
  { id: "ORD-8785", client: "Salt Works", items: 3, picked: 1, packed: 0, picker: "Arjun Nair", started: "2024-07-20 09:30", sla: "2024-07-21 09:00", progress: 33, stage: "Picking" },
  { id: "ORD-8780", client: "Sweet Mills", items: 6, picked: 4, packed: 0, picker: "Meena Patel", started: "2024-07-20 10:00", sla: "2024-07-20 17:00", progress: 55, stage: "Picking" },
  { id: "ORD-8778", client: "Fresh Farms", items: 4, picked: 4, packed: 3, picker: "Ravi Kumar", started: "2024-07-20 08:15", sla: "2024-07-20 14:30", progress: 78, stage: "Packing" },
  { id: "ORD-8776", client: "Acme Foods", items: 7, picked: 7, packed: 7, picker: "Priya Sharma", started: "2024-07-20 07:30", sla: "2024-07-20 13:30", progress: 95, stage: "QC Check" },
  { id: "ORD-8772", client: "Global Oils", items: 3, picked: 3, packed: 3, picker: "Suresh Yadav", started: "2024-07-20 06:45", sla: "2024-07-20 12:00", progress: 100, stage: "Staged" },
  { id: "ORD-8770", client: "Agro Corp", items: 5, picked: 2, packed: 0, picker: "Arjun Nair", started: "2024-07-20 10:20", sla: "2024-07-21 08:00", progress: 40, stage: "Picking" },
  { id: "ORD-8768", client: "Salt Works", items: 2, picked: 2, packed: 1, picker: "Meena Patel", started: "2024-07-20 09:15", sla: "2024-07-20 18:00", progress: 70, stage: "Packing" },
  { id: "ORD-8765", client: "Sweet Mills", items: 8, picked: 8, packed: 8, picker: "Ravi Kumar", started: "2024-07-20 07:00", sla: "2024-07-20 15:00", progress: 92, stage: "QC Check" },
  { id: "ORD-8762", client: "Fresh Farms", items: 4, picked: 1, packed: 0, picker: "Priya Sharma", started: "2024-07-20 10:45", sla: "2024-07-21 10:00", progress: 25, stage: "Picking" },
  { id: "ORD-8760", client: "Acme Foods", items: 6, picked: 6, packed: 4, picker: "Suresh Yadav", started: "2024-07-20 08:00", sla: "2024-07-20 16:30", progress: 75, stage: "Packing" },
  { id: "ORD-8758", client: "Global Oils", items: 3, picked: 3, packed: 3, picker: "Arjun Nair", started: "2024-07-20 06:30", sla: "2024-07-20 11:30", progress: 100, stage: "Staged" },
  { id: "ORD-8755", client: "Agro Corp", items: 9, picked: 6, packed: 0, picker: "Meena Patel", started: "2024-07-20 09:45", sla: "2024-07-21 09:30", progress: 65, stage: "Picking" },
  { id: "ORD-8752", client: "Salt Works", items: 5, picked: 5, packed: 2, picker: "Ravi Kumar", started: "2024-07-20 08:45", sla: "2024-07-20 19:00", progress: 72, stage: "Packing" },
  { id: "ORD-8750", client: "Sweet Mills", items: 2, picked: 2, packed: 2, picker: "Priya Sharma", started: "2024-07-20 07:15", sla: "2024-07-20 12:30", progress: 88, stage: "QC Check" },
  { id: "ORD-8748", client: "Fresh Farms", items: 7, picked: 3, packed: 0, picker: "Suresh Yadav", started: "2024-07-20 10:30", sla: "2024-07-21 11:00", progress: 43, stage: "Picking" },
  { id: "ORD-8745", client: "Acme Foods", items: 4, picked: 4, packed: 3, picker: "Arjun Nair", started: "2024-07-20 09:00", sla: "2024-07-20 17:30", progress: 80, stage: "Packing" },
  { id: "ORD-8742", client: "Global Oils", items: 6, picked: 6, packed: 6, picker: "Meena Patel", started: "2024-07-20 06:15", sla: "2024-07-20 13:00", progress: 100, stage: "Staged" },
  { id: "ORD-8740", client: "Agro Corp", items: 3, picked: 1, packed: 0, picker: "Ravi Kumar", started: "2024-07-20 11:00", sla: "2024-07-21 12:00", progress: 30, stage: "Picking" },
  { id: "ORD-8738", client: "Salt Works", items: 8, picked: 8, packed: 5, picker: "Priya Sharma", started: "2024-07-20 07:45", sla: "2024-07-20 20:00", progress: 76, stage: "Packing" },
  { id: "ORD-8735", client: "Sweet Mills", items: 5, picked: 5, packed: 5, picker: "Suresh Yadav", started: "2024-07-20 06:00", sla: "2024-07-20 14:00", progress: 90, stage: "QC Check" },
  { id: "ORD-8732", client: "Fresh Farms", items: 6, picked: 4, packed: 0, picker: "Arjun Nair", started: "2024-07-20 10:10", sla: "2024-07-21 13:00", progress: 58, stage: "Picking" },
]

/** Stage chain plus the progress % each stage implies. */
const STAGES = ["Picking", "Packing", "QC Check", "Staged"] as const
const STAGE_PROGRESS: Record<string, number> = { Picking: 40, Packing: 70, "QC Check": 90, Staged: 100 }

const CLIENTS = ["Acme Foods", "Global Oils", "Agro Corp", "Salt Works", "Sweet Mills", "Fresh Farms"] as const
const PICKERS = ["Ravi Kumar", "Priya Sharma", "Suresh Yadav", "Meena Patel", "Arjun Nair"] as const

const emptyForm = { client: "", items: "", picker: "", stage: "", sla: "" }

export default function InProgressOrdersPage() {
  const [orders, setOrders] = useState<ActiveOrder[]>(initialOrders)
  const [search, setSearch] = useState("")

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [reassign, setReassign] = useState<ActiveOrder | null>(null)
  const [reassignTo, setReassignTo] = useState("")
  const [reassignError, setReassignError] = useState("")

  const [detail, setDetail] = useState<ActiveOrder | null>(null)
  const [abortTarget, setAbortTarget] = useState<ActiveOrder | null>(null)

  const filtered = orders.filter(o => o.id.toLowerCase().includes(search.toLowerCase()) || o.client.toLowerCase().includes(search.toLowerCase()))

  const stats = [
    { label: "Active Orders", value: orders.length },
    { label: "Picking Stage", value: orders.filter(o => o.stage === "Picking").length },
    { label: "Packing Stage", value: orders.filter(o => o.stage === "Packing").length },
    { label: "QC / Staging", value: orders.filter(o => o.stage === "QC Check" || o.stage === "Staged").length },
  ]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.client) e.client = "Select a client"
    if (!form.items.trim()) e.items = "Line items is required"
    else if (!/^\d+$/.test(form.items) || Number(form.items) < 1) e.items = "Enter a positive whole number"
    if (!form.picker) e.picker = "Assign a picker"
    if (!form.stage) e.stage = "Select a stage"
    if (!form.sla.trim()) e.sla = "SLA date is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createOrder() {
    if (!validate()) {
      notify.error("Check the form", "Some required fields need your attention.")
      return
    }
    const nums = orders.map(o => Number(o.id.split("-")[1])).filter(n => !Number.isNaN(n))
    const now = new Date()
    const next: ActiveOrder = {
      id: `ORD-${Math.max(8800, ...nums) + 1}`,
      client: form.client,
      items: Number(form.items),
      picked: 0,
      packed: 0,
      picker: form.picker,
      started: `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`,
      sla: `${form.sla} 18:00`,
      progress: STAGE_PROGRESS[form.stage] ?? 0,
      stage: form.stage,
    }
    setOrders(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Order started", `${next.id} is now in ${next.stage}.`)
  }

  function advance(o: ActiveOrder) {
    const i = STAGES.indexOf(o.stage as typeof STAGES[number])
    if (i === STAGES.length - 1 || i === -1) {
      // Staged is terminal here — the order leaves this queue.
      setOrders(prev => prev.filter(x => x.id !== o.id))
      notify.success("Order completed", `${o.id} left the in-progress queue.`)
      return
    }
    const nextStage = STAGES[i + 1]
    setOrders(prev => prev.map(x => x.id === o.id
      ? { ...x, stage: nextStage, progress: STAGE_PROGRESS[nextStage], picked: x.items, packed: nextStage === "Picking" ? x.packed : x.items }
      : x))
    notify.success("Stage advanced", `${o.id} moved to ${nextStage}.`)
  }

  function openReassign(o: ActiveOrder) {
    setReassign(o)
    setReassignTo(o.picker)
    setReassignError("")
  }

  function saveReassign() {
    if (!reassignTo) {
      setReassignError("Select an operator")
      return
    }
    const target = reassign
    if (!target) return
    setOrders(prev => prev.map(x => x.id === target.id ? { ...x, picker: reassignTo } : x))
    setReassign(null)
    notify.success("Operator reassigned", `${target.id} is now with ${reassignTo}.`)
  }

  function abort(o: ActiveOrder) {
    setOrders(prev => prev.filter(x => x.id !== o.id))
    notify.warning("Order aborted", `${o.id} was pulled back for re-allocation.`)
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">In Progress</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Orders currently being picked or packed</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="orders-in-progress" />
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
            <Plus className="w-4 h-4" /> Start Order
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order ID, client..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>{["Order ID", "Client", "Progress", "Stage", "Picker", "Started", "SLA", "Actions"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(o => (
              <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{o.id}</td>
                <td className="px-4 py-3 text-foreground">{o.client}</td>
                <td className="px-4 py-3 w-48">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-1.5"><div className="h-1.5 rounded-full bg-brand transition-all" style={{ width: `${o.progress}%` }} /></div>
                    <span className="text-xs text-muted-foreground w-8">{o.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{o.stage}</span></td>
                <td className="px-4 py-3 text-foreground">{o.picker}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.started}</td>
                <td className="px-4 py-3 text-foreground">{o.sla}</td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: "View details", icon: <Eye />, onSelect: () => setDetail(o) },
                      { label: "Advance stage", icon: <ChevronRight />, onSelect: () => advance(o), tone: "success" as const },
                      { label: "Reassign operator", icon: <UserPlus />, onSelect: () => openReassign(o) },
                      { label: "Abort order", icon: <XCircle />, onSelect: () => setAbortTarget(o), tone: "danger" as const },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No in-progress orders match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Start order */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="Start an Order"
        description="Put an allocated order into active fulfilment"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createOrder} submitLabel="Start Order" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Client" required error={errors.client}>
            <Select value={form.client} invalid={!!errors.client} onChange={e => setForm({ ...form, client: e.target.value })} options={CLIENTS} placeholder="Select Client" />
          </Field>
          <Field label="Line Items" required error={errors.items}>
            <TextInput value={form.items} invalid={!!errors.items} onChange={e => setForm({ ...form, items: e.target.value })} placeholder="e.g. 5" inputMode="numeric" />
          </Field>
          <Field label="Operator" required error={errors.picker}>
            <Select value={form.picker} invalid={!!errors.picker} onChange={e => setForm({ ...form, picker: e.target.value })} options={PICKERS} placeholder="Select Operator" />
          </Field>
          <Field label="Starting Stage" required error={errors.stage}>
            <Select value={form.stage} invalid={!!errors.stage} onChange={e => setForm({ ...form, stage: e.target.value })} options={STAGES} placeholder="Select Stage" />
          </Field>
          <Field label="SLA Date" required error={errors.sla}>
            <TextInput type="date" value={form.sla} invalid={!!errors.sla} onChange={e => setForm({ ...form, sla: e.target.value })} />
          </Field>
        </div>
      </Modal>

      {/* Reassign operator */}
      <Modal
        open={!!reassign}
        onOpenChange={(o) => !o && setReassign(null)}
        title={reassign ? `Reassign — ${reassign.id}` : ""}
        description="Hand this order to a different operator"
        size="sm"
        footer={<ModalActions onCancel={() => setReassign(null)} onSubmit={saveReassign} submitLabel="Reassign" />}
      >
        <Field label="Operator" required error={reassignError}>
          <Select value={reassignTo} invalid={!!reassignError} onChange={e => { setReassignTo(e.target.value); setReassignError("") }} options={PICKERS} placeholder="Select Operator" />
        </Field>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Active order detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Close</button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Order ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Client" value={detail.client} />
            <DetailRow label="Line Items" value={detail.items} />
            <DetailRow label="Picked" value={`${detail.picked} / ${detail.items}`} />
            <DetailRow label="Packed" value={`${detail.packed} / ${detail.items}`} />
            <DetailRow label="Progress" value={`${detail.progress}%`} />
            <DetailRow label="Stage" value={detail.stage} />
            <DetailRow label="Operator" value={detail.picker} />
            <DetailRow label="Started" value={detail.started} />
            <DetailRow label="SLA" value={detail.sla} />
          </div>
        )}
      </Drawer>

      {/* Abort confirmation */}
      <ConfirmDialog
        open={!!abortTarget}
        onOpenChange={(o) => !o && setAbortTarget(null)}
        title="Abort this order?"
        message={`${abortTarget?.id} will be pulled out of fulfilment and returned for re-allocation. Progress will be lost.`}
        confirmLabel="Abort Order"
        cancelLabel="Keep Going"
        onConfirm={() => abortTarget && abort(abortTarget)}
      />
    </div>
  )
}
