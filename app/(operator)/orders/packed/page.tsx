"use client"
import { useState } from "react"
import { Search, PackageCheck, Plus, Eye, Barcode, Truck, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type PackedOrder = {
  id: string; client: string; boxes: number; weight: string; packedBy: string
  packedAt: string; sla: string; courier: string; awb: string
}

const initialOrders: PackedOrder[] = [
  { id: "ORD-8780", client: "Acme Foods", boxes: 4, weight: "22kg", packedBy: "Priya Sharma", packedAt: "2024-07-20 10:30", sla: "2024-07-20 18:00", courier: "BlueDart", awb: "" },
  { id: "ORD-8778", client: "Global Oils", boxes: 2, weight: "18kg", packedBy: "Meena Patel", packedAt: "2024-07-20 09:45", sla: "2024-07-20 16:00", courier: "DTDC", awb: "" },
  { id: "ORD-8775", client: "Salt Works", boxes: 6, weight: "35kg", packedBy: "Ravi Kumar", packedAt: "2024-07-20 09:00", sla: "2024-07-21 10:00", courier: "FedEx", awb: "FX-88001" },
  { id: "ORD-8772", client: "Agro Corp", boxes: 8, weight: "52kg", packedBy: "Suresh Yadav", packedAt: "2024-07-20 08:40", sla: "2024-07-20 19:00", courier: "Delhivery", awb: "DL-88012" },
  { id: "ORD-8770", client: "Sweet Mills", boxes: 3, weight: "14kg", packedBy: "Arjun Nair", packedAt: "2024-07-20 08:15", sla: "2024-07-21 12:00", courier: "Ecom Express", awb: "" },
  { id: "ORD-8768", client: "Fresh Farms", boxes: 5, weight: "27kg", packedBy: "Priya Sharma", packedAt: "2024-07-20 07:50", sla: "2024-07-20 17:30", courier: "BlueDart", awb: "BD-88023" },
  { id: "ORD-8766", client: "Acme Foods", boxes: 2, weight: "11kg", packedBy: "Meena Patel", packedAt: "2024-07-20 07:20", sla: "2024-07-21 09:30", courier: "DTDC", awb: "DT-88034" },
  { id: "ORD-8764", client: "Global Oils", boxes: 7, weight: "63kg", packedBy: "Ravi Kumar", packedAt: "2024-07-19 22:10", sla: "2024-07-20 20:00", courier: "FedEx", awb: "" },
  { id: "ORD-8762", client: "Salt Works", boxes: 4, weight: "30kg", packedBy: "Suresh Yadav", packedAt: "2024-07-19 21:35", sla: "2024-07-21 14:00", courier: "Delhivery", awb: "DL-88045" },
  { id: "ORD-8760", client: "Agro Corp", boxes: 6, weight: "48kg", packedBy: "Arjun Nair", packedAt: "2024-07-19 20:55", sla: "2024-07-20 16:00", courier: "BlueDart", awb: "BD-88056" },
  { id: "ORD-8758", client: "Sweet Mills", boxes: 1, weight: "6kg", packedBy: "Priya Sharma", packedAt: "2024-07-19 20:10", sla: "2024-07-21 11:00", courier: "Ecom Express", awb: "EE-88067" },
  { id: "ORD-8756", client: "Fresh Farms", boxes: 9, weight: "71kg", packedBy: "Meena Patel", packedAt: "2024-07-19 19:30", sla: "2024-07-20 18:30", courier: "DTDC", awb: "" },
  { id: "ORD-8754", client: "Acme Foods", boxes: 3, weight: "19kg", packedBy: "Ravi Kumar", packedAt: "2024-07-19 18:45", sla: "2024-07-21 10:30", courier: "FedEx", awb: "FX-88078" },
  { id: "ORD-8752", client: "Global Oils", boxes: 5, weight: "44kg", packedBy: "Suresh Yadav", packedAt: "2024-07-19 18:00", sla: "2024-07-20 15:30", courier: "Delhivery", awb: "" },
  { id: "ORD-8750", client: "Salt Works", boxes: 7, weight: "58kg", packedBy: "Arjun Nair", packedAt: "2024-07-19 17:20", sla: "2024-07-21 13:00", courier: "BlueDart", awb: "BD-88089" },
  { id: "ORD-8748", client: "Agro Corp", boxes: 2, weight: "16kg", packedBy: "Priya Sharma", packedAt: "2024-07-19 16:40", sla: "2024-07-20 21:00", courier: "Ecom Express", awb: "EE-88090" },
  { id: "ORD-8746", client: "Sweet Mills", boxes: 4, weight: "23kg", packedBy: "Meena Patel", packedAt: "2024-07-19 15:55", sla: "2024-07-21 15:00", courier: "DTDC", awb: "" },
  { id: "ORD-8744", client: "Fresh Farms", boxes: 6, weight: "39kg", packedBy: "Ravi Kumar", packedAt: "2024-07-19 15:10", sla: "2024-07-20 14:00", courier: "FedEx", awb: "FX-88101" },
  { id: "ORD-8742", client: "Acme Foods", boxes: 8, weight: "66kg", packedBy: "Suresh Yadav", packedAt: "2024-07-19 14:25", sla: "2024-07-21 17:00", courier: "Delhivery", awb: "DL-88112" },
  { id: "ORD-8740", client: "Global Oils", boxes: 3, weight: "25kg", packedBy: "Arjun Nair", packedAt: "2024-07-19 13:40", sla: "2024-07-20 22:00", courier: "BlueDart", awb: "" },
  { id: "ORD-8738", client: "Salt Works", boxes: 5, weight: "41kg", packedBy: "Priya Sharma", packedAt: "2024-07-19 12:55", sla: "2024-07-21 08:30", courier: "Ecom Express", awb: "EE-88123" },
  { id: "ORD-8736", client: "Agro Corp", boxes: 2, weight: "13kg", packedBy: "Meena Patel", packedAt: "2024-07-19 12:10", sla: "2024-07-20 13:30", courier: "DTDC", awb: "DT-88134" },
  { id: "ORD-8734", client: "Sweet Mills", boxes: 7, weight: "54kg", packedBy: "Ravi Kumar", packedAt: "2024-07-19 11:25", sla: "2024-07-21 16:30", courier: "FedEx", awb: "" },
  { id: "ORD-8732", client: "Fresh Farms", boxes: 4, weight: "31kg", packedBy: "Suresh Yadav", packedAt: "2024-07-19 10:40", sla: "2024-07-20 12:00", courier: "Delhivery", awb: "DL-88145" },
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
          <div key={s.label} className="bg-card border border-border rounded-xl p-3">
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
                  <RowActions
                    items={[
                      { label: "View details", icon: <Eye />, onSelect: () => setDetail(o) },
                      ...(!o.awb
                        ? [{ label: "Generate AWB", icon: <Barcode />, onSelect: () => generateAwb(o) }]
                        : []),
                      { label: "Hand over to courier", icon: <Truck />, onSelect: () => handover(o), tone: "success" as const },
                      { label: "Reverse pack", icon: <XCircle />, onSelect: () => setUnpackTarget(o), tone: "danger" as const },
                    ]}
                  />
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
