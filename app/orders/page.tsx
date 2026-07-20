"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ShoppingCart, Clock, Package, Truck, AlertTriangle, Upload, Waves,
  Plus, ChevronDown, Filter, Calendar, Eye, MoreHorizontal
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"

const orders = [
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
  "SLA Breached": { color: "text-danger", bg: "bg-danger/15" },
}

const priorityColors: Record<string, string> = {
  Urgent: "text-danger",
  High: "text-warning",
  Normal: "text-muted-foreground",
}

const stats = [
  { label: "Today's Orders", value: "156", sub: "+12% vs yesterday", icon: <ShoppingCart className="w-5 h-5" />, subColor: "text-success" },
  { label: "Pending Allocation", value: "28", sub: "Needs attention", icon: <Clock className="w-5 h-5" />, subColor: "text-warning" },
  { label: "In Picking", value: "45", sub: "Active picks", icon: <Package className="w-5 h-5" />, subColor: "text-muted-foreground" },
  { label: "Ready to Ship", value: "34", sub: "Awaiting dispatch", icon: <Truck className="w-5 h-5" />, subColor: "text-muted-foreground" },
  { label: "SLA Breached", value: "3", sub: "Critical — Action needed", icon: <AlertTriangle className="w-5 h-5" />, subColor: "text-danger" },
]

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [channelFilter, setChannelFilter] = useState("All Channels")
  const [priorityFilter, setPriorityFilter] = useState("All Priority")
  const [search, setSearch] = useState("")
  const [showMoreFilters, setShowMoreFilters] = useState(false)

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase()
    return (
      (o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.client.toLowerCase().includes(q)) &&
      (statusFilter === "All Status" || o.status === statusFilter) &&
      (channelFilter === "All Channels" || o.channel === channelFilter) &&
      (priorityFilter === "All Priority" || o.priority === priorityFilter)
    )
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Order Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track and process customer orders</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors">
            <Upload className="w-4 h-4" /> Bulk Import
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors">
            <Waves className="w-4 h-4" /> Create Wave
          </button>
          <ExportButton data={filtered} filename="orders" />
          <Link href="/orders/new">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
              <Plus className="w-4 h-4" /> New Order
            </button>
          </Link>
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

      {/* Filters */}
      <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-lg border border-border bg-background">
            <svg className="w-4 h-4 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground" placeholder="Order ID, Customer, SKU..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {[
            { value: statusFilter, options: ["All Status", "Pending Allocation", "Ready to Pick", "In Picking", "Packed", "Ready to Ship", "SLA Breached"], onChange: setStatusFilter },
            { value: channelFilter, options: ["All Channels", "B2B", "B2C", "Marketplace"], onChange: setChannelFilter },
            { value: priorityFilter, options: ["All Priority", "Urgent", "High", "Normal"], onChange: setPriorityFilter },
          ].map((f, i) => (
            <div key={i} className="relative">
              <select className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none cursor-pointer" value={f.value} onChange={(e) => f.onChange(e.target.value)}>
                {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          ))}
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Calendar className="w-4 h-4" /> Date Range
          </button>
        </div>
        <button onClick={() => setShowMoreFilters(!showMoreFilters)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <Filter className="w-3.5 h-3.5" />
          {showMoreFilters ? "Hide" : "More"} Filters
        </button>
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
              {filtered.map((order, i) => (
                <tr key={order.id} className={cn("border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors", i % 2 === 1 ? "bg-muted/10" : "")}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-brand font-medium hover:underline cursor-pointer">{order.id}</span>
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
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Eye className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ShoppingCart className="w-10 h-10 mb-3 opacity-40" />
              <p className="font-medium">No orders found</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
          <span className="text-xs text-muted-foreground">Showing {filtered.length} of {orders.length} orders</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((p) => (
              <button key={p} className={cn("w-7 h-7 rounded-lg text-xs transition-colors", p === 1 ? "bg-brand text-white" : "text-muted-foreground hover:bg-muted")}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
