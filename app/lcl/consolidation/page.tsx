"use client"

import { useState } from "react"
import { Plus, AlertTriangle, CheckCircle2, Package, Clock, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

// `type` (not `interface`) so rows stay assignable to Record<string, unknown> consumers
type PoolReceipt = {
  id: string; shipper: string; shipperInit: string; shipperColor: string
  cbm: number; pieces: number; kg: number; pod: string; dwell: number; hazmat?: boolean
}

type Consol = {
  id: string; route: string; mode: string; cutoff: string
  cbmMax: number; kgMax: number; status: string; items: PoolReceipt[]
}

const receiptPool: PoolReceipt[] = [
  { id: "CR-0891", shipper: "Apex Pharma", shipperInit: "AP", shipperColor: "bg-blue-500", cbm: 2.4, pieces: 18, kg: 960, pod: "CNSHA", dwell: 4 },
  { id: "CR-0892", shipper: "GlobalTex", shipperInit: "GT", shipperColor: "bg-amber-500", cbm: 5.6, pieces: 40, kg: 2800, pod: "CNSHA", dwell: 2 },
  { id: "CR-0894", shipper: "AutoParts India", shipperInit: "AI", shipperColor: "bg-cyan-500", cbm: 8.3, pieces: 62, kg: 4150, pod: "SGSIN", dwell: 1 },
  { id: "CR-0895", shipper: "MediSupply", shipperInit: "MS", shipperColor: "bg-rose-500", cbm: 1.8, pieces: 12, kg: 540, pod: "AEDXB", dwell: 5, hazmat: true },
  { id: "CR-0896", shipper: "FreshFarm", shipperInit: "FF", shipperColor: "bg-orange-500", cbm: 3.2, pieces: 24, kg: 1600, pod: "CNSHA", dwell: 3 },
  { id: "CR-0897", shipper: "Sunrise Elec.", shipperInit: "SE", shipperColor: "bg-emerald-500", cbm: 4.1, pieces: 30, kg: 2050, pod: "CNSHA", dwell: 2 },
]

const CBM_MAX = 25
const KG_MAX = 18000

const initialConsols: Consol[] = [
  { id: "CON-001", route: "INBOM → CNSHA", mode: "FCL 20'", cutoff: "2025-07-28", cbmMax: CBM_MAX, kgMax: KG_MAX, status: "Building", items: [] },
]

const ROUTES = ["INBOM → CNSHA", "INBOM → SGSIN", "INMAA → AEDXB", "INBOM → USNYC", "INNSA → NLRTM"] as const
const MODES = ["LCL", "FCL 20'", "FCL 40'"] as const

const emptyForm = { route: "", mode: "", cutoff: "", cbmMax: "", kgMax: "" }

export default function ConsolidationPlannerPage() {
  const [poolItems, setPoolItems] = useState<PoolReceipt[]>(receiptPool)
  const [consols, setConsols] = useState<Consol[]>(initialConsols)
  const [activeId, setActiveId] = useState<string>(initialConsols[0].id)

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<PoolReceipt | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<PoolReceipt | null>(null)

  const active = consols.find(c => c.id === activeId) ?? consols[0]
  const consolidated = active?.items ?? []
  const locked = active?.status !== "Building"

  const addToConsolidation = (item: PoolReceipt) => {
    if (locked) {
      notify.error("Consolidation locked", `${active.id} is already ${active.status.toLowerCase()} — open a new consolidation to add cargo.`)
      return
    }
    setPoolItems(p => p.filter(r => r.id !== item.id))
    setConsols(prev => prev.map(c => c.id === activeId ? { ...c, items: [...c.items, item] } : c))
    notify.success("Receipt allocated", `${item.id} (${item.cbm} CBM) added to ${activeId}.`)
  }

  const removeFromConsolidation = (item: PoolReceipt) => {
    setConsols(prev => prev.map(c => c.id === activeId ? { ...c, items: c.items.filter(r => r.id !== item.id) } : c))
    setPoolItems(p => [...p, item])
    notify.warning("Receipt returned to pool", `${item.id} was removed from ${activeId}.`)
  }

  const setCutoff = (val: string) =>
    setConsols(prev => prev.map(c => c.id === activeId ? { ...c, cutoff: val } : c))

  const totalCbm = consolidated.reduce((s, r) => s + r.cbm, 0)
  const totalKg = consolidated.reduce((s, r) => s + r.kg, 0)
  const cbmPct = Math.round((totalCbm / (active?.cbmMax || CBM_MAX)) * 100)
  const kgPct = Math.round((totalKg / (active?.kgMax || KG_MAX)) * 100)

  const hasHazmat = consolidated.some(r => r.hazmat)

  function validate() {
    const e: Record<string, string> = {}
    if (!form.route) e.route = "Select a route"
    if (!form.mode) e.mode = "Select a mode"
    if (!form.cutoff.trim()) e.cutoff = "Cutoff date is required"
    if (!form.cbmMax.trim()) e.cbmMax = "Max CBM is required"
    else if (!/^\d+(\.\d+)?$/.test(form.cbmMax) || Number(form.cbmMax) <= 0) e.cbmMax = "Enter a positive number"
    if (!form.kgMax.trim()) e.kgMax = "Max weight is required"
    else if (!/^\d+$/.test(form.kgMax) || Number(form.kgMax) <= 0) e.kgMax = "Enter a positive whole number"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createConsolidation() {
    if (!validate()) return
    const nums = consols.map(c => Number(c.id.replace("CON-", ""))).filter(n => !Number.isNaN(n))
    const next: Consol = {
      id: `CON-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, "0")}`,
      route: form.route,
      mode: form.mode,
      cutoff: form.cutoff,
      cbmMax: Number(form.cbmMax),
      kgMax: Number(form.kgMax),
      status: "Building",
      items: [],
    }
    setConsols(prev => [...prev, next])
    setActiveId(next.id)
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Consolidation created", `${next.id} — ${next.route} (${next.mode}) is now building.`)
  }

  function confirmConsolidation() {
    setConsols(prev => prev.map(c => c.id === activeId ? { ...c, status: "Confirmed" } : c))
    notify.success("Consolidation confirmed", `${activeId} locked at ${totalCbm.toFixed(1)} CBM / ${totalKg.toLocaleString()} kg across ${consolidated.length} receipts.`)
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* Consolidation switcher */}
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {consols.map(c => (
            <button key={c.id} onClick={() => setActiveId(c.id)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border",
                c.id === activeId ? "bg-brand text-white border-brand" : "bg-card border-border text-muted-foreground hover:text-foreground")}>
              {c.id} · {c.route}
              {c.status !== "Building" && <span className="ml-1.5 opacity-80">({c.status})</span>}
            </button>
          ))}
        </div>
        <button onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F7941D] text-white text-sm font-medium hover:bg-[#F7941D]/90 transition-colors">
          <Plus className="w-4 h-4" /> New Consolidation
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 h-full">
        {/* Left — pool */}
        <div className="lg:w-80 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground">Cargo Receipt Pool</h2>
            <span className="text-xs text-muted-foreground">{poolItems.length} available</span>
          </div>
          <div className="space-y-2">
            {poolItems.map(r => (
              <div key={r.id} className="p-3 rounded-xl border border-border bg-card hover:border-brand/40 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0", r.shipperColor)}>{r.shipperInit}</div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{r.shipper}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{r.id}</p>
                  </div>
                  {r.hazmat && <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-danger/15 text-danger">DG</span>}
                  <button onClick={() => setDetail(r)} title={`View ${r.id} details`}
                    className={cn("p-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors", !r.hazmat && "ml-auto")}>
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-2">
                  <span>{r.cbm} CBM</span>
                  <span>·</span>
                  <span>{r.pieces} pcs</span>
                  <span>·</span>
                  <span>{r.pod}</span>
                  <span className="ml-auto flex items-center gap-0.5"><Clock className="w-3 h-3" />{r.dwell}d</span>
                </div>
                <button onClick={() => addToConsolidation(r)}
                  className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#F7941D]/10 text-[#F7941D] text-xs font-semibold hover:bg-[#F7941D]/20 transition-colors border border-[#F7941D]/30">
                  <Plus className="w-3.5 h-3.5" /> Add to Consolidation
                </button>
              </div>
            ))}
            {poolItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-dashed border-border text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 mb-2 text-success opacity-60" />
                <span className="text-xs">All receipts allocated</span>
              </div>
            )}
          </div>
        </div>

        {/* Right — consolidation being built */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Consolidation header */}
          <div className="p-5 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  {active.id} · {active.route}
                  {active.status !== "Building" && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success/15 text-success">{active.status}</span>
                  )}
                </h2>
                <p className="text-xs text-muted-foreground">{active.mode} · Cutoff:
                  <input type="date" value={active.cutoff} onChange={e => setCutoff(e.target.value)} disabled={locked}
                    className="ml-2 bg-transparent border-b border-border text-xs outline-none text-foreground disabled:opacity-60" />
                </p>
              </div>
            </div>

            {/* Fill gauges */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "CBM Fill", used: totalCbm, max: active.cbmMax, pct: cbmPct, unit: "CBM" },
                { label: "Weight Fill", used: totalKg, max: active.kgMax, pct: kgPct, unit: "kg" },
              ].map(g => (
                <div key={g.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{g.label}</span>
                    <span className={cn("font-bold", g.pct > 90 ? "text-danger" : g.pct > 75 ? "text-warning" : "text-success")}>{g.pct}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", g.pct > 90 ? "bg-danger" : g.pct > 75 ? "bg-warning" : "bg-success")}
                      style={{ width: `${Math.min(g.pct, 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>{g.used.toFixed(1)} {g.unit} used</span>
                    <span>{g.max} {g.unit} max</span>
                  </div>
                </div>
              ))}
            </div>

            {hasHazmat && (
              <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-danger/10 border border-danger/30">
                <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
                <span className="text-xs text-danger font-medium">DG cargo in consolidation — verify compatibility before confirming</span>
              </div>
            )}
          </div>

          {/* Receipts in consolidation */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">In This Consolidation</h3>
              <span className="text-xs text-muted-foreground">{consolidated.length} receipts · {totalCbm.toFixed(1)} CBM · {totalKg.toLocaleString()} kg</span>
            </div>

            {consolidated.length > 0 ? (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {["Receipt", "Shipper", "CBM", "Pieces", "Weight (kg)", "POD", "Dwell", ""].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {consolidated.map((r, i) => (
                      <tr key={r.id} onClick={() => setDetail(r)} className={cn("border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer", i % 2 === 0 ? "" : "bg-muted/5")}>
                        <td className="px-4 py-2.5 text-xs font-mono text-brand font-semibold">{r.id}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold", r.shipperColor)}>{r.shipperInit}</div>
                            <span className="text-xs text-foreground">{r.shipper}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-xs font-semibold text-foreground">{r.cbm}</td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.pieces}</td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.kg.toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-xs text-foreground">{r.pod}</td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.dwell}d</td>
                        <td className="px-4 py-2.5">
                          {!locked && (
                            <button onClick={(e) => { e.stopPropagation(); setRemoveTarget(r) }} title={`Remove ${r.id}`} className="text-xs text-danger hover:underline">Remove</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border text-muted-foreground">
                <Package className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm font-medium">Add cargo receipts from the pool</p>
                <p className="text-xs mt-1">Drag or click &quot;Add to Consolidation&quot; on any receipt</p>
              </div>
            )}
          </div>

          {consolidated.length > 0 && !locked && (
            <button onClick={() => setConfirmOpen(true)} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#F7941D] text-white font-semibold text-sm hover:bg-[#F7941D]/90 transition-colors">
              <CheckCircle2 className="w-4 h-4" /> Confirm Consolidation
            </button>
          )}
          {locked && (
            <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-success/15 border border-success/30 text-success font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4" /> {active.id} confirmed · {consolidated.length} receipts locked
            </div>
          )}
        </div>
      </div>

      {/* New consolidation */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="New Consolidation"
        description="Open a consolidation and start allocating cargo receipts"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createConsolidation} submitLabel="Create Consolidation" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Route" required error={errors.route}>
            <Select value={form.route} invalid={!!errors.route} onChange={e => setForm({ ...form, route: e.target.value })} options={ROUTES} placeholder="Select Route" />
          </Field>
          <Field label="Mode" required error={errors.mode}>
            <Select value={form.mode} invalid={!!errors.mode} onChange={e => setForm({ ...form, mode: e.target.value })} options={MODES} placeholder="Select Mode" />
          </Field>
          <Field label="Cutoff Date" required error={errors.cutoff}>
            <TextInput type="date" value={form.cutoff} invalid={!!errors.cutoff} onChange={e => setForm({ ...form, cutoff: e.target.value })} />
          </Field>
          <div className="hidden sm:block" />
          <Field label="Max CBM" required error={errors.cbmMax}>
            <TextInput value={form.cbmMax} invalid={!!errors.cbmMax} onChange={e => setForm({ ...form, cbmMax: e.target.value })} placeholder="e.g. 25" inputMode="decimal" />
          </Field>
          <Field label="Max Weight (kg)" required error={errors.kgMax}>
            <TextInput value={form.kgMax} invalid={!!errors.kgMax} onChange={e => setForm({ ...form, kgMax: e.target.value })} placeholder="e.g. 18000" inputMode="numeric" />
          </Field>
        </div>
      </Modal>

      {/* Receipt detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Cargo receipt detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Receipt" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Shipper" value={detail.shipper} />
            <DetailRow label="Volume" value={`${detail.cbm} CBM`} />
            <DetailRow label="Weight" value={`${detail.kg.toLocaleString()} kg`} />
            <DetailRow label="Pieces" value={`${detail.pieces}`} />
            <DetailRow label="Destination (POD)" value={detail.pod} />
            <DetailRow label="Dwell" value={`${detail.dwell} days in CFS`} />
            <DetailRow label="Hazmat" value={detail.hazmat
              ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-danger/15 text-danger">DG cargo</span>
              : <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success/15 text-success">General cargo</span>} />
            <DetailRow label="Allocation" value={consolidated.some(r => r.id === detail.id) ? `Allocated to ${active.id}` : "Unallocated — in pool"} />
          </div>
        )}
      </Drawer>

      {/* Confirm consolidation */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm this consolidation?"
        message={`${active?.id} will be locked with ${consolidated.length} receipts at ${totalCbm.toFixed(1)} CBM / ${totalKg.toLocaleString()} kg. No further cargo can be added.`}
        confirmLabel="Confirm Consolidation"
        cancelLabel="Keep Building"
        tone="brand"
        onConfirm={confirmConsolidation}
      />

      {/* Remove receipt */}
      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(o) => !o && setRemoveTarget(null)}
        title="Remove this receipt?"
        message={`${removeTarget?.id} (${removeTarget?.cbm} CBM) will be returned to the cargo receipt pool.`}
        confirmLabel="Remove Receipt"
        cancelLabel="Keep It"
        onConfirm={() => removeTarget && removeFromConsolidation(removeTarget)}
      />
    </div>
  )
}
