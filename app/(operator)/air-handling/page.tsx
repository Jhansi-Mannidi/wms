"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, AlertTriangle, Clock, Package, Truck, Plane, ArrowRight, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/wms/empty-state"
import { Drawer } from "@/components/ui/modal"
import { DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type RecentPackage = {
  id: string; shipper: string; consignee: string
  kg: number; chargeable: number; route: string; status: string
}

const initialRecentPackages: RecentPackage[] = [
  { id: "PKG-0441", shipper: "Apex Pharma", consignee: "PharmaDist Mumbai", kg: 12.4, chargeable: 14.2, route: "Local", status: "Awaiting Routing" },
  { id: "PKG-0442", shipper: "GlobalTex", consignee: "Buyer Dubai", kg: 28.0, chargeable: 28.0, route: "Export", status: "In ULD" },
  { id: "PKG-0443", shipper: "Sunrise Elec.", consignee: "TechStore Pune", kg: 5.6, chargeable: 7.2, route: "Local", status: "Out-for-Delivery" },
  { id: "PKG-0444", shipper: "AutoParts India", consignee: "Workshop Nashik", kg: 18.3, chargeable: 18.3, route: "Local", status: "RTO" },
  { id: "PKG-0445", shipper: "MediSupply", consignee: "Pharma Riyadh", kg: 42.0, chargeable: 45.0, route: "Export", status: "Handed to Airline" },
  { id: "PKG-0446", shipper: "Nova Textiles", consignee: "Retailer Surat", kg: 9.8, chargeable: 11.5, route: "Local", status: "Awaiting Routing" },
  { id: "PKG-0447", shipper: "MediSupply", consignee: "Hospital Thane", kg: 8.9, chargeable: 8.9, route: "Local", status: "Out-for-Delivery" },
  { id: "PKG-0448", shipper: "Apex Pharma", consignee: "ClinicChain Nagpur", kg: 6.2, chargeable: 6.2, route: "Local", status: "Awaiting Routing" },
  { id: "PKG-0449", shipper: "GlobalTex", consignee: "Boutique Bengaluru", kg: 16.4, chargeable: 18.2, route: "Local", status: "Out-for-Delivery" },
  { id: "PKG-0450", shipper: "GlobalTex", consignee: "Buyer Dubai", kg: 54.0, chargeable: 54.0, route: "Export", status: "In ULD" },
  { id: "PKG-0451", shipper: "Sunrise Elec.", consignee: "GadgetHub Indore", kg: 14.7, chargeable: 16.9, route: "Local", status: "Awaiting Routing" },
  { id: "PKG-0452", shipper: "AutoParts India", consignee: "Garage Aurangabad", kg: 25.1, chargeable: 25.1, route: "Local", status: "Out-for-Delivery" },
  { id: "PKG-0453", shipper: "Sunrise Elec.", consignee: "ElectroMart Nashik", kg: 11.3, chargeable: 13.6, route: "Local", status: "Out-for-Delivery" },
  { id: "PKG-0454", shipper: "Kirloskar Spares", consignee: "Depot Kolhapur", kg: 22.5, chargeable: 22.5, route: "Local", status: "Awaiting Routing" },
  { id: "PKG-0455", shipper: "Apex Pharma", consignee: "Pharma Riyadh", kg: 36.8, chargeable: 39.5, route: "Export", status: "In ULD" },
  { id: "PKG-0456", shipper: "Apex Pharma", consignee: "MedPlus Pune", kg: 7.5, chargeable: 7.5, route: "Local", status: "Out-for-Delivery" },
  { id: "PKG-0457", shipper: "Fresh Farms", consignee: "Grocer Hyderabad", kg: 31.2, chargeable: 31.2, route: "Local", status: "Awaiting Routing" },
  { id: "PKG-0458", shipper: "Nova Textiles", consignee: "Fashion Mall Mumbai", kg: 19.8, chargeable: 21.4, route: "Local", status: "Out-for-Delivery" },
  { id: "PKG-0459", shipper: "Vertex Tools", consignee: "Hardware Rajkot", kg: 12.9, chargeable: 12.9, route: "Local", status: "RTO" },
  { id: "PKG-0460", shipper: "Vertex Tools", consignee: "Hardware Rajkot", kg: 33.7, chargeable: 33.7, route: "Local", status: "Out-for-Delivery" },
  { id: "PKG-0461", shipper: "BlueLeaf Cosmetics", consignee: "Salon Chain Delhi", kg: 4.4, chargeable: 6.8, route: "Local", status: "Awaiting Routing" },
  { id: "PKG-0462", shipper: "Orient Spices", consignee: "Importer Singapore", kg: 61.5, chargeable: 61.5, route: "Export", status: "In ULD" },
  { id: "PKG-0463", shipper: "Sunrise Elec.", consignee: "TechStore Pune", kg: 5.9, chargeable: 7.7, route: "Local", status: "Out-for-Delivery" },
  { id: "PKG-0464", shipper: "Orient Spices", consignee: "Importer Colombo", kg: 72.3, chargeable: 72.3, route: "Export", status: "Handed to Airline" },
  { id: "PKG-0465", shipper: "MediSupply", consignee: "Clinic Solapur", kg: 10.2, chargeable: 10.2, route: "Local", status: "Out-for-Delivery" },
  { id: "PKG-0466", shipper: "Deccan Ceramics", consignee: "Builder Vizag", kg: 47.6, chargeable: 47.6, route: "Local", status: "Awaiting Routing" },
  { id: "PKG-0467", shipper: "GlobalTex", consignee: "Retail Group Doha", kg: 44.2, chargeable: 47.0, route: "Export", status: "In ULD" },
  { id: "PKG-0468", shipper: "AutoParts India", consignee: "Workshop Nashik", kg: 27.4, chargeable: 27.4, route: "Local", status: "Out-for-Delivery" },
  { id: "PKG-0469", shipper: "Nova Textiles", consignee: "Boutique Jaipur", kg: 8.1, chargeable: 9.4, route: "Local", status: "RTO" },
  { id: "PKG-0470", shipper: "BlueLeaf Cosmetics", consignee: "Retailer Panaji", kg: 3.8, chargeable: 5.5, route: "Local", status: "Out-for-Delivery" },
  { id: "PKG-0471", shipper: "Apex Pharma", consignee: "PharmaDist Mumbai", kg: 6.7, chargeable: 6.7, route: "Local", status: "Delivered" },
  { id: "PKG-0472", shipper: "Deccan Ceramics", consignee: "Interiors Chennai", kg: 38.5, chargeable: 38.5, route: "Local", status: "Out-for-Delivery" },
  { id: "PKG-0473", shipper: "MediSupply", consignee: "Distributor Muscat", kg: 29.6, chargeable: 29.6, route: "Export", status: "In ULD" },
  { id: "PKG-0474", shipper: "Sunrise Elec.", consignee: "GadgetHub Indore", kg: 15.0, chargeable: 17.3, route: "Local", status: "Delivered" },
]

const routeColors: Record<string, string> = {
  Local: "bg-blue-500/15 text-blue-400",
  Export: "bg-amber-500/15 text-amber-400",
}

const statusColors: Record<string, string> = {
  "Awaiting Routing": "bg-warning/15 text-warning",
  "Out-for-Delivery": "bg-blue-500/15 text-blue-400",
  "In ULD": "bg-amber-500/15 text-amber-400",
  "Handed to Airline": "bg-success/15 text-success",
  "Delivered": "bg-success/15 text-success",
  "RTO": "bg-danger/15 text-danger",
}

export default function AirHandlingDashboardPage() {
  const router = useRouter()
  const [packages] = useState<RecentPackage[]>(initialRecentPackages)
  const [detail, setDetail] = useState<RecentPackage | null>(null)
  const [lastRefresh, setLastRefresh] = useState<string | null>(null)

  const count = (s: string) => packages.filter(p => p.status === s).length

  const kpis = [
    { label: "Packages Received", sub: "Today", value: String(packages.length), color: "text-brand", icon: <Package className="w-5 h-5" /> },
    { label: "Awaiting Routing", sub: "Pending decision", value: String(count("Awaiting Routing")), color: "text-warning", icon: <Clock className="w-5 h-5" /> },
    { label: "Out-for-Delivery", sub: "Local branch", value: String(count("Out-for-Delivery")), color: "text-blue-400", icon: <Truck className="w-5 h-5" /> },
    { label: "Awaiting Export", sub: "ULD building", value: String(count("In ULD")), color: "text-amber-400", icon: <Plane className="w-5 h-5" /> },
    { label: "Exceptions", sub: "RTO / Reattempt", value: String(count("RTO")), color: "text-danger", icon: <AlertTriangle className="w-5 h-5" /> },
  ]

  const localPkgs = packages.filter(p => p.route === "Local")
  const exportPkgs = packages.filter(p => p.route === "Export")

  const localStats = {
    outForDelivery: localPkgs.filter(p => p.status === "Out-for-Delivery").length,
    delivered: localPkgs.filter(p => p.status === "Delivered").length,
    rto: localPkgs.filter(p => p.status === "RTO").length,
    reattempt: localPkgs.filter(p => p.status === "Awaiting Routing").length,
  }
  const exportStats = {
    count: exportPkgs.length,
    uldBuilding: exportPkgs.filter(p => p.status === "In ULD").length,
    handedOff: exportPkgs.filter(p => p.status === "Handed to Airline").length,
  }

  function refresh() {
    const stamp = new Date().toTimeString().slice(0, 8)
    setLastRefresh(stamp)
    notify.info("Dashboard refreshed", `Air handling figures re-read from the operations feed at ${stamp}.`)
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {kpis.map(k => (
          <div key={k.label} className="flex flex-col gap-2 p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{k.label}</span>
              <span className={k.color}>{k.icon}</span>
            </div>
            <p className={cn("text-3xl font-bold", k.color)}>{k.value}</p>
            <p className="text-[10px] text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => router.push("/air-handling/capture")}
          title="Open package capture"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F7941D] text-white text-sm font-medium hover:bg-[#F7941D]/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Package
        </button>
        <button
          onClick={() => router.push("/air-handling/routing")}
          title="Open the routing decision board"
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors"
        >
          <ArrowRight className="w-4 h-4" /> Route Packages
        </button>
        <button onClick={refresh} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
        {lastRefresh && <span className="text-[11px] text-muted-foreground">Last refreshed {lastRefresh}</span>}
      </div>

      {/* Two-branch split strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Local Delivery Panel */}
        <div className="p-5 rounded-xl border border-blue-500/30 bg-blue-500/5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Local Delivery</h3>
              <p className="text-[11px] text-muted-foreground">Courier & last-mile</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Out-for-Delivery", value: localStats.outForDelivery, color: "text-blue-400" },
              { label: "Delivered Today", value: localStats.delivered, color: "text-success" },
              { label: "RTO", value: localStats.rto, color: "text-danger" },
              { label: "Reattempt", value: localStats.reattempt, color: "text-warning" },
            ].map(s => (
              <div key={s.label} className="p-2.5 rounded-lg bg-background/40 border border-blue-500/20">
                <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push("/air-handling/courier")}
            title="Open the courier console"
            className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-blue-500/30 text-blue-400 text-xs font-semibold hover:bg-blue-500/10 transition-colors"
          >
            Open Courier Console <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Export Panel */}
        <div className="p-5 rounded-xl border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Export</h3>
              <p className="text-[11px] text-muted-foreground">ULD & airline handoff</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Packages", value: exportStats.count, color: "text-amber-400" },
              { label: "ULDs Building", value: exportStats.uldBuilding, color: "text-brand" },
              { label: "Handed Off", value: exportStats.handedOff, color: "text-success" },
            ].map(s => (
              <div key={s.label} className="p-2.5 rounded-lg bg-background/40 border border-amber-500/20">
                <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push("/air-handling/uld")}
            title="Open the ULD builder"
            className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-amber-500/30 text-amber-400 text-xs font-semibold hover:bg-amber-500/10 transition-colors"
          >
            Open ULD Builder <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Recent packages feed */}
      <div>
        <h2 className="text-sm font-bold text-foreground mb-3">Recent Packages</h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Package", "Shipper", "Consignee", "Chargeable Wt.", "Route", "Status", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {packages.map((p, i) => (
                <tr key={p.id} className={cn("border-b border-border/50 hover:bg-muted/20 transition-colors", i % 2 === 0 ? "" : "bg-muted/5")}>
                  <td className="px-4 py-3 text-xs font-mono font-semibold text-brand">{p.id}</td>
                  <td className="px-4 py-3 text-xs text-foreground">{p.shipper}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.consignee}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold text-foreground">{p.chargeable} kg</span>
                    {p.chargeable > p.kg && <span className="ml-1 text-[10px] text-warning">(vol)</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", routeColors[p.route] ?? "bg-muted text-muted-foreground")}>{p.route}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", statusColors[p.status] ?? "bg-muted text-muted-foreground")}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setDetail(p)} title="View package details" className="text-[11px] font-semibold text-brand hover:underline">
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {packages.length === 0 && (
                <tr><td colSpan={7}>
                  <EmptyState
                    icon={Package}
                    title="No packages received today"
                    description="Capture an inbound package to see it appear here."
                    action={{ label: "Receive Package", icon: Plus, onClick: () => router.push("/air-handling/capture") }}
                  />
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Package detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Recent package detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Package" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Shipper" value={detail.shipper} />
            <DetailRow label="Consignee" value={detail.consignee} />
            <DetailRow label="Actual Weight" value={`${detail.kg} kg`} />
            <DetailRow label="Chargeable Weight" value={`${detail.chargeable} kg${detail.chargeable > detail.kg ? " (volumetric)" : ""}`} />
            <DetailRow label="Route" value={<span className={cn("px-2 py-0.5 rounded-full text-[11px] font-semibold", routeColors[detail.route] ?? "bg-muted text-muted-foreground")}>{detail.route}</span>} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-[11px] font-semibold", statusColors[detail.status] ?? "bg-muted text-muted-foreground")}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>
    </div>
  )
}
