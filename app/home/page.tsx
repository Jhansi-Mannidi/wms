"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Package, Tag, ShoppingCart, Truck, Building, DollarSign, Users,
  Forklift, Box, Thermometer, Clock, BarChart2, Shield, Warehouse,
  Settings, Plus, FileText, RefreshCw, LogIn, Grid, List, Star,
  TrendingUp, AlertTriangle, CheckCircle2, Zap, Layers, Wind,
  UserCircle, Globe
} from "lucide-react"
import { cn } from "@/lib/utils"

const modules = [
  // Operations
  { id: "inventory", category: "Operations", badge: "2,450", badgeType: "count", icon: <Package className="w-8 h-8" />, title: "Inventory Management", desc: "Real-time stock tracking", href: "/inventory", },
  { id: "sku-master", category: "Inventory", badge: "New", badgeType: "new", icon: <Tag className="w-8 h-8" />, title: "SKU Master", desc: "Product definitions & mappings", href: "/sku-master", },
  { id: "orders", category: "Operations", badge: "28", badgeType: "count", icon: <ShoppingCart className="w-8 h-8" />, title: "Order Management", desc: "Process & fulfill orders", href: "/orders", },
  { id: "gate", category: "Logistics", badge: "5", badgeType: "count", icon: <Truck className="w-8 h-8" />, title: "Gate Management", desc: "Vehicle entry & exit", href: "/gate-management", },
  { id: "space", category: "Operations", badge: "87%", badgeType: "percent", icon: <Building className="w-8 h-8" />, title: "Space Management", desc: "Facility & tenant management", href: "/space-management", },
  { id: "billing", category: "Operations", badge: "12", badgeType: "count", icon: <DollarSign className="w-8 h-8" />, title: "Billing & Invoicing", desc: "Invoices & payments", href: "/billing", },
  { id: "workforce", category: "Operations", badge: "45", badgeType: "count", icon: <Users className="w-8 h-8" />, title: "Workforce", desc: "Shift & task management", href: "/workforce", },
  { id: "mhe", category: "Logistics", badge: "12", badgeType: "count", icon: <Forklift className="w-8 h-8" />, title: "MHE Operations", desc: "Equipment tracking", href: "/mhe-operations", },
  { id: "pallets", category: "Logistics", badge: "890", badgeType: "count", icon: <Box className="w-8 h-8" />, title: "Pallet Tracking", desc: "Pallet lifecycle management", href: "/pallet-tracking", },
  { id: "cold-chain", category: "Operations", badge: "2", badgeType: "alert", icon: <Thermometer className="w-8 h-8" />, title: "Cold Chain", desc: "Temperature monitoring", href: "/cold-chain", },
  { id: "scheduler", category: "Operations", badge: "8", badgeType: "count", icon: <Clock className="w-8 h-8" />, title: "Scheduler", desc: "Jobs, SLAs & automation", href: "/scheduler", },
  // Freight Streams
  { id: "3pl", category: "Freight", badge: "New", badgeType: "new", icon: <Layers className="w-8 h-8" />, title: "3PL End-to-End", desc: "Multi-client 3PL operations", href: "/3pl", },
  { id: "lcl", category: "Freight", badge: "New", badgeType: "new", icon: <Globe className="w-8 h-8" />, title: "LCL Consolidation", desc: "CBM-based cargo consolidation", href: "/lcl", },
  { id: "air", category: "Freight", badge: "New", badgeType: "new", icon: <Wind className="w-8 h-8" />, title: "Air Handling", desc: "Local delivery & export routing", href: "/air-handling", },
  { id: "saas", category: "Freight", badge: "New", badgeType: "new", icon: <Warehouse className="w-8 h-8" />, title: "Storage-as-a-Service", desc: "Mini-warehouse & sub-lease", href: "/storage-saas", },
  // Portal & Reports
  { id: "portal", category: "Portal", badge: "New", badgeType: "new", icon: <UserCircle className="w-8 h-8" />, title: "Customer Portal", desc: "Client-facing inventory & orders", href: "/portal", },
  { id: "analytics", category: "Reports", badge: "New", badgeType: "new", icon: <BarChart2 className="w-8 h-8" />, title: "Analytics", desc: "Dashboards & insights", href: "/analytics", },
  { id: "audit", category: "Reports", badge: undefined, badgeType: "none", icon: <Shield className="w-8 h-8" />, title: "Audit Trail", desc: "Compliance & logging", href: "/audit-trail", },
  // System
  { id: "warehouse-setup", category: "System", badge: undefined, badgeType: "none", icon: <Warehouse className="w-8 h-8" />, title: "Warehouse Setup", desc: "Configure warehouses & zones", href: "/warehouse-setup", },
  { id: "settings", category: "System", badge: undefined, badgeType: "none", icon: <Settings className="w-8 h-8" />, title: "Settings", desc: "System configuration", href: "/settings", },
]

const categories = ["All", "Operations", "Inventory", "Logistics", "Freight", "Portal", "Reports", "Favorites"]

const categoryColors: Record<string, string> = {
  Operations: "text-blue-400",
  Inventory:  "text-emerald-400",
  Logistics:  "text-amber-400",
  Freight:    "text-orange-400",
  Portal:     "text-violet-400",
  Reports:    "text-purple-400",
  System:     "text-slate-400",
}

const categoryDotColors: Record<string, string> = {
  Operations: "bg-blue-400",
  Inventory:  "bg-emerald-400",
  Logistics:  "bg-amber-400",
  Freight:    "bg-orange-400",
  Portal:     "bg-violet-400",
  Reports:    "bg-purple-400",
  System:     "bg-slate-400",
}

const favorites = ["inventory", "orders", "gate", "3pl", "lcl", "air"]

function ModuleCard({ mod, viewMode }: { mod: typeof modules[0]; viewMode: "grid" | "list" }) {
  const badgeClass = mod.badgeType === "new"
    ? "bg-success/20 text-success"
    : mod.badgeType === "percent"
    ? "bg-warning/20 text-warning"
    : mod.badgeType === "alert"
    ? "bg-danger/20 text-danger"
    : "bg-brand/20 text-brand"

  if (viewMode === "list") {
    return (
      <Link href={mod.href}>
        <div className="flex items-center gap-4 px-4 py-3 rounded-xl border border-border bg-card hover:border-brand/40 hover:bg-brand/5 transition-all group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-brand/15 flex items-center justify-center text-brand shrink-0">
            <span className="scale-75">{mod.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn("text-[10px] font-semibold uppercase tracking-wider", categoryColors[mod.category] ?? "text-muted-foreground")}>{mod.category}</span>
              {mod.badge && <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", badgeClass)}>{mod.badge}</span>}
            </div>
            <p className="text-sm font-semibold text-foreground truncate group-hover:text-brand transition-colors">{mod.title}</p>
            <p className="text-xs text-muted-foreground truncate">{mod.desc}</p>
          </div>
          <Plus className="w-4 h-4 text-muted-foreground group-hover:text-brand transition-colors shrink-0" />
        </div>
      </Link>
    )
  }

  return (
    <Link href={mod.href}>
      <div className="relative flex flex-col p-5 rounded-2xl border border-border bg-card hover:border-brand/50 hover:bg-brand/5 transition-all group cursor-pointer overflow-hidden h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <div className={cn("w-2 h-2 rounded-full shrink-0", categoryDotColors[mod.category] ?? "bg-slate-400")} />
            <span className={cn("text-[10px] font-semibold uppercase tracking-wider", categoryColors[mod.category] ?? "text-muted-foreground")}>{mod.category}</span>
          </div>
          {mod.badge && <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", badgeClass)}>{mod.badge}</span>}
        </div>
        <div className="w-14 h-14 rounded-2xl bg-brand/15 flex items-center justify-center text-brand mb-4 group-hover:bg-brand/25 transition-colors">
          {mod.icon}
        </div>
        <h3 className="text-sm font-bold text-foreground group-hover:text-brand transition-colors leading-tight mb-1">{mod.title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{mod.desc}</p>
      </div>
    </Link>
  )
}

export default function DashboardPage() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  })

  const filtered = modules.filter((m) => {
    if (activeCategory === "All") return true
    if (activeCategory === "Favorites") return favorites.includes(m.id)
    return m.category === activeCategory
  })

  return (
    <div className="h-full overflow-y-auto">
      <div className="w-full px-4 sm:px-6 py-8">
        {/* Welcome */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground italic mb-1">Welcome back, Vijay</h1>
            <p className="text-sm text-muted-foreground flex flex-wrap gap-1">
              <span>{today}</span>
              <span className="text-border">•</span>
              <span className="flex items-center gap-1 text-warning"><AlertTriangle className="w-3 h-3" /> 12 pending orders</span>
              <span className="text-border">•</span>
              <span className="flex items-center gap-1 text-brand"><Truck className="w-3 h-3" /> 3 vehicles at gate</span>
              <span className="text-border">•</span>
              <span className="flex items-center gap-1 text-danger"><Zap className="w-3 h-3" /> 2 alerts</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setViewMode("grid")} className={cn("w-8 h-8 flex items-center justify-center rounded-lg border transition-colors", viewMode === "grid" ? "bg-brand border-brand text-white" : "border-border text-muted-foreground hover:text-foreground")}><Grid className="w-4 h-4" /></button>
            <button onClick={() => setViewMode("list")} className={cn("w-8 h-8 flex items-center justify-center rounded-lg border transition-colors", viewMode === "list" ? "bg-brand border-brand text-white" : "border-border text-muted-foreground hover:text-foreground")}><List className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Link href="/grn"><button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><FileText className="w-4 h-4" /> New GRN</button></Link>
          <Link href="/3pl"><button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-orange-500/40 bg-orange-500/10 text-orange-400 text-sm font-medium hover:bg-orange-500/20 transition-colors"><Layers className="w-4 h-4" /> 3PL Operations</button></Link>
          <Link href="/lcl"><button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors"><Globe className="w-4 h-4" /> LCL Console</button></Link>
          <Link href="/air-handling"><button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors"><Wind className="w-4 h-4" /> Air Handling</button></Link>
          <Link href="/inventory/cycle-counts"><button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors"><RefreshCw className="w-4 h-4" /> Cycle Count</button></Link>
          <Link href="/gate-management"><button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors"><LogIn className="w-4 h-4" /> Gate Entry</button></Link>
        </div>

        {/* Category filter */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl bg-muted/50 w-fit flex-wrap">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                activeCategory === cat ? "bg-brand text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/60"
              )}>
              {cat === "Favorites" && <Star className="w-3 h-3" />}
              {cat}
            </button>
          ))}
        </div>

        {/* Modules */}
        <div className={cn(
          viewMode === "grid"
            ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            : "flex flex-col gap-2"
        )}>
          {filtered.map((mod) => <ModuleCard key={mod.id} mod={mod} viewMode={viewMode} />)}
        </div>

        {/* Stats summary */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Today's GRNs", value: "24", change: "+4 from yesterday", icon: <Package className="w-5 h-5" /> },
            { label: "Orders Shipped", value: "156", change: "+12 vs yesterday", icon: <TrendingUp className="w-5 h-5" /> },
            { label: "Pick Accuracy", value: "99.2%", change: "Excellent", icon: <CheckCircle2 className="w-5 h-5" /> },
            { label: "Active Workers", value: "45", change: "On shift now", icon: <Users className="w-5 h-5" /> },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
              <div className="w-10 h-10 rounded-xl bg-brand/15 flex items-center justify-center text-brand shrink-0">{stat.icon}</div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-success">{stat.change}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
