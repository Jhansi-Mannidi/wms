"use client"
import { useState } from "react"
import { Search, Truck, Plus, Eye, X as XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Receipt = {
  id: string; supplier: string; sku: string; product: string
  qty: number; eta: string; po: string; carrier: string; status: string
}

const initialReceipts: Receipt[] = [
  { id: "ASN-2024-0881", supplier: "Acme Foods Ltd", sku: "SKU-001234", product: "Premium Basmati Rice 5kg", qty: 500, eta: "2024-07-21", po: "PO-88210", carrier: "BlueDart", status: "Due Today" },
  { id: "ASN-2024-0882", supplier: "Global Oils Corp", sku: "SKU-001236", product: "Refined Sunflower Oil 5L", qty: 200, eta: "2024-07-21", po: "PO-88215", carrier: "DTDC", status: "Due Today" },
  { id: "ASN-2024-0883", supplier: "Agro Corp", sku: "SKU-001237", product: "Chickpea Lentils 25kg", qty: 1000, eta: "2024-07-22", po: "PO-88220", carrier: "FedEx", status: "Upcoming" },
  { id: "ASN-2024-0884", supplier: "Salt Works", sku: "SKU-001239", product: "Iodized Salt 1kg", qty: 5000, eta: "2024-07-23", po: "PO-88225", carrier: "Delhivery", status: "Upcoming" },
  { id: "ASN-2024-0879", supplier: "Fresh Farms", sku: "SKU-001240", product: "Tomato Puree 400g", qty: 300, eta: "2024-07-19", po: "PO-88200", carrier: "BlueDart", status: "Overdue" },
  { id: "ASN-2024-0875", supplier: "Sweet Mills", sku: "SKU-001238", product: "Brown Sugar 10kg", qty: 600, eta: "2024-07-18", po: "PO-88190", carrier: "Ekart", status: "Received" },
  { id: "ASN-2024-0885", supplier: "Acme Foods Ltd", sku: "SKU-001235", product: "Organic Wheat Flour 10kg", qty: 800, eta: "2024-07-21", po: "PO-88230", carrier: "BlueDart", status: "Due Today" },
  { id: "ASN-2024-0886", supplier: "Sweet Mills", sku: "SKU-001238", product: "Brown Sugar 10kg", qty: 450, eta: "2024-07-21", po: "PO-88232", carrier: "Ekart", status: "Due Today" },
  { id: "ASN-2024-0887", supplier: "Fresh Farms", sku: "SKU-001240", product: "Tomato Puree 400g", qty: 1200, eta: "2024-07-22", po: "PO-88235", carrier: "DTDC", status: "Upcoming" },
  { id: "ASN-2024-0888", supplier: "Agro Corp", sku: "SKU-001237", product: "Chickpea Lentils 25kg", qty: 750, eta: "2024-07-23", po: "PO-88238", carrier: "FedEx", status: "Upcoming" },
  { id: "ASN-2024-0889", supplier: "Global Oils Corp", sku: "SKU-001236", product: "Refined Sunflower Oil 5L", qty: 350, eta: "2024-07-24", po: "PO-88241", carrier: "Delhivery", status: "Upcoming" },
  { id: "ASN-2024-0890", supplier: "Salt Works", sku: "SKU-001239", product: "Iodized Salt 1kg", qty: 6000, eta: "2024-07-24", po: "PO-88244", carrier: "BlueDart", status: "Upcoming" },
  { id: "ASN-2024-0891", supplier: "Acme Foods Ltd", sku: "SKU-001234", product: "Premium Basmati Rice 5kg", qty: 900, eta: "2024-07-25", po: "PO-88247", carrier: "Ekart", status: "Upcoming" },
  { id: "ASN-2024-0892", supplier: "Sweet Mills", sku: "SKU-001238", product: "Brown Sugar 10kg", qty: 520, eta: "2024-07-26", po: "PO-88250", carrier: "DTDC", status: "Upcoming" },
  { id: "ASN-2024-0893", supplier: "Fresh Farms", sku: "SKU-001240", product: "Tomato Puree 400g", qty: 400, eta: "2024-07-26", po: "PO-88253", carrier: "FedEx", status: "Upcoming" },
  { id: "ASN-2024-0894", supplier: "Agro Corp", sku: "SKU-001237", product: "Chickpea Lentils 25kg", qty: 1500, eta: "2024-07-27", po: "PO-88256", carrier: "Delhivery", status: "Upcoming" },
  { id: "ASN-2024-0880", supplier: "Global Oils Corp", sku: "SKU-001236", product: "Refined Sunflower Oil 5L", qty: 250, eta: "2024-07-19", po: "PO-88205", carrier: "DTDC", status: "Overdue" },
  { id: "ASN-2024-0878", supplier: "Agro Corp", sku: "SKU-001237", product: "Chickpea Lentils 25kg", qty: 850, eta: "2024-07-18", po: "PO-88198", carrier: "FedEx", status: "Overdue" },
  { id: "ASN-2024-0877", supplier: "Acme Foods Ltd", sku: "SKU-001235", product: "Organic Wheat Flour 10kg", qty: 600, eta: "2024-07-17", po: "PO-88195", carrier: "BlueDart", status: "Overdue" },
  { id: "ASN-2024-0876", supplier: "Salt Works", sku: "SKU-001239", product: "Iodized Salt 1kg", qty: 4000, eta: "2024-07-17", po: "PO-88192", carrier: "Delhivery", status: "Received" },
  { id: "ASN-2024-0874", supplier: "Fresh Farms", sku: "SKU-001240", product: "Tomato Puree 400g", qty: 320, eta: "2024-07-16", po: "PO-88186", carrier: "Ekart", status: "Received" },
  { id: "ASN-2024-0873", supplier: "Acme Foods Ltd", sku: "SKU-001234", product: "Premium Basmati Rice 5kg", qty: 1100, eta: "2024-07-16", po: "PO-88183", carrier: "BlueDart", status: "Received" },
  { id: "ASN-2024-0872", supplier: "Global Oils Corp", sku: "SKU-001236", product: "Refined Sunflower Oil 5L", qty: 480, eta: "2024-07-15", po: "PO-88180", carrier: "DTDC", status: "Received" },
  { id: "ASN-2024-0871", supplier: "Agro Corp", sku: "SKU-001237", product: "Chickpea Lentils 25kg", qty: 2000, eta: "2024-07-15", po: "PO-88177", carrier: "FedEx", status: "Received" },
  { id: "ASN-2024-0870", supplier: "Sweet Mills", sku: "SKU-001238", product: "Brown Sugar 10kg", qty: 700, eta: "2024-07-14", po: "PO-88174", carrier: "Ekart", status: "Cancelled" },
  { id: "ASN-2024-0869", supplier: "Salt Works", sku: "SKU-001239", product: "Iodized Salt 1kg", qty: 3500, eta: "2024-07-13", po: "PO-88171", carrier: "Delhivery", status: "Cancelled" },
]

const statusStyle: Record<string, string> = {
  "Due Today": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Upcoming: "bg-muted text-muted-foreground",
  Overdue: "bg-danger/10 text-danger",
  Received: "bg-success/10 text-success",
  Cancelled: "bg-danger/10 text-danger",
}

const CARRIERS = ["BlueDart", "DTDC", "FedEx", "Delhivery", "Ekart"] as const
const STATUSES = ["Due Today", "Upcoming", "Overdue"] as const

const emptyForm = { supplier: "", sku: "", product: "", qty: "", eta: "", po: "", carrier: "", status: "" }

export default function ExpectedReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>(initialReceipts)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Receipt | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Receipt | null>(null)

  const filtered = receipts.filter(r =>
    (statusFilter === "All" || r.status === statusFilter) &&
    (r.id.toLowerCase().includes(search.toLowerCase()) || r.supplier.toLowerCase().includes(search.toLowerCase()) || r.product.toLowerCase().includes(search.toLowerCase()))
  )

  const stats = [
    { label: "Due Today", value: String(receipts.filter(r => r.status === "Due Today").length), cls: "text-blue-600" },
    { label: "Upcoming (7d)", value: String(receipts.filter(r => r.status === "Upcoming").length) },
    { label: "Overdue", value: String(receipts.filter(r => r.status === "Overdue").length), cls: "text-danger" },
    { label: "Received Today", value: String(receipts.filter(r => r.status === "Received").length), cls: "text-success" },
  ]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.supplier.trim()) e.supplier = "Supplier is required"
    if (!form.sku.trim()) e.sku = "SKU is required"
    if (!form.product.trim()) e.product = "Product name is required"
    if (!form.qty.trim()) e.qty = "Quantity is required"
    else if (!/^\d+$/.test(form.qty) || Number(form.qty) < 1) e.qty = "Enter a positive whole number"
    if (!form.eta.trim()) e.eta = "ETA is required"
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.eta.trim())) e.eta = "Use format YYYY-MM-DD"
    if (!form.po.trim()) e.po = "PO number is required"
    if (!form.carrier) e.carrier = "Select a carrier"
    if (!form.status) e.status = "Select a status"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createReceipt() {
    if (!validate()) return
    const maxSeq = receipts.reduce((m, r) => Math.max(m, Number(r.id.slice(-4)) || 0), 0)
    const next: Receipt = {
      id: `ASN-2024-${String(maxSeq + 1).padStart(4, "0")}`,
      supplier: form.supplier.trim(),
      sku: form.sku.trim(),
      product: form.product.trim(),
      qty: Number(form.qty),
      eta: form.eta.trim(),
      po: form.po.trim().toUpperCase(),
      carrier: form.carrier,
      status: form.status,
    }
    setReceipts(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("ASN created", `${next.id} — ${next.qty.toLocaleString()} units from ${next.supplier}`)
  }

  function markReceived(r: Receipt) {
    setReceipts(prev => prev.map(x => x.id === r.id ? { ...x, status: "Received" } : x))
    notify.success("Shipment received", `${r.id} booked in from ${r.supplier}.`)
  }

  function cancelReceipt(r: Receipt) {
    setReceipts(prev => prev.map(x => x.id === r.id ? { ...x, status: "Cancelled" } : x))
    notify.warning("ASN cancelled", `${r.id} has been cancelled.`)
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Expected Receipts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Upcoming and overdue inbound shipments</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="expected-receipts" />
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> Add ASN</button>
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
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ASN, supplier, product..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
        </div>
        {["All", "Due Today", "Upcoming", "Overdue", "Received"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", statusFilter === s ? "bg-brand text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground")}>{s}</button>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>{["ASN ID", "Supplier", "Product", "Qty", "ETA", "PO Number", "Carrier", "Status", "Actions"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{r.id}</td>
                <td className="px-4 py-3 text-foreground">{r.supplier}</td>
                <td className="px-4 py-3"><p className="text-xs text-brand font-mono">{r.sku}</p><p className="text-xs text-foreground">{r.product}</p></td>
                <td className="px-4 py-3 font-semibold text-foreground">{r.qty.toLocaleString()}</td>
                <td className="px-4 py-3 text-foreground">{r.eta}</td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{r.po}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.carrier}</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusStyle[r.status])}>{r.status}</span></td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: "View details", icon: <Eye />, onSelect: () => setDetail(r) },
                      ...(r.status !== "Received" && r.status !== "Cancelled"
                        ? [
                            { label: "Mark as received", icon: <Truck />, onSelect: () => markReceived(r), tone: "success" as const },
                            { label: "Cancel ASN", icon: <XIcon />, onSelect: () => setCancelTarget(r), tone: "danger" as const },
                          ]
                        : []),
                    ]}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">No expected receipts match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create ASN */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="Add ASN"
        description="Register an expected inbound shipment"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createReceipt} submitLabel="Create ASN" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Supplier" required error={errors.supplier}>
            <TextInput value={form.supplier} invalid={!!errors.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} placeholder="e.g. Acme Foods Ltd" />
          </Field>
          <Field label="SKU Code" required error={errors.sku}>
            <TextInput value={form.sku} invalid={!!errors.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. SKU-001234" />
          </Field>
          <Field label="Product Name" required error={errors.product}>
            <TextInput value={form.product} invalid={!!errors.product} onChange={e => setForm({ ...form, product: e.target.value })} placeholder="e.g. Premium Basmati Rice 5kg" />
          </Field>
          <Field label="Quantity" required error={errors.qty}>
            <TextInput value={form.qty} invalid={!!errors.qty} onChange={e => setForm({ ...form, qty: e.target.value })} placeholder="e.g. 500" inputMode="numeric" />
          </Field>
          <Field label="ETA" required error={errors.eta} hint="YYYY-MM-DD">
            <TextInput value={form.eta} invalid={!!errors.eta} onChange={e => setForm({ ...form, eta: e.target.value })} placeholder="2024-07-21" />
          </Field>
          <Field label="PO Number" required error={errors.po}>
            <TextInput value={form.po} invalid={!!errors.po} onChange={e => setForm({ ...form, po: e.target.value })} placeholder="e.g. PO-88210" />
          </Field>
          <Field label="Carrier" required error={errors.carrier}>
            <Select value={form.carrier} invalid={!!errors.carrier} onChange={e => setForm({ ...form, carrier: e.target.value })} options={CARRIERS} placeholder="Select Carrier" />
          </Field>
          <Field label="Status" required error={errors.status}>
            <Select value={form.status} invalid={!!errors.status} onChange={e => setForm({ ...form, status: e.target.value })} options={STATUSES} placeholder="Select Status" />
          </Field>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Expected receipt detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="ASN ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Supplier" value={detail.supplier} />
            <DetailRow label="SKU" value={<span className="font-mono">{detail.sku}</span>} />
            <DetailRow label="Product" value={detail.product} />
            <DetailRow label="Quantity" value={`${detail.qty.toLocaleString()} units`} />
            <DetailRow label="ETA" value={detail.eta} />
            <DetailRow label="PO Number" value={<span className="font-mono">{detail.po}</span>} />
            <DetailRow label="Carrier" value={detail.carrier} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusStyle[detail.status])}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Cancel confirmation */}
      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(o) => !o && setCancelTarget(null)}
        title="Cancel this ASN?"
        message={`ASN ${cancelTarget?.id} for ${cancelTarget?.qty.toLocaleString()} units from ${cancelTarget?.supplier} will be cancelled. This cannot be undone.`}
        confirmLabel="Cancel ASN"
        cancelLabel="Keep It"
        onConfirm={() => cancelTarget && cancelReceipt(cancelTarget)}
      />
    </div>
  )
}
