"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Package, Truck, FileText, RefreshCw, LogIn, Grid, List, Star,
  TrendingUp, AlertTriangle, CheckCircle2, Zap, Layers, Users, ChevronRight,
  Ship, Plane,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { NAV_GROUPS, type NavGroup, type NavModule } from "@/lib/navigation"

// Modules, groups and descriptions come from lib/navigation.tsx so Home always
// matches the module rail.
type HomeModule = NavModule & { group: NavGroup }

const modules: HomeModule[] = NAV_GROUPS.flatMap((g) => g.modules.map((m) => ({ ...m, group: g })))

const categories = ["All", ...NAV_GROUPS.map((g) => g.title), "Favorites"]

const groupColors: Record<string, string> = {
  inbound:   "text-sky-400",
  inventory: "text-emerald-400",
  outbound:  "text-blue-400",
  freight:   "text-orange-400",
  resources: "text-amber-400",
  finance:   "text-violet-400",
  insights:  "text-purple-400",
  admin:     "text-slate-400",
}

const groupDotColors: Record<string, string> = {
  inbound:   "bg-sky-400",
  inventory: "bg-emerald-400",
  outbound:  "bg-blue-400",
  freight:   "bg-orange-400",
  resources: "bg-amber-400",
  finance:   "bg-violet-400",
  insights:  "bg-purple-400",
  admin:     "bg-slate-400",
}

const favorites = ["inventory", "orders", "gate", "3pl", "lcl", "air"]

function ModuleCard({ mod, viewMode }: { mod: HomeModule; viewMode: "grid" | "list" }) {
  const Icon = mod.icon
  const badge = mod.homeBadge
  const badgeClass = badge?.type === "new"
    ? "bg-success/20 text-success"
    : badge?.type === "percent"
    ? "bg-warning/20 text-warning"
    : badge?.type === "alert"
    ? "bg-danger/20 text-danger"
    : "bg-brand/20 text-brand"

  if (viewMode === "list") {
    return (
      <Link href={mod.href}>
        <div className="flex items-center gap-4 px-4 py-3 rounded-xl border border-border bg-card hover:border-brand/40 hover:bg-brand/5 transition-all group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-brand/15 flex items-center justify-center text-brand shrink-0">
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn("text-[10px] font-semibold uppercase tracking-wider", groupColors[mod.group.id] ?? "text-muted-foreground")}>{mod.group.title}</span>
              {badge && <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", badgeClass)}>{badge.value}</span>}
            </div>
            <p className="text-sm font-semibold text-foreground truncate group-hover:text-brand transition-colors">{mod.title}</p>
            <p className="text-xs text-muted-foreground truncate">{mod.desc}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-brand transition-colors shrink-0" />
        </div>
      </Link>
    )
  }

  return (
    <Link href={mod.href}>
      <div className="relative flex flex-col p-5 rounded-xl border border-border bg-card hover:border-brand/50 hover:bg-brand/5 transition-all group cursor-pointer overflow-hidden h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <div className={cn("w-2 h-2 rounded-full shrink-0", groupDotColors[mod.group.id] ?? "bg-slate-400")} />
            <span className={cn("text-[10px] font-semibold uppercase tracking-wider", groupColors[mod.group.id] ?? "text-muted-foreground")}>{mod.group.title}</span>
          </div>
          {badge && <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", badgeClass)}>{badge.value}</span>}
        </div>
        <div className="w-14 h-14 rounded-xl bg-brand/15 flex items-center justify-center text-brand mb-4 group-hover:bg-brand/25 transition-colors">
          <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-sm font-bold text-foreground group-hover:text-brand transition-colors leading-tight mb-1">{mod.title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{mod.desc}</p>
      </div>
    </Link>
  )
}

function ModuleGrid({ mods, viewMode }: { mods: HomeModule[]; viewMode: "grid" | "list" }) {
  return (
    <div className={cn(
      viewMode === "grid"
        ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        : "flex flex-col gap-2"
    )}>
      {mods.map((mod) => <ModuleCard key={mod.id} mod={mod} viewMode={viewMode} />)}
    </div>
  )
}

export default function DashboardPage() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  })

  // Breadcrumb group links arrive as /home?group=<id>.
  useEffect(() => {
    const groupId = new URLSearchParams(window.location.search).get("group")
    const group = NAV_GROUPS.find((g) => g.id === groupId)
    if (group) setActiveCategory(group.title)
  }, [])

  const filtered = modules.filter((m) => {
    if (activeCategory === "Favorites") return favorites.includes(m.id)
    return m.group.title === activeCategory
  })

  return (
    <div className="h-full overflow-y-auto">
      <div className="w-full px-4 sm:px-6 py-8">
        {/* Welcome */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Welcome back, Vijay</h1>
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
          <Link href="/grn"><button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><FileText className="w-4 h-4" /> New GRN</button></Link>
          <Link href="/3pl"><button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-orange-500/40 bg-orange-500/10 text-orange-400 text-sm font-medium hover:bg-orange-500/20 transition-colors"><Layers className="w-4 h-4" /> 3PL Operations</button></Link>
          <Link href="/lcl"><button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors"><Ship className="w-4 h-4" /> LCL Console</button></Link>
          <Link href="/air-handling"><button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors"><Plane className="w-4 h-4" /> Air Handling</button></Link>
          <Link href="/inventory/cycle-counts"><button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors"><RefreshCw className="w-4 h-4" /> Cycle Count</button></Link>
          <Link href="/gate-management"><button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors"><LogIn className="w-4 h-4" /> Gate Entry</button></Link>
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

        {/* Modules — "All" shows every group in workflow order with a short explanation */}
        {activeCategory === "All" ? (
          <div className="space-y-8">
            {NAV_GROUPS.map((g, i) => (
              <section key={g.id}>
                <div className="flex items-baseline gap-3 mb-3">
                  <span className={cn("flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold text-white shrink-0", groupDotColors[g.id] ?? "bg-slate-400")}>{i + 1}</span>
                  <h2 className="text-base font-bold text-foreground">{g.title}</h2>
                  <p className="text-xs text-muted-foreground truncate">{g.desc}</p>
                </div>
                <ModuleGrid mods={modules.filter((m) => m.group.id === g.id)} viewMode={viewMode} />
              </section>
            ))}
          </div>
        ) : (
          <>
            {NAV_GROUPS.find((g) => g.title === activeCategory) && (
              <p className="text-sm text-muted-foreground mb-4">{NAV_GROUPS.find((g) => g.title === activeCategory)!.desc}</p>
            )}
            <ModuleGrid mods={filtered} viewMode={viewMode} />
          </>
        )}

        {/* Stats summary */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Today's GRNs", value: "24", change: "+4 from yesterday", icon: <Package className="w-5 h-5" /> },
            { label: "Orders Shipped", value: "156", change: "+12 vs yesterday", icon: <TrendingUp className="w-5 h-5" /> },
            { label: "Pick Accuracy", value: "99.2%", change: "Excellent", icon: <CheckCircle2 className="w-5 h-5" /> },
            { label: "Active Workers", value: "45", change: "On shift now", icon: <Users className="w-5 h-5" /> },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-2 p-3 rounded-xl border border-border bg-card">
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
