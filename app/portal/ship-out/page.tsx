"use client"

import { useState } from "react"
import { Truck, Plus, Search, Package, Clock, CheckCircle2, ChevronRight, ChevronLeft, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

// Apex Pharma Ltd's own on-hand stock — Ship-Out Items step only allows picking from this list,
// matching the "own stock only" rule (a client can never dispatch inventory it doesn't hold).
const OWN_STOCK = [
  { sku: "APX-7712", desc: "Paracetamol 500mg Tablets", onHand: 4800, uom: "Units" },
  { sku: "APX-4421", desc: "Syringes 5ml Disposable", onHand: 2200, uom: "Units" },
  { sku: "APX-2209", desc: "IV Drip Set Standard", onHand: 850, uom: "Sets" },
  { sku: "APX-7790", desc: "Amoxicillin 250mg Capsules", onHand: 48, uom: "Units" },
  { sku: "APX-1102", desc: "Nitrile Gloves Large (Box)", onHand: 320, uom: "Boxes" },
  { sku: "APX-0091", desc: "Isopropyl Alcohol Swabs", onHand: 6500, uom: "Pcs" },
  { sku: "APX-3301", desc: "Insulin Glargine 100U/mL", onHand: 240, uom: "Vials" },
  { sku: "APX-6601", desc: "Glucose Saline 500mL Bags", onHand: 1800, uom: "Bags" },
  { sku: "APX-6610", desc: "Normal Saline 1000mL Bags", onHand: 420, uom: "Bags" },
] as const

const STEPS = ["Items", "Ship-To", "Service & Mode", "Review"] as const

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

const emptyForm = { dest: "", contact: "", phone: "", date: "", priority: "", channel: "", ref: "" }
const emptyQty: Record<string, string> = {}

export default function PortalShipOutPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [tab, setTab] = useState("All Orders")
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(emptyForm)
  const [qty, setQty] = useState<Record<string, string>>(emptyQty)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [detail, setDetail] = useState<Order | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null)

  const selectedLines = OWN_STOCK.filter(s => Number(qty[s.sku]) > 0)
    .map(s => ({ ...s, qty: Number(qty[s.sku]) }))

  const filtered = orders.filter(o => {
    const matchTab = tab === "All Orders" || o.status === tab || (tab === "Processing" && (o.status === "Picking" || o.status === "Packing"))
    const matchSearch = !search || o.id.toLowerCase().includes(search.toLowerCase()) || o.dest.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  function set(key: keyof typeof emptyForm, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function validateStep(s: number) {
    const e: Record<string, string> = {}
    if (s === 0) {
      if (selectedLines.length === 0) e.items = "Select at least one SKU from your own stock and enter a quantity"
      for (const line of selectedLines) {
        if (line.qty > line.onHand) e.items = `${line.sku}: only ${line.onHand} ${line.uom} on hand — reduce the quantity`
      }
    }
    if (s === 1) {
      if (!form.dest.trim()) e.dest = "Delivery address is required"
      if (!form.contact.trim()) e.contact = "Contact person is required"
      if (!form.phone.trim()) e.phone = "Contact phone is required"
      else if (form.phone.replace(/\D/g, "").length < 10) e.phone = "Enter a valid phone number"
      if (!form.date.trim()) e.date = "Requested delivery date is required"
      else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date.trim())) e.date = "Use the format YYYY-MM-DD"
    }
    if (s === 2) {
      if (!form.priority) e.priority = "Priority is required"
      if (!form.channel) e.channel = "Dispatch mode is required"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function goNext() {
    if (!validateStep(step)) return
    setStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  function goBack() {
    setErrors({})
    setStep(s => Math.max(s - 1, 0))
  }

  function createOrder() {
    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) return
    const max = orders.reduce((m, o) => Math.max(m, Number(o.id.replace("SO-", "")) || 0), 3841)
    const lines = selectedLines.length
    const priority = form.priority as "Standard" | "Express"
    const slaDate = new Date(form.date.trim())
    const next: Order = {
      id: `SO-${max + 1}`,
      channel: form.channel,
      dest: form.dest.trim(),
      lines,
      cartons: selectedLines.reduce((s, l) => s + Math.max(1, Math.ceil(l.qty / 20)), 0),
      kg: lines * 9,
      priority,
      status: "Pending",
      created: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      sla: isNaN(slaDate.getTime()) ? form.date.trim() : slaDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      awb: "-",
      contact: form.contact.trim(),
      phone: form.phone.trim(),
      ref: form.ref.trim() || "-",
      items: selectedLines.map(l => `${l.sku} — ${l.qty} ${l.uom}`).join("\n"),
    }
    setOrders(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setQty(emptyQty)
    setStep(0)
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

  return (
    <div className="p-4 sm:p-6 space-y-5 w-full">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-[#1E3A5F] dark:text-foreground">Ship-Out Orders</h1>
          <p className="text-sm text-muted-foreground">Place and track outbound dispatch requests</p>
        </div>
        <button type="button" onClick={() => { setForm(emptyForm); setQty(emptyQty); setStep(0); setErrors({}); setCreateOpen(true) }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E3A5F] dark:bg-brand text-white text-sm font-medium hover:opacity-90 transition-opacity">
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
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setQty(emptyQty); setStep(0); setErrors({}) } }}
        title="New Ship-Out Request"
        description="Outbound dispatch request to the warehouse"
        size="lg"
        footer={
          <div className="flex w-full items-center justify-between gap-3">
            <button
              type="button"
              onClick={step === 0 ? () => setCreateOpen(false) : goBack}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {step === 0 ? "Cancel" : (<span className="flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Back</span>)}
            </button>
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={goNext} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
                Next
              </button>
            ) : (
              <button type="button" onClick={createOrder} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
                Submit Order
              </button>
            )}
          </div>
        }
      >
        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-5">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors",
                  i < step ? "bg-brand text-white" : i === step ? "bg-brand/15 text-brand border-2 border-brand" : "bg-muted text-muted-foreground"
                )}>
                  {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={cn("text-xs font-medium whitespace-nowrap", i === step ? "text-foreground" : "text-muted-foreground")}>{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={cn("h-px flex-1 mx-2", i < step ? "bg-brand" : "bg-border")} />}
            </div>
          ))}
        </div>

        {/* Step 1 — Items (own stock only) */}
        {step === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-2">Select SKUs from your own on-hand stock. You can only dispatch inventory you currently hold.</p>
            {OWN_STOCK.map(item => {
              const checked = Number(qty[item.sku]) > 0
              return (
                <div key={item.sku} className={cn("flex items-center gap-3 p-2.5 rounded-lg border transition-colors", checked ? "border-brand/40 bg-brand/5" : "border-border")}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={e => setQty(prev => ({ ...prev, [item.sku]: e.target.checked ? "1" : "" }))}
                    className="w-4 h-4 accent-brand shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{item.desc}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{item.sku} · {item.onHand} {item.uom} on hand</p>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={item.onHand}
                    disabled={!checked}
                    value={qty[item.sku] || ""}
                    onChange={e => setQty(prev => ({ ...prev, [item.sku]: e.target.value }))}
                    className="w-20 px-2 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground text-right disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
              )
            })}
            {errors.items && <p className="text-xs text-danger mt-1">{errors.items}</p>}
          </div>
        )}

        {/* Step 2 — Ship-To */}
        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Delivery Address" required error={errors.dest}>
              <TextInput value={form.dest} invalid={!!errors.dest} onChange={e => set("dest", e.target.value)} placeholder="Hospital / store name & city" />
            </Field>
            <Field label="Requested Delivery Date" required error={errors.date}>
              <TextInput value={form.date} invalid={!!errors.date} onChange={e => set("date", e.target.value)} placeholder="YYYY-MM-DD" />
            </Field>
            <Field label="Contact Person" required error={errors.contact}>
              <TextInput value={form.contact} invalid={!!errors.contact} onChange={e => set("contact", e.target.value)} placeholder="Receiving contact" />
            </Field>
            <Field label="Contact Phone" required error={errors.phone}>
              <TextInput value={form.phone} invalid={!!errors.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 XXXXX XXXXX" />
            </Field>
            <Field label="Reference / PO No.">
              <TextInput value={form.ref} onChange={e => set("ref", e.target.value)} placeholder="e.g. PO-8822" />
            </Field>
          </div>
        )}

        {/* Step 3 — Service & dispatch mode */}
        {step === 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Priority" required error={errors.priority}>
              <Select value={form.priority} invalid={!!errors.priority} onChange={e => set("priority", e.target.value)} options={["Standard", "Express"]} placeholder="Select priority" />
            </Field>
            <Field label="Dispatch Channel" required error={errors.channel}>
              <Select value={form.channel} invalid={!!errors.channel} onChange={e => set("channel", e.target.value)} options={["B2B", "B2C"]} placeholder="Select channel" />
            </Field>
          </div>
        )}

        {/* Step 4 — Review & submit */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Items</p>
              <div className="rounded-lg border border-border divide-y divide-border">
                {selectedLines.map(l => (
                  <div key={l.sku} className="flex items-center justify-between px-3 py-1.5 text-sm">
                    <span className="text-foreground">{l.desc}</span>
                    <span className="font-mono text-muted-foreground">{l.qty} {l.uom}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Ship-To</p>
              <div className="space-y-1">
                <DetailRow label="Address" value={form.dest} />
                <DetailRow label="Contact" value={`${form.contact} · ${form.phone}`} />
                <DetailRow label="Requested Date" value={form.date} />
                {form.ref && <DetailRow label="Reference" value={form.ref} />}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Service & Mode</p>
              <div className="space-y-1">
                <DetailRow label="Priority" value={form.priority} />
                <DetailRow label="Channel" value={form.channel} />
              </div>
            </div>
          </div>
        )}
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
