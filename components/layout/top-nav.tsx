"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Warehouse,
  Home,
  Search,
  Zap,
  Bell,
  MessageSquare,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
  ChevronRight,
  User,
  Settings,
  LogOut,
  MapPin,
  Check,
} from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { notify } from "@/components/ui/toast"

const WAREHOUSES = [
  { id: "hyd", city: "Hyderabad, IN", name: "Main Warehouse", zone: "CFS Zone A" },
  { id: "mum", city: "Mumbai, IN", name: "West Hub", zone: "CFS Zone B" },
  { id: "del", city: "Delhi, IN", name: "North Depot", zone: "Air Zone C" },
  { id: "che", city: "Chennai, IN", name: "South Facility", zone: "Port Zone D" },
  { id: "blr", city: "Bangalore, IN", name: "Tech Park WH", zone: "CFS Zone E" },
]

const initialNotifications = [
  { id: 1, type: "alert", text: "Low stock alert: Organic Wheat Flour", time: "5m ago", unread: true },
  { id: 2, type: "order", text: "Order ORD-2024-156 ready to ship", time: "12m ago", unread: true },
  { id: 3, type: "gate", text: "Vehicle TN-45-AB-1234 at Gate 1", time: "18m ago", unread: true },
  { id: 4, type: "billing", text: "Invoice INV-2024-089 overdue", time: "1h ago", unread: false },
  { id: 5, type: "system", text: "Cycle count completed: Zone A", time: "2h ago", unread: false },
]

/** Targets for the lightning-bolt quick-action menu. */
const QUICK_ACTIONS = [
  { label: "New GRN", href: "/grn" },
  { label: "New Transfer", href: "/inventory/transfers" },
  { label: "Assign Task", href: "/workforce/tasks" },
  { label: "Gate Entry", href: "/gate-management/entry" },
  { label: "Cycle Count", href: "/inventory/cycle-counts" },
]

const MESSAGES = [
  { id: 1, from: "Priya Sharma", text: "Zone B replenishment is done.", time: "3m ago" },
  { id: 2, from: "Suresh Yadav", text: "Forklift MHE-04 needs servicing.", time: "26m ago" },
  { id: 3, from: "Meena Patel", text: "ASN-2024-0188 arrived early.", time: "1h ago" },
]

export function TopNav() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [warehouseOpen, setWarehouseOpen] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState(WAREHOUSES[0])
  const [notifications, setNotifications] = useState(initialNotifications)
  const [quickOpen, setQuickOpen] = useState(false)
  const [msgOpen, setMsgOpen] = useState(false)
  const [signOutOpen, setSignOutOpen] = useState(false)
  const router = useRouter()
  const notifRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)
  const themeRef = useRef<HTMLDivElement>(null)
  const warehouseRef = useRef<HTMLDivElement>(null)
  const quickRef = useRef<HTMLDivElement>(null)
  const msgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false)
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setThemeOpen(false)
      if (warehouseRef.current && !warehouseRef.current.contains(e.target as Node)) setWarehouseOpen(false)
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) setQuickOpen(false)
      if (msgRef.current && !msgRef.current.contains(e.target as Node)) setMsgOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const unreadCount = notifications.filter((n) => n.unread).length

  const themeIcon =
    theme === "dark" ? <Moon className="w-4 h-4" /> :
    theme === "light" ? <Sun className="w-4 h-4" /> :
    <Monitor className="w-4 h-4" />

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 gap-3 border-b border-sidebar-border"
      style={{ background: "var(--sidebar)" }}>
      {/* Logo */}
      <Link href="/home" className="flex items-center gap-2.5 min-w-0 shrink-0 mr-2">
        <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shrink-0">
          <Warehouse className="w-4 h-4 text-white" />
        </div>
        <div className="hidden sm:block">
          <div className="text-sm font-bold text-sidebar-foreground leading-tight">VoltusFreight WMS</div>
          <div className="text-[10px] text-sidebar-foreground/50 leading-tight">Warehouse Management</div>
        </div>
      </Link>

      {/* Home */}
      <Link href="/home">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors text-sm cursor-pointer">
          <Home className="w-4 h-4" />
          <span className="hidden md:inline">Home</span>
        </button>
      </Link>

      {/* Search */}
      <div className="flex-1 max-w-lg mx-auto relative">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-sidebar-accent/60 border border-sidebar-border/50 text-sidebar-foreground/60 hover:border-brand/50 transition-colors cursor-text"
          onClick={() => setSearchOpen(true)}>
          <Search className="w-4 h-4 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across all modules..."
            className="bg-transparent text-sm outline-none w-full placeholder:text-sidebar-foreground/40 text-sidebar-foreground"
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
          />
          <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded border border-sidebar-border/50 text-sidebar-foreground/40">
            ⌘K
          </kbd>
        </div>
        {searchOpen && searchQuery && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-xl p-2 z-50">
            <p className="text-xs text-muted-foreground px-2 py-1">No results for &quot;{searchQuery}&quot;</p>
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 ml-auto">

        {/* Warehouse selector */}
        <div className="relative mr-1" ref={warehouseRef}>
          <button
            onClick={() => setWarehouseOpen(!warehouseOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-sidebar-border bg-sidebar-accent/40 hover:bg-sidebar-accent hover:border-brand/30 transition-all duration-150 group"
          >
            <span className="relative flex shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 block" />
              <span className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
            </span>
            <div className="flex flex-col items-start leading-none">
              <span className="text-xs font-semibold text-sidebar-foreground whitespace-nowrap">{selectedWarehouse.city}</span>
              <span className="text-[10px] text-sidebar-foreground/50 whitespace-nowrap">{selectedWarehouse.name} · {selectedWarehouse.zone}</span>
            </div>
            <ChevronRight className="w-3 h-3 text-sidebar-foreground/40 shrink-0 group-hover:text-sidebar-foreground/70 transition-colors" />
          </button>

          {warehouseOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-popover border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-brand" />
                <span className="text-sm font-semibold text-foreground">Select Warehouse</span>
              </div>
              <div className="p-1.5">
                {WAREHOUSES.map((wh) => {
                  const isSelected = wh.id === selectedWarehouse.id
                  return (
                    <button
                      key={wh.id}
                      onClick={() => { setSelectedWarehouse(wh); setWarehouseOpen(false) }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${isSelected ? "bg-brand/10 text-brand" : "hover:bg-muted text-foreground"}`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isSelected ? "text-brand" : "text-foreground"}`}>{wh.city}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{wh.name} · {wh.zone}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-brand shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Quick action */}
        <div className="relative" ref={quickRef}>
          <button
            title="Quick actions"
            onClick={() => setQuickOpen(!quickOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <Zap className="w-4 h-4" />
          </button>
          {quickOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-xl shadow-2xl z-50 overflow-hidden p-1">
              <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Quick Actions</p>
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.href}
                  onClick={() => { router.push(a.href); setQuickOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 text-brand" /> {a.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <span className="font-semibold text-sm text-foreground">Notifications</span>
                <button
                  onClick={() => {
                    if (unreadCount === 0) return
                    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
                    notify.success("Notifications cleared", `${unreadCount} notification${unreadCount === 1 ? "" : "s"} marked as read.`)
                  }}
                  disabled={unreadCount === 0}
                  className="text-xs text-brand hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-default"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className={`px-4 py-3 flex items-start gap-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0 ${n.unread ? "bg-brand/5" : ""}`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.unread ? "bg-brand" : "bg-transparent"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground leading-relaxed">{n.text}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="relative" ref={msgRef}>
          <button
            title="Messages"
            onClick={() => setMsgOpen(!msgOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          {msgOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <span className="font-semibold text-sm text-foreground">Messages</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {MESSAGES.map((m) => (
                  <div key={m.id} className="px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-foreground">{m.from}</p>
                      <p className="text-[10px] text-muted-foreground shrink-0">{m.time}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{m.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserOpen(!userOpen)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-md hover:bg-sidebar-accent transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold shrink-0">VJ</div>
            <ChevronDown className="w-3 h-3 text-sidebar-foreground/50 hidden sm:block" />
          </button>
          {userOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-popover border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="font-semibold text-sm text-foreground">Vijay Kumar</p>
                <p className="text-xs text-muted-foreground">Warehouse Manager</p>
                <p className="text-xs text-muted-foreground">Acme Logistics</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => { router.push("/portal/profile"); setUserOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <User className="w-4 h-4 text-muted-foreground" /> Profile
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                  onClick={() => { router.push("/settings"); setUserOpen(false) }}
                >
                  <Settings className="w-4 h-4 text-muted-foreground" /> Settings
                </button>
                <button
                  onClick={() => { setSignOutOpen(true); setUserOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-danger hover:bg-danger/10 transition-colors mt-1 border-t border-border"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle — far right */}
        <div className="relative" ref={themeRef}>
          <button
            onClick={() => setThemeOpen(!themeOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            {themeIcon}
          </button>
          {themeOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-popover border border-border rounded-xl shadow-2xl z-50 overflow-hidden p-1">
              {[
                { val: "light" as const, label: "Light", icon: <Sun className="w-4 h-4" /> },
                { val: "dark" as const, label: "Dark", icon: <Moon className="w-4 h-4" /> },
                { val: "system" as const, label: "System", icon: <Monitor className="w-4 h-4" /> },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => { setTheme(opt.val); setThemeOpen(false) }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${theme === opt.val ? "bg-brand text-white" : "text-foreground hover:bg-muted"}`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        title="Sign out of VoltusFreight WMS?"
        message="You will be returned to the dashboard. Any unsaved changes on this page will be lost."
        confirmLabel="Sign Out"
        cancelLabel="Stay Signed In"
        onConfirm={() => {
          notify.info("Signed out", "You have been signed out of this session.")
          router.push("/home")
        }}
      />
    </header>
  )
}
