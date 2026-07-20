"use client"
import { useState } from "react"
import { Search, Plus, Eye, Pencil, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Stock = {
  id: string; customer: string; item: string; pieces: number
  location: string; since: string; days: number; charges: string
}

const initialStock: Stock[] = [
  { id:"STK-001",customer:"Ravi Sharma",item:"Personal Belongings Box",pieces:12,location:"Unit A-04",since:"2025-05-10",days:70,charges:"₹4,200"},
  { id:"STK-002",customer:"Priya Mehta",item:"Furniture — 2BHK Set",pieces:28,location:"Unit B-12",since:"2025-04-01",days:109,charges:"₹7,630"},
  { id:"STK-003",customer:"Suresh Kumar",item:"Office Equipment",pieces:45,location:"Unit C-07",since:"2025-03-15",days:126,charges:"₹8,820"},
  { id:"STK-004",customer:"Anjali Patel",item:"Seasonal Inventory",pieces:8,location:"Unit A-09",since:"2025-07-01",days:18,charges:"₹1,260"},
  { id:"STK-005",customer:"Arjun Singh",item:"Household Items",pieces:20,location:"Unit B-03",since:"2025-06-15",days:34,charges:"₹2,380"},
]

const AGEING = ["All", "0–30 days", "31–90 days", "90+ days"] as const

/** "₹4,200" -> 4200 */
function amount(v: string) {
  const n = Number(v.replace(/[^\d.]/g, ""))
  return Number.isFinite(n) ? n : 0
}
/** 4200 -> "₹4,200" */
function rupees(n: number) {
  return `₹${n.toLocaleString("en-IN")}`
}
/** Whole days between `since` (YYYY-MM-DD) and today, floored at 0. */
function daysSince(since: string) {
  const start = new Date(`${since}T00:00:00`)
  if (Number.isNaN(start.getTime())) return 0
  const diff = Math.floor((Date.now() - start.getTime()) / 86_400_000)
  return diff > 0 ? diff : 0
}
/** Plausible accrued charge: ₹5 per piece per day. */
function chargeFor(pieces: number, days: number) {
  return rupees(pieces * days * 5)
}
function bucketOf(days: number) {
  if (days <= 30) return "0–30 days"
  if (days <= 90) return "31–90 days"
  return "90+ days"
}

const emptyForm = { customer: "", item: "", pieces: "", location: "", since: "" }

export default function StorageSaasStockPage() {
  const [stock, setStock] = useState<Stock[]>(initialStock)
  const [search, setSearch] = useState("")
  const [ageing, setAgeing] = useState<string>("All")

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Stock | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Stock | null>(null)
  const [releaseTarget, setReleaseTarget] = useState<Stock | null>(null)

  const filtered = stock.filter(s =>
    (ageing === "All" || bucketOf(s.days) === ageing) &&
    (s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.customer.toLowerCase().includes(search.toLowerCase()) ||
      s.item.toLowerCase().includes(search.toLowerCase()))
  )

  const totalPieces = stock.reduce((sum, s) => sum + s.pieces, 0)
  const totalCharges = stock.reduce((sum, s) => sum + amount(s.charges), 0)
  const oldest = stock.reduce((max, s) => Math.max(max, s.days), 0)

  const kpis = [
    { label: "Total Pieces", value: totalPieces, sub: "In storage now", color: "text-foreground" },
    { label: "Active Lots", value: stock.length, sub: "Customer lots", color: "text-brand" },
    { label: "Total Charges", value: rupees(totalCharges), sub: "Accrued to date", color: "text-success" },
    { label: "Oldest Lot", value: `${oldest}d`, sub: "Longest stored", color: "text-danger" },
  ]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.customer.trim()) e.customer = "Customer name is required"
    if (!form.item.trim()) e.item = "Item description is required"
    if (!form.pieces.trim()) e.pieces = "Piece count is required"
    else if (!/^\d+$/.test(form.pieces) || Number(form.pieces) < 1) e.pieces = "Enter a positive whole number"
    if (!form.location.trim()) e.location = "Storage location is required"
    if (!form.since.trim()) e.since = "Storage start date is required"
    else if (Number.isNaN(new Date(`${form.since}T00:00:00`).getTime())) e.since = "Enter a valid date"
    else if (new Date(`${form.since}T00:00:00`).getTime() > Date.now()) e.since = "Date cannot be in the future"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function openCreate() {
    setForm(emptyForm)
    setErrors({})
    setCreateOpen(true)
  }

  function openEdit(s: Stock) {
    setForm({ customer: s.customer, item: s.item, pieces: String(s.pieces), location: s.location, since: s.since })
    setErrors({})
    setEditTarget(s)
  }

  function createStock() {
    if (!validate()) return
    const pieces = Number(form.pieces)
    const days = daysSince(form.since)
    const seq = stock.reduce((max, s) => Math.max(max, Number(s.id.replace(/\D/g, "")) || 0), 0) + 1
    const next: Stock = {
      id: `STK-${String(seq).padStart(3, "0")}`,
      customer: form.customer.trim(),
      item: form.item.trim(),
      pieces,
      location: form.location.trim(),
      since: form.since,
      days,
      charges: chargeFor(pieces, days),
    }
    setStock(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Stock entry created", `${next.id} — ${next.pieces} pcs at ${next.location}`)
  }

  function saveEdit() {
    if (!editTarget || !validate()) return
    const pieces = Number(form.pieces)
    const days = daysSince(form.since)
    setStock(prev => prev.map(x => x.id === editTarget.id ? {
      ...x,
      customer: form.customer.trim(),
      item: form.item.trim(),
      pieces,
      location: form.location.trim(),
      since: form.since,
      days,
      charges: chargeFor(pieces, days),
    } : x))
    setEditTarget(null)
    setForm(emptyForm)
    setErrors({})
    notify.success("Stock entry updated", `${editTarget.id} has been saved.`)
  }

  function releaseStock(s: Stock) {
    setStock(prev => prev.filter(x => x.id !== s.id))
    notify.warning("Stock released", `${s.id} — ${s.pieces} pcs released from ${s.location}.`)
  }

  const formFields = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Customer" required error={errors.customer}>
        <TextInput value={form.customer} invalid={!!errors.customer} onChange={e => setForm({ ...form, customer: e.target.value })} placeholder="e.g. Ravi Sharma" />
      </Field>
      <Field label="Item" required error={errors.item}>
        <TextInput value={form.item} invalid={!!errors.item} onChange={e => setForm({ ...form, item: e.target.value })} placeholder="e.g. Personal Belongings Box" />
      </Field>
      <Field label="Pieces" required error={errors.pieces}>
        <TextInput value={form.pieces} invalid={!!errors.pieces} onChange={e => setForm({ ...form, pieces: e.target.value })} placeholder="e.g. 12" inputMode="numeric" />
      </Field>
      <Field label="Location" required error={errors.location}>
        <TextInput value={form.location} invalid={!!errors.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Unit A-04" />
      </Field>
      <Field label="Stored Since" required error={errors.since} hint="Days and charges are calculated automatically.">
        <TextInput type="date" value={form.since} invalid={!!errors.since} onChange={e => setForm({ ...form, since: e.target.value })} />
      </Field>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold text-foreground">Customer Stock</h1><p className="text-sm text-muted-foreground mt-1">Items currently in storage with location and billing details</p></div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="storage-stock" />
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F7941D] text-white text-sm font-medium hover:bg-[#F7941D]/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Stock Entry
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="p-4 rounded-xl border border-border bg-card">
            <p className="text-xs text-muted-foreground mb-1">{k.label}</p>
            <p className={cn("text-2xl font-bold", k.color)}>{k.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stock ID, customer, item..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
        </div>
        {AGEING.map(a => (
          <button key={a} onClick={() => setAgeing(a)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", ageing === a ? "bg-brand text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground")}>{a}</button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["Stock ID","Customer","Item","Pieces","Location","Since","Days","Charges","Actions"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(s=>(
              <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{s.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{s.customer}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.item}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.pieces}</td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{s.location}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.since}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.days}</td>
                <td className="px-4 py-3 font-medium text-foreground">{s.charges}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setDetail(s)} title="View stock details" className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => openEdit(s)} title="Edit stock entry" className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-brand transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setReleaseTarget(s)} title="Release stock" className="p-1.5 rounded-md text-danger hover:bg-danger/10 transition-colors">
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">No stock entries match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create stock entry */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="New Stock Entry"
        description="Record a customer lot into storage"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createStock} submitLabel="Create Entry" />}
      >
        {formFields}
      </Modal>

      {/* Edit stock entry */}
      <Modal
        open={!!editTarget}
        onOpenChange={(o) => { if (!o) { setEditTarget(null); setForm(emptyForm); setErrors({}) } }}
        title={`Edit ${editTarget?.id ?? ""}`}
        description="Update this stored lot"
        footer={<ModalActions onCancel={() => setEditTarget(null)} onSubmit={saveEdit} submitLabel="Save Changes" />}
      >
        {formFields}
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Stored lot detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Stock ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Customer" value={detail.customer} />
            <DetailRow label="Item" value={detail.item} />
            <DetailRow label="Pieces" value={`${detail.pieces} pcs`} />
            <DetailRow label="Location" value={<span className="font-mono">{detail.location}</span>} />
            <DetailRow label="Stored Since" value={detail.since} />
            <DetailRow label="Days Stored" value={`${detail.days} days`} />
            <DetailRow label="Ageing Bucket" value={bucketOf(detail.days)} />
            <DetailRow label="Accrued Charges" value={<span className="font-bold">{detail.charges}</span>} />
          </div>
        )}
      </Drawer>

      {/* Release confirmation */}
      <ConfirmDialog
        open={!!releaseTarget}
        onOpenChange={(o) => !o && setReleaseTarget(null)}
        title="Release this stock?"
        message={`${releaseTarget?.id} — ${releaseTarget?.pieces} pcs for ${releaseTarget?.customer} will be released from ${releaseTarget?.location}. This cannot be undone.`}
        confirmLabel="Release Stock"
        cancelLabel="Keep Stored"
        onConfirm={() => releaseTarget && releaseStock(releaseTarget)}
      />
    </div>
  )
}
