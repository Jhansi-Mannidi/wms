"use client"
import { useState } from "react"
import { Search, PackageCheck, Plus, Eye, Barcode, Truck, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type PackedOrder = {
  id: string; client: string; boxes: number; weight: string; packedBy: string
  packedAt: string; sla: string; courier: string; awb: string
}

const initialOrders: PackedOrder[] = [
  { id: "ORD-8780", client: "Acme Foods", boxes: 4, weight: "22kg", packedBy: "Priya Sharma", packedAt: "2024-07-20 10:30", sla: "2024-07-20 18:00", courier: "BlueDart", awb: "" },
  { id: "ORD-8778", client: "Global Oils", boxes: 2, weight: "18kg", packedBy: "Meena Patel", packedAt: "2024-07-20 09:45", sla: "2024-07-20 16:00", courier: "DTDC", awb: "" },
  { id: "ORD-8775", client: "Salt Works", boxes: 6, weight: "35kg", packedBy: "Ravi Kumar", packedAt: "2024-07-20 09:00", sla: "2024-07-21 10:00", courier: "FedEx", awb: "FX-88001" },
]

const CLIENTS = ["Acme Foods", "Global Oils", "Salt Works", "Agro Corp", "Sweet Mills", "Fresh Farms"] as const
const PACKERS = ["Priya Sharma", "Meena Patel", "Ravi Kumar", "Suresh Yadav", "Arjun Nair"] as const
const COURIERS = ["BlueDart", "DTDC", "FedEx", "Delhivery", "Ecom Express"] as const

/** AWB prefix per courier, used when generating a waybill number. */
const AWB_PREFIX: Record<string, string> = { BlueDart: "BD", DTDC: "DT", FedEx: "FX", Delhivery: "DL", "Ecom Express": "EE" }

const emptyForm = { client: "", boxes: "", weight: "", packedBy: "", courier: "", sla: "" }

export default function PackedOrdersPage() {
  const [orders, setOrders] = useState<PackedOrder[]>(initialOrders)
  const [search, setSearch] = useState("")

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<PackedOrder | null>(null)
  const [unpackTarget, setUnpackTarget] = useState<PackedOrder | null>(null)

  const filtered = orders.filter(o => o.id.toLowerCase().includes(search.toLowerCase()) || o.client.toLowerCase().includes(search.toLowerCase()))

  const stats = [
    { label: "Packed Today", value: String(orders.length) },
    { label: "Awaiting AWB", value: String(orders.filter(o => !o.awb).length), cls: "text-amber-600" },
    { label: "AWB Generated", value: String(orders.filter(o => o.awb).length) },
    { label: "Total Boxes", value: String(orders.reduce((s, o) => s + o.boxes, 0)) },
  ]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.client) e.client = "Select a client"
    if (!form.boxes.trim()) e.boxes = "Box count is required"
    else if (!/^\d+$/.test(form.boxes) || Number(form.boxes) < 1) e.boxes = "Enter a positive whole number"
    if (!form.weight.trim()) e.weight = "Weight is required"
    else if (!/^\d+(\.\d+)?$/.test(form.weight)) e.weight = "Enter a number in kg"
    if (!form.packedBy) e.packedBy = "Select a packer"
    if (!form.courier) e.courier = "Select a courier"
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
    const now = new Date()
    const next: PackedOrder = {
      id: `ORD-${Math.max(8780, ...nums) + 1}`,
      client: form.client,
      boxes: Number(form.boxes),
      weight: `${form.weight}kg`,
      packedBy: form.packedBy,
      packedAt: `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`,
      sla: `${form.sla} 18:00`,
      courier: form.courier,
      awb: "",
    }
    setOrders(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Pack recorded", `${next.id} packed into ${next.boxes} boxes.`)
  }

  function generateAwb(o: PackedOrder) {
    if (o.awb) {
      notify.info("AWB already issued", `${o.id} carries waybill ${o.awb}.`)
      return
    }
    const awb = `${AWB_PREFIX[o.courier] ?? "XX"}-${88000 + orders.length + Math.floor(Math.random() * 900)}`
    setOrders(prev => prev.map(x => x.id === o.id ? { ...x, awb } : x))
    notify.success("AWB generated", `${o.id} → ${awb} (${o.courier}).`)
  }

  function handover(o: PackedOrder) {
    if (!o.awb) {
      notify.warning("AWB required", `Generate a waybill for ${o.id} before handover.`)
      return
    }
    setOrders(prev => prev.filter(x => x.id !== o.id))
    setDetail(null)
    notify.success("Handed to courier", `${o.id} dispatched via ${o.courier}.`)
  }

  function unpack(o: PackedOrder) {
    setOrders(prev => prev.filter(x => x.id !== o.id))
    notify.warning("Pack reversed", `${o.id} returned to packing.`)
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold text-foreground">Packed Orders</h1><p className="text-sm text-muted-foreground mt-0.5">Orders packed and awaiting courier pickup</p></div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="packed-orders" />
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
            <Plus className="w-4 h-4" /> Record Pack
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn("text-2xl font-bold mt-1", s.cls || "text-foreground")}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order ID, client..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>{["Order ID", "Client", "Boxes", "Weight", "Packed By", "Packed At", "SLA", "Courier", "AWB", "Actions"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(o => (
              <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{o.id}</td>
                <td className="px-4 py-3 text-foreground">{o.client}</td>
                <td className="px-4 py-3 text-foreground">{o.boxes}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.weight}</td>
                <td className="px-4 py-3 text-foreground">{o.packedBy}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.packedAt}</td>
                <td className="px-4 py-3 text-foreground">{o.sla}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.courier}</td>
                <td className="px-4 py-3 font-mono text-xs text-brand">{o.awb || <span className="text-amber-600">Pending</span>}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setDetail(o)} title="View details" className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                    {!o.awb && (
                      <button onClick={() => generateAwb(o)} title="Generate AWB" className="p-1.5 rounded-md text-brand hover:bg-brand/10 transition-colors"><Barcode className="w-3.5 h-3.5" /></button>
                    )}
                    <button onClick={() => handover(o)} title="Hand over to courier" className="p-1.5 rounded-md text-success hover:bg-success/10 transition-colors"><Truck className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setUnpackTarget(o)} title="Reverse pack" className="p-1.5 rounded-md text-danger hover:bg-danger/10 transition-colors"><XCircle className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-10 text-center text-sm text-muted-foreground">No packed orders match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Record pack */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="Record a Pack"
        description="Log a newly packed order awaiting AWB"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createOrder} submitLabel="Record Pack" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Client" required error={errors.client}>
            <Select value={form.client} invalid={!!errors.client} onChange={e => setForm({ ...form, client: e.target.value })} options={CLIENTS} placeholder="Select Client" />
          </Field>
          <Field label="Packed By" required error={errors.packedBy}>
            <Select value={form.packedBy} invalid={!!errors.packedBy} onChange={e => setForm({ ...form, packedBy: e.target.value })} options={PACKERS} placeholder="Select Packer" />
          </Field>
          <Field label="Boxes" required error={errors.boxes}>
            <TextInput value={form.boxes} invalid={!!errors.boxes} onChange={e => setForm({ ...form, boxes: e.target.value })} placeholder="e.g. 4" inputMode="numeric" />
          </Field>
          <Field label="Weight (kg)" required error={errors.weight}>
            <TextInput value={form.weight} invalid={!!errors.weight} onChange={e => setForm({ ...form, weight: e.target.value })} placeholder="e.g. 22" inputMode="decimal" />
          </Field>
          <Field label="Courier" required error={errors.courier}>
            <Select value={form.courier} invalid={!!errors.courier} onChange={e => setForm({ ...form, courier: e.target.value })} options={COURIERS} placeholder="Select Courier" />
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
        description="Packed order detail"
        footer={
          <>
            <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Close</button>
            {detail && !detail.awb && (
              <button onClick={() => generateAwb(detail)} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">Generate AWB</button>
            )}
          </>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Order ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Client" value={detail.client} />
            <DetailRow label="Boxes" value={detail.boxes} />
            <DetailRow label="Weight" value={detail.weight} />
            <DetailRow label="Packed By" value={detail.packedBy} />
            <DetailRow label="Packed At" value={detail.packedAt} />
            <DetailRow label="SLA" value={detail.sla} />
            <DetailRow label="Courier" value={detail.courier} />
            <DetailRow label="AWB" value={detail.awb ? <span className="font-mono text-brand">{detail.awb}</span> : <span className="text-amber-600">Pending</span>} />
          </div>
        )}
      </Drawer>

      {/* Reverse-pack confirmation */}
      <ConfirmDialog
        open={!!unpackTarget}
        onOpenChange={(o) => !o && setUnpackTarget(null)}
        title="Reverse this pack?"
        message={`${unpackTarget?.id} (${unpackTarget?.boxes} boxes) will be sent back to packing and any AWB voided.`}
        confirmLabel="Reverse Pack"
        cancelLabel="Keep It"
        onConfirm={() => unpackTarget && unpack(unpackTarget)}
      />
    </div>
  )
}
