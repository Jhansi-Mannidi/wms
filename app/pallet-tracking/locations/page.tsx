"use client"
import { useState } from "react"
import { Package, Eye, Move, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type PalletLocation = {
  id: string; type: string; sku: string; qty: number
  zone: string; rack: string; level: string; owner: string; status: string
}

const initialPallets: PalletLocation[] = [
  { id:"PLT-0012",type:"Euro",sku:"SKU-001234",qty:48,zone:"A",rack:"A-12",level:"L2",owner:"Acme Foods",status:"In Storage"},
  { id:"PLT-0013",type:"Standard",sku:"SKU-001236",qty:24,zone:"B",rack:"B-05",level:"L1",owner:"Global Oils",status:"In Storage"},
  { id:"PLT-0014",type:"Euro",sku:"SKU-001238",qty:60,zone:"A",rack:"A-08",level:"L3",owner:"Sweet Mills",status:"Reserved"},
  { id:"PLT-0015",type:"Half",sku:"SKU-001240",qty:30,zone:"C",rack:"C-02",level:"L1",owner:"Fresh Farms",status:"In Storage"},
  { id:"PLT-0016",type:"Standard",sku:"SKU-001237",qty:80,zone:"C",rack:"C-07",level:"L2",owner:"Agro Corp",status:"In Transit"},
]

const ZONES = ["A", "B", "C", "D"] as const
const LEVELS = ["L1", "L2", "L3", "L4"] as const
const STATUSES = ["In Storage", "Reserved", "In Transit"] as const

function statusClass(status: string) {
  return status === "In Storage" ? "bg-success/10 text-success"
    : status === "Reserved" ? "bg-brand/10 text-brand"
    : "bg-amber-50 text-amber-600"
}

export default function PalletLocationsPage() {
  const [pallets, setPallets] = useState<PalletLocation[]>(initialPallets)
  const [zoneFilter, setZoneFilter] = useState("All")

  const [detail, setDetail] = useState<PalletLocation | null>(null)
  const [moveTarget, setMoveTarget] = useState<PalletLocation | null>(null)
  const [moveForm, setMoveForm] = useState({ zone: "", rack: "", level: "", status: "" })
  const [moveErrors, setMoveErrors] = useState<Record<string, string>>({})
  const [releaseTarget, setReleaseTarget] = useState<PalletLocation | null>(null)

  const filtered = pallets.filter(p => zoneFilter === "All" || p.zone === zoneFilter)

  function openMove(p: PalletLocation) {
    setMoveTarget(p)
    setMoveForm({ zone: p.zone, rack: p.rack, level: p.level, status: p.status })
    setMoveErrors({})
  }

  function submitMove() {
    if (!moveTarget) return
    const e: Record<string, string> = {}
    if (!moveForm.zone) e.zone = "Select a zone"
    if (!moveForm.rack.trim()) e.rack = "Rack is required"
    else if (!/^[A-Za-z]-\d{2}$/.test(moveForm.rack.trim())) e.rack = "Use format like A-12"
    if (!moveForm.level) e.level = "Select a level"
    if (!moveForm.status) e.status = "Select a status"
    setMoveErrors(e)
    if (Object.keys(e).length) return
    const rack = moveForm.rack.trim().toUpperCase()
    setPallets(prev => prev.map(x => x.id === moveTarget.id
      ? { ...x, zone: moveForm.zone, rack, level: moveForm.level, status: moveForm.status }
      : x))
    notify.success("Pallet relocated", `${moveTarget.id} → Zone ${moveForm.zone} ${rack} ${moveForm.level}.`)
    setMoveTarget(null)
  }

  function release(p: PalletLocation) {
    setPallets(prev => prev.filter(x => x.id !== p.id))
    notify.warning("Location released", `${p.id} removed from ${p.rack} ${p.level}.`)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Pallet Locations</h1><p className="text-sm text-muted-foreground mt-1">Current storage locations for all tracked pallets</p></div>
        <ExportButton data={filtered} filename="pallet-locations" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {["All", ...ZONES].map(z => (
          <button
            key={z}
            onClick={() => setZoneFilter(z)}
            title={z === "All" ? "Show all zones" : `Filter to Zone ${z}`}
            className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", zoneFilter === z ? "bg-brand text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground")}
          >
            {z === "All" ? "All Zones" : `Zone ${z}`}
          </button>
        ))}
        <span className="ml-auto text-sm text-muted-foreground">{filtered.length} pallets</span>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["Pallet ID","Type","SKU","Qty","Zone","Rack","Level","Owner","Status","Actions"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(p=>(
              <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <button onClick={() => setDetail(p)} title={`View ${p.id}`} className="font-mono text-xs text-brand hover:underline">{p.id}</button>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.type}</td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{p.sku}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.qty}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.zone}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.rack}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.level}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.owner}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass(p.status)}`}>{p.status}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setDetail(p)} title="View details" className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                    <button onClick={() => openMove(p)} title="Relocate pallet" className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Move className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setReleaseTarget(p)} title="Release location" className="p-1.5 rounded-md text-muted-foreground hover:bg-danger/10 hover:text-danger transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-12 text-center text-sm text-muted-foreground">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No pallets stored in this zone.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Relocate */}
      <Modal
        open={!!moveTarget}
        onOpenChange={(o) => { if (!o) { setMoveTarget(null); setMoveErrors({}) } }}
        title={`Relocate ${moveTarget?.id ?? ""}`}
        description="Assign this pallet to a new rack position"
        footer={<ModalActions onCancel={() => setMoveTarget(null)} onSubmit={submitMove} submitLabel="Relocate" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Zone" required error={moveErrors.zone}>
            <Select value={moveForm.zone} invalid={!!moveErrors.zone} onChange={e => setMoveForm({ ...moveForm, zone: e.target.value })} options={ZONES} placeholder="Select Zone" />
          </Field>
          <Field label="Rack" required error={moveErrors.rack}>
            <TextInput value={moveForm.rack} invalid={!!moveErrors.rack} onChange={e => setMoveForm({ ...moveForm, rack: e.target.value })} placeholder="e.g. A-12" />
          </Field>
          <Field label="Level" required error={moveErrors.level}>
            <Select value={moveForm.level} invalid={!!moveErrors.level} onChange={e => setMoveForm({ ...moveForm, level: e.target.value })} options={LEVELS} placeholder="Select Level" />
          </Field>
          <Field label="Status" required error={moveErrors.status}>
            <Select value={moveForm.status} invalid={!!moveErrors.status} onChange={e => setMoveForm({ ...moveForm, status: e.target.value })} options={STATUSES} placeholder="Select Status" />
          </Field>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Pallet location detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Pallet ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Pallet Type" value={detail.type} />
            <DetailRow label="SKU" value={<span className="font-mono">{detail.sku}</span>} />
            <DetailRow label="Quantity" value={`${detail.qty} units`} />
            <DetailRow label="Zone" value={detail.zone} />
            <DetailRow label="Rack" value={detail.rack} />
            <DetailRow label="Level" value={detail.level} />
            <DetailRow label="Owner" value={detail.owner} />
            <DetailRow label="Status" value={<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass(detail.status)}`}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Release confirmation */}
      <ConfirmDialog
        open={!!releaseTarget}
        onOpenChange={(o) => !o && setReleaseTarget(null)}
        title="Release this location?"
        message={`${releaseTarget?.id} will be cleared from ${releaseTarget?.rack} ${releaseTarget?.level} and removed from the location register.`}
        confirmLabel="Release"
        cancelLabel="Keep It"
        onConfirm={() => releaseTarget && release(releaseTarget)}
      />
    </div>
  )
}
