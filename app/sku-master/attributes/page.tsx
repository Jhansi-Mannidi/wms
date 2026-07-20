"use client"
import { useState } from "react"
import { Plus, Settings, Eye, Edit2, Trash2, Search, ToggleLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Attribute = { id: string; name: string; type: string; required: boolean; skus: number; example: string }

const initialAttributes: Attribute[] = [
  { id: "ATTR-001", name: "Colour", type: "Text", required: false, skus: 287, example: "Red, Blue, Green" },
  { id: "ATTR-002", name: "Size", type: "Text", required: false, skus: 312, example: "S, M, L, XL" },
  { id: "ATTR-003", name: "Material", type: "Text", required: false, skus: 142, example: "Cotton, Polyester" },
  { id: "ATTR-004", name: "Shelf Life", type: "Number", required: true, skus: 412, example: "180 (days)" },
  { id: "ATTR-005", name: "Storage Temp", type: "Select", required: true, skus: 204, example: "Ambient, Cold, Frozen" },
  { id: "ATTR-006", name: "Hazardous", type: "Boolean", required: true, skus: 98, example: "Yes / No" },
  { id: "ATTR-007", name: "Country of Origin", type: "Text", required: false, skus: 1420, example: "India, China, USA" },
  { id: "ATTR-008", name: "Batch Number", type: "Text", required: true, skus: 1240, example: "BAT-2024-1205" },
  { id: "ATTR-009", name: "Expiry Date", type: "Date", required: true, skus: 986, example: "2025-06-15" },
  { id: "ATTR-010", name: "Manufacture Date", type: "Date", required: false, skus: 742, example: "2024-12-05" },
  { id: "ATTR-011", name: "Net Weight", type: "Number", required: true, skus: 1380, example: "5 (kg)" },
  { id: "ATTR-012", name: "Gross Weight", type: "Number", required: false, skus: 1105, example: "5.4 (kg)" },
  { id: "ATTR-013", name: "Pack Size", type: "Select", required: true, skus: 890, example: "Single, Multipack, Bulk" },
  { id: "ATTR-014", name: "Fragile", type: "Boolean", required: false, skus: 214, example: "Yes / No" },
  { id: "ATTR-015", name: "Temperature Controlled", type: "Boolean", required: true, skus: 176, example: "Yes / No" },
  { id: "ATTR-016", name: "Brand", type: "Text", required: true, skus: 1420, example: "Nature's Best, Sunrise" },
  { id: "ATTR-017", name: "HSN Code", type: "Text", required: true, skus: 1398, example: "1006.30" },
  { id: "ATTR-018", name: "Grade", type: "Select", required: false, skus: 468, example: "A, B, C" },
  { id: "ATTR-019", name: "Packaging Type", type: "Select", required: false, skus: 725, example: "Carton, Sack, Pouch" },
  { id: "ATTR-020", name: "Units Per Case", type: "Number", required: true, skus: 1052, example: "24" },
  { id: "ATTR-021", name: "Serial Tracked", type: "Boolean", required: false, skus: 132, example: "Yes / No" },
  { id: "ATTR-022", name: "Best Before Date", type: "Date", required: false, skus: 654, example: "2025-09-30" },
  { id: "ATTR-023", name: "Flavour", type: "Text", required: false, skus: 298, example: "Plain, Masala, Mint" },
  { id: "ATTR-024", name: "Shelf Position", type: "Select", required: false, skus: 385, example: "Top, Middle, Bottom" },
]

const TYPES = ["Text", "Number", "Select", "Boolean", "Date"] as const
const REQUIRED_OPTIONS = ["Required", "Optional"] as const

const emptyForm = { name: "", type: "", required: "", example: "", skus: "" }

export default function SKUAttributesPage() {
  const [attributes, setAttributes] = useState<Attribute[]>(initialAttributes)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("All Types")

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Attribute | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Attribute | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Attribute | null>(null)

  const filtered = attributes.filter(a =>
    (a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase())) &&
    (typeFilter === "All Types" || a.type === typeFilter)
  )

  const stats = [
    { label: "Total Attributes", value: attributes.length },
    { label: "Required", value: attributes.filter(a => a.required).length },
    { label: "Optional", value: attributes.filter(a => !a.required).length },
    { label: "SKU Assignments", value: attributes.reduce((s, a) => s + a.skus, 0).toLocaleString() },
  ]

  function nextId() {
    const nums = attributes.map(a => Number(a.id.split("-")[1])).filter(n => !Number.isNaN(n))
    return `ATTR-${String(Math.max(7, ...nums) + 1).padStart(3, "0")}`
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Attribute name is required"
    else if (form.name.trim().length < 2) e.name = "Enter at least 2 characters"
    else if (attributes.some(a => a.name.toLowerCase() === form.name.trim().toLowerCase() && a.id !== editing?.id)) e.name = "That attribute already exists"
    if (!form.type) e.type = "Select a data type"
    if (!form.required) e.required = "Choose required or optional"
    if (!form.example.trim()) e.example = "Give at least one example value"
    if (form.skus.trim() && !/^\d+$/.test(form.skus)) e.skus = "Enter a whole number"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
    setFormOpen(true)
  }

  function openEdit(a: Attribute) {
    setEditing(a)
    setForm({ name: a.name, type: a.type, required: a.required ? "Required" : "Optional", example: a.example, skus: String(a.skus) })
    setErrors({})
    setFormOpen(true)
  }

  function save() {
    if (!validate()) {
      notify.error("Check the form", "Some required fields need your attention.")
      return
    }
    const base = {
      name: form.name.trim(),
      type: form.type,
      required: form.required === "Required",
      example: form.example.trim(),
      skus: Number(form.skus || 0),
    }
    if (editing) {
      setAttributes(prev => prev.map(a => a.id === editing.id ? { ...editing, ...base } : a))
      notify.success("Attribute updated", `${editing.id} — ${base.name} saved.`)
    } else {
      const created: Attribute = { id: nextId(), ...base }
      setAttributes(prev => [...prev, created])
      notify.success("Attribute added", `${created.id} — ${created.name} created.`)
    }
    setFormOpen(false)
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
  }

  function toggleRequired(a: Attribute) {
    setAttributes(prev => prev.map(x => x.id === a.id ? { ...x, required: !x.required } : x))
    notify.success("Attribute updated", `${a.name} is now ${a.required ? "Optional" : "Required"}.`)
  }

  function remove(a: Attribute) {
    setAttributes(prev => prev.filter(x => x.id !== a.id))
    notify.warning("Attribute deleted", `${a.name} removed from ${a.skus.toLocaleString()} SKUs.`)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">SKU Attributes</h1><p className="text-sm text-muted-foreground mt-1">Custom attributes and metadata fields for products</p></div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="sku-attributes" />
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> Add Attribute</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search attribute name or ID..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
        </div>
        {["All Types", ...TYPES].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", typeFilter === t ? "bg-brand text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground")}>{t}</button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["ID", "Attribute", "Type", "Required", "SKUs Using", "Example Values", "Actions"].map(h => <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(a => (
              <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{a.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">
                  <button onClick={() => setDetail(a)} title="Open attribute detail" className="flex items-center gap-2 hover:underline">
                    <Settings className="w-3.5 h-3.5 text-muted-foreground" />{a.name}
                  </button>
                </td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-muted text-xs font-mono text-muted-foreground">{a.type}</span></td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", a.required ? "bg-brand/10 text-brand" : "bg-muted text-muted-foreground")}>{a.required ? "Required" : "Optional"}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{a.skus.toLocaleString()}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{a.example}</td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: "View details", icon: <Eye />, onSelect: () => setDetail(a) },
                      { label: "Edit attribute", icon: <Edit2 />, onSelect: () => openEdit(a) },
                      { label: a.required ? "Make optional" : "Make required", icon: <ToggleLeft />, onSelect: () => toggleRequired(a) },
                      { label: "Delete attribute", icon: <Trash2 />, onSelect: () => setDeleteTarget(a), tone: "danger" as const },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No attributes match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / edit attribute */}
      <Modal
        open={formOpen}
        onOpenChange={(o) => { setFormOpen(o); if (!o) { setForm(emptyForm); setErrors({}); setEditing(null) } }}
        title={editing ? `Edit ${editing.id}` : "Add Attribute"}
        description={editing ? "Update this metadata field" : "Define a new product metadata field"}
        footer={<ModalActions onCancel={() => setFormOpen(false)} onSubmit={save} submitLabel={editing ? "Save Changes" : "Add Attribute"} />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Attribute Name" required error={errors.name}>
            <TextInput value={form.name} invalid={!!errors.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Allergen Info" />
          </Field>
          <Field label="Data Type" required error={errors.type}>
            <Select value={form.type} invalid={!!errors.type} onChange={e => setForm({ ...form, type: e.target.value })} options={TYPES} placeholder="Select Type" />
          </Field>
          <Field label="Requirement" required error={errors.required}>
            <Select value={form.required} invalid={!!errors.required} onChange={e => setForm({ ...form, required: e.target.value })} options={REQUIRED_OPTIONS} placeholder="Required or Optional" />
          </Field>
          <Field label="SKUs Using" error={errors.skus} hint="Optional — defaults to 0">
            <TextInput value={form.skus} invalid={!!errors.skus} onChange={e => setForm({ ...form, skus: e.target.value })} placeholder="e.g. 0" inputMode="numeric" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Example Values" required error={errors.example}>
              <TextInput value={form.example} invalid={!!errors.example} onChange={e => setForm({ ...form, example: e.target.value })} placeholder="e.g. Gluten, Nuts, Dairy" />
            </Field>
          </div>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.name ?? ""}
        description="Attribute detail"
        footer={
          <>
            <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Close</button>
            <button onClick={() => { if (detail) { openEdit(detail); setDetail(null) } }} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">Edit</button>
          </>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Attribute ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Name" value={detail.name} />
            <DetailRow label="Data Type" value={detail.type} />
            <DetailRow label="Requirement" value={detail.required ? "Required" : "Optional"} />
            <DetailRow label="SKUs Using" value={detail.skus.toLocaleString()} />
            <DetailRow label="Example Values" value={detail.example} />
          </div>
        )}
      </Drawer>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this attribute?"
        message={`${deleteTarget?.name} is used by ${deleteTarget?.skus.toLocaleString()} SKUs. Deleting removes the field and its values. This cannot be undone.`}
        confirmLabel="Delete Attribute"
        cancelLabel="Keep It"
        onConfirm={() => deleteTarget && remove(deleteTarget)}
      />
    </div>
  )
}
