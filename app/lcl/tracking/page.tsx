"use client"

import { useState } from "react"
import { Search, Package, ArrowRight, Download, CheckCircle2, Clock, Truck, Ship, MapPin, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

// `type` (not `interface`) so rows stay assignable to Record<string, unknown> consumers
type Shipment = {
  ref: string; shipper: string; initials: string; color: string; pod: string
  pieces: number; cbm: number; eta: string; stage: number; mode: string; consol: string
}

const initialShipments: Shipment[] = [
  { ref: "CFS-2024-0451", shipper: "Apex Pharma Ltd", initials: "AP", color: "bg-blue-500", pod: "INMUN", pieces: 48, cbm: 8.2, eta: "28 Jul 2026", stage: 4, mode: "LCL", consol: "CONSOL-2024-087" },
  { ref: "CFS-2024-0452", shipper: "GlobalTex Fabrics", initials: "GT", color: "bg-amber-500", pod: "INCKP", pieces: 120, cbm: 22.4, eta: "2 Aug 2026", stage: 2, mode: "LCL", consol: "CONSOL-2024-088" },
  { ref: "CFS-2024-0453", shipper: "MediSupply Corp", initials: "MS", color: "bg-rose-500", pod: "INHYD", pieces: 36, cbm: 4.6, eta: "31 Jul 2026", stage: 3, mode: "LCL", consol: "CONSOL-2024-087" },
  { ref: "CFS-2024-0454", shipper: "Sunrise Electronics", initials: "SE", color: "bg-emerald-500", pod: "INMUN", pieces: 24, cbm: 5.1, eta: "28 Jul 2026", stage: 5, mode: "LCL", consol: "CONSOL-2024-087" },
]

const stages = ["Received", "Consolidated", "Loaded", "Shipped", "In-Transit", "Arrived"]

const SHIPMENT_DOCS = ["House Bill of Lading", "Commercial Invoice", "Packing List", "Certificate of Origin"]

export default function LCLTrackingPage() {
  const [shipments, setShipments] = useState<Shipment[]>(initialShipments)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string | null>(initialShipments[0].ref)
  const [docsOpen, setDocsOpen] = useState(false)
  const [advanceOpen, setAdvanceOpen] = useState(false)

  const filtered = shipments.filter(s =>
    s.ref.toLowerCase().includes(search.toLowerCase()) ||
    s.shipper.toLowerCase().includes(search.toLowerCase())
  )

  const detail = shipments.find(s => s.ref === selected)

  function advanceStage(s: Shipment) {
    const nextStage = Math.min(s.stage + 1, stages.length - 1)
    setShipments(prev => prev.map(x => x.ref === s.ref ? { ...x, stage: nextStage } : x))
    notify.success("Shipment advanced", `${s.ref} is now ${stages[nextStage]}.`)
  }

  return (
    <div className="p-6 h-full">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">Shipper Cargo Tracking</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Live status for all LCL shipments</p>
      </div>

      <div className="flex gap-6 h-[calc(100%-80px)]">
        {/* Left: shipment list */}
        <div className="w-80 shrink-0 flex flex-col gap-3">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-card">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search shipment or shipper..."
              className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground/60" />
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {filtered.map(s => (
              <button key={s.ref} onClick={() => setSelected(s.ref)} title={`View ${s.ref}`}
                className={cn("w-full text-left p-4 rounded-xl border transition-all",
                  selected === s.ref ? "border-brand bg-brand/10" : "border-border bg-card hover:border-brand/40")}>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0", s.color)}>{s.initials}</div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{s.shipper}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{s.ref}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" /> {s.pod}
                  </span>
                  <span className={cn("px-1.5 py-0.5 rounded-full font-semibold",
                    s.stage >= 5 ? "bg-success/15 text-success" :
                    s.stage >= 3 ? "bg-brand/15 text-brand" : "bg-muted text-muted-foreground")}>
                    {stages[s.stage]}
                  </span>
                </div>
                {/* Mini progress */}
                <div className="mt-2 flex gap-0.5">
                  {stages.map((_, i) => (
                    <div key={i} className={cn("flex-1 h-1 rounded-full",
                      i <= s.stage ? "bg-brand" : "bg-muted")} />
                  ))}
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-dashed border-border text-muted-foreground">
                <Package className="w-8 h-8 mb-2 opacity-30" />
                <span className="text-xs">No shipments match your search.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: detail */}
        {detail && (
          <div className="flex-1 overflow-y-auto space-y-5">
            {/* Header */}
            <div className="p-5 rounded-xl border border-border bg-card">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm", detail.color)}>{detail.initials}</div>
                  <div>
                    <p className="font-bold text-foreground">{detail.shipper}</p>
                    <p className="text-xs text-muted-foreground font-mono">{detail.ref} · {detail.consol}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {detail.stage < stages.length - 1 && (
                    <button onClick={() => setAdvanceOpen(true)} title="Advance to next stage"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand/90 transition-colors">
                      Advance to {stages[detail.stage + 1]} <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={() => setDocsOpen(true)} title="View shipment documents"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Download className="w-3.5 h-3.5" /> Documents
                  </button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Destination", value: detail.pod },
                  { label: "Pieces", value: `${detail.pieces} pcs` },
                  { label: "CBM", value: `${detail.cbm} m³` },
                  { label: "ETA", value: detail.eta },
                ].map(r => (
                  <div key={r.label}>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{r.label}</p>
                    <p className="text-sm font-semibold text-foreground">{r.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Status timeline */}
            <div className="p-5 rounded-xl border border-border bg-card">
              <h3 className="text-sm font-bold text-foreground mb-5">Shipment Timeline</h3>
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border" />
                <div className="space-y-6">
                  {stages.map((stage, i) => {
                    const done = i <= detail.stage
                    const current = i === detail.stage
                    const icons = [Package, Package, Ship, Ship, Truck, CheckCircle2]
                    const Icon = icons[i] ?? Clock
                    const dates = ["19 Jul 2026 09:14", "20 Jul 2026 15:30", "21 Jul 2026 08:00", "22 Jul 2026 14:22", "", ""]
                    return (
                      <div key={stage} className="relative flex items-start gap-4 pl-10">
                        {/* Node */}
                        <div className={cn(
                          "absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                          current ? "border-brand bg-brand text-white shadow-lg shadow-brand/30" :
                          done ? "border-success bg-success/20 text-success" :
                          "border-border bg-muted text-muted-foreground"
                        )}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="flex items-center justify-between">
                            <p className={cn("text-sm font-semibold", done ? "text-foreground" : "text-muted-foreground")}>{stage}</p>
                            {dates[i] && <span className="text-[10px] text-muted-foreground">{dates[i]}</span>}
                          </div>
                          {current && (
                            <p className="text-xs text-brand mt-0.5 font-medium">Currently at this stage</p>
                          )}
                          {i === 3 && done && (
                            <p className="text-xs text-muted-foreground mt-0.5">MV Evergreen Joy · Voyage EJ2024-087</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Container ref */}
            <div className="p-5 rounded-xl border border-border bg-card">
              <h3 className="text-sm font-bold text-foreground mb-3">Consolidation Reference</h3>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Ship className="w-5 h-5 text-brand shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-foreground">{detail.consol}</p>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                    <span>INNSA</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                    <span>{detail.pod}</span>
                    <span className="mx-1">·</span>
                    <span>20&apos; FCL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Documents drawer */}
      <Drawer
        open={docsOpen}
        onOpenChange={setDocsOpen}
        title="Shipment Documents"
        description={detail ? `${detail.ref} · ${detail.shipper}` : ""}
        footer={
          <button onClick={() => setDocsOpen(false)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-4">
            <div className="space-y-1">
              <DetailRow label="Shipment" value={<span className="font-mono text-brand">{detail.ref}</span>} />
              <DetailRow label="Shipper" value={detail.shipper} />
              <DetailRow label="Consolidation" value={detail.consol} />
              <DetailRow label="Stage" value={stages[detail.stage]} />
            </div>
            <div className="space-y-2">
              {SHIPMENT_DOCS.map(doc => (
                <div key={doc} className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-background/40">
                  <span className="text-xs font-semibold text-foreground">{doc}</span>
                  <button
                    onClick={() => notify.success(`${doc} downloaded`, `${doc} for ${detail.ref} has been saved.`)}
                    title={`Download ${doc}`}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Download className="w-3 h-3" /> Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Drawer>

      {/* Advance stage confirmation */}
      <ConfirmDialog
        open={advanceOpen}
        onOpenChange={setAdvanceOpen}
        title="Advance this shipment?"
        message={detail ? `${detail.ref} will move from ${stages[detail.stage]} to ${stages[Math.min(detail.stage + 1, stages.length - 1)]}.` : ""}
        confirmLabel="Advance Stage"
        cancelLabel="Cancel"
        tone="brand"
        onConfirm={() => detail && advanceStage(detail)}
      />
    </div>
  )
}
