"use client"
import { useState } from "react"
import { Search, Plus, Eye, Pencil, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

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
  { id:"STK-006",customer:"Meena Patel",item:"Retail Display Fixtures",pieces:16,location:"Unit A-11",since:"2025-07-05",days:14,charges:"₹980"},
  { id:"STK-007",customer:"Vikram Nair",item:"Electronics Spares Cartons",pieces:34,location:"Unit C-02",since:"2025-07-12",days:7,charges:"₹490"},
  { id:"STK-008",customer:"Kavitha Rao",item:"Textile Rolls",pieces:52,location:"Unit B-08",since:"2025-06-28",days:21,charges:"₹1,470"},
  { id:"STK-009",customer:"Deepa Menon",item:"Restaurant Equipment",pieces:19,location:"Unit D-05",since:"2025-06-25",days:24,charges:"₹1,680"},
  { id:"STK-010",customer:"Sanjay Gupta",item:"Packaged Food Cartons",pieces:60,location:"Unit C-14",since:"2025-07-08",days:11,charges:"₹770"},
  { id:"STK-011",customer:"Rahul Mehta",item:"Books & Archive Boxes",pieces:26,location:"Unit A-16",since:"2025-06-22",days:27,charges:"₹1,890"},
  { id:"STK-012",customer:"Anita Desai",item:"Art & Framed Prints",pieces:9,location:"Unit D-01",since:"2025-07-16",days:3,charges:"₹210"},
  { id:"STK-013",customer:"Suresh Yadav",item:"Agricultural Tools",pieces:38,location:"Unit B-19",since:"2025-06-10",days:39,charges:"₹2,730"},
  { id:"STK-014",customer:"Priya Sharma",item:"Boutique Stock — Sarees",pieces:44,location:"Unit A-21",since:"2025-05-28",days:52,charges:"₹3,640"},
  { id:"STK-015",customer:"Arjun Nair",item:"Gym Equipment Set",pieces:14,location:"Unit C-09",since:"2025-05-15",days:65,charges:"₹4,550"},
  { id:"STK-016",customer:"Ravi Kumar",item:"Automotive Spare Parts",pieces:48,location:"Unit D-12",since:"2025-06-02",days:47,charges:"₹3,290"},
  { id:"STK-017",customer:"Vikram Sharma",item:"Modular Kitchen Units",pieces:22,location:"Unit B-24",since:"2025-05-05",days:75,charges:"₹5,250"},
  { id:"STK-018",customer:"Meena Iyer",item:"Event Décor & Props",pieces:31,location:"Unit A-27",since:"2025-04-30",days:80,charges:"₹5,600"},
  { id:"STK-019",customer:"Rakesh Verma",item:"Printing Paper Reams",pieces:56,location:"Unit C-18",since:"2025-06-18",days:31,charges:"₹2,170"},
  { id:"STK-020",customer:"Lakshmi Menon",item:"Handicraft Consignment",pieces:27,location:"Unit D-07",since:"2025-05-20",days:60,charges:"₹4,200"},
  { id:"STK-021",customer:"Ganesh Pillai",item:"Machine Tool Crates",pieces:11,location:"Unit B-30",since:"2025-04-10",days:100,charges:"₹7,000"},
  { id:"STK-022",customer:"Neha Kulkarni",item:"Apparel Overstock",pieces:64,location:"Unit A-33",since:"2025-03-28",days:113,charges:"₹7,910"},
  { id:"STK-023",customer:"Mohan Reddy",item:"Construction Fittings",pieces:41,location:"Unit C-22",since:"2025-03-01",days:140,charges:"₹9,800"},
  { id:"STK-024",customer:"Sunita Joshi",item:"Antique Furniture",pieces:17,location:"Unit D-15",since:"2025-02-14",days:155,charges:"₹10,850"},
  { id:"STK-025",customer:"Kiran Desai",item:"Warehouse Pallet Racking",pieces:23,location:"Unit B-36",since:"2025-01-20",days:180,charges:"₹12,600"},
  { id:"STK-026",customer:"Ashok Rane",item:"Laboratory Glassware",pieces:35,location:"Unit A-39",since:"2025-04-05",days:105,charges:"₹7,350"},
  { id:"STK-027",customer:"Divya Krishnan",item:"Bridal Trousseau Trunks",pieces:13,location:"Unit D-19",since:"2024-12-15",days:216,charges:"₹15,120"},
  { id:"STK-028",customer:"Harish Bhat",item:"Marine Hardware Cartons",pieces:29,location:"Unit C-26",since:"2025-02-28",days:141,charges:"₹9,870"},
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
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Stock Entry
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="p-3 rounded-xl border border-border bg-card">
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
          <thead className="bg-muted/50 border-b border-border"><tr>{["Stock ID","Customer","Item","Pieces","Location","Since","Days","Charges","Actions"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
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
                  <RowActions
                    items={[
                      { label: "View stock details", icon: <Eye />, onSelect: () => setDetail(s) },
                      { label: "Edit stock entry", icon: <Pencil />, onSelect: () => openEdit(s) },
                      { label: "Release stock", icon: <LogOut />, onSelect: () => setReleaseTarget(s), tone: "danger" as const },
                    ]}
                  />
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
