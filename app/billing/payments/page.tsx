"use client"
import { useState } from "react"
import { Plus, Eye, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Payment = {
  id: string; invoice: string; client: string; amount: string
  method: string; ref: string; date: string; status: string
}

const initialPayments: Payment[] = [
  { id: "PAY-2024-0201", invoice: "INV-2024-0430", client: "Acme Foods", amount: "₹25,800", method: "NEFT", ref: "NEFT-20240625", date: "2024-06-25", status: "Confirmed" },
  { id: "PAY-2024-0200", invoice: "INV-2024-0420", client: "Sweet Mills", amount: "₹8,400", method: "UPI", ref: "UPI-20240531", date: "2024-05-31", status: "Confirmed" },
  { id: "PAY-2024-0198", invoice: "INV-2024-0415", client: "Salt Works", amount: "₹11,200", method: "Cheque", ref: "CHQ-00451", date: "2024-05-15", status: "Confirmed" },
  { id: "PAY-2024-0195", invoice: "INV-2024-0409", client: "Global Oils", amount: "₹14,800", method: "RTGS", ref: "RTGS-20240510", date: "2024-05-10", status: "Cleared" },
]

const statusStyle: Record<string, string> = {
  Confirmed: "bg-success/10 text-success",
  Cleared: "bg-success/10 text-success",
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
}

const CLIENTS = ["Acme Foods", "Global Oils", "Agro Corp", "Sweet Mills", "Salt Works", "Fresh Farms"] as const
const METHODS = ["NEFT", "RTGS", "UPI", "Cheque", "Cash"] as const

function parseAmount(a: string) {
  return Number(a.replace(/[^0-9.]/g, "")) || 0
}
function formatAmount(n: number) {
  return `₹${n.toLocaleString("en-IN")}`
}

const emptyForm = { invoice: "", client: "", amount: "", method: "", ref: "", date: "" }

export default function BillingPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>(initialPayments)
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [detail, setDetail] = useState<Payment | null>(null)
  const [voidTarget, setVoidTarget] = useState<Payment | null>(null)

  const filtered = payments.filter(p =>
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.client.toLowerCase().includes(search.toLowerCase()) ||
    p.invoice.toLowerCase().includes(search.toLowerCase())
  )

  const total = payments.reduce((s, p) => s + parseAmount(p.amount), 0)
  const latestMonth = payments.map(p => p.date.slice(0, 7)).sort().at(-1) ?? ""
  const monthTotal = payments.filter(p => p.date.startsWith(latestMonth)).reduce((s, p) => s + parseAmount(p.amount), 0)
  const pendingTotal = payments.filter(p => p.status === "Pending").reduce((s, p) => s + parseAmount(p.amount), 0)

  const stats = [
    { label: "Received This Month", value: formatAmount(monthTotal) },
    { label: "YTD Collections", value: formatAmount(total) },
    { label: "Pending Clearance", value: formatAmount(pendingTotal) },
    { label: "Transactions", value: String(payments.length) },
  ]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.invoice.trim()) e.invoice = "Invoice reference is required"
    if (!form.client) e.client = "Select a client"
    if (!form.amount.trim()) e.amount = "Amount is required"
    else if (!/^\d+(\.\d{1,2})?$/.test(form.amount) || Number(form.amount) <= 0) e.amount = "Enter a positive amount"
    if (!form.method) e.method = "Select a payment method"
    if (!form.ref.trim()) e.ref = "Transaction reference is required"
    if (!form.date.trim()) e.date = "Payment date is required"
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) e.date = "Use format YYYY-MM-DD"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createPayment() {
    if (!validate()) return
    const seq = 202 + payments.filter(p => p.id.startsWith("PAY-2024-02")).length - 2
    const next: Payment = {
      id: `PAY-2024-0${seq}`,
      invoice: form.invoice.trim().toUpperCase(),
      client: form.client,
      amount: formatAmount(Number(form.amount)),
      method: form.method,
      ref: form.ref.trim().toUpperCase(),
      date: form.date.trim(),
      status: "Pending",
    }
    setPayments(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Payment recorded", `${next.id} — ${next.amount} from ${next.client}.`)
  }

  function advance(p: Payment) {
    const nextStatus = p.status === "Pending" ? "Confirmed" : "Cleared"
    setPayments(prev => prev.map(x => x.id === p.id ? { ...x, status: nextStatus } : x))
    setDetail(prev => prev && prev.id === p.id ? { ...prev, status: nextStatus } : prev)
    notify.success(`Payment ${nextStatus.toLowerCase()}`, `${p.id} is now ${nextStatus}.`)
  }

  function voidPayment(p: Payment) {
    setPayments(prev => prev.filter(x => x.id !== p.id))
    setDetail(null)
    notify.warning("Payment voided", `${p.id} has been reversed and removed.`)
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold text-foreground">Payments</h1><p className="text-sm text-muted-foreground mt-0.5">All recorded payment transactions</p></div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="payments" />
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> Record Payment</button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search payment ID, invoice, client..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>{["Payment ID", "Invoice", "Client", "Amount", "Method", "Reference", "Date", "Status", ""].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{p.id}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.invoice}</td>
                <td className="px-4 py-3 text-foreground">{p.client}</td>
                <td className="px-4 py-3 font-semibold text-success">{p.amount}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.method}</td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{p.ref}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.date}</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusStyle[p.status])}>{p.status}</span></td>
                <td className="px-4 py-3">
                  <button onClick={() => setDetail(p)} title="View payment details" className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">No payments match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="Record Payment"
        description="Log a client remittance against an invoice"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createPayment} submitLabel="Record Payment" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Invoice" required error={errors.invoice}>
            <TextInput value={form.invoice} invalid={!!errors.invoice} onChange={e => setForm({ ...form, invoice: e.target.value })} placeholder="e.g. INV-2024-0441" />
          </Field>
          <Field label="Client" required error={errors.client}>
            <Select value={form.client} invalid={!!errors.client} onChange={e => setForm({ ...form, client: e.target.value })} options={CLIENTS} placeholder="Select Client" />
          </Field>
          <Field label="Amount (₹)" required error={errors.amount}>
            <TextInput value={form.amount} invalid={!!errors.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="e.g. 25800" inputMode="numeric" />
          </Field>
          <Field label="Method" required error={errors.method}>
            <Select value={form.method} invalid={!!errors.method} onChange={e => setForm({ ...form, method: e.target.value })} options={METHODS} placeholder="Select Method" />
          </Field>
          <Field label="Reference" required error={errors.ref}>
            <TextInput value={form.ref} invalid={!!errors.ref} onChange={e => setForm({ ...form, ref: e.target.value })} placeholder="e.g. NEFT-20240725" />
          </Field>
          <Field label="Payment Date" required error={errors.date} hint="YYYY-MM-DD">
            <TextInput value={form.date} invalid={!!errors.date} onChange={e => setForm({ ...form, date: e.target.value })} placeholder="2024-07-25" />
          </Field>
        </div>
      </Modal>

      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Payment transaction detail"
        footer={
          <>
            <button onClick={() => detail && setVoidTarget(detail)} className="rounded-lg border border-danger/30 px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10">
              Void Payment
            </button>
            {detail && detail.status !== "Cleared" && (
              <button onClick={() => advance(detail)} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
                {detail.status === "Pending" ? "Confirm Payment" : "Mark Cleared"}
              </button>
            )}
            <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Close
            </button>
          </>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Payment ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Invoice" value={<span className="font-mono">{detail.invoice}</span>} />
            <DetailRow label="Client" value={detail.client} />
            <DetailRow label="Amount" value={<span className="font-bold text-success">{detail.amount}</span>} />
            <DetailRow label="Method" value={detail.method} />
            <DetailRow label="Reference" value={<span className="font-mono">{detail.ref}</span>} />
            <DetailRow label="Date" value={detail.date} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusStyle[detail.status])}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!voidTarget}
        onOpenChange={(o) => !o && setVoidTarget(null)}
        title="Void this payment?"
        message={`${voidTarget?.id} (${voidTarget?.amount} from ${voidTarget?.client}) will be reversed. This cannot be undone.`}
        confirmLabel="Void Payment"
        cancelLabel="Keep It"
        onConfirm={() => voidTarget && voidPayment(voidTarget)}
      />
    </div>
  )
}
