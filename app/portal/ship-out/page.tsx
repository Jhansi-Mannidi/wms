"use client"

import { useState } from "react"
import { Truck, Plus, Search, Package, Clock, CheckCircle2, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, TextArea, ModalActions, DetailRow } from "@/components/ui/form"
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
  { id: "SO-3824", channel: "B2B", dest: "Yashoda Hospitals, Somajiguda", lines: 4, cartons: 22, kg: 51, priority: "Standard", status: "Packing", created: "Jul 16", sla: "Jul 19", awb: "-", contact: "Pharmacy Stores", phone: "+91 98490 22114", ref: "PO-8784", items: "APX-3301 — 80 vials\nAPX-2209 — 30 sets" },
  { id: "SO-3822", channel: "B2B", dest: "Continental Hospitals, Gachibowli", lines: 3, cartons: 15, kg: 34, priority: "Express", status: "Picking", created: "Jul 16", sla: "Jul 18", awb: "-", contact: "Dr. Anil Prasad", phone: "+91 98490 55332", ref: "PO-8781", items: "APX-7712 — 150 units" },
  { id: "SO-3820", channel: "B2C", dest: "Apollo Pharmacy, Kukatpally", lines: 2, cartons: 5, kg: 9, priority: "Standard", status: "Pending", created: "Jul 16", sla: "Jul 19", awb: "-", contact: "Store Manager", phone: "+91 98490 88220", ref: "PO-8778", items: "APX-1102 — 15 boxes" },
  { id: "SO-3819", channel: "B2B", dest: "AIG Hospitals, Gachibowli", lines: 5, cartons: 30, kg: 66, priority: "Express", status: "Dispatched", created: "Jul 15", sla: "Jul 17", awb: "AWB-7712310", contact: "Purchase Cell", phone: "+91 98490 11447", ref: "PO-8775", items: "APX-6601 — 200 bags\nAPX-0091 — 300 pcs" },
  { id: "SO-3817", channel: "B2B", dest: "Sunshine Hospitals, Secunderabad", lines: 4, cartons: 20, kg: 47, priority: "Standard", status: "Packing", created: "Jul 15", sla: "Jul 18", awb: "-", contact: "Stores Dept", phone: "+91 98490 66112", ref: "PO-8772", items: "APX-4421 — 400 units" },
  { id: "SO-3815", channel: "B2C", dest: "MedPlus, Kondapur", lines: 3, cartons: 6, kg: 11, priority: "Standard", status: "Picking", created: "Jul 15", sla: "Jul 18", awb: "-", contact: "Store Manager", phone: "+91 98490 77002", ref: "PO-8769", items: "APX-1102 — 18 boxes" },
  { id: "SO-3814", channel: "B2B", dest: "Star Hospitals, Banjara Hills", lines: 6, cartons: 28, kg: 63, priority: "Standard", status: "Dispatched", created: "Jul 14", sla: "Jul 17", awb: "AWB-7712288", contact: "Kavitha Rao", phone: "+91 98490 30918", ref: "PO-8766", items: "APX-5502 — 220 units\nAPX-2209 — 45 sets" },
  { id: "SO-3812", channel: "B2B", dest: "Aster Prime Hospital, Ameerpet", lines: 2, cartons: 10, kg: 23, priority: "Express", status: "Delivered", created: "Jul 14", sla: "Jul 15", awb: "AWB-7712271", contact: "Dr. Priya Sharma", phone: "+91 98490 41276", ref: "PO-8763", items: "APX-3301 — 60 vials" },
  { id: "SO-3810", channel: "B2C", dest: "Wellness Forever, Kondapur", lines: 2, cartons: 4, kg: 7, priority: "Standard", status: "Pending", created: "Jul 14", sla: "Jul 17", awb: "-", contact: "Front Desk", phone: "+91 98490 52801", ref: "PO-8760", items: "APX-1102 — 12 boxes" },
  { id: "SO-3808", channel: "B2B", dest: "Omni Hospitals, Kothapet", lines: 4, cartons: 19, kg: 44, priority: "Standard", status: "Delivered", created: "Jul 13", sla: "Jul 16", awb: "AWB-7712254", contact: "Suresh Yadav", phone: "+91 98490 63344", ref: "PO-8757", items: "APX-6601 — 140 bags" },
  { id: "SO-3806", channel: "B2B", dest: "Medicover Hospitals, Hitec City", lines: 5, cartons: 26, kg: 59, priority: "Express", status: "Dispatched", created: "Jul 13", sla: "Jul 15", awb: "AWB-7712240", contact: "Pharmacy Head", phone: "+91 98490 74125", ref: "PO-8754", items: "APX-7712 — 260 units\nAPX-8814 — 90 units" },
  { id: "SO-3805", channel: "B2B", dest: "Global Hospitals, Lakdikapul", lines: 3, cartons: 14, kg: 31, priority: "Standard", status: "Cancelled", created: "Jul 13", sla: "Jul 16", awb: "-", contact: "Purchase Cell", phone: "+91 98490 85630", ref: "PO-8751", items: "APX-4421 — 200 units" },
  { id: "SO-3803", channel: "B2B", dest: "Basavatarakam Cancer Hospital, Banjara Hills", lines: 6, cartons: 33, kg: 74, priority: "Express", status: "Delivered", created: "Jul 12", sla: "Jul 14", awb: "AWB-7712229", contact: "Dr. Arjun Nair", phone: "+91 98490 96517", ref: "PO-8748", items: "APX-9903 — 180 vials\nAPX-0091 — 400 pcs" },
  { id: "SO-3801", channel: "B2C", dest: "Netmeds Fulfilment Centre, Chennai", lines: 4, cartons: 12, kg: 26, priority: "Standard", status: "Delivered", created: "Jul 12", sla: "Jul 15", awb: "AWB-7712215", contact: "Inward Desk", phone: "+91 98410 20744", ref: "PO-8745", items: "APX-1102 — 40 boxes" },
  { id: "SO-3799", channel: "B2B", dest: "Fortis Hospital, Bengaluru", lines: 5, cartons: 25, kg: 57, priority: "Standard", status: "Delivered", created: "Jul 11", sla: "Jul 15", awb: "AWB-7712203", contact: "Meena Patel", phone: "+91 98450 31882", ref: "PO-8742", items: "APX-5502 — 190 units" },
  { id: "SO-3797", channel: "B2B", dest: "Manipal Hospital, Bengaluru", lines: 3, cartons: 16, kg: 37, priority: "Express", status: "Delivered", created: "Jul 11", sla: "Jul 13", awb: "AWB-7712190", contact: "Stores Dept", phone: "+91 98450 44219", ref: "PO-8739", items: "APX-3301 — 100 vials" },
  { id: "SO-3795", channel: "B2B", dest: "Kauvery Hospital, Chennai", lines: 4, cartons: 21, kg: 48, priority: "Standard", status: "Delivered", created: "Jul 10", sla: "Jul 14", awb: "AWB-7712178", contact: "Rahul Mehta", phone: "+91 98410 55367", ref: "PO-8736", items: "APX-2209 — 70 sets" },
  { id: "SO-3793", channel: "B2C", dest: "PharmEasy Hub, Pune", lines: 6, cartons: 18, kg: 39, priority: "Standard", status: "Dispatched", created: "Jul 10", sla: "Jul 14", awb: "AWB-7712166", contact: "Inward Desk", phone: "+91 98220 66145", ref: "PO-8733", items: "APX-1102 — 55 boxes\nAPX-8814 — 60 units" },
  { id: "SO-3791", channel: "B2B", dest: "Ramesh Hospitals, Vijayawada", lines: 3, cartons: 13, kg: 29, priority: "Standard", status: "Delivered", created: "Jul 9", sla: "Jul 12", awb: "AWB-7712154", contact: "Deepa Menon", phone: "+91 98660 27310", ref: "PO-8730", items: "APX-6601 — 95 bags" },
  { id: "SO-3789", channel: "B2B", dest: "KIMS Hospital, Kurnool", lines: 5, cartons: 27, kg: 61, priority: "Standard", status: "Cancelled", created: "Jul 9", sla: "Jul 13", awb: "-", contact: "Purchase Cell", phone: "+91 98660 38921", ref: "PO-8727", items: "APX-7712 — 240 units" },
  { id: "SO-3787", channel: "B2C", dest: "Lifeline Pharmacy, Vijayawada", lines: 2, cartons: 5, kg: 8, priority: "Standard", status: "Delivered", created: "Jul 8", sla: "Jul 11", awb: "AWB-7712141", contact: "Store Manager", phone: "+91 98660 49052", ref: "PO-8724", items: "APX-1102 — 14 boxes" },
  { id: "SO-3785", channel: "B2B", dest: "Citizens Specialty Hospital, Nallagandla", lines: 4, cartons: 23, kg: 52, priority: "Express", status: "Delivered", created: "Jul 8", sla: "Jul 10", awb: "AWB-7712130", contact: "Sanjay Gupta", phone: "+91 98490 17693", ref: "PO-8721", items: "APX-9903 — 130 vials" },
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
  const [createOpen, setCreateOpen] = useState(false)
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
    setCreateOpen(false)
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
        <button type="button" onClick={() => { setForm(emptyForm); setErrors({}); setCreateOpen(true) }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E3A5F] dark:bg-brand text-white text-sm font-medium hover:opacity-90 transition-opacity">
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

      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="New Ship-Out Request"
        description="Outbound dispatch request to the warehouse"
        size="lg"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createOrder} submitLabel="Submit Order" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map(f => (
            <Field key={f.key} label={f.label} required={f.required} error={errors[f.key]}>
              <TextInput value={form[f.key]} invalid={!!errors[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} />
            </Field>
          ))}
        </div>
        <div className="mt-4">
          <Field label="Items to dispatch (SKU — Qty)" required error={errors.items}>
            <TextArea rows={3} value={form.items} invalid={!!errors.items} onChange={e => set("items", e.target.value)} placeholder={"APX-7712 — 200 units\nAPX-4421 — 50 units"} />
          </Field>
        </div>
      </Modal>

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
