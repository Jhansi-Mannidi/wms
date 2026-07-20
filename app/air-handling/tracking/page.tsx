"use client"

import { useState } from "react"
import { Search, Package, Download, CheckCircle2, Truck, Wind, MapPin, ArrowRight, Plane, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

type Branch = "local" | "export"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type AirShipment = {
  ref: string
  consignee: string
  initials: string
  color: string
  branch: Branch
  dest: string
  weight: string
  awb: string
  stage: number
  eta: string
  carrier?: string
  flight?: string
  uld?: string
}

const initialShipments: AirShipment[] = [
  { ref: "AIR-LOC-003", consignee: "MedLine Hospital", initials: "ML", color: "bg-rose-500", branch: "local", dest: "Banjara Hills", weight: "5.5 kg", awb: "DL884732910", stage: 3, eta: "Today", carrier: "Delhivery" },
  { ref: "AIR-EXP-001", consignee: "TechParts GmbH", initials: "TG", color: "bg-blue-500", branch: "export", dest: "FRA", weight: "18.4 kg", awb: "VF-HAWB-2024-0052", stage: 4, eta: "26 Jul 2026", flight: "6E 1234", uld: "PMC12345AI" },
  { ref: "AIR-LOC-006", consignee: "HealthPlus Clinic", initials: "HP", color: "bg-emerald-500", branch: "local", dest: "Gachibowli", weight: "0.9 kg", awb: "VF-D-00247", stage: 2, eta: "Today", carrier: "Own Fleet" },
  { ref: "AIR-EXP-002", consignee: "MedDevice UK", initials: "MD", color: "bg-violet-500", branch: "export", dest: "LHR", weight: "5.2 kg", awb: "VF-HAWB-2024-0051", stage: 5, eta: "28 Jul 2026", flight: "AI 112", uld: "PMC12345AI" },
  { ref: "AIR-LOC-007", consignee: "PharmaDist Mumbai", initials: "PD", color: "bg-blue-500", branch: "local", dest: "Andheri East", weight: "12.4 kg", awb: "VF-D-00248", stage: 1, eta: "Today", carrier: "Own Fleet" },
  { ref: "AIR-EXP-003", consignee: "Pharma Riyadh LLC", initials: "PR", color: "bg-rose-500", branch: "export", dest: "RUH", weight: "39.5 kg", awb: "VF-HAWB-2024-0053", stage: 2, eta: "29 Jul 2026", flight: "SV 758", uld: "AKE45821SV" },
  { ref: "AIR-LOC-008", consignee: "TechStore Pune", initials: "TS", color: "bg-emerald-500", branch: "local", dest: "Kothrud", weight: "7.2 kg", awb: "DL884733015", stage: 3, eta: "Today", carrier: "Delhivery" },
  { ref: "AIR-EXP-004", consignee: "Orient Importers SG", initials: "OI", color: "bg-orange-500", branch: "export", dest: "SIN", weight: "61.5 kg", awb: "VF-HAWB-2024-0054", stage: 3, eta: "30 Jul 2026", flight: "SQ 423", uld: "PMC88120SQ" },
  { ref: "AIR-LOC-009", consignee: "Organic Mart Nashik", initials: "OM", color: "bg-orange-500", branch: "local", dest: "Panchavati", weight: "22.5 kg", awb: "VF-D-00249", stage: 2, eta: "Today", carrier: "Own Fleet" },
  { ref: "AIR-LOC-010", consignee: "Workshop Nashik", initials: "WN", color: "bg-cyan-500", branch: "local", dest: "Satpur MIDC", weight: "18.3 kg", awb: "BD772910445", stage: 0, eta: "Tomorrow", carrier: "BlueDart" },
  { ref: "AIR-EXP-005", consignee: "Retail Group Doha", initials: "RG", color: "bg-amber-500", branch: "export", dest: "DOH", weight: "47.0 kg", awb: "VF-HAWB-2024-0055", stage: 1, eta: "31 Jul 2026", flight: "QR 501", uld: "AKE45822QR" },
  { ref: "AIR-LOC-011", consignee: "GadgetHub Indore", initials: "GH", color: "bg-violet-500", branch: "local", dest: "Vijay Nagar", weight: "16.9 kg", awb: "DL884733102", stage: 2, eta: "Today", carrier: "Delhivery" },
  { ref: "AIR-EXP-006", consignee: "Muscat Distributors", initials: "MU", color: "bg-indigo-500", branch: "export", dest: "MCT", weight: "29.6 kg", awb: "VF-HAWB-2024-0056", stage: 5, eta: "24 Jul 2026", flight: "WY 202", uld: "PMC88121WY" },
  { ref: "AIR-LOC-012", consignee: "MedPlus Pune", initials: "MP", color: "bg-rose-500", branch: "local", dest: "Baner", weight: "7.5 kg", awb: "VF-D-00250", stage: 3, eta: "Today", carrier: "Own Fleet" },
]

const localStages = ["Received", "Routed (Local)", "Out-for-Delivery", "Delivered"]
const exportStages = ["Received", "Routed (Export)", "Loaded (ULD)", "Handed to Airline", "In-Transit", "Arrived"]

/** Documents surfaced in the Docs drawer, per branch. */
const localDocs = ["Delivery Run Sheet", "Proof of Delivery", "Handling-In Receipt"]
const exportDocs = ["House Air Waybill (HAWB)", "Master Air Waybill (MAWB)", "ULD Manifest", "Export Declaration"]

export default function AirTrackingPage() {
  const [shipments, setShipments] = useState<AirShipment[]>(initialShipments)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "local" | "export">("all")
  const [selected, setSelected] = useState<string>(initialShipments[0].ref)
  const [docsOpen, setDocsOpen] = useState(false)
  const [advanceTarget, setAdvanceTarget] = useState<AirShipment | null>(null)

  const filtered = shipments.filter(s => {
    const matchSearch = s.ref.toLowerCase().includes(search.toLowerCase()) || s.consignee.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === "all" || s.branch === filter
    return matchSearch && matchFilter
  })

  const detail = shipments.find(s => s.ref === selected)
  const stages = detail?.branch === "local" ? localStages : exportStages
  const docs = detail?.branch === "local" ? localDocs : exportDocs
  const atFinalStage = detail ? detail.stage >= stages.length - 1 : true

  function advanceStage(s: AirShipment) {
    const stageList = s.branch === "local" ? localStages : exportStages
    if (s.stage >= stageList.length - 1) return
    const nextStage = s.stage + 1
    setShipments(prev => prev.map(x => x.ref === s.ref ? { ...x, stage: nextStage } : x))
    notify.success("Shipment advanced", `${s.ref} is now at “${stageList[nextStage]}”.`)
  }

  return (
    <div className="p-6 h-full">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">Air Shipment Tracking</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Unified tracking for local delivery and export shipments</p>
      </div>

      <div className="flex gap-5 h-[calc(100%-80px)]">
        {/* Left panel */}
        <div className="w-80 shrink-0 flex flex-col gap-3">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-card">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search shipment..."
              className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground/60" />
          </div>
          <div className="flex gap-1">
            {(["all","local","export"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn("flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors",
                  filter === f ? "bg-brand text-white" : "bg-muted/40 text-muted-foreground hover:text-foreground")}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {filtered.map(s => {
              const stages2 = s.branch === "local" ? localStages : exportStages
              return (
                <button key={s.ref} onClick={() => setSelected(s.ref)}
                  className={cn("w-full text-left p-4 rounded-xl border transition-all",
                    selected === s.ref ? "border-brand bg-brand/10" : "border-border bg-card hover:border-brand/40")}>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0", s.color)}>{s.initials}</div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{s.consignee}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{s.ref}</p>
                    </div>
                    <span className={cn("ml-auto shrink-0 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase",
                      s.branch === "local" ? "bg-success/15 text-success" : "bg-brand/15 text-brand")}>
                      {s.branch}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
                    <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {s.dest}</span>
                    <span className="text-foreground font-medium">{stages2[s.stage]}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {stages2.map((_, i) => (
                      <div key={i} className={cn("flex-1 h-1 rounded-full", i <= s.stage ? "bg-brand" : "bg-muted")} />
                    ))}
                  </div>
                </button>
              )
            })}
            {filtered.length === 0 && (
              <div className="p-6 text-center text-xs text-muted-foreground rounded-xl border border-dashed border-border">
                No shipments match your search or filter.
              </div>
            )}
          </div>
        </div>

        {/* Right detail */}
        {detail && (
          <div className="flex-1 overflow-y-auto space-y-5">
            <div className="p-5 rounded-xl border border-border bg-card">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white font-bold", detail.color)}>{detail.initials}</div>
                  <div>
                    <p className="font-bold text-foreground">{detail.consignee}</p>
                    <p className="text-xs text-muted-foreground font-mono">{detail.ref}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs px-2.5 py-1 rounded-full font-semibold",
                    detail.branch === "local" ? "bg-success/15 text-success" : "bg-brand/15 text-brand")}>
                    {detail.branch === "local" ? "Local Delivery" : "Export"}
                  </span>
                  <button onClick={() => setDocsOpen(true)} title="View shipment documents" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground">
                    <Download className="w-3.5 h-3.5" /> Docs
                  </button>
                  {!atFinalStage && (
                    <button onClick={() => setAdvanceTarget(detail)} title="Advance to the next tracking stage"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand/90 transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" /> Advance Stage
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Destination", value: detail.dest },
                  { label: "Chargeable Wt", value: detail.weight },
                  { label: "AWB / Ref", value: detail.awb },
                  { label: "ETA", value: detail.eta },
                ].map(r => (
                  <div key={r.label}>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{r.label}</p>
                    <p className="text-sm font-semibold text-foreground font-mono truncate">{r.value}</p>
                  </div>
                ))}
              </div>
              {detail.branch === "export" && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {detail.flight && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                      <Plane className="w-4 h-4 text-brand shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">Flight</p>
                        <p className="text-sm font-semibold text-foreground">{detail.flight}</p>
                      </div>
                    </div>
                  )}
                  {detail.uld && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                      <Package className="w-4 h-4 text-brand shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">ULD</p>
                        <p className="text-sm font-semibold text-foreground">{detail.uld}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {detail.branch === "local" && detail.carrier && (
                <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                  <Truck className="w-4 h-4 text-brand shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Carrier</p>
                    <p className="text-sm font-semibold text-foreground">{detail.carrier}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="p-5 rounded-xl border border-border bg-card">
              <h3 className="text-sm font-bold text-foreground mb-5">
                Shipment Timeline · {detail.branch === "local" ? "Local Delivery" : "Export"} Branch
              </h3>
              <div className="relative">
                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border" />
                <div className="space-y-5">
                  {stages.map((stage, i) => {
                    const done = i <= detail.stage
                    const current = i === detail.stage
                    const localIcons = [Package, Wind, Truck, CheckCircle2]
                    const exportIcons = [Package, Wind, Package, Plane, ArrowRight, CheckCircle2]
                    const iconArr = detail.branch === "local" ? localIcons : exportIcons
                    const Icon = iconArr[i] ?? Package
                    return (
                      <div key={stage} className="relative flex items-start gap-4 pl-11">
                        <div className={cn(
                          "absolute left-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                          current ? "border-brand bg-brand text-white shadow-lg shadow-brand/30" :
                          done ? "border-success bg-success/15 text-success" :
                          "border-border bg-muted text-muted-foreground"
                        )}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 pb-1">
                          <p className={cn("text-sm font-semibold", done ? "text-foreground" : "text-muted-foreground")}>{stage}</p>
                          {current && <p className="text-xs text-brand font-medium mt-0.5">Currently at this stage</p>}
                          {detail.branch === "export" && i === 3 && done && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {detail.flight} · {detail.uld}
                            </p>
                          )}
                          {detail.branch === "local" && i === 3 && done && (
                            <p className="text-xs text-success mt-0.5 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> POD Captured
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
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
        title={`Documents — ${detail?.ref ?? ""}`}
        description="Paperwork attached to this shipment"
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
              <DetailRow label="Consignee" value={detail.consignee} />
              <DetailRow label="AWB / Ref" value={<span className="font-mono">{detail.awb}</span>} />
              <DetailRow label="Branch" value={detail.branch === "local" ? "Local Delivery" : "Export"} />
            </div>
            <div className="space-y-2">
              {docs.map(d => (
                <div key={d} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm text-foreground">
                    <FileText className="h-4 w-4 text-brand shrink-0" /> {d}
                  </span>
                  <button
                    onClick={() => notify.info("Document downloaded", `${d} for ${detail.ref} generated as PDF.`)}
                    title={`Download ${d}`}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
                    <Download className="h-3 w-3" /> Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Drawer>

      {/* Advance confirmation */}
      <ConfirmDialog
        open={!!advanceTarget}
        onOpenChange={(o) => !o && setAdvanceTarget(null)}
        title="Advance this shipment?"
        message={advanceTarget
          ? `${advanceTarget.ref} will move to “${(advanceTarget.branch === "local" ? localStages : exportStages)[advanceTarget.stage + 1]}”. Milestones are reported to the consignee.`
          : ""}
        confirmLabel="Advance Stage"
        cancelLabel="Cancel"
        tone="brand"
        onConfirm={() => advanceTarget && advanceStage(advanceTarget)}
      />
    </div>
  )
}
