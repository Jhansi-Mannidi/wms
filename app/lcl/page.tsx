"use client"

import { useState } from "react"
import { Plus, Clock, Package, AlertTriangle, BarChart2, ArrowRight, TrendingUp, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Modal, Drawer } from "@/components/ui/modal"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { LCL_DASHBOARD_CONSOLS, LCL_DASHBOARD_RECEIPTS } from "@/lib/fixtures/lcl"

// `type` (not `interface`) so rows stay assignable to Record<string, unknown> consumers
type Consolidation = {
  id: string; route: string; mode: string; cutoff: string
  cbmUsed: number; cbmMax: number; kgUsed: number; kgMax: number; status: string
}

type Receipt = { id: string; shipper: string; cbm: number; pieces: number; status: string; time: string }

const RECEIPT_STATUS_MAP: Record<string, string> = {
  Allocated: "In-CFS",
  "In Pool": "Pending ASN",
  Received: "Received",
}

const initialConsolidations: Consolidation[] = LCL_DASHBOARD_CONSOLS.map(c => ({
  id: c.id,
  route: c.route,
  mode: c.cbmMax >= 50 ? "FCL 40'" : c.shippers >= 4 ? "FCL 20'" : "LCL",
  cutoff: c.cutoff,
  cbmUsed: c.cbm,
  cbmMax: c.cbmMax,
  kgUsed: Math.round(c.cbm * 520),
  kgMax: Math.round(c.cbmMax * 520),
  status: c.status === "Closed" ? "Building" : c.status,
}))

const initialReceipts: Receipt[] = LCL_DASHBOARD_RECEIPTS.map(r => ({
  id: r.id,
  shipper: r.shipper,
  cbm: r.cbm,
  pieces: r.pieces,
  status: RECEIPT_STATUS_MAP[r.status] ?? r.status,
  time: r.time,
}))

const ROUTES = ["INBOM → CNSHA", "INBOM → SGSIN", "INMAA → AEDXB", "INBOM → USNYC", "INNSA → NLRTM"] as const
const MODES = ["LCL", "FCL 20'", "FCL 40'"] as const
const CUTOFFS = ["8h", "23h", "2d", "5d", "7d"] as const
const RECEIPT_STATUSES = ["Received", "In-CFS", "Pending ASN"] as const

const emptyReceiptForm = { id: "", shipper: "", cbm: "", pieces: "", status: "" }
const emptyConsolForm = { route: "", mode: "", cutoff: "", cbmMax: "", kgMax: "" }

function FillGauge({ used, max, label }: { used: number; max: number; label: string }) {
  const pct = Math.round((used / max) * 100)
  const color = pct > 90 ? "bg-danger" : pct > 75 ? "bg-warning" : "bg-success"
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{label}</span>
        <span className={cn("font-bold", pct > 90 ? "text-danger" : pct > 75 ? "text-warning" : "text-success")}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground">
        <span>{used} used</span>
        <span>{max} max</span>
      </div>
    </div>
  )
}

export default function LCLDashboardPage() {
  const [consolidations, setConsolidations] = useState<Consolidation[]>(initialConsolidations)
  const [recentReceipts, setRecentReceipts] = useState<Receipt[]>(initialReceipts)

  const [receiptOpen, setReceiptOpen] = useState(false)
  const [receiptForm, setReceiptForm] = useState(emptyReceiptForm)
  const [receiptErrors, setReceiptErrors] = useState<Record<string, string>>({})

  const [consolOpen, setConsolOpen] = useState(false)
  const [consolForm, setConsolForm] = useState(emptyConsolForm)
  const [consolErrors, setConsolErrors] = useState<Record<string, string>>({})

  const [consolDetail, setConsolDetail] = useState<Consolidation | null>(null)
  const [receiptDetail, setReceiptDetail] = useState<Receipt | null>(null)

  const urgent = consolidations.filter(c => c.cutoff.includes("h") && parseInt(c.cutoff) < 24).length
  const totalCbm = consolidations.reduce((s, c) => s + c.cbmUsed, 0)
  const building = consolidations.filter(c => c.status === "Building").length

  const kpis = [
    { label: "Open Cargo Receipts", value: String(recentReceipts.length), sub: "Awaiting allocation", color: "text-brand", icon: <Package className="w-4 h-4" /> },
    { label: "Consolidations Building", value: String(building), sub: "Active routes", color: "text-blue-400", icon: <BarChart2 className="w-4 h-4" /> },
    { label: "Cutoffs < 24h", value: String(urgent), sub: "Urgent attention", color: "text-warning", icon: <AlertTriangle className="w-4 h-4" /> },
    { label: "Total CBM in CFS", value: totalCbm.toFixed(1), sub: "CBM", color: "text-success", icon: <TrendingUp className="w-4 h-4" /> },
    { label: "Avg Dwell Days", value: "3.4", sub: "Days in CFS", color: "text-muted-foreground", icon: <Clock className="w-4 h-4" /> },
  ]

  function validateReceipt() {
    const e: Record<string, string> = {}
    if (!receiptForm.id.trim()) e.id = "Receipt reference is required"
    else if (recentReceipts.some(r => r.id.toLowerCase() === receiptForm.id.trim().toLowerCase())) e.id = "That receipt reference already exists"
    if (!receiptForm.shipper.trim()) e.shipper = "Shipper is required"
    if (!receiptForm.cbm.trim()) e.cbm = "CBM is required"
    else if (!/^\d+(\.\d+)?$/.test(receiptForm.cbm) || Number(receiptForm.cbm) <= 0) e.cbm = "Enter a positive number"
    if (!receiptForm.pieces.trim()) e.pieces = "Pieces are required"
    else if (!/^\d+$/.test(receiptForm.pieces) || Number(receiptForm.pieces) < 1) e.pieces = "Enter a positive whole number"
    if (!receiptForm.status) e.status = "Select a status"
    setReceiptErrors(e)
    return Object.keys(e).length === 0
  }

  function createReceipt() {
    if (!validateReceipt()) return
    const next: Receipt = {
      id: receiptForm.id.trim().toUpperCase(),
      shipper: receiptForm.shipper.trim(),
      cbm: Number(receiptForm.cbm),
      pieces: Number(receiptForm.pieces),
      status: receiptForm.status,
      time: "just now",
    }
    setRecentReceipts(prev => [next, ...prev])
    setReceiptOpen(false)
    setReceiptForm(emptyReceiptForm)
    setReceiptErrors({})
    notify.success("Cargo receipt created", `${next.id} — ${next.shipper}, ${next.cbm} CBM / ${next.pieces} pcs.`)
  }

  function validateConsol() {
    const e: Record<string, string> = {}
    if (!consolForm.route) e.route = "Select a route"
    if (!consolForm.mode) e.mode = "Select a mode"
    if (!consolForm.cutoff) e.cutoff = "Select a cutoff window"
    if (!consolForm.cbmMax.trim()) e.cbmMax = "Max CBM is required"
    else if (!/^\d+(\.\d+)?$/.test(consolForm.cbmMax) || Number(consolForm.cbmMax) <= 0) e.cbmMax = "Enter a positive number"
    if (!consolForm.kgMax.trim()) e.kgMax = "Max weight is required"
    else if (!/^\d+$/.test(consolForm.kgMax) || Number(consolForm.kgMax) <= 0) e.kgMax = "Enter a positive whole number"
    setConsolErrors(e)
    return Object.keys(e).length === 0
  }

  function createConsolidation() {
    if (!validateConsol()) return
    const nums = consolidations.map(c => Number(c.id.replace("CON-", ""))).filter(n => !Number.isNaN(n))
    const next: Consolidation = {
      id: `CON-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, "0")}`,
      route: consolForm.route,
      mode: consolForm.mode,
      cutoff: consolForm.cutoff,
      cbmUsed: 0,
      cbmMax: Number(consolForm.cbmMax),
      kgUsed: 0,
      kgMax: Number(consolForm.kgMax),
      status: "Building",
    }
    setConsolidations(prev => [next, ...prev])
    setConsolOpen(false)
    setConsolForm(emptyConsolForm)
    setConsolErrors({})
    notify.success("Consolidation opened", `${next.id} — ${next.route} (${next.mode}), cutoff in ${next.cutoff}.`)
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {kpis.map(k => (
          <div key={k.label} className="flex flex-col gap-2 p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{k.label}</span>
              <span className={k.color}>{k.icon}</span>
            </div>
            <p className={cn("text-2xl font-bold", k.color)}>{k.value}</p>
            <p className="text-[10px] text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setReceiptOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F7941D] text-white text-sm font-medium hover:bg-[#F7941D]/90 transition-colors">
          <Plus className="w-4 h-4" /> New Cargo Receipt
        </button>
        <button onClick={() => setConsolOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors">
          <Plus className="w-4 h-4" /> New Consolidation
        </button>
        <button
          onClick={() => notify.info("Console refreshed", `${consolidations.length} consolidations and ${recentReceipts.length} receipts re-synced from CFS.`)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Consolidations building */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-bold text-foreground">Consolidations Building</h2>
          {consolidations.map(c => {
            const cbmPct = Math.round((c.cbmUsed / c.cbmMax) * 100)
            const urgentCutoff = c.cutoff.includes("h") && parseInt(c.cutoff) < 24
            return (
              <div key={c.id} className={cn("p-5 rounded-xl border bg-card transition-all hover:border-brand/40", urgentCutoff ? "border-warning/40" : "border-border")}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{c.route}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand/15 text-brand">{c.mode}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{c.id}</span>
                    </div>
                  </div>
                  <div className={cn("flex items-center gap-1 text-xs font-semibold", urgentCutoff ? "text-warning" : "text-muted-foreground")}>
                    <Clock className="w-3.5 h-3.5" />
                    Cutoff: {c.cutoff}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FillGauge used={c.cbmUsed} max={c.cbmMax} label="CBM Fill" />
                  <FillGauge used={c.kgUsed} max={c.kgMax} label="Weight (kg) Fill" />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    {cbmPct}% full · {(c.cbmMax - c.cbmUsed).toFixed(1)} CBM remaining
                  </span>
                  <button
                    onClick={() => setConsolDetail(c)}
                    title={`Open planner for ${c.id}`}
                    className="flex items-center gap-1 text-xs text-brand hover:underline font-medium"
                  >
                    Open Planner <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent cargo receipts */}
        <div>
          <h2 className="text-sm font-bold text-foreground mb-3">Recent Cargo Receipts</h2>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {recentReceipts.map((r, i) => (
              <button
                key={r.id}
                onClick={() => setReceiptDetail(r)}
                title={`View ${r.id}`}
                className={cn("w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/20 transition-colors", i < recentReceipts.length - 1 ? "border-b border-border/50" : "")}
              >
                <div className="w-8 h-8 rounded-lg bg-brand/15 flex items-center justify-center text-brand shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground font-mono">{r.id}</span>
                    <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                      r.status === "Received" ? "bg-success/15 text-success" :
                      r.status === "In-CFS" ? "bg-brand/15 text-brand" :
                      "bg-warning/15 text-warning"
                    )}>{r.status}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{r.shipper} · {r.cbm} CBM · {r.pieces} pcs</p>
                  <p className="text-[10px] text-muted-foreground/60">{r.time}</p>
                </div>
              </button>
            ))}
            {recentReceipts.length === 0 && (
              <p className="px-4 py-10 text-center text-xs text-muted-foreground">No cargo receipts registered yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* New cargo receipt */}
      <Modal
        open={receiptOpen}
        onOpenChange={(o) => { setReceiptOpen(o); if (!o) { setReceiptForm(emptyReceiptForm); setReceiptErrors({}) } }}
        title="New Cargo Receipt"
        description="Register cargo arriving at the CFS"
        footer={<ModalActions onCancel={() => setReceiptOpen(false)} onSubmit={createReceipt} submitLabel="Create Receipt" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Receipt Ref" required error={receiptErrors.id}>
            <TextInput value={receiptForm.id} invalid={!!receiptErrors.id} onChange={e => setReceiptForm({ ...receiptForm, id: e.target.value })} placeholder="e.g. CR-0895" />
          </Field>
          <Field label="Shipper" required error={receiptErrors.shipper}>
            <TextInput value={receiptForm.shipper} invalid={!!receiptErrors.shipper} onChange={e => setReceiptForm({ ...receiptForm, shipper: e.target.value })} placeholder="e.g. Apex Pharma" />
          </Field>
          <Field label="CBM" required error={receiptErrors.cbm}>
            <TextInput value={receiptForm.cbm} invalid={!!receiptErrors.cbm} onChange={e => setReceiptForm({ ...receiptForm, cbm: e.target.value })} placeholder="e.g. 2.4" inputMode="decimal" />
          </Field>
          <Field label="Pieces" required error={receiptErrors.pieces}>
            <TextInput value={receiptForm.pieces} invalid={!!receiptErrors.pieces} onChange={e => setReceiptForm({ ...receiptForm, pieces: e.target.value })} placeholder="e.g. 18" inputMode="numeric" />
          </Field>
          <Field label="Status" required error={receiptErrors.status}>
            <Select value={receiptForm.status} invalid={!!receiptErrors.status} onChange={e => setReceiptForm({ ...receiptForm, status: e.target.value })} options={RECEIPT_STATUSES} placeholder="Select Status" />
          </Field>
        </div>
      </Modal>

      {/* New consolidation */}
      <Modal
        open={consolOpen}
        onOpenChange={(o) => { setConsolOpen(o); if (!o) { setConsolForm(emptyConsolForm); setConsolErrors({}) } }}
        title="New Consolidation"
        description="Open a consolidation and start allocating receipts"
        footer={<ModalActions onCancel={() => setConsolOpen(false)} onSubmit={createConsolidation} submitLabel="Create Consolidation" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Route" required error={consolErrors.route}>
            <Select value={consolForm.route} invalid={!!consolErrors.route} onChange={e => setConsolForm({ ...consolForm, route: e.target.value })} options={ROUTES} placeholder="Select Route" />
          </Field>
          <Field label="Mode" required error={consolErrors.mode}>
            <Select value={consolForm.mode} invalid={!!consolErrors.mode} onChange={e => setConsolForm({ ...consolForm, mode: e.target.value })} options={MODES} placeholder="Select Mode" />
          </Field>
          <Field label="Cutoff In" required error={consolErrors.cutoff}>
            <Select value={consolForm.cutoff} invalid={!!consolErrors.cutoff} onChange={e => setConsolForm({ ...consolForm, cutoff: e.target.value })} options={CUTOFFS} placeholder="Select Cutoff" />
          </Field>
          <div className="hidden sm:block" />
          <Field label="Max CBM" required error={consolErrors.cbmMax}>
            <TextInput value={consolForm.cbmMax} invalid={!!consolErrors.cbmMax} onChange={e => setConsolForm({ ...consolForm, cbmMax: e.target.value })} placeholder="e.g. 25" inputMode="decimal" />
          </Field>
          <Field label="Max Weight (kg)" required error={consolErrors.kgMax}>
            <TextInput value={consolForm.kgMax} invalid={!!consolErrors.kgMax} onChange={e => setConsolForm({ ...consolForm, kgMax: e.target.value })} placeholder="e.g. 18000" inputMode="numeric" />
          </Field>
        </div>
      </Modal>

      {/* Consolidation detail drawer */}
      <Drawer
        open={!!consolDetail}
        onOpenChange={(o) => !o && setConsolDetail(null)}
        title={consolDetail?.id ?? ""}
        description="Consolidation planner summary"
        footer={
          <>
            <button onClick={() => setConsolDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Close
            </button>
            <Link href="/lcl/consolidation" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
              Open Full Planner
            </Link>
          </>
        }
      >
        {consolDetail && (
          <div className="space-y-1">
            <DetailRow label="Consolidation" value={<span className="font-mono text-brand">{consolDetail.id}</span>} />
            <DetailRow label="Route" value={consolDetail.route} />
            <DetailRow label="Mode" value={consolDetail.mode} />
            <DetailRow label="Cutoff" value={consolDetail.cutoff} />
            <DetailRow label="Volume" value={`${consolDetail.cbmUsed} / ${consolDetail.cbmMax} CBM (${Math.round((consolDetail.cbmUsed / consolDetail.cbmMax) * 100)}%)`} />
            <DetailRow label="Weight" value={`${consolDetail.kgUsed.toLocaleString()} / ${consolDetail.kgMax.toLocaleString()} kg (${Math.round((consolDetail.kgUsed / consolDetail.kgMax) * 100)}%)`} />
            <DetailRow label="CBM Remaining" value={`${(consolDetail.cbmMax - consolDetail.cbmUsed).toFixed(1)} CBM`} />
            <DetailRow label="Status" value={<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-brand/15 text-brand">{consolDetail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Receipt detail drawer */}
      <Drawer
        open={!!receiptDetail}
        onOpenChange={(o) => !o && setReceiptDetail(null)}
        title={receiptDetail?.id ?? ""}
        description="Cargo receipt detail"
        footer={
          <button onClick={() => setReceiptDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {receiptDetail && (
          <div className="space-y-1">
            <DetailRow label="Receipt Ref" value={<span className="font-mono text-brand">{receiptDetail.id}</span>} />
            <DetailRow label="Shipper" value={receiptDetail.shipper} />
            <DetailRow label="Volume" value={`${receiptDetail.cbm} CBM`} />
            <DetailRow label="Pieces" value={`${receiptDetail.pieces}`} />
            <DetailRow label="Received" value={receiptDetail.time} />
            <DetailRow label="Status" value={
              <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium",
                receiptDetail.status === "Received" ? "bg-success/15 text-success" :
                receiptDetail.status === "In-CFS" ? "bg-brand/15 text-brand" : "bg-warning/15 text-warning")}>
                {receiptDetail.status}
              </span>
            } />
          </div>
        )}
      </Drawer>
    </div>
  )
}
