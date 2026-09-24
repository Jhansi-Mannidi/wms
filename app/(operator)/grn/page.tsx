"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Truck, FileText, Package, CheckCircle, MapPin, Check,
  ChevronDown, Plus, Trash2, X, AlertCircle, Save
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { notify } from "@/components/ui/toast"
import { appendDemoEntry, loadDemoEntries } from "@/lib/demo-store"
import { nextRecordId } from "@/lib/next-id"

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
  { id: "GE-2024-086", label: "GE-2024-086 — KA-05-GH-3456 (Sweet Mills)" },
  { id: "GE-2024-085", label: "GE-2024-085 — AP-28-IJ-7890 (Salt Works)" },
  { id: "GE-2024-084", label: "GE-2024-084 — GJ-05-KL-2345 (Fresh Farms)" },
  { id: "GE-2024-083", label: "GE-2024-083 — RJ-14-MN-6789 (Tropical Co)" },
  { id: "GE-2024-082", label: "GE-2024-082 — UP-32-OP-1122 (Acme Foods)" },
  { id: "GE-2024-081", label: "GE-2024-081 — HR-26-QR-3344 (Global Oils)" },
  { id: "GE-2024-080", label: "GE-2024-080 — WB-06-ST-5566 (Agro Corp)" },
]

// `type` (not `interface`) so rows stay assignable to Record<string, unknown> consumers
type LineItem = {
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

type QcResult = "Passed" | "Flagged" | "Quarantined"

const qcStyle: Record<QcResult, string> = {
  Passed: "bg-success/10 text-success",
  Flagged: "bg-warning/10 text-warning",
  Quarantined: "bg-danger/10 text-danger",
}

const defaultItems: LineItem[] = [
  { id: "1", sku: "SKU-001234", name: "Premium Basmati Rice 5kg", expected: 500, received: 500, uom: "Bags", batch: "BAT-2024-1205", expiry: "2025-06-15", condition: "Good" },
  { id: "2", sku: "SKU-001235", name: "Organic Wheat Flour 10kg", expected: 200, received: 195, uom: "Bags", batch: "BAT-2024-1206", expiry: "2025-03-20", condition: "Good" },
  { id: "3", sku: "SKU-001236", name: "Refined Sunflower Oil 5L", expected: 320, received: 320, uom: "Boxes", batch: "BAT-2024-1207", expiry: "2025-09-10", condition: "Good" },
  { id: "4", sku: "SKU-001237", name: "Chickpea Lentils 25kg", expected: 100, received: 96, uom: "Bags", batch: "BAT-2024-1208", expiry: "2025-11-30", condition: "Damaged" },
  { id: "5", sku: "SKU-001238", name: "Brown Sugar 10kg", expected: 150, received: 150, uom: "Bags", batch: "BAT-2024-1209", expiry: "2026-01-15", condition: "Good" },
  { id: "6", sku: "SKU-001239", name: "Iodized Salt 1kg", expected: 2000, received: 2000, uom: "Boxes", batch: "BAT-2024-1210", expiry: "2027-04-01", condition: "Good" },
  { id: "7", sku: "SKU-001240", name: "Tomato Puree 400g", expected: 1200, received: 1180, uom: "Boxes", batch: "BAT-2024-1211", expiry: "2025-08-22", condition: "Damaged" },
  { id: "8", sku: "SKU-001241", name: "Coconut Milk 400ml", expected: 840, received: 840, uom: "Boxes", batch: "BAT-2024-1212", expiry: "2025-07-18", condition: "Good" },
  { id: "9", sku: "SKU-001242", name: "Toor Dal 5kg", expected: 260, received: 260, uom: "Bags", batch: "BAT-2024-1213", expiry: "2025-12-05", condition: "Good" },
  { id: "10", sku: "SKU-001243", name: "Mustard Oil 2L", expected: 480, received: 465, uom: "Boxes", batch: "BAT-2024-1214", expiry: "2025-10-14", condition: "Quarantine" },
  { id: "11", sku: "SKU-001244", name: "Jaggery Blocks 1kg", expected: 900, received: 900, uom: "Pallets", batch: "BAT-2024-1215", expiry: "2025-05-28", condition: "Good" },
  { id: "12", sku: "SKU-001245", name: "Black Pepper 500g", expected: 640, received: 632, uom: "Boxes", batch: "BAT-2024-1216", expiry: "2026-02-09", condition: "Expired" },
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

  const [draft, setDraft] = useState<{ ref: string; savedAt: string } | null>(null)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<LineItem | null>(null)
  const [qcResult, setQcResult] = useState<QcResult | null>(null)

  const canProceed = () => {
    if (step === 1) return supplier.length > 0 && vehicleNo.length > 0
    if (step === 2) return lineItems.length > 0
    return true
  }

  const totalExpected = lineItems.reduce((s, i) => s + i.expected, 0)
  const totalReceived = lineItems.reduce((s, i) => s + i.received, 0)
  const discrepancy = totalExpected - totalReceived

  // Form is dirty once the user has touched anything beyond the seeded defaults.
  const dirty =
    gateEntry !== "" || docNumber !== "" || supplier !== "" || vehicleNo !== "" ||
    driverName !== "" || notes !== "" || docType !== "Purchase Order" ||
    JSON.stringify(lineItems) !== JSON.stringify(defaultItems)

  function saveDraft() {
    const now = new Date()
    const ref = draft?.ref ?? `GRN-DRAFT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 900) + 100)}`
    setDraft({ ref, savedAt: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) })
    notify.success("Draft saved", `${ref} — ${lineItems.length} line item${lineItems.length === 1 ? "" : "s"}, resume any time.`)
  }

  function discardAndLeave() {
    setDraft(null)
    notify.warning("GRN discarded", "Your unsaved changes were dropped.")
    router.back()
  }

  function handleCancel() {
    if (dirty) setCancelOpen(true)
    else router.back()
  }

  function runQc(result: QcResult) {
    setQcResult(result)
    if (result === "Passed") {
      setLineItems(prev => prev.map(i => ({ ...i, condition: "Good" })))
      notify.success("Quality check passed", `All ${lineItems.length} line items marked Good.`)
    } else if (result === "Flagged") {
      setLineItems(prev => prev.map(i => (i.received < i.expected ? { ...i, condition: "Damaged" } : i)))
      const flagged = lineItems.filter(i => i.received < i.expected).length
      notify.warning("Items flagged", flagged > 0 ? `${flagged} short-received item${flagged === 1 ? "" : "s"} marked Damaged.` : "No short-received items found to flag.")
    } else {
      setLineItems(prev => prev.map(i => ({ ...i, condition: "Quarantine" })))
      notify.error("Shipment quarantined", `All ${lineItems.length} line items moved to Quarantine.`)
    }
  }

  function removeItem(item: LineItem) {
    setLineItems(prev => prev.filter(i => i.id !== item.id))
    notify.warning("Line item removed", `${item.name || item.sku || "Item"} removed from this GRN.`)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="w-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create Goods Receipt Note</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Record incoming inventory from suppliers</p>
            {draft && (
              <p className="text-xs text-success mt-1.5 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Draft <span className="font-mono font-semibold">{draft.ref}</span> saved at {draft.savedAt}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
            <button
              onClick={saveDraft}
              title="Save this GRN as a draft"
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors",
                draft ? "border-success/40 bg-success/10 text-success hover:bg-success/20" : "border-border bg-card text-foreground hover:bg-muted",
              )}
            >
              <Save className="w-4 h-4" /> {draft ? "Draft Saved" : "Save as Draft"}
            </button>
          </div>
        </div>

        {/* Stepper */}
        <div className="p-4 rounded-xl border border-border bg-card">
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
            <div className="p-5 rounded-xl border border-border bg-card space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-5 h-5 text-brand" />
                <h2 className="font-semibold text-foreground">Gate Entry Reference</h2>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Select Gate Entry</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none pl-3 pr-10 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-brand transition-colors"
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

            <div className="p-5 rounded-xl border border-border bg-card space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-brand" />
                <h2 className="font-semibold text-foreground">Document Details</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Document Type <span className="text-danger">*</span></label>
                  <div className="relative">
                    <select className="w-full appearance-none pl-3 pr-10 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-brand transition-colors" value={docType} onChange={(e) => setDocType(e.target.value)}>
                      {["Purchase Order", "Transfer Order", "Return", "Direct Delivery"].map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Document Number</label>
                  <input className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-brand transition-colors placeholder:text-muted-foreground" placeholder="e.g. PO-2024-0089" value={docNumber} onChange={(e) => setDocNumber(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Supplier / Vendor <span className="text-danger">*</span></label>
                  <input className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-brand transition-colors placeholder:text-muted-foreground" placeholder="Supplier name" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Client</label>
                  <div className="relative">
                    <select className="w-full appearance-none pl-3 pr-10 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-brand transition-colors">
                      <option>Select client...</option>
                      {["Acme Foods", "Global Oils", "Agro Corp", "Sweet Mills"].map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-5 h-5 text-brand" />
                <h2 className="font-semibold text-foreground">Vehicle Details</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Vehicle Number <span className="text-danger">*</span></label>
                  <input className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-brand transition-colors placeholder:text-muted-foreground" placeholder="e.g. TN-45-AB-1234" value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Driver Name</label>
                  <input className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-brand transition-colors placeholder:text-muted-foreground" placeholder="Driver name" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Arrival Time</label>
                  <input type="datetime-local" className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-brand transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Seal Number</label>
                  <input className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-brand transition-colors placeholder:text-muted-foreground" placeholder="Seal / LR number" />
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

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
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
                          <button onClick={() => setRemoveTarget(item)} title="Remove line item" className="p-1.5 rounded-lg hover:bg-danger/10 text-muted-foreground hover:text-danger transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {lineItems.length === 0 && (
                      <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">No line items yet — use “Add Item” to start.</td></tr>
                    )}
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
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground outline-none focus:border-brand transition-colors placeholder:text-muted-foreground resize-none"
                placeholder="Any special instructions or observations..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Steps 3-5 */}
        {step === 3 && (
          <div className="p-8 rounded-xl border border-border bg-card text-center">
            <CheckCircle className="w-12 h-12 text-brand mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Quality Check</h2>
            <p className="text-muted-foreground text-sm mb-6">Verify items meet quality standards before putaway</p>
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
              {([
                { action: "Pass All", result: "Passed" as const },
                { action: "Flag Items", result: "Flagged" as const },
                { action: "Quarantine", result: "Quarantined" as const },
              ]).map(({ action, result }) => (
                <button
                  key={action}
                  onClick={() => runQc(result)}
                  title={`Mark quality check as ${result}`}
                  className={cn("py-2 px-3 rounded-lg text-sm font-medium transition-colors border",
                    action === "Pass All" ? "bg-success text-white border-success hover:bg-success/90" :
                    action === "Flag Items" ? "border-warning text-warning hover:bg-warning/10" :
                    "border-danger text-danger hover:bg-danger/10",
                    qcResult === result && "ring-2 ring-offset-2 ring-brand ring-offset-background"
                  )}
                >
                  {action}
                </button>
              ))}
            </div>
            {qcResult && (
              <div className="mt-6 max-w-sm mx-auto space-y-2">
                <span className={cn("inline-block px-3 py-1 rounded-full text-xs font-semibold", qcStyle[qcResult])}>
                  Quality check: {qcResult}
                </span>
                <div className="text-left space-y-1 pt-2">
                  {lineItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-muted border border-border text-sm">
                      <span className="text-muted-foreground truncate flex-1">{item.name || item.sku || "Untitled item"}</span>
                      <span className={cn("text-xs font-medium ml-2 shrink-0",
                        item.condition === "Good" ? "text-success" : item.condition === "Quarantine" ? "text-danger" : "text-warning"
                      )}>{item.condition}</span>
                    </div>
                  ))}
                  {lineItems.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No line items to check.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="p-8 rounded-xl border border-border bg-card text-center">
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
          <div className="p-8 rounded-xl border border-border bg-card text-center">
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
            className="px-5 py-2.5 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-xs text-muted-foreground">Step {step} of {steps.length}</span>
          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="px-5 py-2.5 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (lineItems.length === 0) {
                  notify.error("Cannot confirm GRN", "Add at least one line item before confirming.")
                  return
                }
                const knownIds = [
                  ...loadDemoEntries<{ id: string }>("grns").map(g => g.id),
                  "GRN-2024-1050",
                ]
                const id = nextRecordId(knownIds, /^GRN-2024-(\d+)$/, "GRN-2024-", 4)
                appendDemoEntry("grns", {
                  id,
                  asn: docNumber.trim() || gateEntry || "—",
                  supplier: supplier.trim(),
                  items: lineItems.length,
                  qty: totalReceived,
                  received: new Date().toISOString().slice(0, 16).replace("T", " "),
                  dock: "Dock 1",
                  receivedBy: driverName.trim() || "—",
                  discrepancy: discrepancy > 0,
                  status: discrepancy > 0 ? "With Discrepancy" : "Completed",
                })
                notify.success("GRN confirmed", `${id} — ${lineItems.length} line item${lineItems.length === 1 ? "" : "s"} · ${totalReceived} units received from ${supplier || "supplier"}.`)
                setDraft(null)
                router.push("/inventory/grn-history")
              }}
              className="px-5 py-2.5 rounded-lg bg-success text-white text-sm font-medium hover:bg-success/90 transition-colors"
            >
              Confirm GRN
            </button>
          )}
        </div>

        {/* Cancel confirmation — only reachable while the form is dirty */}
        <ConfirmDialog
          open={cancelOpen}
          onOpenChange={setCancelOpen}
          title="Discard this GRN?"
          message={
            draft
              ? `You have unsaved changes since draft ${draft.ref}. Leaving now discards them.`
              : "You have unsaved changes. Leaving now discards this GRN entirely."
          }
          confirmLabel="Discard & Leave"
          cancelLabel="Keep Editing"
          onConfirm={discardAndLeave}
        />

        {/* Line item removal */}
        <ConfirmDialog
          open={!!removeTarget}
          onOpenChange={(o) => !o && setRemoveTarget(null)}
          title="Remove this line item?"
          message={`${removeTarget?.name || removeTarget?.sku || "This item"} will be removed from the GRN. This cannot be undone.`}
          confirmLabel="Remove Item"
          cancelLabel="Keep Item"
          onConfirm={() => removeTarget && removeItem(removeTarget)}
        />
      </div>
    </div>
  )
}
