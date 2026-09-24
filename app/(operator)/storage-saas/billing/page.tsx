"use client"
import { useState } from "react"
import { Search, Plus, Eye, Check, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Bill = {
  id: string; customer: string; period: string; storage: string
  handling: string; delivery: string; total: string; status: string
}

const initialBills: Bill[] = [
  { id:"INV-2025-0041",customer:"Ravi Sharma",period:"Jun 2025",storage:"₹4,200",handling:"₹820",delivery:"₹350",total:"₹5,370",status:"Paid"},
  { id:"INV-2025-0042",customer:"Priya Mehta",period:"Jun 2025",storage:"₹2,100",handling:"₹410",delivery:"₹180",total:"₹2,690",status:"Overdue"},
  { id:"INV-2025-0043",customer:"Suresh Kumar",period:"Jun 2025",storage:"₹6,300",handling:"₹1,240",delivery:"₹520",total:"₹8,060",status:"Paid"},
  { id:"INV-2025-0044",customer:"Anjali Patel",period:"Jul 2025",storage:"₹1,800",handling:"₹360",delivery:"₹150",total:"₹2,310",status:"Pending"},
  { id:"INV-2025-0045",customer:"Arjun Singh",period:"Jul 2025",storage:"₹3,500",handling:"₹700",delivery:"₹280",total:"₹4,480",status:"Pending"},
  { id:"INV-2025-0046",customer:"Kavitha Rao",period:"Jul 2025",storage:"₹5,600",handling:"₹1,100",delivery:"₹450",total:"₹7,150",status:"Paid"},
  { id:"INV-2025-0047",customer:"Vikram Nair",period:"Jul 2025",storage:"₹2,400",handling:"₹480",delivery:"₹200",total:"₹3,080",status:"Paid"},
  { id:"INV-2025-0048",customer:"Deepa Menon",period:"Jul 2025",storage:"₹7,800",handling:"₹1,560",delivery:"₹620",total:"₹9,980",status:"Overdue"},
  { id:"INV-2025-0049",customer:"Sanjay Gupta",period:"Jul 2025",storage:"₹3,200",handling:"₹640",delivery:"₹260",total:"₹4,100",status:"Paid"},
  { id:"INV-2025-0050",customer:"Meena Patel",period:"Aug 2025",storage:"₹4,900",handling:"₹980",delivery:"₹390",total:"₹6,270",status:"Paid"},
  { id:"INV-2025-0051",customer:"Rahul Mehta",period:"Aug 2025",storage:"₹1,500",handling:"₹300",delivery:"₹120",total:"₹1,920",status:"Pending"},
  { id:"INV-2025-0052",customer:"Anita Desai",period:"Aug 2025",storage:"₹6,700",handling:"₹1,340",delivery:"₹540",total:"₹8,580",status:"Paid"},
  { id:"INV-2025-0053",customer:"Suresh Yadav",period:"Aug 2025",storage:"₹2,800",handling:"₹560",delivery:"₹230",total:"₹3,590",status:"Paid"},
  { id:"INV-2025-0054",customer:"Neha Joshi",period:"Aug 2025",storage:"₹5,100",handling:"₹1,020",delivery:"₹410",total:"₹6,530",status:"Overdue"},
  { id:"INV-2025-0055",customer:"Ravi Kumar",period:"Aug 2025",storage:"₹3,900",handling:"₹780",delivery:"₹310",total:"₹4,990",status:"Paid"},
  { id:"INV-2025-0056",customer:"Lakshmi Iyer",period:"Sep 2025",storage:"₹8,200",handling:"₹1,640",delivery:"₹660",total:"₹10,500",status:"Paid"},
  { id:"INV-2025-0057",customer:"Manish Agarwal",period:"Sep 2025",storage:"₹2,600",handling:"₹520",delivery:"₹210",total:"₹3,330",status:"Pending"},
  { id:"INV-2025-0058",customer:"Pooja Reddy",period:"Sep 2025",storage:"₹4,400",handling:"₹880",delivery:"₹350",total:"₹5,630",status:"Paid"},
  { id:"INV-2025-0059",customer:"Karthik Subramanian",period:"Sep 2025",storage:"₹1,900",handling:"₹380",delivery:"₹150",total:"₹2,430",status:"Paid"},
  { id:"INV-2025-0060",customer:"Divya Krishnan",period:"Sep 2025",storage:"₹6,100",handling:"₹1,220",delivery:"₹490",total:"₹7,810",status:"Paid"},
  { id:"INV-2025-0061",customer:"Ajay Bhatt",period:"Sep 2025",storage:"₹3,300",handling:"₹660",delivery:"₹270",total:"₹4,230",status:"Pending"},
  { id:"INV-2025-0062",customer:"Sneha Kulkarni",period:"Q3 2025",storage:"₹9,400",handling:"₹1,880",delivery:"₹750",total:"₹12,030",status:"Paid"},
  { id:"INV-2025-0063",customer:"Gopal Verma",period:"Q3 2025",storage:"₹2,200",handling:"₹440",delivery:"₹180",total:"₹2,820",status:"Overdue"},
  { id:"INV-2025-0064",customer:"Ritu Chawla",period:"Q3 2025",storage:"₹5,800",handling:"₹1,160",delivery:"₹460",total:"₹7,420",status:"Paid"},
  { id:"INV-2025-0065",customer:"Nitin Deshmukh",period:"Q3 2025",storage:"₹4,100",handling:"₹820",delivery:"₹330",total:"₹5,250",status:"Pending"},
  { id:"INV-2025-0066",customer:"Shalini Bose",period:"Q3 2025",storage:"₹7,200",handling:"₹1,440",delivery:"₹580",total:"₹9,220",status:"Pending"},
]

const PERIODS = ["Jun 2025", "Jul 2025", "Aug 2025", "Sep 2025", "Q3 2025"] as const

const statusStyle: Record<string, string> = {
  Paid: "bg-success/10 text-success",
  Overdue: "bg-danger/10 text-danger",
  Pending: "bg-amber-50 text-amber-600",
}

/** "₹4,200" -> 4200 */
function amount(v: string) {
  const n = Number(v.replace(/[^\d.]/g, ""))
  return Number.isFinite(n) ? n : 0
}
/** 4200 -> "₹4,200" */
function rupees(n: number) {
  return `₹${n.toLocaleString("en-IN")}`
}

const emptyForm = { customer: "", period: "", storage: "", handling: "", delivery: "" }

export default function StorageSaasBillingPage() {
  const [bills, setBills] = useState<Bill[]>(initialBills)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Bill | null>(null)
  const [voidTarget, setVoidTarget] = useState<Bill | null>(null)

  const filtered = bills.filter(b =>
    (statusFilter === "All" || b.status === statusFilter) &&
    (b.id.toLowerCase().includes(search.toLowerCase()) || b.customer.toLowerCase().includes(search.toLowerCase()))
  )

  const totalBilled = bills.reduce((s, b) => s + amount(b.total), 0)
  const paidSum = bills.filter(b => b.status === "Paid").reduce((s, b) => s + amount(b.total), 0)
  const overdueSum = bills.filter(b => b.status === "Overdue").reduce((s, b) => s + amount(b.total), 0)
  const pendingSum = bills.filter(b => b.status === "Pending").reduce((s, b) => s + amount(b.total), 0)

  const kpis = [
    { label: "Total Billed", value: rupees(totalBilled), sub: `${bills.length} invoices`, color: "text-foreground" },
    { label: "Paid", value: rupees(paidSum), sub: `${bills.filter(b => b.status === "Paid").length} invoices`, color: "text-success" },
    { label: "Overdue", value: rupees(overdueSum), sub: `${bills.filter(b => b.status === "Overdue").length} invoices`, color: "text-danger" },
    { label: "Pending", value: rupees(pendingSum), sub: `${bills.filter(b => b.status === "Pending").length} invoices`, color: "text-amber-600" },
  ]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.customer.trim()) e.customer = "Customer name is required"
    if (!form.period) e.period = "Select a billing period"
    for (const k of ["storage", "handling", "delivery"] as const) {
      const raw = form[k].trim()
      if (!raw) e[k] = "Amount is required"
      else if (!/^\d+(\.\d{1,2})?$/.test(raw) || Number(raw) <= 0) e[k] = "Enter a positive amount"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createInvoice() {
    if (!validate()) return
    const storage = Number(form.storage)
    const handling = Number(form.handling)
    const delivery = Number(form.delivery)
    const seq = bills.reduce((max, b) => Math.max(max, Number(b.id.split("-").pop()) || 0), 0) + 1
    const next: Bill = {
      id: `INV-2025-${String(seq).padStart(4, "0")}`,
      customer: form.customer.trim(),
      period: form.period,
      storage: rupees(storage),
      handling: rupees(handling),
      delivery: rupees(delivery),
      total: rupees(storage + handling + delivery),
      status: "Pending",
    }
    setBills(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Invoice created", `${next.id} — ${next.customer}, ${next.total}`)
  }

  function markPaid(b: Bill) {
    setBills(prev => prev.map(x => x.id === b.id ? { ...x, status: "Paid" } : x))
    notify.success("Payment recorded", `${b.id} marked as Paid.`)
  }

  function voidInvoice(b: Bill) {
    setBills(prev => prev.filter(x => x.id !== b.id))
    notify.warning("Invoice voided", `${b.id} has been removed.`)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold text-foreground">Billing</h1><p className="text-sm text-muted-foreground mt-1">Customer invoices and payment status for storage services</p></div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="storage-billing" />
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Invoice
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoice, customer..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
        </div>
        {["All", "Paid", "Pending", "Overdue"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", statusFilter === s ? "bg-brand text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground")}>{s}</button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border"><tr>{["Invoice","Customer","Period","Storage","Handling","Delivery","Total","Status","Actions"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(b=>(
              <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{b.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{b.customer}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.period}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.storage}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.handling}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.delivery}</td>
                <td className="px-4 py-3 font-bold text-foreground">{b.total}</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusStyle[b.status])}>{b.status}</span></td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: "View invoice details", icon: <Eye />, onSelect: () => setDetail(b) },
                      ...(b.status !== "Paid"
                        ? [{ label: "Mark as paid", icon: <Check />, onSelect: () => markPaid(b), tone: "success" as const }]
                        : []),
                      { label: "Void invoice", icon: <Trash2 />, onSelect: () => setVoidTarget(b), tone: "danger" as const },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">No invoices match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create invoice */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="New Invoice"
        description="Raise a storage invoice for a customer"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createInvoice} submitLabel="Create Invoice" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Customer" required error={errors.customer}>
            <TextInput value={form.customer} invalid={!!errors.customer} onChange={e => setForm({ ...form, customer: e.target.value })} placeholder="e.g. Ravi Sharma" />
          </Field>
          <Field label="Billing Period" required error={errors.period}>
            <Select value={form.period} invalid={!!errors.period} onChange={e => setForm({ ...form, period: e.target.value })} options={PERIODS} placeholder="Select Period" />
          </Field>
          <Field label="Storage Charges (₹)" required error={errors.storage}>
            <TextInput value={form.storage} invalid={!!errors.storage} onChange={e => setForm({ ...form, storage: e.target.value })} placeholder="e.g. 4200" inputMode="decimal" />
          </Field>
          <Field label="Handling Charges (₹)" required error={errors.handling}>
            <TextInput value={form.handling} invalid={!!errors.handling} onChange={e => setForm({ ...form, handling: e.target.value })} placeholder="e.g. 820" inputMode="decimal" />
          </Field>
          <Field label="Delivery Charges (₹)" required error={errors.delivery} hint="Total is calculated automatically.">
            <TextInput value={form.delivery} invalid={!!errors.delivery} onChange={e => setForm({ ...form, delivery: e.target.value })} placeholder="e.g. 350" inputMode="decimal" />
          </Field>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Invoice detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Invoice" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Customer" value={detail.customer} />
            <DetailRow label="Period" value={detail.period} />
            <DetailRow label="Storage" value={detail.storage} />
            <DetailRow label="Handling" value={detail.handling} />
            <DetailRow label="Delivery" value={detail.delivery} />
            <DetailRow label="Total" value={<span className="font-bold">{detail.total}</span>} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusStyle[detail.status])}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Void confirmation */}
      <ConfirmDialog
        open={!!voidTarget}
        onOpenChange={(o) => !o && setVoidTarget(null)}
        title="Void this invoice?"
        message={`Invoice ${voidTarget?.id} for ${voidTarget?.customer} (${voidTarget?.total}) will be removed. This cannot be undone.`}
        confirmLabel="Void Invoice"
        cancelLabel="Keep It"
        onConfirm={() => voidTarget && voidInvoice(voidTarget)}
      />
    </div>
  )
}
