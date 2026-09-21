"use client"
import { useState } from "react"
import { MapPin, Search, Package, AlertTriangle, Plus, Eye, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Location = {
  id: string; zone: string; aisle: string; bay: string; level: string; type: string
  sku: string; product: string; qty: number; capacity: number; status: string
}

const initialZones: Location[] = [
  { id: "L-1", zone: "A", aisle: "A-01", bay: "01", level: "1", type: "Bulk", sku: "SKU-001234", product: "Premium Basmati Rice 5kg", qty: 1250, capacity: 2000, status: "Active" },
  { id: "L-2", zone: "A", aisle: "A-01", bay: "02", level: "1", type: "Bulk", sku: "SKU-001235", product: "Organic Wheat Flour 10kg", qty: 45, capacity: 2000, status: "Low" },
  { id: "L-3", zone: "A", aisle: "A-02", bay: "01", level: "2", type: "Pick", sku: "SKU-001237", product: "Chickpea Lentils 25kg", qty: 320, capacity: 500, status: "Active" },
  { id: "L-4", zone: "B", aisle: "B-05", bay: "01", level: "1", type: "Bulk", sku: "SKU-001236", product: "Refined Sunflower Oil 5L", qty: 8, capacity: 1500, status: "Critical" },
  { id: "L-5", zone: "B", aisle: "B-08", bay: "02", level: "1", type: "Reserve", sku: "SKU-001238", product: "Brown Sugar 10kg", qty: 0, capacity: 800, status: "Empty" },
  { id: "L-6", zone: "C", aisle: "C-03", bay: "07", level: "3", type: "Cold", sku: "SKU-001240", product: "Tomato Puree 400g", qty: 156, capacity: 400, status: "Active" },
  { id: "L-7", zone: "D", aisle: "D-01", bay: "05", level: "1", type: "Pick", sku: "SKU-001241", product: "Coconut Milk 400ml", qty: 62, capacity: 300, status: "Active" },
  { id: "L-8", zone: "D", aisle: "D-02", bay: "03", level: "2", type: "Pick", sku: "", product: "", qty: 0, capacity: 300, status: "Empty" },
  { id: "L-9", zone: "A", aisle: "A-03", bay: "04", level: "1", type: "Pick", sku: "SKU-001239", product: "Iodized Salt 1kg", qty: 640, capacity: 800, status: "Active" },
  { id: "L-10", zone: "A", aisle: "A-04", bay: "11", level: "2", type: "Bulk", sku: "SKU-001239", product: "Iodized Salt 1kg", qty: 2800, capacity: 3000, status: "Active" },
  { id: "L-11", zone: "A", aisle: "A-05", bay: "02", level: "1", type: "Reserve", sku: "SKU-001234", product: "Premium Basmati Rice 5kg", qty: 18, capacity: 600, status: "Low" },
  { id: "L-12", zone: "A", aisle: "A-06", bay: "02", level: "3", type: "Pick", sku: "SKU-001235", product: "Organic Wheat Flour 10kg", qty: 410, capacity: 900, status: "Active" },
  { id: "L-13", zone: "A", aisle: "A-07", bay: "01", level: "1", type: "Bulk", sku: "", product: "", qty: 0, capacity: 1200, status: "Empty" },
  { id: "L-14", zone: "B", aisle: "B-01", bay: "03", level: "1", type: "Bulk", sku: "SKU-001236", product: "Refined Sunflower Oil 5L", qty: 980, capacity: 1500, status: "Active" },
  { id: "L-15", zone: "B", aisle: "B-03", bay: "02", level: "2", type: "Pick", sku: "SKU-001238", product: "Brown Sugar 10kg", qty: 265, capacity: 600, status: "Active" },
  { id: "L-16", zone: "B", aisle: "B-05", bay: "04", level: "2", type: "Reserve", sku: "SKU-001234", product: "Premium Basmati Rice 5kg", qty: 12, capacity: 800, status: "Critical" },
  { id: "L-17", zone: "B", aisle: "B-06", bay: "01", level: "1", type: "Bulk", sku: "SKU-001237", product: "Chickpea Lentils 25kg", qty: 1420, capacity: 1800, status: "Active" },
  { id: "L-18", zone: "B", aisle: "B-08", bay: "05", level: "3", type: "Pick", sku: "SKU-001238", product: "Brown Sugar 10kg", qty: 22, capacity: 700, status: "Low" },
  { id: "L-19", zone: "B", aisle: "B-09", bay: "02", level: "1", type: "Reserve", sku: "", product: "", qty: 0, capacity: 1000, status: "Empty" },
  { id: "L-20", zone: "C", aisle: "C-01", bay: "01", level: "1", type: "Cold", sku: "SKU-001240", product: "Tomato Puree 400g", qty: 340, capacity: 500, status: "Active" },
  { id: "L-21", zone: "C", aisle: "C-02", bay: "04", level: "2", type: "Cold", sku: "SKU-001241", product: "Coconut Milk 400ml", qty: 188, capacity: 400, status: "Active" },
  { id: "L-22", zone: "C", aisle: "C-03", bay: "02", level: "1", type: "Cold", sku: "SKU-001240", product: "Tomato Puree 400g", qty: 14, capacity: 450, status: "Low" },
  { id: "L-23", zone: "C", aisle: "C-04", bay: "06", level: "3", type: "Reserve", sku: "SKU-001236", product: "Refined Sunflower Oil 5L", qty: 720, capacity: 1200, status: "Active" },
  { id: "L-24", zone: "C", aisle: "C-05", bay: "03", level: "2", type: "Cold", sku: "SKU-001241", product: "Coconut Milk 400ml", qty: 5, capacity: 400, status: "Critical" },
  { id: "L-25", zone: "C", aisle: "C-06", bay: "01", level: "1", type: "Pick", sku: "SKU-001235", product: "Organic Wheat Flour 10kg", qty: 96, capacity: 300, status: "Active" },
  { id: "L-26", zone: "D", aisle: "D-03", bay: "02", level: "1", type: "Pick", sku: "SKU-001240", product: "Tomato Puree 400g", qty: 210, capacity: 400, status: "Active" },
  { id: "L-27", zone: "D", aisle: "D-04", bay: "01", level: "2", type: "Bulk", sku: "SKU-001237", product: "Chickpea Lentils 25kg", qty: 860, capacity: 1600, status: "Active" },
  { id: "L-28", zone: "D", aisle: "D-05", bay: "03", level: "1", type: "Reserve", sku: "SKU-001239", product: "Iodized Salt 1kg", qty: 1450, capacity: 2200, status: "Active" },
  { id: "L-29", zone: "D", aisle: "D-06", bay: "04", level: "2", type: "Pick", sku: "SKU-001241", product: "Coconut Milk 400ml", qty: 9, capacity: 250, status: "Low" },
  { id: "L-30", zone: "D", aisle: "D-07", bay: "02", level: "1", type: "Cold", sku: "", product: "", qty: 0, capacity: 350, status: "Empty" },
]

const statusColor: Record<string, string> = {
  Active: "bg-success/10 text-success",
  Low: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Critical: "bg-danger/10 text-danger",
  Empty: "bg-muted text-muted-foreground",
}

const ZONE_OPTIONS = ["A", "B", "C", "D"] as const
const TYPE_OPTIONS = ["Bulk", "Pick", "Reserve", "Cold"] as const

/** Status is derived from fill level so it stays correct after every mutation. */
function statusFor(qty: number, capacity: number): string {
  if (qty <= 0) return "Empty"
  const fill = capacity ? qty / capacity : 0
  if (fill < 0.02) return "Critical"
  if (fill < 0.05) return "Low"
  return "Active"
}

const emptyForm = { zone: "", aisle: "", bay: "", level: "", type: "", sku: "", product: "", qty: "", capacity: "" }

export default function LocationBrowserPage() {
  const [locations, setLocations] = useState<Location[]>(initialZones)
  const [search, setSearch] = useState("")
  const [zoneFilter, setZoneFilter] = useState("All")

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Location | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Location | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null)

  const filtered = locations.filter(l =>
    (zoneFilter === "All" || l.zone === zoneFilter) &&
    (l.aisle.toLowerCase().includes(search.toLowerCase()) ||
      l.product.toLowerCase().includes(search.toLowerCase()) ||
      l.sku.toLowerCase().includes(search.toLowerCase()))
  )

  // Derived KPIs — recompute from state on every mutation.
  const occupied = locations.filter(l => l.qty > 0).length
  const empty = locations.length - occupied
  const criticalCount = locations.filter(l => l.status === "Critical").length
  const zoneCount = new Set(locations.map(l => l.zone)).size
  const utilisation = locations.length ? Math.round((occupied / locations.length) * 100) : 0

  const stats = [
    { label: "Total Locations", value: locations.length.toLocaleString(), sub: `across ${zoneCount} zone${zoneCount === 1 ? "" : "s"}` },
    { label: "Occupied", value: occupied.toLocaleString(), sub: `${utilisation}% utilisation` },
    { label: "Empty", value: empty.toLocaleString(), sub: "available now" },
    { label: "Critical", value: criticalCount.toLocaleString(), sub: "need attention", alert: true },
  ]

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
    setFormOpen(true)
  }

  function openEdit(l: Location) {
    setEditing(l)
    setForm({
      zone: l.zone, aisle: l.aisle, bay: l.bay, level: l.level, type: l.type,
      sku: l.sku, product: l.product, qty: String(l.qty), capacity: String(l.capacity),
    })
    setErrors({})
    setFormOpen(true)
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.zone) e.zone = "Select a zone"
    if (!form.aisle.trim()) e.aisle = "Aisle is required"
    if (!form.bay.trim()) e.bay = "Bay is required"
    if (!form.level.trim()) e.level = "Level is required"
    if (!form.type) e.type = "Select a location type"
    if (!form.capacity.trim()) e.capacity = "Capacity is required"
    else if (!/^\d+$/.test(form.capacity) || Number(form.capacity) < 1) e.capacity = "Enter a positive whole number"
    if (!form.qty.trim()) e.qty = "Quantity is required"
    else if (!/^\d+$/.test(form.qty)) e.qty = "Enter a whole number"
    else if (/^\d+$/.test(form.capacity) && Number(form.qty) > Number(form.capacity)) e.qty = "Quantity cannot exceed capacity"
    if (form.qty.trim() !== "" && Number(form.qty) > 0) {
      if (!form.sku.trim()) e.sku = "SKU is required when the bin holds stock"
      if (!form.product.trim()) e.product = "Product is required when the bin holds stock"
    }
    const code = `${form.aisle.trim().toUpperCase()}-${form.bay.trim()}-L${form.level.trim()}`
    if (locations.some(l => l.id !== editing?.id && `${l.aisle}-${l.bay}-L${l.level}` === code)) {
      e.aisle = "A location with this aisle/bay/level already exists"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function submitForm() {
    if (!validate()) return
    const qty = Number(form.qty)
    const capacity = Number(form.capacity)
    const base = {
      zone: form.zone,
      aisle: form.aisle.trim().toUpperCase(),
      bay: form.bay.trim(),
      level: form.level.trim(),
      type: form.type,
      sku: qty > 0 ? form.sku.trim().toUpperCase() : "",
      product: qty > 0 ? form.product.trim() : "",
      qty,
      capacity,
      status: statusFor(qty, capacity),
    }
    if (editing) {
      const updated: Location = { ...editing, ...base }
      setLocations(prev => prev.map(l => l.id === editing.id ? updated : l))
      notify.success("Location updated", `${updated.aisle}-${updated.bay}-L${updated.level} saved.`)
    } else {
      const next: Location = { id: `L-${Date.now()}`, ...base }
      setLocations(prev => [next, ...prev])
      notify.success("Location created", `${next.aisle}-${next.bay}-L${next.level} added to Zone ${next.zone}.`)
    }
    setFormOpen(false)
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
  }

  function clearBin(l: Location) {
    setLocations(prev => prev.map(x => x.id === l.id
      ? { ...x, sku: "", product: "", qty: 0, status: "Empty" }
      : x))
    setDetail(null)
    notify.warning("Location emptied", `${l.aisle}-${l.bay}-L${l.level} has been cleared.`)
  }

  function deleteLocation(l: Location) {
    setLocations(prev => prev.filter(x => x.id !== l.id))
    setDetail(null)
    notify.warning("Location deleted", `${l.aisle}-${l.bay}-L${l.level} has been removed.`)
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Location Browser</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Browse and manage warehouse bin locations</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ExportButton data={filtered} filename="locations" />
          <button
            onClick={() => notify.info("Slotting check complete", `${occupied} of ${locations.length} bins occupied (${utilisation}% utilisation), ${criticalCount} critical.`)}
            title="Run slotting check"
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors"
          >
            <MapPin className="w-4 h-4" /> Slotting Check
          </button>
          <button
            onClick={openCreate}
            title="New location"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Location
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn("text-2xl font-bold mt-1", s.alert ? "text-danger" : "text-foreground")}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search aisle, SKU, product..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30" />
        </div>
        {["All", "A", "B", "C", "D"].map(z => (
          <button key={z} onClick={() => setZoneFilter(z)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", zoneFilter === z ? "bg-brand text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground")}>Zone {z === "All" ? "All" : z}</button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              {["Location", "Zone", "Type", "SKU / Product", "Qty", "Capacity", "Fill %", "Status", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(l => (
              <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{l.aisle}-{l.bay}-L{l.level}</td>
                <td className="px-4 py-3 text-foreground">{l.zone}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.type}</td>
                <td className="px-4 py-3">
                  {l.sku ? <><p className="text-xs text-brand font-mono">{l.sku}</p><p className="text-foreground text-xs">{l.product}</p></> : <span className="text-muted-foreground text-xs italic">Empty</span>}
                </td>
                <td className="px-4 py-3 font-semibold text-foreground">{l.qty}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.capacity}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-1.5"><div className="h-1.5 rounded-full bg-brand" style={{ width: `${Math.min(100, l.capacity ? (l.qty / l.capacity) * 100 : 0)}%` }} /></div>
                    <span className="text-xs text-muted-foreground w-8">{l.capacity ? Math.round((l.qty / l.capacity) * 100) : 0}%</span>
                  </div>
                </td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusColor[l.status])}>{l.status}</span></td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: "View details", icon: <Eye />, onSelect: () => setDetail(l) },
                      { label: "Edit location", icon: <Pencil />, onSelect: () => openEdit(l) },
                      { label: "Delete location", icon: <Trash2 />, onSelect: () => setDeleteTarget(l), tone: "danger" as const },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Package className="w-10 h-10 mb-3 opacity-40" />
                    <p className="text-sm font-medium">No locations match your filters.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create / edit location */}
      <Modal
        open={formOpen}
        onOpenChange={(o) => { setFormOpen(o); if (!o) { setEditing(null); setForm(emptyForm); setErrors({}) } }}
        title={editing ? "Edit Location" : "New Location"}
        description={editing ? `${editing.aisle}-${editing.bay}-L${editing.level}` : "Define a new warehouse bin location"}
        footer={<ModalActions onCancel={() => setFormOpen(false)} onSubmit={submitForm} submitLabel={editing ? "Save Changes" : "Create Location"} />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Zone" required error={errors.zone}>
            <Select value={form.zone} invalid={!!errors.zone} onChange={e => setForm({ ...form, zone: e.target.value })} options={ZONE_OPTIONS} placeholder="Select Zone" />
          </Field>
          <Field label="Aisle" required error={errors.aisle}>
            <TextInput value={form.aisle} invalid={!!errors.aisle} onChange={e => setForm({ ...form, aisle: e.target.value })} placeholder="e.g. A-03" />
          </Field>
          <Field label="Bay" required error={errors.bay}>
            <TextInput value={form.bay} invalid={!!errors.bay} onChange={e => setForm({ ...form, bay: e.target.value })} placeholder="e.g. 01" />
          </Field>
          <Field label="Level" required error={errors.level}>
            <TextInput value={form.level} invalid={!!errors.level} onChange={e => setForm({ ...form, level: e.target.value })} placeholder="e.g. 1" />
          </Field>
          <Field label="Location Type" required error={errors.type}>
            <Select value={form.type} invalid={!!errors.type} onChange={e => setForm({ ...form, type: e.target.value })} options={TYPE_OPTIONS} placeholder="Select Type" />
          </Field>
          <Field label="Capacity" required error={errors.capacity}>
            <TextInput value={form.capacity} invalid={!!errors.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} placeholder="e.g. 500" inputMode="numeric" />
          </Field>
          <Field label="Quantity On Hand" required error={errors.qty} hint="Use 0 for an empty bin">
            <TextInput value={form.qty} invalid={!!errors.qty} onChange={e => setForm({ ...form, qty: e.target.value })} placeholder="e.g. 120" inputMode="numeric" />
          </Field>
          <Field label="SKU Code" error={errors.sku}>
            <TextInput value={form.sku} invalid={!!errors.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. SKU-001234" />
          </Field>
          <Field label="Product Name" error={errors.product}>
            <TextInput value={form.product} invalid={!!errors.product} onChange={e => setForm({ ...form, product: e.target.value })} placeholder="e.g. Premium Basmati Rice 5kg" />
          </Field>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail ? `${detail.aisle}-${detail.bay}-L${detail.level}` : ""}
        description="Bin location detail"
        footer={
          <>
            {detail && detail.qty > 0 && (
              <button
                onClick={() => detail && clearBin(detail)}
                title="Empty this bin"
                className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
              >
                Empty Bin
              </button>
            )}
            <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Close
            </button>
          </>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Location" value={<span className="font-mono text-brand">{detail.aisle}-{detail.bay}-L{detail.level}</span>} />
            <DetailRow label="Zone" value={detail.zone} />
            <DetailRow label="Aisle / Bay / Level" value={<span className="font-mono">{detail.aisle} / {detail.bay} / {detail.level}</span>} />
            <DetailRow label="Type" value={detail.type} />
            <DetailRow label="SKU" value={detail.sku ? <span className="font-mono text-brand">{detail.sku}</span> : <span className="italic text-muted-foreground">Empty</span>} />
            <DetailRow label="Product" value={detail.product || <span className="italic text-muted-foreground">—</span>} />
            <DetailRow label="Quantity" value={`${detail.qty} units`} />
            <DetailRow label="Capacity" value={`${detail.capacity} units`} />
            <DetailRow label="Fill" value={`${detail.capacity ? Math.round((detail.qty / detail.capacity) * 100) : 0}%`} />
            <DetailRow
              label="Status"
              value={
                <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", statusColor[detail.status])}>
                  {detail.status === "Critical" && <AlertTriangle className="w-3 h-3" />}
                  {detail.status}
                </span>
              }
            />
          </div>
        )}
      </Drawer>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this location?"
        message={
          deleteTarget
            ? `${deleteTarget.aisle}-${deleteTarget.bay}-L${deleteTarget.level}${deleteTarget.qty > 0 ? ` still holds ${deleteTarget.qty} units of ${deleteTarget.sku}.` : " is empty."} This cannot be undone.`
            : ""
        }
        confirmLabel="Delete Location"
        cancelLabel="Keep It"
        onConfirm={() => deleteTarget && deleteLocation(deleteTarget)}
      />
    </div>
  )
}
