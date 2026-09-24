"use client"

import { useState, useEffect } from "react"
import {
  Tag, Package, Plus, Search, ChevronDown, Eye, MoreHorizontal,
  Upload, Edit2, Layers, Barcode, FileText, Power, Trash2, Copy
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"
import { loadDemoEntries } from "@/lib/demo-store"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type SKU = {
  sku: string; name: string; category: string; brand: string; uom: string
  weight: string; dimensions: string; barcode: string; client: string
  hsn: string; status: string
}

const initialSkus: SKU[] = [
  { sku: "SKU-001234", name: "Premium Basmati Rice 5kg", category: "Grains", brand: "Nature's Best", uom: "Bags", weight: "5 kg", dimensions: "30×20×15 cm", barcode: "8901234567890", client: "Acme Foods", hsn: "1006.30", status: "Active" },
  { sku: "SKU-001235", name: "Organic Wheat Flour 10kg", category: "Flour & Grains", brand: "Mill Fresh", uom: "Bags", weight: "10 kg", dimensions: "40×25×10 cm", barcode: "8901234567891", client: "Acme Foods", hsn: "1101.00", status: "Active" },
  { sku: "SKU-001236", name: "Refined Sunflower Oil 5L", category: "Edible Oils", brand: "Sunrise", uom: "Tins", weight: "5.2 kg", dimensions: "20×15×25 cm", barcode: "8901234567892", client: "Global Oils", hsn: "1512.11", status: "Active" },
  { sku: "SKU-001237", name: "Chickpea Lentils 25kg", category: "Pulses", brand: "Farm Direct", uom: "Bags", weight: "25 kg", dimensions: "60×40×20 cm", barcode: "8901234567893", client: "Agro Corp", hsn: "0713.33", status: "Active" },
  { sku: "SKU-001238", name: "Brown Sugar 10kg", category: "Sugar", brand: "Sweet House", uom: "Bags", weight: "10 kg", dimensions: "35×25×12 cm", barcode: "8901234567894", client: "Sweet Mills", hsn: "1701.91", status: "Inactive" },
  { sku: "SKU-001239", name: "Iodized Salt 1kg", category: "Salt & Spices", brand: "Pure Salt", uom: "Packets", weight: "1 kg", dimensions: "15×10×5 cm", barcode: "8901234567895", client: "Salt Works", hsn: "2501.00", status: "Active" },
  { sku: "SKU-001240", name: "Tomato Puree 400g", category: "Processed Foods", brand: "FreshFarms", uom: "Cans", weight: "0.45 kg", dimensions: "8×8×12 cm", barcode: "8901234567896", client: "Fresh Farms", hsn: "2002.90", status: "Active" },
  { sku: "SKU-001241", name: "Coconut Milk 400ml", category: "Beverages", brand: "Tropical", uom: "Cans", weight: "0.42 kg", dimensions: "7×7×11 cm", barcode: "8901234567897", client: "Tropical Co", hsn: "2106.90", status: "Active" },
  { sku: "SKU-001242", name: "Toor Dal 5kg", category: "Pulses", brand: "Farm Direct", uom: "Bags", weight: "5 kg", dimensions: "30×20×12 cm", barcode: "8901234567920", client: "Agro Corp", hsn: "0713.60", status: "Active" },
  { sku: "SKU-001243", name: "Mustard Oil 2L", category: "Edible Oils", brand: "Sunrise", uom: "Tins", weight: "2.1 kg", dimensions: "15×12×22 cm", barcode: "8901234567921", client: "Global Oils", hsn: "1514.11", status: "Active" },
  { sku: "SKU-001244", name: "Jaggery Blocks 1kg", category: "Sugar", brand: "Sweet House", uom: "Packets", weight: "1 kg", dimensions: "18×12×6 cm", barcode: "8901234567922", client: "Sweet Mills", hsn: "1701.13", status: "Active" },
  { sku: "SKU-001245", name: "Black Pepper 500g", category: "Salt & Spices", brand: "Pure Salt", uom: "Packets", weight: "0.5 kg", dimensions: "12×8×5 cm", barcode: "8901234567923", client: "Salt Works", hsn: "0904.11", status: "Active" },
  { sku: "SKU-001246", name: "Mango Pulp 850g", category: "Processed Foods", brand: "FreshFarms", uom: "Cans", weight: "0.9 kg", dimensions: "10×10×14 cm", barcode: "8901234567924", client: "Fresh Farms", hsn: "2007.99", status: "Active" },
  { sku: "SKU-001247", name: "Sona Masoori Rice 25kg", category: "Grains", brand: "Nature's Best", uom: "Bags", weight: "25 kg", dimensions: "60×40×20 cm", barcode: "8901234567925", client: "Acme Foods", hsn: "1006.30", status: "Active" },
  { sku: "SKU-001248", name: "Multigrain Atta 5kg", category: "Flour & Grains", brand: "Mill Fresh", uom: "Bags", weight: "5 kg", dimensions: "30×22×10 cm", barcode: "8901234567926", client: "Acme Foods", hsn: "1101.00", status: "Active" },
  { sku: "SKU-001249", name: "Tender Coconut Water 200ml", category: "Beverages", brand: "Tropical", uom: "Cans", weight: "0.22 kg", dimensions: "6×6×10 cm", barcode: "8901234567927", client: "Tropical Co", hsn: "2202.99", status: "Active" },
  { sku: "SKU-001250", name: "Groundnut Oil 15L", category: "Edible Oils", brand: "Sunrise", uom: "Tins", weight: "15.4 kg", dimensions: "30×30×40 cm", barcode: "8901234567928", client: "Global Oils", hsn: "1508.90", status: "Active" },
  { sku: "SKU-001251", name: "Moong Dal 10kg", category: "Pulses", brand: "Farm Direct", uom: "Bags", weight: "10 kg", dimensions: "40×28×15 cm", barcode: "8901234567929", client: "Agro Corp", hsn: "0713.31", status: "Inactive" },
  { sku: "SKU-001252", name: "Castor Sugar 2kg", category: "Sugar", brand: "Sweet House", uom: "Packets", weight: "2 kg", dimensions: "22×15×8 cm", barcode: "8901234567930", client: "Sweet Mills", hsn: "1701.99", status: "Active" },
  { sku: "SKU-001253", name: "Rock Salt 5kg", category: "Salt & Spices", brand: "Pure Salt", uom: "Bags", weight: "5 kg", dimensions: "28×18×10 cm", barcode: "8901234567931", client: "Salt Works", hsn: "2501.00", status: "Active" },
  { sku: "SKU-001254", name: "Sweet Corn 400g", category: "Processed Foods", brand: "FreshFarms", uom: "Cans", weight: "0.44 kg", dimensions: "8×8×12 cm", barcode: "8901234567932", client: "Fresh Farms", hsn: "2005.80", status: "Inactive" },
  { sku: "SKU-001255", name: "Pineapple Juice 1L", category: "Beverages", brand: "Tropical", uom: "LTR", weight: "1.05 kg", dimensions: "9×9×24 cm", barcode: "8901234567933", client: "Tropical Co", hsn: "2009.41", status: "Active" },
  { sku: "SKU-001256", name: "Idli Rice 10kg", category: "Grains", brand: "Nature's Best", uom: "Bags", weight: "10 kg", dimensions: "45×30×15 cm", barcode: "8901234567934", client: "Acme Foods", hsn: "1006.30", status: "Active" },
  { sku: "SKU-001257", name: "Ragi Flour 2kg", category: "Flour & Grains", brand: "Mill Fresh", uom: "Packets", weight: "2 kg", dimensions: "24×16×8 cm", barcode: "8901234567935", client: "Acme Foods", hsn: "1102.29", status: "Inactive" },
  { sku: "SKU-001258", name: "Sesame Oil 1L", category: "Edible Oils", brand: "Sunrise", uom: "Tins", weight: "1.1 kg", dimensions: "10×10×22 cm", barcode: "8901234567936", client: "Global Oils", hsn: "1515.50", status: "Active" },
  { sku: "SKU-001259", name: "Urad Dal 5kg", category: "Pulses", brand: "Farm Direct", uom: "Bags", weight: "5 kg", dimensions: "30×20×12 cm", barcode: "8901234567937", client: "Agro Corp", hsn: "0713.31", status: "Active" },
  { sku: "SKU-001260", name: "Palm Jaggery Powder 500g", category: "Sugar", brand: "Sweet House", uom: "Packets", weight: "0.5 kg", dimensions: "14×10×6 cm", barcode: "8901234567938", client: "Sweet Mills", hsn: "1701.13", status: "Inactive" },
  { sku: "SKU-001261", name: "Turmeric Powder 1kg", category: "Salt & Spices", brand: "Pure Salt", uom: "Packets", weight: "1 kg", dimensions: "16×11×6 cm", barcode: "8901234567939", client: "Salt Works", hsn: "0910.30", status: "Active" },
  { sku: "SKU-001262", name: "Tomato Ketchup 1kg", category: "Processed Foods", brand: "FreshFarms", uom: "PCS", weight: "1.05 kg", dimensions: "11×11×25 cm", barcode: "8901234567940", client: "Fresh Farms", hsn: "2103.20", status: "Active" },
  { sku: "SKU-001263", name: "Mango Nectar 250ml", category: "Beverages", brand: "Tropical", uom: "Cans", weight: "0.27 kg", dimensions: "6×6×12 cm", barcode: "8901234567941", client: "Tropical Co", hsn: "2009.89", status: "Inactive" },
]

const categories = ["All Categories", "Grains", "Flour & Grains", "Edible Oils", "Pulses", "Sugar", "Salt & Spices", "Processed Foods", "Beverages"]
const CATEGORY_OPTIONS = categories.slice(1)
const CLIENT_OPTIONS = ["Acme Foods", "Global Oils", "Agro Corp", "Sweet Mills", "Salt Works", "Fresh Farms", "Tropical Co"] as const
const UOM_OPTIONS = ["Bags", "Tins", "Cans", "Packets", "PCS", "KG", "LTR"] as const

/** Files the simulated browser can select, with the SKU rows a parse would yield. */
const SAMPLE_FILES = ["sku_master_batch_a.csv", "client_onboarding_skus.xlsx"] as const

const PARSED_SKUS: Record<string, Omit<SKU, "sku">[]> = {
  "sku_master_batch_a.csv": [
    { name: "Toor Dal 5kg", category: "Pulses", brand: "Farm Direct", uom: "Bags", weight: "5 kg", dimensions: "30×20×12 cm", barcode: "8901234567900", client: "Agro Corp", hsn: "0713.60", status: "Active" },
    { name: "Mustard Oil 2L", category: "Edible Oils", brand: "Sunrise", uom: "Tins", weight: "2.1 kg", dimensions: "15×12×22 cm", barcode: "8901234567901", client: "Global Oils", hsn: "1514.11", status: "Active" },
    { name: "Jaggery Blocks 1kg", category: "Sugar", brand: "Sweet House", uom: "Packets", weight: "1 kg", dimensions: "18×12×6 cm", barcode: "8901234567902", client: "Sweet Mills", hsn: "1701.13", status: "Active" },
  ],
  "client_onboarding_skus.xlsx": [
    { name: "Black Pepper 500g", category: "Salt & Spices", brand: "Pure Salt", uom: "Packets", weight: "0.5 kg", dimensions: "12×8×5 cm", barcode: "8901234567910", client: "Salt Works", hsn: "0904.11", status: "Active" },
    { name: "Mango Pulp 850g", category: "Processed Foods", brand: "FreshFarms", uom: "Cans", weight: "0.9 kg", dimensions: "10×10×14 cm", barcode: "8901234567911", client: "Fresh Farms", hsn: "2007.99", status: "Active" },
  ],
}

const emptyForm = { sku: "", name: "", category: "", brand: "", barcode: "", uom: "", weight: "", dimensions: "", hsn: "", client: "" }

export default function SKUMasterPage() {
  const [skus, setSkus] = useState<SKU[]>(initialSkus)

  useEffect(() => {
    const stored = loadDemoEntries<SKU>("skus")
    if (stored.length) setSkus(prev => [...stored, ...prev])
  }, [])
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All Categories")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [clientFilter, setClientFilter] = useState("All Clients")
  const [showAddForm, setShowAddForm] = useState(false)
  const [page, setPage] = useState(1)

  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [editing, setEditing] = useState<SKU | null>(null)

  // bulk import
  const [importOpen, setImportOpen] = useState(false)
  const [pickedFile, setPickedFile] = useState("")
  const [parsed, setParsed] = useState<{ file: string; total: number; valid: number; errors: number } | null>(null)
  const [importError, setImportError] = useState("")

  const [detail, setDetail] = useState<SKU | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SKU | null>(null)

  const PAGE_SIZE = 5

  const filtered = skus.filter((s) => {
    const q = search.toLowerCase()
    return (
      (s.sku.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.brand.toLowerCase().includes(q) || s.barcode.includes(q)) &&
      (categoryFilter === "All Categories" || s.category === categoryFilter) &&
      (statusFilter === "All Status" || s.status === statusFilter) &&
      (clientFilter === "All Clients" || s.client === clientFilter)
    )
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function nextSkuCode(offset = 0) {
    const nums = skus.map(s => Number(s.sku.split("-")[1])).filter(n => !Number.isNaN(n))
    return `SKU-${String(Math.max(1241, ...nums) + 1 + offset).padStart(6, "0")}`
  }

  function validate(isEdit: boolean) {
    const e: Record<string, string> = {}
    if (!form.sku.trim()) e.sku = "SKU code is required"
    else if (!/^SKU-\d{6}$/i.test(form.sku.trim())) e.sku = "Use the format SKU-001242"
    else if (!isEdit && skus.some(s => s.sku.toLowerCase() === form.sku.trim().toLowerCase())) e.sku = "That SKU code already exists"

    if (!form.name.trim()) e.name = "Product name is required"
    else if (form.name.trim().length < 3) e.name = "Enter at least 3 characters"

    if (!form.category) e.category = "Select a category"
    if (!form.uom) e.uom = "Select a unit of measure"
    if (!form.client) e.client = "Select a client"

    if (!form.barcode.trim()) e.barcode = "Barcode is required"
    else if (!/^\d{13}$/.test(form.barcode.trim())) e.barcode = "Barcode must be exactly 13 digits"
    else if (skus.some(s => s.barcode === form.barcode.trim() && (!isEdit || s.sku !== editing?.sku))) e.barcode = "That barcode is already in use"

    if (!form.weight.trim()) e.weight = "Weight is required"
    else if (!/^\d+(\.\d+)?$/.test(form.weight.trim().replace(/\s*kg$/i, ""))) e.weight = "Enter a number in kg"

    if (!form.hsn.trim()) e.hsn = "HSN code is required"
    else if (!/^\d{4}(\.\d{2})?$/.test(form.hsn.trim())) e.hsn = "Use the format 1006.30"

    setErrors(e)
    return Object.keys(e).length === 0
  }

  function openCreate() {
    setEditing(null)
    setForm({ ...emptyForm, sku: nextSkuCode() })
    setErrors({})
    setShowAddForm(true)
  }

  function openEdit(s: SKU) {
    setEditing(s)
    setForm({
      sku: s.sku, name: s.name, category: s.category, brand: s.brand, barcode: s.barcode,
      uom: s.uom, weight: s.weight.replace(/\s*kg$/i, ""), dimensions: s.dimensions, hsn: s.hsn, client: s.client,
    })
    setErrors({})
    setShowAddForm(true)
  }

  function saveSku() {
    const isEdit = !!editing
    if (!validate(isEdit)) {
      notify.error("Check the form", "Some required fields need your attention.")
      return
    }
    const row: SKU = {
      sku: form.sku.trim().toUpperCase(),
      name: form.name.trim(),
      category: form.category,
      brand: form.brand.trim() || "—",
      uom: form.uom,
      weight: `${form.weight.trim().replace(/\s*kg$/i, "")} kg`,
      dimensions: form.dimensions.trim() || "—",
      barcode: form.barcode.trim(),
      client: form.client,
      hsn: form.hsn.trim(),
      status: editing?.status ?? "Active",
    }
    if (isEdit && editing) {
      setSkus(prev => prev.map(s => s.sku === editing.sku ? row : s))
      notify.success("SKU updated", `${row.sku} — ${row.name} saved.`)
    } else {
      setSkus(prev => [row, ...prev])
      setPage(1)
      notify.success("SKU created", `${row.sku} — ${row.name} added to the master.`)
    }
    setShowAddForm(false)
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
  }

  function browseFile() {
    const f = SAMPLE_FILES[Math.floor(Math.random() * SAMPLE_FILES.length)]
    setPickedFile(f)
    setParsed(null)
    setImportError("")
    notify.info("File selected", f)
  }

  function parseFile() {
    if (!pickedFile) {
      setImportError("Choose a file before parsing")
      return
    }
    const rows = PARSED_SKUS[pickedFile] ?? []
    // Simulated parser: one duplicate row per file that we skip.
    setParsed({ file: pickedFile, total: rows.length + 1, valid: rows.length, errors: 1 })
    setImportError("")
    notify.info("File parsed", `${rows.length} valid SKUs, 1 duplicate skipped.`)
  }

  function commitImport() {
    if (!parsed) {
      setImportError("Parse the file before importing")
      return
    }
    const rows = PARSED_SKUS[parsed.file] ?? []
    const created: SKU[] = rows.map((r, i) => ({ ...r, sku: nextSkuCode(i) }))
    setSkus(prev => [...created, ...prev])
    setImportOpen(false)
    setPickedFile("")
    setParsed(null)
    setPage(1)
    notify.success("Import complete", `${created.length} SKUs added from ${parsed.file}.`)
  }

  function toggleStatus(s: SKU) {
    const next = s.status === "Active" ? "Inactive" : "Active"
    setSkus(prev => prev.map(x => x.sku === s.sku ? { ...x, status: next } : x))
    notify.success(`SKU ${next.toLowerCase()}`, `${s.sku} is now ${next}.`)
  }

  function duplicate(s: SKU) {
    const copy: SKU = { ...s, sku: nextSkuCode(), name: `${s.name} (Copy)`, barcode: String(Number(s.barcode) + 1000).padStart(13, "0"), status: "Inactive" }
    setSkus(prev => [copy, ...prev])
    setPage(1)
    notify.success("SKU duplicated", `${copy.sku} created from ${s.sku}.`)
  }

  function removeSku(s: SKU) {
    setSkus(prev => prev.filter(x => x.sku !== s.sku))
    notify.warning("SKU deleted", `${s.sku} removed from the master.`)
  }

  const stats = [
    { label: "Total SKUs", value: String(skus.length), sub: "Across all clients", icon: <Tag className="w-5 h-5" /> },
    { label: "Active SKUs", value: String(skus.filter(s => s.status === "Active").length), sub: "Live in system", icon: <Package className="w-5 h-5" /> },
    { label: "Categories", value: String(new Set(skus.map(s => s.category)).size), sub: "Product categories", icon: <Layers className="w-5 h-5" /> },
    { label: "Inactive", value: String(skus.filter(s => s.status === "Inactive").length), sub: "Needs review", icon: <Barcode className="w-5 h-5" /> },
  ]

  return (
    <div className="h-full overflow-y-auto">
      <div className="w-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">SKU Master</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Product definitions, barcodes and client mappings</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setImportOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors">
              <Upload className="w-4 h-4" /> Bulk Import
            </button>
            <ExportButton data={filtered} filename="sku-master" />
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add SKU
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="p-3.5 rounded-xl border border-border bg-card">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className="text-brand">{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs mt-1 text-muted-foreground">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-lg border border-border bg-card">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground text-foreground" placeholder="Search SKU, name, barcode..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
          </div>
          {[
            { value: categoryFilter, options: categories, onChange: setCategoryFilter },
            { value: statusFilter, options: ["All Status", "Active", "Inactive"], onChange: setStatusFilter },
            { value: clientFilter, options: ["All Clients", ...CLIENT_OPTIONS], onChange: setClientFilter },
          ].map((f, i) => (
            <div key={i} className="relative">
              <select className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-border bg-card text-sm text-foreground outline-none cursor-pointer" value={f.value} onChange={(e) => { f.onChange(e.target.value); setPage(1) }}>
                {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["SKU Code", "Product Name", "Category", "Brand", "UOM", "Weight", "Barcode", "HSN Code", "Client", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((item, i) => (
                  <tr key={item.sku} className={cn("border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors", i % 2 === 1 ? "bg-muted/10" : "")}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button onClick={() => setDetail(item)} title="Open SKU detail" className="text-brand font-medium hover:underline cursor-pointer text-xs font-mono">{item.sku}</button>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground max-w-48"><span className="line-clamp-1">{item.name}</span></td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{item.category}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{item.brand}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-brand/10 text-brand text-xs font-medium">{item.uom}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{item.weight}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs font-mono">{item.barcode}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs font-mono">{item.hsn}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{item.client}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", item.status === "Active" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <RowActions
                        items={[
                          { label: "View details", icon: <Eye />, onSelect: () => setDetail(item) },
                          { label: "Edit SKU", icon: <Edit2 />, onSelect: () => openEdit(item) },
                          { label: `Mark ${item.status === "Active" ? "Inactive" : "Active"}`, icon: <Power />, onSelect: () => toggleStatus(item) },
                          { label: "Duplicate SKU", icon: <Copy />, onSelect: () => duplicate(item) },
                          { label: "Delete SKU", icon: <Trash2 />, onSelect: () => setDeleteTarget(item), tone: "danger" as const },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={11} className="px-4 py-16 text-center text-muted-foreground">
                    <Tag className="w-10 h-10 mb-3 opacity-40 mx-auto" />
                    <span className="font-medium">No SKUs found</span>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
            <span className="text-xs text-muted-foreground">Showing {paged.length} of {filtered.length} filtered · {skus.length} total</span>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} title={`Go to page ${p}`} className={cn("w-7 h-7 rounded-lg text-xs transition-colors", p === safePage ? "bg-brand text-white" : "text-muted-foreground hover:bg-muted")}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add / edit SKU */}
      <Modal
        open={showAddForm}
        onOpenChange={(o) => { setShowAddForm(o); if (!o) { setForm(emptyForm); setErrors({}); setEditing(null) } }}
        title={editing ? `Edit ${editing.sku}` : "Add New SKU"}
        description={editing ? "Update this product definition" : "Create a new product record"}
        size="lg"
        footer={<ModalActions onCancel={() => setShowAddForm(false)} onSubmit={saveSku} submitLabel={editing ? "Save Changes" : "Save SKU"} />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="SKU Code" required error={errors.sku} hint="Format SKU-001242">
            <TextInput value={form.sku} invalid={!!errors.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. SKU-001242" disabled={!!editing} />
          </Field>
          <Field label="Product Name" required error={errors.name}>
            <TextInput value={form.name} invalid={!!errors.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full product name" />
          </Field>
          <Field label="Brand" error={errors.brand}>
            <TextInput value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="Brand name" />
          </Field>
          <Field label="Barcode / EAN" required error={errors.barcode} hint="Exactly 13 digits">
            <TextInput value={form.barcode} invalid={!!errors.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} placeholder="13-digit barcode" inputMode="numeric" />
          </Field>
          <Field label="UOM" required error={errors.uom}>
            <Select value={form.uom} invalid={!!errors.uom} onChange={e => setForm({ ...form, uom: e.target.value })} options={UOM_OPTIONS} placeholder="Select UOM" />
          </Field>
          <Field label="Weight (kg)" required error={errors.weight}>
            <TextInput value={form.weight} invalid={!!errors.weight} onChange={e => setForm({ ...form, weight: e.target.value })} placeholder="e.g. 5" inputMode="decimal" />
          </Field>
          <Field label="Dimensions" error={errors.dimensions} hint="L×W×H in cm">
            <TextInput value={form.dimensions} onChange={e => setForm({ ...form, dimensions: e.target.value })} placeholder="e.g. 30×20×15 cm" />
          </Field>
          <Field label="HSN Code" required error={errors.hsn} hint="e.g. 1006.30">
            <TextInput value={form.hsn} invalid={!!errors.hsn} onChange={e => setForm({ ...form, hsn: e.target.value })} placeholder="Harmonised code" />
          </Field>
          <Field label="Category" required error={errors.category}>
            <Select value={form.category} invalid={!!errors.category} onChange={e => setForm({ ...form, category: e.target.value })} options={CATEGORY_OPTIONS} placeholder="Select Category" />
          </Field>
          <Field label="Client" required error={errors.client}>
            <Select value={form.client} invalid={!!errors.client} onChange={e => setForm({ ...form, client: e.target.value })} options={CLIENT_OPTIONS} placeholder="Select Client" />
          </Field>
        </div>
      </Modal>

      {/* Bulk import */}
      <Modal
        open={importOpen}
        onOpenChange={(o) => { setImportOpen(o); if (!o) { setPickedFile(""); setParsed(null); setImportError("") } }}
        title="Bulk Import SKUs"
        description="Select a file, review the parse summary, then import"
        footer={<ModalActions onCancel={() => setImportOpen(false)} onSubmit={parsed ? commitImport : parseFile} submitLabel={parsed ? `Import ${parsed.valid} SKUs` : "Parse File"} disabled={!pickedFile} />}
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">{pickedFile || "No file selected"}</p>
            <p className="text-xs text-muted-foreground mt-1">CSV or Excel up to 10 MB</p>
            <button onClick={browseFile} className="mt-3 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
              {pickedFile ? "Choose Another File" : "Browse File"}
            </button>
          </div>
          <Field label="Or pick from available files" error={importError}>
            <Select value={pickedFile} invalid={!!importError} onChange={e => { setPickedFile(e.target.value); setParsed(null); setImportError("") }} options={SAMPLE_FILES} placeholder="Select a file" />
          </Field>
          {parsed && (
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2"><FileText className="w-4 h-4 text-brand" />{parsed.file}</p>
              <DetailRow label="Rows read" value={parsed.total} />
              <DetailRow label="Valid SKUs" value={<span className="text-success font-semibold">{parsed.valid}</span>} />
              <DetailRow label="Skipped (duplicates)" value={<span className="text-danger font-semibold">{parsed.errors}</span>} />
            </div>
          )}
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.sku ?? ""}
        description="SKU detail"
        footer={
          <>
            <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Close</button>
            <button onClick={() => { if (detail) { openEdit(detail); setDetail(null) } }} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">Edit SKU</button>
          </>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="SKU Code" value={<span className="font-mono text-brand">{detail.sku}</span>} />
            <DetailRow label="Product Name" value={detail.name} />
            <DetailRow label="Category" value={detail.category} />
            <DetailRow label="Brand" value={detail.brand} />
            <DetailRow label="UOM" value={detail.uom} />
            <DetailRow label="Weight" value={detail.weight} />
            <DetailRow label="Dimensions" value={detail.dimensions} />
            <DetailRow label="Barcode" value={<span className="font-mono">{detail.barcode}</span>} />
            <DetailRow label="HSN Code" value={<span className="font-mono">{detail.hsn}</span>} />
            <DetailRow label="Client" value={detail.client} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-1 rounded-full text-xs font-medium", detail.status === "Active" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this SKU?"
        message={`${deleteTarget?.sku} — ${deleteTarget?.name} will be removed from the SKU master. This cannot be undone.`}
        confirmLabel="Delete SKU"
        cancelLabel="Keep It"
        onConfirm={() => deleteTarget && removeSku(deleteTarget)}
      />
    </div>
  )
}
