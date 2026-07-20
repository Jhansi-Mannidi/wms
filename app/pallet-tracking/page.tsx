"use client"

import { useState } from "react"
import {
  Box, MapPin, Clock, CheckCircle2, AlertTriangle,
  Plus, Search, ChevronDown, Eye, MoreHorizontal, QrCode, RefreshCw, Trash2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Pallet = {
  id: string; sku: string; product: string; client: string; location: string
  qty: number; weight: string; status: string; type: string; created: string; age: string
}

const initialPallets: Pallet[] = [
  { id: "PLT-2024-0890", sku: "SKU-001234", product: "Premium Basmati Rice 5kg", client: "Acme Foods", location: "A-12-03-L1", qty: 50, weight: "250 kg", status: "Stored", type: "Euro", created: "2024-12-10", age: "6 days" },
  { id: "PLT-2024-0889", sku: "SKU-001235", product: "Organic Wheat Flour 10kg", client: "Acme Foods", location: "A-12-04-L2", qty: 40, weight: "400 kg", status: "Stored", type: "Standard", created: "2024-12-12", age: "4 days" },
  { id: "PLT-2024-0888", sku: "SKU-001236", product: "Refined Sunflower Oil 5L", client: "Global Oils", location: "B-05-01-L1", qty: 30, weight: "180 kg", status: "In Transit", type: "Euro", created: "2024-12-14", age: "2 days" },
  { id: "PLT-2024-0887", sku: "SKU-001237", product: "Chickpea Lentils 25kg", client: "Agro Corp", location: "Staging Area", qty: 20, weight: "500 kg", status: "Staging", type: "Standard", created: "2024-12-15", age: "1 day" },
  { id: "PLT-2024-0886", sku: "SKU-001239", product: "Iodized Salt 1kg", client: "Salt Works", location: "C-03-07-L3", qty: 100, weight: "100 kg", status: "Stored", type: "Half", created: "2024-12-08", age: "8 days" },
  { id: "PLT-2024-0885", sku: "SKU-001240", product: "Tomato Puree 400g", client: "Fresh Farms", location: "D-01-05-L1", qty: 60, weight: "144 kg", status: "Reserved", type: "Euro", created: "2024-12-13", age: "3 days" },
  { id: "PLT-2024-0884", sku: "SKU-001241", product: "Coconut Milk 400ml", client: "Tropical Co", location: "D-02-03-L2", qty: 80, weight: "192 kg", status: "Damaged", type: "Standard", created: "2024-12-11", age: "5 days" },
]

const statusConfig: Record<string, { color: string; bg: string }> = {
  Stored: { color: "text-success", bg: "bg-success/15" },
  "In Transit": { color: "text-brand", bg: "bg-brand/15" },
  Staging: { color: "text-warning", bg: "bg-warning/15" },
  Reserved: { color: "text-purple-400", bg: "bg-purple-400/15" },
  Damaged: { color: "text-danger", bg: "bg-danger/15" },
}

const STATUSES = ["Stored", "In Transit", "Staging", "Reserved", "Damaged"] as const
const TYPES = ["Euro", "Standard", "Half"] as const
const CLIENTS = ["Acme Foods", "Global Oils", "Agro Corp", "Salt Works", "Fresh Farms", "Tropical Co"] as const

const PAGE_SIZE = 5

const emptyForm = { sku: "", product: "", client: "", location: "", qty: "", weight: "", type: "", status: "" }

export default function PalletTrackingPage() {
  const [pallets, setPallets] = useState<Pallet[]>(initialPallets)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [clientFilter, setClientFilter] = useState("All Clients")
  const [page, setPage] = useState(1)

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [scanOpen, setScanOpen] = useState(false)
  const [scanCode, setScanCode] = useState("")
  const [scanError, setScanError] = useState("")

  const [detail, setDetail] = useState<Pallet | null>(null)
  const [moveTarget, setMoveTarget] = useState<Pallet | null>(null)
  const [moveForm, setMoveForm] = useState({ location: "", status: "" })
  const [moveErrors, setMoveErrors] = useState<Record<string, string>>({})
  const [deleteTarget, setDeleteTarget] = useState<Pallet | null>(null)

  const filtered = pallets.filter((p) => {
    const q = search.toLowerCase()
    return (
      (p.id.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.product.toLowerCase().includes(q)) &&
      (statusFilter === "All Status" || p.status === statusFilter) &&
      (clientFilter === "All Clients" || p.client === clientFilter)
    )
  })

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function resetPaging<T>(setter: (v: T) => void) {
    return (v: T) => { setter(v); setPage(1) }
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.sku.trim()) e.sku = "SKU is required"
    if (!form.product.trim()) e.product = "Product name is required"
    if (!form.client) e.client = "Select a client"
    if (!form.location.trim()) e.location = "Location is required"
    if (!form.qty.trim()) e.qty = "Quantity is required"
    else if (!/^\d+$/.test(form.qty) || Number(form.qty) < 1) e.qty = "Enter a positive whole number"
    if (!form.weight.trim()) e.weight = "Weight is required"
    else if (!/^\d+(\.\d+)?$/.test(form.weight.trim())) e.weight = "Enter a number in kg"
    if (!form.type) e.type = "Select a pallet type"
    if (!form.status) e.status = "Select a status"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createPallet() {
    if (!validate()) return
    const seq = 891 + pallets.filter((p) => p.id.startsWith("PLT-2024-08") || p.id.startsWith("PLT-2024-09")).length - initialPallets.length
    const today = new Date().toISOString().slice(0, 10)
    const next: Pallet = {
      id: `PLT-2024-0${seq}`,
      sku: form.sku.trim().toUpperCase(),
      product: form.product.trim(),
      client: form.client,
      location: form.location.trim().toUpperCase(),
      qty: Number(form.qty),
      weight: `${form.weight.trim()} kg`,
      status: form.status,
      type: form.type,
      created: today,
      age: "0 days",
    }
    setPallets((prev) => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    setPage(1)
    notify.success("Pallet created", `${next.id} — ${next.qty} units at ${next.location}`)
  }

  function submitScan() {
    const code = scanCode.trim().toUpperCase()
    if (!code) { setScanError("Enter or scan a pallet barcode"); return }
    if (!/^PLT-\d{4}-\d{4}$/.test(code)) {
      setScanError("Invalid barcode format — expected PLT-YYYY-NNNN")
      return
    }
    const match = pallets.find((p) => p.id.toUpperCase() === code)
    if (!match) {
      setScanError(`No pallet registered with barcode ${code}`)
      return
    }
    setScanOpen(false)
    setScanCode("")
    setScanError("")
    setDetail(match)
    notify.success("Pallet scanned", `${match.id} found at ${match.location}.`)
  }

  function openMove(p: Pallet) {
    setMoveTarget(p)
    setMoveForm({ location: p.location, status: p.status })
    setMoveErrors({})
  }

  function submitMove() {
    if (!moveTarget) return
    const e: Record<string, string> = {}
    if (!moveForm.location.trim()) e.location = "Location is required"
    if (!moveForm.status) e.status = "Select a status"
    setMoveErrors(e)
    if (Object.keys(e).length) return
    const loc = moveForm.location.trim().toUpperCase()
    setPallets((prev) => prev.map((x) => x.id === moveTarget.id ? { ...x, location: loc, status: moveForm.status } : x))
    notify.success("Pallet updated", `${moveTarget.id} → ${loc} (${moveForm.status}).`)
    setMoveTarget(null)
  }

  function decommission(p: Pallet) {
    setPallets((prev) => prev.filter((x) => x.id !== p.id))
    notify.warning("Pallet decommissioned", `${p.id} has been removed from the register.`)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="w-full p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pallet Tracking</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Real-time pallet lifecycle and location management</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setScanOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors">
              <QrCode className="w-4 h-4" /> Scan Pallet
            </button>
            <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
              <Plus className="w-4 h-4" /> New Pallet
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Pallets", value: pallets.length.toString(), icon: <Box className="w-5 h-5" />, color: "text-brand" },
            { label: "Stored", value: pallets.filter((p) => p.status === "Stored").length.toString(), icon: <CheckCircle2 className="w-5 h-5" />, color: "text-success" },
            { label: "In Transit", value: pallets.filter((p) => p.status === "In Transit").length.toString(), icon: <RefreshCw className="w-5 h-5" />, color: "text-brand" },
            { label: "Staging", value: pallets.filter((p) => p.status === "Staging").length.toString(), icon: <Clock className="w-5 h-5" />, color: "text-warning" },
            { label: "Damaged", value: pallets.filter((p) => p.status === "Damaged").length.toString(), icon: <AlertTriangle className="w-5 h-5" />, color: "text-danger" },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-2xl border border-border bg-card">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <span className={stat.color}>{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-xl border border-border bg-card">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground text-foreground" placeholder="Search pallet ID, SKU, product..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
          </div>
          {[
            { value: statusFilter, options: ["All Status", ...STATUSES], onChange: resetPaging(setStatusFilter) },
            { value: clientFilter, options: ["All Clients", ...CLIENTS], onChange: resetPaging(setClientFilter) },
          ].map((f, i) => (
            <div key={i} className="relative">
              <select className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-border bg-card text-sm text-foreground outline-none cursor-pointer" value={f.value} onChange={(e) => f.onChange(e.target.value)}>
                {f.options.map((o) => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Pallet ID", "SKU", "Product", "Client", "Location", "Qty", "Weight", "Type", "Age", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((p, i) => (
                  <tr key={p.id} className={cn("border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors", i % 2 === 1 ? "bg-muted/10" : "")}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button onClick={() => setDetail(p)} title={`View ${p.id}`} className="text-brand font-medium hover:underline cursor-pointer flex items-center gap-1.5 text-xs">
                        <Box className="w-3.5 h-3.5" /> {p.id}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs font-mono">{p.sku}</td>
                    <td className="px-4 py-3 font-medium text-foreground max-w-44"><span className="line-clamp-1">{p.product}</span></td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{p.client}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="flex items-center gap-1 text-muted-foreground text-xs font-mono">
                        <MapPin className="w-3 h-3 shrink-0" /> {p.location}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{p.qty}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{p.weight}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{p.type}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {p.age}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusConfig[p.status]?.bg, statusConfig[p.status]?.color)}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setDetail(p)} title="View details" className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => openMove(p)} title="Relocate / change status" className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteTarget(p)} title="Decommission pallet" className="p-1.5 rounded-lg hover:bg-danger/10 transition-colors text-muted-foreground hover:text-danger"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Box className="w-10 h-10 mb-3 opacity-40" />
                <p className="font-medium">No pallets found</p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
            <span className="text-xs text-muted-foreground">Showing {paged.length} of {filtered.length} pallets</span>
            <div className="flex gap-1">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} title={`Page ${p}`} className={cn("w-7 h-7 rounded-lg text-xs transition-colors", p === safePage ? "bg-brand text-white" : "text-muted-foreground hover:bg-muted")}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scan pallet */}
      <Modal
        open={scanOpen}
        onOpenChange={(o) => { setScanOpen(o); if (!o) { setScanCode(""); setScanError("") } }}
        title="Scan Pallet"
        description="Scan or type a pallet barcode to look up its record"
        size="sm"
        footer={<ModalActions onCancel={() => setScanOpen(false)} onSubmit={submitScan} submitLabel="Look Up Pallet" />}
      >
        <Field label="Pallet Barcode / ID" required error={scanError} hint="Format: PLT-YYYY-NNNN, e.g. PLT-2024-0890">
          <TextInput
            value={scanCode}
            invalid={!!scanError}
            autoFocus
            onChange={(e) => { setScanCode(e.target.value); setScanError("") }}
            onKeyDown={(e) => { if (e.key === "Enter") submitScan() }}
            placeholder="PLT-2024-0890"
          />
        </Field>
      </Modal>

      {/* Create pallet */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="New Pallet"
        description="Register a new pallet into the warehouse"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createPallet} submitLabel="Create Pallet" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="SKU Code" required error={errors.sku}>
            <TextInput value={form.sku} invalid={!!errors.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="e.g. SKU-001234" />
          </Field>
          <Field label="Product Name" required error={errors.product}>
            <TextInput value={form.product} invalid={!!errors.product} onChange={(e) => setForm({ ...form, product: e.target.value })} placeholder="e.g. Premium Basmati Rice 5kg" />
          </Field>
          <Field label="Client" required error={errors.client}>
            <Select value={form.client} invalid={!!errors.client} onChange={(e) => setForm({ ...form, client: e.target.value })} options={CLIENTS} placeholder="Select Client" />
          </Field>
          <Field label="Location" required error={errors.location}>
            <TextInput value={form.location} invalid={!!errors.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. A-12-03-L1" />
          </Field>
          <Field label="Quantity" required error={errors.qty}>
            <TextInput value={form.qty} invalid={!!errors.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} placeholder="e.g. 50" inputMode="numeric" />
          </Field>
          <Field label="Weight (kg)" required error={errors.weight}>
            <TextInput value={form.weight} invalid={!!errors.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="e.g. 250" inputMode="decimal" />
          </Field>
          <Field label="Pallet Type" required error={errors.type}>
            <Select value={form.type} invalid={!!errors.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={TYPES} placeholder="Select Type" />
          </Field>
          <Field label="Status" required error={errors.status}>
            <Select value={form.status} invalid={!!errors.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUSES} placeholder="Select Status" />
          </Field>
        </div>
      </Modal>

      {/* Relocate / status change */}
      <Modal
        open={!!moveTarget}
        onOpenChange={(o) => { if (!o) { setMoveTarget(null); setMoveErrors({}) } }}
        title={`Update ${moveTarget?.id ?? ""}`}
        description="Relocate the pallet or change its lifecycle status"
        size="sm"
        footer={<ModalActions onCancel={() => setMoveTarget(null)} onSubmit={submitMove} submitLabel="Save Changes" />}
      >
        <div className="grid grid-cols-1 gap-4">
          <Field label="Location" required error={moveErrors.location}>
            <TextInput value={moveForm.location} invalid={!!moveErrors.location} onChange={(e) => setMoveForm({ ...moveForm, location: e.target.value })} placeholder="e.g. B-04-01-L1" />
          </Field>
          <Field label="Status" required error={moveErrors.status}>
            <Select value={moveForm.status} invalid={!!moveErrors.status} onChange={(e) => setMoveForm({ ...moveForm, status: e.target.value })} options={STATUSES} placeholder="Select Status" />
          </Field>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Pallet detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Pallet ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="SKU" value={<span className="font-mono">{detail.sku}</span>} />
            <DetailRow label="Product" value={detail.product} />
            <DetailRow label="Client" value={detail.client} />
            <DetailRow label="Location" value={<span className="font-mono">{detail.location}</span>} />
            <DetailRow label="Quantity" value={`${detail.qty} units`} />
            <DetailRow label="Weight" value={detail.weight} />
            <DetailRow label="Pallet Type" value={detail.type} />
            <DetailRow label="Created" value={detail.created} />
            <DetailRow label="Age" value={detail.age} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusConfig[detail.status]?.bg, statusConfig[detail.status]?.color)}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Decommission confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Decommission this pallet?"
        message={`Pallet ${deleteTarget?.id} holding ${deleteTarget?.qty} units will be removed from the register. This cannot be undone.`}
        confirmLabel="Decommission"
        cancelLabel="Keep It"
        onConfirm={() => deleteTarget && decommission(deleteTarget)}
      />
    </div>
  )
}
