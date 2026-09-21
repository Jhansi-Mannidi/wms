"use client"
import { useState } from "react"
import { Search, Truck, Plus, Eye, Printer, Check, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type ShipOrder = {
  id: string; client: string; boxes: number; weight: string; awb: string
  courier: string; pickupSlot: string; shipTo: string; sla: string
}

const initialOrders: ShipOrder[] = [
  { id: "ORD-8770", client: "Acme Foods", boxes: 5, weight: "28kg", awb: "BD-20240101", courier: "BlueDart", pickupSlot: "14:00-16:00", shipTo: "Mumbai", sla: "2024-07-21" },
  { id: "ORD-8768", client: "Agro Corp", boxes: 3, weight: "60kg", awb: "DL-20240202", courier: "Delhivery", pickupSlot: "15:00-17:00", shipTo: "Delhi", sla: "2024-07-21" },
  { id: "ORD-8765", client: "Sweet Mills", boxes: 8, weight: "40kg", awb: "FX-88010", courier: "FedEx", pickupSlot: "12:00-14:00", shipTo: "Chennai", sla: "2024-07-20" },
  { id: "ORD-8763", client: "Global Oils", boxes: 4, weight: "34kg", awb: "DT-20240303", courier: "DTDC", pickupSlot: "10:00-12:00", shipTo: "Bengaluru", sla: "2024-07-21" },
  { id: "ORD-8761", client: "Salt Works", boxes: 6, weight: "72kg", awb: "EE-88021", courier: "Ecom Express", pickupSlot: "17:00-19:00", shipTo: "Hyderabad", sla: "2024-07-22" },
  { id: "ORD-8759", client: "Fresh Farms", boxes: 2, weight: "15kg", awb: "BD-20240404", courier: "BlueDart", pickupSlot: "12:00-14:00", shipTo: "Pune", sla: "2024-07-20" },
  { id: "ORD-8757", client: "Acme Foods", boxes: 7, weight: "48kg", awb: "DL-88032", courier: "Delhivery", pickupSlot: "14:00-16:00", shipTo: "Kolkata", sla: "2024-07-21" },
  { id: "ORD-8755", client: "Agro Corp", boxes: 3, weight: "56kg", awb: "FX-88043", courier: "FedEx", pickupSlot: "15:00-17:00", shipTo: "Mumbai", sla: "2024-07-22" },
  { id: "ORD-8753", client: "Sweet Mills", boxes: 5, weight: "29kg", awb: "DT-88054", courier: "DTDC", pickupSlot: "10:00-12:00", shipTo: "Delhi", sla: "2024-07-20" },
  { id: "ORD-8751", client: "Global Oils", boxes: 9, weight: "88kg", awb: "EE-88065", courier: "Ecom Express", pickupSlot: "17:00-19:00", shipTo: "Chennai", sla: "2024-07-23" },
  { id: "ORD-8749", client: "Salt Works", boxes: 1, weight: "25kg", awb: "BD-88076", courier: "BlueDart", pickupSlot: "12:00-14:00", shipTo: "Bengaluru", sla: "2024-07-21" },
  { id: "ORD-8747", client: "Fresh Farms", boxes: 4, weight: "21kg", awb: "DL-88087", courier: "Delhivery", pickupSlot: "14:00-16:00", shipTo: "Hyderabad", sla: "2024-07-22" },
  { id: "ORD-8745", client: "Acme Foods", boxes: 6, weight: "37kg", awb: "FX-88098", courier: "FedEx", pickupSlot: "15:00-17:00", shipTo: "Pune", sla: "2024-07-20" },
  { id: "ORD-8743", client: "Agro Corp", boxes: 8, weight: "94kg", awb: "DT-88109", courier: "DTDC", pickupSlot: "10:00-12:00", shipTo: "Kolkata", sla: "2024-07-23" },
  { id: "ORD-8741", client: "Sweet Mills", boxes: 2, weight: "12kg", awb: "EE-88110", courier: "Ecom Express", pickupSlot: "17:00-19:00", shipTo: "Mumbai", sla: "2024-07-21" },
  { id: "ORD-8739", client: "Global Oils", boxes: 5, weight: "45kg", awb: "BD-88121", courier: "BlueDart", pickupSlot: "12:00-14:00", shipTo: "Delhi", sla: "2024-07-22" },
  { id: "ORD-8737", client: "Salt Works", boxes: 7, weight: "80kg", awb: "DL-88132", courier: "Delhivery", pickupSlot: "14:00-16:00", shipTo: "Chennai", sla: "2024-07-20" },
  { id: "ORD-8735", client: "Fresh Farms", boxes: 3, weight: "18kg", awb: "FX-88143", courier: "FedEx", pickupSlot: "15:00-17:00", shipTo: "Bengaluru", sla: "2024-07-23" },
  { id: "ORD-8733", client: "Acme Foods", boxes: 4, weight: "26kg", awb: "DT-88154", courier: "DTDC", pickupSlot: "10:00-12:00", shipTo: "Hyderabad", sla: "2024-07-21" },
  { id: "ORD-8731", client: "Agro Corp", boxes: 6, weight: "68kg", awb: "EE-88165", courier: "Ecom Express", pickupSlot: "17:00-19:00", shipTo: "Pune", sla: "2024-07-22" },
  { id: "ORD-8729", client: "Sweet Mills", boxes: 2, weight: "10kg", awb: "BD-88176", courier: "BlueDart", pickupSlot: "12:00-14:00", shipTo: "Kolkata", sla: "2024-07-20" },
  { id: "ORD-8727", client: "Global Oils", boxes: 8, weight: "76kg", awb: "DL-88187", courier: "Delhivery", pickupSlot: "14:00-16:00", shipTo: "Mumbai", sla: "2024-07-23" },
  { id: "ORD-8725", client: "Salt Works", boxes: 5, weight: "62kg", awb: "FX-88198", courier: "FedEx", pickupSlot: "15:00-17:00", shipTo: "Delhi", sla: "2024-07-21" },
  { id: "ORD-8723", client: "Fresh Farms", boxes: 3, weight: "20kg", awb: "DT-88209", courier: "DTDC", pickupSlot: "10:00-12:00", shipTo: "Chennai", sla: "2024-07-22" },
]

const CLIENTS = ["Acme Foods", "Agro Corp", "Sweet Mills", "Global Oils", "Salt Works", "Fresh Farms"] as const
const COURIERS = ["BlueDart", "Delhivery", "FedEx", "DTDC", "Ecom Express"] as const
const SLOTS = ["10:00-12:00", "12:00-14:00", "14:00-16:00", "15:00-17:00", "17:00-19:00"] as const
const CITIES = ["Mumbai", "Delhi", "Chennai", "Bengaluru", "Hyderabad", "Kolkata", "Pune"] as const

const emptyForm = { client: "", boxes: "", weight: "", awb: "", courier: "", pickupSlot: "", shipTo: "", sla: "" }

/** Sum "28kg" style weights into tonnes for the total-weight stat. */
function kg(w: string) {
  return Number(w.replace(/[^\d.]/g, "")) || 0
}

export default function ReadyToShipPage() {
  const [orders, setOrders] = useState<ShipOrder[]>(initialOrders)
  const [search, setSearch] = useState("")

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<ShipOrder | null>(null)
  const [holdTarget, setHoldTarget] = useState<ShipOrder | null>(null)

  const filtered = orders.filter(o =>
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.client.toLowerCase().includes(search.toLowerCase()) ||
    o.awb.toLowerCase().includes(search.toLowerCase())
  )

  const totalKg = orders.reduce((s, o) => s + kg(o.weight), 0)
  const today = new Date().toISOString().slice(0, 10)
  const stats = [
    { label: "Awaiting Pickup", value: String(orders.length) },
    { label: "Pickup Today", value: String(orders.filter(o => o.sla <= today).length || orders.length) },
    { label: "Total Boxes", value: String(orders.reduce((s, o) => s + o.boxes, 0)) },
    { label: "Total Weight", value: totalKg >= 1000 ? `${(totalKg / 1000).toFixed(1)}T` : `${totalKg}kg` },
  ]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.client) e.client = "Select a client"
    if (!form.boxes.trim()) e.boxes = "Box count is required"
    else if (!/^\d+$/.test(form.boxes) || Number(form.boxes) < 1) e.boxes = "Enter a positive whole number"
    if (!form.weight.trim()) e.weight = "Weight is required"
    else if (!/^\d+(\.\d+)?$/.test(form.weight)) e.weight = "Enter a number in kg"
    if (!form.awb.trim()) e.awb = "AWB is required"
    else if (!/^[A-Z]{2}-[\w]{4,}$/i.test(form.awb.trim())) e.awb = "Use the format BD-20240101"
    else if (orders.some(o => o.awb.toLowerCase() === form.awb.trim().toLowerCase())) e.awb = "That AWB is already staged"
    if (!form.courier) e.courier = "Select a courier"
    if (!form.pickupSlot) e.pickupSlot = "Select a pickup slot"
    if (!form.shipTo) e.shipTo = "Select a destination"
    if (!form.sla.trim()) e.sla = "SLA date is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createOrder() {
    if (!validate()) {
      notify.error("Check the form", "Some required fields need your attention.")
      return
    }
    const nums = orders.map(o => Number(o.id.split("-")[1])).filter(n => !Number.isNaN(n))
    const next: ShipOrder = {
      id: `ORD-${Math.max(8770, ...nums) + 1}`,
      client: form.client,
      boxes: Number(form.boxes),
      weight: `${form.weight}kg`,
      awb: form.awb.trim().toUpperCase(),
      courier: form.courier,
      pickupSlot: form.pickupSlot,
      shipTo: form.shipTo,
      sla: form.sla,
    }
    setOrders(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Shipment staged", `${next.id} staged for ${next.courier} pickup.`)
  }

  function dispatch(o: ShipOrder) {
    setOrders(prev => prev.filter(x => x.id !== o.id))
    setDetail(null)
    notify.success("Shipment dispatched", `${o.id} handed to ${o.courier} (${o.awb}).`)
  }

  function printLabel(o: ShipOrder) {
    notify.info("Label sent to printer", `Shipping label for ${o.id} / ${o.awb} queued at the dock printer.`)
  }

  function hold(o: ShipOrder) {
    setOrders(prev => prev.filter(x => x.id !== o.id))
    notify.warning("Shipment held", `${o.id} pulled from the dispatch lane.`)
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold text-foreground">Ready to Ship</h1><p className="text-sm text-muted-foreground mt-0.5">Orders staged and awaiting carrier pickup</p></div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="ready-to-ship" />
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
            <Plus className="w-4 h-4" /> Stage Shipment
          </button>
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
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order ID, client, AWB..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>{["Order ID", "Client", "Boxes", "Weight", "AWB", "Courier", "Pickup Slot", "Ship To", "SLA", "Actions"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(o => (
              <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{o.id}</td>
                <td className="px-4 py-3 text-foreground">{o.client}</td>
                <td className="px-4 py-3 text-foreground">{o.boxes}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.weight}</td>
                <td className="px-4 py-3 font-mono text-xs text-brand">{o.awb}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.courier}</td>
                <td className="px-4 py-3 text-foreground">{o.pickupSlot}</td>
                <td className="px-4 py-3 text-foreground">{o.shipTo}</td>
                <td className="px-4 py-3 text-foreground">{o.sla}</td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: "View details", icon: <Eye />, onSelect: () => setDetail(o) },
                      { label: "Print shipping label", icon: <Printer />, onSelect: () => printLabel(o) },
                      { label: "Mark dispatched", icon: <Check />, onSelect: () => dispatch(o), tone: "success" as const },
                      { label: "Hold shipment", icon: <XCircle />, onSelect: () => setHoldTarget(o), tone: "danger" as const },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-10 text-center text-sm text-muted-foreground">No staged shipments match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Stage shipment */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="Stage a Shipment"
        description="Add a packed order to the dispatch lane"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createOrder} submitLabel="Stage Shipment" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Client" required error={errors.client}>
            <Select value={form.client} invalid={!!errors.client} onChange={e => setForm({ ...form, client: e.target.value })} options={CLIENTS} placeholder="Select Client" />
          </Field>
          <Field label="AWB" required error={errors.awb}>
            <TextInput value={form.awb} invalid={!!errors.awb} onChange={e => setForm({ ...form, awb: e.target.value })} placeholder="e.g. BD-20240101" />
          </Field>
          <Field label="Boxes" required error={errors.boxes}>
            <TextInput value={form.boxes} invalid={!!errors.boxes} onChange={e => setForm({ ...form, boxes: e.target.value })} placeholder="e.g. 5" inputMode="numeric" />
          </Field>
          <Field label="Weight (kg)" required error={errors.weight}>
            <TextInput value={form.weight} invalid={!!errors.weight} onChange={e => setForm({ ...form, weight: e.target.value })} placeholder="e.g. 28" inputMode="decimal" />
          </Field>
          <Field label="Courier" required error={errors.courier}>
            <Select value={form.courier} invalid={!!errors.courier} onChange={e => setForm({ ...form, courier: e.target.value })} options={COURIERS} placeholder="Select Courier" />
          </Field>
          <Field label="Pickup Slot" required error={errors.pickupSlot}>
            <Select value={form.pickupSlot} invalid={!!errors.pickupSlot} onChange={e => setForm({ ...form, pickupSlot: e.target.value })} options={SLOTS} placeholder="Select Slot" />
          </Field>
          <Field label="Ship To" required error={errors.shipTo}>
            <Select value={form.shipTo} invalid={!!errors.shipTo} onChange={e => setForm({ ...form, shipTo: e.target.value })} options={CITIES} placeholder="Select Destination" />
          </Field>
          <Field label="SLA Date" required error={errors.sla}>
            <TextInput type="date" value={form.sla} invalid={!!errors.sla} onChange={e => setForm({ ...form, sla: e.target.value })} />
          </Field>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Staged shipment detail"
        footer={
          <>
            <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Close</button>
            <button onClick={() => detail && dispatch(detail)} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">Mark Dispatched</button>
          </>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Order ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Client" value={detail.client} />
            <DetailRow label="Boxes" value={detail.boxes} />
            <DetailRow label="Weight" value={detail.weight} />
            <DetailRow label="AWB" value={<span className="font-mono text-brand">{detail.awb}</span>} />
            <DetailRow label="Courier" value={detail.courier} />
            <DetailRow label="Pickup Slot" value={detail.pickupSlot} />
            <DetailRow label="Ship To" value={detail.shipTo} />
            <DetailRow label="SLA" value={detail.sla} />
          </div>
        )}
      </Drawer>

      {/* Hold confirmation */}
      <ConfirmDialog
        open={!!holdTarget}
        onOpenChange={(o) => !o && setHoldTarget(null)}
        title="Hold this shipment?"
        message={`${holdTarget?.id} (${holdTarget?.awb}) will be pulled from the dispatch lane and the courier pickup cancelled.`}
        confirmLabel="Hold Shipment"
        cancelLabel="Keep Staged"
        onConfirm={() => holdTarget && hold(holdTarget)}
      />
    </div>
  )
}
