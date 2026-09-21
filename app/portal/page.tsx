"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Package, Inbox, Truck, Wrench, DollarSign, FileText,
  AlertTriangle, CheckCircle2, Clock, TrendingUp, ArrowRight,
  ShoppingCart, Box, RefreshCw, X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Drawer } from "@/components/ui/modal"
import { DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

type RecentOrder = { id: string; sku: string; desc: string; status: string; date: string; eta: string }
type Alert = { type: string; msg: string; time: string }

const kpis = [
  { label: "SKUs in Stock", value: "234", sub: "across 4 zones", icon: <Package className="w-5 h-5" />, color: "text-brand", bg: "bg-brand/15" },
  { label: "Pending Inbound", value: "7", sub: "ASNs awaiting receipt", icon: <Inbox className="w-5 h-5" />, color: "text-warning", bg: "bg-warning/15" },
  { label: "Pending Ship-Out", value: "14", sub: "orders processing", icon: <Truck className="w-5 h-5" />, color: "text-orange-400", bg: "bg-orange-400/15" },
  { label: "Open Invoices", value: "3", sub: "₹2.4L outstanding", icon: <DollarSign className="w-5 h-5" />, color: "text-danger", bg: "bg-danger/15" },
]

const initialOrders: RecentOrder[] = [
  { id: "SO-3841", sku: "APX-7712", desc: "Paracetamol 500mg x 200", status: "Dispatched", date: "Jul 19", eta: "Jul 21" },
  { id: "SO-3840", sku: "APX-4421", desc: "Syringes 5ml x 500", status: "Packing", date: "Jul 19", eta: "Jul 20" },
  { id: "SO-3835", sku: "APX-2209", desc: "IV Drip Set x 100", status: "Picking", date: "Jul 18", eta: "Jul 20" },
  { id: "SO-3830", sku: "APX-1102", desc: "Gloves Nitrile L x 1000", status: "Delivered", date: "Jul 17", eta: "Jul 18" },
  { id: "SO-3825", sku: "APX-0091", desc: "Alcohol Swabs x 2000", status: "Delivered", date: "Jul 16", eta: "Jul 17" },
  { id: "SO-3821", sku: "APX-3301", desc: "Insulin Glargine 100U/mL x 50", status: "Dispatched", date: "Jul 18", eta: "Jul 20" },
  { id: "SO-3818", sku: "APX-7790", desc: "Amoxicillin 250mg x 300", status: "Packing", date: "Jul 18", eta: "Jul 20" },
  { id: "SO-3814", sku: "APX-6601", desc: "Glucose Saline 500mL x 400", status: "Dispatched", date: "Jul 17", eta: "Jul 19" },
  { id: "SO-3810", sku: "APX-3302", desc: "Adalimumab 40mg Pens x 30", status: "Delivered", date: "Jul 16", eta: "Jul 17" },
  { id: "SO-3805", sku: "APX-6610", desc: "Normal Saline 1000mL x 250", status: "Delivered", date: "Jul 15", eta: "Jul 16" },
  { id: "SO-3801", sku: "APX-7712", desc: "Paracetamol 500mg x 600", status: "Delivered", date: "Jul 15", eta: "Jul 16" },
  { id: "SO-3796", sku: "APX-4421", desc: "Syringes 5ml x 800", status: "Delivered", date: "Jul 14", eta: "Jul 15" },
]

const initialAlerts: Alert[] = [
  { type: "warning", msg: "APX-7790 stock below reorder level (48 units remaining)", time: "2h ago" },
  { type: "info", msg: "ASN-2241 received and putaway complete — 240 cartons", time: "4h ago" },
  { type: "danger", msg: "Invoice INV-0441 overdue by 3 days", time: "1d ago" },
  { type: "warning", msg: "APX-6610 Normal Saline stock below reorder level (420 bags remaining)", time: "1d ago" },
  { type: "info", msg: "SO-3830 delivered to the Hyderabad depot — POD uploaded", time: "1d ago" },
  { type: "danger", msg: "ASN-2240 closed with an exception — 4 cartons damaged in transit", time: "2d ago" },
  { type: "info", msg: "VAS work order VAS-1187 completed — 1,200 units relabelled", time: "2d ago" },
  { type: "warning", msg: "APX-3301 Insulin Glargine within 60 days of expiry (240 vials)", time: "2d ago" },
  { type: "info", msg: "ASN-2238 received and putaway complete — 200 cartons", time: "3d ago" },
  { type: "danger", msg: "Zone C cold-chain utilisation at 91% — allocate additional pallet positions", time: "3d ago" },
  { type: "info", msg: "Invoice INV-0445 issued for Jul 1–15, 2026 — payable by Jul 30", time: "4d ago" },
  { type: "warning", msg: "APX-7822 Cefixime 200mg approaching reorder level (640 units)", time: "5d ago" },
]

const statusColor: Record<string, string> = {
  Dispatched: "bg-brand/15 text-brand",
  Packing: "bg-warning/15 text-warning",
  Picking: "bg-orange-400/15 text-orange-400",
  Delivered: "bg-success/15 text-success",
}

const quickLinks = [
  { label: "Submit ASN", href: "/portal/asn", icon: <Inbox className="w-4 h-4" /> },
  { label: "Place Ship-Out", href: "/portal/ship-out", icon: <ShoppingCart className="w-4 h-4" /> },
  { label: "Track Shipment", href: "/portal/tracking", icon: <Truck className="w-4 h-4" /> },
  { label: "Request VAS", href: "/portal/vas", icon: <Wrench className="w-4 h-4" /> },
  { label: "View Invoices", href: "/portal/billing", icon: <DollarSign className="w-4 h-4" /> },
  { label: "Download Reports", href: "/portal/reports", icon: <FileText className="w-4 h-4" /> },
]

export default function PortalHomePage() {
  const [recentOrders] = useState<RecentOrder[]>(initialOrders)
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)
  const [detail, setDetail] = useState<RecentOrder | null>(null)
  const [syncedAt, setSyncedAt] = useState<string | null>(null)

  function refresh() {
    const stamp = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    setSyncedAt(stamp)
    notify.info("Snapshot refreshed", `Inventory, orders and alerts re-synced at ${stamp}.`)
  }

  function dismissAlert(i: number) {
    const a = alerts[i]
    setAlerts(prev => prev.filter((_, idx) => idx !== i))
    notify.success("Alert dismissed", a.msg)
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 w-full">
      {/* Welcome */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A5F] dark:text-foreground">Welcome, Apex Pharma Ltd</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your warehousing snapshot for today, {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            {syncedAt && ` · synced ${syncedAt}`}
          </p>
        </div>
        <button
          onClick={refresh}
          title="Refresh snapshot"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card text-xs font-medium text-[#1E3A5F] dark:text-foreground hover:bg-[#E4E9F0] dark:hover:bg-muted transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k, i) => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", k.bg, k.color)}>
              {k.icon}
            </div>
            <div>
              <p className="text-xl font-bold text-[#1E3A5F] dark:text-foreground">{k.value}</p>
              <p className="text-[11px] font-semibold text-[#1E3A5F] dark:text-foreground/80">{k.label}</p>
              <p className="text-[10px] text-muted-foreground">{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {quickLinks.map((q) => (
            <Link key={q.href} href={q.href}>
              <div className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card hover:border-[#1E3A5F]/40 hover:bg-[#1E3A5F]/5 dark:hover:border-brand/40 dark:hover:bg-brand/5 transition-all text-center cursor-pointer group">
                <div className="w-9 h-9 rounded-xl bg-[#1E3A5F]/10 dark:bg-brand/15 flex items-center justify-center text-[#1E3A5F] dark:text-brand group-hover:bg-[#1E3A5F]/20 dark:group-hover:bg-brand/25 transition-colors">
                  {q.icon}
                </div>
                <p className="text-[11px] font-medium text-[#1E3A5F] dark:text-foreground/80 leading-tight">{q.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recent orders */}
        <div className="lg:col-span-3 rounded-2xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E9F0] dark:border-border">
            <h2 className="text-sm font-bold text-[#1E3A5F] dark:text-foreground">Recent Orders</h2>
            <Link href="/portal/ship-out" className="flex items-center gap-1 text-xs text-[#1E3A5F] dark:text-brand hover:underline">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#E4E9F0] dark:divide-border">
            {recentOrders.map((o) => (
              <button
                key={o.id}
                onClick={() => setDetail(o)}
                title={`View ${o.id}`}
                className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-[#F7F9FC] dark:hover:bg-muted/20 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1E3A5F] dark:text-foreground">{o.id}</span>
                    <span className="text-[10px] text-muted-foreground">{o.sku}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{o.desc}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", statusColor[o.status] ?? "bg-muted text-muted-foreground")}>{o.status}</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">ETA {o.eta}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="lg:col-span-2 rounded-2xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E9F0] dark:border-border">
            <h2 className="text-sm font-bold text-[#1E3A5F] dark:text-foreground">Alerts & Notices</h2>
            <span className="text-[10px] font-semibold bg-danger/15 text-danger px-2 py-0.5 rounded-full">{alerts.length} new</span>
          </div>
          <div className="divide-y divide-[#E4E9F0] dark:divide-border">
            {alerts.map((a, i) => (
              <div key={i} className="flex gap-3 px-4 py-3">
                <div className={cn("mt-0.5 shrink-0", a.type === "warning" ? "text-warning" : a.type === "danger" ? "text-danger" : "text-brand")}>
                  {a.type === "warning" ? <AlertTriangle className="w-4 h-4" /> : a.type === "danger" ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#1E3A5F] dark:text-foreground/90 leading-relaxed">{a.msg}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" />{a.time}</p>
                </div>
                <button
                  onClick={() => dismissAlert(i)}
                  title="Dismiss alert"
                  className="w-6 h-6 shrink-0 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-[#E4E9F0] dark:hover:bg-muted hover:text-[#1E3A5F] dark:hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {alerts.length === 0 && (
              <p className="px-4 py-8 text-center text-xs text-muted-foreground">All caught up — no open alerts.</p>
            )}
          </div>
          <div className="px-4 py-3 border-t border-[#E4E9F0] dark:border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-success" /> Fill Rate: <strong className="text-[#1E3A5F] dark:text-foreground ml-1">98.4%</strong></span>
              <span className="flex items-center gap-1"><Box className="w-3 h-3 text-brand" /> Utilisation: <strong className="text-[#1E3A5F] dark:text-foreground ml-1">84%</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory summary */}
      <div className="rounded-2xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-[#1E3A5F] dark:text-foreground">Inventory Snapshot</h2>
          <Link href="/portal/inventory" className="flex items-center gap-1 text-xs text-[#1E3A5F] dark:text-brand hover:underline">
            Full inventory <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { zone: "Zone A — Pharma", count: 128, pct: 72, color: "bg-brand" },
            { zone: "Zone B — OTC", count: 94, pct: 58, color: "bg-success" },
            { zone: "Zone C — Cold", count: 76, pct: 91, color: "bg-danger" },
            { zone: "Zone D — Bulk", count: 44, pct: 35, color: "bg-warning" },
          ].map((z, i) => (
            <div key={i} className="p-3 rounded-xl bg-[#F7F9FC] dark:bg-muted/30 border border-[#E4E9F0] dark:border-border">
              <p className="text-[10px] font-semibold text-[#1E3A5F] dark:text-foreground/80 mb-1 truncate">{z.zone}</p>
              <p className="text-lg font-bold text-[#1E3A5F] dark:text-foreground">{z.count} <span className="text-xs font-normal text-muted-foreground">SKUs</span></p>
              <div className="mt-2 h-1.5 bg-[#E4E9F0] dark:bg-muted rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", z.color)} style={{ width: `${z.pct}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{z.pct}% utilisation</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent order detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Recent order detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Order ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="SKU" value={<span className="font-mono">{detail.sku}</span>} />
            <DetailRow label="Description" value={detail.desc} />
            <DetailRow label="Placed" value={detail.date} />
            <DetailRow label="ETA" value={detail.eta} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusColor[detail.status] ?? "bg-muted text-muted-foreground")}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>
    </div>
  )
}
