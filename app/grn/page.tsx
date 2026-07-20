"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Truck, FileText, Package, CheckCircle, MapPin, Check,
  ChevronDown, Plus, Trash2, X, AlertCircle, Save
} from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  { id: 1, label: "Vehicle & Documents", icon: <Truck className="w-4 h-4" /> },
  { id: 2, label: "Line Items", icon: <Package className="w-4 h-4" /> },
  { id: 3, label: "Quality Check", icon: <CheckCircle className="w-4 h-4" /> },
  { id: 4, label: "Putaway", icon: <MapPin className="w-4 h-4" /> },
  { id: 5, label: "Confirm", icon: <Check className="w-4 h-4" /> },
]

const gateEntries = [
  { id: "GE-2024-089", label: "GE-2024-089 — TN-45-AB-1234 (Acme Foods)" },
  { id: "GE-2024-088", label: "GE-2024-088 — MH-12-CD-5678 (Global Oils)" },
  { id: "GE-2024-087", label: "GE-2024-087 — DL-01-EF-9012 (Agro Corp)" },
]

interface LineItem {
  id: string
  sku: string
  name: string
  expected: number
  received: number
  uom: string
  batch: string
  expiry: string
  condition: string
}

const defaultItems: LineItem[] = [
  { id: "1", sku: "SKU-001234", name: "Premium Basmati Rice 5kg", expected: 500, received: 500, uom: "Bags", batch: "BAT-2024-1205", expiry: "2025-06-15", condition: "Good" },
  { id: "2", sku: "SKU-001235", name: "Organic Wheat Flour 10kg", expected: 200, received: 195, uom: "Bags", batch: "BAT-2024-1206", expiry: "2025-03-20", condition: "Good" },
]

export default function GRNPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [gateEntry, setGateEntry] = useState("")
  const [docType, setDocType] = useState("Purchase Order")
  const [docNumber, setDocNumber] = useState("")
  const [supplier, setSupplier] = useState("")
  const [vehicleNo, setVehicleNo] = useState("")
  const [driverName, setDriverName] = useState("")
  const [lineItems, setLineItems] = useState<LineItem[]>(defaultItems)
  const [notes, setNotes] = useState("")

  const canProceed = () => {
    if (step === 1) return supplier.length > 0 && vehicleNo.length > 0
    if (step === 2) return lineItems.length > 0
    return true
  }

  const totalExpected = lineItems.reduce((s, i) => s + i.expected, 0)
  const totalReceived = lineItems.reduce((s, i) => s + i.received, 0)
  const discrepancy = totalExpected - totalReceived

  return (
    <div className="h-full overflow-y-auto">
      <div className="w-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create Goods Receipt Note</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Record incoming inventory from suppliers</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors">
              <Save className="w-4 h-4" /> Save as Draft
            </button>
          </div>
        </div>

        {/* Stepper */}
        <div className="p-4 rounded-2xl border border-border bg-card">
          <div className="flex items-center">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => step > s.id && setStep(s.id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 group",
                    step === s.id ? "cursor-default" : step > s.id ? "cursor-pointer" : "cursor-not-allowed"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all font-bold text-sm",
                    step > s.id
                      ? "bg-success border-success text-white"
                      : step === s.id
                      ? "bg-brand border-brand text-white"
                      : "bg-muted border-border text-muted-foreground"
                  )}>
                    {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                  </div>
                  <span className={cn(
                    "text-[11px] font-medium hidden sm:block text-center",
                    step === s.id ? "text-brand" : step > s.id ? "text-success" : "text-muted-foreground"
                  )}>
                    {s.label}
                  </span>
                </button>
                {i < steps.length - 1 && (
                  <div className={cn("flex-1 h-0.5 mx-2 rounded transition-colors", step > s.id ? "bg-success" : "bg-border")} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Vehicle & Documents */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-5 h-5 text-brand" />
                <h2 className="font-semibold text-foreground">Gate Entry Reference</h2>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Select Gate Entry</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none pl-3 pr-10 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-brand transition-colors"
                    value={gateEntry}
                    onChange={(e) => setGateEntry(e.target.value)}
                  >
                    <option value="">Select a gate entry...</option>
                    {gateEntries.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-brand" />
                <h2 className="font-semibold text-foreground">Document Details</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Document Type <span className="text-danger">*</span></label>
                  <div className="relative">
                    <select className="w-full appearance-none pl-3 pr-10 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-brand transition-colors" value={docType} onChange={(e) => setDocType(e.target.value)}>
                      {["Purchase Order", "Transfer Order", "Return", "Direct Delivery"].map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Document Number</label>
                  <input className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-brand transition-colors placeholder:text-muted-foreground" placeholder="e.g. PO-2024-0089" value={docNumber} onChange={(e) => setDocNumber(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Supplier / Vendor <span className="text-danger">*</span></label>
                  <input className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-brand transition-colors placeholder:text-muted-foreground" placeholder="Supplier name" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Client</label>
                  <div className="relative">
                    <select className="w-full appearance-none pl-3 pr-10 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-brand transition-colors">
                      <option>Select client...</option>
                      {["Acme Foods", "Global Oils", "Agro Corp", "Sweet Mills"].map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-5 h-5 text-brand" />
                <h2 className="font-semibold text-foreground">Vehicle Details</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Vehicle Number <span className="text-danger">*</span></label>
                  <input className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-brand transition-colors placeholder:text-muted-foreground" placeholder="e.g. TN-45-AB-1234" value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Driver Name</label>
                  <input className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-brand transition-colors placeholder:text-muted-foreground" placeholder="Driver name" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Arrival Time</label>
                  <input type="datetime-local" className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-brand transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Seal Number</label>
                  <input className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-brand transition-colors placeholder:text-muted-foreground" placeholder="Seal / LR number" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Line Items */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-foreground">Line Items</h2>
                <p className="text-xs text-muted-foreground">{lineItems.length} items added</p>
              </div>
              <button
                onClick={() => setLineItems([...lineItems, { id: Date.now().toString(), sku: "", name: "", expected: 0, received: 0, uom: "Units", batch: "", expiry: "", condition: "Good" }])}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            {discrepancy > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-warning/10 border border-warning/20">
                <AlertCircle className="w-4 h-4 text-warning shrink-0" />
                <p className="text-sm text-warning">Discrepancy of {discrepancy} units detected. Please verify quantities.</p>
              </div>
            )}

            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {["SKU Code", "Product Name", "Expected", "Received", "UOM", "Batch/Lot", "Expiry", "Condition", ""].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, i) => (
                      <tr key={item.id} className="border-b border-border/50 last:border-0">
                        <td className="px-4 py-3">
                          <input className="w-28 px-2 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground outline-none focus:border-brand" value={item.sku} onChange={(e) => setLineItems(lineItems.map((li, j) => j === i ? { ...li, sku: e.target.value } : li))} placeholder="SKU code" />
                        </td>
                        <td className="px-4 py-3">
                          <input className="w-48 px-2 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground outline-none focus:border-brand" value={item.name} onChange={(e) => setLineItems(lineItems.map((li, j) => j === i ? { ...li, name: e.target.value } : li))} placeholder="Product name" />
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" className="w-20 px-2 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground outline-none focus:border-brand" value={item.expected} onChange={(e) => setLineItems(lineItems.map((li, j) => j === i ? { ...li, expected: +e.target.value } : li))} />
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" className={cn("w-20 px-2 py-1.5 rounded-lg border text-xs text-foreground outline-none focus:border-brand bg-background", item.received < item.expected ? "border-warning" : "border-border")} value={item.received} onChange={(e) => setLineItems(lineItems.map((li, j) => j === i ? { ...li, received: +e.target.value } : li))} />
                        </td>
                        <td className="px-4 py-3">
                          <select className="px-2 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground outline-none" value={item.uom} onChange={(e) => setLineItems(lineItems.map((li, j) => j === i ? { ...li, uom: e.target.value } : li))}>
                            {["Units", "Bags", "Boxes", "Pallets", "KG", "Litres"].map((u) => <option key={u}>{u}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input className="w-32 px-2 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground outline-none focus:border-brand" value={item.batch} onChange={(e) => setLineItems(lineItems.map((li, j) => j === i ? { ...li, batch: e.target.value } : li))} placeholder="Batch no." />
                        </td>
                        <td className="px-4 py-3">
                          <input type="date" className="px-2 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground outline-none focus:border-brand" value={item.expiry} onChange={(e) => setLineItems(lineItems.map((li, j) => j === i ? { ...li, expiry: e.target.value } : li))} />
                        </td>
                        <td className="px-4 py-3">
                          <select className="px-2 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground outline-none" value={item.condition} onChange={(e) => setLineItems(lineItems.map((li, j) => j === i ? { ...li, condition: e.target.value } : li))}>
                            {["Good", "Damaged", "Expired", "Quarantine"].map((c) => <option key={c}>{c}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => setLineItems(lineItems.filter((_, j) => j !== i))} className="p-1.5 rounded-lg hover:bg-danger/10 text-muted-foreground hover:text-danger transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 text-sm">
                <span className="text-muted-foreground">Total Expected: <strong className="text-foreground">{totalExpected}</strong></span>
                <span className="text-muted-foreground">Total Received: <strong className={cn(discrepancy > 0 ? "text-warning" : "text-success")}>{totalReceived}</strong></span>
                {discrepancy > 0 && <span className="text-warning font-medium">Discrepancy: -{discrepancy}</span>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Notes / Remarks</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground outline-none focus:border-brand transition-colors placeholder:text-muted-foreground resize-none"
                placeholder="Any special instructions or observations..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Steps 3-5 */}
        {step === 3 && (
          <div className="p-8 rounded-2xl border border-border bg-card text-center">
            <CheckCircle className="w-12 h-12 text-brand mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Quality Check</h2>
            <p className="text-muted-foreground text-sm mb-6">Verify items meet quality standards before putaway</p>
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
              {["Pass All", "Flag Items", "Quarantine"].map((action) => (
                <button key={action} className={cn("py-2 px-3 rounded-xl text-sm font-medium transition-colors border",
                  action === "Pass All" ? "bg-success text-white border-success hover:bg-success/90" :
                  action === "Flag Items" ? "border-warning text-warning hover:bg-warning/10" :
                  "border-danger text-danger hover:bg-danger/10"
                )}>
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="p-8 rounded-2xl border border-border bg-card text-center">
            <MapPin className="w-12 h-12 text-brand mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Putaway Instructions</h2>
            <p className="text-muted-foreground text-sm mb-6">System will auto-assign storage locations based on zone rules</p>
            <div className="text-left max-w-sm mx-auto space-y-2">
              {lineItems.slice(0, 2).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-muted border border-border text-sm">
                  <span className="text-muted-foreground truncate flex-1">{item.name || item.sku}</span>
                  <span className="text-brand font-mono text-xs ml-2">A-12-0{Math.floor(Math.random() * 9) + 1}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="p-8 rounded-2xl border border-border bg-card text-center">
            <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Ready to Confirm</h2>
            <p className="text-muted-foreground text-sm mb-2">GRN Summary</p>
            <div className="max-w-xs mx-auto text-left space-y-2 mt-4">
              {[
                { label: "Supplier", value: supplier || "N/A" },
                { label: "Vehicle", value: vehicleNo || "N/A" },
                { label: "Total Items", value: lineItems.length.toString() },
                { label: "Total Qty Received", value: totalReceived.toString() },
                { label: "Discrepancy", value: discrepancy > 0 ? `-${discrepancy}` : "None" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">{row.label}</span>
                  <span className={cn("text-sm font-medium", row.label === "Discrepancy" && discrepancy > 0 ? "text-warning" : "text-foreground")}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-5 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-xs text-muted-foreground">Step {step} of {steps.length}</span>
          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={() => router.push("/inventory")}
              className="px-5 py-2.5 rounded-xl bg-success text-white text-sm font-medium hover:bg-success/90 transition-colors"
            >
              Confirm GRN
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
