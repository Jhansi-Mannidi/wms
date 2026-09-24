"use client"

import { useState } from "react"
import { Plus, Trash2, Camera, Printer, Package, Search, ChevronDown, Eye, Check } from "lucide-react"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type PackageRow = {
  id: string
  pieces: number
  description: string
  l: number
  w: number
  h: number
  weight: number
  declaredValue: number
  photo: boolean
}

type StoredCustomer = { id: string; name: string; init: string; color: string }

type Receipt = {
  id: string
  customer: string
  customerId: string
  location: string
  locationType: string
  packages: number
  pieces: number
  cbm: string
  weight: number
  declaredValue: number
  time: string
}

const initialCustomers: StoredCustomer[] = [
  { id: "CUS-001", name: "Ravi Textiles Pvt Ltd", init: "RT", color: "bg-blue-500" },
  { id: "CUS-002", name: "Priya Exports", init: "PE", color: "bg-emerald-500" },
  { id: "CUS-003", name: "Sharma & Co.", init: "SC", color: "bg-amber-500" },
  { id: "CUS-004", name: "Buildmart Pvt. Ltd.", init: "BM", color: "bg-violet-500" },
  { id: "CUS-005", name: "Meena Traders", init: "MT", color: "bg-rose-500" },
  { id: "CUS-006", name: "Kavitha Enterprises", init: "KE", color: "bg-orange-500" },
  { id: "CUS-007", name: "Acme Foods Pvt Ltd", init: "AF", color: "bg-blue-500" },
  { id: "CUS-008", name: "Global Oils Ltd", init: "GO", color: "bg-emerald-500" },
  { id: "CUS-009", name: "Suresh Hardware Stores", init: "SH", color: "bg-amber-500" },
  { id: "CUS-010", name: "Fresh Farms Produce", init: "FF", color: "bg-violet-500" },
  { id: "CUS-011", name: "Apex Pharma Ltd", init: "AP", color: "bg-rose-500" },
  { id: "CUS-012", name: "Nair Home Appliances", init: "NA", color: "bg-orange-500" },
  { id: "CUS-013", name: "Deepa Garments", init: "DG", color: "bg-blue-500" },
  { id: "CUS-014", name: "Sweet Mills Pvt Ltd", init: "SM", color: "bg-emerald-500" },
]

const locations = [
  { label: "Zone A — Rack 1 (Own · 12 slots free)", value: "ZA-R1", type: "Own" },
  { label: "Zone A — Rack 2 (Own · 8 slots free)", value: "ZA-R2", type: "Own" },
  { label: "Zone A — Rack 3 (Own · 5 slots free)", value: "ZA-R3", type: "Own" },
  { label: "Zone B — Floor (Own · 45 sqft free)", value: "ZB-FL", type: "Own" },
  { label: "Zone C — Cold Room (Own · 18 slots free)", value: "ZC-CR", type: "Own" },
  { label: "Leased — City Warehouse Rack 3 (Leased · 20 slots free)", value: "LW-R3", type: "Leased-In" },
  { label: "Leased — City Warehouse Floor (Leased · 80 sqft free)", value: "LW-FL", type: "Leased-In" },
  { label: "Leased — Port Depot Rack 5 (Leased · 14 slots free)", value: "PD-R5", type: "Leased-In" },
]

const initialReceipts: Receipt[] = [
  { id: "DO-1024", customer: "Sweet Mills Pvt Ltd", customerId: "CUS-014", location: "Zone B — Floor (Own · 45 sqft free)", locationType: "Own", packages: 2, pieces: 14, cbm: "1.260", weight: 210, declaredValue: 48000, time: "2026-07-20 18:05" },
  { id: "DO-1023", customer: "Deepa Garments", customerId: "CUS-013", location: "Zone A — Rack 1 (Own · 12 slots free)", locationType: "Own", packages: 1, pieces: 6, cbm: "0.432", weight: 72, declaredValue: 21500, time: "2026-07-20 17:40" },
  { id: "DO-1022", customer: "Nair Home Appliances", customerId: "CUS-012", location: "Leased — City Warehouse Rack 3 (Leased · 20 slots free)", locationType: "Leased-In", packages: 3, pieces: 22, cbm: "2.860", weight: 396, declaredValue: 132000, time: "2026-07-20 17:15" },
  { id: "DO-1021", customer: "Apex Pharma Ltd", customerId: "CUS-011", location: "Zone C — Cold Room (Own · 18 slots free)", locationType: "Own", packages: 2, pieces: 18, cbm: "1.044", weight: 126, declaredValue: 264000, time: "2026-07-20 16:50" },
  { id: "DO-1020", customer: "Fresh Farms Produce", customerId: "CUS-010", location: "Zone B — Floor (Own · 45 sqft free)", locationType: "Own", packages: 4, pieces: 36, cbm: "3.240", weight: 612, declaredValue: 54000, time: "2026-07-20 16:20" },
  { id: "DO-1019", customer: "Suresh Hardware Stores", customerId: "CUS-009", location: "Zone A — Rack 2 (Own · 8 slots free)", locationType: "Own", packages: 1, pieces: 9, cbm: "0.729", weight: 198, declaredValue: 33000, time: "2026-07-20 15:55" },
  { id: "DO-1018", customer: "Global Oils Ltd", customerId: "CUS-008", location: "Leased — City Warehouse Floor (Leased · 80 sqft free)", locationType: "Leased-In", packages: 5, pieces: 45, cbm: "5.400", weight: 990, declaredValue: 175000, time: "2026-07-20 15:30" },
  { id: "DO-1017", customer: "Acme Foods Pvt Ltd", customerId: "CUS-007", location: "Zone B — Floor (Own · 45 sqft free)", locationType: "Own", packages: 3, pieces: 27, cbm: "2.106", weight: 405, declaredValue: 81000, time: "2026-07-20 15:05" },
  { id: "DO-1016", customer: "Kavitha Enterprises", customerId: "CUS-006", location: "Zone A — Rack 1 (Own · 12 slots free)", locationType: "Own", packages: 1, pieces: 4, cbm: "0.288", weight: 46, declaredValue: 12800, time: "2026-07-20 14:40" },
  { id: "DO-1015", customer: "Meena Traders", customerId: "CUS-005", location: "Zone A — Rack 3 (Own · 5 slots free)", locationType: "Own", packages: 2, pieces: 11, cbm: "0.792", weight: 143, declaredValue: 29500, time: "2026-07-20 14:10" },
  { id: "DO-1014", customer: "Buildmart Pvt. Ltd.", customerId: "CUS-004", location: "Leased — Port Depot Rack 5 (Leased · 14 slots free)", locationType: "Leased-In", packages: 4, pieces: 32, cbm: "4.096", weight: 768, declaredValue: 96000, time: "2026-07-20 13:45" },
  { id: "DO-1013", customer: "Sharma & Co.", customerId: "CUS-003", location: "Zone A — Rack 2 (Own · 8 slots free)", locationType: "Own", packages: 2, pieces: 15, cbm: "1.080", weight: 225, declaredValue: 45000, time: "2026-07-20 13:20" },
  { id: "DO-1012", customer: "Priya Exports", customerId: "CUS-002", location: "Leased — City Warehouse Rack 3 (Leased · 20 slots free)", locationType: "Leased-In", packages: 3, pieces: 21, cbm: "1.638", weight: 294, declaredValue: 105000, time: "2026-07-20 12:55" },
  { id: "DO-1011", customer: "Ravi Textiles Pvt Ltd", customerId: "CUS-001", location: "Zone A — Rack 1 (Own · 12 slots free)", locationType: "Own", packages: 2, pieces: 12, cbm: "0.864", weight: 156, declaredValue: 38400, time: "2026-07-20 12:30" },
  { id: "DO-1010", customer: "Sweet Mills Pvt Ltd", customerId: "CUS-014", location: "Zone B — Floor (Own · 45 sqft free)", locationType: "Own", packages: 1, pieces: 8, cbm: "0.720", weight: 120, declaredValue: 27200, time: "2026-07-20 12:00" },
  { id: "DO-1009", customer: "Apex Pharma Ltd", customerId: "CUS-011", location: "Zone C — Cold Room (Own · 18 slots free)", locationType: "Own", packages: 3, pieces: 24, cbm: "1.392", weight: 168, declaredValue: 352000, time: "2026-07-20 11:35" },
  { id: "DO-1008", customer: "Nair Home Appliances", customerId: "CUS-012", location: "Leased — City Warehouse Floor (Leased · 80 sqft free)", locationType: "Leased-In", packages: 2, pieces: 16, cbm: "2.080", weight: 288, declaredValue: 96000, time: "2026-07-20 11:10" },
  { id: "DO-1007", customer: "Acme Foods Pvt Ltd", customerId: "CUS-007", location: "Zone B — Floor (Own · 45 sqft free)", locationType: "Own", packages: 2, pieces: 18, cbm: "1.404", weight: 270, declaredValue: 54000, time: "2026-07-20 10:45" },
  { id: "DO-1006", customer: "Global Oils Ltd", customerId: "CUS-008", location: "Leased — City Warehouse Rack 3 (Leased · 20 slots free)", locationType: "Leased-In", packages: 4, pieces: 30, cbm: "3.600", weight: 660, declaredValue: 116000, time: "2026-07-20 10:20" },
  { id: "DO-1005", customer: "Deepa Garments", customerId: "CUS-013", location: "Zone A — Rack 2 (Own · 8 slots free)", locationType: "Own", packages: 1, pieces: 5, cbm: "0.360", weight: 60, declaredValue: 17800, time: "2026-07-20 09:55" },
  { id: "DO-1004", customer: "Fresh Farms Produce", customerId: "CUS-010", location: "Zone B — Floor (Own · 45 sqft free)", locationType: "Own", packages: 3, pieces: 26, cbm: "2.340", weight: 442, declaredValue: 39000, time: "2026-07-20 09:30" },
  { id: "DO-1003", customer: "Suresh Hardware Stores", customerId: "CUS-009", location: "Zone A — Rack 3 (Own · 5 slots free)", locationType: "Own", packages: 2, pieces: 13, cbm: "1.053", weight: 286, declaredValue: 47600, time: "2026-07-20 09:05" },
  { id: "DO-1002", customer: "Priya Exports", customerId: "CUS-002", location: "Zone A — Rack 1 (Own · 12 slots free)", locationType: "Own", packages: 1, pieces: 7, cbm: "0.504", weight: 91, declaredValue: 35000, time: "2026-07-20 08:40" },
  { id: "DO-1001", customer: "Ravi Textiles Pvt Ltd", customerId: "CUS-001", location: "Leased — City Warehouse Floor (Leased · 80 sqft free)", locationType: "Leased-In", packages: 3, pieces: 20, cbm: "2.400", weight: 440, declaredValue: 60000, time: "2026-07-20 08:15" },
]

const PALETTE = ["bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-violet-500", "bg-rose-500", "bg-orange-500"]

function calcCBM(l: number, w: number, h: number) {
  return ((l * w * h) / 1000000).toFixed(3)
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "??"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

const emptyCustomerForm = { name: "", phone: "" }

export default function DropOffIntakePage() {
  const [customers, setCustomers] = useState<StoredCustomer[]>(initialCustomers)
  const [customerSearch, setCustomerSearch] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<StoredCustomer | null>(null)
  const [showCustomerList, setShowCustomerList] = useState(false)
  const [location, setLocation] = useState("")
  const [packages, setPackages] = useState<PackageRow[]>([
    { id: "1", pieces: 1, description: "", l: 0, w: 0, h: 0, weight: 0, declaredValue: 0, photo: false },
  ])

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [receipts, setReceipts] = useState<Receipt[]>(initialReceipts)
  const [detail, setDetail] = useState<Receipt | null>(null)

  const [newCustomerOpen, setNewCustomerOpen] = useState(false)
  const [customerForm, setCustomerForm] = useState(emptyCustomerForm)
  const [customerErrors, setCustomerErrors] = useState<Record<string, string>>({})

  const [removeTarget, setRemoveTarget] = useState<PackageRow | null>(null)

  const addPackage = () => setPackages(p => [...p, {
    id: Date.now().toString(), pieces: 1, description: "", l: 0, w: 0, h: 0, weight: 0, declaredValue: 0, photo: false,
  }])

  const removePackage = (id: string) => setPackages(p => p.filter(x => x.id !== id))

  const updatePackage = (id: string, field: keyof PackageRow, value: number | string | boolean) =>
    setPackages(p => p.map(x => x.id === id ? { ...x, [field]: value } : x))

  const togglePhoto = (pkg: PackageRow) => {
    updatePackage(pkg.id, "photo", !pkg.photo)
    if (pkg.photo) notify.info("Photo removed", "Condition photo detached from this package.")
    else notify.success("Photo captured", "Condition photo attached to this package.")
  }

  const totalPieces = packages.reduce((s, p) => s + p.pieces, 0)
  const totalVolume = packages.reduce((s, p) => s + parseFloat(calcCBM(p.l, p.w, p.h)) * p.pieces, 0)
  const totalWeight = packages.reduce((s, p) => s + p.weight * p.pieces, 0)
  const totalDeclared = packages.reduce((s, p) => s + p.declaredValue * p.pieces, 0)

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase())
  )

  function validateCustomer() {
    const e: Record<string, string> = {}
    if (!customerForm.name.trim()) e.name = "Customer name is required"
    else if (customers.some(c => c.name.toLowerCase() === customerForm.name.trim().toLowerCase())) e.name = "That customer already exists"
    if (!customerForm.phone.trim()) e.phone = "Phone is required"
    else if (!/^[+\d][\d\s-]{6,}$/.test(customerForm.phone.trim())) e.phone = "Enter a valid phone number"
    setCustomerErrors(e)
    return Object.keys(e).length === 0
  }

  function createCustomer() {
    if (!validateCustomer()) return
    const next: StoredCustomer = {
      id: `CUS-${String(customers.length + 1).padStart(3, "0")}`,
      name: customerForm.name.trim(),
      init: initialsOf(customerForm.name),
      color: PALETTE[customers.length % PALETTE.length],
    }
    setCustomers(prev => [...prev, next])
    setSelectedCustomer(next)
    setShowCustomerList(false)
    setCustomerSearch("")
    setNewCustomerOpen(false)
    setCustomerForm(emptyCustomerForm)
    setCustomerErrors({})
    notify.success("Customer created", `${next.name} (${next.id}) is ready for intake.`)
  }

  function validateIntake() {
    const e: Record<string, string> = {}
    if (!selectedCustomer) e.customer = "Select or create a customer before saving"
    if (!location) e.location = "Select a storage location"
    packages.forEach((p, i) => {
      if (!p.description.trim()) e[`pkg-${p.id}`] = `Package ${i + 1}: description is required`
      else if (p.pieces < 1) e[`pkg-${p.id}`] = `Package ${i + 1}: pieces must be at least 1`
      else if (p.l <= 0 || p.w <= 0 || p.h <= 0) e[`pkg-${p.id}`] = `Package ${i + 1}: enter length, width and height`
      else if (p.weight <= 0) e[`pkg-${p.id}`] = `Package ${i + 1}: weight must be greater than 0`
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function saveReceipt() {
    if (!validateIntake()) {
      notify.error("Intake incomplete", "Fix the highlighted fields before printing the receipt.")
      return
    }
    const loc = locations.find(l => l.value === location)
    const now = new Date()
    const next: Receipt = {
      id: `DO-${String(receipts.length + 1001)}`,
      customer: selectedCustomer!.name,
      customerId: selectedCustomer!.id,
      location: loc?.label ?? location,
      locationType: loc?.type ?? "Own",
      packages: packages.length,
      pieces: totalPieces,
      cbm: totalVolume.toFixed(3),
      weight: totalWeight,
      declaredValue: totalDeclared,
      time: `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`,
    }
    setReceipts(prev => [next, ...prev])

    // reset the counter form for the next customer
    setSelectedCustomer(null)
    setCustomerSearch("")
    setLocation("")
    setPackages([{ id: Date.now().toString(), pieces: 1, description: "", l: 0, w: 0, h: 0, weight: 0, declaredValue: 0, photo: false }])
    setErrors({})
    notify.success("Receipt printed", `${next.id} — ${next.pieces} pieces · ${next.cbm} CBM for ${next.customer}.`)
  }

  return (
    <div className="p-6 h-full overflow-y-auto w-full">
      <h1 className="text-2xl font-bold text-foreground mb-1">Quick Drop-Off Intake</h1>
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
              <button onClick={() => setSelectedCustomer(null)} title="Change customer" className="text-xs text-muted-foreground hover:text-foreground">Change</button>
            </div>
          ) : (
            <div className="relative">
              <div className={cn("flex items-center gap-2 px-3 py-3 rounded-xl border bg-card focus-within:border-brand transition-colors", errors.customer ? "border-danger" : "border-border")}>
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
                  {filteredCustomers.length === 0 && (
                    <p className="px-4 py-3 text-xs text-muted-foreground">No customer matches “{customerSearch}”.</p>
                  )}
                  <button
                    onClick={() => { setCustomerForm({ name: customerSearch, phone: "" }); setCustomerErrors({}); setShowCustomerList(false); setNewCustomerOpen(true) }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-brand hover:bg-brand/5 transition-colors">
                    <Plus className="w-4 h-4" /> Create New Customer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        {errors.customer && <p className="mt-1 text-xs text-danger">{errors.customer}</p>}
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
            <div key={pkg.id} className={cn("p-4 rounded-xl border bg-card", errors[`pkg-${pkg.id}`] ? "border-danger" : "border-border")}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-muted-foreground">Package {i + 1}</span>
                {packages.length > 1 && (
                  <button onClick={() => setRemoveTarget(pkg)} title={`Remove package ${i + 1}`} className="text-danger hover:bg-danger/10 p-1 rounded-md transition-colors">
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
                  <button
                    onClick={() => togglePhoto(pkg)}
                    title={pkg.photo ? "Remove condition photo" : "Capture condition photo"}
                    className={cn("ml-auto flex items-center gap-1 text-[11px] transition-colors",
                      pkg.photo ? "text-success" : "text-muted-foreground hover:text-foreground")}>
                    {pkg.photo ? <Check className="w-3 h-3" /> : <Camera className="w-3 h-3" />} {pkg.photo ? "Photo attached" : "Photo"}
                  </button>
                </div>
              )}
              {errors[`pkg-${pkg.id}`] && <p className="mt-2 text-xs text-danger">{errors[`pkg-${pkg.id}`]}</p>}
            </div>
          ))}
        </div>

        <button onClick={addPackage} className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-brand/50 text-brand text-sm font-semibold hover:bg-brand/5 transition-colors">
          <Plus className="w-4 h-4" /> Add Package
        </button>
      </div>

      {/* Location assignment */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-foreground mb-2 block">Location Assignment *</label>
        <div className="relative">
          <select value={location} onChange={e => setLocation(e.target.value)}
            className={cn("w-full appearance-none px-3 py-3 rounded-xl border bg-card text-sm outline-none focus:border-brand transition-colors", errors.location ? "border-danger" : "border-border")}>
            <option value="">Select storage location...</option>
            {locations.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
        {errors.location && <p className="mt-1 text-xs text-danger">{errors.location}</p>}
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
      <button onClick={saveReceipt} className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-brand text-white font-bold text-sm hover:bg-brand/90 transition-colors">
        <Printer className="w-4 h-4" /> Save &amp; Print Receipt
      </button>

      {/* Today's receipts */}
      <div className="mt-8">
        <h2 className="text-sm font-bold text-foreground mb-3">Drop-Off Records Today</h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["Receipt", "Customer", "Location", "Packages", "Pieces", "CBM", "Time", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {receipts.map((r, i) => (
                  <tr key={r.id} className={cn("border-b border-border/40 hover:bg-muted/20 transition-colors", i % 2 === 1 && "bg-muted/5")}>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{r.id}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-foreground">{r.customer}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <span className={cn("font-semibold", r.locationType === "Own" ? "text-brand" : "text-orange-400")}>{r.locationType}</span> · {r.location}
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground">{r.packages}</td>
                    <td className="px-4 py-3 text-sm font-bold text-foreground">{r.pieces}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{r.cbm}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{r.time}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setDetail(r)} title="View receipt details" className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-brand transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {receipts.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No drop-offs recorded yet today. Complete the form above to create one.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create new customer */}
      <Modal
        open={newCustomerOpen}
        onOpenChange={(o) => { setNewCustomerOpen(o); if (!o) { setCustomerForm(emptyCustomerForm); setCustomerErrors({}) } }}
        title="Create New Customer"
        description="Register a walk-in customer for this intake"
        size="sm"
        footer={<ModalActions onCancel={() => setNewCustomerOpen(false)} onSubmit={createCustomer} submitLabel="Create Customer" />}
      >
        <div className="space-y-4">
          <Field label="Customer Name" required error={customerErrors.name}>
            <TextInput value={customerForm.name} invalid={!!customerErrors.name} onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })} placeholder="e.g. Ravi Textiles Pvt Ltd" />
          </Field>
          <Field label="Phone" required error={customerErrors.phone}>
            <TextInput value={customerForm.phone} invalid={!!customerErrors.phone} onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })} placeholder="e.g. +91 98765 43210" />
          </Field>
        </div>
      </Modal>

      {/* Receipt detail */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Drop-off receipt detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Receipt No." value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Customer" value={detail.customer} />
            <DetailRow label="Customer ID" value={<span className="font-mono">{detail.customerId}</span>} />
            <DetailRow label="Location" value={detail.location} />
            <DetailRow label="Space Type" value={
              <span className={cn("font-semibold", detail.locationType === "Own" ? "text-brand" : "text-orange-400")}>{detail.locationType}</span>
            } />
            <DetailRow label="Packages" value={`${detail.packages}`} />
            <DetailRow label="Total Pieces" value={`${detail.pieces} pcs`} />
            <DetailRow label="Total Volume" value={`${detail.cbm} CBM`} />
            <DetailRow label="Total Weight" value={`${detail.weight.toFixed(2)} kg`} />
            <DetailRow label="Declared Value" value={`₹${detail.declaredValue.toLocaleString()}`} />
            <DetailRow label="Received At" value={detail.time} />
          </div>
        )}
      </Drawer>

      {/* Remove package confirmation */}
      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(o) => !o && setRemoveTarget(null)}
        title="Remove this package?"
        message={`${removeTarget?.description?.trim() || "This package"} (${removeTarget?.pieces ?? 0} pcs) will be removed from the intake. This cannot be undone.`}
        confirmLabel="Remove Package"
        cancelLabel="Keep It"
        onConfirm={() => {
          if (!removeTarget) return
          removePackage(removeTarget.id)
          notify.warning("Package removed", "The package line was removed from this intake.")
        }}
      />
    </div>
  )
}
