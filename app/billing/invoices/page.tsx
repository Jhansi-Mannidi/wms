"use client"
import { useState } from "react"
import { Search, Plus, Download, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Invoice = {
  id: string; client: string; period: string; storage: string; handling: string
  vas: string; total: string; issued: string; due: string; status: string
}

const initialInvoices: Invoice[] = [
  { id: "INV-2024-0441", client: "Acme Foods", period: "Jun 2024", storage: "₹18,400", handling: "₹6,200", vas: "₹1,500", total: "₹26,100", issued: "2024-07-01", due: "2024-07-31", status: "Unpaid" },
  { id: "INV-2024-0440", client: "Global Oils", period: "Jun 2024", storage: "₹12,000", handling: "₹4,100", vas: "₹0", total: "₹16,100", issued: "2024-07-01", due: "2024-07-31", status: "Unpaid" },
  { id: "INV-2024-0430", client: "Acme Foods", period: "May 2024", storage: "₹17,800", handling: "₹5,900", vas: "₹2,100", total: "₹25,800", issued: "2024-06-01", due: "2024-06-30", status: "Paid" },
  { id: "INV-2024-0429", client: "Agro Corp", period: "May 2024", storage: "₹8,400", handling: "₹2,200", vas: "₹0", total: "₹10,600", issued: "2024-06-01", due: "2024-06-30", status: "Overdue" },
  { id: "INV-2024-0420", client: "Sweet Mills", period: "Apr 2024", storage: "₹6,200", handling: "₹1,800", vas: "₹400", total: "₹8,400", issued: "2024-05-01", due: "2024-05-31", status: "Paid" },
]

const statusStyle: Record<string, string> = {
  Paid: "bg-success/10 text-success",
  Unpaid: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Overdue: "bg-danger/10 text-danger",
}

const CLIENTS = ["Acme Foods", "Global Oils", "Agro Corp", "Sweet Mills", "Salt Works", "Fresh Farms"] as const

function parseAmount(a: string) {
  return Number(a.replace(/[^0-9.]/g, "")) || 0
}
function formatAmount(n: number) {
  return `₹${n.toLocaleString("en-IN")}`
}

const emptyForm = { client: "", period: "", storage: "", handling: "", vas: "", due: "" }

export default function BillingInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Invoice | null>(null)
  const [paidTarget, setPaidTarget] = useState<Invoice | null>(null)

  const filtered = invoices.filter(i =>
    (statusFilter === "All" || i.status === statusFilter) &&
    (i.id.toLowerCase().includes(search.toLowerCase()) || i.client.toLowerCase().includes(search.toLowerCase()))
  )

  const sumBy = (pred: (i: Invoice) => boolean) =>
    invoices.filter(pred).reduce((s, i) => s + parseAmount(i.total), 0)

  const stats = [
    { label: "Total Invoiced (YTD)", value: formatAmount(sumBy(() => true)) },
    { label: "Unpaid", value: formatAmount(sumBy(i => i.status === "Unpaid")), cls: "text-amber-600" },
    { label: "Overdue", value: formatAmount(sumBy(i => i.status === "Overdue")), cls: "text-danger" },
    { label: "Collected", value: formatAmount(sumBy(i => i.status === "Paid")), cls: "text-success" },
  ]

  function validate() {
    const e: Record<string, string> = {}
    const money = (v: string) => /^\d+(\.\d{1,2})?$/.test(v)
    if (!form.client) e.client = "Select a client"
    if (!form.period.trim()) e.period = "Billing period is required"
    if (!form.storage.trim()) e.storage = "Storage charge is required"
    else if (!money(form.storage)) e.storage = "Enter a valid amount"
    if (!form.handling.trim()) e.handling = "Handling charge is required"
    else if (!money(form.handling)) e.handling = "Enter a valid amount"
    if (form.vas.trim() && !money(form.vas)) e.vas = "Enter a valid amount"
    if (!form.due.trim()) e.due = "Due date is required"
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.due)) e.due = "Use format YYYY-MM-DD"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createInvoice() {
    if (!validate()) return
    const storage = Number(form.storage)
    const handling = Number(form.handling)
    const vas = form.vas.trim() ? Number(form.vas) : 0
    const seq = 442 + invoices.filter(i => i.id.startsWith("INV-2024-04")).length - 5
    const next: Invoice = {
      id: `INV-2024-0${seq}`,
      client: form.client,
      period: form.period.trim(),
      storage: formatAmount(storage),
      handling: formatAmount(handling),
      vas: formatAmount(vas),
      total: formatAmount(storage + handling + vas),
      issued: new Date().toISOString().slice(0, 10),
      due: form.due.trim(),
      status: "Unpaid",
    }
    setInvoices(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Invoice generated", `${next.id} for ${next.client} — ${next.total}.`)
  }

  function markPaid(inv: Invoice) {
    setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: "Paid" } : i))
    setDetail(null)
    notify.success("Payment recorded", `${inv.id} marked Paid — ${inv.total} collected.`)
  }

  function download(inv: Invoice) {
    notify.info("Invoice PDF ready", `${inv.id} (${inv.total}) prepared for download.`)
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold text-foreground">Invoices</h1><p className="text-sm text-muted-foreground mt-0.5">All client billing invoices</p></div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="invoices" />
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> Generate Invoice</button>
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoice ID, client..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
        </div>
        {["All", "Unpaid", "Paid", "Overdue"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", statusFilter === s ? "bg-brand text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground")}>{s}</button>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>{["Invoice ID", "Client", "Period", "Storage", "Handling", "VAS", "Total", "Issued", "Due", "Status", ""].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(i => (
              <tr key={i.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{i.id}</td>
                <td className="px-4 py-3 text-foreground">{i.client}</td>
                <td className="px-4 py-3 text-muted-foreground">{i.period}</td>
                <td className="px-4 py-3 text-foreground">{i.storage}</td>
                <td className="px-4 py-3 text-foreground">{i.handling}</td>
                <td className="px-4 py-3 text-foreground">{i.vas}</td>
                <td className="px-4 py-3 font-semibold text-foreground">{i.total}</td>
                <td className="px-4 py-3 text-muted-foreground">{i.issued}</td>
                <td className="px-4 py-3 text-foreground">{i.due}</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusStyle[i.status])}>{i.status}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setDetail(i)} title="View invoice" className="text-muted-foreground hover:text-foreground transition-colors"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => download(i)} title="Download PDF" className="text-brand hover:text-brand/70 transition-colors"><Download className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={11} className="px-4 py-10 text-center text-sm text-muted-foreground">No invoices match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="Generate Invoice"
        description="Charges are totalled automatically"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createInvoice} submitLabel="Generate Invoice" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Client" required error={errors.client}>
            <Select value={form.client} invalid={!!errors.client} onChange={e => setForm({ ...form, client: e.target.value })} options={CLIENTS} placeholder="Select Client" />
          </Field>
          <Field label="Billing Period" required error={errors.period}>
            <TextInput value={form.period} invalid={!!errors.period} onChange={e => setForm({ ...form, period: e.target.value })} placeholder="e.g. Jul 2024" />
          </Field>
          <Field label="Storage Charge (₹)" required error={errors.storage}>
            <TextInput value={form.storage} invalid={!!errors.storage} onChange={e => setForm({ ...form, storage: e.target.value })} placeholder="e.g. 18400" inputMode="numeric" />
          </Field>
          <Field label="Handling Charge (₹)" required error={errors.handling}>
            <TextInput value={form.handling} invalid={!!errors.handling} onChange={e => setForm({ ...form, handling: e.target.value })} placeholder="e.g. 6200" inputMode="numeric" />
          </Field>
          <Field label="VAS Charge (₹)" error={errors.vas} hint="Optional — defaults to 0">
            <TextInput value={form.vas} invalid={!!errors.vas} onChange={e => setForm({ ...form, vas: e.target.value })} placeholder="e.g. 1500" inputMode="numeric" />
          </Field>
          <Field label="Due Date" required error={errors.due} hint="YYYY-MM-DD">
            <TextInput value={form.due} invalid={!!errors.due} onChange={e => setForm({ ...form, due: e.target.value })} placeholder="2024-08-31" />
          </Field>
        </div>
      </Modal>

      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Invoice detail"
        footer={
          <>
            {detail && detail.status !== "Paid" && (
              <button onClick={() => setPaidTarget(detail)} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
                Mark as Paid
              </button>
            )}
            <button onClick={() => detail && download(detail)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Download PDF
            </button>
            <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Close
            </button>
          </>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Invoice ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Client" value={detail.client} />
            <DetailRow label="Period" value={detail.period} />
            <DetailRow label="Storage" value={detail.storage} />
            <DetailRow label="Handling" value={detail.handling} />
            <DetailRow label="VAS" value={detail.vas} />
            <DetailRow label="Total" value={<span className="font-bold">{detail.total}</span>} />
            <DetailRow label="Issued" value={detail.issued} />
            <DetailRow label="Due" value={detail.due} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusStyle[detail.status])}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!paidTarget}
        onOpenChange={(o) => !o && setPaidTarget(null)}
        title="Mark this invoice as paid?"
        message={`${paidTarget?.id} for ${paidTarget?.client} (${paidTarget?.total}) will be recorded as collected.`}
        confirmLabel="Mark Paid"
        cancelLabel="Not Yet"
        tone="brand"
        onConfirm={() => paidTarget && markPaid(paidTarget)}
      />
    </div>
  )
}
