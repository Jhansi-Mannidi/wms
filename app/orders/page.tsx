"use client"

import { useState } from "react"
import {
  ShoppingCart, Clock, Package, Truck, AlertTriangle, Upload, Waves,
  Plus, ChevronDown, Filter, Calendar, Eye, MoreHorizontal, FileText,
  ChevronRight, XCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Order = {
  id: string; created: string; channel: string; customer: string; client: string
  items: number; qty: number; value: string; priority: string; status: string
}

type Wave = { id: string; zone: string; orders: number; picker: string; created: string }

const initialOrders: Order[] = [
  { id: "ORD-2024-156", created: "2024-12-16 08:12", channel: "B2B", customer: "Raj Traders", client: "Acme Foods", items: 3, qty: 45, value: "₹12,450", priority: "High", status: "Pending Allocation" },
  { id: "ORD-2024-155", created: "2024-12-16 07:45", channel: "B2C", customer: "Online Store", client: "Global Oils", items: 1, qty: 10, value: "₹3,200", priority: "Normal", status: "In Picking" },
  { id: "ORD-2024-154", created: "2024-12-16 07:30", channel: "B2B", customer: "Metro Mart", client: "Agro Corp", items: 8, qty: 240, value: "₹56,000", priority: "Urgent", status: "Ready to Ship" },
  { id: "ORD-2024-153", created: "2024-12-16 06:55", channel: "B2C", customer: "Quick Kart", client: "Sweet Mills", items: 2, qty: 20, value: "₹5,600", priority: "Normal", status: "Packed" },
  { id: "ORD-2024-152", created: "2024-12-15 22:10", channel: "B2B", customer: "City Supplies", client: "Salt Works", items: 5, qty: 80, value: "₹22,000", priority: "High", status: "In Picking" },
  { id: "ORD-2024-151", created: "2024-12-15 21:30", channel: "B2B", customer: "Star Foods", client: "Fresh Farms", items: 4, qty: 60, value: "₹18,400", priority: "Normal", status: "Ready to Pick" },
  { id: "ORD-2024-150", created: "2024-12-15 19:00", channel: "B2C", customer: "Shopper Hub", client: "Tropical Co", items: 1, qty: 5, value: "₹1,800", priority: "Normal", status: "SLA Breached" },
  { id: "ORD-2024-149", created: "2024-12-15 16:45", channel: "B2B", customer: "Prime Retail", client: "Acme Foods", items: 6, qty: 120, value: "₹38,000", priority: "Urgent", status: "SLA Breached" },
]

const statusConfig: Record<string, { color: string; bg: string }> = {
  "Pending Allocation": { color: "text-warning", bg: "bg-warning/15" },
  "Ready to Pick": { color: "text-brand", bg: "bg-brand/15" },
  "In Picking": { color: "text-brand", bg: "bg-brand/15" },
  "Packed": { color: "text-purple-400", bg: "bg-purple-400/15" },
  "Ready to Ship": { color: "text-success", bg: "bg-success/15" },
  "Shipped": { color: "text-success", bg: "bg-success/15" },
  "SLA Breached": { color: "text-danger", bg: "bg-danger/15" },
  "Cancelled": { color: "text-muted-foreground", bg: "bg-muted" },
}

const priorityColors: Record<string, string> = {
  Urgent: "text-danger",
  High: "text-warning",
  Normal: "text-muted-foreground",
}

/** Forward status chain used by the row "advance" action. */
const FLOW = ["Pending Allocation", "Ready to Pick", "In Picking", "Packed", "Ready to Ship", "Shipped"]

const CHANNELS = ["B2B", "B2C", "Marketplace"] as const
const PRIORITIES = ["Urgent", "High", "Normal"] as const
const CLIENTS = ["Acme Foods", "Global Oils", "Agro Corp", "Sweet Mills", "Salt Works", "Fresh Farms", "Tropical Co"] as const
const ZONES = ["Zone A", "Zone B", "Zone C", "Zone D", "All Zones"] as const
const PICKERS = ["Ravi Kumar", "Priya Sharma", "Suresh Yadav", "Meena Patel", "Arjun Nair"] as const

/** Files offered by the simulated file browser in the Bulk Import modal. */
const SAMPLE_FILES = ["orders_bulk_20241216.csv", "marketplace_dump_20241215.csv", "b2b_weekly_batch.csv"] as const

/** Rows a simulated parse yields, keyed by file name. */
const PARSED_ROWS: Record<string, Omit<Order, "id" | "created">[]> = {
  "orders_bulk_20241216.csv": [
    { channel: "B2B", customer: "Nova Retail", client: "Acme Foods", items: 4, qty: 90, value: "₹24,300", priority: "High", status: "Pending Allocation" },
    { channel: "B2C", customer: "Cart Express", client: "Sweet Mills", items: 2, qty: 16, value: "₹4,150", priority: "Normal", status: "Pending Allocation" },
    { channel: "B2B", customer: "Bharat Stores", client: "Salt Works", items: 7, qty: 210, value: "₹47,800", priority: "Urgent", status: "Pending Allocation" },
  ],
  "marketplace_dump_20241215.csv": [
    { channel: "Marketplace", customer: "Shopline", client: "Tropical Co", items: 1, qty: 8, value: "₹2,900", priority: "Normal", status: "Pending Allocation" },
    { channel: "Marketplace", customer: "BuyNow", client: "Fresh Farms", items: 3, qty: 34, value: "₹9,600", priority: "Normal", status: "Pending Allocation" },
  ],
  "b2b_weekly_batch.csv": [
    { channel: "B2B", customer: "Unity Wholesale", client: "Agro Corp", items: 9, qty: 320, value: "₹71,200", priority: "High", status: "Pending Allocation" },
    { channel: "B2B", customer: "Delta Distributors", client: "Global Oils", items: 5, qty: 140, value: "₹33,450", priority: "Normal", status: "Pending Allocation" },
    { channel: "B2B", customer: "Sunrise Mart", client: "Acme Foods", items: 2, qty: 24, value: "₹6,700", priority: "Normal", status: "Pending Allocation" },
    { channel: "B2B", customer: "Kaveri Traders", client: "Salt Works", items: 6, qty: 175, value: "₹40,100", priority: "High", status: "Pending Allocation" },
  ],
}

const PAGE_SIZE = 5

const emptyOrder = { customer: "", client: "", channel: "", items: "", qty: "", value: "", priority: "" }
const emptyWave = { zone: "", picker: "", limit: "" }

function stamp() {
  const d = new Date()
  return `${d.toISOString().slice(0, 10)} ${d.toTimeString().slice(0, 5)}`
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [waves, setWaves] = useState<Wave[]>([])

  const [statusFilter, setStatusFilter] = useState("All Status")
  const [channelFilter, setChannelFilter] = useState("All Channels")
  const [priorityFilter, setPriorityFilter] = useState("All Priority")
  const [clientFilter, setClientFilter] = useState("All Clients")
  const [minQty, setMinQty] = useState("")
  const [search, setSearch] = useState("")
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const [page, setPage] = useState(1)

  // date range
  const [dateOpen, setDateOpen] = useState(false)
  const [range, setRange] = useState({ from: "", to: "" })
  const [rangeDraft, setRangeDraft] = useState({ from: "", to: "" })
  const [rangeError, setRangeError] = useState("")

  // create order
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyOrder)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // bulk import
  const [importOpen, setImportOpen] = useState(false)
  const [pickedFile, setPickedFile] = useState("")
  const [parsed, setParsed] = useState<{ file: string; total: number; valid: number; errors: number } | null>(null)
  const [importError, setImportError] = useState("")

  // create wave
  const [waveOpen, setWaveOpen] = useState(false)
  const [waveForm, setWaveForm] = useState(emptyWave)
  const [waveErrors, setWaveErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Order | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null)

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase()
    const day = o.created.slice(0, 10)
    return (
      (o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.client.toLowerCase().includes(q)) &&
      (statusFilter === "All Status" || o.status === statusFilter) &&
      (channelFilter === "All Channels" || o.channel === channelFilter) &&
      (priorityFilter === "All Priority" || o.priority === priorityFilter) &&
      (clientFilter === "All Clients" || o.client === clientFilter) &&
      (!minQty || o.qty >= Number(minQty)) &&
      (!range.from || day >= range.from) &&
      (!range.to || day <= range.to)
    )
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const count = (s: string) => orders.filter((o) => o.status === s).length
  const stats = [
    { label: "Today's Orders", value: orders.length, sub: `${filtered.length} matching filters`, icon: <ShoppingCart className="w-5 h-5" />, subColor: "text-success" },
    { label: "Pending Allocation", value: count("Pending Allocation"), sub: "Needs attention", icon: <Clock className="w-5 h-5" />, subColor: "text-warning" },
    { label: "In Picking", value: count("In Picking"), sub: "Active picks", icon: <Package className="w-5 h-5" />, subColor: "text-muted-foreground" },
    { label: "Ready to Ship", value: count("Ready to Ship"), sub: "Awaiting dispatch", icon: <Truck className="w-5 h-5" />, subColor: "text-muted-foreground" },
    { label: "SLA Breached", value: count("SLA Breached"), sub: "Critical — Action needed", icon: <AlertTriangle className="w-5 h-5" />, subColor: "text-danger" },
  ]

  function nextId(offset = 0) {
    const nums = orders.map((o) => Number(o.id.split("-")[2])).filter((n) => !Number.isNaN(n))
    return `ORD-2024-${Math.max(156, ...nums) + 1 + offset}`
  }

  function validateOrder() {
    const e: Record<string, string> = {}
    if (!form.customer.trim()) e.customer = "Customer is required"
    if (!form.client) e.client = "Select a client"
    if (!form.channel) e.channel = "Select a channel"
    if (!form.items.trim()) e.items = "Line items is required"
    else if (!/^\d+$/.test(form.items) || Number(form.items) < 1) e.items = "Enter a positive whole number"
    if (!form.qty.trim()) e.qty = "Quantity is required"
    else if (!/^\d+$/.test(form.qty) || Number(form.qty) < 1) e.qty = "Enter a positive whole number"
    if (!form.value.trim()) e.value = "Order value is required"
    else if (!/^\d+$/.test(form.value.replace(/,/g, ""))) e.value = "Enter a number in rupees"
    if (!form.priority) e.priority = "Select a priority"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createOrder() {
    if (!validateOrder()) {
      notify.error("Check the form", "Some required fields need your attention.")
      return
    }
    const next: Order = {
      id: nextId(),
      created: stamp(),
      channel: form.channel,
      customer: form.customer.trim(),
      client: form.client,
      items: Number(form.items),
      qty: Number(form.qty),
      value: `₹${Number(form.value.replace(/,/g, "")).toLocaleString("en-IN")}`,
      priority: form.priority,
      status: "Pending Allocation",
    }
    setOrders((prev) => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyOrder)
    setErrors({})
    setPage(1)
    notify.success("Order created", `${next.id} for ${next.customer} — ${next.qty} units.`)
  }

  function browseFile() {
    const nextFile = SAMPLE_FILES[Math.floor(Math.random() * SAMPLE_FILES.length)]
    setPickedFile(nextFile)
    setParsed(null)
    setImportError("")
    notify.info("File selected", nextFile)
  }

  function parseFile() {
    if (!pickedFile) {
      setImportError("Choose a file before parsing")
      return
    }
    const rows = PARSED_ROWS[pickedFile] ?? []
    // Simulated parser: one malformed row per file that we skip.
    setParsed({ file: pickedFile, total: rows.length + 1, valid: rows.length, errors: 1 })
    setImportError("")
    notify.info("File parsed", `${rows.length} valid rows, 1 row skipped.`)
  }

  function commitImport() {
    if (!parsed) {
      setImportError("Parse the file before importing")
      return
    }
    const rows = PARSED_ROWS[parsed.file] ?? []
    const created = rows.map((r, i) => ({ ...r, id: nextId(i), created: stamp() }))
    setOrders((prev) => [...created, ...prev])
    setImportOpen(false)
    setPickedFile("")
    setParsed(null)
    setPage(1)
    notify.success("Import complete", `${created.length} orders added from ${parsed.file}.`)
  }

  function validateWave() {
    const e: Record<string, string> = {}
    if (!waveForm.zone) e.zone = "Select a zone"
    if (!waveForm.picker) e.picker = "Assign a picker"
    if (!waveForm.limit.trim()) e.limit = "Max orders is required"
    else if (!/^\d+$/.test(waveForm.limit) || Number(waveForm.limit) < 1) e.limit = "Enter a positive whole number"
    setWaveErrors(e)
    return Object.keys(e).length === 0
  }

  function createWave() {
    if (!validateWave()) {
      notify.error("Check the form", "Some required fields need your attention.")
      return
    }
    const eligible = orders
      .filter((o) => o.status === "Pending Allocation" || o.status === "Ready to Pick")
      .slice(0, Number(waveForm.limit))
    if (eligible.length === 0) {
      notify.warning("No eligible orders", "Nothing is pending allocation or ready to pick right now.")
      return
    }
    const ids = new Set(eligible.map((o) => o.id))
    setOrders((prev) => prev.map((o) => (ids.has(o.id) ? { ...o, status: "In Picking" } : o)))
    const wave: Wave = {
      id: `WAVE-${String(waves.length + 1).padStart(3, "0")}`,
      zone: waveForm.zone,
      orders: eligible.length,
      picker: waveForm.picker,
      created: stamp(),
    }
    setWaves((prev) => [wave, ...prev])
    setWaveOpen(false)
    setWaveForm(emptyWave)
    setWaveErrors({})
    notify.success("Wave created", `${wave.id} released ${wave.orders} orders to ${wave.picker}.`)
  }

  function advance(o: Order) {
    const i = FLOW.indexOf(o.status)
    const next = i === -1 ? "Ready to Pick" : FLOW[Math.min(i + 1, FLOW.length - 1)]
    if (next === o.status) {
      notify.info("Already final", `${o.id} is already ${o.status}.`)
      return
    }
    setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, status: next } : x)))
    notify.success("Status updated", `${o.id} moved to ${next}.`)
  }

  function escalate(o: Order) {
    setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, priority: "Urgent" } : x)))
    notify.warning("Order escalated", `${o.id} is now Urgent priority.`)
  }

  function cancelOrder(o: Order) {
    setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, status: "Cancelled" } : x)))
    notify.warning("Order cancelled", `${o.id} has been cancelled.`)
  }

  function applyRange() {
    if (rangeDraft.from && rangeDraft.to && rangeDraft.from > rangeDraft.to) {
      setRangeError("Start date must be on or before the end date")
      return
    }
    setRange(rangeDraft)
    setRangeError("")
    setDateOpen(false)
    setPage(1)
    notify.info("Date range applied", rangeDraft.from || rangeDraft.to ? `${rangeDraft.from || "any"} → ${rangeDraft.to || "any"}` : "Range cleared.")
  }

  const rangeLabel = range.from || range.to ? `${range.from || "…"} → ${range.to || "…"}` : "Date Range"

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Order Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track and process customer orders</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setImportOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors">
            <Upload className="w-4 h-4" /> Bulk Import
          </button>
          <button onClick={() => setWaveOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors">
            <Waves className="w-4 h-4" /> Create Wave
          </button>
          <ExportButton data={filtered} filename="orders" />
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
            <Plus className="w-4 h-4" /> New Order
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="p-4 rounded-2xl border border-border bg-card">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs text-muted-foreground leading-tight">{s.label}</span>
              <span className={cn(i === 4 ? "text-danger" : "text-brand")}>{s.icon}</span>
            </div>
            <p className={cn("text-2xl font-bold", i === 4 ? "text-danger" : "text-foreground")}>{s.value}</p>
            <p className={cn("text-xs mt-1", s.subColor)}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Released waves */}
      {waves.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {waves.map((w) => (
            <div key={w.id} className="p-4 rounded-2xl border border-border bg-card">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-brand">{w.id}</span>
                <span className="text-xs text-muted-foreground">{w.created}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{w.orders} orders · {w.zone} · {w.picker}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-lg border border-border bg-background">
            <svg className="w-4 h-4 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground" placeholder="Order ID, Customer, SKU..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
          </div>
          {[
            { value: statusFilter, options: ["All Status", "Pending Allocation", "Ready to Pick", "In Picking", "Packed", "Ready to Ship", "Shipped", "SLA Breached", "Cancelled"], onChange: setStatusFilter },
            { value: channelFilter, options: ["All Channels", "B2B", "B2C", "Marketplace"], onChange: setChannelFilter },
            { value: priorityFilter, options: ["All Priority", "Urgent", "High", "Normal"], onChange: setPriorityFilter },
          ].map((f, i) => (
            <div key={i} className="relative">
              <select className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none cursor-pointer" value={f.value} onChange={(e) => { f.onChange(e.target.value); setPage(1) }}>
                {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          ))}
          <button
            onClick={() => { setRangeDraft(range); setRangeError(""); setDateOpen(true) }}
            title="Set created-date range"
            className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background text-sm transition-colors", range.from || range.to ? "text-brand border-brand/40" : "text-muted-foreground hover:text-foreground")}
          >
            <Calendar className="w-4 h-4" /> {rangeLabel}
          </button>
        </div>
        <button onClick={() => setShowMoreFilters(!showMoreFilters)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <Filter className="w-3.5 h-3.5" />
          {showMoreFilters ? "Hide" : "More"} Filters
        </button>
        {showMoreFilters && (
          <div className="flex flex-wrap gap-3 pt-3 border-t border-border">
            <div className="relative">
              <select className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none cursor-pointer" value={clientFilter} onChange={(e) => { setClientFilter(e.target.value); setPage(1) }}>
                {["All Clients", ...CLIENTS].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <input
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none placeholder:text-muted-foreground"
              placeholder="Min qty"
              inputMode="numeric"
              value={minQty}
              onChange={(e) => { setMinQty(e.target.value.replace(/\D/g, "")); setPage(1) }}
            />
            <button
              onClick={() => {
                setStatusFilter("All Status"); setChannelFilter("All Channels"); setPriorityFilter("All Priority")
                setClientFilter("All Clients"); setMinQty(""); setSearch(""); setRange({ from: "", to: "" }); setPage(1)
                notify.info("Filters reset", "Showing all orders.")
              }}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Order ID", "Created", "Channel", "Customer", "Client", "Items", "Qty", "Value", "Priority", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((order, i) => (
                <tr key={order.id} className={cn("border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors", i % 2 === 1 ? "bg-muted/10" : "")}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button onClick={() => setDetail(order)} title="Open order detail" className="text-brand font-medium hover:underline cursor-pointer">{order.id}</button>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{order.created}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-brand/10 text-brand">{order.channel}</span>
                  </td>
                  <td className="px-4 py-3 text-foreground font-medium whitespace-nowrap">{order.customer}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{order.client}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{order.items}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{order.qty}</td>
                  <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{order.value}</td>
                  <td className={cn("px-4 py-3 whitespace-nowrap text-xs font-semibold", priorityColors[order.priority])}>
                    {order.priority}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusConfig[order.status]?.bg, statusConfig[order.status]?.color)}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <RowActions
                      items={[
                        { label: "View details", icon: <Eye />, onSelect: () => setDetail(order) },
                        { label: "Advance status", icon: <ChevronRight />, onSelect: () => advance(order), tone: "success" as const },
                        { label: "Escalate to Urgent", icon: <AlertTriangle />, onSelect: () => escalate(order) },
                        { label: "Cancel order", icon: <XCircle />, onSelect: () => setCancelTarget(order), tone: "danger" as const },
                      ]}
                    />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={11} className="px-4 py-16 text-center text-sm text-muted-foreground">
                  <ShoppingCart className="w-10 h-10 mb-3 opacity-40 mx-auto" />
                  <span className="font-medium">No orders found</span>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
          <span className="text-xs text-muted-foreground">Showing {paged.length} of {filtered.length} filtered · {orders.length} total</span>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} title={`Go to page ${p}`} className={cn("w-7 h-7 rounded-lg text-xs transition-colors", p === safePage ? "bg-brand text-white" : "text-muted-foreground hover:bg-muted")}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      {/* New order */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyOrder); setErrors({}) } }}
        title="New Order"
        description="Create a customer order in Pending Allocation"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createOrder} submitLabel="Create Order" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Customer" required error={errors.customer}>
            <TextInput value={form.customer} invalid={!!errors.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} placeholder="e.g. Raj Traders" />
          </Field>
          <Field label="Client" required error={errors.client}>
            <Select value={form.client} invalid={!!errors.client} onChange={(e) => setForm({ ...form, client: e.target.value })} options={CLIENTS} placeholder="Select Client" />
          </Field>
          <Field label="Channel" required error={errors.channel}>
            <Select value={form.channel} invalid={!!errors.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} options={CHANNELS} placeholder="Select Channel" />
          </Field>
          <Field label="Priority" required error={errors.priority}>
            <Select value={form.priority} invalid={!!errors.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} options={PRIORITIES} placeholder="Select Priority" />
          </Field>
          <Field label="Line Items" required error={errors.items}>
            <TextInput value={form.items} invalid={!!errors.items} onChange={(e) => setForm({ ...form, items: e.target.value })} placeholder="e.g. 3" inputMode="numeric" />
          </Field>
          <Field label="Total Quantity" required error={errors.qty}>
            <TextInput value={form.qty} invalid={!!errors.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} placeholder="e.g. 45" inputMode="numeric" />
          </Field>
          <Field label="Order Value (₹)" required error={errors.value}>
            <TextInput value={form.value} invalid={!!errors.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="e.g. 12450" inputMode="numeric" />
          </Field>
        </div>
      </Modal>

      {/* Bulk import */}
      <Modal
        open={importOpen}
        onOpenChange={(o) => { setImportOpen(o); if (!o) { setPickedFile(""); setParsed(null); setImportError("") } }}
        title="Bulk Import Orders"
        description="Select a CSV, review the parse summary, then import"
        footer={<ModalActions onCancel={() => setImportOpen(false)} onSubmit={parsed ? commitImport : parseFile} submitLabel={parsed ? `Import ${parsed.valid} Orders` : "Parse File"} disabled={!pickedFile} />}
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">{pickedFile || "No file selected"}</p>
            <p className="text-xs text-muted-foreground mt-1">CSV up to 10 MB · max 5,000 rows</p>
            <button onClick={browseFile} className="mt-3 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
              {pickedFile ? "Choose Another File" : "Browse File"}
            </button>
          </div>
          <Field label="Or pick from recent uploads" error={importError}>
            <Select value={pickedFile} invalid={!!importError} onChange={(e) => { setPickedFile(e.target.value); setParsed(null); setImportError("") }} options={SAMPLE_FILES} placeholder="Select a file" />
          </Field>
          {parsed && (
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2"><FileText className="w-4 h-4 text-brand" />{parsed.file}</p>
              <DetailRow label="Rows read" value={parsed.total} />
              <DetailRow label="Valid rows" value={<span className="text-success font-semibold">{parsed.valid}</span>} />
              <DetailRow label="Skipped (validation errors)" value={<span className="text-danger font-semibold">{parsed.errors}</span>} />
            </div>
          )}
        </div>
      </Modal>

      {/* Create wave */}
      <Modal
        open={waveOpen}
        onOpenChange={(o) => { setWaveOpen(o); if (!o) { setWaveForm(emptyWave); setWaveErrors({}) } }}
        title="Create Pick Wave"
        description="Release pending orders to a picker as one wave"
        footer={<ModalActions onCancel={() => setWaveOpen(false)} onSubmit={createWave} submitLabel="Release Wave" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Zone" required error={waveErrors.zone}>
            <Select value={waveForm.zone} invalid={!!waveErrors.zone} onChange={(e) => setWaveForm({ ...waveForm, zone: e.target.value })} options={ZONES} placeholder="Select Zone" />
          </Field>
          <Field label="Assign Picker" required error={waveErrors.picker}>
            <Select value={waveForm.picker} invalid={!!waveErrors.picker} onChange={(e) => setWaveForm({ ...waveForm, picker: e.target.value })} options={PICKERS} placeholder="Select Picker" />
          </Field>
          <Field label="Max Orders" required error={waveErrors.limit} hint={`${orders.filter((o) => o.status === "Pending Allocation" || o.status === "Ready to Pick").length} orders are eligible`}>
            <TextInput value={waveForm.limit} invalid={!!waveErrors.limit} onChange={(e) => setWaveForm({ ...waveForm, limit: e.target.value })} placeholder="e.g. 5" inputMode="numeric" />
          </Field>
        </div>
      </Modal>

      {/* Date range */}
      <Modal
        open={dateOpen}
        onOpenChange={setDateOpen}
        title="Filter by Created Date"
        description="Leave a field blank for an open-ended range"
        size="sm"
        footer={<ModalActions onCancel={() => setDateOpen(false)} onSubmit={applyRange} submitLabel="Apply Range" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="From" error={rangeError}>
            <TextInput type="date" value={rangeDraft.from} invalid={!!rangeError} onChange={(e) => setRangeDraft({ ...rangeDraft, from: e.target.value })} />
          </Field>
          <Field label="To">
            <TextInput type="date" value={rangeDraft.to} onChange={(e) => setRangeDraft({ ...rangeDraft, to: e.target.value })} />
          </Field>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Order detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Order ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Created" value={detail.created} />
            <DetailRow label="Channel" value={detail.channel} />
            <DetailRow label="Customer" value={detail.customer} />
            <DetailRow label="Client" value={detail.client} />
            <DetailRow label="Line Items" value={detail.items} />
            <DetailRow label="Quantity" value={`${detail.qty} units`} />
            <DetailRow label="Order Value" value={detail.value} />
            <DetailRow label="Priority" value={<span className={cn("text-xs font-semibold", priorityColors[detail.priority])}>{detail.priority}</span>} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusConfig[detail.status]?.bg, statusConfig[detail.status]?.color)}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Cancel confirmation */}
      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(o) => !o && setCancelTarget(null)}
        title="Cancel this order?"
        message={`Order ${cancelTarget?.id} for ${cancelTarget?.customer} will be cancelled. This cannot be undone.`}
        confirmLabel="Cancel Order"
        cancelLabel="Keep It"
        onConfirm={() => cancelTarget && cancelOrder(cancelTarget)}
      />
    </div>
  )
}
