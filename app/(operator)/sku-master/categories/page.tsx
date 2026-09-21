"use client"
import { useState } from "react"
import { Tag, Plus, Eye, Edit2, Power, Trash2, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Category = { id: string; name: string; parent: string | null; skus: number; active: boolean }

const initialCategories: Category[] = [
  { id: "CAT-001", name: "Food & Beverage", parent: null, skus: 412, active: true },
  { id: "CAT-002", name: "FMCG", parent: null, skus: 318, active: true },
  { id: "CAT-003", name: "Pharma", parent: null, skus: 204, active: true },
  { id: "CAT-004", name: "Electronics", parent: null, skus: 156, active: true },
  { id: "CAT-005", name: "Apparel", parent: null, skus: 287, active: true },
  { id: "CAT-006", name: "Industrial", parent: null, skus: 98, active: true },
  { id: "CAT-007", name: "Beverages", parent: "Food & Beverage", skus: 82, active: true },
  { id: "CAT-008", name: "Dairy", parent: "Food & Beverage", skus: 55, active: false },
  { id: "CAT-009", name: "Bakery", parent: "Food & Beverage", skus: 64, active: true },
  { id: "CAT-010", name: "Frozen Foods", parent: "Food & Beverage", skus: 41, active: true },
  { id: "CAT-011", name: "Snacks", parent: "Food & Beverage", skus: 73, active: true },
  { id: "CAT-012", name: "Home Care", parent: "FMCG", skus: 96, active: true },
  { id: "CAT-013", name: "Personal Care", parent: "FMCG", skus: 128, active: true },
  { id: "CAT-014", name: "Oral Care", parent: "FMCG", skus: 37, active: false },
  { id: "CAT-015", name: "OTC Medicines", parent: "Pharma", skus: 88, active: true },
  { id: "CAT-016", name: "Surgical Supplies", parent: "Pharma", skus: 52, active: true },
  { id: "CAT-017", name: "Nutraceuticals", parent: "Pharma", skus: 44, active: false },
  { id: "CAT-018", name: "Mobile Accessories", parent: "Electronics", skus: 61, active: true },
  { id: "CAT-019", name: "Small Appliances", parent: "Electronics", skus: 39, active: true },
  { id: "CAT-020", name: "Menswear", parent: "Apparel", skus: 112, active: true },
  { id: "CAT-021", name: "Womenswear", parent: "Apparel", skus: 134, active: true },
  { id: "CAT-022", name: "Footwear", parent: "Apparel", skus: 45, active: false },
  { id: "CAT-023", name: "Packaging Material", parent: "Industrial", skus: 58, active: true },
  { id: "CAT-024", name: "Cold Chain", parent: null, skus: 27, active: true },
]

const emptyForm = { name: "", parent: "", skus: "" }

export default function SKUCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [search, setSearch] = useState("")

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase())
  )

  const parentOptions = categories.filter(c => !c.parent).map(c => c.name)

  const stats = [
    { label: "Total Categories", value: categories.length },
    { label: "Top-level", value: categories.filter(c => !c.parent).length },
    { label: "Sub-categories", value: categories.filter(c => !!c.parent).length },
    { label: "Mapped SKUs", value: categories.reduce((s, c) => s + c.skus, 0) },
  ]

  function nextId() {
    const nums = categories.map(c => Number(c.id.split("-")[1])).filter(n => !Number.isNaN(n))
    return `CAT-${String(Math.max(8, ...nums) + 1).padStart(3, "0")}`
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Category name is required"
    else if (form.name.trim().length < 3) e.name = "Enter at least 3 characters"
    else if (categories.some(c => c.name.toLowerCase() === form.name.trim().toLowerCase() && c.id !== editing?.id)) e.name = "That category already exists"
    if (form.parent && form.parent === form.name.trim()) e.parent = "A category cannot be its own parent"
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

  function openEdit(c: Category) {
    setEditing(c)
    setForm({ name: c.name, parent: c.parent ?? "", skus: String(c.skus) })
    setErrors({})
    setFormOpen(true)
  }

  function save() {
    if (!validate()) {
      notify.error("Check the form", "Some required fields need your attention.")
      return
    }
    if (editing) {
      const updated: Category = { ...editing, name: form.name.trim(), parent: form.parent || null, skus: Number(form.skus || 0) }
      setCategories(prev => prev.map(c => c.id === editing.id ? updated : c))
      notify.success("Category updated", `${updated.id} — ${updated.name} saved.`)
    } else {
      const created: Category = { id: nextId(), name: form.name.trim(), parent: form.parent || null, skus: Number(form.skus || 0), active: true }
      setCategories(prev => [...prev, created])
      notify.success("Category added", `${created.id} — ${created.name} created.`)
    }
    setFormOpen(false)
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
  }

  function toggleActive(c: Category) {
    setCategories(prev => prev.map(x => x.id === c.id ? { ...x, active: !x.active } : x))
    notify.success(`Category ${c.active ? "deactivated" : "activated"}`, `${c.name} is now ${c.active ? "Inactive" : "Active"}.`)
  }

  function remove(c: Category) {
    // Children are promoted to top-level so the hierarchy stays valid.
    setCategories(prev => prev.filter(x => x.id !== c.id).map(x => x.parent === c.name ? { ...x, parent: null } : x))
    notify.warning("Category deleted", `${c.name} removed; any sub-categories moved to top level.`)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">SKU Categories</h1><p className="text-sm text-muted-foreground mt-1">Manage product category hierarchy</p></div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="sku-categories" />
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> Add Category</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search category name or ID..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["ID", "Category", "Parent", "SKU Count", "Status", "Actions"].map(h => <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{c.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">
                  <button onClick={() => setDetail(c)} title="Open category detail" className="flex items-center gap-2 hover:underline">
                    <Tag className="w-4 h-4 text-muted-foreground" />{c.name}
                  </button>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{c.parent ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.skus}</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", c.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>{c.active ? "Active" : "Inactive"}</span></td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: "View details", icon: <Eye />, onSelect: () => setDetail(c) },
                      { label: "Edit category", icon: <Edit2 />, onSelect: () => openEdit(c) },
                      { label: c.active ? "Deactivate category" : "Activate category", icon: <Power />, onSelect: () => toggleActive(c) },
                      { label: "Delete category", icon: <Trash2 />, onSelect: () => setDeleteTarget(c), tone: "danger" as const },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">No categories match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / edit category */}
      <Modal
        open={formOpen}
        onOpenChange={(o) => { setFormOpen(o); if (!o) { setForm(emptyForm); setErrors({}); setEditing(null) } }}
        title={editing ? `Edit ${editing.id}` : "Add Category"}
        description={editing ? "Update this category" : "Create a new product category"}
        size="sm"
        footer={<ModalActions onCancel={() => setFormOpen(false)} onSubmit={save} submitLabel={editing ? "Save Changes" : "Add Category"} />}
      >
        <div className="space-y-4">
          <Field label="Category Name" required error={errors.name}>
            <TextInput value={form.name} invalid={!!errors.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Frozen Foods" />
          </Field>
          <Field label="Parent Category" error={errors.parent} hint="Leave blank for a top-level category">
            <Select value={form.parent} invalid={!!errors.parent} onChange={e => setForm({ ...form, parent: e.target.value })} options={parentOptions} placeholder="No parent (top level)" />
          </Field>
          <Field label="Initial SKU Count" error={errors.skus} hint="Optional — defaults to 0">
            <TextInput value={form.skus} invalid={!!errors.skus} onChange={e => setForm({ ...form, skus: e.target.value })} placeholder="e.g. 0" inputMode="numeric" />
          </Field>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.name ?? ""}
        description="Category detail"
        footer={
          <>
            <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Close</button>
            <button onClick={() => { if (detail) { openEdit(detail); setDetail(null) } }} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">Edit</button>
          </>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Category ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Name" value={detail.name} />
            <DetailRow label="Parent" value={detail.parent ?? "Top level"} />
            <DetailRow label="Sub-categories" value={categories.filter(c => c.parent === detail.name).length} />
            <DetailRow label="Mapped SKUs" value={detail.skus} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", detail.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>{detail.active ? "Active" : "Inactive"}</span>} />
          </div>
        )}
      </Drawer>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this category?"
        message={`${deleteTarget?.name} (${deleteTarget?.skus} SKUs) will be removed. Any sub-categories are moved to top level. This cannot be undone.`}
        confirmLabel="Delete Category"
        cancelLabel="Keep It"
        onConfirm={() => deleteTarget && remove(deleteTarget)}
      />
    </div>
  )
}
