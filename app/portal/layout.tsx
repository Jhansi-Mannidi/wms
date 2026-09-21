"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home, Package, Inbox, Truck, Wrench, DollarSign, FileText,
  User, Bell, Sun, Moon, ChevronDown, LogOut, Menu, X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"
import { Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { notify } from "@/components/ui/toast"

const initialNotifications = [
  { title: "ASN-2241 received", body: "240 cartons received and putaway complete.", time: "4h ago" },
  { title: "Low stock — APX-7790", body: "Amoxicillin 250mg is below its reorder level (48 units).", time: "2h ago" },
  { title: "Invoice INV-0441 overdue", body: "Payment is 3 days past the due date.", time: "1d ago" },
]

const navItems = [
  { label: "Home", href: "/portal", icon: <Home className="w-5 h-5" /> },
  { label: "My Inventory", href: "/portal/inventory", icon: <Package className="w-5 h-5" /> },
  { label: "Inbound (ASN)", href: "/portal/asn", icon: <Inbox className="w-5 h-5" /> },
  { label: "Ship-Out", href: "/portal/ship-out", icon: <Truck className="w-5 h-5" /> },
  { label: "Tracking", href: "/portal/tracking", icon: <Truck className="w-5 h-5" /> },
  { label: "VAS Requests", href: "/portal/vas", icon: <Wrench className="w-5 h-5" /> },
  { label: "Billing", href: "/portal/billing", icon: <DollarSign className="w-5 h-5" /> },
  { label: "Reports & Docs", href: "/portal/reports", icon: <FileText className="w-5 h-5" /> },
  { label: "Profile & Users", href: "/portal/profile", icon: <User className="w-5 h-5" /> },
]

const mobileBottomNav = [
  { label: "Home", href: "/portal", icon: <Home className="w-5 h-5" /> },
  { label: "Inventory", href: "/portal/inventory", icon: <Package className="w-5 h-5" /> },
  { label: "Orders", href: "/portal/ship-out", icon: <Truck className="w-5 h-5" /> },
  { label: "Billing", href: "/portal/billing", icon: <DollarSign className="w-5 h-5" /> },
]

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [signOutOpen, setSignOutOpen] = useState(false)

  return (
    // Portal uses a LIGHT theme base — intentionally different from operator WMS.
    // It has no operator chrome (no TopNav/StatusBar) — this is the full-height root for /portal/*.
    <div className="flex h-screen overflow-hidden bg-[#F7F9FC] dark:bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-[#E4E9F0] dark:border-border bg-white dark:bg-card">
        {/* Brand header */}
        <div className="px-5 py-4 border-b border-[#E4E9F0] dark:border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1E3A5F] flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1E3A5F] dark:text-foreground">VoltusFreight</p>
              <p className="text-[10px] text-muted-foreground">Storage Portal</p>
            </div>
          </div>
        </div>
        {/* Client info */}
        <div className="px-4 py-3 border-b border-[#E4E9F0] dark:border-border bg-[#F7F9FC] dark:bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-bold shrink-0">AP</div>
            <div>
              <p className="text-xs font-semibold text-[#1E3A5F] dark:text-foreground">Apex Pharma Ltd</p>
              <p className="text-[10px] text-muted-foreground">Client Portal</p>
            </div>
          </div>
        </div>
        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navItems.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <button className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5",
                  active
                    ? "bg-[#1E3A5F] text-white"
                    : "text-[#1E3A5F]/70 dark:text-muted-foreground hover:bg-[#E4E9F0] dark:hover:bg-muted hover:text-[#1E3A5F] dark:hover:text-foreground"
                )}>
                  {item.icon}
                  {item.label}
                </button>
              </Link>
            )
          })}
        </nav>
        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#E4E9F0] dark:border-border flex items-center justify-between">
          <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#E4E9F0] dark:hover:bg-muted transition-colors text-muted-foreground">
            {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => setSignOutOpen(true)} title="Sign out" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-danger transition-colors">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex items-center px-4 gap-3 border-b border-[#E4E9F0] dark:border-border bg-white dark:bg-card shrink-0">
          <button className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#E4E9F0] dark:hover:bg-muted transition-colors" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-5 h-5 text-[#1E3A5F] dark:text-foreground" />
          </button>
          <div className="flex-1 md:hidden">
            <p className="text-sm font-bold text-[#1E3A5F] dark:text-foreground">VoltusFreight Portal</p>
          </div>
          <div className="hidden md:flex flex-1 items-center">
            <p className="text-sm font-semibold text-[#1E3A5F] dark:text-foreground">
              {navItems.find(n => n.href === pathname)?.label ?? "Portal"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setNotificationsOpen(true)}
              title="Notifications"
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#E4E9F0] dark:hover:bg-muted transition-colors relative"
            >
              <Bell className="w-4 h-4 text-muted-foreground" />
              {notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#F7941D] text-white text-[8px] font-bold rounded-full flex items-center justify-center">{notifications.length}</span>
              )}
            </button>
            <div className="flex items-center gap-2 pl-2 cursor-pointer">
              <div className="w-7 h-7 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-bold">AP</div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          </div>
        </header>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="w-64 bg-white dark:bg-card border-r border-[#E4E9F0] dark:border-border flex flex-col">
              <div className="flex items-center justify-between px-4 py-4 border-b border-[#E4E9F0] dark:border-border">
                <p className="font-bold text-[#1E3A5F] dark:text-foreground">Menu</p>
                <button onClick={() => setMobileMenuOpen(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>
              <nav className="flex-1 overflow-y-auto py-3 px-2">
                {navItems.map(item => {
                  const active = pathname === item.href
                  return (
                    <Link key={item.href} href={item.href}>
                      <button onClick={() => setMobileMenuOpen(false)} className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5",
                        active ? "bg-[#1E3A5F] text-white" : "text-[#1E3A5F]/70 hover:bg-[#E4E9F0] hover:text-[#1E3A5F]"
                      )}>
                        {item.icon}{item.label}
                      </button>
                    </Link>
                  )
                })}
              </nav>
            </div>
            <div className="flex-1 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[#F7F9FC] dark:bg-background">
          {children}
        </main>

        {/* Mobile bottom tab bar */}
        <nav className="md:hidden flex border-t border-[#E4E9F0] dark:border-border bg-white dark:bg-card shrink-0">
          {mobileBottomNav.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <button className={cn(
                  "w-full flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-medium transition-colors",
                  active ? "text-[#1E3A5F] dark:text-brand" : "text-muted-foreground"
                )}>
                  <span className={cn(active ? "text-[#1E3A5F] dark:text-brand" : "text-muted-foreground")}>{item.icon}</span>
                  {item.label}
                </button>
              </Link>
            )
          })}
          <button
            onClick={() => setMobileMenuOpen(true)}
            title="More sections"
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-medium text-muted-foreground"
          >
            <Menu className="w-5 h-5" />
            More
          </button>
        </nav>
      </div>

      {/* Notifications drawer */}
      <Drawer
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
        title="Notifications"
        description={notifications.length > 0 ? `${notifications.length} unread` : "You're all caught up"}
        footer={
          <>
            <button onClick={() => setNotificationsOpen(false)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Close
            </button>
            {notifications.length > 0 && (
              <button
                onClick={() => { setNotifications([]); notify.success("All caught up", "Every notification has been marked as read.") }}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90"
              >
                Mark all read
              </button>
            )}
          </>
        }
      >
        <div className="divide-y divide-border">
          {notifications.map((n, i) => (
            <div key={i} className="flex items-start gap-3 py-3">
              <Bell className="w-4 h-4 text-brand shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.body}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
              </div>
              <button
                onClick={() => setNotifications(prev => prev.filter((_, idx) => idx !== i))}
                title="Dismiss notification"
                className="w-6 h-6 shrink-0 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {notifications.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">No new notifications.</p>
          )}
        </div>
      </Drawer>

      {/* Sign out confirmation */}
      <ConfirmDialog
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        title="Sign out of the portal?"
        message="You will need to sign in again to view your inventory, orders, and invoices."
        confirmLabel="Sign Out"
        cancelLabel="Stay Signed In"
        onConfirm={() => notify.info("Signed out", "Your portal session has ended.")}
      />
    </div>
  )
}
