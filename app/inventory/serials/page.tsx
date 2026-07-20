"use client"
import { useState } from "react"
import { Search, Hash, Plus, Eye, Pencil, Trash2, PackageCheck, Truck, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Serial = {
  serial: string; sku: string; product: string; client: string
  received: string; location: string; orderId: string; status: string
}

const initialSerials: Serial[] = [
  { serial: "SN-AC-20240101", sku: "SKU-002001", product: "Industrial Scanner", client: "Acme Foods", received: "2024-01-15", location: "C-01-01", orderId: "", status: "In Stock" },
  { serial: "SN-AC-20240102", sku: "SKU-002001", product: "Industrial Scanner", client: "Acme Foods", received: "2024-01-15", location: "", orderId: "ORD-8821", status: "Allocated" },
  { serial: "SN-GL-20240201", sku: "SKU-002045", product: "Cold Chain Logger", client: "Global Oils", received: "2024-02-10", location: "D-02-04", orderId: "", status: "In Stock" },
  { serial: "SN-GL-20240202", sku: "SKU-002045", product: "Cold Chain Logger", client: "Global Oils", received: "2024-02-10", location: "", orderId: "ORD-8845", status: "Shipped" },
  { serial: "SN-AG-20240301", sku: "SKU-002100", product: "Weighing Scale 500kg", client: "Agro Corp", received: "2024-03-05", location: "A-06-02", orderId: "", status: "In Stock" },
  { serial: "SN-SW-20240401", sku: "SKU-002200", product: "Pallet Jack Electric", client: "Sweet Mills", received: "2024-04-01", location: "", orderId: "ORD-9001", status: "In Transit" },
  { serial: "SN-SW-20240402", sku: "SKU-002200", product: "Pallet Jack Electric", client: "Sweet Mills", received: "2024-04-01", location: "B-03-01", orderId: "", status: "In Stock" },
]

const statusColor: Record<string, string> = {
  "In Stock": "bg-success/10 text-success",
  Allocated: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Shipped: "bg-muted text-muted-foreground",
  "In Transit": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
}

const CLIENTS = ["Acme Foods", "Global Oils", "Agro Corp", "Sweet Mills", "Salt Works", "Fresh Farms"] as const

const emptyForm = { serial: "", sku: "", product: "", client: "", received: "", location: "" }
type SerialForm = typeof emptyForm

export default function SerialTrackingPage() {
  const [serials, setSerials] = useState<Serial[]>(initialSerials)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Serial | null>(null)
  const [form, setForm] = useState<SerialForm>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [allocTarget, setAllocTarget] = useState<Serial | null>(null)
  const [allocOrder, setAllocOrder] = useState("")
  const [allocError, setAllocError] = useState("")

  const [detail, setDetail] = useState<Serial | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Serial | null>(null)

  const filtered = serials.filter(s =>
    (statusFilter === "All" || s.status === statusFilter) &&
    (s.serial.toLowerCase().includes(search.toLowerCase()) ||
      s.product.toLowerCase().includes(search.toLowerCase()) ||
      s.sku.toLowerCase().includes(search.toLowerCase()))
  )

  const stats = [
    { label: "Total Serials", value: serials.length, sub: "registered items" },
    { label: "In Stock", value: serials.filter(s => s.status === "In Stock").length, sub: "available to allocate" },
    { label: "Allocated", value: serials.filter(s => s.status === "Allocated").length, sub: "to open orders" },
    { label: "In Transit", value: serials.filter(s => s.status === "In Transit").length, sub: "currently moving" },
  ]

  function validate(isEdit: boolean) {
    const e: Record<string, string> = {}
    if (!form.serial.trim()) e.serial = "Serial number is required"
    else if (!isEdit && serials.some(s => s.serial.toLowerCase() === form.serial.trim().toLowerCase())) {
      e.serial = "This serial number already exists"
    }
    if (!form.sku.trim()) e.sku = "SKU is required"
    if (!form.product.trim()) e.product = "Product name is required"
    if (!form.client) e.client = "Select a client"
    if (!form.received) e.received = "Received date is required"
    if (!form.location.trim()) e.location = "Storage location is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function closeForms() {
    setCreateOpen(false)
    setEditTarget(null)
    setForm(emptyForm)
    setErrors({})
  }

  function createSerial() {
    if (!validate(false)) return
    const next: Serial = {
      serial: form.serial.trim().toUpperCase(),
      sku: form.sku.trim(),
      product: form.product.trim(),
      client: form.client,
      received: form.received,
      location: form.location.trim().toUpperCase(),
      orderId: "",
      status: "In Stock",
    }
    setSerials(prev => [next, ...prev])
    closeForms()
    notify.success("Serial registered", `${next.serial} received into ${next.location}.`)
  }

  function openEdit(s: Serial) {
    setEditTarget(s)
    setErrors({})
    setForm({
      serial: s.serial, sku: s.sku, product: s.product,
      client: s.client, received: s.received, location: s.location,
    })
  }

  function saveEdit() {
    if (!editTarget || !validate(true)) return
    const updated: Serial = {
      ...editTarget,
      serial: form.serial.trim().toUpperCase(),
      sku: form.sku.trim(),
      product: form.product.trim(),
      client: form.client,
      received: form.received,
      location: form.location.trim().toUpperCase(),
    }
    setSerials(prev => prev.map(s => s.serial === editTarget.serial ? updated : s))
    closeForms()
    notify.success("Serial updated", `${updated.serial} details saved.`)
  }

  function allocate() {
    if (!allocTarget) return
    const order = allocOrder.trim().toUpperCase()
    if (!order) { setAllocError("Order reference is required"); return }
    if (!/^ORD-\d{3,}$/.test(order)) { setAllocError("Use the format ORD-1234"); return }
    setSerials(prev => prev.map(s => s.serial === allocTarget.serial
      ? { ...s, status: "Allocated", orderId: order, location: "" } : s))
    notify.success("Serial allocated", `${allocTarget.serial} reserved for ${order}.`)
    setAllocTarget(null)
    setAllocOrder("")
    setAllocError("")
  }

  function advance(s: Serial) {
    const nextStatus = s.status === "Allocated" ? "In Transit" : "Shipped"
    setSerials(prev => prev.map(x => x.serial === s.serial ? { ...x, status: nextStatus } : x))
    notify.success(`Serial ${nextStatus.toLowerCase()}`, `${s.serial} moved to ${nextStatus}${s.orderId ? ` for ${s.orderId}` : ""}.`)
  }

  function deleteSerial(s: Serial) {
    setSerials(prev => prev.filter(x => x.serial !== s.serial))
    notify.success("Serial deleted", `${s.serial} has been removed from the register.`)
  }

  const formFields = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Serial Number" required error={errors.serial}>
        <TextInput value={form.serial} invalid={!!errors.serial} onChange={e => setForm({ ...form, serial: e.target.value })} placeholder="e.g. SN-AC-20240103" />
      </Field>
      <Field label="SKU Code" required error={errors.sku}>
        <TextInput value={form.sku} invalid={!!errors.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. SKU-002001" />
      </Field>
      <Field label="Product Name" required error={errors.product}>
        <TextInput value={form.product} invalid={!!errors.product} onChange={e => setForm({ ...form, product: e.target.value })} placeholder="e.g. Industrial Scanner" />
      </Field>
      <Field label="Client" required error={errors.client}>
        <Select value={form.client} invalid={!!errors.client} onChange={e => setForm({ ...form, client: e.target.value })} options={CLIENTS} placeholder="Select Client" />
      </Field>
      <Field label="Received Date" required error={errors.received}>
        <TextInput type="date" value={form.received} invalid={!!errors.received} onChange={e => setForm({ ...form, received: e.target.value })} />
      </Field>
      <Field label="Storage Location" required error={errors.location}>
        <TextInput value={form.location} invalid={!!errors.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. C-01-01" />
      </Field>
    </div>
  )

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Serial Tracking</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track serialised items through the warehouse lifecycle</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="serial-tracking" />
          <button
            onClick={() => { setForm(emptyForm); setErrors({}); setCreateOpen(true) }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Register Serial
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search serial number, SKU, product..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
        </div>
        {["All", "In Stock", "Allocated", "Shipped", "In Transit"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", statusFilter === s ? "bg-brand text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground")}>{s}</button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              {["Serial No.", "SKU / Product", "Client", "Received", "Location", "Order", "Status", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((s) => (
              <tr key={s.serial} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{s.serial}</td>
                <td className="px-4 py-3"><p className="text-xs text-brand font-mono">{s.sku}</p><p className="text-xs text-foreground">{s.product}</p></td>
                <td className="px-4 py-3 text-muted-foreground">{s.client}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.received}</td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{s.location || "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-brand">{s.orderId || "—"}</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusColor[s.status])}>{s.status}</span></td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: "View details", icon: <Eye />, onSelect: () => setDetail(s) },
                      { label: "Edit serial", icon: <Pencil />, onSelect: () => openEdit(s) },
                      ...(s.status === "In Stock"
                        ? [{ label: "Allocate to order", icon: <PackageCheck />, onSelect: () => { setAllocTarget(s); setAllocOrder(""); setAllocError("") } }]
                        : []),
                      ...(s.status === "Allocated"
                        ? [{ label: "Mark in transit", icon: <Truck />, onSelect: () => advance(s) }]
                        : []),
                      ...(s.status === "In Transit"
                        ? [{ label: "Mark shipped", icon: <Check />, onSelect: () => advance(s), tone: "success" as const }]
                        : []),
                      { label: "Delete serial", icon: <Trash2 />, onSelect: () => setDeleteTarget(s), tone: "danger" as const },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  <Hash className="w-5 h-5 mx-auto mb-2 opacity-50" />
                  No serial numbers match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Register serial */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { if (!o) closeForms(); else setCreateOpen(true) }}
        title="Register Serial"
        description="Add a serialised item to the warehouse register"
        footer={<ModalActions onCancel={closeForms} onSubmit={createSerial} submitLabel="Register" />}
      >
        {formFields}
      </Modal>

      {/* Edit serial */}
      <Modal
        open={!!editTarget}
        onOpenChange={(o) => { if (!o) closeForms() }}
        title={`Edit ${editTarget?.serial ?? ""}`}
        description="Update serialised item details"
        footer={<ModalActions onCancel={closeForms} onSubmit={saveEdit} submitLabel="Save Changes" />}
      >
        {formFields}
      </Modal>

      {/* Allocate to order */}
      <Modal
        open={!!allocTarget}
        onOpenChange={(o) => { if (!o) { setAllocTarget(null); setAllocOrder(""); setAllocError("") } }}
        title="Allocate Serial"
        description={allocTarget ? `${allocTarget.serial} — ${allocTarget.product}` : ""}
        size="sm"
        footer={<ModalActions onCancel={() => { setAllocTarget(null); setAllocOrder(""); setAllocError("") }} onSubmit={allocate} submitLabel="Allocate" />}
      >
        <Field label="Order Reference" required error={allocError} hint="The item is reserved and leaves its bin location">
          <TextInput value={allocOrder} invalid={!!allocError} onChange={e => { setAllocOrder(e.target.value); setAllocError("") }} placeholder="e.g. ORD-8821" />
        </Field>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.serial ?? ""}
        description="Serialised item detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Serial No." value={<span className="font-mono text-brand">{detail.serial}</span>} />
            <DetailRow label="SKU" value={<span className="font-mono">{detail.sku}</span>} />
            <DetailRow label="Product" value={detail.product} />
            <DetailRow label="Client" value={detail.client} />
            <DetailRow label="Received" value={detail.received} />
            <DetailRow label="Location" value={<span className="font-mono">{detail.location || "—"}</span>} />
            <DetailRow label="Order" value={<span className="font-mono text-brand">{detail.orderId || "—"}</span>} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusColor[detail.status])}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this serial?"
        message={`Serial ${deleteTarget?.serial} (${deleteTarget?.product}) will be permanently removed from the register. This cannot be undone.`}
        confirmLabel="Delete Serial"
        cancelLabel="Keep It"
        onConfirm={() => deleteTarget && deleteSerial(deleteTarget)}
      />
    </div>
  )
}
