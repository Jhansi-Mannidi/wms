"use client"

import { useState } from "react"
import { SlidersHorizontal, Plus, Package, Layers, DollarSign, AlertTriangle, ChevronDown, X, ArrowUpDown, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type StockItem = {
  sku: string; name: string; owner: string; zone: string
  available: number; reserved: number; batch: string
  expiry: string; lastMoved: string; status: string
}

const initialStock: StockItem[] = [
  { sku: "SKU-001234", name: "Premium Basmati Rice 5kg", owner: "Acme Foods", zone: "A-12-03", available: 1250, reserved: 50, batch: "BAT-2024-1201", expiry: "2025-06-15", lastMoved: "2 hours ago", status: "In Stock" },
  { sku: "SKU-001235", name: "Organic Wheat Flour 10kg", owner: "Acme Foods", zone: "A-12-04", available: 45, reserved: 10, batch: "BAT-2024-1198", expiry: "2025-03-20", lastMoved: "5 hours ago", status: "Low Stock" },
  { sku: "SKU-001236", name: "Refined Sunflower Oil 5L", owner: "Global Oils", zone: "B-05-01", available: 8, reserved: 5, batch: "BAT-2024-1150", expiry: "2025-01-10", lastMoved: "1 day ago", status: "Critical" },
  { sku: "SKU-001237", name: "Chickpea Lentils 25kg", owner: "Agro Corp", zone: "C-03-07", available: 320, reserved: 0, batch: "BAT-2024-1180", expiry: "2026-08-01", lastMoved: "3 hours ago", status: "In Stock" },
  { sku: "SKU-001238", name: "Brown Sugar 10kg", owner: "Sweet Mills", zone: "B-08-02", available: 0, reserved: 0, batch: "BAT-2024-1100", expiry: "2025-12-31", lastMoved: "2 days ago", status: "Out of Stock" },
  { sku: "SKU-001239", name: "Iodized Salt 1kg", owner: "Salt Works", zone: "A-04-11", available: 2800, reserved: 200, batch: "BAT-2024-1205", expiry: "2027-01-01", lastMoved: "1 hour ago", status: "In Stock" },
  { sku: "SKU-001240", name: "Tomato Puree 400g", owner: "Fresh Farms", zone: "D-01-05", available: 156, reserved: 30, batch: "BAT-2024-1190", expiry: "2025-05-10", lastMoved: "6 hours ago", status: "In Stock" },
  { sku: "SKU-001241", name: "Coconut Milk 400ml", owner: "Tropical Co", zone: "D-02-03", available: 62, reserved: 15, batch: "BAT-2024-1175", expiry: "2025-04-30", lastMoved: "4 hours ago", status: "Low Stock" },
  { sku: "SKU-001242", name: "Green Cardamom 500g", owner: "Agro Corp", zone: "A-02-08", available: 480, reserved: 60, batch: "BAT-2024-1210", expiry: "2026-02-28", lastMoved: "1 hour ago", status: "In Stock" },
  { sku: "SKU-001243", name: "Turmeric Powder 1kg", owner: "Agro Corp", zone: "A-03-02", available: 92, reserved: 12, batch: "BAT-2024-1212", expiry: "2025-11-15", lastMoved: "3 hours ago", status: "Low Stock" },
  { sku: "SKU-001244", name: "Red Chilli Powder 500g", owner: "Agro Corp", zone: "C-04-01", available: 640, reserved: 40, batch: "BAT-2024-1215", expiry: "2025-10-20", lastMoved: "8 hours ago", status: "In Stock" },
  { sku: "SKU-001245", name: "Mustard Oil 1L", owner: "Global Oils", zone: "B-06-03", available: 1180, reserved: 120, batch: "BAT-2024-1218", expiry: "2025-09-30", lastMoved: "2 hours ago", status: "In Stock" },
  { sku: "SKU-001246", name: "Groundnut Oil 5L", owner: "Global Oils", zone: "B-07-01", available: 6, reserved: 0, batch: "BAT-2024-1220", expiry: "2025-08-12", lastMoved: "2 days ago", status: "Critical" },
  { sku: "SKU-001247", name: "Olive Oil 500ml", owner: "Global Oils", zone: "B-09-04", available: 275, reserved: 25, batch: "BAT-2024-1222", expiry: "2026-01-18", lastMoved: "5 hours ago", status: "In Stock" },
  { sku: "SKU-001248", name: "Jaggery Blocks 5kg", owner: "Sweet Mills", zone: "B-04-06", available: 58, reserved: 8, batch: "BAT-2024-1225", expiry: "2025-07-25", lastMoved: "1 day ago", status: "Low Stock" },
  { sku: "SKU-001249", name: "Castor Sugar 2kg", owner: "Sweet Mills", zone: "B-08-07", available: 910, reserved: 90, batch: "BAT-2024-1228", expiry: "2026-03-14", lastMoved: "4 hours ago", status: "In Stock" },
  { sku: "SKU-001250", name: "Honey 1kg", owner: "Sweet Mills", zone: "D-04-02", available: 340, reserved: 30, batch: "BAT-2024-1230", expiry: "2026-06-01", lastMoved: "7 hours ago", status: "In Stock" },
  { sku: "SKU-001251", name: "Rock Salt 2kg", owner: "Salt Works", zone: "A-05-09", available: 1560, reserved: 160, batch: "BAT-2024-1232", expiry: "2027-04-10", lastMoved: "1 hour ago", status: "In Stock" },
  { sku: "SKU-001252", name: "Black Salt 500g", owner: "Salt Works", zone: "A-06-04", available: 0, reserved: 0, batch: "BAT-2024-1234", expiry: "2026-09-22", lastMoved: "3 days ago", status: "Out of Stock" },
  { sku: "SKU-001253", name: "Sea Salt Coarse 5kg", owner: "Salt Works", zone: "C-02-05", available: 720, reserved: 50, batch: "BAT-2024-1236", expiry: "2027-02-05", lastMoved: "9 hours ago", status: "In Stock" },
  { sku: "SKU-001254", name: "Frozen Green Peas 1kg", owner: "Fresh Farms", zone: "C-01-03", available: 430, reserved: 60, batch: "BAT-2024-1238", expiry: "2025-02-28", lastMoved: "2 hours ago", status: "In Stock" },
  { sku: "SKU-001255", name: "Mango Pulp 850g", owner: "Fresh Farms", zone: "D-01-08", available: 9, reserved: 4, batch: "BAT-2024-1240", expiry: "2025-04-15", lastMoved: "1 day ago", status: "Critical" },
  { sku: "SKU-001256", name: "Mixed Fruit Jam 500g", owner: "Fresh Farms", zone: "D-03-04", available: 268, reserved: 20, batch: "BAT-2024-1242", expiry: "2025-12-05", lastMoved: "6 hours ago", status: "In Stock" },
  { sku: "SKU-001257", name: "Coconut Oil 1L", owner: "Tropical Co", zone: "D-02-07", available: 84, reserved: 14, batch: "BAT-2024-1244", expiry: "2025-06-20", lastMoved: "5 hours ago", status: "Low Stock" },
  { sku: "SKU-001258", name: "Palm Jaggery 1kg", owner: "Tropical Co", zone: "D-05-01", available: 512, reserved: 40, batch: "BAT-2024-1246", expiry: "2026-05-11", lastMoved: "10 hours ago", status: "In Stock" },
  { sku: "SKU-001259", name: "Tender Coconut Water 200ml", owner: "Tropical Co", zone: "C-05-02", available: 1340, reserved: 200, batch: "BAT-2024-1248", expiry: "2025-03-08", lastMoved: "3 hours ago", status: "In Stock" },
  { sku: "SKU-001260", name: "Idli Rice 25kg", owner: "Acme Foods", zone: "A-11-02", available: 890, reserved: 110, batch: "BAT-2024-1250", expiry: "2026-07-30", lastMoved: "4 hours ago", status: "In Stock" },
  { sku: "SKU-001261", name: "Toor Dal 10kg", owner: "Acme Foods", zone: "A-13-05", available: 1120, reserved: 80, batch: "BAT-2024-1252", expiry: "2026-04-19", lastMoved: "1 hour ago", status: "In Stock" },
  { sku: "SKU-001262", name: "Semolina Rava 5kg", owner: "Acme Foods", zone: "C-06-01", available: 655, reserved: 45, batch: "BAT-2024-1254", expiry: "2025-10-02", lastMoved: "12 hours ago", status: "In Stock" },
  { sku: "SKU-001263", name: "Poha Flattened Rice 2kg", owner: "Agro Corp", zone: "B-02-03", available: 396, reserved: 36, batch: "BAT-2024-1256", expiry: "2025-08-28", lastMoved: "1 day ago", status: "In Stock" },
]

const statusColors: Record<string, string> = {
  "In Stock": "bg-success/15 text-success",
  "Low Stock": "bg-warning/15 text-warning",
  "Critical": "bg-danger/15 text-danger",
  "Out of Stock": "bg-muted text-muted-foreground",
}

const OWNERS = ["Acme Foods", "Global Oils", "Agro Corp", "Sweet Mills", "Salt Works", "Fresh Farms", "Tropical Co"] as const
const ADJUST_TYPES = ["Add stock", "Remove stock", "Set exact count"] as const
const ADJUST_REASONS = ["Cycle count correction", "Damage write-off", "Goods receipt", "Customer return", "Shrinkage"] as const

/** Status is a pure function of on-hand quantity, so it stays correct after every mutation. */
function statusFor(available: number): string {
  if (available <= 0) return "Out of Stock"
  if (available <= 10) return "Critical"
  if (available < 100) return "Low Stock"
  return "In Stock"
}

const emptyItem = { sku: "", name: "", owner: "", zone: "", available: "", reserved: "", batch: "", expiry: "" }
const emptyAdjust = { type: "", qty: "", reason: "" }

const PAGE_SIZE = 6
type SortKey = keyof StockItem

export default function InventoryPage() {
  const [stock, setStock] = useState<StockItem[]>(initialStock)
  const [search, setSearch] = useState("")
  const [clientFilter, setClientFilter] = useState("All Clients")
  const [zoneFilter, setZoneFilter] = useState("All Zones")
  const [statusFilter, setStatusFilter] = useState("All Status")

  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortAsc, setSortAsc] = useState(true)
  const [page, setPage] = useState(1)

  const [addOpen, setAddOpen] = useState(false)
  const [itemForm, setItemForm] = useState(emptyItem)
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({})

  const [adjustOpen, setAdjustOpen] = useState(false)
  const [adjustSku, setAdjustSku] = useState("")
  const [adjustForm, setAdjustForm] = useState(emptyAdjust)
  const [adjustErrors, setAdjustErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<StockItem | null>(null)
  const [removeTarget, setRemoveTarget] = useState<StockItem | null>(null)

  const filtered = stock.filter((item) => {
    const q = search.toLowerCase()
    return (
      (item.sku.toLowerCase().includes(q) || item.name.toLowerCase().includes(q) || item.batch.toLowerCase().includes(q)) &&
      (clientFilter === "All Clients" || item.owner === clientFilter) &&
      (zoneFilter === "All Zones" || item.zone.startsWith(zoneFilter.replace("Zone ", ""))) &&
      (statusFilter === "All Status" || item.status === statusFilter)
    )
  })

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey]
        const cmp = typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv))
        return sortAsc ? cmp : -cmp
      })
    : filtered

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const visible = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const hasFilters = search || clientFilter !== "All Clients" || zoneFilter !== "All Zones" || statusFilter !== "All Status"

  // Derived KPIs — recompute from state on every mutation.
  const totalUnits = stock.reduce((sum, i) => sum + i.available, 0)
  const totalReserved = stock.reduce((sum, i) => sum + i.reserved, 0)
  const alertCount = stock.filter(i => i.status !== "In Stock").length

  const stats = [
    { label: "Total SKUs", value: stock.length.toLocaleString(), sub: `${filtered.length} matching current filters`, icon: <Package className="w-5 h-5" />, color: "text-brand" },
    { label: "Total Quantity", value: totalUnits.toLocaleString(), sub: `${totalReserved.toLocaleString()} units reserved`, icon: <Layers className="w-5 h-5" />, color: "text-brand" },
    { label: "Stock Value", value: "₹45.6 Cr", sub: "at cost", icon: <DollarSign className="w-5 h-5" />, color: "text-brand" },
    { label: "Low Stock Alerts", value: alertCount.toLocaleString(), sub: "items need attention", icon: <AlertTriangle className="w-5 h-5" />, color: "text-warning" },
  ]

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(v => !v)
    else { setSortKey(key); setSortAsc(true) }
    setPage(1)
  }

  function validateItem() {
    const e: Record<string, string> = {}
    if (!itemForm.sku.trim()) e.sku = "SKU is required"
    else if (stock.some(s => s.sku.toLowerCase() === itemForm.sku.trim().toLowerCase())) e.sku = "This SKU already exists"
    if (!itemForm.name.trim()) e.name = "Product name is required"
    if (!itemForm.owner) e.owner = "Select an owner"
    if (!itemForm.zone.trim()) e.zone = "Zone-location is required"
    if (!itemForm.available.trim()) e.available = "Available quantity is required"
    else if (!/^\d+$/.test(itemForm.available)) e.available = "Enter a whole number"
    if (itemForm.reserved.trim() && !/^\d+$/.test(itemForm.reserved)) e.reserved = "Enter a whole number"
    if (!itemForm.batch.trim()) e.batch = "Batch / lot is required"
    if (!itemForm.expiry.trim()) e.expiry = "Expiry date is required"
    setItemErrors(e)
    return Object.keys(e).length === 0
  }

  function addItem() {
    if (!validateItem()) return
    const available = Number(itemForm.available)
    const next: StockItem = {
      sku: itemForm.sku.trim().toUpperCase(),
      name: itemForm.name.trim(),
      owner: itemForm.owner,
      zone: itemForm.zone.trim().toUpperCase(),
      available,
      reserved: Number(itemForm.reserved || 0),
      batch: itemForm.batch.trim().toUpperCase(),
      expiry: itemForm.expiry.trim(),
      lastMoved: "just now",
      status: statusFor(available),
    }
    setStock(prev => [next, ...prev])
    setAddOpen(false)
    setItemForm(emptyItem)
    setItemErrors({})
    setPage(1)
    notify.success("Item added", `${next.sku} — ${next.available.toLocaleString()} units at ${next.zone}`)
  }

  function validateAdjust() {
    const e: Record<string, string> = {}
    if (!adjustSku) e.sku = "Select an item to adjust"
    if (!adjustForm.type) e.type = "Select an adjustment type"
    if (!adjustForm.qty.trim()) e.qty = "Quantity is required"
    else if (!/^\d+$/.test(adjustForm.qty)) e.qty = "Enter a whole number"
    else if (adjustForm.type === "Remove stock") {
      const item = stock.find(s => s.sku === adjustSku)
      if (item && Number(adjustForm.qty) > item.available) e.qty = `Only ${item.available} units available`
    }
    if (!adjustForm.reason) e.reason = "Select a reason"
    setAdjustErrors(e)
    return Object.keys(e).length === 0
  }

  function applyAdjustment() {
    if (!validateAdjust()) return
    const qty = Number(adjustForm.qty)
    const item = stock.find(s => s.sku === adjustSku)
    if (!item) return
    const nextQty =
      adjustForm.type === "Add stock" ? item.available + qty
        : adjustForm.type === "Remove stock" ? Math.max(0, item.available - qty)
          : qty
    setStock(prev => prev.map(s => s.sku === adjustSku
      ? { ...s, available: nextQty, status: statusFor(nextQty), lastMoved: "just now" }
      : s))
    setAdjustOpen(false)
    setAdjustSku("")
    setAdjustForm(emptyAdjust)
    setAdjustErrors({})
    notify.success("Stock adjusted", `${item.sku}: ${item.available.toLocaleString()} → ${nextQty.toLocaleString()} units (${adjustForm.reason})`)
  }

  function removeItem(item: StockItem) {
    setStock(prev => prev.filter(s => s.sku !== item.sku))
    setDetail(null)
    notify.warning("Item removed", `${item.sku} has been removed from stock.`)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Stock Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time inventory across all locations</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ExportButton data={sorted} filename="inventory-stock" />
          <button
            onClick={() => setAdjustOpen(true)}
            title="Adjust stock"
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" /> Adjust Stock
          </button>
          <button
            onClick={() => setAddOpen(true)}
            title="Add item"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="p-3.5 rounded-xl border border-border bg-card">
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <span className={stat.color}>{stat.icon}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-success mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="p-4 rounded-xl border border-border bg-card space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-lg border border-border bg-background">
            <svg className="w-4 h-4 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground text-foreground"
              placeholder="Search by SKU, name, batch..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          {[
            { value: clientFilter, options: ["All Clients", "Acme Foods", "Global Oils", "Agro Corp", "Sweet Mills", "Salt Works", "Fresh Farms", "Tropical Co"], onChange: setClientFilter },
            { value: zoneFilter, options: ["All Zones", "Zone A", "Zone B", "Zone C", "Zone D"], onChange: setZoneFilter },
            { value: statusFilter, options: ["All Status", "In Stock", "Low Stock", "Critical", "Out of Stock"], onChange: setStatusFilter },
          ].map((filter, i) => (
            <div key={i} className="relative">
              <select
                className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none cursor-pointer"
                value={filter.value}
                onChange={(e) => { filter.onChange(e.target.value); setPage(1) }}
              >
                {filter.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          ))}
        </div>
        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setClientFilter("All Clients"); setZoneFilter("All Zones"); setStatusFilter("All Status"); setPage(1) }}
            className="flex items-center gap-1 text-xs text-brand hover:text-brand/80 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {([
                  ["SKU Code", "sku"], ["Product Name", "name"], ["Owner", "owner"], ["Zone-Location", "zone"],
                  ["Available", "available"], ["Reserved", "reserved"], ["Batch/Lot", "batch"], ["Expiry", "expiry"],
                  ["Last Movement", "lastMoved"], ["Status", null], ["", null],
                ] as [string, SortKey | null][]).map(([h, key], i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    {key ? (
                      <button
                        onClick={() => toggleSort(key)}
                        title={`Sort by ${h}`}
                        className="flex items-center gap-1 uppercase tracking-wider hover:text-foreground transition-colors"
                      >
                        {h} <ArrowUpDown className={cn("w-3 h-3", sortKey === key ? "opacity-100 text-brand" : "opacity-50")} />
                      </button>
                    ) : (
                      <span className="flex items-center gap-1">{h}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((item, i) => (
                <tr key={item.sku} className={cn("border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors", i % 2 === 0 ? "" : "bg-muted/10")}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button onClick={() => setDetail(item)} title={`View ${item.sku}`} className="text-brand font-medium hover:underline cursor-pointer">{item.sku}</button>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground max-w-48">
                    <span className="line-clamp-1">{item.name}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{item.owner}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap font-mono text-xs">{item.zone}</td>
                  <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{item.available.toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{item.reserved}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap font-mono text-xs">{item.batch}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{item.expiry}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{item.lastMoved}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusColors[item.status])}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <RowActions
                      items={[
                        { label: "View details", icon: <Eye />, onSelect: () => setDetail(item) },
                        { label: "Adjust this item", icon: <SlidersHorizontal />, onSelect: () => { setAdjustSku(item.sku); setAdjustOpen(true) } },
                        { label: "Remove item", icon: <X />, onSelect: () => setRemoveTarget(item), tone: "danger" as const },
                      ]}
                    />
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-16">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Package className="w-10 h-10 mb-3 opacity-40" />
                      <p className="font-medium">No items found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
          <span className="text-xs text-muted-foreground">Showing {visible.length} of {stock.length} items</span>
          <div className="flex gap-1">
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                title={`Go to page ${p}`}
                className={cn("w-7 h-7 rounded-lg text-xs transition-colors", p === currentPage ? "bg-brand text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add item */}
      <Modal
        open={addOpen}
        onOpenChange={(o) => { setAddOpen(o); if (!o) { setItemForm(emptyItem); setItemErrors({}) } }}
        title="Add Stock Item"
        description="Create a new SKU record in the warehouse"
        footer={<ModalActions onCancel={() => setAddOpen(false)} onSubmit={addItem} submitLabel="Add Item" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="SKU Code" required error={itemErrors.sku}>
            <TextInput value={itemForm.sku} invalid={!!itemErrors.sku} onChange={e => setItemForm({ ...itemForm, sku: e.target.value })} placeholder="e.g. SKU-001242" />
          </Field>
          <Field label="Product Name" required error={itemErrors.name}>
            <TextInput value={itemForm.name} invalid={!!itemErrors.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} placeholder="e.g. Green Cardamom 500g" />
          </Field>
          <Field label="Owner / Client" required error={itemErrors.owner}>
            <Select value={itemForm.owner} invalid={!!itemErrors.owner} onChange={e => setItemForm({ ...itemForm, owner: e.target.value })} options={OWNERS} placeholder="Select Client" />
          </Field>
          <Field label="Zone-Location" required error={itemErrors.zone}>
            <TextInput value={itemForm.zone} invalid={!!itemErrors.zone} onChange={e => setItemForm({ ...itemForm, zone: e.target.value })} placeholder="e.g. A-12-05" />
          </Field>
          <Field label="Available Qty" required error={itemErrors.available}>
            <TextInput value={itemForm.available} invalid={!!itemErrors.available} onChange={e => setItemForm({ ...itemForm, available: e.target.value })} placeholder="e.g. 250" inputMode="numeric" />
          </Field>
          <Field label="Reserved Qty" error={itemErrors.reserved} hint="Defaults to 0">
            <TextInput value={itemForm.reserved} invalid={!!itemErrors.reserved} onChange={e => setItemForm({ ...itemForm, reserved: e.target.value })} placeholder="e.g. 0" inputMode="numeric" />
          </Field>
          <Field label="Batch / Lot" required error={itemErrors.batch}>
            <TextInput value={itemForm.batch} invalid={!!itemErrors.batch} onChange={e => setItemForm({ ...itemForm, batch: e.target.value })} placeholder="e.g. BAT-2024-1210" />
          </Field>
          <Field label="Expiry Date" required error={itemErrors.expiry}>
            <TextInput type="date" value={itemForm.expiry} invalid={!!itemErrors.expiry} onChange={e => setItemForm({ ...itemForm, expiry: e.target.value })} />
          </Field>
        </div>
      </Modal>

      {/* Adjust stock */}
      <Modal
        open={adjustOpen}
        onOpenChange={(o) => { setAdjustOpen(o); if (!o) { setAdjustSku(""); setAdjustForm(emptyAdjust); setAdjustErrors({}) } }}
        title="Adjust Stock"
        description="Correct on-hand quantity for a SKU"
        size="sm"
        footer={<ModalActions onCancel={() => setAdjustOpen(false)} onSubmit={applyAdjustment} submitLabel="Apply Adjustment" />}
      >
        <div className="space-y-4">
          <Field label="Item" required error={adjustErrors.sku}>
            <Select
              value={adjustSku}
              invalid={!!adjustErrors.sku}
              onChange={e => setAdjustSku(e.target.value)}
              options={stock.map(s => s.sku)}
              placeholder="Select SKU"
            />
          </Field>
          {adjustSku && (
            <p className="text-xs text-muted-foreground">
              Current on-hand: <span className="font-semibold text-foreground">{(stock.find(s => s.sku === adjustSku)?.available ?? 0).toLocaleString()}</span> units
            </p>
          )}
          <Field label="Adjustment Type" required error={adjustErrors.type}>
            <Select value={adjustForm.type} invalid={!!adjustErrors.type} onChange={e => setAdjustForm({ ...adjustForm, type: e.target.value })} options={ADJUST_TYPES} placeholder="Select Type" />
          </Field>
          <Field label="Quantity" required error={adjustErrors.qty}>
            <TextInput value={adjustForm.qty} invalid={!!adjustErrors.qty} onChange={e => setAdjustForm({ ...adjustForm, qty: e.target.value })} placeholder="e.g. 50" inputMode="numeric" />
          </Field>
          <Field label="Reason" required error={adjustErrors.reason}>
            <Select value={adjustForm.reason} invalid={!!adjustErrors.reason} onChange={e => setAdjustForm({ ...adjustForm, reason: e.target.value })} options={ADJUST_REASONS} placeholder="Select Reason" />
          </Field>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.sku ?? ""}
        description="Stock item detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="SKU" value={<span className="font-mono text-brand">{detail.sku}</span>} />
            <DetailRow label="Product" value={detail.name} />
            <DetailRow label="Owner" value={detail.owner} />
            <DetailRow label="Zone-Location" value={<span className="font-mono">{detail.zone}</span>} />
            <DetailRow label="Available" value={`${detail.available.toLocaleString()} units`} />
            <DetailRow label="Reserved" value={`${detail.reserved.toLocaleString()} units`} />
            <DetailRow label="Batch / Lot" value={<span className="font-mono">{detail.batch}</span>} />
            <DetailRow label="Expiry" value={detail.expiry} />
            <DetailRow label="Last Movement" value={detail.lastMoved} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusColors[detail.status])}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Remove confirmation */}
      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(o) => !o && setRemoveTarget(null)}
        title="Remove this item?"
        message={`${removeTarget?.sku} (${removeTarget?.name}) will be removed from stock. This cannot be undone.`}
        confirmLabel="Remove Item"
        cancelLabel="Keep It"
        onConfirm={() => removeTarget && removeItem(removeTarget)}
      />
    </div>
  )
}
