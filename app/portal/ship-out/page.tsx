"use client"

import { useState } from "react"
import { Truck, Plus, Search, Package, Clock, CheckCircle2, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

const tabs = ["All Orders", "Pending", "Processing", "Dispatched", "Delivered"]

// `type` (not `interface`) so rows stay assignable to Record<string, unknown> consumers
type Order = {
  id: string; channel: string; dest: string; lines: number; cartons: number; kg: number
  priority: string; status: string; created: string; sla: string; awb: string
  contact: string; phone: string; ref: string; items: string
}

const initialOrders: Order[] = [
  { id: "SO-3841", channel: "B2B", dest: "Apollo Hospitals, Hyderabad", lines: 3, cartons: 18, kg: 42, priority: "Express", status: "Dispatched", created: "Jul 19", sla: "Jul 21", awb: "AWB-7712441", contact: "Dr. Meera Rao", phone: "+91 98490 11223", ref: "PO-8812", items: "APX-7712 — 200 units\nAPX-4421 — 50 units" },
  { id: "SO-3840", channel: "B2B", dest: "KIMS Hospital, Secunderabad", lines: 2, cartons: 12, kg: 28, priority: "Standard", status: "Packing", created: "Jul 19", sla: "Jul 21", awb: "-", contact: "Stores Dept", phone: "+91 98490 44556", ref: "PO-8809", items: "APX-2209 — 40 sets" },
  { id: "SO-3839", channel: "B2C", dest: "MedPlus, Banjara Hills", lines: 5, cartons: 8, kg: 14, priority: "Standard", status: "Picking", created: "Jul 18", sla: "Jul 21", awb: "-", contact: "Store Manager", phone: "+91 98490 77889", ref: "PO-8801", items: "APX-1102 — 20 boxes" },
  { id: "SO-3835", channel: "B2B", dest: "Care Hospitals, Madhapur", lines: 4, cartons: 24, kg: 58, priority: "Standard", status: "Pending", created: "Jul 18", sla: "Jul 22", awb: "-", contact: "Purchase Cell", phone: "+91 98490 33221", ref: "PO-8795", items: "APX-6601 — 120 bags" },
  { id: "SO-3830", channel: "B2B", dest: "Rainbow Children's Hospital", lines: 6, cartons: 36, kg: 71, priority: "Express", status: "Delivered", created: "Jul 17", sla: "Jul 18", awb: "AWB-7712398", contact: "Pharmacy Head", phone: "+91 98490 66554", ref: "PO-8790", items: "APX-0091 — 500 pcs" },
  { id: "SO-3825", channel: "B2C", dest: "Wellness Forever, Jubilee Hills", lines: 2, cartons: 4, kg: 6, priority: "Standard", status: "Delivered", created: "Jul 16", sla: "Jul 18", awb: "AWB-7712351", contact: "Front Desk", phone: "+91 98490 99887", ref: "PO-8785", items: "APX-1102 — 10 boxes" },
]

const statusStyle: Record<string, string> = {
  Dispatched: "bg-brand/15 text-brand",
  Packing: "bg-warning/15 text-warning",
  Picking: "bg-orange-400/15 text-orange-400",
  Pending: "bg-muted text-muted-foreground",
  Delivered: "bg-success/15 text-success",
  Cancelled: "bg-danger/15 text-danger",
}

const priorityStyle: Record<string, string> = {
  Express: "bg-danger/15 text-danger",
  Standard: "bg-muted text-muted-foreground",
}

// Order lifecycle used by the "Advance" action in the detail drawer.
const flow = ["Pending", "Picking", "Packing", "Dispatched", "Delivered"]

const emptyForm = { dest: "", contact: "", phone: "", date: "", priority: "", ref: "", items: "" }

export default function PortalShipOutPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [tab, setTab] = useState("All Orders")
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [detail, setDetail] = useState<Order | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null)

  const filtered = orders.filter(o => {
    const matchTab = tab === "All Orders" || o.status === tab || (tab === "Processing" && (o.status === "Picking" || o.status === "Packing"))
    const matchSearch = !search || o.id.toLowerCase().includes(search.toLowerCase()) || o.dest.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  function set(key: keyof typeof emptyForm, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.dest.trim()) e.dest = "Delivery address is required"
    if (!form.contact.trim()) e.contact = "Contact person is required"
    if (!form.phone.trim()) e.phone = "Contact phone is required"
    else if (form.phone.replace(/\D/g, "").length < 10) e.phone = "Enter a valid phone number"
    if (!form.date.trim()) e.date = "Requested delivery date is required"
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date.trim())) e.date = "Use the format YYYY-MM-DD"
    if (!form.priority.trim()) e.priority = "Priority is required"
    else if (!/^(standard|express)$/i.test(form.priority.trim())) e.priority = "Enter Standard or Express"
    if (!form.items.trim()) e.items = "List at least one SKU and quantity"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createOrder() {
    if (!validate()) return
    const max = orders.reduce((m, o) => Math.max(m, Number(o.id.replace("SO-", "")) || 0), 3841)
    const lines = form.items.split("\n").filter(l => l.trim()).length
    const priority = /express/i.test(form.priority) ? "Express" : "Standard"
    const slaDate = new Date(form.date.trim())
    const next: Order = {
      id: `SO-${max + 1}`,
      channel: "B2B",
      dest: form.dest.trim(),
      lines,
      cartons: lines * 4,
      kg: lines * 9,
      priority,
      status: "Pending",
      created: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      sla: isNaN(slaDate.getTime()) ? form.date.trim() : slaDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      awb: "-",
      contact: form.contact.trim(),
      phone: form.phone.trim(),
      ref: form.ref.trim() || "-",
      items: form.items.trim(),
    }
    setOrders(prev => [next, ...prev])
    setShowForm(false)
    setForm(emptyForm)
    setErrors({})
    setTab("Pending")
    notify.success("Ship-out order placed", `${next.id} — ${lines} line${lines === 1 ? "" : "s"} to ${next.dest}.`)
  }

  function advance(o: Order) {
    const i = flow.indexOf(o.status)
    if (i < 0 || i === flow.length - 1) return
    const nextStatus = flow[i + 1]
    const awb = nextStatus === "Dispatched" && o.awb === "-" ? `AWB-${7712500 + Number(o.id.replace("SO-", ""))}` : o.awb
    setOrders(prev => prev.map(x => x.id === o.id ? { ...x, status: nextStatus, awb } : x))
    setDetail(prev => prev && prev.id === o.id ? { ...prev, status: nextStatus, awb } : prev)
    notify.success(`Order ${nextStatus.toLowerCase()}`, `${o.id} moved to ${nextStatus}${awb !== o.awb ? ` — ${awb}` : ""}.`)
  }

  function cancelOrder(o: Order) {
    setOrders(prev => prev.map(x => x.id === o.id ? { ...x, status: "Cancelled" } : x))
    setDetail(null)
    notify.warning("Order cancelled", `${o.id} to ${o.dest} has been cancelled.`)
  }

  const fields = [
    { key: "dest" as const, label: "Delivery Address", placeholder: "Hospital / store name & city", required: true },
    { key: "contact" as const, label: "Contact Person", placeholder: "Receiving contact", required: true },
    { key: "phone" as const, label: "Contact Phone", placeholder: "+91 XXXXX XXXXX", required: true },
    { key: "date" as const, label: "Requested Delivery Date", placeholder: "YYYY-MM-DD", required: true },
    { key: "priority" as const, label: "Priority", placeholder: "Standard / Express", required: true },
    { key: "ref" as const, label: "Reference / PO No.", placeholder: "e.g. PO-8822", required: false },
  ]

  return (
    <div className="p-4 sm:p-6 space-y-5 w-full">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-[#1E3A5F] dark:text-foreground">Ship-Out Orders</h1>
          <p className="text-sm text-muted-foreground">Place and track outbound dispatch requests</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E3A5F] dark:bg-brand text-white text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New Ship-Out Order
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Orders", value: orders.length, icon: <Package className="w-4 h-4" />, color: "text-[#1E3A5F] dark:text-brand", bg: "bg-[#1E3A5F]/10 dark:bg-brand/15" },
          { label: "In Progress", value: orders.filter(o => ["Picking","Packing"].includes(o.status)).length, icon: <Clock className="w-4 h-4" />, color: "text-warning", bg: "bg-warning/15" },
          { label: "Dispatched", value: orders.filter(o => o.status === "Dispatched").length, icon: <Truck className="w-4 h-4" />, color: "text-brand", bg: "bg-brand/15" },
          { label: "Delivered", value: orders.filter(o => o.status === "Delivered").length, icon: <CheckCircle2 className="w-4 h-4" />, color: "text-success", bg: "bg-success/15" },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", s.bg, s.color)}>{s.icon}</div>
            <div>
              <p className="text-lg font-bold text-[#1E3A5F] dark:text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* New Order Form */}
      {showForm && (
        <div className="rounded-2xl border border-[#1E3A5F]/30 dark:border-brand/30 bg-white dark:bg-card p-5">
          <h2 className="text-sm font-bold text-[#1E3A5F] dark:text-foreground mb-4">New Ship-Out Request</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map(f => (
              <div key={f.key}>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  {f.label}{f.required && <span className="ml-0.5 text-danger">*</span>}
                </label>
                <input
                  value={form[f.key]}
                  onChange={e => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg border bg-[#F7F9FC] dark:bg-muted/40 text-xs text-[#1E3A5F] dark:text-foreground outline-none transition-colors",
                    errors[f.key]
                      ? "border-danger focus:border-danger"
                      : "border-[#E4E9F0] dark:border-border focus:border-[#1E3A5F] dark:focus:border-brand",
                  )}
                />
                {errors[f.key] && <p className="mt-1 text-[10px] text-danger">{errors[f.key]}</p>}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
              Items to dispatch (SKU — Qty)<span className="ml-0.5 text-danger">*</span>
            </label>
            <textarea
              rows={3}
              value={form.items}
              onChange={e => set("items", e.target.value)}
              className={cn(
                "w-full px-3 py-2 rounded-lg border bg-[#F7F9FC] dark:bg-muted/40 text-xs text-[#1E3A5F] dark:text-foreground outline-none transition-colors resize-none",
                errors.items
                  ? "border-danger focus:border-danger"
                  : "border-[#E4E9F0] dark:border-border focus:border-[#1E3A5F] dark:focus:border-brand",
              )}
              placeholder="APX-7712 — 200 units&#10;APX-4421 — 50 units"
            />
            {errors.items && <p className="mt-1 text-[10px] text-danger">{errors.items}</p>}
          </div>
          <div className="mt-4 flex gap-2 justify-end">
            <button onClick={() => { setShowForm(false); setForm(emptyForm); setErrors({}) }} className="px-4 py-2 rounded-xl border border-[#E4E9F0] dark:border-border text-xs font-medium text-muted-foreground hover:bg-[#F7F9FC] dark:hover:bg-muted transition-colors">Cancel</button>
            <button onClick={createOrder} className="px-4 py-2 rounded-xl bg-[#1E3A5F] dark:bg-brand text-white text-xs font-medium hover:opacity-90 transition-opacity">Submit Order</button>
          </div>
        </div>
      )}

      {/* Tabs + search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 p-0.5 rounded-lg bg-[#F7F9FC] dark:bg-muted/40 border border-[#E4E9F0] dark:border-border flex-wrap">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors", tab === t ? "bg-[#1E3A5F] dark:bg-brand text-white" : "text-muted-foreground hover:text-[#1E3A5F] dark:hover:text-foreground")}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E4E9F0] dark:border-border bg-white dark:bg-card">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order or destination..." className="bg-transparent outline-none text-xs w-44 placeholder:text-muted-foreground text-[#1E3A5F] dark:text-foreground" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#E4E9F0] dark:border-border bg-[#F7F9FC] dark:bg-muted/30">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Order ID</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Destination</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground hidden md:table-cell">Cartons</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden lg:table-cell">Priority</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden lg:table-cell">SLA</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden xl:table-cell">AWB</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E9F0] dark:divide-border">
              {filtered.map(o => (
                <tr key={o.id} onClick={() => setDetail(o)} className="hover:bg-[#F7F9FC] dark:hover:bg-muted/20 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-mono font-bold text-[#1E3A5F] dark:text-brand">{o.id}</td>
                  <td className="px-4 py-3 text-[#1E3A5F] dark:text-foreground max-w-[160px] truncate">{o.dest}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground hidden md:table-cell">{o.cartons}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", priorityStyle[o.priority])}>{o.priority}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{o.sla}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground text-[10px] hidden xl:table-cell">{o.awb}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", statusStyle[o.status])}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); setDetail(o) }}
                      title="View order details"
                      className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-[#E4E9F0] dark:hover:bg-muted hover:text-[#1E3A5F] dark:hover:text-foreground transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">No orders match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-[#E4E9F0] dark:border-border text-xs text-muted-foreground">Showing {filtered.length} of {orders.length} orders</div>
      </div>

      {/* Order detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Ship-out order detail"
        footer={
          <>
            <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Close
            </button>
            {detail && flow.indexOf(detail.status) >= 0 && detail.status !== "Delivered" && (
              <button onClick={() => advance(detail)} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
                Advance to {flow[flow.indexOf(detail.status) + 1]}
              </button>
            )}
            {detail && ["Pending", "Picking", "Packing"].includes(detail.status) && (
              <button onClick={() => setCancelTarget(detail)} className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger/90">
                Cancel Order
              </button>
            )}
          </>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Order ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Channel" value={detail.channel} />
            <DetailRow label="Destination" value={detail.dest} />
            <DetailRow label="Contact" value={detail.contact} />
            <DetailRow label="Phone" value={<span className="font-mono">{detail.phone}</span>} />
            <DetailRow label="Reference / PO" value={<span className="font-mono">{detail.ref}</span>} />
            <DetailRow label="Line Items" value={detail.lines} />
            <DetailRow label="Cartons" value={detail.cartons} />
            <DetailRow label="Weight" value={`${detail.kg} kg`} />
            <DetailRow label="Priority" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", priorityStyle[detail.priority])}>{detail.priority}</span>} />
            <DetailRow label="Created" value={detail.created} />
            <DetailRow label="SLA" value={detail.sla} />
            <DetailRow label="AWB" value={<span className="font-mono">{detail.awb}</span>} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusStyle[detail.status])}>{detail.status}</span>} />
            <DetailRow label="Items" value={<span className="whitespace-pre-line">{detail.items}</span>} />
          </div>
        )}
      </Drawer>

      {/* Cancel confirmation */}
      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(o) => !o && setCancelTarget(null)}
        title="Cancel this ship-out order?"
        message={`${cancelTarget?.id} to ${cancelTarget?.dest} will be cancelled and removed from the dispatch queue. This cannot be undone.`}
        confirmLabel="Cancel Order"
        cancelLabel="Keep It"
        onConfirm={() => cancelTarget && cancelOrder(cancelTarget)}
      />
    </div>
  )
}
