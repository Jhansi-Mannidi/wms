"use client"
import { useState } from "react"
import { Save, X, PackagePlus, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { appendDemoEntry } from "@/lib/demo-store"

// `type` (not `interface`) so the row stays a plain Record-compatible shape
type SKUForm = {
  skuCode: string; name: string; category: string; brand: string
  length: string; width: string; height: string; weight: string
  storageType: string; reorderPoint: string; maxStock: string; shelfLife: string
  barcode: string; hsn: string; uom: string; mrp: string
}

const emptyForm: SKUForm = {
  skuCode: "", name: "", category: "", brand: "",
  length: "", width: "", height: "", weight: "",
  storageType: "", reorderPoint: "", maxStock: "", shelfLife: "",
  barcode: "", hsn: "", uom: "", mrp: "",
}

const CATEGORIES = ["Grains", "Flour & Grains", "Edible Oils", "Pulses", "Sugar", "Salt & Spices", "Processed Foods", "Beverages"] as const
const STORAGE_TYPES = ["Ambient", "Cold", "Frozen"] as const
const UOMS = ["PCS", "KG", "LTR", "Bags", "Tins", "Cans", "Packets"] as const

type FieldSpec = {
  key: keyof SKUForm
  label: string
  placeholder?: string
  required?: boolean
  options?: readonly string[]
  hint?: string
  mode?: "numeric" | "decimal"
}

const GROUPS: { group: string; fields: FieldSpec[] }[] = [
  {
    group: "Basic Information",
    fields: [
      { key: "skuCode", label: "SKU Code", placeholder: "e.g. SKU-001242", required: true, hint: "Format SKU-000000" },
      { key: "name", label: "Product Name", placeholder: "Full product name", required: true },
      { key: "category", label: "Category", options: CATEGORIES, placeholder: "Select category", required: true },
      { key: "brand", label: "Brand", placeholder: "Brand name" },
    ],
  },
  {
    group: "Dimensions & Weight",
    fields: [
      { key: "length", label: "Length (cm)", placeholder: "0.00", required: true, mode: "decimal" },
      { key: "width", label: "Width (cm)", placeholder: "0.00", required: true, mode: "decimal" },
      { key: "height", label: "Height (cm)", placeholder: "0.00", required: true, mode: "decimal" },
      { key: "weight", label: "Weight (kg)", placeholder: "0.00", required: true, mode: "decimal" },
    ],
  },
  {
    group: "Storage",
    fields: [
      { key: "storageType", label: "Storage Type", options: STORAGE_TYPES, placeholder: "Ambient / Cold / Frozen", required: true },
      { key: "reorderPoint", label: "Reorder Point", placeholder: "Min quantity to trigger reorder", required: true, mode: "numeric" },
      { key: "maxStock", label: "Max Stock", placeholder: "Maximum stock level", required: true, mode: "numeric" },
      { key: "shelfLife", label: "Shelf Life (days)", placeholder: "Leave blank if N/A", mode: "numeric" },
    ],
  },
  {
    group: "Identification",
    fields: [
      { key: "barcode", label: "Barcode / EAN", placeholder: "13-digit barcode", required: true, hint: "Exactly 13 digits" },
      { key: "hsn", label: "HSN Code", placeholder: "Harmonised code", required: true, hint: "e.g. 1006.30" },
      { key: "uom", label: "Unit of Measure", options: UOMS, placeholder: "PCS / KG / LTR", required: true },
      { key: "mrp", label: "MRP (₹)", placeholder: "Maximum retail price", required: true, mode: "decimal" },
    ],
  },
]

export default function SKUAddPage() {
  const router = useRouter()
  const [form, setForm] = useState<SKUForm>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [lastSaved, setLastSaved] = useState<SKUForm | null>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const dirty = (Object.keys(emptyForm) as (keyof SKUForm)[]).some(k => form[k].trim() !== "")

  function set(key: keyof SKUForm, value: string) {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => {
      if (!e[key]) return e
      const next = { ...e }
      delete next[key]
      return next
    })
  }

  function validate() {
    const e: Record<string, string> = {}
    const decimal = /^\d+(\.\d+)?$/

    if (!form.skuCode.trim()) e.skuCode = "SKU code is required"
    else if (!/^SKU-\d{6}$/i.test(form.skuCode.trim())) e.skuCode = "Use the format SKU-001242"

    if (!form.name.trim()) e.name = "Product name is required"
    else if (form.name.trim().length < 3) e.name = "Enter at least 3 characters"

    if (!form.category) e.category = "Select a category"

    for (const key of ["length", "width", "height", "weight"] as const) {
      const v = form[key]
      if (!v.trim()) e[key] = "Required"
      else if (!decimal.test(v) || Number(v) <= 0) e[key] = "Enter a positive number"
    }

    if (!form.storageType) e.storageType = "Select a storage type"

    if (!form.reorderPoint.trim()) e.reorderPoint = "Reorder point is required"
    else if (!/^\d+$/.test(form.reorderPoint)) e.reorderPoint = "Enter a whole number"

    if (!form.maxStock.trim()) e.maxStock = "Max stock is required"
    else if (!/^\d+$/.test(form.maxStock)) e.maxStock = "Enter a whole number"
    else if (Number(form.maxStock) <= Number(form.reorderPoint || 0)) e.maxStock = "Must exceed the reorder point"

    if (form.shelfLife.trim() && !/^\d+$/.test(form.shelfLife)) e.shelfLife = "Enter a whole number of days"

    if (!form.barcode.trim()) e.barcode = "Barcode is required"
    else if (!/^\d{13}$/.test(form.barcode.trim())) e.barcode = "Barcode must be exactly 13 digits"

    if (!form.hsn.trim()) e.hsn = "HSN code is required"
    else if (!/^\d{4}(\.\d{2})?$/.test(form.hsn.trim())) e.hsn = "Use the format 1006.30"

    if (!form.uom) e.uom = "Select a unit of measure"

    if (!form.mrp.trim()) e.mrp = "MRP is required"
    else if (!decimal.test(form.mrp) || Number(form.mrp) <= 0) e.mrp = "Enter a positive amount"

    setErrors(e)
    return Object.keys(e).length === 0
  }

  function save() {
    if (!validate()) {
      notify.error("Check the form", "Some required fields need your attention.")
      return
    }
    const saved: SKUForm = { ...form, skuCode: form.skuCode.trim().toUpperCase(), name: form.name.trim() }
    appendDemoEntry("skus", {
      sku: saved.skuCode,
      name: saved.name,
      category: saved.category,
      brand: saved.brand.trim() || "—",
      uom: saved.uom,
      weight: `${saved.weight} kg`,
      dimensions: `${saved.length}×${saved.width}×${saved.height} cm`,
      barcode: saved.barcode.trim(),
      client: "Acme Foods",
      hsn: saved.hsn.trim(),
      status: "Active",
    })
    setLastSaved(saved)
    setForm(emptyForm)
    setErrors({})
    setSubmitted(true)
    notify.success("SKU saved", `${saved.skuCode} — ${saved.name} added to the SKU master.`)
  }

  function resetForm() {
    setForm(emptyForm)
    setErrors({})
    notify.info("Form cleared", "All entered details were discarded.")
  }

  function handleCancel() {
    if (dirty) setConfirmCancel(true)
    else router.push("/sku-master")
  }

  if (submitted) return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
      <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
        <PackagePlus className="w-7 h-7 text-success" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">SKU Created Successfully</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        {lastSaved
          ? `${lastSaved.skuCode} — ${lastSaved.name} was added under ${lastSaved.category} (${lastSaved.uom}, ${lastSaved.weight} kg, ${lastSaved.storageType} storage).`
          : "The new SKU has been added to the master."}
      </p>
      <div className="flex gap-2">
        <button onClick={() => router.push("/sku-master")} className="px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors">Back to SKU Master</button>
        <button onClick={() => { setSubmitted(false); setForm(emptyForm); setErrors({}) }} className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">Add Another</button>
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Add New SKU</h1><p className="text-sm text-muted-foreground mt-1">Create a new product record in the SKU master</p></div>
        <div className="flex gap-2">
          <button onClick={() => (dirty ? setConfirmReset(true) : notify.info("Nothing to clear", "The form is already empty."))} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors"><RotateCcw className="w-4 h-4" /> Reset</button>
          <button onClick={handleCancel} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors"><X className="w-4 h-4" /> Cancel</button>
          <button onClick={save} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Save className="w-4 h-4" /> Save SKU</button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {GROUPS.map(g => (
          <div key={g.group} className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border"><p className="font-semibold text-sm text-foreground">{g.group}</p></div>
            <div className="p-4 space-y-3">
              {g.fields.map(f => (
                <Field key={f.key} label={f.label} required={f.required} error={errors[f.key]} hint={f.hint}>
                  {f.options ? (
                    <Select
                      value={form[f.key]}
                      invalid={!!errors[f.key]}
                      onChange={e => set(f.key, e.target.value)}
                      options={f.options}
                      placeholder={f.placeholder}
                    />
                  ) : (
                    <TextInput
                      value={form[f.key]}
                      invalid={!!errors[f.key]}
                      onChange={e => set(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      inputMode={f.mode}
                    />
                  )}
                </Field>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Discard this SKU?"
        message="You have unsaved changes. Leaving now will discard everything you entered."
        confirmLabel="Discard & Leave"
        cancelLabel="Keep Editing"
        onConfirm={() => { setForm(emptyForm); setErrors({}); router.push("/sku-master") }}
      />

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Clear the form?"
        message="Every field you have filled in will be emptied. This cannot be undone."
        confirmLabel="Clear Form"
        cancelLabel="Keep Editing"
        onConfirm={resetForm}
      />
    </div>
  )
}
