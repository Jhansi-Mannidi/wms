"use client"
import { useState } from "react"
import { Search, Package, Play, Plus, Eye, UserPlus, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type PickOrder = {
  id: string; client: string; items: number; qty: number; zone: string
  picker: string; sla: string; priority: string; status: string
}

const initialOrders: PickOrder[] = [
  { id: "ORD-8810", client: "Acme Foods", items: 4, qty: 88, zone: "A", picker: "Unassigned", sla: "2024-07-20 16:00", priority: "High", status: "Ready" },
  { id: "ORD-8808", client: "Salt Works", items: 2, qty: 200, zone: "A,D", picker: "Ravi Kumar", sla: "2024-07-20 18:00", priority: "Normal", status: "Ready" },
  { id: "ORD-8806", client: "Agro Corp", items: 6, qty: 150, zone: "B,C", picker: "Priya Sharma", sla: "2024-07-21 10:00", priority: "Normal", status: "Ready" },
  { id: "ORD-8804", client: "Fresh Farms", items: 3, qty: 60, zone: "D", picker: "Unassigned", sla: "2024-07-20 14:00", priority: "Urgent", status: "Ready" },
  { id: "ORD-8802", client: "Global Oils", items: 5, qty: 120, zone: "B", picker: "Suresh Yadav", sla: "2024-07-20 17:00", priority: "High", status: "Ready" },
  { id: "ORD-8801", client: "Sweet Mills", items: 1, qty: 30, zone: "C", picker: "Unassigned", sla: "2024-07-21 12:00", priority: "Normal", status: "Ready" },
  { id: "ORD-8799", client: "Acme Foods", items: 7, qty: 180, zone: "A,D", picker: "Meena Patel", sla: "2024-07-20 15:30", priority: "Urgent", status: "In Picking" },
  { id: "ORD-8797", client: "Agro Corp", items: 4, qty: 95, zone: "B,C", picker: "Arjun Nair", sla: "2024-07-21 09:00", priority: "Normal", status: "Ready" },
  { id: "ORD-8795", client: "Salt Works", items: 2, qty: 250, zone: "A", picker: "Ravi Kumar", sla: "2024-07-20 19:00", priority: "Normal", status: "In Picking" },
  { id: "ORD-8793", client: "Fresh Farms", items: 6, qty: 145, zone: "D", picker: "Unassigned", sla: "2024-07-21 11:00", priority: "High", status: "Ready" },
  { id: "ORD-8791", client: "Global Oils", items: 3, qty: 70, zone: "C", picker: "Priya Sharma", sla: "2024-07-20 13:00", priority: "Urgent", status: "Ready" },
  { id: "ORD-8789", client: "Sweet Mills", items: 8, qty: 210, zone: "B", picker: "Suresh Yadav", sla: "2024-07-21 16:00", priority: "Normal", status: "In Picking" },
  { id: "ORD-8787", client: "Acme Foods", items: 2, qty: 48, zone: "A", picker: "Unassigned", sla: "2024-07-20 18:30", priority: "Normal", status: "Ready" },
  { id: "ORD-8785", client: "Agro Corp", items: 5, qty: 135, zone: "B,C", picker: "Meena Patel", sla: "2024-07-21 10:30", priority: "High", status: "Ready" },
  { id: "ORD-8783", client: "Salt Works", items: 4, qty: 300, zone: "A,D", picker: "Arjun Nair", sla: "2024-07-20 20:00", priority: "Normal", status: "Ready" },
  { id: "ORD-8781", client: "Fresh Farms", items: 1, qty: 22, zone: "D", picker: "Unassigned", sla: "2024-07-21 14:00", priority: "Normal", status: "Ready" },
  { id: "ORD-8779", client: "Global Oils", items: 9, qty: 230, zone: "C", picker: "Ravi Kumar", sla: "2024-07-20 12:30", priority: "Urgent", status: "In Picking" },
  { id: "ORD-8777", client: "Acme Foods", items: 3, qty: 66, zone: "A", picker: "Priya Sharma", sla: "2024-07-21 08:00", priority: "Normal", status: "Ready" },
  { id: "ORD-8775", client: "Sweet Mills", items: 6, qty: 155, zone: "B", picker: "Unassigned", sla: "2024-07-20 16:30", priority: "High", status: "Ready" },
  { id: "ORD-8773", client: "Agro Corp", items: 2, qty: 52, zone: "B,C", picker: "Suresh Yadav", sla: "2024-07-21 13:30", priority: "Normal", status: "Ready" },
  { id: "ORD-8771", client: "Salt Works", items: 5, qty: 275, zone: "A,D", picker: "Meena Patel", sla: "2024-07-20 21:00", priority: "Normal", status: "Ready" },
  { id: "ORD-8769", client: "Fresh Farms", items: 7, qty: 165, zone: "D", picker: "Arjun Nair", sla: "2024-07-21 15:00", priority: "High", status: "In Picking" },
  { id: "ORD-8767", client: "Global Oils", items: 1, qty: 18, zone: "C", picker: "Unassigned", sla: "2024-07-20 11:30", priority: "Urgent", status: "Ready" },
  { id: "ORD-8765", client: "Acme Foods", items: 4, qty: 98, zone: "A", picker: "Ravi Kumar", sla: "2024-07-21 17:30", priority: "Normal", status: "Ready" },
  { id: "ORD-8763", client: "Sweet Mills", items: 3, qty: 74, zone: "B", picker: "Priya Sharma", sla: "2024-07-20 14:30", priority: "Normal", status: "Ready" },
  { id: "ORD-8761", client: "Agro Corp", items: 8, qty: 195, zone: "B,C", picker: "Unassigned", sla: "2024-07-21 18:00", priority: "High", status: "Ready" },
]

const CLIENTS = ["Acme Foods", "Salt Works", "Agro Corp", "Fresh Farms", "Global Oils", "Sweet Mills"] as const
const PRIORITIES = ["Urgent", "High", "Normal"] as const
const ZONES = ["A", "B", "C", "D", "A,D", "B,C"] as const
const PICKERS = ["Ravi Kumar", "Priya Sharma", "Suresh Yadav", "Meena Patel", "Arjun Nair"] as const

const emptyForm = { client: "", items: "", qty: "", zone: "", picker: "", sla: "", priority: "" }

export default function ReadyToPickPage() {
  const [orders, setOrders] = useState<PickOrder[]>(initialOrders)
  const [search, setSearch] = useState("")

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [assignTarget, setAssignTarget] = useState<PickOrder | null>(null)
  const [assignPicker, setAssignPicker] = useState("")
  const [assignError, setAssignError] = useState("")

  const [detail, setDetail] = useState<PickOrder | null>(null)
  const [cancelTarget, setCancelTarget] = useState<PickOrder | null>(null)

  const filtered = orders.filter(o => o.id.toLowerCase().includes(search.toLowerCase()) || o.client.toLowerCase().includes(search.toLowerCase()))

  const stats = [
    { label: "Ready", value: orders.filter(o => o.status === "Ready").length },
    { label: "Unassigned", value: orders.filter(o => o.picker === "Unassigned").length, cls: "text-amber-600" },
    { label: "Assigned", value: orders.filter(o => o.picker !== "Unassigned").length },
    { label: "Urgent", value: orders.filter(o => o.priority === "Urgent").length, cls: "text-danger" },
  ]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.client) e.client = "Select a client"
    if (!form.items.trim()) e.items = "Line items is required"
    else if (!/^\d+$/.test(form.items) || Number(form.items) < 1) e.items = "Enter a positive whole number"
    if (!form.qty.trim()) e.qty = "Quantity is required"
    else if (!/^\d+$/.test(form.qty) || Number(form.qty) < 1) e.qty = "Enter a positive whole number"
    if (!form.zone) e.zone = "Select a zone"
    if (!form.sla.trim()) e.sla = "SLA date is required"
    if (!form.priority) e.priority = "Select a priority"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createOrder() {
    if (!validate()) {
      notify.error("Check the form", "Some required fields need your attention.")
      return
    }
    const nums = orders.map(o => Number(o.id.split("-")[1])).filter(n => !Number.isNaN(n))
    const next: PickOrder = {
      id: `ORD-${Math.max(8810, ...nums) + 1}`,
      client: form.client,
      items: Number(form.items),
      qty: Number(form.qty),
      zone: form.zone,
      picker: form.picker || "Unassigned",
      sla: `${form.sla} 18:00`,
      priority: form.priority,
      status: "Ready",
    }
    setOrders(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Pick task created", `${next.id} is ready to pick in zone ${next.zone}.`)
  }

  function openAssign(o: PickOrder) {
    setAssignTarget(o)
    setAssignPicker(o.picker === "Unassigned" ? "" : o.picker)
    setAssignError("")
  }

  function saveAssign() {
    if (!assignPicker) {
      setAssignError("Select a picker")
      return
    }
    const target = assignTarget
    if (!target) return
    setOrders(prev => prev.map(x => x.id === target.id ? { ...x, picker: assignPicker } : x))
    setAssignTarget(null)
    notify.success("Picker assigned", `${target.id} assigned to ${assignPicker}.`)
  }

  function startPick(o: PickOrder) {
    if (o.picker === "Unassigned") {
      notify.warning("Assign a picker first", `${o.id} has no picker assigned.`)
      openAssign(o)
      return
    }
    setOrders(prev => prev.map(x => x.id === o.id ? { ...x, status: "In Picking" } : x))
    notify.success("Pick started", `${o.id} is now being picked by ${o.picker}.`)
  }

  function cancelOrder(o: PickOrder) {
    setOrders(prev => prev.filter(x => x.id !== o.id))
    notify.warning("Pick task removed", `${o.id} was pulled from the pick queue.`)
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ready to Pick</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Allocated orders ready for picker assignment</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="ready-to-pick" />
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
            <Plus className="w-4 h-4" /> New Pick Task
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn("text-2xl font-bold mt-1", s.cls || "text-foreground")}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order ID, client..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>{["Order ID", "Client", "Items", "Qty", "Zone(s)", "Picker", "SLA", "Priority", "Status", ""].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(o => (
              <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{o.id}</td>
                <td className="px-4 py-3 text-foreground">{o.client}</td>
                <td className="px-4 py-3 text-foreground">{o.items}</td>
                <td className="px-4 py-3 font-semibold text-foreground">{o.qty}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.zone}</td>
                <td className="px-4 py-3"><span className={cn("text-xs", o.picker === "Unassigned" ? "text-amber-600 font-medium" : "text-foreground")}>{o.picker}</span></td>
                <td className="px-4 py-3 text-foreground">{o.sla}</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", o.priority === "Urgent" ? "bg-danger/10 text-danger" : o.priority === "High" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground")}>{o.priority}</span></td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", o.status === "In Picking" ? "bg-brand/10 text-brand" : "bg-muted text-muted-foreground")}>{o.status}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {o.status === "Ready" && (
                      <button onClick={() => startPick(o)} className="flex items-center gap-1 px-2 py-1 rounded-md bg-brand text-white text-xs hover:bg-brand/90"><Play className="w-3 h-3" /> Start</button>
                    )}
                    <RowActions
                      items={[
                        { label: "View details", icon: <Eye />, onSelect: () => setDetail(o) },
                        { label: "Assign picker", icon: <UserPlus />, onSelect: () => openAssign(o) },
                        { label: "Remove from queue", icon: <XCircle />, onSelect: () => setCancelTarget(o), tone: "danger" as const },
                      ]}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-10 text-center text-sm text-muted-foreground">No pick tasks match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New pick task */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="New Pick Task"
        description="Add an allocated order to the pick queue"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createOrder} submitLabel="Create Task" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Client" required error={errors.client}>
            <Select value={form.client} invalid={!!errors.client} onChange={e => setForm({ ...form, client: e.target.value })} options={CLIENTS} placeholder="Select Client" />
          </Field>
          <Field label="Zone(s)" required error={errors.zone}>
            <Select value={form.zone} invalid={!!errors.zone} onChange={e => setForm({ ...form, zone: e.target.value })} options={ZONES} placeholder="Select Zone" />
          </Field>
          <Field label="Line Items" required error={errors.items}>
            <TextInput value={form.items} invalid={!!errors.items} onChange={e => setForm({ ...form, items: e.target.value })} placeholder="e.g. 4" inputMode="numeric" />
          </Field>
          <Field label="Quantity" required error={errors.qty}>
            <TextInput value={form.qty} invalid={!!errors.qty} onChange={e => setForm({ ...form, qty: e.target.value })} placeholder="e.g. 88" inputMode="numeric" />
          </Field>
          <Field label="SLA Date" required error={errors.sla}>
            <TextInput type="date" value={form.sla} invalid={!!errors.sla} onChange={e => setForm({ ...form, sla: e.target.value })} />
          </Field>
          <Field label="Priority" required error={errors.priority}>
            <Select value={form.priority} invalid={!!errors.priority} onChange={e => setForm({ ...form, priority: e.target.value })} options={PRIORITIES} placeholder="Select Priority" />
          </Field>
          <Field label="Picker" hint="Leave blank to keep unassigned">
            <Select value={form.picker} onChange={e => setForm({ ...form, picker: e.target.value })} options={PICKERS} placeholder="Unassigned" />
          </Field>
        </div>
      </Modal>

      {/* Assign picker */}
      <Modal
        open={!!assignTarget}
        onOpenChange={(o) => !o && setAssignTarget(null)}
        title={assignTarget ? `Assign Picker — ${assignTarget.id}` : ""}
        description="Choose who picks this order"
        size="sm"
        footer={<ModalActions onCancel={() => setAssignTarget(null)} onSubmit={saveAssign} submitLabel="Assign" />}
      >
        <Field label="Picker" required error={assignError}>
          <Select value={assignPicker} invalid={!!assignError} onChange={e => { setAssignPicker(e.target.value); setAssignError("") }} options={PICKERS} placeholder="Select Picker" />
        </Field>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Pick task detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Close</button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Order ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Client" value={detail.client} />
            <DetailRow label="Line Items" value={detail.items} />
            <DetailRow label="Quantity" value={`${detail.qty} units`} />
            <DetailRow label="Zone(s)" value={detail.zone} />
            <DetailRow label="Picker" value={detail.picker} />
            <DetailRow label="SLA" value={detail.sla} />
            <DetailRow label="Priority" value={detail.priority} />
            <DetailRow label="Status" value={detail.status} />
          </div>
        )}
      </Drawer>

      {/* Remove confirmation */}
      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(o) => !o && setCancelTarget(null)}
        title="Remove this pick task?"
        message={`${cancelTarget?.id} for ${cancelTarget?.client} will be pulled from the pick queue. This cannot be undone.`}
        confirmLabel="Remove Task"
        cancelLabel="Keep It"
        onConfirm={() => cancelTarget && cancelOrder(cancelTarget)}
      />
    </div>
  )
}
