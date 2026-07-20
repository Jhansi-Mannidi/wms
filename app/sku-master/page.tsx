"use client"

import { useState } from "react"
import {
  Tag, Package, Plus, Search, ChevronDown, Eye, MoreHorizontal,
  Upload, Edit2, Layers, Barcode
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"

const skus = [
  { sku: "SKU-001234", name: "Premium Basmati Rice 5kg", category: "Grains", brand: "Nature's Best", uom: "Bags", weight: "5 kg", dimensions: "30×20×15 cm", barcode: "8901234567890", client: "Acme Foods", hsn: "1006.30", status: "Active" },
  { sku: "SKU-001235", name: "Organic Wheat Flour 10kg", category: "Flour & Grains", brand: "Mill Fresh", uom: "Bags", weight: "10 kg", dimensions: "40×25×10 cm", barcode: "8901234567891", client: "Acme Foods", hsn: "1101.00", status: "Active" },
  { sku: "SKU-001236", name: "Refined Sunflower Oil 5L", category: "Edible Oils", brand: "Sunrise", uom: "Tins", weight: "5.2 kg", dimensions: "20×15×25 cm", barcode: "8901234567892", client: "Global Oils", hsn: "1512.11", status: "Active" },
  { sku: "SKU-001237", name: "Chickpea Lentils 25kg", category: "Pulses", brand: "Farm Direct", uom: "Bags", weight: "25 kg", dimensions: "60×40×20 cm", barcode: "8901234567893", client: "Agro Corp", hsn: "0713.33", status: "Active" },
  { sku: "SKU-001238", name: "Brown Sugar 10kg", category: "Sugar", brand: "Sweet House", uom: "Bags", weight: "10 kg", dimensions: "35×25×12 cm", barcode: "8901234567894", client: "Sweet Mills", hsn: "1701.91", status: "Inactive" },
  { sku: "SKU-001239", name: "Iodized Salt 1kg", category: "Salt & Spices", brand: "Pure Salt", uom: "Packets", weight: "1 kg", dimensions: "15×10×5 cm", barcode: "8901234567895", client: "Salt Works", hsn: "2501.00", status: "Active" },
  { sku: "SKU-001240", name: "Tomato Puree 400g", category: "Processed Foods", brand: "FreshFarms", uom: "Cans", weight: "0.45 kg", dimensions: "8×8×12 cm", barcode: "8901234567896", client: "Fresh Farms", hsn: "2002.90", status: "Active" },
  { sku: "SKU-001241", name: "Coconut Milk 400ml", category: "Beverages", brand: "Tropical", uom: "Cans", weight: "0.42 kg", dimensions: "7×7×11 cm", barcode: "8901234567897", client: "Tropical Co", hsn: "2106.90", status: "Active" },
]

const categories = ["All Categories", "Grains", "Flour & Grains", "Edible Oils", "Pulses", "Sugar", "Salt & Spices", "Processed Foods", "Beverages"]

export default function SKUMasterPage() {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All Categories")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [clientFilter, setClientFilter] = useState("All Clients")
  const [showAddForm, setShowAddForm] = useState(false)

  const filtered = skus.filter((s) => {
    const q = search.toLowerCase()
    return (
      (s.sku.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.brand.toLowerCase().includes(q) || s.barcode.includes(q)) &&
      (categoryFilter === "All Categories" || s.category === categoryFilter) &&
      (statusFilter === "All Status" || s.status === statusFilter) &&
      (clientFilter === "All Clients" || s.client === clientFilter)
    )
  })

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
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors">
              <Upload className="w-4 h-4" /> Bulk Import
            </button>
            <ExportButton data={filtered} filename="sku-master" />
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add SKU
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total SKUs", value: skus.length.toString(), sub: "Across all clients", icon: <Tag className="w-5 h-5" /> },
            { label: "Active SKUs", value: skus.filter((s) => s.status === "Active").length.toString(), sub: "Live in system", icon: <Package className="w-5 h-5" /> },
            { label: "Categories", value: "8", sub: "Product categories", icon: <Layers className="w-5 h-5" /> },
            { label: "Inactive", value: skus.filter((s) => s.status === "Inactive").length.toString(), sub: "Needs review", icon: <Barcode className="w-5 h-5" /> },
          ].map((stat, i) => (
            <div key={i} className="p-5 rounded-2xl border border-border bg-card">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className="text-brand">{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs mt-1 text-muted-foreground">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Add form */}
        {showAddForm && (
          <div className="p-5 rounded-2xl border border-brand/30 bg-brand/5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Add New SKU</h2>
              <button onClick={() => setShowAddForm(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "SKU Code *", placeholder: "e.g. SKU-001242" },
                { label: "Product Name *", placeholder: "Full product name" },
                { label: "Brand", placeholder: "Brand name" },
                { label: "Barcode / EAN", placeholder: "13-digit barcode" },
                { label: "UOM *", placeholder: "e.g. Bags, Units" },
                { label: "Weight", placeholder: "e.g. 5 kg" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs font-medium text-foreground mb-1.5">{f.label}</label>
                  <input className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-brand transition-colors placeholder:text-muted-foreground" placeholder={f.placeholder} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Category *</label>
                <div className="relative">
                  <select className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-brand">
                    {categories.slice(1).map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Client *</label>
                <div className="relative">
                  <select className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-brand">
                    {["Acme Foods", "Global Oils", "Agro Corp", "Sweet Mills", "Salt Works"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors">Cancel</button>
              <button className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">Save SKU</button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-xl border border-border bg-card">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground text-foreground" placeholder="Search SKU, name, barcode..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {[
            { value: categoryFilter, options: categories, onChange: setCategoryFilter },
            { value: statusFilter, options: ["All Status", "Active", "Inactive"], onChange: setStatusFilter },
            { value: clientFilter, options: ["All Clients", "Acme Foods", "Global Oils", "Agro Corp", "Sweet Mills", "Salt Works", "Fresh Farms", "Tropical Co"], onChange: setClientFilter },
          ].map((f, i) => (
            <div key={i} className="relative">
              <select className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-border bg-card text-sm text-foreground outline-none cursor-pointer" value={f.value} onChange={(e) => f.onChange(e.target.value)}>
                {f.options.map((o) => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["SKU Code", "Product Name", "Category", "Brand", "UOM", "Weight", "Barcode", "HSN Code", "Client", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <tr key={item.sku} className={cn("border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors", i % 2 === 1 ? "bg-muted/10" : "")}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-brand font-medium hover:underline cursor-pointer text-xs font-mono">{item.sku}</span>
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
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Eye className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Tag className="w-10 h-10 mb-3 opacity-40" />
                <p className="font-medium">No SKUs found</p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
            <span className="text-xs text-muted-foreground">Showing {filtered.length} of {skus.length} SKUs</span>
            <div className="flex gap-1">
              {[1, 2, 3].map((p) => (
                <button key={p} className={cn("w-7 h-7 rounded-lg text-xs transition-colors", p === 1 ? "bg-brand text-white" : "text-muted-foreground hover:bg-muted")}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
