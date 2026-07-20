"use client"
import { useState } from "react"
import { Plus, Save, Trash2, CheckCircle2, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { notify } from "@/components/ui/toast"
import { appendDemoEntry, loadDemoEntries } from "@/lib/demo-store"
import { nextRecordId } from "@/lib/next-id"

type LineItem = { sku: string; product: string; expectedQty: string; receivedQty: string; condition: string }

type SavedGRN = {
  id: string
  asn: string
  supplier: string
  vehicle: string
  dock: string
  receivedDate: string
  receivedTime: string
  receivedBy: string
  notes: string
  items: LineItem[]
  totalExpected: number
  totalReceived: number
}

const emptyItem: LineItem = { sku: "", product: "", expectedQty: "", receivedQty: "", condition: "Good" }

const emptyShipment = { asn: "", supplier: "", vehicle: "", dock: "" }
const emptyReceipt = { receivedDate: "", receivedTime: "", receivedBy: "", notes: "" }

export default function GRNRegisterPage() {
  const [items, setItems] = useState<LineItem[]>([{ ...emptyItem }])
  const [shipment, setShipment] = useState(emptyShipment)
  const [receipt, setReceipt] = useState(emptyReceipt)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [itemErrors, setItemErrors] = useState<Record<number, Record<string, string>>>({})
  const [saved, setSaved] = useState<SavedGRN | null>(null)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [removeIndex, setRemoveIndex] = useState<number | null>(null)

  const addItem = () => setItems(prev => [...prev, { ...emptyItem }])

  const dirty =
    JSON.stringify(shipment) !== JSON.stringify(emptyShipment) ||
    JSON.stringify(receipt) !== JSON.stringify(emptyReceipt) ||
    items.length > 1 ||
    JSON.stringify(items[0]) !== JSON.stringify(emptyItem)

  const num = (v: string) => (v.trim() === "" ? 0 : Number(v))
  const totalExpected = items.reduce((s, i) => s + (Number.isFinite(num(i.expectedQty)) ? num(i.expectedQty) : 0), 0)
  const totalReceived = items.reduce((s, i) => s + (Number.isFinite(num(i.receivedQty)) ? num(i.receivedQty) : 0), 0)

  function updateItem(i: number, patch: Partial<LineItem>) {
    setItems(prev => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
    setItemErrors(prev => ({ ...prev, [i]: {} }))
  }

  function resetForm() {
    setItems([{ ...emptyItem }])
    setShipment(emptyShipment)
    setReceipt(emptyReceipt)
    setErrors({})
    setItemErrors({})
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!shipment.asn.trim()) e.asn = "ASN / PO number is required"
    if (!shipment.supplier.trim()) e.supplier = "Supplier is required"
    if (!shipment.vehicle.trim()) e.vehicle = "Vehicle number is required"
    if (!receipt.receivedBy.trim()) e.receivedBy = "Received by is required"

    const ie: Record<number, Record<string, string>> = {}
    items.forEach((it, i) => {
      const row: Record<string, string> = {}
      if (!it.sku.trim()) row.sku = "Required"
      if (!it.product.trim()) row.product = "Required"
      if (!it.expectedQty.trim()) row.expectedQty = "Required"
      else if (!/^\d+$/.test(it.expectedQty.trim()) || num(it.expectedQty) < 1) row.expectedQty = "Positive number"
      if (!it.receivedQty.trim()) row.receivedQty = "Required"
      else if (!/^\d+$/.test(it.receivedQty.trim())) row.receivedQty = "Whole number"
      else if (num(it.receivedQty) > num(it.expectedQty)) row.receivedQty = "Exceeds expected"
      if (Object.keys(row).length > 0) ie[i] = row
    })

    setErrors(e)
    setItemErrors(ie)

    if (Object.keys(e).length > 0 || Object.keys(ie).length > 0) {
      const rowCount = Object.keys(ie).length
      notify.error(
        "GRN not saved",
        rowCount > 0
          ? `Fix ${rowCount} line item${rowCount > 1 ? "s" : ""} and any highlighted fields.`
          : "Fill in all required shipment fields.",
      )
      return false
    }
    return true
  }

  function saveGRN() {
    if (!validate()) return
    const knownIds = [
      ...loadDemoEntries<{ id: string }>("grns").map(g => g.id),
      "GRN-2024-1050",
    ]
    const id = nextRecordId(knownIds, /^GRN-2024-(\d+)$/, "GRN-2024-", 4)
    const next: SavedGRN = {
      id,
      ...shipment,
      ...receipt,
      items,
      totalExpected,
      totalReceived,
    }
    appendDemoEntry("grns", {
      id,
      asn: shipment.asn.trim(),
      supplier: shipment.supplier.trim(),
      items: items.length,
      qty: totalReceived,
      received: `${receipt.receivedDate || new Date().toISOString().slice(0, 10)} ${receipt.receivedTime || new Date().toTimeString().slice(0, 5)}`,
      dock: shipment.dock.trim() || "—",
      receivedBy: receipt.receivedBy.trim(),
      discrepancy: totalExpected > totalReceived,
      status: totalExpected > totalReceived ? "With Discrepancy" : "Completed",
    })
    setSaved(next)
    notify.success("GRN saved", `${next.id} — ${items.length} line item${items.length > 1 ? "s" : ""}, ${totalReceived} units received.`)
  }

  function startAnother() {
    setSaved(null)
    resetForm()
  }

  // ---- Success state ----------------------------------------------------
  if (saved) {
    const discrepancy = saved.totalExpected - saved.totalReceived
    return (
      <div className="w-full p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">New GRN</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Register a new goods receipt note</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">GRN Saved</h2>
          <p className="text-sm text-muted-foreground mb-6">
            <span className="font-mono text-brand font-semibold">{saved.id}</span> has been recorded.
          </p>
          <div className="max-w-sm mx-auto text-left space-y-1">
            {[
              { label: "ASN / PO", value: saved.asn },
              { label: "Supplier", value: saved.supplier },
              { label: "Vehicle", value: saved.vehicle },
              { label: "Dock", value: saved.dock || "—" },
              { label: "Received By", value: saved.receivedBy },
              { label: "Line Items", value: String(saved.items.length) },
              { label: "Total Expected", value: String(saved.totalExpected) },
              { label: "Total Received", value: String(saved.totalReceived) },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-xs text-muted-foreground">{r.label}</span>
                <span className="text-sm text-foreground font-medium">{r.value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-muted-foreground">Discrepancy</span>
              <span className={cn("text-sm font-medium", discrepancy > 0 ? "text-warning" : "text-success")}>
                {discrepancy > 0 ? `-${discrepancy} units` : "None"}
              </span>
            </div>
          </div>
          <button
            onClick={startAnother}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"
          >
            <FileText className="w-4 h-4" /> Register Another GRN
          </button>
        </div>
      </div>
    )
  }

  // ---- Form -------------------------------------------------------------
  const shipmentFields = [
    { key: "asn" as const, label: "ASN / PO Number", placeholder: "e.g. ASN-2024-0881", required: true },
    { key: "supplier" as const, label: "Supplier", placeholder: "Supplier name", required: true },
    { key: "vehicle" as const, label: "Truck / Vehicle No.", placeholder: "e.g. TS 09 AB 1234", required: true },
    { key: "dock" as const, label: "Dock", placeholder: "e.g. Dock 1", required: false },
  ]

  const receiptFields = [
    { key: "receivedDate" as const, label: "Received Date", type: "date", placeholder: undefined, required: false },
    { key: "receivedTime" as const, label: "Received Time", type: "time", placeholder: undefined, required: false },
    { key: "receivedBy" as const, label: "Received By", type: "text", placeholder: "Staff name", required: true },
  ]

  return (
    <div className="w-full p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">New GRN</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Register a new goods receipt note</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <p className="font-semibold text-foreground">Shipment Details</p>
          {shipmentFields.map(f => (
            <div key={f.label}>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                {f.label}{f.required && <span className="text-danger ml-0.5">*</span>}
              </label>
              <input
                value={shipment[f.key]}
                onChange={e => { setShipment({ ...shipment, [f.key]: e.target.value }); setErrors(p => ({ ...p, [f.key]: "" })) }}
                placeholder={f.placeholder}
                className={cn(
                  "w-full px-3 py-2 rounded-lg border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30",
                  errors[f.key] ? "border-danger" : "border-border",
                )}
              />
              {errors[f.key] && <p className="mt-1 text-xs text-danger">{errors[f.key]}</p>}
            </div>
          ))}
        </div>
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <p className="font-semibold text-foreground">Receipt Info</p>
          {receiptFields.map(f => (
            <div key={f.label}>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                {f.label}{f.required && <span className="text-danger ml-0.5">*</span>}
              </label>
              <input
                type={f.type || "text"}
                value={receipt[f.key]}
                onChange={e => { setReceipt({ ...receipt, [f.key]: e.target.value }); setErrors(p => ({ ...p, [f.key]: "" })) }}
                placeholder={f.placeholder}
                className={cn(
                  "w-full px-3 py-2 rounded-lg border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30",
                  errors[f.key] ? "border-danger" : "border-border",
                )}
              />
              {errors[f.key] && <p className="mt-1 text-xs text-danger">{errors[f.key]}</p>}
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Notes</label>
            <textarea
              rows={3}
              value={receipt.notes}
              onChange={e => setReceipt({ ...receipt, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground">Line Items</p>
            <p className="text-xs text-muted-foreground">
              {items.length} item{items.length > 1 ? "s" : ""} · Expected {totalExpected} · Received {totalReceived}
            </p>
          </div>
          <button onClick={addItem} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand/10 text-brand text-sm font-medium hover:bg-brand/20 transition-colors"><Plus className="w-4 h-4" /> Add Item</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border"><tr>{["SKU", "Product Name", "Expected Qty", "Received Qty", "Condition", ""].map(h => <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-border">
              {items.map((item, i) => (
                <tr key={i}>
                  <td className="px-3 py-2 align-top">
                    <input value={item.sku} onChange={e => updateItem(i, { sku: e.target.value })} placeholder="SKU-XXXXXX" className={cn("w-28 px-2 py-1 rounded border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-brand/30", itemErrors[i]?.sku ? "border-danger" : "border-border")} />
                    {itemErrors[i]?.sku && <p className="mt-1 text-[10px] text-danger">{itemErrors[i].sku}</p>}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input value={item.product} onChange={e => updateItem(i, { product: e.target.value })} placeholder="Product name" className={cn("w-48 px-2 py-1 rounded border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-brand/30", itemErrors[i]?.product ? "border-danger" : "border-border")} />
                    {itemErrors[i]?.product && <p className="mt-1 text-[10px] text-danger">{itemErrors[i].product}</p>}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input value={item.expectedQty} onChange={e => updateItem(i, { expectedQty: e.target.value })} placeholder="0" inputMode="numeric" className={cn("w-20 px-2 py-1 rounded border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-brand/30", itemErrors[i]?.expectedQty ? "border-danger" : "border-border")} />
                    {itemErrors[i]?.expectedQty && <p className="mt-1 text-[10px] text-danger">{itemErrors[i].expectedQty}</p>}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input value={item.receivedQty} onChange={e => updateItem(i, { receivedQty: e.target.value })} placeholder="0" inputMode="numeric" className={cn("w-20 px-2 py-1 rounded border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-brand/30", itemErrors[i]?.receivedQty ? "border-danger" : "border-border")} />
                    {itemErrors[i]?.receivedQty && <p className="mt-1 text-[10px] text-danger">{itemErrors[i].receivedQty}</p>}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <select value={item.condition} onChange={e => updateItem(i, { condition: e.target.value })} className="px-2 py-1 rounded border border-border bg-background text-xs focus:outline-none">
                      {["Good", "Damaged", "Short", "Excess"].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <button
                      onClick={() => setRemoveIndex(i)}
                      disabled={items.length === 1}
                      title="Remove line item"
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-danger/10 hover:text-danger transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button
          onClick={() => (dirty ? setCancelOpen(true) : notify.info("Nothing to discard", "The GRN form is already empty."))}
          className="px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button onClick={saveGRN} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Save className="w-4 h-4" /> Save GRN</button>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Discard this GRN?"
        message="All shipment details and line items entered so far will be cleared. This cannot be undone."
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
        onConfirm={() => { resetForm(); notify.warning("GRN discarded", "The form has been cleared.") }}
      />

      <ConfirmDialog
        open={removeIndex !== null}
        onOpenChange={(o) => !o && setRemoveIndex(null)}
        title="Remove this line item?"
        message={
          removeIndex !== null && items[removeIndex]?.product
            ? `"${items[removeIndex].product}" will be removed from this GRN.`
            : "This line item will be removed from this GRN."
        }
        confirmLabel="Remove Item"
        cancelLabel="Keep Item"
        onConfirm={() => {
          if (removeIndex === null) return
          setItems(prev => prev.filter((_, idx) => idx !== removeIndex))
          setItemErrors({})
          notify.warning("Line item removed", `${items.length - 1} item${items.length - 1 === 1 ? "" : "s"} remaining.`)
        }}
      />
    </div>
  )
}
