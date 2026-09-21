"use client"
import { useState } from "react"
import { Package, BarChart2, TrendingUp, Clock, Eye, Pencil, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Zone = { zone: string; pallets: number; capacity: number; util: number }

const initialZoneData: Zone[] = [
  { zone:"Zone A", pallets:142, capacity:180, util:79 },
  { zone:"Zone B", pallets:88, capacity:120, util:73 },
  { zone:"Zone C", pallets:105, capacity:150, util:70 },
  { zone:"Cold Room A", pallets:32, capacity:40, util:80 },
  { zone:"Freezer", pallets:18, capacity:20, util:90 },
  { zone:"Zone D", pallets:96, capacity:140, util:69 },
  { zone:"Zone E", pallets:118, capacity:150, util:79 },
  { zone:"Cold Room B", pallets:27, capacity:35, util:77 },
  { zone:"Bulk Yard", pallets:64, capacity:110, util:58 },
  { zone:"Mezzanine", pallets:41, capacity:60, util:68 },
  { zone:"Quarantine Bay", pallets:12, capacity:25, util:48 },
  { zone:"Dispatch Staging", pallets:42, capacity:45, util:93 },
]

const PERIODS = ["Today", "7 Days", "30 Days"] as const
type Period = typeof PERIODS[number]

const periodMetrics: Record<Period, { moves: number; dwell: string }> = {
  "Today": { moves: 47, dwell: "6.2 days" },
  "7 Days": { moves: 312, dwell: "5.8 days" },
  "30 Days": { moves: 1284, dwell: "7.1 days" },
}

const emptyForm = { zone: "", pallets: "", capacity: "" }

function utilOf(pallets: number, capacity: number) {
  return capacity > 0 ? Math.round((pallets / capacity) * 100) : 0
}

export default function PalletAnalyticsPage() {
  const [zones, setZones] = useState<Zone[]>(initialZoneData)
  const [period, setPeriod] = useState<Period>("Today")

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Zone | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Zone | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Zone | null>(null)

  const totalPallets = zones.reduce((sum, z) => sum + z.pallets, 0)
  const totalCapacity = zones.reduce((sum, z) => sum + z.capacity, 0)
  const avgUtil = totalCapacity > 0 ? Math.round((totalPallets / totalCapacity) * 100) : 0

  const stats = [
    { label:"Total Pallets", value: totalPallets.toString(), icon:<Package className="w-5 h-5 text-brand"/>, sub:"in warehouse" },
    { label:"Zone Utilisation", value:`${avgUtil}%`, icon:<BarChart2 className="w-5 h-5 text-brand"/>, sub:`across ${zones.length} zones` },
    { label:`Moves (${period})`, value: periodMetrics[period].moves.toString(), icon:<TrendingUp className="w-5 h-5 text-success"/>, sub:"put-away + picks" },
    { label:"Avg Dwell Time", value: periodMetrics[period].dwell, icon:<Clock className="w-5 h-5 text-brand"/>, sub:"per pallet" },
  ]

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
    setFormOpen(true)
  }

  function openEdit(z: Zone) {
    setEditing(z)
    setForm({ zone: z.zone, pallets: String(z.pallets), capacity: String(z.capacity) })
    setErrors({})
    setFormOpen(true)
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.zone.trim()) e.zone = "Zone name is required"
    else if (zones.some(z => z.zone.toLowerCase() === form.zone.trim().toLowerCase() && z.zone !== editing?.zone)) e.zone = "A zone with this name already exists"
    if (!form.capacity.trim()) e.capacity = "Capacity is required"
    else if (!/^\d+$/.test(form.capacity) || Number(form.capacity) < 1) e.capacity = "Enter a positive whole number"
    if (!form.pallets.trim()) e.pallets = "Stored pallets is required"
    else if (!/^\d+$/.test(form.pallets)) e.pallets = "Enter a whole number"
    else if (form.capacity && /^\d+$/.test(form.capacity) && Number(form.pallets) > Number(form.capacity)) e.pallets = "Cannot exceed capacity"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function submit() {
    if (!validate()) return
    const pallets = Number(form.pallets)
    const capacity = Number(form.capacity)
    const next: Zone = { zone: form.zone.trim(), pallets, capacity, util: utilOf(pallets, capacity) }
    if (editing) {
      setZones(prev => prev.map(z => z.zone === editing.zone ? next : z))
      notify.success("Zone updated", `${next.zone} now at ${next.util}% utilisation.`)
    } else {
      setZones(prev => [...prev, next])
      notify.success("Zone added", `${next.zone} — capacity ${next.capacity} pallets.`)
    }
    setFormOpen(false)
    setForm(emptyForm)
    setErrors({})
    setEditing(null)
  }

  function remove(z: Zone) {
    setZones(prev => prev.filter(x => x.zone !== z.zone))
    notify.warning("Zone removed", `${z.zone} has been removed from analytics.`)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold text-foreground">Pallet Analytics</h1><p className="text-sm text-muted-foreground mt-1">Zone utilisation, movement frequency and dwell time analysis</p></div>
        <div className="flex items-center gap-2">
          <ExportButton data={zones} filename="pallet-analytics" />
          <button onClick={openCreate} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
            <Plus className="w-4 h-4" /> Add Zone
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {PERIODS.map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            title={`Show metrics for ${p}`}
            className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", period === p ? "bg-brand text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground")}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map(s=>(
          <div key={s.label} className="bg-card border border-border rounded-xl p-3"><div className="mb-2">{s.icon}</div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.sub}</p></div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border"><p className="font-semibold text-sm text-foreground">Zone Utilisation</p></div>
        <div className="p-4 space-y-4">
          {zones.map(z=>(
            <div key={z.zone} className="space-y-1">
              <div className="flex justify-between items-center text-sm gap-3">
                <button onClick={() => setDetail(z)} title={`View ${z.zone} detail`} className="font-medium text-foreground hover:text-brand transition-colors">{z.zone}</button>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{z.pallets} / {z.capacity} pallets &bull; {z.util}%</span>
                  <RowActions
                    items={[
                      { label: "View zone details", icon: <Eye />, onSelect: () => setDetail(z) },
                      { label: "Edit zone capacity", icon: <Pencil />, onSelect: () => openEdit(z) },
                    ]}
                  />
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2"><div className={`h-2 rounded-full ${z.util>=85?"bg-amber-400":z.util>=70?"bg-brand":"bg-success"}`} style={{width:`${Math.min(z.util, 100)}%`}} /></div>
            </div>
          ))}
          {zones.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No zones configured yet.</p>
          )}
        </div>
      </div>

      {/* Create / edit zone */}
      <Modal
        open={formOpen}
        onOpenChange={(o) => { setFormOpen(o); if (!o) { setForm(emptyForm); setErrors({}); setEditing(null) } }}
        title={editing ? `Edit ${editing.zone}` : "Add Storage Zone"}
        description={editing ? "Update stored pallets and capacity" : "Register a new zone for utilisation tracking"}
        size="sm"
        footer={<ModalActions onCancel={() => setFormOpen(false)} onSubmit={submit} submitLabel={editing ? "Save Zone" : "Add Zone"} />}
      >
        <div className="grid grid-cols-1 gap-4">
          <Field label="Zone Name" required error={errors.zone}>
            <TextInput value={form.zone} invalid={!!errors.zone} onChange={e => setForm({ ...form, zone: e.target.value })} placeholder="e.g. Zone D" />
          </Field>
          <Field label="Capacity (pallets)" required error={errors.capacity}>
            <TextInput value={form.capacity} invalid={!!errors.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} placeholder="e.g. 180" inputMode="numeric" />
          </Field>
          <Field label="Stored Pallets" required error={errors.pallets} hint="Utilisation is calculated from these two values">
            <TextInput value={form.pallets} invalid={!!errors.pallets} onChange={e => setForm({ ...form, pallets: e.target.value })} placeholder="e.g. 142" inputMode="numeric" />
          </Field>
        </div>
      </Modal>

      {/* Zone detail */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.zone ?? ""}
        description="Zone utilisation detail"
        footer={
          <>
            <button onClick={() => detail && setDeleteTarget(detail)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10">
              Remove Zone
            </button>
            <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Close
            </button>
          </>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Zone" value={detail.zone} />
            <DetailRow label="Stored Pallets" value={`${detail.pallets} pallets`} />
            <DetailRow label="Capacity" value={`${detail.capacity} pallets`} />
            <DetailRow label="Free Slots" value={`${Math.max(0, detail.capacity - detail.pallets)} pallets`} />
            <DetailRow label="Utilisation" value={`${detail.util}%`} />
            <DetailRow label="Status" value={
              <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", detail.util >= 85 ? "bg-warning/10 text-warning" : detail.util >= 70 ? "bg-brand/10 text-brand" : "bg-success/10 text-success")}>
                {detail.util >= 85 ? "Near Capacity" : detail.util >= 70 ? "Busy" : "Healthy"}
              </span>
            } />
          </div>
        )}
      </Drawer>

      {/* Remove confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Remove this zone?"
        message={`${deleteTarget?.zone} holding ${deleteTarget?.pallets} pallets will be removed from utilisation analytics.`}
        confirmLabel="Remove Zone"
        cancelLabel="Keep It"
        onConfirm={() => { if (deleteTarget) { remove(deleteTarget); setDetail(null) } }}
      />
    </div>
  )
}
