"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft, ChevronRight, Home, Building2, Search,
  Package, Truck, FileText, BarChart3, Settings, Users,
  Warehouse, GitMerge, Wind, Box, Globe, Shield, Thermometer,
  CalendarClock, Scan, PieChart, ClipboardList, Layers, UserCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface NavItem {
  label: string
  href: string
  icon?: React.ReactNode
  badge?: number | string
  badgeVariant?: "brand" | "warning" | "danger" | "success"
}

interface RailItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number | string
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

interface ModuleLayoutProps {
  title: string
  subtitle?: string
  moduleIcon?: React.ReactNode
  sections: NavSection[]
  children: React.ReactNode
  breadcrumbs?: { label: string; href?: string }[]
  headerActions?: React.ReactNode
}

const moduleRail: RailItem[] = [
  { label: "Home", href: "/home", icon: <Home className="w-5 h-5" /> },
  { label: "Inventory", href: "/inventory", icon: <Package className="w-5 h-5" /> },
  { label: "Orders", href: "/orders", icon: <FileText className="w-5 h-5" /> },
  { label: "GRN", href: "/grn", icon: <ClipboardList className="w-5 h-5" /> },
  { label: "Gate", href: "/gate-management", icon: <Shield className="w-5 h-5" /> },
  { label: "3PL", href: "/3pl", icon: <Layers className="w-5 h-5" /> },
  { label: "LCL", href: "/lcl", icon: <GitMerge className="w-5 h-5" /> },
  { label: "Air", href: "/air-handling", icon: <Wind className="w-5 h-5" /> },
  { label: "Storage", href: "/storage-saas", icon: <Box className="w-5 h-5" /> },
  { label: "Portal", href: "/portal", icon: <Globe className="w-5 h-5" /> },
  { label: "Billing", href: "/billing", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "Workforce", href: "/workforce", icon: <Users className="w-5 h-5" /> },
  { label: "MHE", href: "/mhe-operations", icon: <Truck className="w-5 h-5" /> },
  { label: "Cold", href: "/cold-chain", icon: <Thermometer className="w-5 h-5" /> },
  { label: "SKUs", href: "/sku-master", icon: <Scan className="w-5 h-5" /> },
  { label: "Space", href: "/space-management", icon: <Warehouse className="w-5 h-5" /> },
  { label: "Sched", href: "/scheduler", icon: <CalendarClock className="w-5 h-5" /> },
  { label: "Analytics", href: "/analytics", icon: <PieChart className="w-5 h-5" /> },
  { label: "Audit", href: "/audit-trail", icon: <ClipboardList className="w-5 h-5" /> },
  { label: "Setup", href: "/warehouse-setup", icon: <Building2 className="w-5 h-5" /> },
  { label: "Settings", href: "/settings", icon: <Settings className="w-5 h-5" /> },
]

export function ModuleLayout({
  title, subtitle, moduleIcon, sections, children, breadcrumbs, headerActions
}: ModuleLayoutProps) {
  const [menuCollapsed, setMenuCollapsed] = useState(false)
  const [searchVal, setSearchVal] = useState("")
  const pathname = usePathname()

  const railActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  const menuActive = (href: string) => pathname === href

  const badgeClass = (v?: string) =>
    v === "warning" ? "bg-warning/20 text-warning" :
    v === "danger"  ? "bg-danger/20 text-danger" :
    v === "success" ? "bg-success/20 text-success" :
    "bg-brand/20 text-brand"

  return (
    <div className="flex h-full">

      {/* ── Module Rail (far left icon + label strip) ── */}
      <aside className="w-[72px] shrink-0 flex flex-col items-center py-2 gap-0.5 border-r border-sidebar-border overflow-y-auto"
        style={{ background: "var(--sidebar)" }}>
        {moduleRail.map((m) => {
          const active = railActive(m.href)
          return (
            <Link key={m.href} href={m.href} title={m.label} className="w-full flex justify-center">
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                className={cn(
                  "relative w-[60px] py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 cursor-pointer",
                  active ? "text-white" : "text-sidebar-foreground/55 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="rail-active-pill"
                    className="absolute inset-0 rounded-xl bg-brand shadow-sm shadow-brand/30"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{m.icon}</span>
                <span className="relative z-10 text-[9.5px] font-semibold leading-tight text-center truncate max-w-full">
                  {m.label}
                </span>
                {m.badge !== undefined && (
                  <span className="absolute z-10 top-1 right-1.5 min-w-[15px] h-[15px] px-[3px] rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center leading-none">
                    {m.badge}
                  </span>
                )}
              </motion.div>
            </Link>
          )
        })}
      </aside>

      {/* ── Menu Column (second sidebar) ── */}
      <aside className={cn(
        "shrink-0 flex flex-col border-r border-sidebar-border transition-all duration-300 overflow-hidden",
        menuCollapsed ? "w-0" : "w-56"
      )} style={{ background: "var(--sidebar)" }}>

        {/* Module header */}
        <div className="px-3 py-3 border-b border-sidebar-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-brand/15 flex items-center justify-center shrink-0 text-brand">
              {moduleIcon ?? <Building2 className="w-3.5 h-3.5" />}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-brand uppercase tracking-wider truncate">{title}</p>
              {subtitle && <p className="text-[10px] text-sidebar-foreground/45 truncate">{subtitle}</p>}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-2.5 py-2 border-b border-sidebar-border shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-sidebar-accent/50 border border-sidebar-border/60">
            <Search className="w-3 h-3 text-sidebar-foreground/35 shrink-0" />
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              className="bg-transparent text-[11px] outline-none w-full placeholder:text-sidebar-foreground/35 text-sidebar-foreground"
              placeholder="Search..."
            />
          </div>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 overflow-y-auto px-2 py-2">
          {sections.map((section, si) => (
            <div key={si} className="mb-2">
              {section.title && (
                <p className="px-1.5 pt-2 pb-1 text-[9px] font-bold text-sidebar-foreground/35 uppercase tracking-widest">
                  {section.title}
                </p>
              )}
              <AnimatePresence initial={false}>
                {section.items
                  .filter(item => !searchVal || item.label.toLowerCase().includes(searchVal.toLowerCase()))
                  .map((item) => {
                    const active = menuActive(item.href)
                    return (
                      <motion.div
                        key={item.href}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                        className="mb-1 last:mb-0"
                      >
                        <Link href={item.href}>
                          <motion.div
                            whileHover={{ x: active ? 0 : 2 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium cursor-pointer relative overflow-hidden",
                              active
                                ? "text-white"
                                : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/70 transition-colors"
                            )}
                          >
                            {active && (
                              <motion.span
                                layoutId="module-menu-active"
                                className="absolute inset-0 bg-brand rounded-lg"
                                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                              />
                            )}
                            {item.icon && (
                              <span className={cn("relative z-10 shrink-0", active ? "text-white" : "text-sidebar-foreground/45")}>
                                {item.icon}
                              </span>
                            )}
                            <span className="relative z-10 flex-1 truncate">{item.label}</span>
                            {item.badge !== undefined && (
                              <span className={cn(
                                "relative z-10 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center leading-none",
                                active ? "bg-white/20 text-white" : badgeClass(item.badgeVariant)
                              )}>
                                {item.badge}
                              </span>
                            )}
                          </motion.div>
                        </Link>
                      </motion.div>
                    )
                  })}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Collapse */}
        <button
          onClick={() => setMenuCollapsed(true)}
          className="flex items-center justify-center gap-1.5 py-2 border-t border-sidebar-border text-sidebar-foreground/35 hover:text-sidebar-foreground/70 transition-colors text-[11px] shrink-0"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Collapse</span>
        </button>
      </aside>

      {/* Expand button when collapsed */}
      {menuCollapsed && (
        <button
          onClick={() => setMenuCollapsed(false)}
          className="shrink-0 w-5 flex items-center justify-center border-r border-sidebar-border text-sidebar-foreground/35 hover:text-sidebar-foreground/70 hover:bg-sidebar-accent transition-colors"
          style={{ background: "var(--sidebar)" }}
          title="Expand menu"
        >
          <ChevronRight className="w-3 h-3" />
        </button>
      )}

      {/* ── Content Pane ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Breadcrumb / header bar */}
        {(breadcrumbs || headerActions) && (
          <div className="flex items-center justify-between px-5 py-2 border-b border-border bg-background/60 backdrop-blur-sm shrink-0">
            {breadcrumbs && (
              <nav className="flex items-center gap-1 text-[11px] text-muted-foreground">
                {breadcrumbs.map((crumb, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <ChevronRight className="w-2.5 h-2.5" />}
                    {crumb.href ? (
                      <Link href={crumb.href} className="hover:text-foreground transition-colors">{crumb.label}</Link>
                    ) : (
                      <span className="text-foreground font-semibold">{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            )}
            {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
          </div>
        )}

        {/* Main scrollable content — fades/rises on route change within this module */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
