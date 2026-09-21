"use client"

import { useState } from "react"
import {
  DollarSign, FileText, Clock, CheckCircle2, AlertTriangle,
  Plus, Eye, MoreHorizontal, ChevronDown, Search, Send, Download
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { EmptyState } from "@/components/wms/empty-state"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Invoice = {
  id: string; client: string; period: string; services: string[]
  amount: string; due: string; status: string; raised: string
}

type ContractRate = { client: string; service: string; rate: string; uom: string }

const initialInvoices: Invoice[] = [
  { id: "INV-2026-112", client: "Acme Foods", period: "Jul 1–15, 2026", services: ["Storage", "Handling", "Transport"], amount: "₹1,24,500", due: "2026-07-30", status: "Pending", raised: "2026-07-16" },
  { id: "INV-2026-111", client: "Global Oils", period: "Jun 16–30, 2026", services: ["Storage", "Palletization"], amount: "₹68,200", due: "2026-07-19", status: "Overdue", raised: "2026-07-01" },
  { id: "INV-2026-110", client: "Agro Corp", period: "Jun 1–15, 2026", services: ["Storage", "Handling"], amount: "₹45,000", due: "2026-06-30", status: "Paid", raised: "2026-06-16" },
  { id: "INV-2026-109", client: "Sweet Mills", period: "May 16–31, 2026", services: ["Transport", "Handling"], amount: "₹32,800", due: "2026-06-20", status: "Paid", raised: "2026-06-01" },
  { id: "INV-2026-108", client: "Salt Works", period: "May 1–15, 2026", services: ["Storage"], amount: "₹18,600", due: "2026-05-30", status: "Paid", raised: "2026-05-16" },
  { id: "INV-2026-107", client: "Fresh Farms", period: "Jul 1–15, 2026", services: ["Cold Storage", "Handling"], amount: "₹89,400", due: "2026-07-28", status: "Draft", raised: "2026-07-15" },
  { id: "INV-2026-106", client: "Acme Foods", period: "Jun 16–30, 2026", services: ["Storage", "Handling"], amount: "₹1,12,300", due: "2026-07-15", status: "Paid", raised: "2026-07-01" },
  { id: "INV-2026-105", client: "Global Oils", period: "Jun 1–15, 2026", services: ["Storage", "Transport"], amount: "₹74,850", due: "2026-06-30", status: "Paid", raised: "2026-06-16" },
  { id: "INV-2026-104", client: "Fresh Farms", period: "Jun 16–30, 2026", services: ["Cold Storage", "Handling", "Transport"], amount: "₹96,700", due: "2026-07-25", status: "Pending", raised: "2026-07-02" },
  { id: "INV-2026-103", client: "Sweet Mills", period: "Jun 1–15, 2026", services: ["Storage", "Palletization"], amount: "₹41,200", due: "2026-06-28", status: "Paid", raised: "2026-06-16" },
  { id: "INV-2026-102", client: "Agro Corp", period: "May 16–31, 2026", services: ["Storage", "Handling", "Transport"], amount: "₹58,900", due: "2026-06-18", status: "Overdue", raised: "2026-06-01" },
  { id: "INV-2026-101", client: "Salt Works", period: "Jun 1–15, 2026", services: ["Storage", "Handling"], amount: "₹22,400", due: "2026-06-30", status: "Paid", raised: "2026-06-16" },
  { id: "INV-2026-100", client: "Acme Foods", period: "Jun 1–15, 2026", services: ["Storage", "Handling", "Palletization"], amount: "₹1,08,600", due: "2026-06-30", status: "Paid", raised: "2026-06-16" },
  { id: "INV-2026-099", client: "Global Oils", period: "May 16–31, 2026", services: ["Storage", "Palletization"], amount: "₹66,400", due: "2026-06-15", status: "Paid", raised: "2026-06-01" },
  { id: "INV-2026-098", client: "Fresh Farms", period: "Jun 1–15, 2026", services: ["Cold Storage"], amount: "₹78,200", due: "2026-06-30", status: "Paid", raised: "2026-06-16" },
  { id: "INV-2026-097", client: "Sweet Mills", period: "May 16–31, 2026", services: ["Transport", "Handling"], amount: "₹35,600", due: "2026-06-15", status: "Overdue", raised: "2026-06-01" },
  { id: "INV-2026-096", client: "Agro Corp", period: "May 1–15, 2026", services: ["Storage", "Handling"], amount: "₹47,300", due: "2026-05-30", status: "Paid", raised: "2026-05-16" },
  { id: "INV-2026-095", client: "Salt Works", period: "May 16–31, 2026", services: ["Storage", "Transport"], amount: "₹26,800", due: "2026-06-15", status: "Paid", raised: "2026-06-01" },
  { id: "INV-2026-094", client: "Acme Foods", period: "May 16–31, 2026", services: ["Storage", "Handling", "Transport"], amount: "₹1,18,900", due: "2026-06-15", status: "Paid", raised: "2026-06-01" },
  { id: "INV-2026-093", client: "Global Oils", period: "May 1–15, 2026", services: ["Storage", "Handling"], amount: "₹71,500", due: "2026-05-30", status: "Paid", raised: "2026-05-16" },
  { id: "INV-2026-092", client: "Fresh Farms", period: "May 16–31, 2026", services: ["Cold Storage", "Transport"], amount: "₹84,100", due: "2026-06-15", status: "Paid", raised: "2026-06-01" },
  { id: "INV-2026-091", client: "Sweet Mills", period: "Jul 1–15, 2026", services: ["Storage", "Handling"], amount: "₹38,900", due: "2026-07-30", status: "Pending", raised: "2026-07-16" },
  { id: "INV-2026-090", client: "Salt Works", period: "Jul 1–15, 2026", services: ["Storage"], amount: "₹21,300", due: "2026-07-30", status: "Draft", raised: "2026-07-16" },
  { id: "INV-2026-089", client: "Agro Corp", period: "Jul 1–15, 2026", services: ["Storage", "Palletization"], amount: "₹52,700", due: "2026-07-30", status: "Pending", raised: "2026-07-16" },
  { id: "INV-2026-088", client: "Global Oils", period: "Jul 1–15, 2026", services: ["Storage", "Handling", "Transport"], amount: "₹81,600", due: "2026-07-30", status: "Draft", raised: "2026-07-16" },
  { id: "INV-2026-087", client: "Salt Works", period: "Apr 16–30, 2026", services: ["Storage", "Handling"], amount: "₹19,800", due: "2026-05-15", status: "Overdue", raised: "2026-05-01" },
  { id: "INV-2026-086", client: "Acme Foods", period: "May 1–15, 2026", services: ["Storage", "Handling"], amount: "₹1,02,400", due: "2026-05-30", status: "Paid", raised: "2026-05-16" },
]

const statusConfig: Record<string, { color: string; bg: string }> = {
  Paid: { color: "text-success", bg: "bg-success/15" },
  Pending: { color: "text-warning", bg: "bg-warning/15" },
  Overdue: { color: "text-danger", bg: "bg-danger/15" },
  Draft: { color: "text-muted-foreground", bg: "bg-muted" },
}

const initialContractRates: ContractRate[] = [
  { client: "Acme Foods", service: "Storage (per pallet/month)", rate: "₹850", uom: "Per Pallet" },
  { client: "Acme Foods", service: "Inward Handling", rate: "₹12", uom: "Per Unit" },
  { client: "Acme Foods", service: "Outward Handling", rate: "₹15", uom: "Per Unit" },
  { client: "Global Oils", service: "Storage (per pallet/month)", rate: "₹920", uom: "Per Pallet" },
  { client: "Global Oils", service: "Palletization", rate: "₹180", uom: "Per Pallet" },
  { client: "Global Oils", service: "Outward Handling", rate: "₹14", uom: "Per Unit" },
  { client: "Global Oils", service: "Line Haul Transport", rate: "₹4,200", uom: "Per Trip" },
  { client: "Agro Corp", service: "Storage (per pallet/month)", rate: "₹780", uom: "Per Pallet" },
  { client: "Agro Corp", service: "Inward Handling", rate: "₹10", uom: "Per Unit" },
  { client: "Agro Corp", service: "Outward Handling", rate: "₹13", uom: "Per Unit" },
  { client: "Agro Corp", service: "Last Mile Transport", rate: "₹3,600", uom: "Per Trip" },
  { client: "Sweet Mills", service: "Storage (per pallet/month)", rate: "₹720", uom: "Per Pallet" },
  { client: "Sweet Mills", service: "Palletization", rate: "₹160", uom: "Per Pallet" },
  { client: "Sweet Mills", service: "Outward Handling", rate: "₹11", uom: "Per Unit" },
  { client: "Salt Works", service: "Storage (per pallet/month)", rate: "₹650", uom: "Per Pallet" },
  { client: "Salt Works", service: "Inward Handling", rate: "₹9", uom: "Per Unit" },
  { client: "Salt Works", service: "Dedicated Space Rental", rate: "₹48,000", uom: "Per Month" },
  { client: "Fresh Farms", service: "Cold Storage (per pallet/month)", rate: "₹1,450", uom: "Per Pallet" },
  { client: "Fresh Farms", service: "Inward Handling", rate: "₹18", uom: "Per Unit" },
  { client: "Fresh Farms", service: "Outward Handling", rate: "₹21", uom: "Per Unit" },
  { client: "Fresh Farms", service: "Reefer Transport", rate: "₹6,800", uom: "Per Trip" },
  { client: "Acme Foods", service: "Palletization", rate: "₹175", uom: "Per Pallet" },
  { client: "Acme Foods", service: "Line Haul Transport", rate: "₹4,500", uom: "Per Trip" },
  { client: "Acme Foods", service: "Dedicated Space Rental", rate: "₹92,000", uom: "Per Month" },
  { client: "Global Oils", service: "Dedicated Space Rental", rate: "₹64,000", uom: "Per Month" },
  { client: "Sweet Mills", service: "Last Mile Transport", rate: "₹3,200", uom: "Per Trip" },
]

const reportCards = [
  { title: "Monthly Revenue Report", desc: "Revenue breakdown by client and service type", icon: <DollarSign className="w-5 h-5" /> },
  { title: "Outstanding Payments", desc: "Overdue and pending invoice summary", icon: <AlertTriangle className="w-5 h-5" /> },
  { title: "Client-wise Billing", desc: "Per-client billing history and trends", icon: <FileText className="w-5 h-5" /> },
  { title: "Service-wise Revenue", desc: "Storage vs handling vs transport breakdown", icon: <CheckCircle2 className="w-5 h-5" /> },
]

const CLIENTS = ["Acme Foods", "Global Oils", "Agro Corp", "Sweet Mills", "Salt Works", "Fresh Farms"] as const
const SERVICES = ["Storage", "Cold Storage", "Handling", "Transport", "Palletization"] as const
const UOMS = ["Per Pallet", "Per Unit", "Per Trip", "Per Month"] as const
const PAGE_SIZE = 5

function parseAmount(a: string) {
  return Number(a.replace(/[^0-9.]/g, "")) || 0
}
function formatAmount(n: number) {
  return `₹${n.toLocaleString("en-IN")}`
}
function today() {
  return new Date().toISOString().slice(0, 10)
}

const emptyInvoiceForm = { client: "", period: "", amount: "", due: "", services: [] as string[] }
const emptyRateForm = { client: "", service: "", rate: "", uom: "" }

export default function BillingPage() {
  const [tab, setTab] = useState<"invoices" | "rates" | "reports">("invoices")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [clientFilter, setClientFilter] = useState("All Clients")
  const [page, setPage] = useState(1)

  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [contractRates, setContractRates] = useState<ContractRate[]>(initialContractRates)
  const [reportRuns, setReportRuns] = useState<Record<string, string>>({})

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null)
  const [invoiceForm, setInvoiceForm] = useState(emptyInvoiceForm)
  const [invoiceErrors, setInvoiceErrors] = useState<Record<string, string>>({})

  const [rateModalOpen, setRateModalOpen] = useState(false)
  const [editRateIndex, setEditRateIndex] = useState<number | null>(null)
  const [rateForm, setRateForm] = useState(emptyRateForm)
  const [rateErrors, setRateErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Invoice | null>(null)
  const [deleteInvoice, setDeleteInvoice] = useState<Invoice | null>(null)
  const [deleteRateIndex, setDeleteRateIndex] = useState<number | null>(null)
  const [docsTarget, setDocsTarget] = useState<Invoice | null>(null)

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase()
    return (
      (inv.id.toLowerCase().includes(q) || inv.client.toLowerCase().includes(q)) &&
      (statusFilter === "All Status" || inv.status === statusFilter) &&
      (clientFilter === "All Clients" || inv.client === clientFilter)
    )
  })

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const totalBilled = invoices.reduce((s, i) => s + parseAmount(i.amount), 0)
  const pendingInvoices = invoices.filter((i) => i.status === "Pending" || i.status === "Overdue")
  const pendingTotal = pendingInvoices.reduce((s, i) => s + parseAmount(i.amount), 0)
  const overdueInvoices = invoices.filter((i) => i.status === "Overdue")
  const overdueTotal = overdueInvoices.reduce((s, i) => s + parseAmount(i.amount), 0)
  const collectedTotal = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + parseAmount(i.amount), 0)

  /* ---------------- invoices ---------------- */

  function openNewInvoice() {
    setEditInvoice(null)
    setInvoiceForm(emptyInvoiceForm)
    setInvoiceErrors({})
    setInvoiceModalOpen(true)
  }

  function openEditInvoice(inv: Invoice) {
    setEditInvoice(inv)
    setInvoiceForm({
      client: inv.client, period: inv.period, amount: String(parseAmount(inv.amount)),
      due: inv.due, services: [...inv.services],
    })
    setInvoiceErrors({})
    setDetail(null)
    setInvoiceModalOpen(true)
  }

  function toggleService(s: string) {
    setInvoiceForm((f) => ({
      ...f,
      services: f.services.includes(s) ? f.services.filter((x) => x !== s) : [...f.services, s],
    }))
  }

  function validateInvoice() {
    const e: Record<string, string> = {}
    if (!invoiceForm.client) e.client = "Select a client"
    if (!invoiceForm.period.trim()) e.period = "Billing period is required"
    if (!invoiceForm.amount.trim()) e.amount = "Amount is required"
    else if (!/^\d+(\.\d{1,2})?$/.test(invoiceForm.amount) || Number(invoiceForm.amount) <= 0) e.amount = "Enter a positive amount"
    if (!invoiceForm.due.trim()) e.due = "Due date is required"
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(invoiceForm.due)) e.due = "Use format YYYY-MM-DD"
    if (invoiceForm.services.length === 0) e.services = "Select at least one service"
    setInvoiceErrors(e)
    return Object.keys(e).length === 0
  }

  function submitInvoice() {
    if (!validateInvoice()) return
    if (editInvoice) {
      setInvoices((prev) => prev.map((i) => (i.id === editInvoice.id ? {
        ...i, client: invoiceForm.client, period: invoiceForm.period.trim(),
        amount: formatAmount(Number(invoiceForm.amount)), due: invoiceForm.due.trim(),
        services: invoiceForm.services,
      } : i)))
      notify.success("Invoice updated", `${editInvoice.id} has been saved.`)
    } else {
      const nextNum = 113 + invoices.filter((i) => i.id.startsWith("INV-2026-1")).length - 6
      const next: Invoice = {
        id: `INV-2026-${nextNum}`,
        client: invoiceForm.client,
        period: invoiceForm.period.trim(),
        services: invoiceForm.services,
        amount: formatAmount(Number(invoiceForm.amount)),
        due: invoiceForm.due.trim(),
        status: "Draft",
        raised: today(),
      }
      setInvoices((prev) => [next, ...prev])
      setPage(1)
      notify.success("Invoice created", `${next.id} for ${next.client} — ${next.amount}.`)
    }
    setInvoiceModalOpen(false)
    setEditInvoice(null)
    setInvoiceForm(emptyInvoiceForm)
    setInvoiceErrors({})
  }

  function sendInvoice(inv: Invoice) {
    if (inv.status === "Paid") {
      notify.info("Already settled", `${inv.id} is paid — nothing to send.`)
      return
    }
    setInvoices((prev) => prev.map((i) => (i.id === inv.id ? { ...i, status: "Pending", raised: today() } : i)))
    notify.success("Invoice sent", `${inv.id} emailed to ${inv.client} — status set to Pending.`)
  }

  function markPaid(inv: Invoice) {
    setInvoices((prev) => prev.map((i) => (i.id === inv.id ? { ...i, status: "Paid" } : i)))
    setDetail(null)
    notify.success("Payment recorded", `${inv.id} marked Paid — ${inv.amount} collected.`)
  }

  function removeInvoice(inv: Invoice) {
    setInvoices((prev) => prev.filter((i) => i.id !== inv.id))
    setDetail(null)
    notify.warning("Invoice deleted", `${inv.id} has been removed.`)
  }

  function downloadDoc(inv: Invoice, doc: string) {
    notify.success(`${doc} downloaded`, `${doc} for ${inv.id} (${inv.client}, ${inv.period}) generated as PDF.`)
  }

  /* ---------------- contract rates ---------------- */

  function openNewRate() {
    setEditRateIndex(null)
    setRateForm(emptyRateForm)
    setRateErrors({})
    setRateModalOpen(true)
  }

  function openEditRate(index: number) {
    const r = contractRates[index]
    setEditRateIndex(index)
    setRateForm({ client: r.client, service: r.service, rate: String(parseAmount(r.rate)), uom: r.uom })
    setRateErrors({})
    setRateModalOpen(true)
  }

  function validateRate() {
    const e: Record<string, string> = {}
    if (!rateForm.client) e.client = "Select a client"
    if (!rateForm.service.trim()) e.service = "Service name is required"
    if (!rateForm.rate.trim()) e.rate = "Rate is required"
    else if (!/^\d+(\.\d{1,2})?$/.test(rateForm.rate) || Number(rateForm.rate) <= 0) e.rate = "Enter a positive amount"
    if (!rateForm.uom) e.uom = "Select a unit of measure"
    setRateErrors(e)
    return Object.keys(e).length === 0
  }

  function submitRate() {
    if (!validateRate()) return
    const row: ContractRate = {
      client: rateForm.client,
      service: rateForm.service.trim(),
      rate: formatAmount(Number(rateForm.rate)),
      uom: rateForm.uom,
    }
    if (editRateIndex !== null) {
      setContractRates((prev) => prev.map((r, i) => (i === editRateIndex ? row : r)))
      notify.success("Rate updated", `${row.client} — ${row.service} is now ${row.rate}.`)
    } else {
      setContractRates((prev) => [row, ...prev])
      notify.success("Rate added", `${row.client} — ${row.service} at ${row.rate} ${row.uom}.`)
    }
    setRateModalOpen(false)
    setEditRateIndex(null)
    setRateForm(emptyRateForm)
    setRateErrors({})
  }

  function removeRate(index: number) {
    const r = contractRates[index]
    setContractRates((prev) => prev.filter((_, i) => i !== index))
    notify.warning("Rate removed", `${r.client} — ${r.service} deleted from the rate card.`)
  }

  /* ---------------- reports ---------------- */

  function generateReport(title: string) {
    const at = new Date().toTimeString().slice(0, 5)
    setReportRuns((prev) => ({ ...prev, [title]: `Today ${at}` }))
    notify.success("Report generated", `${title} built from ${invoices.length} invoices.`)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="w-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Billing & Invoicing</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage contracts, invoices and payments</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ExportButton data={filtered.map(inv => ({ ...inv, services: inv.services.join(", ") }))} filename="billing-invoices" />
            <button onClick={openNewInvoice} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
              <Plus className="w-4 h-4" /> New Invoice
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Billed", value: formatAmount(totalBilled), sub: `${invoices.length} invoices`, icon: <DollarSign className="w-5 h-5" />, subColor: "text-success" },
            { label: "Pending Collection", value: formatAmount(pendingTotal), sub: `${pendingInvoices.length} invoice${pendingInvoices.length === 1 ? "" : "s"}`, icon: <Clock className="w-5 h-5" />, subColor: "text-warning" },
            { label: "Overdue Amount", value: formatAmount(overdueTotal), sub: `${overdueInvoices.length} invoice${overdueInvoices.length === 1 ? "" : "s"} overdue`, icon: <AlertTriangle className="w-5 h-5" />, subColor: "text-danger" },
            { label: "Collected", value: formatAmount(collectedTotal), sub: "Settled to date", icon: <CheckCircle2 className="w-5 h-5" />, subColor: "text-success" },
          ].map((stat, i) => (
            <div key={i} className="p-5 rounded-2xl border border-border bg-card">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className={cn(i === 2 ? "text-danger" : "text-brand")}>{stat.icon}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className={cn("text-xs mt-1", stat.subColor)}>{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-muted/50 w-fit">
          {(["invoices", "rates", "reports"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors",
                tab === t ? "bg-brand text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/60"
              )}
            >
              {t === "rates" ? "Contract Rates" : t === "reports" ? "Reports" : "Invoices"}
            </button>
          ))}
        </div>

        {tab === "invoices" && (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-xl border border-border bg-card">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground text-foreground" placeholder="Search invoice, client..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
              </div>
              {[
                { value: statusFilter, options: ["All Status", "Draft", "Pending", "Overdue", "Paid"], onChange: setStatusFilter },
                { value: clientFilter, options: ["All Clients", "Acme Foods", "Global Oils", "Agro Corp", "Sweet Mills", "Salt Works", "Fresh Farms"], onChange: setClientFilter },
              ].map((f, i) => (
                <div key={i} className="relative">
                  <select className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-border bg-card text-sm text-foreground outline-none cursor-pointer" value={f.value} onChange={(e) => { f.onChange(e.target.value); setPage(1) }}>
                    {f.options.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {["Invoice ID", "Client", "Period", "Services", "Amount", "Due Date", "Raised On", "Status", ""].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((inv, i) => (
                      <tr key={inv.id} className={cn("border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors", i % 2 === 1 ? "bg-muted/10" : "")}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button onClick={() => setDetail(inv)} title="View invoice" className="text-brand font-medium hover:underline cursor-pointer flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" /> {inv.id}
                          </button>
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{inv.client}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{inv.period}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {inv.services.map((s) => (
                              <span key={s} className="px-1.5 py-0.5 rounded-md bg-brand/10 text-brand text-[10px] font-medium whitespace-nowrap">{s}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-bold text-foreground whitespace-nowrap">{inv.amount}</td>
                        <td className={cn("px-4 py-3 whitespace-nowrap text-xs font-medium", inv.status === "Overdue" ? "text-danger" : "text-muted-foreground")}>{inv.due}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{inv.raised}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusConfig[inv.status]?.bg, statusConfig[inv.status]?.color)}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <RowActions
                            items={[
                              { label: "View", icon: <Eye />, onSelect: () => setDetail(inv) },
                              { label: "Send", icon: <Send />, onSelect: () => sendInvoice(inv) },
                              { label: "Documents", icon: <Download />, onSelect: () => setDocsTarget(inv) },
                              { label: "Edit invoice", icon: <MoreHorizontal />, onSelect: () => openEditInvoice(inv) },
                            ]}
                          />
                        </td>
                      </tr>
                    ))}
                    {paged.length === 0 && (
                      <tr><td colSpan={9}>
                        <EmptyState
                          icon={Search}
                          title="No invoices match your filters"
                          description="Try a different search term or clear the active filters."
                          action={{ label: "Clear Filters", onClick: () => { setSearch(""); setStatusFilter("All Status"); setClientFilter("All Clients") } }}
                        />
                      </td></tr>
                    )}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <FileText className="w-10 h-10 mb-3 opacity-40" />
                    <p className="font-medium">No invoices found</p>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
                <span className="text-xs text-muted-foreground">Showing {paged.length} of {filtered.length} invoices</span>
                <div className="flex gap-1">
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setPage(p)} title={`Go to page ${p}`} className={cn("w-7 h-7 rounded-lg text-xs transition-colors", p === currentPage ? "bg-brand text-white" : "text-muted-foreground hover:bg-muted")}>{p}</button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {tab === "rates" && (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Contract Rate Card</h2>
              <button onClick={openNewRate} className="flex items-center gap-1.5 text-xs text-brand hover:underline">
                <Plus className="w-3.5 h-3.5" /> Add Rate
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    {["Client", "Service", "Rate", "UOM", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contractRates.map((r, i) => (
                    <tr key={`${r.client}-${r.service}-${i}`} className={cn("border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors", i % 2 === 1 ? "bg-muted/10" : "")}>
                      <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{r.client}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.service}</td>
                      <td className="px-4 py-3 font-bold text-foreground whitespace-nowrap">{r.rate}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{r.uom}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => openEditRate(i)} title="Edit rate" className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                  {contractRates.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">No contract rates configured.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "reports" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportCards.map((r, i) => (
              <button
                key={i}
                onClick={() => generateReport(r.title)}
                title={`Generate ${r.title}`}
                className="text-left p-5 rounded-2xl border border-border bg-card hover:border-brand/40 transition-colors cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand/15 flex items-center justify-center text-brand mb-3 group-hover:bg-brand/25 transition-colors">
                  {r.icon}
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-1">{r.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{r.desc}</p>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-brand">
                  <Download className="w-3.5 h-3.5" /> Generate Report
                </div>
                {reportRuns[r.title] && (
                  <p className="mt-2 text-[10px] text-muted-foreground">Last generated: {reportRuns[r.title]}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Invoice create / edit */}
      <Modal
        open={invoiceModalOpen}
        onOpenChange={(o) => { setInvoiceModalOpen(o); if (!o) { setEditInvoice(null); setInvoiceForm(emptyInvoiceForm); setInvoiceErrors({}) } }}
        title={editInvoice ? "Edit Invoice" : "New Invoice"}
        description={editInvoice ? `Update ${editInvoice.id}` : "Raise a new client invoice"}
        footer={<ModalActions onCancel={() => setInvoiceModalOpen(false)} onSubmit={submitInvoice} submitLabel={editInvoice ? "Save Invoice" : "Create Invoice"} />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Client" required error={invoiceErrors.client}>
            <Select value={invoiceForm.client} invalid={!!invoiceErrors.client} onChange={(e) => setInvoiceForm({ ...invoiceForm, client: e.target.value })} options={CLIENTS} placeholder="Select Client" />
          </Field>
          <Field label="Billing Period" required error={invoiceErrors.period}>
            <TextInput value={invoiceForm.period} invalid={!!invoiceErrors.period} onChange={(e) => setInvoiceForm({ ...invoiceForm, period: e.target.value })} placeholder="e.g. Jul 1–15, 2026" />
          </Field>
          <Field label="Amount (₹)" required error={invoiceErrors.amount}>
            <TextInput value={invoiceForm.amount} invalid={!!invoiceErrors.amount} onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })} placeholder="e.g. 124500" inputMode="numeric" />
          </Field>
          <Field label="Due Date" required error={invoiceErrors.due} hint="YYYY-MM-DD">
            <TextInput value={invoiceForm.due} invalid={!!invoiceErrors.due} onChange={(e) => setInvoiceForm({ ...invoiceForm, due: e.target.value })} placeholder="2026-07-30" />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Services" required error={invoiceErrors.services}>
            <div className="flex flex-wrap gap-2">
              {SERVICES.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleService(s)}
                  title={`Toggle ${s}`}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                    invoiceForm.services.includes(s)
                      ? "bg-brand text-white border-brand"
                      : "bg-card border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>
        </div>
      </Modal>

      {/* Contract rate create / edit */}
      <Modal
        open={rateModalOpen}
        onOpenChange={(o) => { setRateModalOpen(o); if (!o) { setEditRateIndex(null); setRateForm(emptyRateForm); setRateErrors({}) } }}
        title={editRateIndex !== null ? "Edit Contract Rate" : "Add Contract Rate"}
        description="Rates drive automatic invoice generation"
        footer={
          <>
            {editRateIndex !== null && (
              <button
                onClick={() => { const idx = editRateIndex; setRateModalOpen(false); setDeleteRateIndex(idx) }}
                className="mr-auto rounded-lg border border-danger/30 px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
              >
                Delete
              </button>
            )}
            <ModalActions onCancel={() => setRateModalOpen(false)} onSubmit={submitRate} submitLabel={editRateIndex !== null ? "Save Rate" : "Add Rate"} />
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Client" required error={rateErrors.client}>
            <Select value={rateForm.client} invalid={!!rateErrors.client} onChange={(e) => setRateForm({ ...rateForm, client: e.target.value })} options={CLIENTS} placeholder="Select Client" />
          </Field>
          <Field label="Service" required error={rateErrors.service}>
            <TextInput value={rateForm.service} invalid={!!rateErrors.service} onChange={(e) => setRateForm({ ...rateForm, service: e.target.value })} placeholder="e.g. Inward Handling" />
          </Field>
          <Field label="Rate (₹)" required error={rateErrors.rate}>
            <TextInput value={rateForm.rate} invalid={!!rateErrors.rate} onChange={(e) => setRateForm({ ...rateForm, rate: e.target.value })} placeholder="e.g. 850" inputMode="numeric" />
          </Field>
          <Field label="Unit of Measure" required error={rateErrors.uom}>
            <Select value={rateForm.uom} invalid={!!rateErrors.uom} onChange={(e) => setRateForm({ ...rateForm, uom: e.target.value })} options={UOMS} placeholder="Select UOM" />
          </Field>
        </div>
      </Modal>

      {/* Invoice detail */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Invoice detail"
        footer={
          <>
            <button
              onClick={() => detail && setDeleteInvoice(detail)}
              className="rounded-lg border border-danger/30 px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
            >
              Delete
            </button>
            {detail && detail.status !== "Paid" && (
              <button onClick={() => markPaid(detail)} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
                Mark as Paid
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
            <DetailRow label="Invoice ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Client" value={detail.client} />
            <DetailRow label="Billing Period" value={detail.period} />
            <DetailRow label="Services" value={detail.services.join(", ")} />
            <DetailRow label="Amount" value={<span className="font-bold">{detail.amount}</span>} />
            <DetailRow label="Raised On" value={detail.raised} />
            <DetailRow label="Due Date" value={detail.due} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusConfig[detail.status]?.bg, statusConfig[detail.status]?.color)}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Invoice documents — GST tax invoice, e-way bill, packing list */}
      <Modal
        open={!!docsTarget}
        onOpenChange={(o) => !o && setDocsTarget(null)}
        title={`Documents — ${docsTarget?.id ?? ""}`}
        description={docsTarget ? `${docsTarget.client} · ${docsTarget.period}` : ""}
        size="lg"
        footer={
          <button onClick={() => setDocsTarget(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {docsTarget && (
          <div className="space-y-3">
            {[
              { name: "GST Tax Invoice", desc: `Invoice ${docsTarget.id} with HSN/SAC breakdown and GST split for ${docsTarget.client}.` },
              { name: "E-Way Bill", desc: `Transport document for goods movement covering ${docsTarget.services.join(", ")}.` },
              { name: "Packing List", desc: `Itemised packing list for the ${docsTarget.period} billing cycle.` },
            ].map(doc => (
              <div key={doc.name} className="flex items-center justify-between gap-3 p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{doc.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{doc.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => downloadDoc(docsTarget, doc.name)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand/10 text-brand text-xs font-semibold hover:bg-brand/20 transition-colors border border-brand/30 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteInvoice}
        onOpenChange={(o) => !o && setDeleteInvoice(null)}
        title="Delete this invoice?"
        message={`${deleteInvoice?.id} for ${deleteInvoice?.client} (${deleteInvoice?.amount}) will be permanently removed.`}
        confirmLabel="Delete Invoice"
        onConfirm={() => deleteInvoice && removeInvoice(deleteInvoice)}
      />

      <ConfirmDialog
        open={deleteRateIndex !== null}
        onOpenChange={(o) => !o && setDeleteRateIndex(null)}
        title="Delete this contract rate?"
        message={deleteRateIndex !== null ? `${contractRates[deleteRateIndex]?.client} — ${contractRates[deleteRateIndex]?.service} will be removed from the rate card.` : ""}
        confirmLabel="Delete Rate"
        onConfirm={() => deleteRateIndex !== null && removeRate(deleteRateIndex)}
      />
    </div>
  )
}
