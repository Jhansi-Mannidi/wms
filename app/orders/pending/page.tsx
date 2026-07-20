"use client"
import { useState } from "react"
import { Search, Clock, AlertTriangle, Plus, Eye, Check, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type PendingOrder = {
  id: string; client: string; items: number; qty: number; priority: string
  orderDate: string; sla: string; waitTime: string; reason: string
}

const initialOrders: PendingOrder[] = [
  { id: "ORD-8820", client: "Acme Foods", items: 5, qty: 120, priority: "High", orderDate: "2024-07-20 08:15", sla: "2024-07-20 18:00", waitTime: "2h 14m", reason: "Awaiting stock" },
  { id: "ORD-8819", client: "Global Oils", items: 3, qty: 60, priority: "Normal", orderDate: "2024-07-20 07:30", sla: "2024-07-21 12:00", waitTime: "3h 01m", reason: "Awaiting allocation" },
  { id: "ORD-8817", client: "Agro Corp", items: 8, qty: 200, priority: "Urgent", orderDate: "2024-07-19 22:00", sla: "2024-07-20 10:00", waitTime: "10h", reason: "Partial stock" },
  { id: "ORD-8815", client: "Sweet Mills", items: 2, qty: 40, priority: "Normal", orderDate: "2024-07-19 18:00", sla: "2024-07-21 18:00", waitTime: "14h", reason: "Awaiting confirmation" },
]

const priorityColor: Record<string, string> = {
  Urgent: "bg-danger/10 text-danger",
  High: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Normal: "bg-muted text-muted-foreground",
}

const CLIENTS = ["Acme Foods", "Global Oils", "Agro Corp", "Sweet Mills", "Salt Works", "Fresh Farms"] as const
const PRIORITIES = ["Urgent", "High", "Normal"] as const
const REASONS = ["Awaiting stock", "Awaiting allocation", "Partial stock", "Awaiting confirmation", "Credit hold"] as const

const emptyForm = { client: "", items: "", qty: "", priority: "", sla: "", reason: "" }

/** Parse "2h 14m" / "10h" into hours so the avg-wait stat can be derived from state. */
function waitHours(w: string) {
  const h = Number(/(\d+)\s*h/.exec(w)?.[1] ?? 0)
  const m = Number(/(\d+)\s*m/.exec(w)?.[1] ?? 0)
  return h + m / 60
}

export default function PendingOrdersPage() {
  const [orders, setOrders] = useState<PendingOrder[]>(initialOrders)
  const [search, setSearch] = useState("")

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<PendingOrder | null>(null)
  const [cancelTarget, setCancelTarget] = useState<PendingOrder | null>(null)

  const filtered = orders.filter(o => o.id.toLowerCase().includes(search.toLowerCase()) || o.client.toLowerCase().includes(search.toLowerCase()))

  const avgWait = orders.length ? (orders.reduce((s, o) => s + waitHours(o.waitTime), 0) / orders.length).toFixed(1) : "0.0"
  const stats = [
    { label: "Total Pending", value: String(orders.length), cls: "text-amber-600" },
    { label: "Urgent", value: String(orders.filter(o => o.priority === "Urgent").length), cls: "text-danger" },
    { label: "Awaiting Stock", value: String(orders.filter(o => o.reason === "Awaiting stock" || o.reason === "Partial stock").length) },
    { label: "Avg Wait Time", value: `${avgWait}h` },
  ]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.client) e.client = "Select a client"
    if (!form.items.trim()) e.items = "Line items is required"
    else if (!/^\d+$/.test(form.items) || Number(form.items) < 1) e.items = "Enter a positive whole number"
    if (!form.qty.trim()) e.qty = "Quantity is required"
    else if (!/^\d+$/.test(form.qty) || Number(form.qty) < 1) e.qty = "Enter a positive whole number"
    if (!form.priority) e.priority = "Select a priority"
    if (!form.sla.trim()) e.sla = "SLA date is required"
    if (!form.reason) e.reason = "Select a hold reason"
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
    const next: PendingOrder = {
      id: `ORD-${Math.max(8820, ...nums) + 1}`,
      client: form.client,
      items: Number(form.items),
      qty: Number(form.qty),
      priority: form.priority,
      orderDate: `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`,
      sla: `${form.sla} 18:00`,
      waitTime: "0h 00m",
      reason: form.reason,
    }
    setOrders(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Order queued", `${next.id} added to pending allocation.`)
  }

  function allocate(o: PendingOrder) {
    setOrders(prev => prev.filter(x => x.id !== o.id))
    setDetail(null)
    notify.success("Order allocated", `${o.id} allocated and moved to Ready to Pick.`)
  }

  function escalate(o: PendingOrder) {
    setOrders(prev => prev.map(x => x.id === o.id ? { ...x, priority: "Urgent" } : x))
    notify.warning("Order escalated", `${o.id} is now Urgent priority.`)
  }

  function cancelOrder(o: PendingOrder) {
    setOrders(prev => prev.filter(x => x.id !== o.id))
    notify.warning("Order cancelled", `${o.id} has been removed from the queue.`)
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pending Allocation</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Orders awaiting inventory allocation</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="pending-orders" />
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
            <Plus className="w-4 h-4" /> New Order
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
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
            <tr>{["Order ID", "Client", "Items", "Qty", "Priority", "Order Date", "SLA", "Wait Time", "Reason", "Actions"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(o => (
              <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{o.id}</td>
                <td className="px-4 py-3 text-foreground">{o.client}</td>
                <td className="px-4 py-3 text-foreground">{o.items}</td>
                <td className="px-4 py-3 font-semibold text-foreground">{o.qty}</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", priorityColor[o.priority])}>{o.priority}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{o.orderDate}</td>
                <td className="px-4 py-3 text-foreground">{o.sla}</td>
                <td className="px-4 py-3 text-amber-600"><span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{o.waitTime}</span></td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{o.reason}</td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: "View details", icon: <Eye />, onSelect: () => setDetail(o) },
                      { label: "Allocate stock", icon: <Check />, onSelect: () => allocate(o), tone: "success" as const },
                      ...(o.priority !== "Urgent"
                        ? [{ label: "Escalate to Urgent", icon: <AlertTriangle />, onSelect: () => escalate(o) }]
                        : []),
                      { label: "Cancel order", icon: <XCircle />, onSelect: () => setCancelTarget(o), tone: "danger" as const },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-10 text-center text-sm text-muted-foreground">No pending orders match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New order */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="New Pending Order"
        description="Queue an order for inventory allocation"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createOrder} submitLabel="Queue Order" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Client" required error={errors.client}>
            <Select value={form.client} invalid={!!errors.client} onChange={e => setForm({ ...form, client: e.target.value })} options={CLIENTS} placeholder="Select Client" />
          </Field>
          <Field label="Priority" required error={errors.priority}>
            <Select value={form.priority} invalid={!!errors.priority} onChange={e => setForm({ ...form, priority: e.target.value })} options={PRIORITIES} placeholder="Select Priority" />
          </Field>
          <Field label="Line Items" required error={errors.items}>
            <TextInput value={form.items} invalid={!!errors.items} onChange={e => setForm({ ...form, items: e.target.value })} placeholder="e.g. 5" inputMode="numeric" />
          </Field>
          <Field label="Quantity" required error={errors.qty}>
            <TextInput value={form.qty} invalid={!!errors.qty} onChange={e => setForm({ ...form, qty: e.target.value })} placeholder="e.g. 120" inputMode="numeric" />
          </Field>
          <Field label="SLA Date" required error={errors.sla}>
            <TextInput type="date" value={form.sla} invalid={!!errors.sla} onChange={e => setForm({ ...form, sla: e.target.value })} />
          </Field>
          <Field label="Hold Reason" required error={errors.reason}>
            <Select value={form.reason} invalid={!!errors.reason} onChange={e => setForm({ ...form, reason: e.target.value })} options={REASONS} placeholder="Select Reason" />
          </Field>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Pending order detail"
        footer={
          <>
            <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Close</button>
            <button onClick={() => detail && allocate(detail)} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">Allocate Stock</button>
          </>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Order ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Client" value={detail.client} />
            <DetailRow label="Line Items" value={detail.items} />
            <DetailRow label="Quantity" value={`${detail.qty} units`} />
            <DetailRow label="Priority" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", priorityColor[detail.priority])}>{detail.priority}</span>} />
            <DetailRow label="Order Date" value={detail.orderDate} />
            <DetailRow label="SLA Deadline" value={detail.sla} />
            <DetailRow label="Wait Time" value={detail.waitTime} />
            <DetailRow label="Hold Reason" value={detail.reason} />
          </div>
        )}
      </Drawer>

      {/* Cancel confirmation */}
      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(o) => !o && setCancelTarget(null)}
        title="Cancel this order?"
        message={`Order ${cancelTarget?.id} for ${cancelTarget?.client} will be removed from the allocation queue. This cannot be undone.`}
        confirmLabel="Cancel Order"
        cancelLabel="Keep It"
        onConfirm={() => cancelTarget && cancelOrder(cancelTarget)}
      />
    </div>
  )
}
