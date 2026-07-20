"use client"
import { useState } from "react"
import { Plus, Search, Eye, Edit2, Power, Trash2, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Zone = {
  id: string; name: string; type: string; sqft: number
  racks: number; levels: number; temp: string; active: boolean
}

const initialZones: Zone[] = [
  { id:"Z-001",name:"Zone A",type:"Ambient",sqft:12000,racks:48,levels:3,temp:"18-25°C",active:true},
  { id:"Z-002",name:"Zone B",type:"Ambient",sqft:9800,racks:36,levels:3,temp:"18-25°C",active:true},
  { id:"Z-003",name:"Zone C",type:"Ambient",sqft:8200,racks:30,levels:3,temp:"18-25°C",active:true},
  { id:"Z-004",name:"Cold Room A",type:"Cold",sqft:2400,racks:12,levels:2,temp:"2-4°C",active:true},
  { id:"Z-005",name:"Cold Room B",type:"Cold",sqft:2400,racks:12,levels:2,temp:"2-8°C",active:true},
  { id:"Z-006",name:"Freezer",type:"Frozen",sqft:1200,racks:6,levels:2,temp:"-20°C",active:true},
  { id:"Z-007",name:"Hazmat Zone",type:"Restricted",sqft:800,racks:6,levels:1,temp:"Ambient",active:false},
]

const ZONE_TYPES = ["Ambient", "Cold", "Frozen", "Restricted"] as const
const emptyForm = { name: "", type: "", sqft: "", racks: "", levels: "", temp: "" }

export default function WarehouseZonesPage() {
  const [zones, setZones] = useState<Zone[]>(initialZones)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")

  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState("All Statuses")
  const [minSqft, setMinSqft] = useState("")
  const [minRacks, setMinRacks] = useState("")

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Zone | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Zone | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Zone | null>(null)

  const extraFilterCount =
    (statusFilter !== "All Statuses" ? 1 : 0) + (minSqft ? 1 : 0) + (minRacks ? 1 : 0)

  const filtered = zones.filter((z) => {
    const q = search.toLowerCase()
    return (
      (z.id.toLowerCase().includes(q) || z.name.toLowerCase().includes(q)) &&
      (typeFilter === "All" || z.type === typeFilter) &&
      (statusFilter === "All Statuses" || (statusFilter === "Active" ? z.active : !z.active)) &&
      (!minSqft || z.sqft >= Number(minSqft)) &&
      (!minRacks || z.racks >= Number(minRacks))
    )
  })

  const stats = [
    { label: "Total Zones", value: zones.length },
    { label: "Active Zones", value: zones.filter((z) => z.active).length },
    { label: "Total Sq Ft", value: zones.reduce((s, z) => s + z.sqft, 0).toLocaleString() },
    { label: "Total Racks", value: zones.reduce((s, z) => s + z.racks, 0) },
  ]

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
    setModalOpen(true)
  }

  function openEdit(z: Zone) {
    setEditing(z)
    setForm({ name: z.name, type: z.type, sqft: String(z.sqft), racks: String(z.racks), levels: String(z.levels), temp: z.temp })
    setErrors({})
    setModalOpen(true)
  }

  function save() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Zone name is required"
    else if (zones.some((z) => z.name.toLowerCase() === form.name.trim().toLowerCase() && z.id !== editing?.id)) e.name = "A zone with this name already exists"
    if (!form.type) e.type = "Select a zone type"
    for (const k of ["sqft", "racks", "levels"] as const) {
      if (!form[k].trim()) e[k] = "Required"
      else if (!/^\d+$/.test(form[k]) || Number(form[k]) < 1) e[k] = "Positive whole number"
    }
    if (!form.temp.trim()) e.temp = "Temperature range is required"
    setErrors(e)
    if (Object.keys(e).length) return

    const row = {
      name: form.name.trim(),
      type: form.type,
      sqft: Number(form.sqft),
      racks: Number(form.racks),
      levels: Number(form.levels),
      temp: form.temp.trim(),
    }

    if (editing) {
      setZones((prev) => prev.map((z) => (z.id === editing.id ? { ...z, ...row } : z)))
      notify.success("Zone updated", `${row.name} saved.`)
    } else {
      const next: Zone = { id: `Z-${String(zones.length + 1).padStart(3, "0")}`, ...row, active: true }
      setZones((prev) => [...prev, next])
      notify.success("Zone created", `${next.id} — ${next.name} (${next.sqft.toLocaleString()} sq ft).`)
    }
    setModalOpen(false)
    setEditing(null)
    setForm(emptyForm)
  }

  function toggleActive(z: Zone) {
    setZones((prev) => prev.map((x) => (x.id === z.id ? { ...x, active: !x.active } : x)))
    notify.success("Zone status updated", `${z.name} is now ${z.active ? "Inactive" : "Active"}.`)
  }

  function removeZone(z: Zone) {
    setZones((prev) => prev.filter((x) => x.id !== z.id))
    notify.warning("Zone deleted", `${z.name} has been removed.`)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Zones</h1><p className="text-sm text-muted-foreground mt-1">Define and configure warehouse storage zones</p></div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="warehouse-zones" />
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> Add Zone</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search zone ID or name..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
          </div>
          {["All", ...ZONE_TYPES].map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", typeFilter === t ? "bg-brand text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground")}>{t}</button>
          ))}
          <button
            onClick={() => setShowMoreFilters((v) => !v)}
            title="Toggle additional filters"
            className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border bg-card text-sm transition-colors", showMoreFilters || extraFilterCount > 0 ? "border-brand text-brand" : "border-border text-muted-foreground hover:text-foreground")}
          >
            <Filter className="w-4 h-4" /> More Filters
            {extraFilterCount > 0 && <span className="px-1.5 py-0.5 rounded-full bg-brand text-white text-[10px] font-semibold">{extraFilterCount}</span>}
          </button>
        </div>

        {showMoreFilters && (
          <div className="p-4 rounded-xl border border-border bg-card grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <Field label="Status">
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={["All Statuses", "Active", "Inactive"]} />
            </Field>
            <Field label="Min Sq Ft">
              <TextInput value={minSqft} onChange={(e) => setMinSqft(e.target.value.replace(/\D/g, ""))} placeholder="e.g. 2000" inputMode="numeric" />
            </Field>
            <Field label="Min Racks">
              <TextInput value={minRacks} onChange={(e) => setMinRacks(e.target.value.replace(/\D/g, ""))} placeholder="e.g. 12" inputMode="numeric" />
            </Field>
            <button
              onClick={() => { setStatusFilter("All Statuses"); setMinSqft(""); setMinRacks(""); notify.info("Filters cleared", "Showing all zones.") }}
              className="px-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors"
            >
              Clear Filters
            </button>
            <p className="sm:col-span-4 text-xs text-muted-foreground">Showing {filtered.length} of {zones.length} zones.</p>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["Zone ID","Name","Type","Sq Ft","Racks","Levels","Temp Range","Status","Actions"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(z=>(
              <tr key={z.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{z.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{z.name}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">{z.type}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{z.sqft.toLocaleString()}</td>
                <td className="px-4 py-3 text-muted-foreground">{z.racks}</td>
                <td className="px-4 py-3 text-muted-foreground">{z.levels}</td>
                <td className="px-4 py-3 text-muted-foreground">{z.temp}</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", z.active?"bg-success/10 text-success":"bg-muted text-muted-foreground")}>{z.active?"Active":"Inactive"}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setDetail(z)} title="View details" className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                    <button onClick={() => openEdit(z)} title="Edit zone" className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => toggleActive(z)} title={z.active ? "Deactivate zone" : "Activate zone"} className={cn("p-1.5 rounded-md transition-colors", z.active ? "text-warning hover:bg-warning/10" : "text-success hover:bg-success/10")}><Power className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDeleteTarget(z)} title="Delete zone" className="p-1.5 rounded-md text-danger hover:bg-danger/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">No zones match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create / edit zone */}
      <Modal
        open={modalOpen}
        onOpenChange={(o) => { setModalOpen(o); if (!o) { setEditing(null); setForm(emptyForm); setErrors({}) } }}
        title={editing ? `Edit Zone — ${editing.name}` : "Add Zone"}
        description="Storage zone dimensions and temperature band"
        footer={<ModalActions onCancel={() => setModalOpen(false)} onSubmit={save} submitLabel={editing ? "Save Zone" : "Create Zone"} />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Zone Name" required error={errors.name}>
            <TextInput value={form.name} invalid={!!errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Zone D" />
          </Field>
          <Field label="Zone Type" required error={errors.type}>
            <Select value={form.type} invalid={!!errors.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={ZONE_TYPES} placeholder="Select Type" />
          </Field>
          <Field label="Area (sq ft)" required error={errors.sqft}>
            <TextInput value={form.sqft} invalid={!!errors.sqft} onChange={(e) => setForm({ ...form, sqft: e.target.value })} placeholder="e.g. 12000" inputMode="numeric" />
          </Field>
          <Field label="Racks" required error={errors.racks}>
            <TextInput value={form.racks} invalid={!!errors.racks} onChange={(e) => setForm({ ...form, racks: e.target.value })} placeholder="e.g. 48" inputMode="numeric" />
          </Field>
          <Field label="Levels" required error={errors.levels}>
            <TextInput value={form.levels} invalid={!!errors.levels} onChange={(e) => setForm({ ...form, levels: e.target.value })} placeholder="e.g. 3" inputMode="numeric" />
          </Field>
          <Field label="Temperature Range" required error={errors.temp}>
            <TextInput value={form.temp} invalid={!!errors.temp} onChange={(e) => setForm({ ...form, temp: e.target.value })} placeholder="e.g. 18-25°C" />
          </Field>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.name ?? ""}
        description="Zone detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Close</button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Zone ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Name" value={detail.name} />
            <DetailRow label="Type" value={detail.type} />
            <DetailRow label="Area" value={`${detail.sqft.toLocaleString()} sq ft`} />
            <DetailRow label="Racks" value={detail.racks} />
            <DetailRow label="Levels" value={detail.levels} />
            <DetailRow label="Rack Positions" value={detail.racks * detail.levels} />
            <DetailRow label="Temperature" value={detail.temp} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", detail.active?"bg-success/10 text-success":"bg-muted text-muted-foreground")}>{detail.active?"Active":"Inactive"}</span>} />
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this zone?"
        message={`${deleteTarget?.name} (${deleteTarget?.sqft.toLocaleString()} sq ft) will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete Zone"
        cancelLabel="Keep It"
        onConfirm={() => deleteTarget && removeZone(deleteTarget)}
      />
    </div>
  )
}
