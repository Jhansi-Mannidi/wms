"use client"

import { useState } from "react"
import { Plus, Trash2, Camera, Printer, Package, Search, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface PackageRow {
  id: string
  pieces: number
  description: string
  l: number
  w: number
  h: number
  weight: number
  declaredValue: number
}

const existingCustomers = [
  { id: "CUS-001", name: "Ravi Textiles Pvt Ltd", init: "RT", color: "bg-blue-500" },
  { id: "CUS-002", name: "Priya Exports", init: "PE", color: "bg-emerald-500" },
  { id: "CUS-003", name: "Sharma & Co.", init: "SC", color: "bg-amber-500" },
  { id: "CUS-004", name: "Buildmart Pvt. Ltd.", init: "BM", color: "bg-violet-500" },
]

const locations = [
  { label: "Zone A — Rack 1 (Own · 12 slots free)", value: "ZA-R1", type: "Own" },
  { label: "Zone A — Rack 2 (Own · 8 slots free)", value: "ZA-R2", type: "Own" },
  { label: "Zone B — Floor (Own · 45 sqft free)", value: "ZB-FL", type: "Own" },
  { label: "Leased — City Warehouse Rack 3 (Leased · 20 slots free)", value: "LW-R3", type: "Leased-In" },
  { label: "Leased — City Warehouse Floor (Leased · 80 sqft free)", value: "LW-FL", type: "Leased-In" },
]

function calcCBM(l: number, w: number, h: number) {
  return ((l * w * h) / 1000000).toFixed(3)
}

export default function DropOffIntakePage() {
  const [customerSearch, setCustomerSearch] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<typeof existingCustomers[0] | null>(null)
  const [showCustomerList, setShowCustomerList] = useState(false)
  const [location, setLocation] = useState("")
  const [packages, setPackages] = useState<PackageRow[]>([
    { id: "1", pieces: 1, description: "", l: 0, w: 0, h: 0, weight: 0, declaredValue: 0 },
  ])

  const addPackage = () => setPackages(p => [...p, {
    id: Date.now().toString(), pieces: 1, description: "", l: 0, w: 0, h: 0, weight: 0, declaredValue: 0,
  }])

  const removePackage = (id: string) => setPackages(p => p.filter(x => x.id !== id))

  const updatePackage = (id: string, field: keyof PackageRow, value: number | string) =>
    setPackages(p => p.map(x => x.id === id ? { ...x, [field]: value } : x))

  const totalPieces = packages.reduce((s, p) => s + p.pieces, 0)
  const totalVolume = packages.reduce((s, p) => s + parseFloat(calcCBM(p.l, p.w, p.h)) * p.pieces, 0)

  const filteredCustomers = existingCustomers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase())
  )

  return (
    <div className="p-6 h-full overflow-y-auto w-full">
      <h1 className="text-lg font-bold text-foreground mb-1">Quick Drop-Off Intake</h1>
      <p className="text-xs text-muted-foreground mb-6">Counter-speed intake form · scan/keyboard friendly</p>

      {/* Customer selector */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-foreground mb-2 block">Customer *</label>
        <div className="relative">
          {selectedCustomer ? (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-brand bg-brand/10">
              <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0", selectedCustomer.color)}>{selectedCustomer.init}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{selectedCustomer.name}</p>
                <p className="text-[10px] text-muted-foreground">{selectedCustomer.id}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-xs text-muted-foreground hover:text-foreground">Change</button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-center gap-2 px-3 py-3 rounded-xl border border-border bg-card focus-within:border-brand transition-colors">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  value={customerSearch}
                  onChange={e => { setCustomerSearch(e.target.value); setShowCustomerList(true) }}
                  onFocus={() => setShowCustomerList(true)}
                  placeholder="Search or create customer..."
                  className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground/60"
                />
              </div>
              {showCustomerList && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-border bg-popover shadow-xl z-10 overflow-hidden">
                  {filteredCustomers.map(c => (
                    <button key={c.id} onClick={() => { setSelectedCustomer(c); setShowCustomerList(false); setCustomerSearch("") }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold", c.color)}>{c.init}</div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.id}</p>
                      </div>
                    </button>
                  ))}
                  <button className="w-full flex items-center gap-2 px-4 py-3 text-sm text-brand hover:bg-brand/5 transition-colors">
                    <Plus className="w-4 h-4" /> Create New Customer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Package rows */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-foreground">Packages *</label>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{totalPieces} pcs</span>
            <span>·</span>
            <span>{totalVolume.toFixed(3)} CBM</span>
          </div>
        </div>

        <div className="space-y-3">
          {packages.map((pkg, i) => (
            <div key={pkg.id} className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-muted-foreground">Package {i + 1}</span>
                {packages.length > 1 && (
                  <button onClick={() => removePackage(pkg.id)} className="text-danger hover:bg-danger/10 p-1 rounded-md transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Pieces</label>
                  <input type="number" value={pkg.pieces} min={1}
                    onChange={e => updatePackage(pkg.id, "pieces", parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-brand transition-colors" />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-[10px] text-muted-foreground mb-1 block">Description</label>
                  <input type="text" value={pkg.description} placeholder="e.g. Garment samples, cartons"
                    onChange={e => updatePackage(pkg.id, "description", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-brand transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {[
                  { label: "Length (cm)", field: "l" as const },
                  { label: "Width (cm)", field: "w" as const },
                  { label: "Height (cm)", field: "h" as const },
                ].map(dim => (
                  <div key={dim.field}>
                    <label className="text-[10px] text-muted-foreground mb-1 block">{dim.label}</label>
                    <input type="number" value={pkg[dim.field] as number} min={0}
                      onChange={e => updatePackage(pkg.id, dim.field, parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-brand transition-colors" />
                  </div>
                ))}
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Weight (kg)</label>
                  <input type="number" value={pkg.weight} min={0}
                    onChange={e => updatePackage(pkg.id, "weight", parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-brand transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Decl. Value (₹)</label>
                  <input type="number" value={pkg.declaredValue} min={0}
                    onChange={e => updatePackage(pkg.id, "declaredValue", parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-brand transition-colors" />
                </div>
              </div>
              {pkg.l > 0 && pkg.w > 0 && pkg.h > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">Volume:</span>
                  <span className="text-[11px] font-semibold text-brand">{calcCBM(pkg.l, pkg.w, pkg.h)} CBM/piece · {(parseFloat(calcCBM(pkg.l, pkg.w, pkg.h)) * pkg.pieces).toFixed(3)} CBM total</span>
                  <button className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                    <Camera className="w-3 h-3" /> Photo
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <button onClick={addPackage} className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-[#F7941D]/50 text-[#F7941D] text-sm font-semibold hover:bg-[#F7941D]/5 transition-colors">
          <Plus className="w-4 h-4" /> Add Package
        </button>
      </div>

      {/* Location assignment */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-foreground mb-2 block">Location Assignment *</label>
        <div className="relative">
          <select value={location} onChange={e => setLocation(e.target.value)}
            className="w-full appearance-none px-3 py-3 rounded-xl border border-border bg-card text-sm outline-none focus:border-brand transition-colors">
            <option value="">Select storage location...</option>
            {locations.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
        {location && (
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            Type: <span className={cn("font-semibold", locations.find(l => l.value === location)?.type === "Own" ? "text-brand" : "text-orange-400")}>
              {locations.find(l => l.value === location)?.type}
            </span>
          </p>
        )}
      </div>

      {/* Summary chip */}
      <div className="mb-5 flex items-center gap-3 p-3 rounded-xl bg-brand/10 border border-brand/30">
        <Package className="w-5 h-5 text-brand shrink-0" />
        <span className="text-sm font-semibold text-brand">{totalPieces} pieces · {totalVolume.toFixed(3)} CBM total</span>
      </div>

      {/* Submit */}
      <button className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#F7941D] text-white font-bold text-sm hover:bg-[#F7941D]/90 transition-colors">
        <Printer className="w-4 h-4" /> Save & Print Receipt
      </button>
    </div>
  )
}
