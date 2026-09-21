"use client"

import { useState } from "react"
import { Truck, Plane, AlertTriangle, CheckCircle2, Weight, Eye, Undo2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"
import { DEMO_AIR_ROUTING_EXPORT, DEMO_AIR_ROUTING_LOCAL } from "@/lib/fixtures/demo"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type AwaitingPkg = {
  id: string; shipper: string; shipperInit: string; shipperColor: string
  consignee: string; consigneeCity: string; actualKg: number; volKg: number
  service: string; dg: boolean
}

const awaitingRouting: AwaitingPkg[] = [
  { id: "PKG-0441", shipper: "Apex Pharma Ltd", shipperInit: "AP", shipperColor: "bg-blue-500", consignee: "PharmaDist Mumbai", consigneeCity: "Mumbai, IN", actualKg: 12.4, volKg: 14.2, service: "Express", dg: false },
  { id: "PKG-0446", shipper: "GlobalTex Fabrics", shipperInit: "GT", shipperColor: "bg-amber-500", consignee: "Buyer Co. Dubai", consigneeCity: "Dubai, AE", actualKg: 28.0, volKg: 22.0, service: "Standard", dg: false },
  { id: "PKG-0447", shipper: "Sunrise Electronics", shipperInit: "SE", shipperColor: "bg-emerald-500", consignee: "TechRetail Pune", consigneeCity: "Pune, IN", actualKg: 5.6, volKg: 7.2, service: "Express", dg: false },
  { id: "PKG-0448", shipper: "MediSupply Corp", shipperInit: "MS", shipperColor: "bg-rose-500", consignee: "Al-Shifa Hospital", consigneeCity: "Riyadh, SA", actualKg: 8.0, volKg: 6.5, service: "Priority", dg: true },
  { id: "PKG-0449", shipper: "FreshFarm Organics", shipperInit: "FF", shipperColor: "bg-orange-500", consignee: "Organic Mart", consigneeCity: "Nashik, IN", actualKg: 22.5, volKg: 20.0, service: "Standard", dg: false },
  { id: "PKG-0450", shipper: "Nova Textiles Pvt", shipperInit: "NT", shipperColor: "bg-violet-500", consignee: "Fashion Hub Delhi", consigneeCity: "Delhi, IN", actualKg: 16.4, volKg: 18.9, service: "Standard", dg: false },
  { id: "PKG-0451", shipper: "AutoParts India", shipperInit: "AI", shipperColor: "bg-cyan-500", consignee: "Workshop Nashik", consigneeCity: "Nashik, IN", actualKg: 25.1, volKg: 21.0, service: "Standard", dg: false },
  { id: "PKG-0452", shipper: "Apex Pharma Ltd", shipperInit: "AP", shipperColor: "bg-blue-500", consignee: "ClinicChain Nagpur", consigneeCity: "Nagpur, IN", actualKg: 6.2, volKg: 8.4, service: "Priority", dg: true },
  { id: "PKG-0453", shipper: "Orient Spices Co", shipperInit: "OS", shipperColor: "bg-orange-500", consignee: "Importer Singapore", consigneeCity: "Singapore, SG", actualKg: 61.5, volKg: 54.0, service: "Standard", dg: false },
  { id: "PKG-0454", shipper: "Sunrise Electronics", shipperInit: "SE", shipperColor: "bg-emerald-500", consignee: "GadgetHub Indore", consigneeCity: "Indore, IN", actualKg: 14.7, volKg: 16.9, service: "Express", dg: false },
  { id: "PKG-0455", shipper: "Vertex Tools Ltd", shipperInit: "VT", shipperColor: "bg-indigo-500", consignee: "Hardware Rajkot", consigneeCity: "Rajkot, IN", actualKg: 33.7, volKg: 29.5, service: "Standard", dg: false },
  { id: "PKG-0456", shipper: "MediSupply Corp", shipperInit: "MS", shipperColor: "bg-rose-500", consignee: "Distributor Muscat", consigneeCity: "Muscat, OM", actualKg: 29.6, volKg: 26.2, service: "Priority", dg: true },
  { id: "PKG-0457", shipper: "BlueLeaf Cosmetics", shipperInit: "BL", shipperColor: "bg-amber-500", consignee: "Salon Chain Delhi", consigneeCity: "Delhi, IN", actualKg: 4.4, volKg: 6.8, service: "Express", dg: false },
  { id: "PKG-0458", shipper: "GlobalTex Fabrics", shipperInit: "GT", shipperColor: "bg-amber-500", consignee: "Retail Group Doha", consigneeCity: "Doha, QA", actualKg: 44.2, volKg: 47.0, service: "Standard", dg: false },
]

export default function RoutingBoardPage() {
  const [pending, setPending] = useState<AwaitingPkg[]>(awaitingRouting)
  const [local, setLocal] = useState<AwaitingPkg[]>(DEMO_AIR_ROUTING_LOCAL)
  const [exportList, setExportList] = useState<AwaitingPkg[]>(DEMO_AIR_ROUTING_EXPORT)
  const [selected, setSelected] = useState<string[]>([])

  const [detail, setDetail] = useState<AwaitingPkg | null>(null)
  const [clearTarget, setClearTarget] = useState<AwaitingPkg | null>(null)

  const route = (pkg: AwaitingPkg, dest: "local" | "export") => {
    setPending(p => p.filter(x => x.id !== pkg.id))
    if (dest === "local") setLocal(l => [...l, pkg])
    else setExportList(e => [...e, pkg])
    setSelected(s => s.filter(x => x !== pkg.id))
    notify.success(
      dest === "local" ? "Routed to local delivery" : "Routed to export",
      `${pkg.id} — ${pkg.consignee} (${pkg.consigneeCity}).`,
    )
  }

  const routeSelected = (dest: "local" | "export") => {
    const pkgs = pending.filter(p => selected.includes(p.id))
    if (pkgs.length === 0) return
    const blocked = pkgs.filter(p => p.dg)
    const routable = pkgs.filter(p => !p.dg)
    if (routable.length === 0) {
      notify.error("Nothing routed", "Every selected package is DG-flagged. Clear the flags first.")
      return
    }
    const routableIds = routable.map(p => p.id)
    setPending(p => p.filter(x => !routableIds.includes(x.id)))
    if (dest === "local") setLocal(l => [...l, ...routable])
    else setExportList(e => [...e, ...routable])
    setSelected(blocked.map(p => p.id))
    notify.success(
      dest === "local" ? "Routed to local delivery" : "Routed to export",
      blocked.length > 0
        ? `${routable.length} package(s) routed · ${blocked.length} held for DG screening.`
        : `${routable.length} package(s) routed.`,
    )
  }

  const clearDgFlag = (pkg: AwaitingPkg) => {
    setPending(p => p.map(x => x.id === pkg.id ? { ...x, dg: false } : x))
    notify.success("DG flag cleared", `${pkg.id} passed screening and can now be routed.`)
  }

  const unroute = (pkg: AwaitingPkg, from: "local" | "export") => {
    if (from === "local") setLocal(l => l.filter(x => x.id !== pkg.id))
    else setExportList(e => e.filter(x => x.id !== pkg.id))
    setPending(p => [pkg, ...p])
    notify.info("Routing undone", `${pkg.id} is back in the pending queue.`)
  }

  const toggleSelect = (id: string) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold text-foreground">Routing Decision Board</h1>
          <p className="text-xs text-muted-foreground">{pending.length} packages awaiting routing decision</p>
        </div>
        {selected.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{selected.length} selected</span>
            <button onClick={() => routeSelected("local")} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-semibold hover:bg-blue-500/30 transition-colors border border-blue-500/30">
              <Truck className="w-3.5 h-3.5" /> Route All Local
            </button>
            <button onClick={() => routeSelected("export")} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-semibold hover:bg-amber-500/30 transition-colors border border-amber-500/30">
              <Plane className="w-3.5 h-3.5" /> Route All Export
            </button>
          </div>
        )}
      </div>

      {/* Pending queue */}
      <div className="space-y-3 mb-8">
        {pending.map(pkg => {
          const chargeable = Math.max(pkg.actualKg, pkg.volKg)
          const isVol = pkg.volKg > pkg.actualKg
          return (
            <div key={pkg.id} className={cn("p-5 rounded-xl border bg-card transition-all", selected.includes(pkg.id) ? "border-brand bg-brand/5" : "border-border hover:border-brand/30")}>
              <div className="flex items-start gap-4">
                <input type="checkbox" checked={selected.includes(pkg.id)} onChange={() => toggleSelect(pkg.id)} className="mt-1 rounded" />
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0", pkg.shipperColor)}>{pkg.shipperInit}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{pkg.shipper}</p>
                    <p className="text-xs text-muted-foreground truncate">{pkg.id} · {pkg.consignee} · {pkg.consigneeCity}</p>
                  </div>
                </div>
                {/* Chargeable weight chip */}
                <div className="ml-auto shrink-0 flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border", isVol ? "bg-warning/10 border-warning/30 text-warning" : "bg-brand/10 border-brand/30 text-brand")}>
                      <Weight className="w-3.5 h-3.5" />
                      Chargeable: {chargeable} kg
                      {isVol && <span className="text-[10px]">(vol)</span>}
                    </div>
                    <button onClick={() => setDetail(pkg)} title="View package details" className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Actual: {pkg.actualKg} kg · Vol: {pkg.volKg} kg · {pkg.service}</p>
                </div>
              </div>

              {pkg.dg && (
                <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-danger/10 border border-danger/30">
                  <AlertTriangle className="w-3.5 h-3.5 text-danger shrink-0" />
                  <span className="text-xs text-danger font-medium">DG / Dangerous Goods — screening required before routing</span>
                  <button onClick={() => setClearTarget(pkg)} title="Clear the DG screening flag" className="ml-auto text-xs font-semibold text-danger border border-danger/40 px-2 py-0.5 rounded-md hover:bg-danger/10 transition-colors">Clear Flag</button>
                </div>
              )}

              {/* Fork buttons */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={() => !pkg.dg && route(pkg, "local")}
                  disabled={pkg.dg}
                  className={cn(
                    "flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all border-2",
                    pkg.dg
                      ? "opacity-40 cursor-not-allowed border-border text-muted-foreground"
                      : "border-blue-500/40 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/60"
                  )}>
                  <Truck className="w-5 h-5" />
                  Local Delivery / Courier
                </button>
                <button
                  onClick={() => !pkg.dg && route(pkg, "export")}
                  disabled={pkg.dg}
                  className={cn(
                    "flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all border-2",
                    pkg.dg
                      ? "opacity-40 cursor-not-allowed border-border text-muted-foreground"
                      : "border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/60"
                  )}>
                  <Plane className="w-5 h-5" />
                  Export
                </button>
              </div>
            </div>
          )
        })}

        {pending.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border text-muted-foreground">
            <CheckCircle2 className="w-10 h-10 mb-2 text-success opacity-60" />
            <p className="text-sm font-medium">All packages routed</p>
          </div>
        )}
      </div>

      {/* Routed summary */}
      {(local.length > 0 || exportList.length > 0) && (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5">
            <h3 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-1.5"><Truck className="w-4 h-4" /> Routed — Local ({local.length})</h3>
            <div className="space-y-1">
              {local.map(p => (
                <div key={p.id} className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">{p.id} · {p.consigneeCity}</p>
                  <div className="flex items-center gap-1">
                    <RowActions
                      items={[
                        { label: "View package details", icon: <Eye />, onSelect: () => setDetail(p) },
                        { label: "Undo routing", icon: <Undo2 />, onSelect: () => unroute(p, "local") },
                      ]}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
            <h3 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-1.5"><Plane className="w-4 h-4" /> Routed — Export ({exportList.length})</h3>
            <div className="space-y-1">
              {exportList.map(p => (
                <div key={p.id} className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">{p.id} · {p.consigneeCity}</p>
                  <div className="flex items-center gap-1">
                    <RowActions
                      items={[
                        { label: "View package details", icon: <Eye />, onSelect: () => setDetail(p) },
                        { label: "Undo routing", icon: <Undo2 />, onSelect: () => unroute(p, "export") },
                      ]}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Package detail */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Package routing detail"
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
            <DetailRow label="Destination" value={detail.consigneeCity} />
            <DetailRow label="Actual Weight" value={`${detail.actualKg} kg`} />
            <DetailRow label="Volumetric Weight" value={`${detail.volKg} kg`} />
            <DetailRow label="Chargeable Weight" value={`${Math.max(detail.actualKg, detail.volKg)} kg${detail.volKg > detail.actualKg ? " (volumetric)" : ""}`} />
            <DetailRow label="Service" value={detail.service} />
            <DetailRow label="DG Flag" value={detail.dg
              ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-danger/10 text-danger">Screening required</span>
              : <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">Cleared</span>} />
          </div>
        )}
      </Drawer>

      {/* Clear DG flag confirmation */}
      <ConfirmDialog
        open={!!clearTarget}
        onOpenChange={(o) => !o && setClearTarget(null)}
        title="Clear the DG flag?"
        message={`Confirm that ${clearTarget?.id} has passed dangerous-goods screening. It will become routable immediately.`}
        confirmLabel="Clear Flag"
        cancelLabel="Keep Flagged"
        tone="brand"
        onConfirm={() => clearTarget && clearDgFlag(clearTarget)}
      />
    </div>
  )
}
