"use client"
import { useState } from "react"
import { BarChart2, Activity, Clock, TrendingUp, Plus, Eye, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type UtilRow = {
  id: string; type: string; activeHrs: number; idleHrs: number; util: number; trips: number
}

const initialUtil: UtilRow[] = [
  { id:"MHE-001",type:"Forklift",activeHrs:6.2,idleHrs:1.8,util:78,trips:42},
  { id:"MHE-002",type:"Reach Truck",activeHrs:4.1,idleHrs:3.9,util:51,trips:28},
  { id:"MHE-003",type:"Pallet Jack",activeHrs:2.0,idleHrs:1.0,util:67,trips:15},
  { id:"MHE-004",type:"Forklift",activeHrs:7.1,idleHrs:0.9,util:89,trips:55},
  { id:"MHE-005",type:"Order Picker",activeHrs:5.8,idleHrs:2.2,util:73,trips:38},
]

const UNIT_TYPES = ["Forklift", "Reach Truck", "Pallet Jack", "Order Picker"] as const

const emptyForm = { id: "", type: "", activeHrs: "", idleHrs: "", trips: "" }

export default function MHEUtilizationPage() {
  const [rows, setRows] = useState<UtilRow[]>(initialUtil)

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<UtilRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UtilRow | null>(null)

  const avgUtil = rows.length ? Math.round(rows.reduce((s, r) => s + r.util, 0) / rows.length) : 0
  const totalTrips = rows.reduce((s, r) => s + r.trips, 0)
  const avgActive = rows.length ? rows.reduce((s, r) => s + r.activeHrs, 0) / rows.length : 0
  const mostUsed = rows.reduce<UtilRow | null>((best, r) => (!best || r.util > best.util ? r : best), null)

  const stats = [
    { label:"Fleet Avg Utilisation",value:`${avgUtil}%`,icon:<BarChart2 className="w-5 h-5 text-brand"/>,sub:`across ${rows.length} active units`},
    { label:"Total Trips Today",value:String(totalTrips),icon:<Activity className="w-5 h-5 text-brand"/>,sub:"all equipment"},
    { label:"Avg Active Hours",value:`${avgActive.toFixed(1)} hrs`,icon:<Clock className="w-5 h-5 text-brand"/>,sub:"per unit today"},
    { label:"Most Used",value:mostUsed?.id ?? "—",icon:<TrendingUp className="w-5 h-5 text-success"/>,sub:mostUsed ? `${mostUsed.util}% utilisation` : "no data"},
  ]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.id.trim()) e.id = "Equipment ID is required"
    else if (rows.some(r => r.id.toLowerCase() === form.id.trim().toLowerCase())) e.id = "This unit already has an entry"
    if (!form.type) e.type = "Select a unit type"
    if (!form.activeHrs.trim()) e.activeHrs = "Active hours are required"
    else if (!/^\d+(\.\d+)?$/.test(form.activeHrs) || Number(form.activeHrs) <= 0) e.activeHrs = "Enter a positive number"
    if (!form.idleHrs.trim()) e.idleHrs = "Idle hours are required"
    else if (!/^\d+(\.\d+)?$/.test(form.idleHrs)) e.idleHrs = "Enter a number of 0 or more"
    if (!form.trips.trim()) e.trips = "Trip count is required"
    else if (!/^\d+$/.test(form.trips)) e.trips = "Enter a whole number"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createRow() {
    if (!validate()) return
    const active = Number(form.activeHrs)
    const idle = Number(form.idleHrs)
    const next: UtilRow = {
      id: form.id.trim().toUpperCase(),
      type: form.type,
      activeHrs: active,
      idleHrs: idle,
      util: Math.round((active / (active + idle)) * 100),
      trips: Number(form.trips),
    }
    setRows(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Utilisation logged", `${next.id} — ${next.util}% utilisation over ${active + idle} hrs.`)
  }

  function remove(r: UtilRow) {
    setRows(prev => prev.filter(x => x.id !== r.id))
    notify.warning("Entry removed", `${r.id} has been removed from today's utilisation report.`)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold text-foreground">Utilisation Analysis</h1><p className="text-sm text-muted-foreground mt-1">Active vs idle hours, trip counts and efficiency per unit</p></div>
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> Log Utilisation</button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {stats.map(s=>(
          <div key={s.label} className="bg-card border border-border rounded-xl p-4"><div className="mb-2">{s.icon}</div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.sub}</p></div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["Equipment","Type","Active Hrs","Idle Hrs","Trips","Utilisation","Actions"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {rows.map(e=>(
              <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{e.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{e.type}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.activeHrs}h</td>
                <td className="px-4 py-3 text-muted-foreground">{e.idleHrs}h</td>
                <td className="px-4 py-3 text-muted-foreground">{e.trips}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-muted rounded-full h-1.5"><div className={`h-1.5 rounded-full ${e.util>=80?"bg-brand":e.util>=60?"bg-amber-400":"bg-danger"}`} style={{width:`${e.util}%`}} /></div>
                    <span className="text-xs text-muted-foreground">{e.util}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: "View details", icon: <Eye />, onSelect: () => setDetail(e) },
                      { label: "Remove entry", icon: <Trash2 />, onSelect: () => setDeleteTarget(e), tone: "danger" as const },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No utilisation entries logged yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Log utilisation */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="Log Utilisation"
        description="Record today's active and idle hours for a unit"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createRow} submitLabel="Log Entry" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Equipment ID" required error={errors.id}>
            <TextInput value={form.id} invalid={!!errors.id} onChange={e => setForm({ ...form, id: e.target.value })} placeholder="e.g. MHE-006" />
          </Field>
          <Field label="Unit Type" required error={errors.type}>
            <Select value={form.type} invalid={!!errors.type} onChange={e => setForm({ ...form, type: e.target.value })} options={UNIT_TYPES} placeholder="Select Type" />
          </Field>
          <Field label="Active Hours" required error={errors.activeHrs}>
            <TextInput value={form.activeHrs} invalid={!!errors.activeHrs} onChange={e => setForm({ ...form, activeHrs: e.target.value })} placeholder="e.g. 6.2" inputMode="decimal" />
          </Field>
          <Field label="Idle Hours" required error={errors.idleHrs}>
            <TextInput value={form.idleHrs} invalid={!!errors.idleHrs} onChange={e => setForm({ ...form, idleHrs: e.target.value })} placeholder="e.g. 1.8" inputMode="decimal" />
          </Field>
          <Field label="Trips" required error={errors.trips} hint="Utilisation % is calculated from active vs idle hours">
            <TextInput value={form.trips} invalid={!!errors.trips} onChange={e => setForm({ ...form, trips: e.target.value })} placeholder="e.g. 42" inputMode="numeric" />
          </Field>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Utilisation detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Equipment" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Type" value={detail.type} />
            <DetailRow label="Active Hours" value={`${detail.activeHrs}h`} />
            <DetailRow label="Idle Hours" value={`${detail.idleHrs}h`} />
            <DetailRow label="Total Hours" value={`${(detail.activeHrs + detail.idleHrs).toFixed(1)}h`} />
            <DetailRow label="Trips" value={detail.trips} />
            <DetailRow label="Utilisation" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", detail.util >= 80 ? "bg-brand/10 text-brand" : detail.util >= 60 ? "bg-amber-50 text-amber-600" : "bg-danger/10 text-danger")}>{detail.util}%</span>} />
            <DetailRow label="Trips / Active Hr" value={(detail.trips / (detail.activeHrs || 1)).toFixed(1)} />
          </div>
        )}
      </Drawer>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Remove this entry?"
        message={`The utilisation entry for ${deleteTarget?.id} will be removed and the fleet averages will recalculate.`}
        confirmLabel="Remove"
        cancelLabel="Keep It"
        onConfirm={() => deleteTarget && remove(deleteTarget)}
      />
    </div>
  )
}
